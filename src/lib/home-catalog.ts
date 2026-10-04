import type { Movie } from '../types/movie';
import type { HomeMovieRecord } from '../types/home-catalog';
import {
	getCatalogFilterGenres, getCatalogFilterSubgenres, getMovieSubgenres, getMoviePath,
	getMoviePlatformLabel, getMoviePlatforms, getMovieSortTimestamp, getPrimaryGenreId,
	getMovieGenreLabels, getPosterUrl, getVerdictBadgeClass, getVerdictLabel, isCultMovie,
	isRecentPremiere, normalizeSearchText,
} from './movies';
import { getNormalizedMoviePlatforms } from './platforms';

export function createHomeMovieRecord(movie: Movie): HomeMovieRecord {
	const verdictLabel = getVerdictLabel(movie);
	const platforms = getMoviePlatforms(movie);
	const genreLabels = getMovieGenreLabels(movie);
	const meta = [String(movie.year), ...genreLabels, getMoviePlatformLabel(movie)].filter(Boolean).join(' · ');
	const cast = movie.mainCast.slice(0, 2).join(', ');
	return {
		slug: movie.slug,
		title: movie.title,
		year: String(movie.year),
		// Preserve every field that the original MovieCard search included, including synopsis.
		searchable: normalizeSearchText([
			movie.title, movie.originalTitle, movie.synopsis, String(movie.year), movie.category,
			movie.audienceRating, ...platforms, ...getMovieSubgenres(movie), movie.director,
			movie.productionCompany, ...(movie.mainCast ?? []), verdictLabel, movie.slug,
		].join(' ')),
		normalizedTitle: normalizeSearchText(movie.title),
		normalizedOriginalTitle: normalizeSearchText(movie.originalTitle ?? ''),
		normalizedMeta: normalizeSearchText(`${meta} ${cast}`),
		releaseTimestamp: getMovieSortTimestamp(movie),
		recentPremiere: isRecentPremiere(movie),
		score: movie.cinepostaScore ?? null,
		url: getMoviePath(movie.slug),
		posterUrl: getPosterUrl(movie.poster),
		meta, cast,
		platforms: getNormalizedMoviePlatforms(movie),
		genres: getCatalogFilterGenres(movie),
		subgenres: getCatalogFilterSubgenres(movie),
		primaryGenre: getPrimaryGenreId(movie) ?? '',
		card: {
			verdictLabel,
			verdictClass: getVerdictBadgeClass(movie),
			genreLabels: genreLabels.includes('Musical') ? genreLabels : [movie.category],
			audienceRating: movie.audienceRating,
			cult: isCultMovie(movie),
			platformLabels: platforms,
		},
	};
}
