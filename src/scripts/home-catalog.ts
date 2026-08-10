/**
 * Astro 6 client entrypoint.
 * Keep browser-only logic in `src/scripts/*.ts` and reference it from `.astro`
 * with `<script src="../scripts/file.ts"></script>` so Astro can bundle,
 * deduplicate, and typecheck it.
 */

type StatusMode = 'catalog' | 'search';
type ReturnBehavior = 'reset';
type ChipDataKey = 'homeGenreId' | 'homeSubgenreId' | 'homePlatformId';
type HistoryUpdateMode = 'push' | 'replace';

type MovieIndexEntry = {
	element: HTMLElement | null;
	template: HTMLTemplateElement | null;
	initial: boolean;
	searchable: string;
	title: string;
	year: string;
	url: string;
	posterUrl: string;
	meta: string;
	cast: string;
	entryType: 'movie';
	platforms: Set<string>;
	genres: Set<string>;
	subgenres: Set<string>;
	poster: HTMLImageElement | null;
	linkPrepared: boolean;
};

type PersonIndexEntry = {
	searchable: string;
	title: string;
	url: string;
	posterUrl: string;
	meta: string;
	ageLabel: string;
	nationalityLabel: string;
	cast: string;
	entryType: 'person';
};

type SearchSuggestionEntry = MovieIndexEntry | PersonIndexEntry;

type HomeFilterState = {
	query: string;
genres: string[];
	editorialFilters: string[];
	subgenres: string[];
	platforms: string[];
};

type HomeState = HomeFilterState & {
	scrollY: number;
	ts: number;
};

type StoredHomeState = Partial<HomeState> & {
	genre?: unknown;
	subgenre?: unknown;
	platform?: unknown;
};

const homeStateKey = 'cineposta:home-list-state:v5';
const homeReturnBehaviorKey = 'cineposta:home-return-behavior:v1';
const homeUrlFilterKeys = ['q', 'genero', 'filtro', 'subgenero', 'plataforma'] as const;
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
	const emptyState = document.querySelector<HTMLElement>('[data-movie-search-empty]');
	const statusBox = document.querySelector<HTMLElement>('[data-movie-search-status]');
	const statusCopy = document.querySelector<HTMLElement>('[data-movie-search-status-copy]');
	const summaries = Array.from(document.querySelectorAll<HTMLElement>('[data-movie-search-summary]'));
	const suggestionsBox = searchRoot.querySelector<HTMLElement>('[data-movie-search-dropdown]');
	const suggestionsCopy = searchRoot.querySelector<HTMLElement>('[data-movie-search-dropdown-copy]');
	const suggestionsList = searchRoot.querySelector<HTMLElement>('[data-movie-search-suggestions]');
	const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-movie-card]'));
	const cardTemplates = Array.from(document.querySelectorAll<HTMLTemplateElement>('[data-movie-card-template]'));
	const people = Array.from(searchRoot.querySelectorAll<HTMLElement>('[data-person-search-entry]'));
	const genreChips = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-home-genre-chip]'));
	const subgenreChips = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-home-subgenre-chip]'));
	const platformChips = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-home-platform-chip]'));
	const activeFiltersShell = document.querySelector<HTMLElement>('[data-home-active-filters]');
	const activeFiltersList = document.querySelector<HTMLElement>('[data-home-active-filter-list]');
	const filterResetButton = document.querySelector<HTMLButtonElement>('[data-home-filter-reset]');
	const resultCounter = document.querySelector<HTMLElement>('[data-home-result-counter]');
	const resultCount = document.querySelector<HTMLElement>('[data-home-result-count]');
	const resultCountLabel = document.querySelector<HTMLElement>('[data-home-result-count-label]');
	const peopleShowcaseGrid = document.querySelector<HTMLElement>('[data-home-people-grid]');
	const searchResultsGrid = document.querySelector<HTMLElement>('[data-movie-search-grid]');

	if (!(input instanceof HTMLInputElement)) {
		return;
	}

	const getTemplateCard = (template: HTMLTemplateElement): HTMLElement | null =>
		template.content.querySelector<HTMLElement>('[data-movie-card]');

	const createMovieIndexEntry = (
		card: HTMLElement,
		template: HTMLTemplateElement | null,
		initial: boolean,
	): MovieIndexEntry => {
		const poster = card.querySelector('[data-movie-poster]');
		const link = card.querySelector('a');

		return {
			element: initial ? card : null,
			template,
			initial,
			searchable: card.dataset.movieSearch ?? '',
			title: card.dataset.movieTitle ?? '',
			year: card.dataset.movieYear ?? '',
			url: card.dataset.movieUrl ?? (link instanceof HTMLAnchorElement ? link.href : ''),
			posterUrl:
				card.dataset.moviePosterUrl ??
				(poster instanceof HTMLImageElement ? poster.currentSrc || poster.src : ''),
			meta: card.dataset.movieMeta ?? '',
			cast: card.dataset.movieCast ?? '',
			entryType: 'movie',
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
			subgenres: new Set(
				(card.dataset.movieSubgenres ?? '')
					.split(',')
					.map((value) => value.trim())
					.filter(Boolean),
			),
			poster: initial && poster instanceof HTMLImageElement ? poster : null,
			linkPrepared: false,
		};
	};

	const movieIndex = [
		...cards.map((card) => createMovieIndexEntry(card, null, true)),
		...cardTemplates.flatMap((template): MovieIndexEntry[] => {
			const card = getTemplateCard(template);
			return card instanceof HTMLElement ? [createMovieIndexEntry(card, template, false)] : [];
		}),
	];
	const personIndex = people.flatMap((person): PersonIndexEntry[] => {
		const url = person.dataset.personUrl ?? '';
		const title = person.dataset.personTitle ?? '';

		if (!url || !title) {
			return [];
		}

		return [{
			searchable: person.dataset.personSearch ?? '',
			title,
			url,
			posterUrl: person.dataset.personPosterUrl ?? '',
			meta: person.dataset.personMeta ?? 'Perfil',
			ageLabel: person.dataset.personAge ?? '',
			nationalityLabel: person.dataset.personNationality ?? '',
			cast: person.dataset.personKnownFor ?? '',
			entryType: 'person',
		}];
	});
	const totalMovieCount = Number(searchResultsGrid?.dataset.movieTotalCount ?? movieIndex.length);

	let visibleMovieEntries = movieIndex.filter((entry) => entry.initial);
	let activeGenres: string[] = [];
	let activeEditorialFilters: string[] = [];
	let activeSubgenres: string[] = [];
	let activePlatforms: string[] = [];
	let lastAppliedQuery = '';
	let lastAppliedGenre = '';
	let lastAppliedEditorialFilters = '';
	let lastAppliedSubgenre = '';
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
	let currentSuggestions: SearchSuggestionEntry[] = [];

	const normalize = (value: string): string =>
		value
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.trim();

	const getChipValues = (chips: HTMLButtonElement[], dataKey: ChipDataKey): Set<string> =>
		new Set(chips.map((chip) => chip.dataset[dataKey]).filter((value): value is string => Boolean(value)));

	const primaryGenreIds = new Set(
		genreChips
			.filter((chip) => chip.dataset.homeGenreKind === 'genre')
			.map((chip) => chip.dataset.homeGenreId)
			.filter((value): value is string => Boolean(value)),
	);
	const editorialFilterIds = new Set(
		genreChips
			.filter((chip) => chip.dataset.homeGenreKind === 'editorial')
			.map((chip) => chip.dataset.homeGenreId)
			.filter((value): value is string => Boolean(value)),
	);
	const subgenreIds = getChipValues(subgenreChips, 'homeSubgenreId');
	const platformIds = getChipValues(platformChips, 'homePlatformId');
	const filterListFormatter = new Intl.ListFormat('es-AR', { style: 'long', type: 'disjunction' });
	const resultCountFormatter = new Intl.NumberFormat('es-AR');

	const formatFilterValues = (values: string[]): string =>
		filterListFormatter.format(values.filter(Boolean));

	const toggleFilterValue = (values: string[], value: string): void => {
		const currentIndex = values.indexOf(value);
		if (currentIndex >= 0) {
			values.splice(currentIndex, 1);
			return;
		}

		values.push(value);
	};

	const matchesAnyFilterValue = (activeValues: string[], entryValues: Set<string>): boolean =>
		activeValues.length === 0 || activeValues.some((value) => entryValues.has(value));

	const sanitizeFilterValues = (value: unknown, allowedValues: Set<string>): string[] => {
		const rawValues = Array.isArray(value) ? value : typeof value === 'string' ? [value] : [];
		return Array.from(
			new Set(
				rawValues
					.flatMap((rawValue) => String(rawValue).split(','))
					.map((rawValue) => rawValue.trim())
					.filter((rawValue) => allowedValues.has(rawValue)),
			),
		);
	};

	const readHomeStateFromUrl = (): HomeFilterState | null => {
		const params = new URLSearchParams(window.location.search);
		if (!homeUrlFilterKeys.some((key) => params.has(key))) {
			return null;
		}

		return {
			query: params.get('q')?.trim() ?? '',
			genres: sanitizeFilterValues(params.getAll('genero'), primaryGenreIds),
			editorialFilters: sanitizeFilterValues(params.getAll('filtro'), editorialFilterIds),
			subgenres: sanitizeFilterValues(params.getAll('subgenero'), subgenreIds),
			platforms: sanitizeFilterValues(params.getAll('plataforma'), platformIds),
		};
	};

	const updateHomeUrl = (mode: HistoryUpdateMode): void => {
		const url = new URL(window.location.href);
		const params = url.searchParams;

		for (const key of homeUrlFilterKeys) {
			params.delete(key);
		}

		const query = input.value.trim();
		if (query) params.set('q', query);
		if (activeGenres.length > 0) params.set('genero', activeGenres.join(','));
		if (activeEditorialFilters.length > 0) params.set('filtro', activeEditorialFilters.join(','));
		if (activeSubgenres.length > 0) params.set('subgenero', activeSubgenres.join(','));
		if (activePlatforms.length > 0) params.set('plataforma', activePlatforms.join(','));

		const nextUrl = `${url.pathname}${url.search}${url.hash}`;
		if (mode === 'push') {
			window.history.pushState({ homeFilters: true }, '', nextUrl);
		} else {
			window.history.replaceState({ homeFilters: true }, '', nextUrl);
		}
	};

	const shuffleEntries = <T>(entries: T[]): T[] => {
		const nextEntries = entries.slice();
		for (let index = nextEntries.length - 1; index > 0; index -= 1) {
			const swapIndex = Math.floor(Math.random() * (index + 1));
			[nextEntries[index], nextEntries[swapIndex]] = [nextEntries[swapIndex], nextEntries[index]];
		}
		return nextEntries;
	};

	const hasActiveCatalogQuery = (): boolean =>
		normalize(input.value).length > 0 ||
		activeGenres.length > 0 ||
		activeEditorialFilters.length > 0 ||
		activeSubgenres.length > 0 ||
		activePlatforms.length > 0;

	const getVisibleEntries = (): MovieIndexEntry[] => visibleMovieEntries;

	const getSuggestionMatches = (query: string, matchingMovies: MovieIndexEntry[]): SearchSuggestionEntry[] =>
		query.length === 0
			? []
			: [...personIndex.filter((entry) => entry.searchable.includes(query)), ...matchingMovies];

	const isDesktopSearchLayout = (): boolean => window.matchMedia('(min-width: 721px)').matches;

	const getScrollBehavior = (): ScrollBehavior =>
		window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

	const renderPeopleShowcase = (): void => {
		if (!(peopleShowcaseGrid instanceof HTMLElement) || personIndex.length === 0) {
			return;
		}

		const peopleIndexUrl = peopleShowcaseGrid.dataset.peopleIndexUrl ?? '/personas/';
		const showcaseEntries = shuffleEntries(personIndex).slice(0, Math.min(10, personIndex.length));
		const showcaseNodes = showcaseEntries.map((entry) => {
			const card = document.createElement('a');
			card.className = 'home-people-showcase__card';
			card.href = entry.url;

			const portrait = document.createElement('span');
			portrait.className = 'home-people-showcase__portrait';

			const image = document.createElement('img');
			image.className = 'home-people-showcase__image';
			image.src = entry.posterUrl;
			image.alt = `Retrato de ${entry.title}`;
			image.loading = 'lazy';
			image.decoding = 'async';
			image.width = 320;
			image.height = 400;
			image.referrerPolicy = 'no-referrer';
			portrait.append(image);

			const body = document.createElement('span');
			body.className = 'home-people-showcase__body';

			const title = document.createElement('span');
			title.className = 'home-people-showcase__name';
			title.textContent = entry.title;

			const meta = document.createElement('span');
			meta.className = 'home-people-showcase__meta';
			meta.textContent = entry.ageLabel || 'Edad no disponible';

			const nationality = document.createElement('span');
			nationality.className = 'home-people-showcase__nationality';
			nationality.textContent = entry.nationalityLabel || 'Nacionalidad no disponible';

			body.append(title, meta, nationality);

			card.append(portrait, body);
			card.addEventListener('click', (event) => {
				if (!isPlainLeftClick(event)) return;
				prepareResetOnReturn();
			});
			return card;
		});

		const databaseCard = document.createElement('a');
		databaseCard.className = 'home-people-showcase__card home-people-showcase__card--cta';
		databaseCard.href = peopleIndexUrl;
		databaseCard.setAttribute('aria-label', 'Explorar la base de datos de actrices y actores');

		const databaseMedia = document.createElement('span');
		databaseMedia.className = 'home-people-showcase__portrait home-people-showcase__portrait--cta';
		databaseMedia.append(createDatabaseGraphic());

		const databaseTag = document.createElement('span');
		databaseTag.className = 'home-people-showcase__cta-tag';
		databaseTag.textContent = 'Base de datos';

		const databaseCount = document.createElement('strong');
		databaseCount.className = 'home-people-showcase__cta-count';
		databaseCount.textContent = `${personIndex.length}+`;

		const databaseCaption = document.createElement('span');
		databaseCaption.className = 'home-people-showcase__cta-caption';
		databaseCaption.textContent = 'perfiles conectados';

		databaseMedia.append(databaseTag, databaseCount, databaseCaption);

		const databaseBody = document.createElement('span');
		databaseBody.className = 'home-people-showcase__body home-people-showcase__body--cta';

		const databaseTitle = document.createElement('span');
		databaseTitle.className = 'home-people-showcase__name';
		databaseTitle.textContent = 'Actrices y actores';

		const databaseMeta = document.createElement('span');
		databaseMeta.className = 'home-people-showcase__meta';
		databaseMeta.textContent = 'Bio, premios y filmografía';

		const databaseButton = document.createElement('span');
		databaseButton.className = 'home-people-showcase__cta-button';
		databaseButton.textContent = 'Entrar a personas';

		databaseBody.append(databaseTitle, databaseMeta, databaseButton);
		databaseCard.append(databaseMedia, databaseBody);
		databaseCard.addEventListener('click', (event) => {
			if (!isPlainLeftClick(event)) return;
			prepareResetOnReturn();
		});

		peopleShowcaseGrid.replaceChildren(...showcaseNodes, databaseCard);
	};

	const isPlainLeftClick = (event: MouseEvent): boolean =>
		event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

	const createDatabaseGraphic = (): HTMLElement => {
		const graphic = document.createElement('span');
		graphic.className = 'home-people-showcase__cta-graphic';
		graphic.setAttribute('aria-hidden', 'true');
		const image = document.createElement('img');
		image.className = 'home-people-showcase__cta-graphic-image';
		image.src = '/images/home/cineposta-personaje-patada-base-datos.webp';
		image.alt = '';
		image.width = 1536;
		image.height = 1024;
		image.decoding = 'async';
		graphic.append(image);
		return graphic;
	};

	const getChipLabel = (
		chips: HTMLButtonElement[],
		dataKey: ChipDataKey,
		activeValue: string,
	): string => {
		if (!activeValue) return '';

		const activeChip = chips.find((chip) => chip.dataset[dataKey] === activeValue);
		if (!(activeChip instanceof HTMLElement)) {
			return activeValue;
		}

		return (
			activeChip.dataset.homePlatformLabel ??
			activeChip.dataset.homePositiveVerdictLabel ??
			activeChip.textContent?.trim() ??
			activeValue
		);
	};

	const getChipLabels = (
		chips: HTMLButtonElement[],
		dataKey: ChipDataKey,
		values: string[],
	): string[] => values.map((value) => getChipLabel(chips, dataKey, value)).filter(Boolean);

	const getFilterSummaryPart = (
		prefix: string,
		chips: HTMLButtonElement[],
		dataKey: ChipDataKey,
		values: string[],
	): string | null => {
		const labels = getChipLabels(chips, dataKey, values);
		return labels.length > 0 ? `${prefix} ${formatFilterValues(labels)}` : null;
	};

	const getActiveFilterEntries = (): Array<{ group: string; value: string; label: string }> => [
		...activeGenres.map((value) => ({
			group: 'genre',
			value,
			label: `Género: ${getChipLabel(genreChips, 'homeGenreId', value)}`,
		})),
		...activeEditorialFilters.map((value) => ({
			group: 'editorial',
			value,
			label: `Filtro: ${getChipLabel(genreChips, 'homeGenreId', value)}`,
		})),
		...activeSubgenres.map((value) => ({
			group: 'subgenre',
			value,
			label: `Subgénero: ${getChipLabel(subgenreChips, 'homeSubgenreId', value)}`,
		})),
		...activePlatforms.map((value) => ({
			group: 'platform',
			value,
			label: `Plataforma: ${getChipLabel(platformChips, 'homePlatformId', value)}`,
		})),
		...(input.value.trim()
			? [{ group: 'query', value: input.value.trim(), label: `Búsqueda: “${input.value.trim()}”` }]
			: []),
	];

	const renderActiveFilters = (): void => {
		if (!(activeFiltersShell instanceof HTMLElement) || !(activeFiltersList instanceof HTMLElement)) return;

		const activeFilters = getActiveFilterEntries();
		activeFiltersList.replaceChildren();

		for (const entry of activeFilters) {
			const button = document.createElement('button');
			button.type = 'button';
			button.className = 'home-results-tools__active-pill';
			button.dataset.homeRemoveFilter = entry.group;
			button.dataset.homeRemoveFilterValue = entry.value;
			button.setAttribute('aria-label', `Quitar ${entry.label}`);

			const label = document.createElement('span');
			label.textContent = entry.label;
			const close = document.createElement('span');
			close.textContent = '×';
			close.setAttribute('aria-hidden', 'true');
			button.append(label, close);
			activeFiltersList.appendChild(button);
		}

		activeFiltersShell.hidden = activeFilters.length === 0;
		if (filterResetButton instanceof HTMLButtonElement) {
			filterResetButton.hidden = activeFilters.length === 0;
		}
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

	const prepareCardLink = (entry: MovieIndexEntry): void => {
		if (entry.linkPrepared || !(entry.element instanceof HTMLElement)) return;

		const link = entry.element.querySelector('a');
		if (!(link instanceof HTMLAnchorElement)) return;

		link.addEventListener('click', (event) => {
			if (!isPlainLeftClick(event)) return;
			persistHomeState();
		});
		entry.linkPrepared = true;
	};

	const ensureCardElement = (entry: MovieIndexEntry): HTMLElement | null => {
		if (entry.element instanceof HTMLElement) {
			prepareCardLink(entry);
			return entry.element;
		}

		if (!(entry.template instanceof HTMLTemplateElement)) {
			return null;
		}

		const card = entry.template.content.firstElementChild?.cloneNode(true);
		if (!(card instanceof HTMLElement)) {
			return null;
		}

		entry.element = card;
		const poster = card.querySelector('[data-movie-poster]');
		entry.poster = poster instanceof HTMLImageElement ? poster : null;
		prepareCardLink(entry);
		return card;
	};

	const renderMovieGrid = (entries: MovieIndexEntry[]): void => {
		if (!(searchResultsGrid instanceof HTMLElement)) {
			visibleMovieEntries = entries;
			return;
		}

		const elements = entries
			.map((entry) => ensureCardElement(entry))
			.filter((element): element is HTMLElement => element instanceof HTMLElement);

		for (const element of elements) {
			element.hidden = false;
		}

		searchResultsGrid.replaceChildren(...elements);
		visibleMovieEntries = entries.filter((entry) => entry.element instanceof HTMLElement);
	};

	const updateClearButtonVisibility = (): void => {
		const shouldShow = hasActiveCatalogQuery();
		if (clearButton instanceof HTMLButtonElement) {
			clearButton.hidden = !shouldShow;
			clearButton.setAttribute(
				'aria-label',
				input.value.trim().length > 0 &&
					activeGenres.length === 0 &&
					activeEditorialFilters.length === 0 &&
					activeSubgenres.length === 0 &&
					activePlatforms.length === 0
					? 'Borrar búsqueda'
					: 'Limpiar filtros y búsqueda',
			);
		}
	};

	const updateResultCounter = (visibleCount: number): void => {
		if (
			!(resultCounter instanceof HTMLElement) ||
			!(resultCount instanceof HTMLElement) ||
			!(resultCountLabel instanceof HTMLElement)
		) return;

		const isFiltered = hasActiveCatalogQuery();
		const displayedCount = isFiltered ? visibleCount : totalMovieCount;
		const displayedLabel = isFiltered
			? `resultado${displayedCount === 1 ? '' : 's'}`
			: 'películas en catálogo';

		resultCount.textContent = resultCountFormatter.format(displayedCount);
		resultCountLabel.textContent = displayedLabel;
		resultCounter.setAttribute('aria-label', `${resultCountFormatter.format(displayedCount)} ${displayedLabel}`);
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

	const getSuggestionScore = (entry: SearchSuggestionEntry, query: string): number => {
		const normalizedTitle = normalize(entry.title);
		const normalizedMeta = normalize(`${entry.meta} ${entry.cast}`);
		let score = 300;

		if (entry.entryType === 'person') score -= 35;
		if (normalizedTitle === query) score -= 260;
		if (normalizedTitle.startsWith(query)) score -= 180;
		else if (normalizedTitle.includes(query)) score -= 120;
		else if (entry.searchable.startsWith(query)) score -= 90;
		else if (entry.searchable.includes(query)) score -= 40;

		if (entry.entryType === 'movie' && entry.year === query) score -= 35;
		if (normalizedMeta.includes(query)) score -= 20;

		return score;
	};

	const renderSuggestions = (query: string, matchingEntries: SearchSuggestionEntry[]): void => {
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

			if (entry.entryType === 'person') {
				const tag = document.createElement('span');
				tag.className = 'movie-search__suggestion-tag';
				tag.textContent = 'Persona';
				body.append(tag);
			}

			link.append(poster, body);
			return link;
		});

		suggestionsList.replaceChildren(...suggestionNodes);
		suggestionsBox.hidden = false;
	};

	const updateSummary = (visibleCount: number): void => {
		renderActiveFilters();
		updateClearButtonVisibility();
		updateResultCounter(visibleCount);
		if (summaries.length === 0) return;

		const query = normalize(input.value);
		const hasQuery = query.length > 0;
		const hasGenre = activeGenres.length > 0;
		const hasEditorialFilter = activeEditorialFilters.length > 0;
		const hasSubgenre = activeSubgenres.length > 0;
		const hasPlatform = activePlatforms.length > 0;

		if (!hasQuery && !hasGenre && !hasEditorialFilter && !hasSubgenre && !hasPlatform) {
			for (const summary of summaries) {
				summary.textContent = `${visibleCount} títulos recientes visibles de ${totalMovieCount} publicados.`;
			}
			return;
		}

		const parts: string[] = [];
		if (hasGenre) {
			const genreSummaryPart = getFilterSummaryPart(
				activeGenres.length === 1 ? 'género' : 'géneros',
				genreChips,
				'homeGenreId',
				activeGenres,
			);
			if (genreSummaryPart) parts.push(genreSummaryPart);
		}
		if (hasEditorialFilter) {
			const editorialSummaryPart = getFilterSummaryPart(
				activeEditorialFilters.length === 1 ? 'filtro' : 'filtros',
				genreChips,
				'homeGenreId',
				activeEditorialFilters,
			);
			if (editorialSummaryPart) parts.push(editorialSummaryPart);
		}
		if (hasSubgenre) {
			const subgenreSummaryPart = getFilterSummaryPart(
				activeSubgenres.length === 1 ? 'subgénero' : 'subgéneros',
				subgenreChips,
				'homeSubgenreId',
				activeSubgenres,
			);
			if (subgenreSummaryPart) parts.push(subgenreSummaryPart);
		}
		if (hasPlatform) {
			const platformSummaryPart = getFilterSummaryPart(
				activePlatforms.length === 1 ? 'plataforma' : 'plataformas',
				platformChips,
				'homePlatformId',
				activePlatforms,
			);
			if (platformSummaryPart) parts.push(platformSummaryPart);
		}
		if (hasQuery) {
			parts.push(`búsqueda "${input.value.trim()}"`);
		}

		for (const summary of summaries) {
			summary.textContent = `${visibleCount} resultado${visibleCount === 1 ? '' : 's'} para ${parts.join(' + ')}.`;
		}
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
				genres: [...activeGenres],
				editorialFilters: [...activeEditorialFilters],
				subgenres: [...activeSubgenres],
				platforms: [...activePlatforms],
				scrollY: Math.max(0, Math.round(window.scrollY)),
				ts: Date.now(),
			};

			sessionStorage.setItem(homeStateKey, JSON.stringify(payload));
		} catch {
			// Ignore storage errors.
		}
	};

	const runFilter = (force = false): number => {
		const query = normalize(input.value);
		const genreKey = activeGenres.join('|');
		const editorialFilterKey = activeEditorialFilters.join('|');
		const subgenreKey = activeSubgenres.join('|');
		const platformKey = activePlatforms.join('|');

		updateClearButtonVisibility();

		if (
			!force &&
			query === lastAppliedQuery &&
			genreKey === lastAppliedGenre &&
			editorialFilterKey === lastAppliedEditorialFilters &&
			subgenreKey === lastAppliedSubgenre &&
			platformKey === lastAppliedPlatform
		) {
			const visibleCount = getVisibleEntries().length;
			renderSuggestions(query, getSuggestionMatches(query, getVisibleEntries()));
			updateSummary(visibleCount);
			return visibleCount;
		}

		lastAppliedQuery = query;
		lastAppliedGenre = genreKey;
		lastAppliedEditorialFilters = editorialFilterKey;
		lastAppliedSubgenre = subgenreKey;
		lastAppliedPlatform = platformKey;

		const matchingEntries: MovieIndexEntry[] = [];
		const shouldShowFullCatalogMatches = hasActiveCatalogQuery();

		for (const entry of movieIndex) {
			if (!shouldShowFullCatalogMatches) {
				if (entry.initial) {
					matchingEntries.push(entry);
				}
				continue;
			}

			const genreMatch = matchesAnyFilterValue(activeGenres, entry.genres);
			const editorialFilterMatch = matchesAnyFilterValue(activeEditorialFilters, entry.genres);
			const subgenreMatch = matchesAnyFilterValue(activeSubgenres, entry.subgenres);
			const platformMatch = matchesAnyFilterValue(activePlatforms, entry.platforms);
			const queryMatch = query.length === 0 || entry.searchable.includes(query);
			const show = genreMatch && editorialFilterMatch && subgenreMatch && platformMatch && queryMatch;

			if (show) {
				matchingEntries.push(entry);
			}
		}

		renderMovieGrid(matchingEntries);
		const visibleCount = matchingEntries.length;

		if (emptyState instanceof HTMLElement) {
			emptyState.hidden = visibleCount > 0 || !shouldShowFullCatalogMatches;
		}

		renderSuggestions(query, getSuggestionMatches(query, matchingEntries));
		updateSummary(visibleCount);
		return visibleCount;
	};

	const applyGenreUI = (): void => {
		for (const chip of genreChips) {
			const chipGenre = chip.dataset.homeGenreId;
			const activeValues = chip.dataset.homeGenreKind === 'editorial' ? activeEditorialFilters : activeGenres;
			const isActive = Boolean(chipGenre && activeValues.includes(chipGenre));
			chip.classList.toggle('is-active', isActive);
			chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
		}
	};

	const applySubgenreUI = (): void => {
		for (const chip of subgenreChips) {
			const chipSubgenre = chip.dataset.homeSubgenreId;
			const isActive = Boolean(chipSubgenre && activeSubgenres.includes(chipSubgenre));
			chip.classList.toggle('is-active', isActive);
			chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
		}
	};

	const applyPlatformUI = (): void => {
		for (const chip of platformChips) {
			const chipPlatform = chip.dataset.homePlatformId;
			const isActive = Boolean(chipPlatform && activePlatforms.includes(chipPlatform));
			chip.classList.toggle('is-active', isActive);
			chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
		}
	};

	const resetCatalog = (mode: StatusMode = 'catalog', historyMode: HistoryUpdateMode = 'replace'): number => {
		activeGenres = [];
		activeEditorialFilters = [];
		activeSubgenres = [];
		activePlatforms = [];
		input.value = '';
		hideSuggestions();
		applyGenreUI();
		applySubgenreUI();
		applyPlatformUI();
		updateHomeUrl(historyMode);
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
				updateHomeUrl('replace');
				persistHomeState();
				syncStatusWithVisiblePosters('search', visibleCount);
			});
		}, 120);
	};

	const scrollToVisibleSearchResults = (): void => {
		if (!isDesktopSearchLayout()) return;

		const firstVisibleResult = getVisibleEntries()[0]?.element;
		const scrollTarget = firstVisibleResult ?? searchResultsGrid;
		if (!(scrollTarget instanceof HTMLElement)) return;

		window.requestAnimationFrame(() => {
			const targetTop = Math.max(0, scrollTarget.getBoundingClientRect().top + window.scrollY - 16);
			window.scrollTo({
				top: targetTop,
				left: 0,
				behavior: getScrollBehavior(),
			});
		});
	};

	const confirmDesktopSearch = (): void => {
		if (!isDesktopSearchLayout() || input.value.trim().length === 0) return;

		window.clearTimeout(filterTimer);
		window.cancelAnimationFrame(filterFrame);

		const visibleCount = runFilter(true);
		updateHomeUrl('replace');
		persistHomeState();
		syncStatusWithVisiblePosters('search', visibleCount);
		hideSuggestions();

		if (visibleCount > 0) {
			scrollToVisibleSearchResults();
		}
	};

	const applyHomeFilterState = (state: HomeFilterState): void => {
		input.value = state.query;
		activeGenres = sanitizeFilterValues(state.genres, primaryGenreIds);
		activeEditorialFilters = sanitizeFilterValues(state.editorialFilters, editorialFilterIds);
		activeSubgenres = sanitizeFilterValues(state.subgenres, subgenreIds);
		activePlatforms = sanitizeFilterValues(state.platforms, platformIds);
		applyGenreUI();
		applySubgenreUI();
		applyPlatformUI();
		updateClearButtonVisibility();
		lastAppliedQuery = '';
		lastAppliedGenre = '';
		lastAppliedEditorialFilters = '';
		lastAppliedSubgenre = '';
		lastAppliedPlatform = '';
	};

	const getCurrentFilterMode = (): StatusMode => (hasActiveCatalogQuery() ? 'search' : 'catalog');

	const renderCurrentHomeState = (): void => {
		const mode = getCurrentFilterMode();
		const visibleCount = runFilter(true);
		syncStatusWithVisiblePosters(mode, visibleCount);
	};

	const restoreUrlHomeState = (): void => {
		const urlState = readHomeStateFromUrl();
		applyHomeFilterState(urlState ?? {
			query: '',
			genres: [],
			editorialFilters: [],
			subgenres: [],
			platforms: [],
		});
		if (urlState) {
			updateHomeUrl('replace');
		}
		renderCurrentHomeState();
	};

	const restoreHomeState = (): void => {
		const urlState = readHomeStateFromUrl();
		if (urlState) {
			applyHomeFilterState(urlState);
			updateHomeUrl('replace');
			renderCurrentHomeState();
			return;
		}

		let parsed: StoredHomeState | null = null;

		try {
			const raw = sessionStorage.getItem(homeStateKey);
			if (raw) {
				parsed = JSON.parse(raw) as StoredHomeState;
			}
		} catch {
			parsed = null;
		}

		if (!parsed || typeof parsed !== 'object') {
			renderCurrentHomeState();
			return;
		}

		const ageMs = Date.now() - Number(parsed.ts ?? 0);
		if (!Number.isFinite(ageMs) || ageMs > 1000 * 60 * 30) {
			removeStoredHomeState();
			renderCurrentHomeState();
			return;
		}

		applyHomeFilterState({
			query: typeof parsed.query === 'string' ? parsed.query : '',
			genres: sanitizeFilterValues(parsed.genres ?? parsed.genre, primaryGenreIds),
			editorialFilters: sanitizeFilterValues(parsed.editorialFilters, editorialFilterIds),
			subgenres: sanitizeFilterValues(parsed.subgenres ?? parsed.subgenre, subgenreIds),
			platforms: sanitizeFilterValues(parsed.platforms ?? parsed.platform, platformIds),
		});
		updateHomeUrl('replace');
		renderCurrentHomeState();

		const savedScrollY = Number(parsed.scrollY);
		if (Number.isFinite(savedScrollY) && savedScrollY > 0) {
			window.requestAnimationFrame(() => {
				window.scrollTo(0, savedScrollY);
			});
		}

		removeStoredHomeState();
	};

	const applyFilterChange = (): void => {
		applyGenreUI();
		applySubgenreUI();
		applyPlatformUI();
		showStatus(searchLoadingPhrases);
		updateHomeUrl('push');
		const visibleCount = runFilter(true);
		syncStatusWithVisiblePosters('search', visibleCount);
		persistHomeState();
	};

	for (const chip of genreChips) {
		chip.addEventListener('click', () => {
			const nextGenre = chip.dataset.homeGenreId;
			if (!nextGenre) return;
			const targetValues = chip.dataset.homeGenreKind === 'editorial' ? activeEditorialFilters : activeGenres;
			toggleFilterValue(targetValues, nextGenre);
			applyFilterChange();
		});
	}

	for (const chip of subgenreChips) {
		chip.addEventListener('click', () => {
			const nextSubgenre = chip.dataset.homeSubgenreId;
			if (!nextSubgenre) return;
			toggleFilterValue(activeSubgenres, nextSubgenre);
			applyFilterChange();
		});
	}

	for (const chip of platformChips) {
		chip.addEventListener('click', () => {
			const nextPlatform = chip.dataset.homePlatformId;
			if (!nextPlatform) return;
			toggleFilterValue(activePlatforms, nextPlatform);
			applyFilterChange();
		});
	}

	activeFiltersList?.addEventListener('click', (event) => {
		const target = event.target;
		const removeButton = target instanceof Element
			? target.closest<HTMLButtonElement>('[data-home-remove-filter]')
			: null;
		if (!(removeButton instanceof HTMLButtonElement)) return;

		const group = removeButton.dataset.homeRemoveFilter;
		const value = removeButton.dataset.homeRemoveFilterValue ?? '';
		if (group === 'query') {
			input.value = '';
		} else if (group === 'genre') {
			activeGenres = activeGenres.filter((item) => item !== value);
		} else if (group === 'editorial') {
			activeEditorialFilters = activeEditorialFilters.filter((item) => item !== value);
		} else if (group === 'subgenre') {
			activeSubgenres = activeSubgenres.filter((item) => item !== value);
		} else if (group === 'platform') {
			activePlatforms = activePlatforms.filter((item) => item !== value);
		} else {
			return;
		}

		applyFilterChange();
	});

	applyGenreUI();
	applySubgenreUI();
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
		if (
			event.key === 'Enter' &&
			activeSuggestionIndex < 0 &&
			input.value.trim().length > 0 &&
			isDesktopSearchLayout()
		) {
			event.preventDefault();
			confirmDesktopSearch();
			return;
		}

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

		if (event.key === 'Enter') {
			if (activeSuggestionIndex >= 0) {
				event.preventDefault();
				if (currentSuggestions[activeSuggestionIndex]?.entryType === 'movie') {
					persistHomeState();
				} else {
					prepareResetOnReturn();
				}
				window.location.href = currentSuggestions[activeSuggestionIndex].url;
				return;
			}

			const query = normalize(input.value);
			const firstSuggestion = currentSuggestions[0];
			if (
				firstSuggestion?.entryType === 'person' &&
				normalize(firstSuggestion.title) === query
			) {
				event.preventDefault();
				prepareResetOnReturn();
				window.location.href = firstSuggestion.url;
			}
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

			const suggestionIndex = Number(suggestion.dataset.suggestionIndex ?? '-1');
			if (currentSuggestions[suggestionIndex]?.entryType === 'movie') {
				persistHomeState();
			} else {
				prepareResetOnReturn();
			}
		});
	}

	clearButton?.addEventListener('click', () => {
		showStatus(catalogLoadingPhrases);
		resetCatalog('catalog', 'push');
		input.focus();
	});

	filterResetButton?.addEventListener('click', () => {
		resetCatalog('catalog', 'push');
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

	window.addEventListener('popstate', () => {
		restoreUrlHomeState();
	});

	showStatus(catalogLoadingPhrases);
	renderPeopleShowcase();
	restoreHomeState();
}
