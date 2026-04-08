/**
 * Astro 6 client entrypoint.
 * Keep browser-only logic in `src/scripts/*.ts` and reference it from `.astro`
 * with `<script src="../scripts/file.ts"></script>` so Astro can bundle,
 * deduplicate, and typecheck it.
 */

type StatusMode = 'catalog' | 'search';
type ReturnBehavior = 'reset';
type ChipDataKey = 'homeGenreId' | 'homePlatformId';

type MovieIndexEntry = {
	element: HTMLElement;
	searchable: string;
	title: string;
	year: string;
	url: string;
	posterUrl: string;
	meta: string;
	cast: string;
	platforms: Set<string>;
	genres: Set<string>;
	poster: HTMLImageElement | null;
};

type HomeState = {
	query: string;
	genre: string | null;
	platform: string | null;
	scrollY: number;
	ts: number;
};

const homeStateKey = 'cineposta:home-list-state:v2';
const homeReturnBehaviorKey = 'cineposta:home-return-behavior:v1';
const catalogLoadingPhrases = [
	'Bancá que carga el videoclub...',
	'Estamos acomodando los posters.',
	'Le estamos soplando el polvo a la videoteca.',
	'Estamos prendiendo todas las pantallas.',
	'Un segundo, que el catálogo es grandote.',
];
const searchLoadingPhrases = [
	'Bancá, estamos buscando esa peli.',
	'Revolviendo el videoclub...',
	'Estamos filtrando títulos y posters.',
	'A ver si aparece entre tanto quilombo.',
	'No te vayas, ya salen los resultados.',
];

const searchRoot = document.querySelector('[data-movie-search-root]');

if (searchRoot instanceof HTMLElement) {
	initHomeCatalog(searchRoot);
}

function initHomeCatalog(searchRoot: HTMLElement): void {
	const homeBrandLink = document.querySelector('.site-header__brand');
	const input = searchRoot.querySelector<HTMLInputElement>('[data-movie-search-input]');
	const clearButton = searchRoot.querySelector<HTMLButtonElement>('[data-movie-search-clear]');
	const emptyState = searchRoot.querySelector<HTMLElement>('[data-movie-search-empty]');
	const statusBox = searchRoot.querySelector<HTMLElement>('[data-movie-search-status]');
	const statusCopy = searchRoot.querySelector<HTMLElement>('[data-movie-search-status-copy]');
	const summary = searchRoot.querySelector<HTMLElement>('[data-movie-search-summary]');
	const suggestionsBox = searchRoot.querySelector<HTMLElement>('[data-movie-search-dropdown]');
	const suggestionsCopy = searchRoot.querySelector<HTMLElement>('[data-movie-search-dropdown-copy]');
	const suggestionsList = searchRoot.querySelector<HTMLElement>('[data-movie-search-suggestions]');
	const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-movie-card]'));
	const genreChips = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-home-genre-chip]'));
	const platformChips = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-home-platform-chip]'));

	if (!(input instanceof HTMLInputElement)) {
		return;
	}

	const movieIndex = cards.flatMap((card): MovieIndexEntry[] => {
		const poster = card.querySelector('[data-movie-poster]');
		const link = card.querySelector('a');

		return [{
			element: card,
			searchable: card.dataset.movieSearch ?? '',
			title: card.dataset.movieTitle ?? '',
			year: card.dataset.movieYear ?? '',
			url: card.dataset.movieUrl ?? (link instanceof HTMLAnchorElement ? link.href : ''),
			posterUrl:
				card.dataset.moviePosterUrl ??
				(poster instanceof HTMLImageElement ? poster.currentSrc || poster.src : ''),
			meta: card.dataset.movieMeta ?? '',
			cast: card.dataset.movieCast ?? '',
			platforms: new Set(
				(card.dataset.moviePlatforms ?? '')
					.split(',')
					.map((value) => value.trim())
					.filter(Boolean),
			),
			genres: new Set(
				(card.dataset.movieGenres ?? '')
					.split(',')
					.map((value) => value.trim())
					.filter(Boolean),
			),
			poster: poster instanceof HTMLImageElement ? poster : null,
		}];
	});

	let activeGenre: string | null = null;
	let activePlatform: string | null = null;
	let lastAppliedQuery = '';
	let lastAppliedGenre = '';
	let lastAppliedPlatform = '';
	let filterTimer = 0;
	let filterFrame = 0;
	let statusRotateTimer = 0;
	let statusHideTimer = 0;
	let statusToken = 0;
	let skipPersistOnPageHide = false;
	let activeStatusPhrases: string[] = [];
	let activeStatusIndex = 0;
	let activeSuggestionIndex = -1;
	let currentSuggestions: MovieIndexEntry[] = [];

	const normalize = (value: string): string =>
		value
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.trim();

	const getVisibleEntries = (): MovieIndexEntry[] => movieIndex.filter((entry) => !entry.element.hidden);

	const isPlainLeftClick = (event: MouseEvent): boolean =>
		event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

	const getChipLabel = (
		chips: HTMLButtonElement[],
		dataKey: ChipDataKey,
		activeValue: string | null,
	): string => {
		if (!activeValue) return '';

		const activeChip = chips.find((chip) => chip.dataset[dataKey] === activeValue);
		if (!(activeChip instanceof HTMLElement)) {
			return activeValue;
		}

		return activeChip.dataset.homePlatformLabel ?? activeChip.textContent?.trim() ?? activeValue;
	};

	const setReturnBehavior = (behavior: ReturnBehavior | null): void => {
		try {
			if (behavior) {
				sessionStorage.setItem(homeReturnBehaviorKey, behavior);
				return;
			}

			sessionStorage.removeItem(homeReturnBehaviorKey);
		} catch {
			// Ignore storage errors.
		}
	};

	const consumeReturnBehavior = (): ReturnBehavior | null => {
		try {
			const behavior = sessionStorage.getItem(homeReturnBehaviorKey);
			sessionStorage.removeItem(homeReturnBehaviorKey);
			return behavior === 'reset' ? behavior : null;
		} catch {
			return null;
		}
	};

	const removeStoredHomeState = (): void => {
		try {
			sessionStorage.removeItem(homeStateKey);
		} catch {
			// Ignore storage errors.
		}
	};

	const prepareResetOnReturn = (): void => {
		skipPersistOnPageHide = true;
		setReturnBehavior('reset');
		removeStoredHomeState();
	};

	const updateClearButtonVisibility = (): void => {
		if (!(clearButton instanceof HTMLButtonElement)) return;

		const shouldShow =
			input.value.trim().length > 0 || Boolean(activeGenre) || Boolean(activePlatform);
		clearButton.hidden = !shouldShow;
	};

	const hideSuggestions = (): void => {
		activeSuggestionIndex = -1;
		currentSuggestions = [];
		if (suggestionsBox) {
			suggestionsBox.hidden = true;
		}
		suggestionsList?.replaceChildren();
	};

	const updateSuggestionHighlight = (): void => {
		if (!(suggestionsList instanceof HTMLElement)) return;

		const options = Array.from(
			suggestionsList.querySelectorAll<HTMLAnchorElement>('[data-movie-search-suggestion]'),
		);

		for (const option of options) {
			const optionIndex = Number(option.dataset.suggestionIndex ?? '-1');
			option.classList.toggle('is-active', optionIndex === activeSuggestionIndex);
		}
	};

	const getSuggestionScore = (entry: MovieIndexEntry, query: string): number => {
		const normalizedTitle = normalize(entry.title);
		const normalizedMeta = normalize(`${entry.meta} ${entry.cast}`);
		let score = 300;

		if (normalizedTitle.startsWith(query)) score -= 180;
		else if (normalizedTitle.includes(query)) score -= 120;
		else if (entry.searchable.startsWith(query)) score -= 90;
		else if (entry.searchable.includes(query)) score -= 40;

		if (entry.year === query) score -= 35;
		if (normalizedMeta.includes(query)) score -= 20;

		return score;
	};

	const renderSuggestions = (query: string, matchingEntries: MovieIndexEntry[]): void => {
		if (!(suggestionsBox && suggestionsList && suggestionsCopy)) {
			return;
		}

		if (query.length === 0 || matchingEntries.length === 0) {
			hideSuggestions();
			return;
		}

		const suggestions = matchingEntries
			.slice()
			.sort((left, right) => getSuggestionScore(left, query) - getSuggestionScore(right, query))
			.slice(0, 6);

		currentSuggestions = suggestions;
		activeSuggestionIndex = -1;
		suggestionsCopy.textContent = `${matchingEntries.length} coincidencia${
			matchingEntries.length === 1 ? '' : 's'
		} rápida${matchingEntries.length === 1 ? '' : 's'}.`;

		const suggestionNodes = suggestions.map((entry, index) => {
			const link = document.createElement('a');
			link.className = 'movie-search__suggestion';
			link.href = entry.url;
			link.dataset.movieSearchSuggestion = 'true';
			link.dataset.suggestionIndex = String(index);

			const poster = document.createElement('img');
			poster.className = 'movie-search__suggestion-poster';
			poster.src = entry.posterUrl;
			poster.alt = '';
			poster.loading = 'lazy';
			poster.decoding = 'async';

			const body = document.createElement('span');
			body.className = 'movie-search__suggestion-body';

			const title = document.createElement('span');
			title.className = 'movie-search__suggestion-title';
			title.textContent = entry.title;

			const meta = document.createElement('span');
			meta.className = 'movie-search__suggestion-meta';
			meta.textContent = entry.meta;

			body.append(title, meta);

			if (entry.cast) {
				const cast = document.createElement('span');
				cast.className = 'movie-search__suggestion-cast';
				cast.textContent = entry.cast;
				body.append(cast);
			}

			link.append(poster, body);
			return link;
		});

		suggestionsList.replaceChildren(...suggestionNodes);
		suggestionsBox.hidden = false;
	};

	const updateSummary = (visibleCount: number): void => {
		if (!(summary instanceof HTMLElement)) return;

		const query = normalize(input.value);
		const hasQuery = query.length > 0;
		const hasGenre = Boolean(activeGenre);
		const hasPlatform = Boolean(activePlatform);

		if (!hasQuery && !hasGenre && !hasPlatform) {
			summary.textContent = `${visibleCount} títulos publicados.`;
			return;
		}

		const parts: string[] = [];
		if (hasGenre) {
			parts.push(`género ${getChipLabel(genreChips, 'homeGenreId', activeGenre)}`);
		}
		if (hasPlatform) {
			parts.push(`plataforma ${getChipLabel(platformChips, 'homePlatformId', activePlatform)}`);
		}
		if (hasQuery) {
			parts.push(`búsqueda "${input.value.trim()}"`);
		}

		summary.textContent = `${visibleCount} resultado${visibleCount === 1 ? '' : 's'} para ${parts.join(' + ')}.`;
	};

	const stopStatusRotation = (): void => {
		window.clearInterval(statusRotateTimer);
		statusRotateTimer = 0;
	};

	const hideStatus = (): void => {
		window.clearTimeout(statusHideTimer);
		stopStatusRotation();
		if (statusBox instanceof HTMLElement) {
			statusBox.hidden = true;
		}
	};

	const showStatus = (phrases: string[]): void => {
		if (!(statusBox && statusCopy)) return;

		const nextPhrases = phrases.length > 0 ? phrases : catalogLoadingPhrases;
		const signature = nextPhrases.join('|');

		if (signature !== activeStatusPhrases.join('|')) {
			activeStatusPhrases = nextPhrases.slice();
			activeStatusIndex = 0;
		}

		statusCopy.textContent = activeStatusPhrases[activeStatusIndex] ?? 'Bancá...';
		statusBox.hidden = false;
		window.clearTimeout(statusHideTimer);

		if (statusRotateTimer !== 0) return;

		statusRotateTimer = window.setInterval(() => {
			if (!(statusCopy instanceof HTMLElement) || activeStatusPhrases.length === 0) return;

			activeStatusIndex = (activeStatusIndex + 1) % activeStatusPhrases.length;
			statusCopy.textContent = activeStatusPhrases[activeStatusIndex];
		}, 1350);
	};

	const prioritizeVisiblePosters = (entries: MovieIndexEntry[]): void => {
		entries.slice(0, 10).forEach((entry, index) => {
			if (!(entry.poster instanceof HTMLImageElement)) return;

			entry.poster.decoding = 'async';
			entry.poster.loading = index < 5 ? 'eager' : 'lazy';
			entry.poster.setAttribute('fetchpriority', index < 3 ? 'high' : 'auto');
		});
	};

	const syncStatusWithVisiblePosters = (mode: StatusMode, visibleCount?: number): void => {
		const visibleEntries = getVisibleEntries();
		const pendingImages = visibleEntries
			.slice(0, mode === 'catalog' ? 12 : 8)
			.map((entry) => entry.poster)
			.filter((poster): poster is HTMLImageElement => poster instanceof HTMLImageElement);
		const imagesToWait = pendingImages.filter((poster) => !poster.complete);
		const nextToken = ++statusToken;

		updateSummary(typeof visibleCount === 'number' ? visibleCount : visibleEntries.length);
		prioritizeVisiblePosters(visibleEntries);

		if (imagesToWait.length === 0) {
			statusHideTimer = window.setTimeout(() => {
				if (nextToken === statusToken) {
					hideStatus();
				}
			}, 120);
			return;
		}

		showStatus(mode === 'catalog' ? catalogLoadingPhrases : searchLoadingPhrases);

		let remainingImages = imagesToWait.length;

		const finish = (): void => {
			if (nextToken !== statusToken) return;
			hideStatus();
		};

		const handlePosterSettled = (): void => {
			if (nextToken !== statusToken) return;
			remainingImages -= 1;
			if (remainingImages <= 0) {
				finish();
			}
		};

		for (const poster of imagesToWait) {
			poster.addEventListener('load', handlePosterSettled, { once: true });
			poster.addEventListener('error', handlePosterSettled, { once: true });
		}

		statusHideTimer = window.setTimeout(finish, mode === 'catalog' ? 3200 : 1800);
	};

	const persistHomeState = (): void => {
		try {
			const payload: HomeState = {
				query: input.value,
				genre: activeGenre,
				platform: activePlatform,
				scrollY: Math.max(0, Math.round(window.scrollY)),
				ts: Date.now(),
			};

			sessionStorage.setItem(homeStateKey, JSON.stringify(payload));
		} catch {
			// Ignore storage errors.
		}
	};

	const toggleGenre = (genreId: string | null): string | null => {
		activeGenre = activeGenre === genreId ? null : genreId;
		updateClearButtonVisibility();
		return activeGenre;
	};

	const togglePlatform = (platformId: string | null): string | null => {
		activePlatform = activePlatform === platformId ? null : platformId;
		updateClearButtonVisibility();
		return activePlatform;
	};

	const runFilter = (force = false): number => {
		const query = normalize(input.value);
		const genreKey = activeGenre ?? '';
		const platformKey = activePlatform ?? '';

		updateClearButtonVisibility();

		if (
			!force &&
			query === lastAppliedQuery &&
			genreKey === lastAppliedGenre &&
			platformKey === lastAppliedPlatform
		) {
			const visibleCount = getVisibleEntries().length;
			renderSuggestions(query, getVisibleEntries());
			updateSummary(visibleCount);
			return visibleCount;
		}

		lastAppliedQuery = query;
		lastAppliedGenre = genreKey;
		lastAppliedPlatform = platformKey;

		let visibleCount = 0;
		const matchingEntries: MovieIndexEntry[] = [];

		for (const entry of movieIndex) {
			const genreMatch = !activeGenre || entry.genres.has(activeGenre);
			const platformMatch = !activePlatform || entry.platforms.has(activePlatform);
			const queryMatch = query.length === 0 || entry.searchable.includes(query);
			const show = genreMatch && platformMatch && queryMatch;

			if (entry.element.hidden === show) {
				entry.element.hidden = !show;
			}

			if (show) {
				visibleCount += 1;
				matchingEntries.push(entry);
			}
		}

		if (emptyState instanceof HTMLElement) {
			emptyState.hidden = visibleCount > 0;
		}

		renderSuggestions(query, matchingEntries);
		updateSummary(visibleCount);
		return visibleCount;
	};

	const applyGenreUI = (): void => {
		for (const chip of genreChips) {
			const chipGenre = chip.dataset.homeGenreId;
			const isActive = Boolean(chipGenre && chipGenre === activeGenre);
			chip.classList.toggle('is-active', isActive);
			chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
		}
	};

	const applyPlatformUI = (): void => {
		for (const chip of platformChips) {
			const chipPlatform = chip.dataset.homePlatformId;
			const isActive = Boolean(chipPlatform && chipPlatform === activePlatform);
			chip.classList.toggle('is-active', isActive);
			chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
		}
	};

	const resetCatalog = (mode: StatusMode = 'catalog'): number => {
		activeGenre = null;
		activePlatform = null;
		input.value = '';
		hideSuggestions();
		applyGenreUI();
		applyPlatformUI();
		updateClearButtonVisibility();
		removeStoredHomeState();
		setReturnBehavior(null);
		const visibleCount = runFilter(true);
		syncStatusWithVisiblePosters(mode, visibleCount);
		return visibleCount;
	};

	const scheduleFilter = (): void => {
		showStatus(searchLoadingPhrases);
		window.clearTimeout(filterTimer);
		filterTimer = window.setTimeout(() => {
			window.cancelAnimationFrame(filterFrame);
			filterFrame = window.requestAnimationFrame(() => {
				const visibleCount = runFilter();
				persistHomeState();
				syncStatusWithVisiblePosters('search', visibleCount);
			});
		}, 120);
	};

	const restoreHomeState = (): void => {
		let parsed: Partial<HomeState> | null = null;

		try {
			const raw = sessionStorage.getItem(homeStateKey);
			if (raw) {
				parsed = JSON.parse(raw) as Partial<HomeState>;
			}
		} catch {
			parsed = null;
		}

		if (!parsed || typeof parsed !== 'object') {
			const visibleCount = runFilter(true);
			syncStatusWithVisiblePosters('catalog', visibleCount);
			return;
		}

		const ageMs = Date.now() - Number(parsed.ts ?? 0);
		if (!Number.isFinite(ageMs) || ageMs > 1000 * 60 * 30) {
			removeStoredHomeState();
			const visibleCount = runFilter(true);
			syncStatusWithVisiblePosters('catalog', visibleCount);
			return;
		}

		if (typeof parsed.query === 'string') {
			input.value = parsed.query;
		}
		if (typeof parsed.genre === 'string' && parsed.genre.length > 0) {
			activeGenre = parsed.genre;
		}
		if (typeof parsed.platform === 'string' && parsed.platform.length > 0) {
			activePlatform = parsed.platform;
		}

		applyGenreUI();
		applyPlatformUI();
		updateClearButtonVisibility();

		lastAppliedQuery = '';
		lastAppliedGenre = '';
		lastAppliedPlatform = '';

		const mode: StatusMode =
			((typeof parsed.query === 'string' && parsed.query.trim().length > 0) ||
				Boolean(activeGenre) ||
				Boolean(activePlatform))
				? 'search'
				: 'catalog';
		const visibleCount = runFilter(true);
		syncStatusWithVisiblePosters(mode, visibleCount);

		const savedScrollY = Number(parsed.scrollY);
		if (Number.isFinite(savedScrollY) && savedScrollY > 0) {
			window.requestAnimationFrame(() => {
				window.scrollTo(0, savedScrollY);
			});
		}

		removeStoredHomeState();
	};

	const cardLinks = movieIndex
		.map((entry) => entry.element.querySelector('a'))
		.filter((link): link is HTMLAnchorElement => link instanceof HTMLAnchorElement);

	for (const link of cardLinks) {
		link.addEventListener('click', (event) => {
			if (!isPlainLeftClick(event)) return;
			prepareResetOnReturn();
		});
	}

	for (const chip of genreChips) {
		chip.addEventListener('click', () => {
			const nextGenre = chip.dataset.homeGenreId ?? null;
			const isResetInteraction = activeGenre === nextGenre;
			toggleGenre(nextGenre);
			if (isResetInteraction) {
				input.value = '';
			}
			applyGenreUI();
			showStatus(searchLoadingPhrases);
			const visibleCount = runFilter(true);
			syncStatusWithVisiblePosters('search', visibleCount);
			persistHomeState();
		});
	}

	for (const chip of platformChips) {
		chip.addEventListener('click', () => {
			const nextPlatform = chip.dataset.homePlatformId ?? null;
			const isResetInteraction = activePlatform === nextPlatform;
			togglePlatform(nextPlatform);
			if (isResetInteraction) {
				input.value = '';
			}
			applyPlatformUI();
			showStatus(searchLoadingPhrases);
			const visibleCount = runFilter(true);
			syncStatusWithVisiblePosters('search', visibleCount);
			persistHomeState();
		});
	}

	applyGenreUI();
	applyPlatformUI();
	updateClearButtonVisibility();

	input.addEventListener('input', () => {
		scheduleFilter();
	});

	input.addEventListener('focus', () => {
		if (
			input.value.trim().length > 0 &&
			currentSuggestions.length > 0 &&
			suggestionsBox instanceof HTMLElement
		) {
			suggestionsBox.hidden = false;
		}
	});

	input.addEventListener('keydown', (event: KeyboardEvent) => {
		if (currentSuggestions.length === 0) {
			if (event.key === 'Escape') {
				hideSuggestions();
			}
			return;
		}

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			activeSuggestionIndex = Math.min(activeSuggestionIndex + 1, currentSuggestions.length - 1);
			updateSuggestionHighlight();
			return;
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault();
			activeSuggestionIndex = Math.max(activeSuggestionIndex - 1, 0);
			updateSuggestionHighlight();
			return;
		}

		if (event.key === 'Enter' && activeSuggestionIndex >= 0) {
			event.preventDefault();
			prepareResetOnReturn();
			window.location.href = currentSuggestions[activeSuggestionIndex].url;
			return;
		}

		if (event.key === 'Escape') {
			hideSuggestions();
		}
	});

	if (suggestionsList instanceof HTMLElement) {
		suggestionsList.addEventListener('mousemove', (event: MouseEvent) => {
			const target = event.target;
			const suggestion =
				target instanceof Element
					? target.closest<HTMLAnchorElement>('[data-movie-search-suggestion]')
					: null;

			if (!(suggestion instanceof HTMLAnchorElement)) return;

			activeSuggestionIndex = Number(suggestion.dataset.suggestionIndex ?? '-1');
			updateSuggestionHighlight();
		});

		suggestionsList.addEventListener('click', (event: MouseEvent) => {
			const target = event.target;
			const suggestion =
				target instanceof Element
					? target.closest<HTMLAnchorElement>('[data-movie-search-suggestion]')
					: null;

			if (!(suggestion instanceof HTMLAnchorElement)) return;
			if (!isPlainLeftClick(event)) return;

			prepareResetOnReturn();
		});
	}

	clearButton?.addEventListener('click', () => {
		showStatus(catalogLoadingPhrases);
		resetCatalog('catalog');
		input.focus();
	});

	document.addEventListener('pointerdown', (event: PointerEvent) => {
		if (!(event.target instanceof Node) || searchRoot.contains(event.target)) return;
		hideSuggestions();
	});

	if (homeBrandLink instanceof HTMLAnchorElement) {
		homeBrandLink.addEventListener('click', (event) => {
			event.preventDefault();
			skipPersistOnPageHide = true;
			showStatus(catalogLoadingPhrases);
			resetCatalog('catalog');
			window.requestAnimationFrame(() => {
				window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
			});
		});
	}

	window.addEventListener('pagehide', () => {
		if (skipPersistOnPageHide) {
			skipPersistOnPageHide = false;
			return;
		}

		persistHomeState();
	});

	window.addEventListener('pageshow', () => {
		if (consumeReturnBehavior() !== 'reset') return;
		resetCatalog('catalog');
	});

	showStatus(catalogLoadingPhrases);
	restoreHomeState();
}
