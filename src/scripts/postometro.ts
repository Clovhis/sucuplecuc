import {
	type PostometroAnswers,
	type PostometroCatalogEntry,
	type PostometroResultCard,
	type PostometroPlatformOption,
	getPostometroResultSet,
} from '../lib/postometro-engine';

type PostometroPayload = {
	catalog: PostometroCatalogEntry[];
	platformOptions: PostometroPlatformOption[];
	defaultAnswers: PostometroAnswers;
};

type MutableState = {
	answers: PostometroAnswers;
	comboOffset: number;
	lastComboKey: string | null;
	rerollOffset: number;
	seenSlugs: Set<string>;
};

const POSTOMETRO_ROTATION_STORAGE_KEY = 'postometro-combo-rotation-v1';
const POSTOMETRO_SEEN_STORAGE_KEY = 'postometro-seen-v1';
const POSTOMETRO_RESULT_LIMIT = 40;
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

	const resetButton = document.querySelector<HTMLButtonElement>('[data-postometro-reset]');
	const headline = resultsRoot.querySelector<HTMLElement>('[data-postometro-headline]');
	const diagnosis = resultsRoot.querySelector<HTMLElement>('[data-postometro-diagnosis]');
	const subheadline = resultsRoot.querySelector<HTMLElement>('[data-postometro-subheadline]');
	const note = resultsRoot.querySelector<HTMLElement>('[data-postometro-note]');
	const body = resultsRoot.querySelector<HTMLElement>('[data-postometro-results-body]');

	if (!(headline && diagnosis && subheadline && body)) {
		return;
	}

	const state: MutableState = {
		answers: { ...payload.defaultAnswers },
		comboOffset: 0,
		lastComboKey: null,
		rerollOffset: 0,
		seenSlugs: loadSeenSlugs(),
	};

	const syncComboRotation = (): void => {
		const comboKey = buildAnswerKey(state.answers);
		if (comboKey === state.lastComboKey) {
			return;
		}

		state.lastComboKey = comboKey;
		state.comboOffset = getNextComboOffset(comboKey);
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

	const render = (): void => {
		const resultSet = getPostometroResultSet(
			payload.catalog,
			state.answers,
			payload.platformOptions,
			POSTOMETRO_RESULT_LIMIT,
		);
		const availableResults = resultSet.results.filter((result) => !state.seenSlugs.has(result.slug));
		const rotatedResults = rotateResults(availableResults, state.comboOffset + state.rerollOffset);

		headline.textContent = resultSet.headline;
		diagnosis.textContent = resultSet.diagnosis;
		subheadline.textContent = resultSet.subheadline;
		if (note instanceof HTMLElement) {
			note.textContent = resultSet.note;
		}

		if (rotatedResults.length === 0) {
			body.innerHTML = `
				<section class="postometro-empty" data-postometro-empty>
					<h3>Te las viste todas para este combo</h3>
					<p>Probá cambiar un filtro o pegá un reroll en otra combinación. En esta sesión ya sacamos las que marcaste como vistas.</p>
				</section>
			`;
			return;
		}

		const [primary, ...alternatives] = rotatedResults;
		const nextAlternatives = alternatives.slice(0, 2);

		body.innerHTML = `
			<article class="postometro-pick postometro-pick--primary" data-postometro-primary>
				<div class="postometro-pick__poster-shell">
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
			<section class="postometro-alternatives" aria-labelledby="postometro-alternatives-title">
				<div class="postometro-alternatives__header">
					<h3 id="postometro-alternatives-title">Si esa ya la viste</h3>
					<p data-postometro-note>${escapeHtml(resultSet.note)}</p>
				</div>
				<div class="postometro-alternatives__grid" data-postometro-alternatives>
					${nextAlternatives.map(renderMiniCard).join('')}
				</div>
			</section>
		`;
	};

	const updateFromForm = (): void => {
		state.answers = readAnswers(form, payload.defaultAnswers);
		state.rerollOffset = 0;
		syncComboRotation();
		render();
	};

	applyAnswersToForm(state.answers);
	syncComboRotation();
	render();

	form.addEventListener('change', updateFromForm);

	resetButton?.addEventListener('click', () => {
		state.answers = { ...payload.defaultAnswers };
		state.rerollOffset = 0;
		applyAnswersToForm(state.answers);
		syncComboRotation();
		render();
	});

	resultsRoot.addEventListener('click', (event: MouseEvent) => {
		const target = event.target;
		if (!(target instanceof Element)) {
			return;
		}

		const rerollButton = target.closest<HTMLButtonElement>('[data-postometro-reroll]');
		if (rerollButton instanceof HTMLButtonElement) {
			const resultSet = getPostometroResultSet(
				payload.catalog,
				state.answers,
				payload.platformOptions,
				POSTOMETRO_RESULT_LIMIT,
			);
			const availableResults = resultSet.results.filter((result) => !state.seenSlugs.has(result.slug));
			if (availableResults.length <= 1) {
				return;
			}

			state.rerollOffset = (state.rerollOffset + 1) % Math.min(availableResults.length, 8);
			render();
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
		state.rerollOffset = 0;
		saveSeenSlugs(state.seenSlugs);
		render();
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

function rotateResults(results: PostometroResultCard[], offset: number): PostometroResultCard[] {
	if (results.length === 0) {
		return [];
	}

	const topScore = results[0]?.score ?? 0;
	const primaryPoolSize = Math.min(
		results.filter((result) => result.score >= topScore - 20).length,
		6,
	);

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

function loadSeenSlugs(): Set<string> {
	try {
		const raw = window.sessionStorage.getItem(POSTOMETRO_SEEN_STORAGE_KEY);
		const parsed = raw ? (JSON.parse(raw) as string[]) : [];
		return new Set(parsed.filter(Boolean));
	} catch {
		return new Set<string>();
	}
}

function saveSeenSlugs(seenSlugs: Set<string>): void {
	try {
		window.sessionStorage.setItem(POSTOMETRO_SEEN_STORAGE_KEY, JSON.stringify([...seenSlugs]));
	} catch {
		// Ignore storage failures and keep the session in memory only.
	}
}

function renderMiniCard(result: PostometroResultCard): string {
	return `
		<article class="postometro-pick postometro-pick--mini">
			<div class="postometro-pick__mini-poster-shell">
				<img
					class="postometro-pick__mini-poster"
					src="${escapeHtml(result.posterUrl)}"
					alt="Poster de ${escapeHtml(result.title)}"
					loading="lazy"
					decoding="async"
					referrerpolicy="no-referrer"
				/>
			</div>
			<div class="postometro-pick__mini-body">
				<div class="postometro-pick__mini-top">
					<span class="postometro-pill postometro-pill--muted">${escapeHtml(result.runtimeLabel)}</span>
				</div>
				<h4>${escapeHtml(result.title)}</h4>
				<a class="postometro-text-link" href="${escapeHtml(result.url)}">Ir a la ficha</a>
			</div>
		</article>
	`;
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}
