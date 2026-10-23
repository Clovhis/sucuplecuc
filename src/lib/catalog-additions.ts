import type { Movie } from '../types/movie';

/** Actual catalog intake, independent of a film's release or review date. */
export function getLatestCatalogAdditions(movies: Movie[], referenceDate = new Date(), limit = 12): Movie[] {
	const today = new Intl.DateTimeFormat('en-CA', {
		timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit',
	}).format(referenceDate);
	return movies
		.filter((movie) => movie.catalogAddedAt && movie.catalogAddedAt <= today)
		.sort((a, b) => b.catalogAddedAt!.localeCompare(a.catalogAddedAt!) || a.title.localeCompare(b.title, 'es'))
		.slice(0, Math.max(0, limit));
}
