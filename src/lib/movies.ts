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
	| 'terror'
	| 'drama'
	| 'thriller'
	| 'sci-fi'
	| 'animacion'
	| 'anime'
	| 'romance'
	| 'crimen'
	| 'aventura'
	| 'pelicula-nacional';

export interface RecommendationGenreOption {
	id: RecommendationGenreId;
	label: string;
}

export const RECOMMENDATION_GENRE_OPTIONS: RecommendationGenreOption[] = [
	{ id: 'accion', label: 'Acción' },
	{ id: 'comedia', label: 'Comedia' },
	{ id: 'terror', label: 'Terror' },
	{ id: 'drama', label: 'Drama' },
	{ id: 'thriller', label: 'Thriller' },
	{ id: 'sci-fi', label: 'Sci-Fi' },
	{ id: 'animacion', label: 'Animación' },
	{ id: 'anime', label: 'Anime' },
	{ id: 'romance', label: 'Romance' },
	{ id: 'crimen', label: 'Crimen' },
	{ id: 'aventura', label: 'Aventura' },
	{ id: 'pelicula-nacional', label: 'Pelicula Nacional' },
];

export interface RecommendationMovie {
	slug: string;
	title: string;
	year: number;
	posterUrl: string;
	screenshotUrls: string[];
	verdictLabel: string;
	verdictClass: string;
	url: string;
	genres: RecommendationGenreId[];
}

function withTrailingSlash(value: string): string {
	return value.endsWith('/') ? value : `${value}/`;
}

function joinWithBase(pathPart: string): string {
	const base = withTrailingSlash(import.meta.env.BASE_URL || '/');
	return `${base}${pathPart.replace(/^\/+/, '')}`;
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
		if (!movie.category?.trim()) {
			throw new Error(`Movie "${slug}" is missing category.`);
		}
		if (!movie.director?.trim()) {
			throw new Error(`Movie "${slug}" is missing director.`);
		}
		if (!movie.productionCompany?.trim()) {
			throw new Error(`Movie "${slug}" is missing productionCompany.`);
		}
		if (movie.releaseDate !== undefined) {
			if (!/^\d{4}-\d{2}-\d{2}$/.test(movie.releaseDate)) {
				throw new Error(`Movie "${slug}" has invalid releaseDate format. Use YYYY-MM-DD.`);
			}
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

export function getMovies(): Movie[] {
	const movies = Object.values(movieModules)
		.map((moduleItem) => moduleItem.default)
		.filter((movie) => isReleased(movie))
		.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title, 'es'));

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

export function getRecommendationGenres(
	movie: Pick<Movie, 'category' | 'genres' | 'country' | 'isArgentinian'>,
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

	return RECOMMENDATION_GENRE_OPTIONS.map((option) => option.id).filter((genreId) =>
		genreSet.has(genreId),
	);
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

export function getRecommendationMovies(): RecommendationMovie[] {
	return getMovies().map((movie) => ({
		slug: movie.slug,
		title: movie.title,
		year: movie.year,
		posterUrl: getPosterUrl(movie.poster),
		screenshotUrls: (movie.screenshots ?? [])
			.filter((shot) => typeof shot === 'string' && shot.trim().length > 0)
			.map((shot) => getPosterUrl(shot)),
		verdictLabel: getVerdictLabel(movie),
		verdictClass: getVerdictBadgeClass(movie),
		url: getMoviePath(movie.slug),
		genres: getRecommendationGenres(movie),
	}));
}
