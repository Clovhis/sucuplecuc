import { createHash } from 'node:crypto';
import { createHomeMovieRecord } from './home-catalog';
import { getMovies } from './movies';
import { encodeHomeSearchIndex } from './home-search-codec';

// Compute once per build: HTML and the static JSON endpoint share the same snapshot.
const records = getMovies().map(createHomeMovieRecord);
const json = JSON.stringify(encodeHomeSearchIndex(records));
const version = createHash('sha256').update(json).digest('hex').slice(0, 16);

export const HOME_SEARCH_INDEX_URL = `${import.meta.env.BASE_URL}search-index-v3.json?v=${version}`;
export const getHomeSearchIndexJson = () => json;
// Old deployed HTML can still request its original transport shape.
export const getV2HomeSearchIndexJson = () => {
 const payload = encodeHomeSearchIndex(records);
 return JSON.stringify({ ...payload, version: 2, movies: payload.movies.map((row) => [...row.slice(0, 8), ...row.slice(9)]) });
};
// Keep old cached HTML and existing consumers working through the schema change.
export const getLegacyHomeSearchIndexJson = () => JSON.stringify(records);
