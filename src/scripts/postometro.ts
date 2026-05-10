import {
	type PostometroAnswers,
	type PostometroCatalogEntry,
	type PostometroPlatformOption,
	type PostometroResultCard,
	getPostometroResultSet,
} from '../lib/postometro-engine';

type PostometroPayload = {
	catalog: PostometroCatalogEntry[];
	platformOptions: PostometroPlatformOption[];
	defaultAnswers: PostometroAnswers;
};

type SearchTrigger = 'search' | 'reroll' | 'dismiss';
type IdleMode = 'initial' | 'changed' | 'reset';

type MutableState = {
	answers: PostometroAnswers;
	comboOffset: number;
	rerollOffset: number;
	seenSlugs: Set<string>;
	skippedSlugs: Set<string>;
	hasSearched: boolean;
	isLoading: boolean;
	searchTimer: number | null;
};

const POSTOMETRO_ROTATION_STORAGE_KEY = 'postometro-combo-rotation-v1';
const POSTOMETRO_SEEN_STORAGE_KEY = 'postometro-seen-v1';
const POSTOMETRO_SKIPPED_STORAGE_KEY = 'postometro-skipped-v1';
const POSTOMETRO_RESULT_LIMIT = 40;
const LOADING_MIN_MS = 3000;
const LOADING_MAX_MS = 6000;
const LOADING_PHRASES = [
	'Bancame que voy a buscarla al sótano y vuelvo.',
	'Estoy sacando polvo de una estantería sospechosamente larga.',
	'Le estoy preguntando al catálogo si hoy se porta bien.',
	'Un segundo, que el proyector se hizo el interesante.',
	'Estoy peleando con una pila de DVDs que no colabora.',
	'Bajando al archivo secreto donde viven las recomendaciones posta.',
	'Ya casi, se trabó una lata de pochoclos en el mecanismo.',
	'Le estoy cebando un mate al algoritmo para que afloje.',
	'Esperá que rebobino esta intuición cinematográfica.',
	'Buscando una que no te haga sentir que perdiste la noche.',
	'Estoy revisando la sección de pelis que entran como piña.',
	'Le pedí al catálogo algo digno y se puso exquisito.',
	'Bancame que estoy corriendo a un crítico que se quiso colar.',
	'Volviendo con una recomendación abajo del brazo.',
	'Hay una peli escondida atrás de una italiana de 3 horas.',
	'Chequeando que no te mande cualquier verdura.',
	'Buscando una que no pida tesis ni siesta.',
	'Metiéndome entre estantes como quien busca una botella fría.',
	'Un toque, que la linterna del videoclub titila.',
	'Rastreando una opción que no te haga putear después.',
	'Le estoy diciendo al catálogo que no se haga el gracioso.',
	'Ya vuelvo, me quedé enganchado mirando un póster viejo.',
	'Buscando algo fino, no una recomendación de compromiso.',
	'Se me cayó una carpeta de thrillers. Dame un segundo.',
	'Pisando fuerte por el pasillo de las que rinden de verdad.',
	'Abriendo una puerta que dice no tocar. Ideal.',
	'Le estoy pidiendo a la noche que defina sus intenciones.',
	'Filtrando las que prometen mucho y entregan poco.',
	'Bancame que la respuesta estaba en una caja sin rótulo.',
	'Buscando una que pegue justo con el humor de hoy.',
	'El catálogo me tiró tres joyitas y una chantada. Estoy separando.',
	'Un segundo, que esta recomendación viene con ceremonia.',
	'Chequeando si hoy pinta cine o una trompada emocional.',
	'Entrando al cuarto donde guardamos las pelis rendidoras.',
	'Le estoy haciendo un control de calidad a esta noche.',
	'Me vino una candidata fuerte, pero quiero una mejor.',
	'Buscando algo que te deje conforme y no filosofando de bronca.',
	'Ya casi, se cruzaron dos clásicos y un pochoclo en la puerta.',
	'Le estoy pasando un peine fino a la cartelera.',
	'Un toque, que una comedia se quiso hacer pasar por tensión.',
	'Viendo si hoy va más Burton, Spielberg o una cachetada seca.',
	'La recomendación está en proceso de marinado.',
	'Revisando que no te encaje una peli que ya viste mil veces.',
	'Bancame que la mejor opción estaba en segunda fila.',
	'Estoy evitando que entre una obviedad por la ventana.',
	'Ya vuelvo, hay una candidata que pide pista.',
	'Buscando una para esta noche sin vender humo.',
	'Separando lo intenso de lo inflado, que no es lo mismo.',
	'Metiendo mano en el depósito donde viven las buenas decisiones.',
	'Le estoy sacando la funda a una opción muy digna.',
	'Esperá que el sótano tiene eco y no escucho al catálogo.',
];

const dataScript = document.getElementById('postometro-data');
const form = document.querySelector<HTMLFormElement>('[data-postometro-form]');
const resultsRoot = document.querySelector<HTMLElement>('[data-postometro-results]');

if (!(dataScript instanceof HTMLScriptElement) || !(form instanceof HTMLFormElement) || !(resultsRoot instanceof HTMLElement)) {
	// Nothing to hydrate on pages that do not include the feature.
} else {
	initPostometro(dataScript, form, resultsRoot);
}

function initPostometro(
	dataScript: HTMLScriptElement,
	form: HTMLFormElement,
	resultsRoot: HTMLElement,
): void {
	const payload = parsePayload(dataScript.textContent);
	if (!payload) {
		return;
	}

	const resetButton = form.querySelector<HTMLButtonElement>('[data-postometro-reset]');
	const headline = resultsRoot.querySelector<HTMLElement>('[data-postometro-headline]');
	const diagnosis = resultsRoot.querySelector<HTMLElement>('[data-postometro-diagnosis]');
	const subheadline = resultsRoot.querySelector<HTMLElement>('[data-postometro-subheadline]');
	const body = resultsRoot.querySelector<HTMLElement>('[data-postometro-results-body]');

	if (!(headline && diagnosis && subheadline && body)) {
		return;
	}

	const state: MutableState = {
		answers: { ...payload.defaultAnswers },
		comboOffset: 0,
		rerollOffset: 0,
		seenSlugs: loadSeenSlugs(),
		skippedSlugs: loadSkippedSlugs(),
		hasSearched: false,
		isLoading: false,
		searchTimer: null,
	};

	const applyAnswersToForm = (answers: PostometroAnswers): void => {
		for (const element of Array.from(form.elements)) {
			if (element instanceof HTMLInputElement && element.type === 'radio') {
				element.checked = element.value === answers[element.name as keyof PostometroAnswers];
			}
			if (element instanceof HTMLSelectElement && element.name === 'platform') {
				element.value = answers.platform;
			}
			if (element instanceof HTMLSelectElement && element.name === 'era') {
				element.value = answers.era;
			}
		}
	};

	const setBusy = (busy: boolean): void => {
		state.isLoading = busy;
		resultsRoot.setAttribute('aria-busy', busy ? 'true' : 'false');

		for (const element of Array.from(form.elements)) {
			if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLButtonElement) {
				element.disabled = busy;
			}
		}
	};

	const clearTimers = (): void => {
		if (state.searchTimer !== null) {
			window.clearTimeout(state.searchTimer);
			state.searchTimer = null;
		}
	};

	const renderIdle = (mode: IdleMode): void => {
		clearTimers();
		resultsRoot.dataset.postometroState = 'idle';
		setBusy(false);
		state.hasSearched = false;

		if (mode === 'changed') {
			headline.textContent = 'Cambiaste el combo';
			diagnosis.textContent = 'La recomendación anterior ya no vale para estos filtros.';
			subheadline.textContent = 'Tocá buscar de nuevo y sale una nueva para esta noche.';
			body.innerHTML = `
				<section class="postometro-empty postometro-empty--idle" data-postometro-empty>
					<h3>Listo para volver a buscar</h3>
					<p>Con este combo nuevo, la película aparece recién cuando apretes <strong>Buscar</strong>.</p>
				</section>
			`;
			return;
		}

		headline.textContent = 'Cuando busques, aparece la recomendación';
		diagnosis.textContent = 'Primero armá el combo de la noche. Después apretás el botón y vemos qué peli entra mejor.';
		subheadline.textContent = 'Acá no sale nada hasta que dispares la búsqueda.';
		body.innerHTML = `
			<section class="postometro-empty postometro-empty--idle" data-postometro-empty>
				<h3>Tu película todavía no salió</h3>
				<p>Elegí los filtros y tocá <strong>Buscar</strong> para arrancar.</p>
			</section>
		`;
	};

	const setLoadingPhrase = (): void => {
		const phraseNode = body.querySelector<HTMLElement>('[data-postometro-loading-phrase]');
		if (!(phraseNode instanceof HTMLElement)) {
			return;
		}

		phraseNode.textContent = LOADING_PHRASES[getRandomInt(0, LOADING_PHRASES.length - 1)] ?? '';
	};

	const renderLoading = (): void => {
		resultsRoot.dataset.postometroState = 'loading';
		headline.textContent = 'Buscando película';
		diagnosis.textContent = 'Estamos cruzando tu combo para sacar una recomendación que tenga sentido.';
		subheadline.textContent = 'Humor, compañía, tiempo, plataforma y época. Todo entra en la mezcla.';

		const pills = [
			getSelectedFieldLabel(form, 'era'),
			getSelectedFieldLabel(form, 'platform'),
			getSelectedFieldLabel(form, 'mood'),
			getSelectedFieldLabel(form, 'company'),
			getSelectedFieldLabel(form, 'time'),
			getSelectedFieldLabel(form, 'intensity'),
		].filter(Boolean);

		body.innerHTML = `
			<section class="postometro-loading" data-postometro-loading>
				<div class="postometro-loading__marquee" aria-hidden="true">
					<span></span>
					<span></span>
					<span></span>
				</div>
				<p class="postometro-loading__eyebrow">Buscando película</p>
				<h3>Estamos revolviendo el catálogo para esta noche</h3>
				<p class="postometro-loading__phrase" data-postometro-loading-phrase></p>
				<ul class="postometro-loading__chips">
					${pills.map((pill) => `<li>${escapeHtml(pill)}</li>`).join('')}
				</ul>
				<div class="postometro-loading__meter" aria-hidden="true">
					<span></span>
				</div>
			</section>
		`;

		setLoadingPhrase();
	};

	const renderResultSet = (trigger: SearchTrigger, excludedSlug: string | null): void => {
		clearTimers();
		resultsRoot.dataset.postometroState = 'ready';

		const resultSet = getPostometroResultSet(
			payload.catalog,
			state.answers,
			payload.platformOptions,
			POSTOMETRO_RESULT_LIMIT,
		);
		const unavailableSlugs = new Set([...state.seenSlugs, ...state.skippedSlugs]);
		const availableResults = resultSet.results.filter(
			(result) => !unavailableSlugs.has(result.slug) && result.slug !== excludedSlug,
		);

		headline.textContent = resultSet.headline;
		diagnosis.textContent = resultSet.diagnosis;
		subheadline.textContent = resultSet.subheadline;

		if (trigger === 'reroll' && availableResults.length === 0) {
			body.innerHTML = `
				<section class="postometro-empty" data-postometro-empty>
					<h3>No encontré otra del mismo palo</h3>
					<p>Para este combo ya no quedó una variante clara. Cambiá un filtro o marcá otra como vista.</p>
				</section>
			`;
			return;
		}

		if (availableResults.length === 0) {
			if (resultSet.results.length === 0) {
				body.innerHTML = `
					<section class="postometro-empty" data-postometro-empty>
						<h3>No hay una buena opción para ese combo</h3>
						<p>${escapeHtml(resultSet.note)}</p>
					</section>
				`;
				return;
			}

			body.innerHTML = `
				<section class="postometro-empty" data-postometro-empty>
					<h3>Te las viste todas para este combo</h3>
					<p>En esta sesión ya sacamos todas las que marcaste como vistas. Cambiá un filtro y te tiro otra tanda.</p>
				</section>
			`;
			return;
		}

		const offset = trigger === 'search' ? state.comboOffset : state.rerollOffset;
		const rotatedResults = rotateResults(availableResults, offset, trigger !== 'search');
		const primary = rotatedResults[0];

		if (!primary) {
			body.innerHTML = `
				<section class="postometro-empty" data-postometro-empty>
					<h3>No salió una clara</h3>
					<p>Probá cambiar el combo y tirar otra búsqueda.</p>
				</section>
			`;
			return;
		}

		body.innerHTML = `
			<article class="postometro-pick postometro-pick--primary postometro-pick--reveal" data-postometro-primary data-postometro-primary-slug="${escapeHtml(primary.slug)}">
				<div class="postometro-pick__poster-shell postometro-pick__poster-shell--reveal">
					<img
						class="postometro-pick__poster"
						src="${escapeHtml(primary.posterUrl)}"
						alt="Poster de ${escapeHtml(primary.title)}"
						loading="eager"
						decoding="async"
						referrerpolicy="no-referrer"
					/>
				</div>
				<div class="postometro-pick__body">
					<div class="postometro-pick__meta-top">
						<span class="postometro-pill">${escapeHtml(primary.matchLabel)}</span>
						<span class="postometro-pill postometro-pill--muted">${escapeHtml(String(primary.year))}</span>
					</div>
					<h3>${escapeHtml(primary.title)}</h3>
					<p class="postometro-pick__review">${escapeHtml(primary.review)}</p>
					<ul class="postometro-badge-list">
						${primary.badges.map((badge) => `<li>${escapeHtml(badge)}</li>`).join('')}
					</ul>
					<ul class="postometro-reason-list">
						${primary.reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join('')}
					</ul>
					${renderFirstInstallmentNote(primary)}
					<div class="postometro-pick__actions">
						<a class="postometro-cta" href="${escapeHtml(primary.url)}">Ver ficha completa</a>
						<button
							type="button"
							class="postometro-cta postometro-cta--quiet"
							data-postometro-dismiss
							data-postometro-slug="${escapeHtml(primary.slug)}"
						>
							Ya la vi
						</button>
						<button type="button" class="postometro-cta postometro-cta--ghost" data-postometro-reroll>
							Dame otra del mismo palo
						</button>
					</div>
				</div>
			</article>
		`;
	};

	const performSearch = (trigger: SearchTrigger, excludedSlug: string | null = null): void => {
		if (state.isLoading) {
			return;
		}

		state.answers = readAnswers(form, payload.defaultAnswers);

		if (trigger === 'search') {
			state.comboOffset = getNextComboOffset(buildAnswerKey(state.answers));
			state.rerollOffset = 0;
		} else if (trigger === 'reroll') {
			state.rerollOffset += 1;
		} else {
			state.rerollOffset = 0;
		}

		renderLoading();
		setBusy(true);

		state.searchTimer = window.setTimeout(() => {
			state.searchTimer = null;
			state.hasSearched = true;
			setBusy(false);
			renderResultSet(trigger, excludedSlug);
		}, getRandomInt(LOADING_MIN_MS, LOADING_MAX_MS));
	};

	applyAnswersToForm(state.answers);
	renderIdle('initial');

	form.addEventListener('submit', (event) => {
		event.preventDefault();
		performSearch('search');
	});

	form.addEventListener('change', () => {
		if (state.isLoading) {
			return;
		}

		state.answers = readAnswers(form, payload.defaultAnswers);
		state.rerollOffset = 0;
		renderIdle(state.hasSearched ? 'changed' : 'initial');
	});

	resetButton?.addEventListener('click', () => {
		if (state.isLoading) {
			return;
		}

		state.answers = { ...payload.defaultAnswers };
		state.comboOffset = 0;
		state.rerollOffset = 0;
		applyAnswersToForm(state.answers);
		renderIdle('reset');
	});

	resultsRoot.addEventListener('click', (event: MouseEvent) => {
		const target = event.target;
		if (!(target instanceof Element) || state.isLoading) {
			return;
		}

		const rerollButton = target.closest<HTMLButtonElement>('[data-postometro-reroll]');
		if (rerollButton instanceof HTMLButtonElement) {
			const currentPick = resultsRoot.querySelector<HTMLElement>('[data-postometro-primary-slug]');
			const currentSlug = currentPick?.dataset.postometroPrimarySlug ?? null;
			if (currentSlug) {
				state.skippedSlugs.add(currentSlug);
				saveSkippedSlugs(state.skippedSlugs);
			}
			performSearch('reroll', currentSlug);
			return;
		}

		const dismissButton = target.closest<HTMLButtonElement>('[data-postometro-dismiss]');
		if (!(dismissButton instanceof HTMLButtonElement)) {
			return;
		}

		const slug = dismissButton.dataset.postometroSlug;
		if (!slug) {
			return;
		}

		state.seenSlugs.add(slug);
		saveSeenSlugs(state.seenSlugs);
		performSearch('dismiss');
	});
}

function parsePayload(raw: string | null): PostometroPayload | null {
	if (!raw) {
		return null;
	}

	try {
		return JSON.parse(raw) as PostometroPayload;
	} catch {
		return null;
	}
}

function readAnswers(form: HTMLFormElement, fallback: PostometroAnswers): PostometroAnswers {
	const formData = new FormData(form);
	return {
		mood: String(formData.get('mood') ?? fallback.mood) as PostometroAnswers['mood'],
		time: String(formData.get('time') ?? fallback.time) as PostometroAnswers['time'],
		company: String(formData.get('company') ?? fallback.company) as PostometroAnswers['company'],
		platform: String(formData.get('platform') ?? fallback.platform) as PostometroAnswers['platform'],
		intensity: String(formData.get('intensity') ?? fallback.intensity) as PostometroAnswers['intensity'],
		era: String(formData.get('era') ?? fallback.era) as PostometroAnswers['era'],
	};
}

function rotateResults(results: PostometroResultCard[], offset: number, expandedPool: boolean): PostometroResultCard[] {
	if (results.length === 0) {
		return [];
	}

	const topScore = results[0]?.score ?? 0;
	const scorePoolSize = results.filter((result) => result.score >= topScore - 20).length;
	let primaryPoolSize = Math.min(scorePoolSize, 6);

	if (expandedPool && primaryPoolSize <= 1 && results.length > 1) {
		primaryPoolSize = Math.min(results.length, 8);
	}

	if (primaryPoolSize <= 1) {
		return results;
	}

	const normalizedOffset = ((offset % primaryPoolSize) + primaryPoolSize) % primaryPoolSize;
	const primaryPool = results.slice(0, primaryPoolSize);
	const chosenPrimary = primaryPool[normalizedOffset];
	const remainingPool = primaryPool.filter((_, index) => index !== normalizedOffset);

	return chosenPrimary ? [chosenPrimary, ...remainingPool, ...results.slice(primaryPoolSize)] : results;
}

function buildAnswerKey(answers: PostometroAnswers): string {
	return [answers.mood, answers.time, answers.company, answers.platform, answers.intensity, answers.era].join('|');
}

function getNextComboOffset(comboKey: string): number {
	try {
		const raw = window.localStorage.getItem(POSTOMETRO_ROTATION_STORAGE_KEY);
		const parsed = raw ? (JSON.parse(raw) as Record<string, number>) : {};
		const nextOffset = (parsed[comboKey] ?? -1) + 1;
		parsed[comboKey] = nextOffset;
		window.localStorage.setItem(POSTOMETRO_ROTATION_STORAGE_KEY, JSON.stringify(parsed));
		return nextOffset;
	} catch {
		return 0;
	}
}

function getSelectedFieldLabel(form: HTMLFormElement, fieldName: string): string {
	const checkedRadio = form.querySelector<HTMLInputElement>(`input[name="${fieldName}"]:checked`);
	if (checkedRadio) {
		const label = checkedRadio.closest('label');
		const title = label?.querySelector('strong')?.textContent?.trim();
		const fallback = label?.querySelector('span')?.textContent?.trim();
		return title ?? fallback ?? checkedRadio.value;
	}

	const select = form.querySelector<HTMLSelectElement>(`select[name="${fieldName}"]`);
	if (select) {
		return select.selectedOptions[0]?.textContent?.trim() ?? select.value;
	}

	return fieldName;
}

function loadSeenSlugs(): Set<string> {
	return loadSlugSet(POSTOMETRO_SEEN_STORAGE_KEY);
}

function saveSeenSlugs(seenSlugs: Set<string>): void {
	saveSlugSet(POSTOMETRO_SEEN_STORAGE_KEY, seenSlugs);
}

function loadSkippedSlugs(): Set<string> {
	return loadSlugSet(POSTOMETRO_SKIPPED_STORAGE_KEY);
}

function saveSkippedSlugs(skippedSlugs: Set<string>): void {
	saveSlugSet(POSTOMETRO_SKIPPED_STORAGE_KEY, skippedSlugs);
}

function loadSlugSet(storageKey: string): Set<string> {
	try {
		const raw = window.sessionStorage.getItem(storageKey);
		const parsed = raw ? (JSON.parse(raw) as string[]) : [];
		return new Set(parsed.filter(Boolean));
	} catch {
		return new Set<string>();
	}
}

function saveSlugSet(storageKey: string, slugs: Set<string>): void {
	try {
		window.sessionStorage.setItem(storageKey, JSON.stringify([...slugs]));
	} catch {
		// Ignore storage failures and keep the session in memory only.
	}
}

function renderFirstInstallmentNote(primary: PostometroResultCard): string {
	if (!primary.firstInstallment) {
		return '';
	}

	const year = primary.firstInstallment.year ? ` (${String(primary.firstInstallment.year)})` : '';
	const label = `${primary.firstInstallment.title}${year}`;
	const recommendation = primary.firstInstallment.url
		? `<a href="${escapeHtml(primary.firstInstallment.url)}">${escapeHtml(label)}</a>`
		: `<strong>${escapeHtml(label)}</strong>`;

	return `
		<p class="postometro-first-note">
			Es secuela: si no viste la primera, también te dejo ${recommendation}.
		</p>
	`;
}

function getRandomInt(min: number, max: number): number {
	const lower = Math.ceil(min);
	const upper = Math.floor(max);
	return Math.floor(Math.random() * (upper - lower + 1)) + lower;
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}
