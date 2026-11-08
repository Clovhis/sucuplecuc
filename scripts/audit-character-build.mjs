import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

// Compare every persisted credit with the static search index and movie HTML.
// The build directory may be a normal build or one generated with a future clock.
const buildDir = path.resolve(process.argv[2] ?? 'dist');
const payload = JSON.parse(await readFile(path.join(buildDir, 'search-index-v3.json'), 'utf8'));
assert.equal(payload.version, 3);
const bySlug = new Map(payload.movies.map((row) => [row[0], row[8] ?? []]));
let films = 0, credits = 0;
for (const file of (await readdir('src/data/movies')).filter((entry) => entry.endsWith('.json'))) {
	const movie = JSON.parse(await readFile(path.join('src/data/movies', file), 'utf8'));
	if (!movie.castCharacters?.length) continue;
	films++; credits += movie.castCharacters.length;
	const indexed = bySlug.get(movie.slug);
	assert.ok(Array.isArray(indexed), `${movie.slug}: no está en el índice`);
	assert.equal(indexed.length, movie.castCharacters.length, `${movie.slug}: cantidad distinta en el índice`);
	for (const credit of movie.castCharacters) {
		const found = indexed.find((entry) => entry.actor === credit.actor);
		assert.ok(found, `${movie.slug}: falta ${credit.actor}`);
		assert.equal(found.character, credit.displayCharacter ?? credit.character, `${movie.slug}: personaje incorrecto para ${credit.actor}`);
		const aliases = [credit.displayCharacter ? credit.character : undefined, ...(credit.variants ?? [])].filter(Boolean);
		for (const alias of aliases) assert.ok(found.variants?.includes(alias), `${movie.slug}: falta variante ${alias}`);
	}
	const html = await readFile(path.join(buildDir, 'peliculas', movie.slug, 'index.html'), 'utf8');
	const rendered = (html.match(/class="movie-detail__person-character"/g) ?? []).length;
	assert.equal(rendered, movie.castCharacters.length, `${movie.slug}: cantidad distinta en la ficha`);
}
console.log(JSON.stringify({ buildDir, films, credits, status: 'ok' }));
