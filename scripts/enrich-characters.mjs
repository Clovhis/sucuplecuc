import { mkdir, readFile, readdir, writeFile, rename, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { createHash } from 'node:crypto';
import { matchCredits, normalize, selectMovie } from './character-matching.mjs';
import { appendVerifiedCharacterCredits, validateCharacterChanges } from './character-change-policy.mjs';

try { process.loadEnvFile('.env.local'); } catch (error) { if (error.code !== 'ENOENT') throw error; }

const argv = process.argv.slice(2);
const value = (flag) => { const index = argv.indexOf(flag); return index < 0 ? undefined : argv[index + 1]; };
const has = (flag) => argv.includes(flag);
const valueFlags = new Set(['--slug']);
const booleanFlags = new Set(['--help', '--changed', '--all', '--apply', '--retry-pending']);

if (has('--help')) {
	console.log('Uso: npm run enrich:characters -- (--slug SLUG | --changed | --all) [--apply] [--retry-pending]\nConsulta TMDB sólo para fichas sin personajes verificados. Los créditos guardados se conservan.');
	process.exit(0);
}
for (let index = 0; index < argv.length; index++) {
	const argument = argv[index];
	if (valueFlags.has(argument)) {
		if (!argv[index + 1] || argv[index + 1].startsWith('--')) throw new Error(argument + ' requiere un valor.');
		index++;
	} else if (!booleanFlags.has(argument)) {
		throw new Error('Argumento desconocido: ' + argument);
	}
}
if (argv.filter((argument) => argument === '--slug').length > 1) throw new Error('--slug sólo puede aparecer una vez.');
if ([has('--slug'), has('--changed'), has('--all')].filter(Boolean).length !== 1) throw new Error('Elegí exactamente uno de --slug, --changed o --all.');

const movieDir = path.resolve('src/data/movies');
const stateDir = path.resolve('reports/character-enrichment');
const cacheDir = path.join(stateDir, 'cache');
const checkpointPath = path.join(stateDir, 'checkpoint.json');
const checkpoint = await readJson(checkpointPath, {});
let files = (await readdir(movieDir)).filter((file) => file.endsWith('.json')).sort();
if (has('--slug')) files = files.filter((file) => file === value('--slug') + '.json');
if (has('--changed')) {
	const diff = execFileSync('git', ['diff', '--name-only', 'origin/main', '--', 'src/data/movies'], { encoding: 'utf8' });
	const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard', '--', 'src/data/movies'], { encoding: 'utf8' });
	const changed = new Set((diff + '\n' + untracked).split(/\r?\n/).filter(Boolean).map((file) => path.basename(file)));
	files = files.filter((file) => changed.has(file));
}
if (has('--slug') && files.length === 0) throw new Error('No existe la ficha solicitada.');
await mkdir(stateDir, { recursive: true });
const people = await readJson('src/data/people.json', {});

async function readJson(file, fallback) {
	try { return JSON.parse(await readFile(file, 'utf8')); }
	catch (error) { if (error.code === 'ENOENT') return fallback; throw error; }
}
async function atomic(file, data, indent = 2, newline = '\n') {
	const temporary = file + '.tmp';
	await writeFile(temporary, (JSON.stringify(data, null, indent) + '\n').replaceAll('\n', newline));
	await rename(temporary, file);
}
let checkpointWrites = Promise.resolve();
function saveCheckpoint() {
	checkpointWrites = checkpointWrites.then(() => atomic(checkpointPath, checkpoint));
	return checkpointWrites;
}

const apiKey = process.env.TMDB_API_KEY?.trim();
const CACHE_TTL_MS = 90 * 24 * 60 * 60 * 1000;
let nextRequestAt = 0;
const inflight = new Map();

class TmdbRequestError extends Error {
	constructor(message) { super(message); this.name = 'TmdbRequestError'; }
}

async function request(endpoint, params = {}, context) {
	await mkdir(cacheDir, { recursive: true });
	const url = new URL('https://api.themoviedb.org/3' + endpoint);
	for (const [name, value] of Object.entries(params)) url.searchParams.set(name, String(value));
	const cacheKey = url.pathname + url.search;
	const cachePath = path.join(cacheDir, createHash('sha256').update(cacheKey).digest('hex') + '.json');
	const cached = await readJson(cachePath, null);
	if (cached !== null && !has('--retry-pending')) {
		const cachedStat = await stat(cachePath);
		if (Date.now() - cachedStat.mtimeMs < CACHE_TTL_MS) {
			context.oldestResponse = Math.min(context.oldestResponse, cachedStat.mtimeMs);
			return cached;
		}
	}
	if (inflight.has(cacheKey)) {
		const result = await inflight.get(cacheKey);
		context.oldestResponse = Math.min(context.oldestResponse, result.at);
		return result.data;
	}
	const pending = fetchAndCache();
	inflight.set(cacheKey, pending);
	try {
		const result = await pending;
		context.oldestResponse = Math.min(context.oldestResponse, result.at);
		return result.data;
	} finally {
		inflight.delete(cacheKey);
	}

	async function fetchAndCache() {
		url.searchParams.set('api_key', apiKey);
		for (let attempt = 0; attempt < 4; attempt++) {
			const start = Math.max(Date.now(), nextRequestAt);
			nextRequestAt = start + 100;
			await delay(Math.max(0, start - Date.now()));
			let response;
			try { response = await fetch(url, { signal: AbortSignal.timeout(15000) }); }
			catch { await delay(Math.min(30000, 1000 * 2 ** attempt)); continue; }
			if (response.status === 429 || response.status >= 500) {
				const retry = response.headers.get('retry-after');
				const retryDate = retry ? Date.parse(retry) : NaN;
				const seconds = retry && /^\d+$/.test(retry) ? Number(retry) * 1000 : Number.isFinite(retryDate) ? Math.max(0, retryDate - Date.now()) : 0;
				if (seconds > 60000) throw new TmdbRequestError('TMDB requiere una pausa de ' + Math.ceil(seconds / 1000) + ' segundos.');
				const pause = Math.min(60000, Math.max(seconds, 1000 * 2 ** attempt));
				nextRequestAt = Math.max(nextRequestAt, Date.now() + pause);
				await delay(pause);
				continue;
			}
			if (!response.ok) throw new TmdbRequestError('TMDB HTTP ' + response.status + ' en ' + url.pathname);
			let data;
			try { data = await response.json(); }
			catch { throw new TmdbRequestError('TMDB devolvió una respuesta JSON inválida en ' + url.pathname); }
			if (!data || typeof data !== 'object' || Array.isArray(data)) throw new TmdbRequestError('TMDB devolvió una respuesta inválida en ' + url.pathname);
			await atomic(cachePath, data);
			return { data, at: Date.now() };
		}
		throw new TmdbRequestError('TMDB agotó los reintentos en ' + url.pathname);
	}
}

function argentinaDate(timestamp = Date.now()) {
	return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(timestamp));
}

let processed = 0;
let pendingCount = 0;
let skippedVerified = 0;
let appliedCredits = 0;
let cursor = 0;
let fatalError;

async function processFile(file) {
	const filePath = path.join(movieDir, file);
	const original = await readFile(filePath, 'utf8');
	const movie = JSON.parse(original);
	validateCharacterChanges(movie, file);
	const selectedActors = Array.isArray(movie.mainCast) ? movie.mainCast.map(normalize).filter(Boolean) : [];
	const existingCharacterActors = new Set((movie.castCharacters ?? []).map((credit) => normalize(credit.actor)).filter(Boolean));
	if (movie.castCharacters?.length && selectedActors.length > 0 && selectedActors.every((actor) => existingCharacterActors.has(actor))) {
		skippedVerified++;
		return;
	}

	processed++;
	const fingerprint = createHash('sha256').update(JSON.stringify([movie.title, movie.originalTitle, movie.year, movie.director, movie.mainCast])).digest('hex');
	const checkedAt = argentinaDate();
	if (!apiKey) {
		checkpoint[file] = { status: 'pending', fingerprint, checkedAt, reason: 'missing-tmdb-api-key' };
		pendingCount++;
		await saveCheckpoint();
		return;
	}

	const context = { oldestResponse: Date.now() };
	try {
		const title = movie.originalTitle || movie.title;
		const search = await request('/search/movie', { query: title, year: String(movie.year), language: 'en-US', include_adult: 'false' }, context);
		if (!Array.isArray(search.results)) throw new TmdbRequestError('TMDB no devolvió resultados de películas válidos.');
		if (search.total_pages > 1) {
			checkpoint[file] = { status: 'pending', fingerprint, checkedAt, reason: 'busqueda-con-multiples-paginas' };
			pendingCount++;
			await saveCheckpoint();
			return;
		}
		const found = selectMovie(movie, search.results);
		if (!found) {
			checkpoint[file] = { status: 'pending', fingerprint, checkedAt, reason: 'titulo-o-ano-ambiguo' };
			pendingCount++;
			await saveCheckpoint();
			return;
		}
		const credits = await request('/movie/' + found.id + '/credits', { language: 'en-US' }, context);
		if (!Array.isArray(credits.cast) || !Array.isArray(credits.crew)) throw new TmdbRequestError('TMDB no devolvió créditos válidos.');
		const eligible = credits.cast.filter((person) => person && typeof person === 'object' && Number.isSafeInteger(person.id) && person.id > 0 && person.name && movie.mainCast.some((name) => normalize(name) === normalize(person.name)) && typeof person.character === 'string' && person.character.trim());
		const externalIds = {};
		for (const person of eligible) externalIds[person.id] = (await request('/person/' + person.id + '/external_ids', {}, context)).imdb_id;
		const result = matchCredits(movie, credits, people, externalIds, found.id);
		const verifiedAt = argentinaDate(context.oldestResponse);
		result.credits = result.credits.map((credit) => ({ ...credit, verifiedAt }));
		checkpoint[file] = { ...result, fingerprint, checkedAt, tmdbMovieId: found.id };
		if (result.status === 'pending') pendingCount++;

		if (has('--apply') && result.status === 'verified') {
			const current = JSON.parse(await readFile(filePath, 'utf8'));
			if (JSON.stringify(current) !== JSON.stringify(movie)) throw new Error('La ficha cambió durante el procesamiento; no se escribió.');
			const existing = movie.castCharacters ?? [];
			const merged = appendVerifiedCharacterCredits(movie, result.credits, file);
			const additionsCount = merged.length - existing.length;
			if (additionsCount) {
				movie.castCharacters = merged;
				const indentation = original.match(/\n([\t ]+)"/)?.[1] ?? '\t';
				await atomic(filePath, movie, indentation, original.includes('\r\n') ? '\r\n' : '\n');
				appliedCredits += additionsCount;
			}
		}
		await saveCheckpoint();
	} catch (error) {
		if (!(error instanceof TmdbRequestError)) throw error;
		checkpoint[file] = { status: 'pending', fingerprint, checkedAt, reason: 'tmdb-api-unavailable', detail: error.message };
		pendingCount++;
		console.warn(file + ': enriquecimiento pendiente (' + error.message + ').');
		await saveCheckpoint();
	}
}

async function worker() {
	while (cursor < files.length && !fatalError) {
		const file = files[cursor++];
		try { await processFile(file); }
		catch (error) { fatalError ??= error; }
	}
}

await Promise.all(Array.from({ length: 8 }, () => worker()));
await checkpointWrites;
if (fatalError) throw fatalError;
console.log(JSON.stringify({ selected: files.length, processed, skippedVerified, pending: pendingCount, appliedCredits, applied: has('--apply'), checkpoint: checkpointPath }, null, 2));
