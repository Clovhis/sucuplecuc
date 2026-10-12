import type { Movie } from '../types/movie';

export const MOVIE_CATALOG_PAGE_SIZE = 48;
export const MOVIE_CATALOG_PATH = '/catalogo/';

export function getMovieCatalogPath(page = 1): string {
	return page === 1 ? MOVIE_CATALOG_PATH : `${MOVIE_CATALOG_PATH}${page}/`;
}

export function getMovieCatalogPages(movies: Movie[]) {
	return Array.from({ length: Math.ceil(movies.length / MOVIE_CATALOG_PAGE_SIZE) }, (_, index) => ({
		number: index + 1,
		movies: movies.slice(index * MOVIE_CATALOG_PAGE_SIZE, (index + 1) * MOVIE_CATALOG_PAGE_SIZE),
	}));
}
