/**
 * Astro 6 client entrypoint.
 * Keep browser-only logic in `src/scripts/*.ts` and reference it from `.astro`
 * with `<script src="../scripts/file.ts"></script>` so Astro can bundle,
 * deduplicate, and typecheck it.
 */

type StatusMode = 'catalog' | 'search';
type ReturnBehavior = 'reset';
type ChipDataKey = 'homeGenreId' | 'homeSubgenreId' | 'homePlatformId';

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

type HomeState = {
	query: string;
	genre: string | null;
	subgenre: string | null;
	platform: string | null;
	scrollY: number;
	ts: number;
};

const homeStateKey = 'cineposta:home-list-state:v4';
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
	let activeGenre: string | null = null;
	let activeSubgenre: string | null = null;
	let activePlatform: string | null = null;
	let lastAppliedQuery = '';
	let lastAppliedGenre = '';
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
		Boolean(activeGenre) ||
		Boolean(activeSubgenre) ||
		Boolean(activePlatform);

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
		graphic.innerHTML = `
			<svg class="home-people-showcase__cta-graphic-svg" viewBox="0 0 160 124" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<linearGradient id="homePeopleRack" x1="8" y1="0" x2="104" y2="0" gradientUnits="userSpaceOnUse">
						<stop offset="0" stop-color="#6cb1ff" />
						<stop offset="1" stop-color="#4f86f8" />
					</linearGradient>
					<linearGradient id="homePeopleDisk" x1="82" y1="26" x2="151" y2="106" gradientUnits="userSpaceOnUse">
						<stop offset="0" stop-color="#ffe78f" />
						<stop offset="0.55" stop-color="#ffd44d" />
						<stop offset="1" stop-color="#f5b800" />
					</linearGradient>
				</defs>
				<g stroke="#070b12" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
					<rect x="8" y="10" width="98" height="24" rx="9" fill="url(#homePeopleRack)" />
					<rect x="8" y="40" width="98" height="24" rx="9" fill="url(#homePeopleRack)" />
					<rect x="8" y="70" width="98" height="24" rx="9" fill="url(#homePeopleRack)" />
					<ellipse cx="118" cy="44" rx="34" ry="12" fill="#ffd54d" />
					<path d="M84 44v42c0 6.6 15.2 12 34 12s34-5.4 34-12V44" fill="url(#homePeopleDisk)" />
					<path d="M84 65c0 6.6 15.2 12 34 12s34-5.4 34-12" fill="none" />
					<path d="M84 86c0 6.6 15.2 12 34 12s34-5.4 34-12" fill="none" />
					<path d="M44 18h38" />
					<path d="M44 48h38" />
					<path d="M44 78h38" />
				</g>
				<g fill="#070b12">
					<rect x="95" y="55" width="6" height="6" rx="1.5" />
					<rect x="95" y="76" width="6" height="6" rx="1.5" />
					<rect x="95" y="97" width="6" height="6" rx="1.5" />
				</g>
				<g>
					<circle class="home-people-showcase__cta-led home-people-showcase__cta-led--1" cx="22" cy="22" r="4.5" fill="#ff8d6d" />
					<circle class="home-people-showcase__cta-led home-people-showcase__cta-led--2" cx="36" cy="22" r="4.5" fill="#21d5d2" />
					<circle class="home-people-showcase__cta-led home-people-showcase__cta-led--3" cx="22" cy="52" r="4.5" fill="#ff8d6d" />
					<circle class="home-people-showcase__cta-led home-people-showcase__cta-led--4" cx="36" cy="52" r="4.5" fill="#21d5d2" />
					<circle class="home-people-showcase__cta-led home-people-showcase__cta-led--5" cx="22" cy="82" r="4.5" fill="#ff8d6d" />
					<circle class="home-people-showcase__cta-led home-people-showcase__cta-led--6" cx="36" cy="82" r="4.5" fill="#21d5d2" />
				</g>
			</svg>
		`;
		return graphic;
	};

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

		return (
			activeChip.dataset.homePlatformLabel ??
			activeChip.dataset.homePositiveVerdictLabel ??
			activeChip.textContent?.trim() ??
			activeValue
		);
	};

	const getGenreSummaryPart = (): string | null => {
		if (!activeGenre) return null;

		const activeChip = genreChips.find((chip) => chip.dataset.homeGenreId === activeGenre);
		const label = getChipLabel(genreChips, 'homeGenreId', activeGenre);

		if (activeChip?.dataset.homeGenreKind === 'editorial') {
			return `filtro ${label}`;
		}

		return `género ${label}`;
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
			prepareResetOnReturn();
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
		if (!(clearButton instanceof HTMLButtonElement)) return;

		const shouldShow =
			input.value.trim().length > 0 ||
			Boolean(activeGenre) ||
			Boolean(activeSubgenre) ||
			Boolean(activePlatform);
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
		if (summaries.length === 0) return;

		const query = normalize(input.value);
		const hasQuery = query.length > 0;
		const hasGenre = Boolean(activeGenre);
		const hasSubgenre = Boolean(activeSubgenre);
		const hasPlatform = Boolean(activePlatform);

		if (!hasQuery && !hasGenre && !hasSubgenre && !hasPlatform) {
			for (const summary of summaries) {
				summary.textContent = `${visibleCount} títulos recientes visibles de ${totalMovieCount} publicados.`;
			}
			return;
		}

		const parts: string[] = [];
		if (hasGenre) {
			const genreSummaryPart = getGenreSummaryPart();
			if (genreSummaryPart) {
				parts.push(genreSummaryPart);
			}
		}
		if (hasSubgenre) {
			parts.push(`subgénero ${getChipLabel(subgenreChips, 'homeSubgenreId', activeSubgenre)}`);
		}
		if (hasPlatform) {
			parts.push(`plataforma ${getChipLabel(platformChips, 'homePlatformId', activePlatform)}`);
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
				genre: activeGenre,
				subgenre: activeSubgenre,
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

	const toggleSubgenre = (subgenreId: string | null): string | null => {
		activeSubgenre = activeSubgenre === subgenreId ? null : subgenreId;
		updateClearButtonVisibility();
		return activeSubgenre;
	};

	const togglePlatform = (platformId: string | null): string | null => {
		activePlatform = activePlatform === platformId ? null : platformId;
		updateClearButtonVisibility();
		return activePlatform;
	};

	const runFilter = (force = false): number => {
		const query = normalize(input.value);
		const genreKey = activeGenre ?? '';
		const subgenreKey = activeSubgenre ?? '';
		const platformKey = activePlatform ?? '';

		updateClearButtonVisibility();

		if (
			!force &&
			query === lastAppliedQuery &&
			genreKey === lastAppliedGenre &&
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

			const genreMatch = !activeGenre || entry.genres.has(activeGenre);
			const subgenreMatch = !activeSubgenre || entry.subgenres.has(activeSubgenre);
			const platformMatch = !activePlatform || entry.platforms.has(activePlatform);
			const queryMatch = query.length === 0 || entry.searchable.includes(query);
			const show = genreMatch && subgenreMatch && platformMatch && queryMatch;

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
			const isActive = Boolean(chipGenre && chipGenre === activeGenre);
			chip.classList.toggle('is-active', isActive);
			chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
		}
	};

	const applySubgenreUI = (): void => {
		for (const chip of subgenreChips) {
			const chipSubgenre = chip.dataset.homeSubgenreId;
			const isActive = Boolean(chipSubgenre && chipSubgenre === activeSubgenre);
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
		activeSubgenre = null;
		activePlatform = null;
		input.value = '';
		hideSuggestions();
		applyGenreUI();
		applySubgenreUI();
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
		persistHomeState();
		syncStatusWithVisiblePosters('search', visibleCount);
		hideSuggestions();

		if (visibleCount > 0) {
			scrollToVisibleSearchResults();
		}
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
		if (typeof parsed.subgenre === 'string' && parsed.subgenre.length > 0) {
			activeSubgenre = parsed.subgenre;
		}
		if (typeof parsed.platform === 'string' && parsed.platform.length > 0) {
			activePlatform = parsed.platform;
		}

		applyGenreUI();
		applySubgenreUI();
		applyPlatformUI();
		updateClearButtonVisibility();

		lastAppliedQuery = '';
		lastAppliedGenre = '';
		lastAppliedSubgenre = '';
		lastAppliedPlatform = '';

		const mode: StatusMode =
			((typeof parsed.query === 'string' && parsed.query.trim().length > 0) ||
				Boolean(activeGenre) ||
				Boolean(activeSubgenre) ||
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

	for (const chip of subgenreChips) {
		chip.addEventListener('click', () => {
			const nextSubgenre = chip.dataset.homeSubgenreId ?? null;
			const isResetInteraction = activeSubgenre === nextSubgenre;
			toggleSubgenre(nextSubgenre);
			if (isResetInteraction) {
				input.value = '';
			}
			applySubgenreUI();
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
				prepareResetOnReturn();
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
	renderPeopleShowcase();
	restoreHomeState();
}
