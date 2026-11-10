import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchCredits, selectMovie } from './character-matching.mjs';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const movie = { title: 'Example', originalTitle: 'Example', year: 2001, director: 'A Director', mainCast: ['Actor One', 'Actor Two'] };
const candidate = { id: 12, title: 'Example', original_title: 'Example', release_date: '2001-01-01' };
const credits = { crew: [{ job: 'Director', name: 'A Director' }], cast: [{ id: 1, name: 'Actor One', character: 'Hero / Twin' }, { id: 2, name: 'Actor Two', character: 'Friend' }] };
const people = { 'Actor One': { imdbId: 'nm1' }, 'Actor Two': { imdbId: 'nm2' } };
const script = fileURLToPath(new URL('./enrich-characters.mjs', import.meta.url));
const fixture = pathToFileURL(fileURLToPath(new URL('./character-api-fixture.mjs', import.meta.url))).href;
const moviePath = (root, slug) => path.join(root, 'src/data/movies', slug + '.json');
const run = (root, args, env) => spawnSync(process.execPath, ['--import', fixture, script, ...args], { cwd: root, encoding: 'utf8', env });
const report = (result) => JSON.parse(result.stdout.trim());

test('selecciona título, año e ID exactos y rechaza resultados ambiguos', () => {
	assert.equal(selectMovie(movie, [candidate]), candidate);
	assert.equal(selectMovie(movie, [{ ...candidate, release_date: '2002-01-01' }]), null);
	assert.equal(selectMovie(movie, [{ ...candidate, id: 0 }]), null);
	assert.equal(selectMovie(movie, [candidate, { ...candidate, id: 13 }]), null);
});

test('verifica director e identidad por IMDb y conserva personajes múltiples', () => {
	const ids = { 1: 'nm1', 2: 'nm2' };
	assert.deepEqual(matchCredits(movie, credits, people, ids, 42).credits.map((credit) => credit.character), ['Hero / Twin', 'Friend']);
	assert.equal(matchCredits(movie, credits, people, { 1: 'nm1', 2: 'nm-other' }, 42).status, 'pending');
	assert.equal(matchCredits(movie, { ...credits, crew: [] }, people, ids, 42).status, 'pending');
	assert.equal(matchCredits(movie, { ...credits, cast: [...credits.cast, credits.cast[0]] }, people, ids, 42).status, 'pending');
	assert.equal(matchCredits(movie, credits, { 'Actor One': { imdbId: 'nm1' }, 'Actor Two': { imdbId: 'nm1' } }, ids, 42).status, 'pending');
	assert.equal(matchCredits(movie, { ...credits, cast: [credits.cast[0], { ...credits.cast[1], name: 'Otro actor' }] }, people, ids, 42).status, 'pending');
});

test('alta individual agrega créditos verificados y no vuelve a consultar una ficha resuelta', async () => {
	const root = await mkdtemp(path.join(tmpdir(), 'cineposta-characters-single-'));
	try {
		await mkdir(path.join(root, 'src/data/movies'), { recursive: true });
		await writeFile(moviePath(root, 'test'), JSON.stringify(movie));
		await writeFile(path.join(root, 'src/data/people.json'), JSON.stringify(people));
		const env = { ...process.env, TMDB_API_KEY: 'test-only' };
		const preview = run(root, ['--slug', 'test'], env);
		assert.equal(preview.status, 0, preview.stderr);
		assert.equal(JSON.parse(await readFile(moviePath(root, 'test'), 'utf8')).castCharacters, undefined);
		const applied = run(root, ['--slug', 'test', '--apply'], env);
		assert.equal(applied.status, 0, applied.stderr);
		const saved = JSON.parse(await readFile(moviePath(root, 'test'), 'utf8'));
		assert.equal(saved.castCharacters.length, 2);
		assert.equal(saved.castCharacters[0].character, 'Hero');
		assert.equal(report(applied).appliedCredits, 2);
		const noKey = { ...process.env };
		delete noKey.TMDB_API_KEY;
		const rerun = run(root, ['--slug', 'test', '--apply'], noKey);
		assert.equal(rerun.status, 0, rerun.stderr);
		assert.equal(report(rerun).skippedVerified, 1);
		assert.deepEqual(JSON.parse(await readFile(moviePath(root, 'test'), 'utf8')), saved);
	} finally { await rm(root, { recursive: true, force: true }); }
});

test('completa un reparto parcial y conserva exactamente el personaje ya verificado', async () => {
	const root = await mkdtemp(path.join(tmpdir(), 'cineposta-characters-partial-'));
	try {
		await mkdir(path.join(root, 'src/data/movies'), { recursive: true });
		const argentinaToday = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
		const existingCredit = { actor: 'Actor One', character: 'Verified original role', tmdbMovieId: 42, tmdbPersonId: 1, verifiedAt: '2026-10-01' };
		const partial = { ...movie, castCharacters: [existingCredit] };
		await writeFile(moviePath(root, 'partial'), JSON.stringify(partial));
		await writeFile(path.join(root, 'src/data/people.json'), JSON.stringify(people));
		const result = run(root, ['--slug', 'partial', '--apply'], { ...process.env, TMDB_API_KEY: 'test-only' });
		assert.equal(result.status, 0, result.stderr);
		assert.equal(report(result).processed, 1);
		assert.equal(report(result).appliedCredits, 1);
		assert.equal(report(result).skippedVerified, 0);
		const saved = JSON.parse(await readFile(moviePath(root, 'partial'), 'utf8'));
		assert.deepEqual(saved.castCharacters, [existingCredit, {
			actor: 'Actor Two', character: 'Friend', tmdbMovieId: 42, tmdbPersonId: 2, verifiedAt: argentinaToday,
		}]);
	} finally { await rm(root, { recursive: true, force: true }); }
});

test('el lote procesa todas las fichas seleccionadas sin un tope por defecto', async () => {
	const root = await mkdtemp(path.join(tmpdir(), 'cineposta-characters-batch-'));
	try {
		await mkdir(path.join(root, 'src/data/movies'), { recursive: true });
		await writeFile(path.join(root, 'src/data/people.json'), JSON.stringify(people));
		for (let index = 0; index < 8; index++) await writeFile(moviePath(root, 'movie-' + index), JSON.stringify(movie));
		const result = run(root, ['--all', '--apply'], { ...process.env, TMDB_API_KEY: 'test-only' });
		assert.equal(result.status, 0, result.stderr);
		assert.equal(report(result).selected, 8);
		assert.equal(report(result).processed, 8);
		assert.equal(Object.keys(JSON.parse(await readFile(path.join(root, 'reports/character-enrichment/checkpoint.json'), 'utf8'))).length, 8);
		for (let index = 0; index < 8; index++) assert.equal(JSON.parse(await readFile(moviePath(root, 'movie-' + index), 'utf8')).castCharacters.length, 2);
	} finally { await rm(root, { recursive: true, force: true }); }
});

test('sin credenciales deja todos los pendientes y procesa más de 50 fichas', async () => {
	const root = await mkdtemp(path.join(tmpdir(), 'cineposta-characters-no-key-'));
	try {
		await mkdir(path.join(root, 'src/data/movies'), { recursive: true });
		await writeFile(path.join(root, 'src/data/people.json'), JSON.stringify(people));
		const selected = 64;
		for (let index = 0; index < selected; index++) await writeFile(moviePath(root, 'pending-' + index), JSON.stringify(movie));
		const env = { ...process.env };
		delete env.TMDB_API_KEY;
		const result = run(root, ['--all', '--apply'], env);
		assert.equal(result.status, 0, result.stderr);
		assert.equal(report(result).processed, selected);
		assert.equal(report(result).pending, selected);
		const checkpoint = JSON.parse(await readFile(path.join(root, 'reports/character-enrichment/checkpoint.json'), 'utf8'));
		assert.equal(Object.keys(checkpoint).length, selected);
		assert.ok(Object.values(checkpoint).every((entry) => entry.reason === 'missing-tmdb-api-key'));
		assert.equal(JSON.parse(await readFile(moviePath(root, 'pending-0'), 'utf8')).castCharacters, undefined);
	} finally { await rm(root, { recursive: true, force: true }); }
});

test('falla de API queda pendiente, continúa el lote y conserva créditos ya guardados', async () => {
	const root = await mkdtemp(path.join(tmpdir(), 'cineposta-characters-api-error-'));
	try {
		await mkdir(path.join(root, 'src/data/movies'), { recursive: true });
		await writeFile(path.join(root, 'src/data/people.json'), JSON.stringify(people));
		const existing = {
			...movie,
			castCharacters: [{ actor: 'Actor One', character: 'Original', tmdbMovieId: 42, tmdbPersonId: 1, verifiedAt: '2001-01-01' }],
		};
		await writeFile(moviePath(root, 'already-enriched'), JSON.stringify(existing));
		await writeFile(moviePath(root, 'api-error'), JSON.stringify(movie));
		const result = run(root, ['--all', '--apply'], { ...process.env, TMDB_API_KEY: 'test-only', CHARACTER_FIXTURE_FAILURE: '1' });
		assert.equal(result.status, 0, result.stderr);
		assert.equal(report(result).processed, 2);
		assert.equal(report(result).pending, 2);
		assert.equal(report(result).skippedVerified, 0);
		const checkpoint = JSON.parse(await readFile(path.join(root, 'reports/character-enrichment/checkpoint.json'), 'utf8'));
		assert.equal(checkpoint['already-enriched.json'].reason, 'tmdb-api-unavailable');
		assert.equal(checkpoint['api-error.json'].reason, 'tmdb-api-unavailable');
		assert.deepEqual(JSON.parse(await readFile(moviePath(root, 'already-enriched'), 'utf8')), existing);
		assert.equal(JSON.parse(await readFile(moviePath(root, 'api-error'), 'utf8')).castCharacters, undefined);
	} finally { await rm(root, { recursive: true, force: true }); }
});

test('personajes ausentes quedan pendientes sin inventar datos ni bloquear el alta', async () => {
	const root = await mkdtemp(path.join(tmpdir(), 'cineposta-characters-empty-'));
	try {
		await mkdir(path.join(root, 'src/data/movies'), { recursive: true });
		await writeFile(path.join(root, 'src/data/people.json'), JSON.stringify(people));
		await writeFile(moviePath(root, 'empty'), JSON.stringify(movie));
		const result = run(root, ['--slug', 'empty', '--apply'], { ...process.env, TMDB_API_KEY: 'test-only', CHARACTER_FIXTURE_NO_CHARACTERS: '1' });
		assert.equal(result.status, 0, result.stderr);
		assert.equal(report(result).pending, 1);
		assert.equal(JSON.parse(await readFile(moviePath(root, 'empty'), 'utf8')).castCharacters, undefined);
	} finally { await rm(root, { recursive: true, force: true }); }
});
