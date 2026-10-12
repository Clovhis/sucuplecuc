import { createHash } from 'node:crypto';
import { createHomeMovieRecord } from './home-catalog';
import { getMovies } from './movies';

// Compute once per build: HTML and the static JSON endpoint share the same snapshot.
const json = JSON.stringify(getMovies().map(createHomeMovieRecord));
const version = createHash('sha256').update(json).digest('hex').slice(0, 16);

export const HOME_SEARCH_INDEX_URL = `${import.meta.env.BASE_URL}search-index.json?v=${version}`;
export const getHomeSearchIndexJson = () => json;
