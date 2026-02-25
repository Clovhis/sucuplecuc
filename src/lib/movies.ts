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

function withTrailingSlash(value: string): string {
	return value.endsWith('/') ? value : `${value}/`;
}

function joinWithBase(pathPart: string): string {
	const base = withTrailingSlash(import.meta.env.BASE_URL || '/');
	return `${base}${pathPart.replace(/^\/+/, '')}`;
}

export function getMovies(): Movie[] {
	return Object.values(movieModules)
		.map((moduleItem) => moduleItem.default)
		.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title, 'es'));
}

export function getVerdictLabel(movie: Pick<Movie, 'verdict' | 'verdictLabel'>): string {
	if (movie.verdictLabel?.trim()) {
		return movie.verdictLabel.trim();
	}
	return VERDICT_LABELS[movie.verdict] ?? 'Sin definir';
}

function normalizeText(value: string): string {
	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim();
}

export function getVerdictBadgeClass(movie: Pick<Movie, 'verdict' | 'verdictLabel'>): string {
	const normalizedLabel = normalizeText(getVerdictLabel(movie));
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
