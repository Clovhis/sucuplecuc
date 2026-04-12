import type { Movie, MovieVerdict } from '../types/movie';
import { GENERATED_UPCOMING_RELEASES } from '../data/upcomingReleases.generated';
import { UPCOMING_RELEASE_FALLBACKS } from '../data/upcomingReleases';
import { generateMovieEditorialRecommendations } from './recommendation-engine';

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

export interface UpcomingMovieRelease {
	slug: string;
	title: string;
	releaseDate: string;
	videoUrl: string;
	thumbnailUrl: string;
	sourceUrl?: string;
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

export function getUpcomingMovieReleases(referenceDate = new Date(), limit = 4): UpcomingMovieRelease[] {
	const referenceTimestamp = Date.UTC(
		referenceDate.getUTCFullYear(),
		referenceDate.getUTCMonth(),
		referenceDate.getUTCDate(),
	);

	const movies = Object.values(movieModules).map((moduleItem) => moduleItem.default);
	validateMovies(movies);

	const generatedUpcoming = GENERATED_UPCOMING_RELEASES.filter((release) => {
		const releaseDate = new Date(`${release.releaseDate}T00:00:00Z`);
		return !Number.isNaN(releaseDate.getTime()) && releaseDate.getTime() >= referenceTimestamp;
	}).slice(0, limit);

	if (generatedUpcoming.length > 0) {
		return generatedUpcoming;
	}

	const catalogUpcoming = movies
		.filter((movie) => {
			if (!movie.releaseDate?.trim() || !movie.trailerYoutubeId?.trim()) {
				return false;
			}

			const releaseTimestamp = getMovieSortTimestamp(movie);
			return releaseTimestamp >= referenceTimestamp;
		})
		.sort(
			(left, right) =>
				getMovieSortTimestamp(left) - getMovieSortTimestamp(right) ||
				left.title.localeCompare(right.title, 'es'),
		)
		.slice(0, limit)
		.map((movie) => ({
			slug: movie.slug,
			title: movie.title,
			releaseDate: movie.releaseDate!,
			videoUrl: getYoutubeWatchUrl(movie.trailerYoutubeId),
			thumbnailUrl: getYoutubeThumbnailUrl(movie.trailerYoutubeId),
		}));

	const releaseBySlug = new Map(catalogUpcoming.map((release) => [release.slug, release]));

	for (const fallback of UPCOMING_RELEASE_FALLBACKS) {
		if (releaseBySlug.has(fallback.slug)) {
			continue;
		}

		const releaseDate = new Date(`${fallback.releaseDate}T00:00:00Z`);
		if (Number.isNaN(releaseDate.getTime()) || releaseDate.getTime() < referenceTimestamp) {
			continue;
		}

		releaseBySlug.set(fallback.slug, {
			slug: fallback.slug,
			title: fallback.title,
			releaseDate: fallback.releaseDate,
			videoUrl: fallback.trailerUrl,
			thumbnailUrl: fallback.thumbnailUrl,
		});
	}

	return Array.from(releaseBySlug.values())
		.sort(
			(left, right) =>
				getMovieSortTimestamp({ year: 0, releaseDate: left.releaseDate }) -
					getMovieSortTimestamp({ year: 0, releaseDate: right.releaseDate }) ||
				left.title.localeCompare(right.title, 'es'),
		)
		.slice(0, limit);
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

export function getYoutubeEmbedUrl(youtubeId: string): string {
	const normalizedId = normalizeYoutubeId(youtubeId);
	return normalizedId ? `https://www.youtube.com/embed/${normalizedId}` : '';
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

export function getMovieTrailerPath(slug: string): string {
	return joinWithBase(`trailers/${slug}/`);
}

export { getMoviePlatformLabel, getMoviePlatforms } from './platforms';
