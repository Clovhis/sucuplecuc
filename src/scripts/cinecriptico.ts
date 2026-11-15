import { triviaSupabase as client } from '../lib/supabaseClient';
import type { TriviaPlayer } from '../lib/trivia-player';
import { isTriviaNicknameAllowed } from '../lib/trivia-nickname';
interface Game { id:string; phase:'playing'|'solved'|'lost'|'given_up'; revision:number; mistakes:number; hintsUsed:number; score:number; guesses:string[]; hints:string[] }
interface State { day:string; serverNow:string; nextAt:string; available:boolean; clue?:string; letters?:number; difficulty?:number; game:Game|null; notice?:string; reveal?:{answer:string; explanation:string; reference:string; referenceUrl:string; movieSlug:string|null} }
interface Rank { rank:number; name:string; score:number }
interface Dashboard { day:string; solvedToday:number; daily:Rank[]; historical:Rank[]; stats:{played:number;solved:number;totalScore:number;bestScore:number;averageHints:number;streak:number;bestStreak:number} }
interface Pending { p_action:string; p_request_id:string; p_revision:number; p_guess:string|null; p_day:string }
const root=document.querySelector<HTMLElement>('[data-cryptic]');
if(root && client) setup(root);
function setup(root:HTMLElement) {
 const node=<T extends HTMLElement=HTMLElement>(key:string)=>root.querySelector<T>(`[data-${key}]`)!;
 const word=node('answer-form').querySelector<HTMLInputElement>('input')!;
 const profile=node<HTMLFormElement>('profile');
 let state:State|null=null, player:TriviaPlayer|null=null, dashboard:Dashboard|null=null;
 let busy=false, refreshing=false, ready=false, initializing=false, acceptingIdentity=false, lostIdentity=false;
 let identityRevision=0, deadline=Infinity, refreshAfter=0, lastRefresh=-Infinity;
 let refreshCompletion:Promise<void>=Promise.resolve();
 let period:'daily'|'historical'='daily', uid='', pending:Pending|null=null;
 const format=(n:number)=>new Intl.NumberFormat('es-AR').format(n);
 const normalized=(s:string)=>s.trim().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
 function message(text:string,error=false) { node('status').textContent=text;node('status').classList.toggle('is-error',error); }
 const stale=(error:unknown)=>error instanceof Error&&error.message==='session changed';
 function authError(error:unknown) {
  if(!error||typeof error!=='object')return false;
  const e=error as {status?:number;code?:string;message?:string};
  return e.status===401||/^PGRST30[123]$/.test(e.code??'')||['refresh_token_not_found','refresh_token_already_used','session_not_found','user_not_found','invalid_jwt'].includes(e.code??'')||/authentication required|jwt expired|invalid jwt/i.test(e.message??'');
 }
 function forgetVisiblePlayer() {
  state=null;player=null;dashboard=null;pending=null;deadline=Infinity;word.value='';profile.reset();
  for(const name of ['answer-form','profile','reveal','confirm'])node(name).hidden=true;
  node('start').hidden=false;node('identity').textContent='';node('progress').textContent='';
  for(const name of ['hints','guesses','stats','ranking-list'])node(name).replaceChildren();
  for(const name of ['explanation','reference','result'])node(name).textContent='';
  for(const name of ['movie','whatsapp','x'])node(name).removeAttribute('href');
  node('solved').textContent='—';node('stats-empty').hidden=false;
  node('dashboard-status').hidden=true;
  node('orb-label').textContent='¿Qué ves?';node('orb-note').textContent='Tu palabra toma forma acá';cells('');
  renderClue();
 }
 function loseSession() {
  identityRevision++;ready=false;lostIdentity=true;forgetVisiblePlayer();busy=false;refreshing=false;
  node('reconnect').hidden=false;node('new-session').hidden=false;controls();
  message('Se perdió o cambió tu sesión. Tus resultados siguen guardados. Reconectá para recuperar el acceso; si borraste los datos del navegador, el nick por sí solo no permite recuperar ese jugador.',true);
 }
 async function rpc<T>(name:string,args:Record<string,unknown>={}):Promise<T> {
  const revision=identityRevision;
  // UX guard for storage cleared without an auth event. The database still authorizes the JWT.
  const identity=await client!.auth.getSession();
  if(revision!==identityRevision)throw new Error('session changed');
  if(identity.error){if(authError(identity.error)){loseSession();throw new Error('session changed');}throw identity.error;}
  if(!identity.data.session||identity.data.session.user.id!==uid){loseSession();throw new Error('session changed');}
  const {data,error}=await client!.rpc(name,args).abortSignal(AbortSignal.timeout(15000));
  if(revision!==identityRevision)throw new Error('session changed');
  if(error&&authError(error)){loseSession();throw new Error('session changed');}
  if(error) throw error;return data as T;
 }
 function controls() {
  for(const b of root.querySelectorAll<HTMLButtonElement>('button')) b.disabled=busy||refreshing||!ready;
  node<HTMLButtonElement>('reconnect').disabled=busy;
  node<HTMLButtonElement>('new-session').disabled=busy||initializing;
  node<HTMLButtonElement>('start').disabled=busy||refreshing||!ready||!state?.available;
  node<HTMLButtonElement>('hint').disabled=busy||refreshing||!ready||!state?.game||state.game.hintsUsed>=3;
  word.disabled=busy||!ready;
 }
 function cells(value:string) {
  const letters=Array.from(normalized(value));
  node('cells').replaceChildren(...Array.from({length:state?.game?(state.letters??3):3},(_,i)=>{const s=document.createElement('span');s.textContent=letters[i]??'·';return s;}));
 }
 function renderClue() {
  const unlocked=Boolean(state?.available&&state.game);
  node('clue').closest('.cryptic-clue')?.classList.toggle('is-locked',!unlocked);
  node('clue-label').textContent=unlocked?'La pista de hoy':'El misterio de hoy';
  node('clue').textContent=unlocked?(state?.clue??'Recuperando la pista de tu partida…'):'La pista espera del otro lado.';
  node('length').textContent=unlocked?`${state?.letters} letras · dificultad ${state?.difficulty}/10 · una sola palabra`:state?.available===false?'Volvé más tarde. Tu historial está a salvo.':player?'Entrá al ritual para revelar el acertijo y comenzar tu partida.':'Elegí tu nick y entrá al ritual para revelar el acertijo.';
 }
 function apply(next:State,sent=performance.now()) {
  const previous=state, dayChanged=Boolean(previous&&previous.day!==next.day);
  state=next;
  deadline=performance.now()+Math.max(0,Date.parse(next.nextAt)-Date.parse(next.serverNow)-(performance.now()-sent)/2);
  node('date').textContent=new Intl.DateTimeFormat('es-AR',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(`${next.day}T12:00:00Z`));
  renderClue();
  const g=next.game, ended=Boolean(g&&g.phase!=='playing');
  node('start').hidden=Boolean(g)||!next.available;
  node('answer-form').hidden=!g||ended;
  node('reveal').hidden=!next.reveal;
  node('identity').textContent=player?`Jugás como ${player.name} en CineCríptico`:'Elegí tu nick para CineCríptico. Podés reutilizar el de otro juego.';
  node('orb-label').textContent=ended?'La palabra revelada':'¿Qué ves?';
  node('orb-note').textContent=ended?(g?.phase==='solved'?`${format(g.score)} puntos · misterio resuelto`:'El misterio también enseña'):'Tu palabra toma forma acá';
  node('progress').textContent=g?`${6-g.mistakes}/6 intentos disponibles · ${g.hintsUsed}/3 ayudas usadas${g.phase==='playing'?` · podés sumar ${Math.max(100,1000-180*g.hintsUsed-100*g.mistakes)} puntos`:''}`:'';
  node('hints').replaceChildren(...(g?.hints??[]).map(h=>{const li=document.createElement('li');li.textContent=h;return li;}));
  node('guesses').replaceChildren(...(g?.guesses??[]).map(h=>{const s=document.createElement('span');s.textContent=h;return s;}));
  if(dayChanged) { word.value='';profile.hidden=true;node('confirm').hidden=true;message('Ya es un nuevo día en Argentina. Hay otro misterio para vos.'); }
  if(previous?.game && g && previous.day===next.day && g.mistakes>previous.game.mistakes) {
   word.value='';message(g.phase==='lost'?'Se agotaron los intentos. Mirá cómo se construía la palabra.':'Esa palabra no abrió el misterio. Todavía podés resolverlo.');animate('is-wrong');
  }
  if(next.reveal) {
   cells(next.reveal.answer);
   node('result').textContent=g?.phase==='solved'?`Lo descifraste / ${format(g.score)} puntos`:g?.phase==='given_up'?'Ritual cerrado / 0 puntos':'Seis intentos / 0 puntos';
   node('explanation').textContent=next.reveal.explanation;
   node('reference').textContent=next.reveal.reference;
   const movie=node<HTMLAnchorElement>('movie');movie.hidden=!next.reveal.movieSlug;
   if(next.reveal.movieSlug) movie.href=`${root.dataset.base}peliculas/${encodeURIComponent(next.reveal.movieSlug)}/`;
   if(g?.phase==='solved'&&previous?.game?.phase==='playing') { animate('is-solved');message('¡Lo descifraste! Tu resultado ya está guardado.'); }
   const text=shareText();
   node<HTMLAnchorElement>('whatsapp').href=`https://wa.me/?text=${encodeURIComponent(text)}`;
   node<HTMLAnchorElement>('x').href=`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  } else cells(word.value);
  if(next.notice) message(next.notice);
  if(!next.available) message('No hay un desafío cargado para esta fecha. No se inició ni consumió una partida.');
  if(pending && (pending.p_day!==next.day || (g && (g.revision>pending.p_revision || pending.p_action==='start')))) clearPending();
  controls();
 }
 function animate(name:string) { const orb=node('orb');orb.classList.remove('is-wrong','is-solved');void orb.offsetWidth;orb.classList.add(name); }
 word.addEventListener('input',()=>{word.setCustomValidity('');cells(word.value);});
 function clearPending() { pending=null;try{localStorage.removeItem(`cineposta-cryptic-pending:${uid}`);}catch{/* Server remains authoritative. */} }
 async function mutate(action:string,guess:string|null=null) {
  if(busy||!state||!ready)return;
  if(refreshing) {
   const revision=identityRevision,day=state.day,completion=refreshCompletion;
   busy=true;controls();message('Actualizando la partida antes de enviar…');
   await completion;if(revision!==identityRevision)return;busy=false;controls();
   if(!ready||state?.day!==day||state?.game?.phase!=='playing')return;
  }
  if(pending) {message('Primero recuperá la jugada anterior para confirmar qué recibió el servidor.',true);node('reconnect').hidden=false;return;}
  pending={p_action:action,p_request_id:crypto.randomUUID(),p_revision:state.game?.revision??0,p_guess:guess,p_day:state.day};
  try{localStorage.setItem(`cineposta-cryptic-pending:${uid}`,JSON.stringify(pending));}catch{/* Reconcile against server on reload. */}
  await sendPending();
 }
 async function sendPending() {
  if(!pending||busy||!ready)return;busy=true;controls();const sent=performance.now(),revision=identityRevision;
  message('Confirmando tu jugada…');
  try {
   const next=await rpc<State>('cinecriptico_play',{...pending});if(revision!==identityRevision)return;
   clearPending();message('');apply(next,sent);node('reconnect').hidden=true;
   if(next.game?.phase==='playing')word.focus({preventScroll:true});
   await loadDashboard();
  } catch(e) {
   if(stale(e)||revision!==identityRevision)return;
   const msg=errorText(e);
   if(msg.includes('invalid word')||msg.includes('request conflict')||msg.includes('player required'))clearPending();
   message(msg.includes('invalid word')?'Ingresá una sola palabra con la cantidad de letras indicada.':'No pudimos confirmar la jugada. Reconectá: recuperamos el estado sin duplicar intentos.',true);node('reconnect').hidden=false;
  } finally {if(revision===identityRevision){busy=false;controls();}}
 }
 function errorText(e:unknown) {return e&&typeof e==='object'&&'message'in e?String(e.message):'';}
 async function loadDashboard() {
  const revision=identityRevision;
  try {
   const next=await rpc<Dashboard>('cinecriptico_dashboard');if(revision!==identityRevision||next.day!==state?.day)return;
   dashboard=next;renderDashboard();node('dashboard-status').hidden=true;
  } catch(error) {
   if(stale(error))throw error;
   node('dashboard-status').textContent='No pudimos actualizar rankings y estadísticas. Tu partida se guarda por separado; volveremos a intentarlo.';
   node('dashboard-status').hidden=false;
  }
 }
 function renderDashboard() {
  if(!dashboard)return;
  node('solved').textContent=format(dashboard.solvedToday);
  const s=dashboard.stats;node('stats-empty').hidden=Boolean(player);
  const rows:[string,string][]=[['Jugados / resueltos',`${format(s.played)} / ${format(s.solved)}`],['Resolución',`${s.played?Math.round(100*s.solved/s.played):0}%`],['Puntos acumulados',format(s.totalScore)],['Mejor puntaje',format(s.bestScore)],['Racha actual',`${s.streak} días`],['Récord de racha',`${s.bestStreak} días`],['Promedio de ayudas',String(s.averageHints)]];
  node('stats').replaceChildren(...(player?rows:[]).map(([name,value])=>{const div=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=name;dd.textContent=value;div.append(dt,dd);return div;}));
  const ranks=dashboard[period];
  node('ranking-list').replaceChildren(...ranks.map(r=>{const li=document.createElement('li'),rank=document.createElement('span'),name=document.createElement('span'),score=document.createElement('b');rank.textContent=`${r.rank}.`;name.textContent=r.name;score.textContent=format(r.score);li.append(rank,name,score);return li;}));
  if(!ranks.length) {const li=document.createElement('li');li.className='cryptic-ranking-empty';li.textContent='El primer lugar te espera.';node('ranking-list').append(li);}
 }
 async function refresh() {
  if(!ready||refreshing||busy||document.hidden)return;refreshing=true;controls();const sent=performance.now(),revision=identityRevision;
  let complete:()=>void=()=>{};refreshCompletion=new Promise<void>(resolve=>{complete=resolve;});
  try {
   const next=await rpc<State>('cinecriptico_play');if(revision!==identityRevision)return;apply(next,sent);
   if(node('status').classList.contains('is-error'))message(pending?'La conexión volvió. Tocá reconectar para confirmar la jugada pendiente.':'Conexión recuperada. Tu partida está guardada.');
   await loadDashboard();if(revision!==identityRevision)return;lastRefresh=performance.now();refreshAfter=0;if(!pending)node('reconnect').hidden=true;
  }
  catch(error) {if(stale(error)||revision!==identityRevision)return;refreshAfter=performance.now()+10000;message('Sin conexión. Tu partida sigue guardada; reconectá para continuar.',true);node('reconnect').hidden=false;}
  finally {if(revision===identityRevision){refreshing=false;controls();}complete();}
 }
 function readPending():Pending|null {
  try {
   const raw=localStorage.getItem(`cineposta-cryptic-pending:${uid}`);if(!raw)return null;
   const p=JSON.parse(raw) as Partial<Pending>;
   if(p&&typeof p==='object'&&Object.keys(p).length===5&&['start','guess','hint','giveup'].includes(p.p_action??'')
    &&typeof p.p_request_id==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(p.p_request_id)
    &&Number.isInteger(p.p_revision)&&Number(p.p_revision)>=0&&Number(p.p_revision)<=10
    &&(p.p_guess===null||(typeof p.p_guess==='string'&&p.p_guess.length<=48))
    &&typeof p.p_day==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(p.p_day))return p as Pending;
  }catch{/* Corrupt local data must not block a server-backed game. */}
  clearPending();return null;
 }
 async function initialize(allowNew=false) {
  if(initializing)return;initializing=true;busy=true;ready=false;const revision=++identityRevision;controls();
  try {
   const session=await client!.auth.getSession();
   if(session.error&&!(allowNew&&authError(session.error)))throw session.error;
   if(revision!==identityRevision)return;
   if(!session.data.session) {
    if((uid||lostIdentity)&&!allowNew){loseSession();return;}
    acceptingIdentity=true;
    try {const result=await client!.auth.signInAnonymously();if(result.error)throw result.error;uid=result.data.user!.id;}
    finally {acceptingIdentity=false;}
   } else uid=session.data.session.user.id;
   if(revision!==identityRevision)return;
   const restoredPlayer=await rpc<TriviaPlayer|null>('get_cinecriptico_player');if(revision!==identityRevision)return;player=restoredPlayer;
   pending=readPending();lostIdentity=false;ready=true;busy=false;message('');node('new-session').hidden=true;
   await refresh();if(pending&&!busy)node('reconnect').hidden=false;
  } catch(error) {
   if(stale(error)||revision!==identityRevision)return;
   if(authError(error)){loseSession();return;}
   message('No pudimos recuperar tu sesión. Revisá la conexión y permití el almacenamiento del navegador.',true);node('reconnect').hidden=false;
  } finally {initializing=false;if(revision===identityRevision){busy=false;controls();}else controls();}
 }
 node('start').addEventListener('click',()=>{if(player)void mutate('start');else{profile.hidden=false;profile.querySelector('input')?.focus();node('start').hidden=true;}});
 profile.addEventListener('submit',event=>{event.preventDefault();if(busy||!ready||refreshing)return;const data=new FormData(profile);const name=String(data.get('nickname')??'').trim();if(!isTriviaNicknameAllowed(name)){message('Ese nick no está permitido. Elegí otro.',true);return;}busy=true;controls();const revision=identityRevision;void(async()=>{
  try {player=await rpc<TriviaPlayer>('claim_cinecriptico_player',{p_name:name,p_country:data.get('country'),p_age:Number(data.get('age'))});profile.hidden=true;busy=false;await mutate('start');}
  catch(e) {if(stale(e)||revision!==identityRevision)return;const detail=errorText(e);message(detail.includes('nickname unavailable')?'Ese nick ya tiene dueño en CineCríptico. Podés usar otro aunque exista en la trivia.':detail.includes('nickname belongs')?'Tu sesión ya tiene un nick reservado en CineCríptico. Recargá para recuperarlo.':detail.includes('nickname not allowed')?'Ese nick no está permitido. Elegí otro.':'No pudimos reservar tu nick. Probá de nuevo.',true);}
  finally {if(revision===identityRevision){busy=false;controls();}}
 })();});
 function answer() {
  if(!ready||busy)return;
  const guess=normalized(word.value);if(!/^[A-Z]+$/.test(guess)||guess.length!==state?.letters){word.setCustomValidity(`Ingresá una palabra de ${state?.letters} letras.`);word.reportValidity();return;}
  void mutate('guess',word.value);
 }
 node('answer-form').addEventListener('submit',event=>{event.preventDefault();answer();});
 word.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.isComposing){event.preventDefault();answer();}});
 node('hint').addEventListener('click',()=>void mutate('hint'));
 node('giveup').addEventListener('click',()=>{node('confirm').hidden=false;node('confirm-giveup').focus();});
 node('cancel-giveup').addEventListener('click',()=>{node('confirm').hidden=true;word.focus();});
 node('confirm-giveup').addEventListener('click',()=>{node('confirm').hidden=true;void mutate('giveup');});
 node('reconnect').addEventListener('click',()=>{if(!ready)void initialize();else if(pending)void sendPending();else void refresh();});
 node('new-session').addEventListener('click',()=>void initialize(true));
 for(const tab of root.querySelectorAll<HTMLButtonElement>('[data-ranking]'))tab.addEventListener('click',()=>{period=tab.dataset.ranking as typeof period;for(const b of root.querySelectorAll('[data-ranking]'))b.setAttribute('aria-pressed',String(b===tab));renderDashboard();});
 function shareText() {const g=state?.game;return `🔮 CineCríptico · ${state?.day}\n${g?.phase==='solved'?`Descifrado · ${g.score}/1000 puntos`:'El misterio me ganó hoy'}\n${g?.mistakes??0} errores · ${g?.hintsUsed??0} ayudas\nSin spoilers. ¿Lo podés resolver?\n${new URL(`${root.dataset.base}juegos/cinecriptico/`,'https://cineposta.com.ar').href}`;}
 node('share').addEventListener('click',()=>{void(async()=>{try{if(navigator.share)await navigator.share({text:shareText()});else{await navigator.clipboard.writeText(shareText());message('Resultado copiado, sin revelar la palabra.');}}catch(e){if(!(e instanceof DOMException&&e.name==='AbortError'))message('Podés compartir con los enlaces de WhatsApp o X.');}})();});
 setInterval(()=>{if(!ready||document.hidden)return;const remaining=Math.max(0,deadline-performance.now());const total=Math.ceil(remaining/1000);node('clock').textContent=Number.isFinite(total)?[Math.floor(total/3600),Math.floor(total%3600/60),total%60].map(v=>String(v).padStart(2,'0')).join(':'):'--:--:--';if((!remaining||performance.now()-lastRefresh>=60000)&&performance.now()>=refreshAfter)void refresh();},1000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)void refresh();});
 window.addEventListener('online',()=>void refresh());window.addEventListener('pageshow',event=>{if(event.persisted)void refresh();});
 client!.auth.onAuthStateChange((event,session)=>{if((event==='SIGNED_OUT'&&uid)||(uid&&session&&session.user.id!==uid&&!acceptingIdentity))loseSession();});
 void initialize();
}
