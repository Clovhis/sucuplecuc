import type { Movie, MovieVerdict } from '../types/movie';

const movieModules = import.meta.glob('../data/movies/*.json', { eager: true }) as Record<
	string,
	{ default: Movie }
>;

const VERDICT_LABELS: Record<MovieVerdict, string> = {
	recomendada: 'Recomendada',
	zafa: 'Zafa',
	no_recomendada: 'No recomendada',
	basura_atomica: 'Basura atomica',
};

export function getMovies(): Movie[] {
	return Object.values(movieModules)
		.map((moduleItem) => moduleItem.default)
		.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title, 'es'));
}

export function getVerdictLabel(verdict: MovieVerdict): string {
	return VERDICT_LABELS[verdict] ?? 'Sin definir';
}

export function getPosterUrl(poster: string): string {
	if (!poster) {
		return `${import.meta.env.BASE_URL}posters/poster-no-disponible.svg`;
	}
	if (/^https?:\/\//i.test(poster)) {
		return poster;
	}
	return `${import.meta.env.BASE_URL}${poster.replace(/^\/+/, '')}`;
}

export function getMoviePath(slug: string): string {
	return `${import.meta.env.BASE_URL}peliculas/${slug}/`;
}

