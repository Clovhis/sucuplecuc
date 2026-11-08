import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchCredits, selectMovie } from './character-matching.mjs';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const movie = { title: 'Ejemplo', originalTitle: 'Example', year: 2001, director: 'A Director', mainCast: ['Actor One', 'Actor Two'] };
const candidate = { id: 12, title: 'Example', original_title: 'Example', release_date: '2001-01-01' };
const credits = { crew: [{ job: 'Director', name: 'A Director' }], cast: [{ id: 1, name: 'Actor One', character: 'Hero / Twin' }, { id: 2, name: 'Actor Two', character: 'Friend' }] };
const people = { 'Actor One': { imdbId: 'nm1' }, 'Actor Two': { imdbId: 'nm2' } };
test('selecciona título y año exactos y rechaza resultados ambiguos', () => {
	assert.equal(selectMovie(movie, [candidate]), candidate);
	assert.equal(selectMovie(movie, [{ ...candidate, release_date: '2002-01-01' }]), null);
	assert.equal(selectMovie(movie, [candidate, { ...candidate, id: 13 }]), null);
});
test('exige director y dos identidades verificadas; conserva personajes múltiples', () => {
	const ids = { 1: 'nm1', 2: 'nm2' };
	assert.deepEqual(matchCredits(movie, credits, people, ids).credits.map((c) => c.character), ['Hero / Twin', 'Friend']);
	assert.equal(matchCredits(movie, credits, people, { 1: 'nm1', 2: 'nm-other' }).status, 'pending');
	assert.equal(matchCredits(movie, { ...credits, crew: [] }, people, ids).status, 'pending');
	assert.equal(matchCredits(movie, { ...credits, cast: [...credits.cast, credits.cast[0]] }, people, ids).status, 'pending');
	assert.equal(matchCredits(movie, credits, { 'Actor One': { imdbId: 'nm1' }, 'Actor Two': { imdbId: 'nm1' } }, ids).status, 'pending');
	assert.equal(matchCredits(movie, { ...credits, cast: [credits.cast[0], { ...credits.cast[1], name: 'Otro actor' }] }, people, ids).status, 'pending');
});
test('procesa, guarda y reanuda sin red ni sobrescribir créditos', async () => {
	const root = await mkdtemp(path.join(tmpdir(), 'cineposta-characters-'));
	try {
		await mkdir(path.join(root, 'src/data/movies'), { recursive: true });
		await writeFile(path.join(root, 'src/data/movies/test.json'), JSON.stringify(movie));
		await writeFile(path.join(root, 'src/data/people.json'), JSON.stringify(people));
		const script = fileURLToPath(new URL('./enrich-characters.mjs', import.meta.url));
		const fixture = pathToFileURL(fileURLToPath(new URL('./character-api-fixture.mjs', import.meta.url))).href;
		const run = (...args) => spawnSync(process.execPath, ['--import', fixture, script, '--slug', 'test', '--license-confirmed', ...args], { cwd: root, encoding: 'utf8', env: { ...process.env, TMDB_API_KEY: 'test-only' } });
		assert.equal(run().status, 0);
		assert.equal(JSON.parse(await readFile(path.join(root, 'src/data/movies/test.json'))).castCharacters, undefined);
		assert.equal(run('--apply').status, 0);
		const saved = JSON.parse(await readFile(path.join(root, 'src/data/movies/test.json')));
		assert.equal(saved.castCharacters.length, 2);
		assert.equal(saved.castCharacters[0].character, 'Hero');
		assert.match(run('--apply').stdout, /"processed": 0/);
		saved.castCharacters[0].verifiedAt = '2000-01-01';
		saved.castCharacters[0].variants = ['Alias verificado'];
		await writeFile(path.join(root, 'src/data/movies/test.json'), JSON.stringify(saved));
		const refresh = spawnSync(process.execPath, ['--import', fixture, script, '--slug', 'test', '--refresh', '--license-confirmed', '--apply'], { cwd: root, encoding: 'utf8', env: { ...process.env, TMDB_API_KEY: 'test-only' } });
		assert.equal(refresh.status, 0, refresh.stderr);
		const refreshed = JSON.parse(await readFile(path.join(root, 'src/data/movies/test.json')));
		assert.notEqual(refreshed.castCharacters[0].verifiedAt, '2000-01-01');
		assert.deepEqual(refreshed.castCharacters[0].variants, ['Alias verificado']);
		const beforeFailure = await readFile(path.join(root, 'src/data/movies/test.json'));
		const failed = spawnSync(process.execPath, ['--import', fixture, script, '--slug', 'test', '--refresh', '--license-confirmed', '--apply'], { cwd: root, encoding: 'utf8', env: { ...process.env, TMDB_API_KEY: 'test-only', CHARACTER_FIXTURE_FAILURE: '1' } });
		assert.notEqual(failed.status, 0);
		assert.deepEqual(await readFile(path.join(root, 'src/data/movies/test.json')), beforeFailure);
	} finally { await rm(root, { recursive: true, force: true }); }
});

test('el lote concurrente conserva todas las fichas y checkpoints', async () => {
	const root = await mkdtemp(path.join(tmpdir(), 'cineposta-characters-batch-'));
	try {
		await mkdir(path.join(root, 'src/data/movies'), { recursive: true });
		await writeFile(path.join(root, 'src/data/people.json'), JSON.stringify(people));
		for (let i = 0; i < 8; i++) await writeFile(path.join(root, `src/data/movies/movie-${i}.json`), JSON.stringify(movie));
		const script = fileURLToPath(new URL('./enrich-characters.mjs', import.meta.url));
		const fixture = pathToFileURL(fileURLToPath(new URL('./character-api-fixture.mjs', import.meta.url))).href;
		const run = spawnSync(process.execPath, ['--import', fixture, script, '--all', '--limit', '8', '--license-confirmed', '--apply'], { cwd: root, encoding: 'utf8', env: { ...process.env, TMDB_API_KEY: 'test-only' } });
		assert.equal(run.status, 0, run.stderr);
		assert.equal(Object.keys(JSON.parse(await readFile(path.join(root, 'reports/character-enrichment/checkpoint.json')))).length, 8);
		for (let i = 0; i < 8; i++) assert.equal(JSON.parse(await readFile(path.join(root, `src/data/movies/movie-${i}.json`))).castCharacters.length, 2);
	} finally { await rm(root, { recursive: true, force: true }); }
});
