import type { Movie, MovieVerdict } from '../types/movie';
import { getCagazometroScore } from './cagazometro';
import { getExplosiometroScore } from './explosiometro';
import { getJajametroScore } from './jajametro';
import { getLagrimometroScore } from './lagrimometro';
import { getSangrometroScore } from './sangrometro';
import { getMoviePath, getVerdictLabel } from './movies';

export type EditorialMeterKind = 'explosiometro' | 'cagazometro' | 'jajametro' | 'lagrimometro' | 'sangrometro';

export interface EditorialRankingMovie {
	title: string;
	year: number;
	url: string;
	verdictLabel: string;
	meterKind: EditorialMeterKind;
	meterLabel: string;
	meterScore: number;
}

export interface EditorialRanking {
	id: string;
	title: string;
	description: string;
	movies: EditorialRankingMovie[];
	candidateMovies: EditorialRankingMovie[];
}

const POSITIVE_VERDICTS = new Set<MovieVerdict>(['recomendada', 'zafa']);

const METER_LABELS: Record<EditorialMeterKind, string> = {
	explosiometro: 'Explosiómetro',
	cagazometro: 'Cagazómetro',
	jajametro: 'Jajámetro',
	lagrimometro: 'Lagrimómetro',
	sangrometro: 'Sangrómetro',
};

function toRankingMovie(movie: Movie, meterKind: EditorialMeterKind, meterScore: number): EditorialRankingMovie {
	return {
		title: movie.title,
		year: movie.year,
		url: getMoviePath(movie.slug),
		verdictLabel: getVerdictLabel(movie),
		meterKind,
		meterLabel: METER_LABELS[meterKind],
		meterScore,
	};
}

function pickMovies(
	movies: Movie[],
	getMeterScore: (movie: Movie) => number | undefined,
	usedMovieSlugs: Set<string>,
	meterKind: EditorialMeterKind,
	limit = 3,
	candidateLimit = 12,
): { movies: EditorialRankingMovie[]; candidateMovies: EditorialRankingMovie[] } {
	const pickedMovies = movies
		.map((movie) => ({
			movie,
			meterScore: getMeterScore(movie),
		}))
		.filter(
			(entry): entry is { movie: Movie; meterScore: number } =>
				entry.meterScore !== undefined &&
				POSITIVE_VERDICTS.has(entry.movie.verdict) &&
				!usedMovieSlugs.has(entry.movie.slug),
		)
		.sort((left, right) => right.movie.year - left.movie.year || left.movie.title.localeCompare(right.movie.title, 'es'))
		.slice(0, candidateLimit);

	for (const { movie } of pickedMovies) {
		usedMovieSlugs.add(movie.slug);
	}

	const candidateMovies = pickedMovies.map(({ movie, meterScore }) => toRankingMovie(movie, meterKind, meterScore));

	return {
		movies: candidateMovies.slice(0, limit),
		candidateMovies,
	};
}

export function getEditorialRankings(movies: Movie[]): EditorialRanking[] {
	const usedMovieSlugs = new Set<string>();
	const rankings: EditorialRanking[] = [
		{
			id: 'accion-pochoclera',
			title: 'Acción pochoclera para desenchufar',
			description: 'Tiros, persecuciones, golpes y plan de sillón sin ponerse profunda.',
			...pickMovies(
				movies,
				getExplosiometroScore,
				usedMovieSlugs,
				'explosiometro',
			),
		},
		{
			id: 'gore-para-valientes',
			title: 'Gore para estómagos entrenados',
			description: 'Sangre, tripas y tortura de la que no conviene mirar cenando.',
			...pickMovies(
				movies,
				getSangrometroScore,
				usedMovieSlugs,
				'sangrometro',
			),
		},
		{
			id: 'terror-que-garpa',
			title: 'Terror que no da vergüenza ajena',
			description: 'Sustos, clima o tensión con algo más que ruido atrás.',
			...pickMovies(
				movies,
				getCagazometroScore,
				usedMovieSlugs,
				'cagazometro',
			),
		},
		{
			id: 'comedia-con-jajas',
			title: 'Comedias con jajás de verdad',
			description: 'Risas, remates y delirio con ganas de levantar el ánimo sin pedir perdón.',
			...pickMovies(
				movies,
				getJajametroScore,
				usedMovieSlugs,
				'jajametro',
			),
		},
		{
			id: 'lagrimon-garantizado',
			title: 'Para activar el lagrimón',
			description: 'Dramas y romances con chance real de dejarte buscando un pañuelo.',
			...pickMovies(
				movies,
				getLagrimometroScore,
				usedMovieSlugs,
				'lagrimometro',
			),
		},
	];

	return rankings.filter((ranking) => ranking.movies.length >= 2);
}
