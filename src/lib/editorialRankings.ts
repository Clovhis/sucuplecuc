import type { Movie, MovieVerdict } from '../types/movie';
import { getMoviePath, normalizeSearchText } from './movies';

export interface EditorialRankingMovie {
	title: string;
	year: number;
	url: string;
	verdictLabel: string;
}

export interface EditorialRanking {
	id: string;
	title: string;
	description: string;
	movies: EditorialRankingMovie[];
}

const POSITIVE_VERDICTS = new Set<MovieVerdict>(['recomendada', 'zafa']);

function hasAnySignal(movie: Movie, signals: string[]): boolean {
	const haystack = normalizeSearchText([
		movie.category,
		...(movie.genres ?? []),
		movie.title,
		movie.synopsis,
		movie.review,
	].join(' '));

	return signals.some((signal) => haystack.includes(normalizeSearchText(signal)));
}

function toRankingMovie(movie: Movie): EditorialRankingMovie {
	return {
		title: movie.title,
		year: movie.year,
		url: getMoviePath(movie.slug),
		verdictLabel: movie.verdictLabel?.trim() || movie.verdict.replace(/_/g, ' '),
	};
}

function pickMovies(
	movies: Movie[],
	predicate: (movie: Movie) => boolean,
	usedMovieSlugs: Set<string>,
	limit = 3,
): EditorialRankingMovie[] {
	const pickedMovies = movies
		.filter((movie) => POSITIVE_VERDICTS.has(movie.verdict) && !usedMovieSlugs.has(movie.slug) && predicate(movie))
		.sort((left, right) => right.year - left.year || left.title.localeCompare(right.title, 'es'))
		.slice(0, limit);

	for (const movie of pickedMovies) {
		usedMovieSlugs.add(movie.slug);
	}

	return pickedMovies.map(toRankingMovie);
}

export function getEditorialRankings(movies: Movie[]): EditorialRanking[] {
	const usedMovieSlugs = new Set<string>();
	const rankings: EditorialRanking[] = [
		{
			id: 'accion-pochoclera',
			title: 'Acción pochoclera para apagar la cabeza',
			description: 'Tiros, persecuciones, golpes y plan de sillón sin pedir permiso.',
			movies: pickMovies(
				movies,
				(movie) => hasAnySignal(movie, ['acción', 'action', 'aventura', 'superhéroes', 'superheroes', 'thriller']),
				usedMovieSlugs,
			),
		},
		{
			id: 'terror-que-garpa',
			title: 'Terror que no es una poronga',
			description: 'Sustos, clima o tensión que por lo menos tienen una idea atrás.',
			movies: pickMovies(
				movies,
				(movie) => hasAnySignal(movie, ['terror', 'horror', 'thriller']),
				usedMovieSlugs,
			),
		},
		{
			id: 'pareja-sin-dormirse',
			title: 'Películas para ver en pareja sin dormirse',
			description: 'Planes con charla después, sin convertir la noche en trámite.',
			movies: pickMovies(
				movies,
				(movie) => hasAnySignal(movie, ['romance', 'comedia', 'drama']),
				usedMovieSlugs,
			),
		},
		{
			id: 'cine-argentino-garpa',
			title: 'Cine argentino que sí garpa',
			description: 'Historias de acá que sostienen personalidad, oficio o una mirada propia.',
			movies: pickMovies(
				movies,
				(movie) =>
					movie.isArgentinian === true ||
					hasAnySignal(movie, ['argentina', 'argentino', 'buenos aires', 'rioplatense']),
				usedMovieSlugs,
			),
		},
	];

	return rankings.filter((ranking) => ranking.movies.length >= 2);
}
