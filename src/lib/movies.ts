import type { Movie, MovieVerdict } from '../types/movie';
import { GENERATED_UPCOMING_RELEASES } from '../data/upcomingReleases.generated';
import { generateMovieEditorialRecommendations } from './recommendation-engine';
import { getMoviePlatforms } from './platforms';

const movieModules = import.meta.glob('../data/movies/*.json', { eager: true }) as Record<
	string,
	{ default: Movie }
>;

const VERDICT_LABELS: Record<MovieVerdict, string> = {
	recomendada: 'Recomendada',
	zafa: 'Zafa',
	no_recomendada: 'Malísima',
	basura_atomica: 'Basura atómica',
};

export const ABSOLUTE_CINEMA_LABEL = 'Absolute Cinema';
export const CULT_MOVIE_LABEL = 'De culto';
const ABSOLUTE_CINEMA_SOURCE_LABELS = new Set(['legendaria', 'obra maestra', 'clasico total']);

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
	| 'pelicula-nacional'
	| 'guerra'
	| 'culto';

export interface RecommendationGenreOption {
	id: RecommendationGenreId;
	label: string;
}

export interface PositiveVerdictFilterOption {
	id: string;
	label: string;
	count: number;
}

export interface SubgenreFilterOption {
	id: string;
	label: string;
	count: number;
}

interface CanonicalSubgenreDefinition {
	id: string;
	label: string;
	matchers: string[];
	genreHints?: RecommendationGenreId[];
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

export interface UpcomingMovieRelease {
	slug: string;
	title: string;
	releaseDate: string;
	videoUrl: string;
	thumbnailUrl: string;
	synopsis?: string;
	sourceUrl?: string;
}

export interface CurrentTheatricalMovieRelease {
	slug: string;
	title: string;
	year: number;
	movieUrl: string;
	releaseDate: string;
	dateLabel?: string;
	posterUrl: string;
	videoUrl: string;
	verdictLabel: string;
	verdictClass: string;
	platform?: string;
}

const STREAMING_CAROUSEL_MIN_ITEMS = 8;
const STREAMING_CAROUSEL_MAX_ITEMS = 12;
const STREAMING_CAROUSEL_RECENT_LOAD_SLOTS = 4;
const STREAMING_CAROUSEL_RECENT_LOAD_WINDOW_DAYS = 60;

export interface WeeklyMovieSuggestion {
	slug: string;
	title: string;
	year: number;
	releaseDate: string;
	synopsis: string;
	verdictLabel: string;
	movieUrl: string;
	watchUrl: string;
	embedUrl: string;
	thumbnailUrl: string;
}

export const RECOMMENDATION_GENRE_OPTIONS: RecommendationGenreOption[] = [
	{ id: 'accion', label: 'Acción' },
	{ id: 'comedia', label: 'Comedia' },
	{ id: 'documental', label: 'Documentales' },
	{ id: 'terror', label: 'Terror' },
	{ id: 'drama', label: 'Drama' },
	{ id: 'thriller', label: 'Thriller' },
	{ id: 'sci-fi', label: 'Sci-Fi' },
	{ id: 'superheroes', label: 'Superhéroes' },
	{ id: 'animacion', label: 'Animación' },
	{ id: 'anime', label: 'Anime' },
	{ id: 'romance', label: 'Romance' },
	{ id: 'crimen', label: 'Crimen' },
	{ id: 'aventura', label: 'Aventura' },
	{ id: 'oscar-mejor-pelicula', label: 'Ganadoras del Oscar' },
	{ id: 'pelicula-nacional', label: 'Cine nacional' },
	{ id: 'guerra', label: 'Guerra' },
	{ id: 'culto', label: CULT_MOVIE_LABEL },
];

const SUBGENRE_DEFINITIONS: CanonicalSubgenreDefinition[] = [
	{ id: 'gore', label: 'Gore', matchers: ['gore', 'splatter'], genreHints: ['terror'] },
	{
		id: 'found-footage',
		label: 'Found Footage',
		matchers: ['found footage', 'found-footage'],
		genreHints: ['terror'],
	},
	{ id: 'slasher', label: 'Slasher', matchers: ['slasher'], genreHints: ['terror'] },
	{
		id: 'romcom',
		label: 'Rom-Com',
		matchers: ['romcom', 'rom-com', 'rom com', 'comedia romantica', 'romantic comedy'],
		genreHints: ['comedia', 'romance'],
	},
	{
		id: 'body-horror',
		label: 'Body Horror',
		matchers: ['body horror', 'terror corporal', 'horror corporal'],
		genreHints: ['terror'],
	},
	{
		id: 'psychological',
		label: 'Psicológico',
		matchers: ['psychological', 'psicologico', 'psicologica'],
		genreHints: ['thriller'],
	},
	{
		id: 'supernatural',
		label: 'Sobrenatural',
		matchers: ['supernatural', 'sobrenatural'],
		genreHints: ['terror'],
	},
	{ id: 'heist', label: 'Heist', matchers: ['heist'], genreHints: ['crimen'] },
	{
		id: 'road-movie',
		label: 'Road Movie',
		matchers: ['road movie', 'road-movie'],
		genreHints: ['aventura'],
	},
	{
		id: 'coming-of-age',
		label: 'Coming of Age',
		matchers: ['coming of age', 'coming-of-age'],
		genreHints: ['drama'],
	},
	{
		id: 'mockumentary',
		label: 'Mockumentary',
		matchers: ['mockumentary', 'falso documental'],
		genreHints: ['comedia', 'documental'],
	},
	{ id: 'exploitation', label: 'Exploitation', matchers: ['exploitation'], genreHints: ['terror'] },
];

const SUBGENRE_SORT_ORDER = SUBGENRE_DEFINITIONS.map((definition) => definition.id);
const GENERIC_SUBGENRE_TOKENS = new Set([
	'accion',
	'action',
	'aventura',
	'adventure',
	'anime',
	'animacion',
	'animation',
	'comedia',
	'comedy',
	'crimen',
	'crime',
	'documental',
	'documentary',
	'drama',
	'fantasia',
	'fantasy',
	'horror',
	'romance',
	'romantica',
	'sci fi',
	'sci-fi',
	'scifi',
	'science fiction',
	'superheroes',
	'superhero',
	'suspenso',
	'terror',
	'thriller',
]);

const MAX_VERDICT_LABEL_LENGTH = 21;
const MAX_SYNOPSIS_LENGTH = 320;
const AUDIENCE_RATING_PATTERN = /^(ATP|\+\d{1,2})$/;
const POSITIVE_VERDICT_FILTER_ORDER = [
	'recontra garpa',
	'muy buena',
	'esta muy bien',
	'esta buena',
	'recomendada',
];
const POSITIVE_VERDICT_FILTER_LABELS = new Set(POSITIVE_VERDICT_FILTER_ORDER);
const WEEKLY_SUGGESTION_LABEL_SCORE = new Map<string, number>([
	['absolute cinema', 100],
	['recontra garpa', 95],
	['obra maestra', 94],
	['clasico total', 93],
	['muy buena', 88],
	['garpa mal', 86],
	['garpa fuerte', 84],
	['recomendada', 82],
	['esta muy bien', 80],
	['esta buena', 78],
	['dura y buena', 76],
	['se deja ver', 56],
	['pasable', 52],
]);
const WEEKLY_SUGGESTION_WINDOW_DAYS = 30;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
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

function withTrailingSlash(value: string): string {
	return value.endsWith('/') ? value : `${value}/`;
}

function joinWithBase(pathPart: string): string {
	const base = withTrailingSlash(import.meta.env.BASE_URL || '/');
	return `${base}${pathPart.replace(/^\/+/, '')}`;
}

function normalizeYoutubeId(value: string): string {
	return String(value ?? '').trim();
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
		if (movie.reviewPublishedAt !== undefined) {
			if (!/^\d{4}-\d{2}-\d{2}$/.test(movie.reviewPublishedAt)) {
				throw new Error(`Movie "${slug}" has invalid reviewPublishedAt format. Use YYYY-MM-DD.`);
			}
		}
		if (typeof movie.audienceRating !== 'string' || !AUDIENCE_RATING_PATTERN.test(movie.audienceRating.trim())) {
			throw new Error(`Movie "${slug}" has invalid audienceRating.`);
		}
		if (!Array.isArray(movie.mainCast)) {
			throw new Error(`Movie "${slug}" has invalid mainCast.`);
		}
		if (movie.releasePlatforms !== undefined) {
			if (!Array.isArray(movie.releasePlatforms)) {
				throw new Error(`Movie "${slug}" has invalid releasePlatforms format.`);
			}
			if (movie.releasePlatforms.length === 0 || movie.releasePlatforms.length > 2) {
				throw new Error(`Movie "${slug}" must define between 1 and 2 releasePlatforms when present.`);
			}

			const normalizedPlatforms = movie.releasePlatforms
				.map((platform) => (typeof platform === 'string' ? platform.trim() : ''))
				.filter(Boolean);
			if (normalizedPlatforms.length !== movie.releasePlatforms.length) {
				throw new Error(`Movie "${slug}" has empty or invalid releasePlatforms entries.`);
			}
			if (new Set(normalizedPlatforms).size !== normalizedPlatforms.length) {
				throw new Error(`Movie "${slug}" repeats platforms in releasePlatforms.`);
			}
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
		if (movie.subgenres !== undefined) {
			if (!Array.isArray(movie.subgenres)) {
				throw new Error(`Movie "${slug}" has invalid subgenres format.`);
			}
			const subgenres = movie.subgenres
				.map((subgenre) => (typeof subgenre === 'string' ? subgenre.trim() : ''))
				.filter(Boolean);
			if (subgenres.length !== movie.subgenres.length) {
				throw new Error(`Movie "${slug}" has empty or invalid subgenres entries.`);
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

			if (movie.editorial.tenSecondTake !== undefined) {
				if (!movie.editorial.tenSecondTake || typeof movie.editorial.tenSecondTake !== 'object') {
					throw new Error(`Movie "${slug}" has invalid editorial.tenSecondTake.`);
				}

				for (const key of ['verdict', 'identity', 'lane', 'pace', 'subgenres', 'plan', 'intensity'] as const) {
					const value = movie.editorial.tenSecondTake[key];
					if (value !== undefined && (typeof value !== 'string' || value.trim().length === 0)) {
						throw new Error(`Movie "${slug}" has invalid editorial.tenSecondTake.${key}.`);
					}
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

function getReviewPublishedTimestamp(movie: Pick<Movie, 'year' | 'releaseDate' | 'reviewPublishedAt'>): number {
	if (movie.reviewPublishedAt) {
		const reviewPublishedAt = new Date(`${movie.reviewPublishedAt}T00:00:00Z`);
		if (!Number.isNaN(reviewPublishedAt.getTime())) {
			return reviewPublishedAt.getTime();
		}
	}

	return getMovieSortTimestamp(movie);
}

function getReferenceDayTimestamp(referenceDate: Date): number {
	return Date.UTC(
		referenceDate.getUTCFullYear(),
		referenceDate.getUTCMonth(),
		referenceDate.getUTCDate(),
	);
}

function getIsoDateTimestamp(value: string): number {
	return Date.parse(`${value}T00:00:00Z`);
}

function getNormalizedUpcomingReleaseTitle(title: string): string {
	return normalizeSearchText(title).replace(/\s+/g, ' ');
}

function getYoutubeVideoIdFromUrl(value: string): string {
	const normalizedValue = String(value ?? '').trim();
	if (!normalizedValue) {
		return '';
	}

	try {
		const parsedUrl = new URL(normalizedValue);
		if (parsedUrl.hostname.includes('youtu.be')) {
			return normalizeYoutubeId(parsedUrl.pathname.replace(/^\/+/, ''));
		}
		if (parsedUrl.pathname.startsWith('/embed/')) {
			return normalizeYoutubeId(parsedUrl.pathname.replace(/^\/embed\/+/, ''));
		}
		return normalizeYoutubeId(parsedUrl.searchParams.get('v') ?? '');
	} catch {
		return '';
	}
}

function getUpcomingReleaseIdentityKeys(release: Pick<UpcomingMovieRelease, 'title' | 'videoUrl'>): string[] {
	const keys = new Set<string>();
	const youtubeId = getYoutubeVideoIdFromUrl(release.videoUrl);
	if (youtubeId) {
		keys.add(`youtube:${youtubeId}`);
	}

	const normalizedTitle = getNormalizedUpcomingReleaseTitle(release.title);
	if (normalizedTitle) {
		keys.add(`title:${normalizedTitle}`);
	}

	return Array.from(keys);
}

function getUpcomingReleaseMapKey(release: UpcomingMovieRelease): string {
	return getUpcomingReleaseIdentityKeys(release)[0] ?? `slug:${release.slug}`;
}

function getWeeklySuggestionScore(movie: Movie): number {
	if (isAbsoluteCinemaMovie(movie)) {
		return WEEKLY_SUGGESTION_LABEL_SCORE.get('absolute cinema')!;
	}

	const label = normalizeSearchText(getVerdictLabel(movie)).replace(/\s+/g, ' ');
	const labelScore = WEEKLY_SUGGESTION_LABEL_SCORE.get(label);
	if (labelScore !== undefined) {
		return labelScore;
	}

	if (movie.verdict === 'recomendada') {
		return 72;
	}
	if (movie.verdict === 'zafa') {
		return 48;
	}

	return 0;
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

export function getLatestReviewMovies(movies: Movie[], limit = 3): Movie[] {
	return [...movies]
		.sort(
			(a, b) =>
				getReviewPublishedTimestamp(b) - getReviewPublishedTimestamp(a) ||
				getMovieSortTimestamp(b) - getMovieSortTimestamp(a) ||
				b.year - a.year ||
				a.title.localeCompare(b.title, 'es'),
		)
		.slice(0, Math.max(0, limit));
}

function isTheatricalRelease(movie: Pick<Movie, 'releasePlatform' | 'releasePlatforms'>): boolean {
	return getMoviePlatforms(movie).includes('Cine');
}

function hasConfirmedStreamingPlatform(movie: Pick<Movie, 'releasePlatform' | 'releasePlatforms'>): boolean {
	return getMoviePlatforms(movie).some((platform) => platform !== 'Cine' && platform !== 'Otras plataformas');
}

/**
 * La grilla inicial separa los estrenos argentinos por ventana de exhibición:
 * primero van los títulos más nuevos de cine y al final los más nuevos de
 * plataformas confirmadas. Así una carga reciente no pisa la composición
 * editorial de la portada.
 */
export function getHomeMovieShowcase(
	movies: Movie[],
	limit = 12,
	platformSlots = 4,
): Movie[] {
	const showcaseLimit = Math.max(0, limit);
	const reservedPlatformSlots = Math.min(Math.max(0, platformSlots), showcaseLimit);
	const reservedTheatricalSlots = showcaseLimit - reservedPlatformSlots;
	const newestTheatricalReleases = movies
		.filter((movie) => isTheatricalRelease(movie))
		.slice(0, reservedTheatricalSlots);
	const selectedSlugs = new Set(newestTheatricalReleases.map((movie) => movie.slug));
	const newestStreamingReleases = movies
		.filter((movie) => hasConfirmedStreamingPlatform(movie) && !isTheatricalRelease(movie))
		.filter((movie) => !selectedSlugs.has(movie.slug))
		.slice(0, reservedPlatformSlots);

	return [...newestTheatricalReleases, ...newestStreamingReleases];
}

export function getWeeklyMovieSuggestion(
	movies: Movie[],
	referenceDate = new Date(),
	windowDays = WEEKLY_SUGGESTION_WINDOW_DAYS,
): WeeklyMovieSuggestion | null {
	return getWeeklyMovieSuggestions(movies, referenceDate, windowDays, 1)[0] ?? null;
}

export function getWeeklyMovieSuggestions(
	movies: Movie[],
	referenceDate = new Date(),
	windowDays = WEEKLY_SUGGESTION_WINDOW_DAYS,
	limit = 5,
): WeeklyMovieSuggestion[] {
	const referenceTimestamp = getReferenceDayTimestamp(referenceDate);
	const windowStartTimestamp = referenceTimestamp - windowDays * DAY_IN_MS;

	const candidates = movies
		.filter((movie) => {
			if (!movie.releaseDate?.trim() || !movie.trailerYoutubeId?.trim()) {
				return false;
			}

			const releaseTimestamp = getMovieSortTimestamp(movie);
			return releaseTimestamp >= windowStartTimestamp && releaseTimestamp <= referenceTimestamp;
		})
		.map((movie) => ({
			movie,
			score: getWeeklySuggestionScore(movie),
		}))
		.filter((entry) => entry.score > 0)
		.sort(
			(left, right) =>
				right.score - left.score ||
				getMovieSortTimestamp(right.movie) - getMovieSortTimestamp(left.movie) ||
				left.movie.title.localeCompare(right.movie.title, 'es'),
		)
		.slice(0, Math.max(1, limit));

	return candidates
		.map((entry) => entry.movie)
		.filter((suggestion): suggestion is Movie & { releaseDate: string } => Boolean(suggestion.releaseDate))
		.map((suggestion) => ({
			slug: suggestion.slug,
			title: suggestion.title,
			year: suggestion.year,
			releaseDate: suggestion.releaseDate,
			synopsis: suggestion.synopsis,
			verdictLabel: getVerdictLabel(suggestion),
			movieUrl: getMoviePath(suggestion.slug),
			watchUrl: getYoutubeWatchUrl(suggestion.trailerYoutubeId),
			embedUrl: getYoutubeAutoplayEmbedUrl(suggestion.trailerYoutubeId),
			thumbnailUrl: getYoutubeThumbnailUrl(suggestion.trailerYoutubeId),
		}));
}

export function getUpcomingMovieReleases(referenceDate = new Date(), limit = 4): UpcomingMovieRelease[] {
	const referenceTimestamp = Date.UTC(
		referenceDate.getUTCFullYear(),
		referenceDate.getUTCMonth(),
		referenceDate.getUTCDate(),
	);

	const movies = Object.values(movieModules).map((moduleItem) => moduleItem.default);
	validateMovies(movies);
	const generatedUpcoming = GENERATED_UPCOMING_RELEASES.filter((release) =>
		isFutureRelease(release.releaseDate, referenceTimestamp),
	);
	const generatedUpcomingKeys = new Set(generatedUpcoming.map(getUpcomingReleaseMapKey));

	const catalogUpcoming = movies
		.filter((movie) => {
			if (!movie.releaseDate?.trim() || !movie.trailerYoutubeId?.trim()) {
				return false;
			}

			const releaseTimestamp = getMovieSortTimestamp(movie);
			return releaseTimestamp > referenceTimestamp;
		})
		.sort(
			(left, right) =>
				getMovieSortTimestamp(left) - getMovieSortTimestamp(right) ||
				left.title.localeCompare(right.title, 'es'),
		)
		.map((movie) => ({
			slug: movie.slug,
			title: movie.title,
			releaseDate: movie.releaseDate!,
			videoUrl: getYoutubeWatchUrl(movie.trailerYoutubeId),
			thumbnailUrl: getYoutubeThumbnailUrl(movie.trailerYoutubeId),
			synopsis: movie.synopsis,
			sourceUrl: getMoviePath(movie.slug),
		}));

	return [
		...generatedUpcoming,
		...catalogUpcoming.filter((release) => !generatedUpcomingKeys.has(getUpcomingReleaseMapKey(release))),
	].slice(0, limit);
}

/**
 * Cartelera con ficha publicada en Cine Posta. La ventana corta evita que un
 * rótulo de cine desactualizado mantenga títulos viejos en la portada.
 */
export function getCurrentTheatricalMovieReleases(
	referenceDate = new Date(),
	limit = 12,
	windowDays = 42,
): CurrentTheatricalMovieRelease[] {
	const referenceTimestamp = Date.UTC(
		referenceDate.getUTCFullYear(),
		referenceDate.getUTCMonth(),
		referenceDate.getUTCDate(),
	);
	const earliestReleaseTimestamp = referenceTimestamp - windowDays * DAY_IN_MS;
	const movies = Object.values(movieModules).map((moduleItem) => moduleItem.default);

	return movies
		.filter((movie) => {
			if (!movie.releaseDate?.trim() || !movie.trailerYoutubeId?.trim()) return false;
			const isInTheaters = isTheatricalRelease(movie);
			const releaseTimestamp = getMovieSortTimestamp(movie);
			return isInTheaters && releaseTimestamp >= earliestReleaseTimestamp && releaseTimestamp <= referenceTimestamp;
		})
		.sort(
			(left, right) =>
				getMovieSortTimestamp(right) - getMovieSortTimestamp(left) ||
				left.title.localeCompare(right.title, 'es'),
		)
		.slice(0, Math.max(1, limit))
		.map((movie) => ({
			slug: movie.slug,
			title: movie.title,
			year: movie.year,
			movieUrl: getMoviePath(movie.slug),
			releaseDate: movie.releaseDate!,
			posterUrl: getPosterUrl(movie.poster),
			videoUrl: getYoutubeWatchUrl(movie.trailerYoutubeId),
			verdictLabel: getVerdictLabel(movie),
			verdictClass: getVerdictBadgeClass(movie),
		}));
}

/**
 * Estrenos de plataformas confirmadas. Se excluyen los rótulos genéricos y
 * los títulos de cartelera para que las dos filas de la portada no se repitan.
 */
export function getCurrentStreamingMovieReleases(
	referenceDate = new Date(),
	limit = 12,
	windowDays = 42,
): CurrentTheatricalMovieRelease[] {
	const referenceTimestamp = Date.UTC(
		referenceDate.getUTCFullYear(),
		referenceDate.getUTCMonth(),
		referenceDate.getUTCDate(),
	);
	const earliestReleaseTimestamp = referenceTimestamp - windowDays * DAY_IN_MS;
	const earliestRecentLoadTimestamp = referenceTimestamp - STREAMING_CAROUSEL_RECENT_LOAD_WINDOW_DAYS * DAY_IN_MS;
	const maximumItems = Math.min(STREAMING_CAROUSEL_MAX_ITEMS, Math.max(1, limit));
	const minimumItems = Math.min(STREAMING_CAROUSEL_MIN_ITEMS, maximumItems);
	const recentLoadSlots = Math.min(STREAMING_CAROUSEL_RECENT_LOAD_SLOTS, maximumItems);
	const movies = Object.values(movieModules).map((moduleItem) => moduleItem.default);
	const candidates = movies
		.map((movie) => ({ movie, platforms: getMoviePlatforms(movie) }))
		.filter(({ movie }) => {
			if (!movie.releaseDate?.trim() || !movie.trailerYoutubeId?.trim()) return false;
			const isAlsoInTheaters = isTheatricalRelease(movie);
			return hasConfirmedStreamingPlatform(movie) && !isAlsoInTheaters && isReleased(movie);
		});
	const toRelease = ({ movie, platforms }: (typeof candidates)[number], dateLabel?: string) => ({
		slug: movie.slug,
		title: movie.title,
		year: movie.year,
		movieUrl: getMoviePath(movie.slug),
		releaseDate: movie.releaseDate!,
		dateLabel,
		posterUrl: getPosterUrl(movie.poster),
		videoUrl: getYoutubeWatchUrl(movie.trailerYoutubeId),
		verdictLabel: getVerdictLabel(movie),
		verdictClass: getVerdictBadgeClass(movie),
		platform: platforms.find((platform) => platform !== 'Cine' && platform !== 'Otras plataformas'),
	});
	const recentLoads = [...candidates]
		.filter(({ movie }) => {
			if (!movie.reviewPublishedAt) return false;
			const reviewPublishedTimestamp = getReviewPublishedTimestamp(movie);
			return reviewPublishedTimestamp >= earliestRecentLoadTimestamp && reviewPublishedTimestamp <= referenceTimestamp;
		})
		.sort(
			(left, right) =>
				getReviewPublishedTimestamp(right.movie) - getReviewPublishedTimestamp(left.movie) ||
				getMovieSortTimestamp(right.movie) - getMovieSortTimestamp(left.movie) ||
				left.movie.title.localeCompare(right.movie.title, 'es'),
		)
		.slice(0, recentLoadSlots);
	const currentPlatformReleases = candidates
		.filter(({ movie }) => {
			const releaseTimestamp = getMovieSortTimestamp(movie);
			return releaseTimestamp >= earliestReleaseTimestamp && releaseTimestamp <= referenceTimestamp;
		})
		.sort(
			(left, right) =>
				getMovieSortTimestamp(right.movie) - getMovieSortTimestamp(left.movie) ||
				left.movie.title.localeCompare(right.movie.title, 'es'),
		);
	const selected = [...recentLoads, ...currentPlatformReleases];
	const selectedSlugs = new Set<string>();
	const uniqueSelected = selected.filter(({ movie }) => {
		if (selectedSlugs.has(movie.slug)) return false;
		selectedSlugs.add(movie.slug);
		return true;
	});

	if (uniqueSelected.length < minimumItems) {
		const fallback = [...candidates]
			.sort(
				(left, right) =>
					getReviewPublishedTimestamp(right.movie) - getReviewPublishedTimestamp(left.movie) ||
					getMovieSortTimestamp(right.movie) - getMovieSortTimestamp(left.movie) ||
					left.movie.title.localeCompare(right.movie.title, 'es'),
			)
			.filter(({ movie }) => !selectedSlugs.has(movie.slug));
		uniqueSelected.push(...fallback.slice(0, minimumItems - uniqueSelected.length));
	}

	const recentLoadSlugs = new Set(recentLoads.map(({ movie }) => movie.slug));
	return uniqueSelected
		.slice(0, maximumItems)
		.map((entry) =>
			toRelease(entry, recentLoadSlugs.has(entry.movie.slug) ? 'Recién agregada' : undefined),
		);
}

function isFutureRelease(releaseDate: string, referenceTimestamp: number): boolean {
	const timestamp = getIsoDateTimestamp(releaseDate);
	return !Number.isNaN(timestamp) && timestamp > referenceTimestamp;
}

export function getVerdictLabel(movie: Pick<Movie, 'verdict' | 'verdictLabel' | 'absoluteCinema'>): string {
	if (isAbsoluteCinemaMovie(movie)) {
		return ABSOLUTE_CINEMA_LABEL;
	}
	if (movie.verdictLabel?.trim()) {
		const verdictLabel = movie.verdictLabel.trim();
		if (normalizeSearchText(verdictLabel).replace(/\s+/g, ' ') === 'se deja ver') {
			return 'Mas o menos';
		}
		return verdictLabel;
	}
	return VERDICT_LABELS[movie.verdict] ?? 'Sin definir';
}

export function getCinePostaScore(movie: Pick<Movie, 'verdict'>): number {
	switch (movie.verdict) {
		case 'recomendada':
			return 4;
		case 'zafa':
			return 3;
		case 'no_recomendada':
			return 2;
		case 'basura_atomica':
			return 1;
	}
}

export function isAbsoluteCinemaMovie(movie: Pick<Movie, 'verdictLabel' | 'absoluteCinema'>): boolean {
	if (movie.absoluteCinema) {
		return true;
	}
	const normalizedLabel = normalizeSearchText(movie.verdictLabel ?? '').replace(/\s+/g, ' ');
	return ABSOLUTE_CINEMA_SOURCE_LABELS.has(normalizedLabel);
}

export function normalizeSearchText(value: string): string {
	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim();
}

function cleanMovieTaxonomyList(values: string[] | undefined): string[] {
	return Array.isArray(values)
		? values
				.map((value) => (typeof value === 'string' ? value.trim() : ''))
				.filter(Boolean)
		: [];
}

function splitMovieTaxonomyFragments(value: string): string[] {
	return value
		.split(/[,/|]/g)
		.map((fragment) => fragment.trim())
		.filter(Boolean);
}

function getSubgenreDefinition(value: string): CanonicalSubgenreDefinition | undefined {
	const normalized = normalizeSearchText(value).replace(/\s+/g, ' ');
	if (!normalized) {
		return undefined;
	}

	return SUBGENRE_DEFINITIONS.find((definition) =>
		definition.matchers.some((matcher) => normalized.includes(matcher)),
	);
}

function createFallbackSubgenreLabel(value: string): string {
	const normalized = String(value ?? '').trim().replace(/\s+/g, ' ');
	if (!normalized) {
		return 'Subgénero';
	}

	return normalized.replace(/\b([a-záéíóúñü])([\p{L}\p{M}]*)/gu, (_, first: string, rest: string) => {
		const head = first.toLocaleUpperCase('es-AR');
		return `${head}${rest.toLocaleLowerCase('es-AR')}`;
	});
}

function createFallbackSubgenreOption(value: string): { id: string; label: string } | null {
	const label = createFallbackSubgenreLabel(value);
	const id = normalizeSearchText(label).replace(/\s+/g, '-');

	if (!label || !id) {
		return null;
	}

	return { id, label };
}

function isGenericSubgenreToken(value: string, normalizedCategory: string): boolean {
	return value === normalizedCategory || GENERIC_SUBGENRE_TOKENS.has(value);
}

function getMovieSubgenreOptions(
	movie: Pick<Movie, 'category' | 'genres' | 'subgenres'>,
): Array<{ id: string; label: string }> {
	const optionsById = new Map<string, { id: string; label: string }>();
	const normalizedCategory = normalizeSearchText(movie.category ?? '').replace(/\s+/g, ' ');

	const addValue = (value: string, allowCustom: boolean): void => {
		const fragments = [value, ...splitMovieTaxonomyFragments(value)];

		for (const fragment of fragments) {
			const normalizedFragment = normalizeSearchText(fragment).replace(/\s+/g, ' ');
			if (!normalizedFragment) {
				continue;
			}

			const canonicalOption = getSubgenreDefinition(fragment);
			if (canonicalOption) {
				optionsById.set(canonicalOption.id, {
					id: canonicalOption.id,
					label: canonicalOption.label,
				});
				continue;
			}

			if (isGenericSubgenreToken(normalizedFragment, normalizedCategory)) {
				continue;
			}

			if (!allowCustom) {
				continue;
			}

			const fallbackOption = createFallbackSubgenreOption(fragment);
			if (fallbackOption) {
				optionsById.set(fallbackOption.id, fallbackOption);
			}
		}
	};

	for (const subgenre of cleanMovieTaxonomyList(movie.subgenres)) {
		addValue(subgenre, true);
	}

	for (const genre of cleanMovieTaxonomyList(movie.genres)) {
		addValue(genre, false);
	}

	return Array.from(optionsById.values()).sort((left, right) => {
		const leftRank = SUBGENRE_SORT_ORDER.indexOf(left.id);
		const rightRank = SUBGENRE_SORT_ORDER.indexOf(right.id);
		const normalizedLeftRank = leftRank === -1 ? SUBGENRE_SORT_ORDER.length : leftRank;
		const normalizedRightRank = rightRank === -1 ? SUBGENRE_SORT_ORDER.length : rightRank;

		return normalizedLeftRank - normalizedRightRank || left.label.localeCompare(right.label, 'es');
	});
}

export function getMovieSubgenres(movie: Pick<Movie, 'category' | 'genres' | 'subgenres'>): string[] {
	return getMovieSubgenreOptions(movie).map((option) => option.label);
}

export function getCatalogFilterSubgenres(movie: Pick<Movie, 'category' | 'genres' | 'subgenres'>): string[] {
	return getMovieSubgenreOptions(movie).map((option) => option.id);
}

export function getSubgenreFilterOptions(
	movies: Pick<Movie, 'category' | 'genres' | 'subgenres'>[],
): SubgenreFilterOption[] {
	const countsByOption = new Map<string, SubgenreFilterOption>();

	for (const movie of movies) {
		for (const option of getMovieSubgenreOptions(movie)) {
			const current = countsByOption.get(option.id);
			countsByOption.set(option.id, {
				id: option.id,
				label: option.label,
				count: (current?.count ?? 0) + 1,
			});
		}
	}

	return Array.from(countsByOption.values()).sort((left, right) => {
		const leftRank = SUBGENRE_SORT_ORDER.indexOf(left.id);
		const rightRank = SUBGENRE_SORT_ORDER.indexOf(right.id);
		const normalizedLeftRank = leftRank === -1 ? SUBGENRE_SORT_ORDER.length : leftRank;
		const normalizedRightRank = rightRank === -1 ? SUBGENRE_SORT_ORDER.length : rightRank;

		return (
			normalizedLeftRank - normalizedRightRank ||
			right.count - left.count ||
			left.label.localeCompare(right.label, 'es')
		);
	});
}

function getGenreFilterOptionById(genreId: RecommendationGenreId): RecommendationGenreOption | undefined {
	return RECOMMENDATION_GENRE_OPTIONS.find((option) => option.id === genreId);
}

export function getPositiveVerdictFilterId(value: string): string {
	return normalizeSearchText(value).replace(/\s+/g, '-');
}

function getPositiveVerdictFilterRank(label: string): number {
	const normalizedLabel = normalizeSearchText(label).replace(/\s+/g, ' ');
	const orderIndex = POSITIVE_VERDICT_FILTER_ORDER.indexOf(normalizedLabel);
	return orderIndex === -1 ? POSITIVE_VERDICT_FILTER_ORDER.length : orderIndex;
}

export function getPositiveVerdictFilterOptions(movies: Movie[]): PositiveVerdictFilterOption[] {
	const countsByLabel = new Map<string, number>();

	for (const movie of movies) {
		if (movie.verdict !== 'recomendada' || isAbsoluteCinemaMovie(movie)) {
			continue;
		}

		const label = getVerdictLabel(movie).trim();
		if (!label) {
			continue;
		}
		const normalizedLabel = normalizeSearchText(label).replace(/\s+/g, ' ');
		if (!POSITIVE_VERDICT_FILTER_LABELS.has(normalizedLabel)) {
			continue;
		}

		countsByLabel.set(label, (countsByLabel.get(label) ?? 0) + 1);
	}

	return Array.from(countsByLabel.entries())
		.map(([label, count]) => ({
			id: getPositiveVerdictFilterId(label),
			label,
			count,
		}))
		.sort((left, right) => {
			const rankDelta = getPositiveVerdictFilterRank(left.label) - getPositiveVerdictFilterRank(right.label);
			if (rankDelta !== 0) {
				return rankDelta;
			}

			return right.count - left.count || left.label.localeCompare(right.label, 'es');
		});
}

function mapGenreToken(token: string, target: Set<RecommendationGenreId>): void {
	const normalized = normalizeSearchText(token).replace(/\s+/g, ' ');
	if (!normalized) return;

	if (normalized.includes('accion') || normalized === 'action') {
		target.add('accion');
	}
	const matchingSubgenre = getSubgenreDefinition(normalized);
	if (matchingSubgenre?.genreHints) {
		for (const hint of matchingSubgenre.genreHints) {
			target.add(hint);
		}
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
	if (
		normalized.includes('thriller') ||
		normalized.includes('suspenso') ||
		normalized.includes('suspense') ||
		normalized.includes('misterio') ||
		normalized.includes('mystery')
	) {
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

// "Guerra" is already used broadly in the inherited catalog, including films
// where the conflict is only a setting. "Bélica" is the explicit editorial
// signal for the home filter: it must be reserved for films whose war effort,
// front, operation or military experience is central to the story.
function hasExplicitWarFilmTag(values: string[]): boolean {
	return values.some((value) => normalizeSearchText(value) === 'belica');
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
	'blade runner',
];

const SUPERHERO_INCLUDED_SLUGS = new Set([
	'catwoman-2004',
	'constantine-2005',
	'dark-phoenix-2019',
	'jonah-hex-2010',
	'logan-2017',
	'the-dark-knight-2008',
	'the-dark-knight-rises-2012',
	'the-new-mutants-2020',
]);

// Curated from the cult-film criteria and examples in the linked Wikipedia
// article, plus catalog titles whose long-term cult status is explicit in
// their editorial treatment. Keep this as a title-level signal: the word
// "culto" can also describe a plot, a character or an actor and is not a
// reliable taxonomy on its own.
const CULT_MOVIE_SLUGS = new Set([
	'nosferatu-1922',
	'metropolis-1927',
	'the-wizard-of-oz-1939',
	'casablanca-1943',
	'seven-samurai-1954',
	'la-noche-del-cazador-1955',
	'psycho-1960',
	'la-dolce-vita-1960',
	'hola-mama-1970',
	'la-naranja-mecanica-1971',
	'el-hombre-de-mimbre-1973',
	'mean-streets-1973',
	'el-espectaculo-de-imagenes-de-terror-de-rocky-1975',
	'taxi-driver-1976',
	'suspiria-1977',
	'the-warriors-los-amos-de-la-noche-1979',
	'the-shining-1980',
	'los-perros-de-la-guerra-1980',
	'1997-rescate-en-nueva-york-1981',
	'the-evil-dead-1981',
	'blade-runner-1982',
	'grease-2-1982',
	'la-cosa-el-enigma-de-otro-mundo-1982',
	'el-ansia-1983',
	'el-precio-del-poder-1983',
	'the-terminator-1984',
	'brazil-la-pelicula-1985',
	'golpe-en-la-pequena-china-1986',
	'vellut-blau-1986',
	'terrorificamente-muertos-1987',
	'beetlejuice-1988',
	'reservoir-dogs-1992',
	'troll-2-1990',
	'el-demoledor-1993',
	'dependientes-1994',
	'pulp-fiction-1994',
	'tonto-y-retonto-1994',
	'mundo-acuatico-1995',
	'showgirls-1995',
	'trainspotting-1996',
	'dark-city-1998',
	'el-gran-lebowski-1998',
	'fight-club-1999',
	'the-matrix-1999',
	'trabajo-basura-1999',
	'psicopata-americano-2000',
	'donnie-darko-2001',
	'mulholland-drive-2001',
	'la-habitacion-the-room-2003',
	'napoleon-dynamite-2004',
	'the-descent-2005',
	'death-proof-2007',
	'scott-pilgrim-contra-el-mundo-2010',
	'la-montana-sagrada-1973',
	'el-planeta-salvaje-1973',
	'cabeza-borradora-1977',
	'the-brood-1979',
	'el-mas-alla-1981',
	'scanners-1981',
	'basket-case-1982',
	'the-dark-crystal-1982',
	'the-toxic-avenger-1984',
	're-animator-1985',
	'estan-vivos-1988',
	'tetsuo-the-iron-man-1989',
	'desafio-total-1990',
	'la-escalera-de-jacob-1990',
	'delicatessen-1991',
	'el-almuerzo-desnudo-1991',
	'el-cuervo-1994',
	'la-ciudad-de-los-ninos-perdidos-1995',
	'crash-extranos-placeres-1996',
	'jovenes-y-brujas-1996',
	'cube-1997',
	'horizonte-final-1997',
	'gummo-1997',
	'pi-fe-en-el-caos-1998',
	'el-circulo-1998',
	'the-faculty-1998',
	'existenz-1999',
	'audition-1999',
	'battle-royale-2000',
	'ghost-world-2001',
	'exterminio-2002',
	'kung-fu-sion-2004',
	'shaun-of-the-dead-2004',
	'el-maquinista-2004',
	'los-renegados-del-diablo-2005',
	'inside-2007',
	'the-human-centipede-first-sequence-2009',
	'dejame-entrar-2008',
	'rebobine-por-favor-2008',
	'enter-the-void-2009',
	'the-house-of-the-devil-2009',
	'la-cabana-del-terror-2012',
	'under-the-skin-2013',
	'bienvenidos-al-fin-del-mundo-2013',
	'babadook-2014',
	'una-chica-vuelve-a-casa-sola-de-noche-2014',
	'el-vacio-2016',
	'el-extrano-2016',
	'the-disaster-artist-2017',
	'climax-2018',
	'akira-1988',
	'ghost-in-the-shell-1995',
	'perfect-blue-1997',
	'paprika-detective-de-los-suenos-2006',
	'oldboy-2003',
	'ichi-the-killer-2001',
	'la-posesion-1981',
	'el-dia-de-la-bestia-1995',
	'candyman-1992',
	'martires-2008',
	'rec-2007',
	'house-1977',
	'planet-terror-2007',
	'terrifier-2016',
	'mandy-2018',
	'el-faro-2019',
	'la-bruja-2015',
	'videodrome-1983',
	'tu-madre-se-ha-comido-a-mi-perro-1992',
	'after-hours-1985',
]);

export function isCultMovie(movie: Pick<Movie, 'slug'>): boolean {
	return CULT_MOVIE_SLUGS.has(movie.slug);
}

function hasAnyToken(haystack: string, tokens: string[]): boolean {
	return tokens.some((token) => haystack.includes(token));
}

function isAnimationOrAnimeMovie(movie: Pick<Movie, 'category' | 'genres' | 'subgenres'>): boolean {
	const genreText = normalizeSearchText([movie.category ?? '', ...(movie.genres ?? []), ...(movie.subgenres ?? [])].join(' '));
	return (
		genreText.includes('animacion') ||
		genreText.includes('animation') ||
		genreText.includes('anime')
	);
}

function isMarvelOrDcSuperheroMovie(
	movie: Pick<Movie, 'slug' | 'title' | 'originalTitle' | 'category' | 'genres' | 'subgenres'>,
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
		'slug' | 'title' | 'originalTitle' | 'category' | 'genres' | 'subgenres' | 'country' | 'isArgentinian' | 'awards'
	>,
): RecommendationGenreId[] {
	const genreSet = new Set<RecommendationGenreId>();
	let hasAnimeToken = false;
	const sourceGenres = [...cleanMovieTaxonomyList(movie.genres), ...cleanMovieTaxonomyList(movie.subgenres)];

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

export function getCatalogFilterGenres(
	movie: Pick<
		Movie,
		'slug' | 'title' | 'originalTitle' | 'category' | 'genres' | 'subgenres' | 'country' | 'isArgentinian' | 'awards'
	>,
): RecommendationGenreId[] {
	const genreSet = new Set<RecommendationGenreId>();
	const normalizedCategory = normalizeSearchText(movie.category ?? '');
	let hasAnimeToken = false;
	const sourceGenres = [...cleanMovieTaxonomyList(movie.genres), ...cleanMovieTaxonomyList(movie.subgenres)];
	const explicitWarGenres = cleanMovieTaxonomyList(movie.genres);

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
		// The home filter should keep Japanese anime out of generic animation.
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

	if (hasExplicitWarFilmTag(explicitWarGenres)) {
		genreSet.add('guerra');
	}

	if (isCultMovie(movie)) {
		genreSet.add('culto');
	}

	return RECOMMENDATION_GENRE_OPTIONS.map((option) => option.id).filter((genreId) =>
		genreSet.has(genreId),
	);
}

export function getPrimaryGenreId(
	movie: Pick<Movie, 'category' | 'country'>,
): RecommendationGenreId | null {
	const categoryGenreSet = new Set<RecommendationGenreId>();
	const normalizedCategory = normalizeSearchText(movie.category ?? '');
	mapGenreToken(movie.category ?? '', categoryGenreSet);

	if (normalizedCategory.includes('anime') && movie.country?.trim().toUpperCase() === 'JP') {
		categoryGenreSet.delete('animacion');
		categoryGenreSet.add('anime');
	}

	return RECOMMENDATION_GENRE_OPTIONS.find((option) => categoryGenreSet.has(option.id))?.id ?? null;
}

export function getPrimaryGenreLabel(
	movie: Pick<
		Movie,
		'slug' | 'title' | 'originalTitle' | 'category' | 'genres' | 'subgenres' | 'country' | 'isArgentinian' | 'awards'
	>,
): string {
	const categoryGenre = getPrimaryGenreId(movie);

	if (categoryGenre) {
		return getGenreFilterOptionById(categoryGenre)?.label ?? movie.category?.trim() ?? 'Sin género';
	}

	const catalogGenreId = getCatalogFilterGenres(movie)[0];
	if (catalogGenreId) {
		return getGenreFilterOptionById(catalogGenreId)?.label ?? movie.category?.trim() ?? 'Sin género';
	}

	return movie.category?.trim() || 'Sin género';
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
			.filter((candidate): candidate is Movie => candidate !== undefined && candidate.slug !== movie.slug);
		if (preferred.length > 0) {
			return preferred.slice(0, 2);
		}
	}

	const generated = generateMovieEditorialRecommendations(movie, allMovies);
	return generated.becauseYouLiked
		.map((slug) => allMovies.find((candidate) => candidate.slug === slug))
		.filter((candidate): candidate is Movie => candidate !== undefined);
}

export function getBridgeRecommendations(movie: Movie, allMovies: Movie[]): MovieLinkRecommendation[] {
	return getBridgeAnchorCandidates(movie, allMovies).map((candidate) => getMovieLinkRecommendation(candidate));
}

function getRelatedMovieCandidates(movie: Movie, allMovies: Movie[]): Movie[] {
	const preferredRelatedSlugs = movie.editorial?.related ?? [];
	if (preferredRelatedSlugs.length > 0) {
		const preferred = preferredRelatedSlugs
			.map((slug) => allMovies.find((candidate) => candidate.slug === slug))
			.filter((candidate): candidate is Movie => candidate !== undefined && candidate.slug !== movie.slug);
		if (preferred.length > 0) {
			return preferred.slice(0, 4);
		}
	}

	const generated = generateMovieEditorialRecommendations(movie, allMovies);
	return generated.related
		.map((slug) => allMovies.find((candidate) => candidate.slug === slug))
		.filter((candidate): candidate is Movie => candidate !== undefined);
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

export function getVerdictBadgeClass(movie: Pick<Movie, 'verdict' | 'verdictLabel' | 'absoluteCinema'>): string {
	if (isAbsoluteCinemaMovie(movie)) {
		return 'badge--absolute-cinema';
	}
	const normalizedLabel = normalizeSearchText(getVerdictLabel(movie));
	if (normalizedLabel.includes('mediocre')) {
		return 'badge--zafa';
	}
	return `badge--${movie.verdict}`;
}

export function getAbsoluteCinemaStickerUrl(): string {
	return joinWithBase('AbsoluteCinema.png');
}

export function getCultMovieStickerUrl(): string {
	return joinWithBase('DeCulto.png');
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

export function getYoutubeEmbedUrl(youtubeId: string): string {
	const normalizedId = normalizeYoutubeId(youtubeId);
	return normalizedId ? `https://www.youtube.com/embed/${normalizedId}` : '';
}

export function getYoutubeAutoplayEmbedUrl(youtubeId: string): string {
	const normalizedId = normalizeYoutubeId(youtubeId);
	if (!normalizedId) {
		return '';
	}

	const params = new URLSearchParams({
		autoplay: '1',
		mute: '1',
		playsinline: '1',
		rel: '0',
		modestbranding: '1',
	});

	return `https://www.youtube.com/embed/${normalizedId}?${params.toString()}`;
}

export function getYoutubeWatchUrl(youtubeId: string): string {
	const normalizedId = normalizeYoutubeId(youtubeId);
	return normalizedId ? `https://www.youtube.com/watch?v=${normalizedId}` : '';
}

export function getYoutubeThumbnailUrl(youtubeId: string): string {
	const normalizedId = normalizeYoutubeId(youtubeId);
	return normalizedId ? `https://i.ytimg.com/vi/${normalizedId}/hqdefault.jpg` : '';
}

export function getMoviePath(slug: string): string {
	return joinWithBase(`peliculas/${slug}/`);
}

export { getMoviePlatformLabel, getMoviePlatforms } from './platforms';

