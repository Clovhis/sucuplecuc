import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';

const directory = new URL('../src/data/movies/', import.meta.url);
const movies = await Promise.all((await readdir(directory)).filter(file => file.endsWith('.json')).map(async file => JSON.parse(await readFile(new URL(file, directory), 'utf8'))));
const aliases = JSON.parse(await readFile(new URL('../src/data/movie-aliases.json', import.meta.url), 'utf8'));
const slugs = new Set(movies.map(movie => movie.slug));
for (const [oldSlug, canonical] of Object.entries(aliases)) {
	assert.ok(!slugs.has(oldSlug), `Retired duplicate reintroduced: ${oldSlug}`);
	assert.ok(slugs.has(canonical), `Missing canonical movie: ${canonical}`);
}
const normalize = value => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const titles = new Map();
for (const movie of movies) {
	for (const title of new Set([movie.title, movie.originalTitle].filter(Boolean).map(normalize))) {
		const key = `${movie.year}:${title}`;
		assert.ok(!titles.has(key) || titles.get(key) === movie.slug, `Possible duplicate: ${titles.get(key)} / ${movie.slug}`);
		titles.set(key, movie.slug);
	}
}
console.log(`Duplicate guard: ${movies.length} movies; titles/original titles + year and ${Object.keys(aliases).length} retired aliases checked.`);
