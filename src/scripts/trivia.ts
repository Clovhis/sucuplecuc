import { triviaGrade, TRIVIA_ROUNDS, TRIVIA_SECONDS } from '../lib/trivia';
import type { TriviaMovie, TriviaPerson } from '../lib/trivia';
import { triviaSupabase as client } from '../lib/supabaseClient';
import { isTriviaPlayer } from '../lib/trivia-player';
import type { TriviaPlayer } from '../lib/trivia-player';
import { isTriviaNicknameAllowed } from '../lib/trivia-nickname';

interface Question { id: string; kind: string; prompt: string; people: TriviaPerson[]; options: TriviaMovie[]; answer?: TriviaMovie; fact?: string }
interface Answer { questionId: string; prompt: string; fact: string; movie: TriviaMovie; choice: TriviaMovie | null; correct: boolean; remainingMs: number; points: number }
interface Game { id: string; player: TriviaPlayer; round: number; phase: 'question' | 'review' | 'finished' | 'abandoned'; deadlineMs: number; serverNowMs: number; question: Question | null; answers: Answer[]; hintsUsed: number; discarded: string | null; score: number; bonus: number }
const root = document.querySelector<HTMLElement>('[data-trivia]');
if (root) setupTrivia(root);

function setupTrivia(root: HTMLElement) {
	const node = <T extends HTMLElement = HTMLElement>(key: string) => root.querySelector<T>(`[data-${key}]`)!;
	const base = root.dataset.base ?? '/';
	const escape = (value: string) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
	const format = (value: number) => new Intl.NumberFormat('es-AR').format(value);
	const countryName = (value: string) => new Intl.DisplayNames(['es'], { type: 'region' }).of(value) ?? value;
	const label = (profile: TriviaPlayer) => `${profile.name} · ${countryName(profile.country)} · ${profile.age} años`;
	const url = (slug: string) => `${base}peliculas/${encodeURIComponent(slug)}/`;
	const show = (view: string) => { for (const name of ['landing','player','game','summary']) node(name).hidden = name !== view; };
	const focus = (key: string) => node(key).focus({ preventScroll: true });
	const scroll = () => root.scrollIntoView({ block: 'start', behavior: 'instant' });
	let player: TriviaPlayer | null = null;
	let game: Game | null = null;
	let busy = false;
	let identityRequest: Promise<void> | null = null;
	let timer: ReturnType<typeof setInterval> | undefined;
	let deadline = 0;
	let availabilityTimer: ReturnType<typeof setTimeout> | undefined;
	let availabilityRevision = 0;
	let available = false;
	let checkingName = false;
	let nameError = '';
	let rankingBusy = false;
	let rankingLoaded = false;
	const nickname = node<HTMLInputElement>('player-name');
	const stopTimer = () => { if (timer) clearInterval(timer); timer = undefined; };

	async function rpc<T>(name: string, parameters: Record<string, unknown> = {}): Promise<T> {
		if (!client) throw new Error('service unavailable');
		const { data, error } = await client.rpc(name, parameters).abortSignal(AbortSignal.timeout(12000));
		if (error) throw error;
		return data as T;
	}
	async function ensureIdentity() {
		identityRequest ??= (async () => {
			if (!client) throw new Error('service unavailable');
			localStorage.setItem('cineposta-trivia-storage-check', '1');
			localStorage.removeItem('cineposta-trivia-storage-check');
			const { data, error } = await client.auth.getSession();
			if (error) throw error;
			if (!data.session) { const response = await client.auth.signInAnonymously(); if (response.error) throw response.error; }
		})().catch((error) => { identityRequest = null; throw error; });
		return identityRequest;
	}
	function errorMessage(error: unknown) {
		const message = typeof error === 'object' && error && 'message' in error ? String(error.message) : '';
		if (message.includes('nickname unavailable')) return 'Ese nickname ya tiene dueño. Elegí otro.';
		if (message.includes('nickname not allowed')) return 'Ese nickname no está permitido. Elegí otro sin insultos ni referencias de odio.';
		if (message.includes('nickname belongs')) return 'Tu jugador ya tiene un nickname reservado. Conservá ese apodo.';
		if (message.includes('too many games')) return 'Ya arrancaste varias partidas seguidas. Esperá un minuto para otra ronda.';
		return 'No pudimos conectar con tu jugador. Revisá la conexión y probá de nuevo.';
	}
	function updateNameValidation() {
		const blocked = !isTriviaNicknameAllowed(nickname.value);
		const message = blocked ? 'Ese nickname no está permitido. Elegí otro sin insultos ni referencias de odio.' : nameError;
		nickname.setCustomValidity(message); nickname.setAttribute('aria-invalid', String(Boolean(message)));
		node('nickname-error').textContent = message; node('nickname-error').hidden = !message;
		node<HTMLButtonElement>('player-submit').disabled = busy || blocked || checkingName || !available;
		return !message && available;
	}
	function checkName() {
		const revision = ++availabilityRevision;
		if (availabilityTimer) clearTimeout(availabilityTimer);
		nameError = ''; available = false; checkingName = false;
		const name = nickname.value.trim().normalize('NFC');
		if (!isTriviaNicknameAllowed(name) || name.length < 2 || name.length > 24) { updateNameValidation(); return; }
		if (player && nickname.readOnly && name === player.name) { available = true; updateNameValidation(); return; }
		checkingName = true; updateNameValidation();
		availabilityTimer = setTimeout(() => { void (async () => {
			try {
				await ensureIdentity();
				const result = await rpc<boolean>('trivia_nickname_available', { p_name: name });
				if (revision !== availabilityRevision) return;
				available = result; nameError = result ? '' : 'Ese nickname ya tiene dueño o no está permitido. Elegí otro.';
			} catch (error) { if (revision === availabilityRevision) nameError = errorMessage(error); }
			finally { if (revision === availabilityRevision) { checkingName = false; updateNameValidation(); } }
		})(); }, 300);
	}
	nickname.addEventListener('input', checkName);
	nickname.addEventListener('blur', () => { if (!available && !checkingName) checkName(); });

	async function openPlayer() {
		if (busy) return;
		busy = true; show('player'); scroll(); focus('player-title'); updateNameValidation();
		node('player-status').textContent = 'Buscando tu jugador…';
		try {
			await ensureIdentity(); player = await rpc<TriviaPlayer | null>('get_trivia_player'); nickname.readOnly = Boolean(player);
			if (player) { nickname.value = player.name; node<HTMLSelectElement>('player-country').value = player.country; node<HTMLInputElement>('player-age').value = String(player.age); }
			node('player-status').textContent = player ? 'Tu nickname está reservado para vos.' : 'Elegí tu nickname. Va a quedar reservado para este jugador.';
		} catch (error) { node('player-status').textContent = errorMessage(error); }
		finally { busy = false; checkName(); }
	}
	node('start').addEventListener('click', () => void openPlayer());
	node('replay').addEventListener('click', () => void openPlayer());
	node('player-back').addEventListener('click', () => { if (!busy) { show('landing'); focus('start'); } });
	node('player-form').addEventListener('submit', (event) => {
		event.preventDefault();
		if (busy || !updateNameValidation() || !node<HTMLFormElement>('player-form').reportValidity()) return;
		const profile = { id: player?.id ?? crypto.randomUUID(), name: nickname.value.trim().normalize('NFC'), country: node<HTMLSelectElement>('player-country').value, age: Number(node<HTMLInputElement>('player-age').value) };
		if (!isTriviaPlayer(profile)) { node('player-status').textContent = 'Completá tu nickname, nacionalidad y una edad entera entre 1 y 120.'; return; }
		busy = true; updateNameValidation(); node('player-status').textContent = 'Reservando tu jugador y preparando las preguntas…';
		void (async () => {
			try {
				await ensureIdentity(); player = await rpc<TriviaPlayer>('claim_trivia_player', { p_name: profile.name, p_country: profile.country, p_age: profile.age });
				const started = performance.now(); applyGame(await rpc<Game>('start_trivia_game'), started); scroll();
			} catch (error) { node('player-status').textContent = errorMessage(error); }
			finally { busy = false; updateNameValidation(); if (game && !node('game').hidden) updateButtons(); }
		})();
	});

	function applyGame(next: Game, started = performance.now()) {
		const changed = game?.round !== next.round || game?.id !== next.id;
		game = next; player = next.player;
		deadline = performance.now() + Math.max(0, next.deadlineMs - next.serverNowMs - (performance.now() - started) / 2);
		node('game-connection').hidden = true;
		if (next.phase === 'finished') { showSummary(); return; }
		if (next.phase === 'abandoned') { show('landing'); return; }
		renderQuestion(changed);
	}
	function updateButtons() {
		if (!game || !game.question) return;
		for (const button of node('choices').querySelectorAll<HTMLButtonElement>('button')) button.disabled = busy || game.phase !== 'question' || button.dataset.choice === game.discarded;
		node<HTMLButtonElement>('use-hint').disabled = busy || game.phase !== 'question' || game.hintsUsed >= 3 || Boolean(game.discarded);
		node<HTMLButtonElement>('next').disabled = busy;
	}
	function renderQuestion(changed: boolean) {
		stopTimer(); show('game'); const current = game!; const question = current.question!;
		node('current-player').textContent = label(current.player); node('round').textContent = `Pregunta ${String(current.round + 1).padStart(2,'0')} / ${TRIVIA_ROUNDS}`;
		node('kind').textContent = question.kind; node('question').textContent = question.prompt; node('live-score').textContent = `${format(current.score)} puntos`;
		node('progress').innerHTML = Array.from({ length: TRIVIA_ROUNDS }, (_,i) => { const result = current.answers[i]; const status = result ? result.correct ? 'Correcta' : result.choice ? 'Incorrecta' : 'Sin tiempo' : i === current.round ? 'Actual' : 'Pendiente'; return `<li class="${result ? result.correct ? 'is-correct' : 'is-wrong' : i === current.round ? 'is-current' : ''}" aria-label="Pregunta ${i+1}: ${status}"></li>`; }).join('');
		node('clue-people').hidden = !question.people?.length;
		node('clue-people').innerHTML = (question.people ?? []).map((person) => `<div class="trivia-clue-person"><div class="trivia-clue-portrait"><span aria-hidden="true">${escape(person.name.split(/\s+/).slice(0,2).map((part)=>part[0]).join('').toUpperCase())}</span>${person.image ? `<img src="${escape(person.image)}" alt="" width="72" height="72" decoding="async" />` : ''}</div><div><span class="trivia-clue-role">${escape(person.role)}</span><strong>${escape(person.name)}</strong></div></div>`).join('');
		node('clue-people').querySelectorAll<HTMLImageElement>('img').forEach((image)=>{ image.addEventListener('error',()=>{image.hidden=true;},{once:true}); if(image.complete&&!image.naturalWidth) image.hidden=true; });
		const result = current.answers[current.round];
		node('choices').innerHTML = question.options.map((movie,i)=>{
			const correct = result?.movie.slug === movie.slug; const wrong = result?.choice?.slug === movie.slug && !result.correct; const discarded = current.discarded === movie.slug;
			return `<button type="button" class="trivia-choice ${correct?'is-correct':wrong?'is-wrong':discarded?'is-discarded':''}" data-choice="${escape(movie.slug)}" ${correct||wrong||discarded?`aria-label="${escape(movie.title)}: ${correct?'respuesta correcta':wrong?'tu respuesta, incorrecta':'opción descartada'}"`:''}><span aria-hidden="true">0${i+1}</span><span>${escape(movie.title)}${result ? ` <small>(${movie.year})</small>` : ''}</span><span aria-hidden="true">${correct?'✓':wrong?'✕':discarded?'−':'↗'}</span></button>`;
		}).join('');
		node('hints-count').textContent = `${3-current.hintsUsed}/3`;
		node('hint-status').textContent = current.discarded ? `Descartamos una opción. Te quedan ${3-current.hintsUsed} pistas.` : current.hintsUsed===3 ? 'Usaste las tres pistas. ¡Ahora va por tu cuenta!' : 'Descartá una opción incorrecta. Cada pista sin usar suma 250 puntos al final.';
		node('feedback').classList.toggle('is-wrong', Boolean(result && !result.correct));
		node('feedback').innerHTML = result ? `<strong>${result.correct?`¡Esa es! +${format(result.points)} puntos`:result.choice?'Esta se escapó.':'Se terminó el tiempo.'}</strong><small>${result.correct?`1000 por el acierto + ${result.points-1000} de rapidez.`:`La respuesta era ${escape(result.movie.title)}.`}</small>` : '';
		node('reveal').innerHTML = result ? `<article class="trivia-movie-reveal"><a href="${url(result.movie.slug)}" target="_blank" rel="noopener" aria-label="Ver ficha de ${escape(result.movie.title)} (otra pestaña)"><img src="${escape(result.movie.poster)}" alt="Póster de ${escape(result.movie.title)}" width="180" height="270" /></a><div><span class="trivia-kicker">${result.movie.year} / La respuesta</span><h3>${escape(result.movie.title)}</h3><p>${escape(result.fact)}</p><a href="${url(result.movie.slug)}" target="_blank" rel="noopener">Ver ficha ↗<span class="u-visually-hidden"> (otra pestaña)</span></a></div></article>` : '<div class="trivia-reveal-empty"><span aria-hidden="true">?</span><p class="trivia-kicker">Detrás de la respuesta</p><h3>Una peli para tu lista.</h3><p>Contestá y acá aparece su ficha. Capaz ya tenés plan para esta noche.</p></div>';
		node('next').hidden = current.phase !== 'review'; updateButtons();
		if (current.phase === 'question') { tick(); timer = setInterval(tick,100); if(changed) focus('question'); }
		else { node('clock').classList.remove('is-urgent'); node('clock').setAttribute('aria-label','Reloj detenido'); node('seconds').textContent=String(Math.ceil(result.remainingMs/1000)); node('clock').style.setProperty('--time',String(result.remainingMs/20000)); focus('next'); }
	}
	function tick() {
		if (!game || game.phase !== 'question') return;
		const left=Math.max(0,deadline-performance.now()); node('seconds').textContent=String(Math.ceil(left/1000)); node('clock').style.setProperty('--time',String(left/(TRIVIA_SECONDS*1000)));
		node('clock').classList.toggle('is-urgent',left<=5000); node('clock').setAttribute('aria-label',`${Math.ceil(left/1000)} segundos restantes`);
		if (!left && !busy) void action('answer_trivia_question',{p_choice:null});
	}
	async function action(name: string, parameters: Record<string,unknown> = {}) {
		if (busy || !game) return; busy=true; updateButtons(); const started=performance.now();
		try { applyGame(await rpc<Game>(name,{p_session_id:game.id,p_round:game.round,...parameters}),started); }
		catch(error) {
			stopTimer();
			if (typeof error==='object' && error && 'message' in error && String(error.message).includes('question still active')) {
				try { const retryStarted=performance.now(); applyGame(await rpc<Game>('get_trivia_game',{p_session_id:game.id}),retryStarted); return; } catch { /* Show reconnection controls below. */ }
			}
			node('game-error').textContent=errorMessage(error); node('game-connection').hidden=false;
		}
		finally { busy=false; updateButtons(); }
	}
	node('choices').addEventListener('click',(event)=>{const button=(event.target as HTMLElement).closest<HTMLButtonElement>('[data-choice]');if(button&&!button.disabled) void action('answer_trivia_question',{p_choice:button.dataset.choice});});
	node('use-hint').addEventListener('click',()=>void action('use_trivia_hint'));
	node('next').addEventListener('click',()=>void action('next_trivia_question'));
	document.addEventListener('keydown',(event)=>{if(event.repeat||event.altKey||event.ctrlKey||event.metaKey||node('game').hidden||!/^[123]$/.test(event.key)||(event.target as HTMLElement).closest('input,textarea,select,[contenteditable="true"]'))return;const button=node('choices').querySelectorAll<HTMLButtonElement>('button')[Number(event.key)-1];if(button&&!button.disabled){event.preventDefault();button.click();}});
	async function reconnect() {
		if(busy)return;busy=true;stopTimer();
		try{await ensureIdentity();const started=performance.now();const restored=await rpc<Game|null>('get_trivia_game',game?{p_session_id:game.id}:{});if(restored)applyGame(restored,started);}
		catch(error){node('game-error').textContent=errorMessage(error);node('game-connection').hidden=false;}
		finally{busy=false;updateButtons();}
	}
	node('retry-game').addEventListener('click',()=>void reconnect()); node('save-score').addEventListener('click',()=>void reconnect());
	document.addEventListener('visibilitychange',()=>{if(!document.hidden&&game&&!node('game').hidden)void reconnect();});
	window.addEventListener('pagehide',stopTimer); window.addEventListener('pageshow',(event)=>{if(event.persisted&&game)void reconnect();});
	function showSummary() {
		stopTimer();show('summary');const current=game!;const correct=current.answers.filter(a=>a.correct).length;const timeout=current.answers.filter(a=>!a.choice).length;
		node('result-title').textContent=correct===20?'Pasá a buscar tu Oscar.':correct>=16?'Tenés mucho cine encima.':correct>=10?'Hay cine en esa cabeza.':correct>=5?'La próxima sale mejor.':'Viniste a descubrir películas.';
		node('result-copy').textContent=`${correct} aciertos en 20 preguntas. ${correct>=16?'Se nota que las horas frente a la pantalla rindieron.':'Siempre queda una peli más por ver.'}`;
		node('final-points').textContent=format(current.score);node('final-grade').textContent=`Tu nota: ${triviaGrade(current.score)}/10`;
		node('result-stats').innerHTML=`<span><strong>${correct}/20</strong> aciertos</span><span><strong>${20-correct-timeout}</strong> incorrectas</span><span><strong>${timeout}</strong> sin tiempo</span><span><strong>+${format(current.score-current.bonus-correct*1000)}</strong> por rapidez</span><span><strong>+${current.bonus}</strong> por ${3-current.hintsUsed} pistas sin usar</span>`;
		node('result-player').textContent=label(current.player);node('save-status').textContent='Resultado verificado y guardado. El ranking conserva tu mejor partida.';node('save-score').hidden=true;
		node('results').innerHTML=current.answers.map((result,i)=>`<article class="trivia-result ${result.correct?'':'is-wrong'}"><a href="${url(result.movie.slug)}" target="_blank" rel="noopener" aria-label="Ver ${escape(result.movie.title)} (otra pestaña)"><img src="${escape(result.movie.poster)}" alt="" width="68" height="102" loading="lazy" /></a><div><p class="trivia-result-status">${String(i+1).padStart(2,'0')} / ${result.correct?'✓ Correcta':result.choice?'✕ Incorrecta':'◷ Sin tiempo'} · ${format(result.points)} pts</p><h4><a href="${url(result.movie.slug)}" target="_blank" rel="noopener">${escape(result.movie.title)} (${result.movie.year}) ↗</a></h4><p>${escape(result.fact)}</p><details><summary>Revisar pregunta</summary><p>${escape(result.prompt)}</p><p>${result.choice?`Elegiste: ${escape(result.choice.title)}.`:'No llegaste a responder.'}</p></details></div></article>`).join('');
		focus('result-title');scroll();void refreshRanking();
	}
	async function refreshRanking(){
		if(rankingBusy)return;rankingBusy=true;node('ranking-status').textContent='Cargando puntajes…';
		try{const entries=await rpc<{player_name:string;country_code:string;score:number;correct_count:number}[]>('list_trivia_high_scores',{p_limit:10});node('ranking-list').innerHTML=entries.map(entry=>`<li><span>${escape(entry.player_name)}<small>${escape(countryName(entry.country_code))} · ${entry.correct_count}/20 aciertos</small></span><strong>${format(entry.score)}<small>${triviaGrade(entry.score)}/10</small></strong></li>`).join('');node('ranking-status').textContent=entries.length?'Ranking actualizado.':'Todavía no hay puntajes. Podés ser el primero.';rankingLoaded=true;}
		catch{node('ranking-status').textContent='El ranking no está disponible ahora. Reintentá en un rato.';}finally{rankingBusy=false;}
	}
	node<HTMLDetailsElement>('ranking').addEventListener('toggle',()=>{if(node<HTMLDetailsElement>('ranking').open&&!rankingLoaded)void refreshRanking();});
	node('refresh-ranking').addEventListener('click',()=>void refreshRanking());
	// Only authenticated server state can restore a game; browser answers/scores are never trusted.
	if(client) void client.auth.getSession().then(async({data})=>{if(data.session)await reconnect();}).catch(()=>{node('start-status').textContent='Podés intentar recuperar tu jugador al empezar.';});
}
