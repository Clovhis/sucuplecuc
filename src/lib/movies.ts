import type { Movie, MovieVerdict } from '../types/movie';

const movieModules = import.meta.glob('../data/movies/*.json', { eager: true }) as Record<
	string,
	{ default: Movie }
>;

const VERDICT_LABELS: Record<MovieVerdict, string> = {
	recomendada: 'Recomendada',
	zafa: 'Zafa',
	no_recomendada: 'Malisima',
	basura_atomica: 'Basura atomica',
};

export type RecommendationGenreId =
	| 'accion'
	| 'comedia'
	| 'documental'
	| 'terror'
	| 'drama'
	| 'thriller'
	| 'sci-fi'
	| 'superheroes'
	| 'animacion'
	| 'anime'
	| 'romance'
	| 'crimen'
	| 'aventura'
	| 'oscar-mejor-pelicula'
	| 'pelicula-nacional';

export interface RecommendationGenreOption {
	id: RecommendationGenreId;
	label: string;
}

export interface MovieLinkRecommendation {
	slug: string;
	title: string;
	year: number;
	url: string;
}

export interface MovieRuntimeSummary {
	minutes: number;
	formatted: string;
	comment: string;
}

export interface MovieEditorialSummary {
	runtime?: MovieRuntimeSummary;
	bridge: MovieLinkRecommendation[];
	related: MovieLinkRecommendation[];
}

export const RECOMMENDATION_GENRE_OPTIONS: RecommendationGenreOption[] = [
	{ id: 'accion', label: 'Acción' },
	{ id: 'comedia', label: 'Comedia' },
	{ id: 'documental', label: 'Documentales' },
	{ id: 'terror', label: 'Terror' },
	{ id: 'drama', label: 'Drama' },
	{ id: 'thriller', label: 'Thriller' },
	{ id: 'sci-fi', label: 'Sci-Fi' },
	{ id: 'superheroes', label: 'Superheroes' },
	{ id: 'animacion', label: 'Animación' },
	{ id: 'anime', label: 'Anime' },
	{ id: 'romance', label: 'Romance' },
	{ id: 'crimen', label: 'Crimen' },
	{ id: 'aventura', label: 'Aventura' },
	{ id: 'oscar-mejor-pelicula', label: 'Ganadoras del Oscar' },
	{ id: 'pelicula-nacional', label: 'Cine nacional' },
];

const MAX_VERDICT_LABEL_LENGTH = 21;
const MAX_SYNOPSIS_LENGTH = 320;
const AUDIENCE_RATING_PATTERN = /^(ATP|\+\d{1,2})$/;
const REVIEWISH_SYNOPSIS_PATTERNS = [
	/\bfunciona mejor\b/i,
	/\bse deja ver\b/i,
	/\bnunca termina de\b/i,
	/\bqueda m[aá]s cerca\b/i,
	/\bentra del lado\b/i,
	/\bpara verla\b/i,
	/\bpelicul[oó]n\b/i,
	/\bemociona\b/i,
	/\bmuy bien llevada\b/i,
	/\bde principio a fin\b/i,
	/\bte deja pensando\b/i,
	/\bsi te pega\b/i,
	/\bsuper recomendada\b/i,
	/\bmuy buena\b/i,
	/\bla cr[ií]tica\b/i,
	/\breseñ(?:as|a)\b/i,
	/\brecepci[oó]n\b/i,
];

const TITLE_TOKEN_STOP_WORDS = new Set([
	'a',
	'al',
	'and',
	'chapter',
	'de',
	'del',
	'el',
	'la',
	'las',
	'los',
	'movie',
	'of',
	'part',
	'the',
	'un',
	'una',
	'vol',
	'y',
]);

const BRIDGE_ANCHOR_POOLS: Partial<Record<RecommendationGenreId, string[]>> = {
	accion: [
		'john-wick-chapter-4-2023',
		'top-gun-maverick-2022',
		'mission-impossible-dead-reckoning-part-one-2023',
		'furiosa-a-mad-max-saga-2024',
	],
	comedia: ['the-holdovers-2023', 'hit-man-2024', 'barbie-2023', 'esperando-la-carroza-1985'],
	terror: [
		'cuando-acecha-la-maldad-2023',
		'longlegs-2024',
		'the-substance-2024',
		'smile-2-2024',
	],
	drama: ['oppenheimer-2023', 'parasite-2019', 'the-zone-of-interest-2023', 'moonlight-2016'],
	thriller: ['conclave-2024', 'argo-2012', 'the-departed-2006', 'the-killer-2023'],
	'sci-fi': ['dune-part-two-2024', 'everything-everywhere-all-at-once-2022', 'the-matrix-resurrections-2021'],
	superheroes: [
		'the-batman-2022',
		'logan-2017',
		'guardians-of-the-galaxy-vol-3-2023',
		'spider-man-no-way-home-2021',
	],
	animacion: ['inside-out-2-2024', 'the-wild-robot-2024', 'spider-man-into-the-spider-verse-2018'],
	anime: ['look-back-2024', 'the-boy-and-the-heron-2023', 'spy-x-family-code-white-2023'],
	romance: ['challengers-2024', 'the-idea-of-you-2024', 'titanic-1997'],
	crimen: ['nueve-reinas-2000', 'el-angel-2018', 'the-departed-2006', 'relatos-salvajes-2014'],
	aventura: [
		'dune-part-two-2024',
		'barbie-2023',
		'wonka-2023',
		'the-lord-of-the-rings-the-return-of-the-king-2003',
	],
	'oscar-mejor-pelicula': ['oppenheimer-2023', 'parasite-2019', 'moonlight-2016', 'no-country-for-old-men-2007'],
	'pelicula-nacional': ['relatos-salvajes-2014', 'nueve-reinas-2000', 'argentina-1985-2022', 'esperando-la-carroza-1985'],
};

function withTrailingSlash(value: string): string {
	return value.endsWith('/') ? value : `${value}/`;
}

function joinWithBase(pathPart: string): string {
	const base = withTrailingSlash(import.meta.env.BASE_URL || '/');
	return `${base}${pathPart.replace(/^\/+/, '')}`;
}

function normalizeComparableText(value: string): string {
	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/\s+/g, ' ')
		.trim();
}

function synopsisCopiesReview(synopsis: string, review: string): boolean {
	const normalizedSynopsis = normalizeComparableText(synopsis);
	const normalizedReview = normalizeComparableText(review);
	return Boolean(normalizedSynopsis && normalizedReview && normalizedReview.includes(normalizedSynopsis));
}

function validateMovies(movies: Movie[]): void {
	const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
	const seen = new Set<string>();

	for (const movie of movies) {
		const slug = movie.slug?.trim();
		if (!slug) {
			throw new Error(`Movie entry "${movie.title}" is missing a slug.`);
		}
		if (!slugPattern.test(slug)) {
			throw new Error(
				`Movie slug "${slug}" is invalid. Use lowercase letters, numbers, and dashes only.`,
			);
		}
		if (seen.has(slug)) {
			throw new Error(`Duplicate movie slug detected: "${slug}".`);
		}
		seen.add(slug);

		if (!movie.originalTitle?.trim()) {
			throw new Error(`Movie "${slug}" is missing originalTitle.`);
		}
		if (!movie.synopsis?.trim()) {
			throw new Error(`Movie "${slug}" is missing synopsis.`);
		}
		if (movie.synopsis.trim().startsWith('Completar ')) {
			throw new Error(`Movie "${slug}" still has the synopsis placeholder.`);
		}
		if (movie.synopsis.includes('\n')) {
			throw new Error(`Movie "${slug}" synopsis must stay in a single paragraph.`);
		}
		if (movie.synopsis.trim().length > MAX_SYNOPSIS_LENGTH) {
			throw new Error(
				`Movie "${slug}" has synopsis longer than ${String(MAX_SYNOPSIS_LENGTH)} characters.`,
			);
		}
		if (synopsisCopiesReview(movie.synopsis, movie.review ?? '')) {
			throw new Error(`Movie "${slug}" synopsis is copied from the review instead of explaining the plot.`);
		}
		const normalizedSynopsis = normalizeComparableText(movie.synopsis);
		const normalizedReview = normalizeComparableText(movie.review ?? '');
		if (
			normalizedReview &&
			normalizedReview.includes(normalizedSynopsis) &&
			REVIEWISH_SYNOPSIS_PATTERNS.some((pattern) => pattern.test(movie.synopsis))
		) {
			throw new Error(`Movie "${slug}" synopsis looks copied from the review instead of explaining the plot.`);
		}
		if (!movie.category?.trim()) {
			throw new Error(`Movie "${slug}" is missing category.`);
		}
		if (!movie.director?.trim()) {
			throw new Error(`Movie "${slug}" is missing director.`);
		}
		if (!movie.productionCompany?.trim()) {
			throw new Error(`Movie "${slug}" is missing productionCompany.`);
		}
		if (!movie.verdictLabel?.trim()) {
			throw new Error(`Movie "${slug}" is missing verdictLabel.`);
		}
		if (movie.verdictLabel.trim().length > MAX_VERDICT_LABEL_LENGTH) {
			throw new Error(
				`Movie "${slug}" has verdictLabel longer than ${String(MAX_VERDICT_LABEL_LENGTH)} characters.`,
			);
		}
		if (movie.releaseDate !== undefined) {
			if (!/^\d{4}-\d{2}-\d{2}$/.test(movie.releaseDate)) {
				throw new Error(`Movie "${slug}" has invalid releaseDate format. Use YYYY-MM-DD.`);
			}
		}
		if (typeof movie.audienceRating !== 'string' || !AUDIENCE_RATING_PATTERN.test(movie.audienceRating.trim())) {
			throw new Error(`Movie "${slug}" has invalid audienceRating.`);
		}
		if (!Array.isArray(movie.mainCast)) {
			throw new Error(`Movie "${slug}" has invalid mainCast.`);
		}
		if (movie.genres !== undefined) {
			if (!Array.isArray(movie.genres)) {
				throw new Error(`Movie "${slug}" has invalid genres format.`);
			}
			const genres = movie.genres
				.map((genre) => (typeof genre === 'string' ? genre.trim() : ''))
				.filter(Boolean);
			if (genres.length !== movie.genres.length) {
				throw new Error(`Movie "${slug}" has empty or invalid genres entries.`);
			}
		}
		if (movie.country !== undefined && (!movie.country || movie.country.trim().length < 2)) {
			throw new Error(`Movie "${slug}" has invalid country.`);
		}
		if (movie.isArgentinian !== undefined && typeof movie.isArgentinian !== 'boolean') {
			throw new Error(`Movie "${slug}" has invalid isArgentinian flag.`);
		}

		const castMembers = movie.mainCast
			.map((actor) => (typeof actor === 'string' ? actor.trim() : ''))
			.filter(Boolean);
		if (castMembers.length === 0) {
			throw new Error(`Movie "${slug}" is missing mainCast entries.`);
		}

		if (movie.awards !== undefined) {
			if (!movie.awards || !Array.isArray(movie.awards.wins)) {
				throw new Error(`Movie "${slug}" has invalid awards format.`);
			}

			for (const win of movie.awards.wins) {
				if (!win || typeof win !== 'object') {
					throw new Error(`Movie "${slug}" has an invalid award entry.`);
				}

				if (!['oscar', 'grammy', 'cannes'].includes(win.award)) {
					throw new Error(`Movie "${slug}" has unsupported award type "${String(win.award)}".`);
				}

				if (typeof win.category !== 'string' || win.category.trim().length === 0) {
					throw new Error(`Movie "${slug}" has an award without category.`);
				}

				if (
					win.recipient !== undefined &&
					(typeof win.recipient !== 'string' || win.recipient.trim().length === 0)
				) {
					throw new Error(`Movie "${slug}" has an award with invalid recipient.`);
				}

				if (win.year !== undefined && (!Number.isInteger(win.year) || win.year < 1900)) {
					throw new Error(`Movie "${slug}" has invalid award year "${String(win.year)}".`);
				}
			}
		}

		if (movie.runtimeMinutes !== undefined) {
			if (!Number.isInteger(movie.runtimeMinutes) || movie.runtimeMinutes < 40 || movie.runtimeMinutes > 360) {
				throw new Error(`Movie "${slug}" has invalid runtimeMinutes.`);
			}
		}

		if (movie.editorial !== undefined) {
			if (!movie.editorial || typeof movie.editorial !== 'object') {
				throw new Error(`Movie "${slug}" has invalid editorial metadata.`);
			}

			if (
				movie.editorial.runtimeComment !== undefined &&
				(typeof movie.editorial.runtimeComment !== 'string' || movie.editorial.runtimeComment.trim().length === 0)
			) {
				throw new Error(`Movie "${slug}" has invalid editorial.runtimeComment.`);
			}

			for (const key of ['becauseYouLiked', 'related'] as const) {
				const value = movie.editorial[key];
				if (
					value !== undefined &&
					(!Array.isArray(value) ||
						value.some((item) => typeof item !== 'string' || item.trim().length === 0))
				) {
					throw new Error(`Movie "${slug}" has invalid editorial.${key}.`);
				}
			}
		}
	}
}

function isReleased(movie: Pick<Movie, 'year' | 'releaseDate'>): boolean {
	const now = new Date();
	const currentYear = now.getUTCFullYear();

	if (movie.releaseDate) {
		const releaseDate = new Date(`${movie.releaseDate}T00:00:00Z`);
		if (Number.isNaN(releaseDate.getTime())) {
			return false;
		}
		return releaseDate.getTime() <= now.getTime();
	}

	return movie.year < currentYear;
}

function getMovieSortTimestamp(movie: Pick<Movie, 'year' | 'releaseDate'>): number {
	if (movie.releaseDate) {
		const releaseDate = new Date(`${movie.releaseDate}T00:00:00Z`);
		if (!Number.isNaN(releaseDate.getTime())) {
			return releaseDate.getTime();
		}
	}

	return Date.UTC(movie.year, 0, 1);
}

export function getMovies(): Movie[] {
	const movies = Object.values(movieModules)
		.map((moduleItem) => moduleItem.default)
		.filter((movie) => isReleased(movie))
		.sort(
			(a, b) =>
				getMovieSortTimestamp(b) - getMovieSortTimestamp(a) ||
				b.year - a.year ||
				a.title.localeCompare(b.title, 'es'),
		);

	validateMovies(movies);
	return movies;
}

export function getVerdictLabel(movie: Pick<Movie, 'verdict' | 'verdictLabel'>): string {
	if (movie.verdictLabel?.trim()) {
		return movie.verdictLabel.trim();
	}
	return VERDICT_LABELS[movie.verdict] ?? 'Sin definir';
}

export function normalizeSearchText(value: string): string {
	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim();
}

function mapGenreToken(token: string, target: Set<RecommendationGenreId>): void {
	const normalized = normalizeSearchText(token).replace(/\s+/g, ' ');
	if (!normalized) return;

	if (normalized.includes('accion') || normalized === 'action') {
		target.add('accion');
	}
	if (normalized.includes('comedia')) {
		target.add('comedia');
	}
	if (normalized.includes('documental') || normalized.includes('documentary') || normalized.includes('docu')) {
		target.add('documental');
	}
	if (normalized.includes('terror') || normalized.includes('horror')) {
		target.add('terror');
	}
	if (normalized.includes('drama') || normalized.includes('biografic')) {
		target.add('drama');
	}
	if (normalized.includes('thriller') || normalized.includes('suspenso')) {
		target.add('thriller');
	}
	if (
		normalized.includes('ciencia ficcion') ||
		normalized.includes('science fiction') ||
		normalized.includes('sci fi') ||
		normalized.includes('scifi') ||
		normalized.includes('sci-fi')
	) {
		target.add('sci-fi');
	}
	if (normalized.includes('animacion') || normalized.includes('animation')) {
		target.add('animacion');
	}
	if (
		normalized.includes('romance') ||
		normalized.includes('romantica') ||
		normalized.includes('romantic')
	) {
		target.add('romance');
	}
	if (normalized.includes('crimen') || normalized.includes('crime') || normalized.includes('policial')) {
		target.add('crimen');
	}
	if (
		normalized.includes('aventura') ||
		normalized.includes('adventure') ||
		normalized.includes('fantasia') ||
		normalized.includes('fantasy')
	) {
		target.add('aventura');
	}
}

export function isArgentinianMovie(movie: Pick<Movie, 'country' | 'isArgentinian'>): boolean {
	if (movie.isArgentinian === true) {
		return true;
	}
	return movie.country?.trim().toUpperCase() === 'AR';
}

function isOscarBestPictureWinner(movie: Pick<Movie, 'awards'>): boolean {
	return (movie.awards?.wins ?? []).some((win) => {
		if (win.award !== 'oscar') {
			return false;
		}

		const normalizedCategory = normalizeSearchText(win.category);
		return (
			normalizedCategory.includes('mejor pelicula') ||
			normalizedCategory.includes('best picture') ||
			normalizedCategory.includes('outstanding picture')
		);
	});
}

const SUPERHERO_INCLUDE_TOKENS = [
	'ant-man',
	'aquaman',
	'avengers',
	'batman',
	'batgirl',
	'batman v superman',
	'birds of prey',
	'black adam',
	'black panther',
	'black widow',
	'blade',
	'blue beetle',
	'captain america',
	'captain marvel',
	'daredevil',
	'deadpool',
	'doctor strange',
	'elektra',
	'eternals',
	'fantastic four',
	'ghost rider',
	'green lantern',
	'guardians of the galaxy',
	'howard the duck',
	'hulk',
	'iron man',
	'justice league',
	'kraven',
	'madame web',
	'man of steel',
	'morbius',
	'punisher',
	'shang-chi',
	'shazam',
	'spider-man',
	'suicide squad',
	'supergirl',
	'superman',
	'the avengers',
	'the flash',
	'the incredible hulk',
	'the marvels',
	'thunderbolts',
	'thor',
	'venom',
	'watchmen',
	'wolverine',
	'wonder woman',
	'x-men',
	'zack snyders justice league',
];

const SUPERHERO_EXCLUDE_TOKENS = [
	'big hero 6',
	'into the spider-verse',
	'across the spider-verse',
	'spider-verse',
	'mario',
];

const SUPERHERO_INCLUDED_SLUGS = new Set([
	'catwoman-2004',
	'dark-phoenix-2019',
	'logan-2017',
	'the-new-mutants-2020',
]);

function hasAnyToken(haystack: string, tokens: string[]): boolean {
	return tokens.some((token) => haystack.includes(token));
}

function isAnimationOrAnimeMovie(movie: Pick<Movie, 'category' | 'genres'>): boolean {
	const genreText = normalizeSearchText([movie.category ?? '', ...(movie.genres ?? [])].join(' '));
	return (
		genreText.includes('animacion') ||
		genreText.includes('animation') ||
		genreText.includes('anime')
	);
}

function isMarvelOrDcSuperheroMovie(
	movie: Pick<Movie, 'slug' | 'title' | 'originalTitle' | 'category' | 'genres'>,
): boolean {
	if (isAnimationOrAnimeMovie(movie)) {
		return false;
	}

	if (SUPERHERO_INCLUDED_SLUGS.has(movie.slug)) {
		return true;
	}

	const heroText = normalizeSearchText([movie.slug, movie.title, movie.originalTitle].join(' '));
	if (hasAnyToken(heroText, SUPERHERO_EXCLUDE_TOKENS)) {
		return false;
	}

	return hasAnyToken(heroText, SUPERHERO_INCLUDE_TOKENS);
}

export function getRecommendationGenres(
	movie: Pick<
		Movie,
		'slug' | 'title' | 'originalTitle' | 'category' | 'genres' | 'country' | 'isArgentinian' | 'awards'
	>,
): RecommendationGenreId[] {
	const genreSet = new Set<RecommendationGenreId>();
	let hasAnimeToken = false;
	const sourceGenres = Array.isArray(movie.genres) && movie.genres.length > 0 ? movie.genres : [];

	const normalizedCategory = normalizeSearchText(movie.category ?? '');
	if (normalizedCategory.includes('anime')) {
		hasAnimeToken = true;
	}
	mapGenreToken(movie.category ?? '', genreSet);
	for (const sourceGenre of sourceGenres) {
		const normalizedGenre = normalizeSearchText(sourceGenre);
		if (normalizedGenre.includes('anime')) {
			hasAnimeToken = true;
		}
		mapGenreToken(sourceGenre, genreSet);
		for (const chunk of sourceGenre.split(/[,/|]/g)) {
			const normalizedChunk = normalizeSearchText(chunk);
			if (normalizedChunk.includes('anime')) {
				hasAnimeToken = true;
			}
			mapGenreToken(chunk, genreSet);
		}
	}

	if (hasAnimeToken && movie.country?.trim().toUpperCase() === 'JP') {
		// Keep Japanese anime separate from generic animation in UI filters.
		genreSet.delete('animacion');
		genreSet.add('anime');
	}

	if (isArgentinianMovie(movie)) {
		genreSet.add('pelicula-nacional');
	}

	if (isOscarBestPictureWinner(movie)) {
		genreSet.add('oscar-mejor-pelicula');
	}

	if (isMarvelOrDcSuperheroMovie(movie)) {
		genreSet.add('superheroes');
	}

	return RECOMMENDATION_GENRE_OPTIONS.map((option) => option.id).filter((genreId) =>
		genreSet.has(genreId),
	);
}

function getNormalizedTitleTokens(movie: Pick<Movie, 'title' | 'originalTitle' | 'slug'>): string[] {
	const source = normalizeSearchText([movie.title, movie.originalTitle, movie.slug].join(' '))
		.replace(/[^a-z0-9\s]/g, ' ')
		.split(/\s+/)
		.filter((token) => token.length >= 3 && !TITLE_TOKEN_STOP_WORDS.has(token) && !/^\d+$/.test(token));

	return Array.from(new Set(source));
}

function getSharedTitleTokenCount(
	sourceMovie: Pick<Movie, 'title' | 'originalTitle' | 'slug'>,
	candidateMovie: Pick<Movie, 'title' | 'originalTitle' | 'slug'>,
): number {
	const sourceTokens = new Set(getNormalizedTitleTokens(sourceMovie));
	if (sourceTokens.size === 0) {
		return 0;
	}

	return getNormalizedTitleTokens(candidateMovie).filter((token) => sourceTokens.has(token)).length;
}

function getMovieLinkRecommendation(movie: Pick<Movie, 'slug' | 'title' | 'year'>): MovieLinkRecommendation {
	return {
		slug: movie.slug,
		title: movie.title,
		year: movie.year,
		url: getMoviePath(movie.slug),
	};
}

export function formatRuntimeMinutes(minutes: number): string {
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	if (hours === 0) {
		return `${remainingMinutes} min`;
	}
	return remainingMinutes === 0 ? `${hours}h` : `${hours}h ${remainingMinutes}m`;
}

export function getRuntimeComment(movie: Pick<Movie, 'runtimeMinutes' | 'verdict' | 'editorial'>): string | undefined {
	if (movie.editorial?.runtimeComment?.trim()) {
		return movie.editorial.runtimeComment.trim();
	}

	const runtimeMinutes = movie.runtimeMinutes;
	if (!runtimeMinutes) {
		return undefined;
	}

	if (runtimeMinutes <= 95) {
		return 'es cortita y entra sola';
	}
	if (runtimeMinutes <= 112) {
		return 'va rapido y no se hace pesada';
	}
	if (runtimeMinutes <= 132) {
		return movie.verdict === 'recomendada' ? 'tiene buen ritmo y no se hace pesada' : 'dura lo suyo pero va bien';
	}
	if (runtimeMinutes <= 150) {
		return movie.verdict === 'recomendada' ? 'es larguita pero va bien' : 'dura bastante y se siente';
	}
	return movie.verdict === 'recomendada' ? 'es larguisima pero no te aburre nunca' : 'es larga y se hace notar';
}

function getBridgeAnchorCandidates(movie: Movie, allMovies: Movie[]): Movie[] {
	const preferredBridgeSlugs = movie.editorial?.becauseYouLiked ?? [];
	if (preferredBridgeSlugs.length > 0) {
		const preferred = preferredBridgeSlugs
			.map((slug) => allMovies.find((candidate) => candidate.slug === slug))
			.filter((candidate): candidate is Movie => Boolean(candidate) && candidate.slug !== movie.slug);
		if (preferred.length > 0) {
			return preferred.slice(0, 2);
		}
	}

	const recommendationGenres = getRecommendationGenres(movie);
	const anchorPool = Array.from(
		new Set(recommendationGenres.flatMap((genreId) => BRIDGE_ANCHOR_POOLS[genreId] ?? [])),
	);

	const ranked = allMovies
		.filter((candidate) => candidate.slug !== movie.slug)
		.map((candidate) => {
			let score = 0;
			const candidateGenres = getRecommendationGenres(candidate);
			const sharedGenres = candidateGenres.filter((genreId) => recommendationGenres.includes(genreId)).length;
			score += sharedGenres * 12;
			score += getSharedTitleTokenCount(movie, candidate) * 14;

			if (anchorPool.includes(candidate.slug)) {
				score += 30;
			}
			if (candidate.verdict === 'recomendada') {
				score += 4;
			}
			if ((candidate.awards?.wins ?? []).length > 0) {
				score += 3;
			}
			if (candidate.year <= movie.year) {
				score += 2;
			}

			return { candidate, score };
		})
		.filter((entry) => entry.score > 0)
		.sort((a, b) => b.score - a.score || b.candidate.year - a.candidate.year || a.candidate.title.localeCompare(b.candidate.title, 'es'));

	return ranked.slice(0, 2).map((entry) => entry.candidate);
}

export function getBridgeRecommendations(movie: Movie, allMovies: Movie[]): MovieLinkRecommendation[] {
	return getBridgeAnchorCandidates(movie, allMovies).map((candidate) => getMovieLinkRecommendation(candidate));
}

function getRelatedMovieCandidates(movie: Movie, allMovies: Movie[]): Movie[] {
	const preferredRelatedSlugs = movie.editorial?.related ?? [];
	if (preferredRelatedSlugs.length > 0) {
		const preferred = preferredRelatedSlugs
			.map((slug) => allMovies.find((candidate) => candidate.slug === slug))
			.filter((candidate): candidate is Movie => Boolean(candidate) && candidate.slug !== movie.slug);
		if (preferred.length > 0) {
			return preferred.slice(0, 4);
		}
	}

	const movieGenres = getRecommendationGenres(movie);
	const movieCast = new Set(movie.mainCast.map((castMember) => normalizeSearchText(castMember)));

	const ranked = allMovies
		.filter((candidate) => candidate.slug !== movie.slug)
		.map((candidate) => {
			let score = 0;
			const candidateGenres = getRecommendationGenres(candidate);
			const sharedGenres = candidateGenres.filter((genreId) => movieGenres.includes(genreId)).length;
			score += sharedGenres * 14;

			if (normalizeSearchText(candidate.category) === normalizeSearchText(movie.category)) {
				score += 10;
			}
			if (normalizeSearchText(candidate.director) === normalizeSearchText(movie.director)) {
				score += 18;
			}
			if (candidate.releasePlatform && candidate.releasePlatform === movie.releasePlatform) {
				score += 3;
			}
			if (isArgentinianMovie(candidate) && isArgentinianMovie(movie)) {
				score += 8;
			}

			const sharedCast = candidate.mainCast.filter((castMember) =>
				movieCast.has(normalizeSearchText(castMember)),
			).length;
			score += sharedCast * 6;
			score += getSharedTitleTokenCount(movie, candidate) * 18;

			const yearDistance = Math.abs(candidate.year - movie.year);
			if (yearDistance <= 2) {
				score += 6;
			} else if (yearDistance <= 6) {
				score += 3;
			}

			if (candidate.verdict === 'recomendada') {
				score += 2;
			}

			return { candidate, score };
		})
		.filter((entry) => entry.score > 0)
		.sort((a, b) => b.score - a.score || b.candidate.year - a.candidate.year || a.candidate.title.localeCompare(b.candidate.title, 'es'));

	return ranked.slice(0, 4).map((entry) => entry.candidate);
}

export function getRelatedRecommendations(movie: Movie, allMovies: Movie[]): MovieLinkRecommendation[] {
	return getRelatedMovieCandidates(movie, allMovies).map((candidate) => getMovieLinkRecommendation(candidate));
}

export function getMovieEditorialSummary(movie: Movie, allMovies: Movie[]): MovieEditorialSummary {
	const runtimeComment = getRuntimeComment(movie);
	const runtime =
		movie.runtimeMinutes && runtimeComment
			? {
					minutes: movie.runtimeMinutes,
					formatted: formatRuntimeMinutes(movie.runtimeMinutes),
					comment: runtimeComment,
				}
			: undefined;

	return {
		runtime,
		bridge: getBridgeRecommendations(movie, allMovies),
		related: getRelatedRecommendations(movie, allMovies),
	};
}

export function getVerdictBadgeClass(movie: Pick<Movie, 'verdict' | 'verdictLabel'>): string {
	const normalizedLabel = normalizeSearchText(getVerdictLabel(movie));
	if (normalizedLabel.includes('mediocre')) {
		return 'badge--zafa';
	}
	return `badge--${movie.verdict}`;
}

export function getPosterUrl(poster: string): string {
	if (!poster) {
		return joinWithBase('posters/poster-no-disponible.svg');
	}
	if (/^https?:\/\//i.test(poster)) {
		return poster;
	}
	return joinWithBase(poster);
}

export function getMoviePath(slug: string): string {
	return joinWithBase(`peliculas/${slug}/`);
}
