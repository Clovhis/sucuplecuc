import { mkdir, readFile, readdir, writeFile, rename, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { createHash } from 'node:crypto';
import { matchCredits, normalize, selectMovie } from './character-matching.mjs';

try { process.loadEnvFile('.env.local'); } catch (error) { if (error.code !== 'ENOENT') throw error; }

const argv = process.argv.slice(2);
const value = (flag) => { const i = argv.indexOf(flag); return i < 0 ? undefined : argv[i + 1]; };
const has = (flag) => argv.includes(flag);
if (has('--help')) {
	console.log('Uso: npm run enrich:characters -- (--slug SLUG | --changed | --pilot | --all) [--refresh] [--limit N] [--apply] --license-confirmed\n--refresh reconsulta sólo las fichas seleccionadas. Por defecto no escribe fichas.');
	process.exit(0);
}
if ([has('--slug'), has('--changed'), has('--pilot'), has('--all')].filter(Boolean).length !== 1) throw new Error('Elegí exactamente uno de --slug, --changed, --pilot o --all.');
if (!has('--license-confirmed')) throw new Error('Confirmá primero que la licencia TMDB permite este uso y almacenamiento; luego agregá --license-confirmed.');
const key = process.env.TMDB_API_KEY;
if (!key) throw new Error('Falta TMDB_API_KEY en el entorno. No se realizaron consultas ni cambios.');
const limit = Number(value('--limit') ?? 50);
if (!Number.isSafeInteger(limit) || limit < 1 || limit > 500) throw new Error('--limit debe estar entre 1 y 500.');
const dir = path.resolve('src/data/movies');
const stateDir = path.resolve('reports/character-enrichment');
await mkdir(stateDir, { recursive: true });
const cacheDir = path.join(stateDir, 'cache');
await mkdir(cacheDir, { recursive: true });
const checkpointPath = path.join(stateDir, 'checkpoint.json');
async function readJson(file, fallback) { try { return JSON.parse(await readFile(file, 'utf8')); } catch (err) { if (err.code === 'ENOENT') return fallback; throw err; } }
async function atomic(file, data, indent = 2, newline = '\n') { const temp = `${file}.tmp`; await writeFile(temp, (JSON.stringify(data, null, indent) + '\n').replaceAll('\n', newline)); await rename(temp, file); }
let nextRequestAt = 0;
const inflight = new Map();
let checkpointWrites = Promise.resolve();
function saveCheckpoint() { checkpointWrites = checkpointWrites.then(() => atomic(checkpointPath, checkpoint)); return checkpointWrites; }
const checkpoint = await readJson(checkpointPath, {});
const people = await readJson('src/data/people.json', {});
let files = (await readdir(dir)).filter((file) => file.endsWith('.json')).sort();
if (has('--pilot')) {
	const candidates = await Promise.all(files.map(async (file) => ({ file, movie: JSON.parse(await readFile(path.join(dir, file), 'utf8')) })));
	candidates.sort((a, b) => Number(a.movie.year) - Number(b.movie.year) || String(a.movie.category).localeCompare(String(b.movie.category)) || a.file.localeCompare(b.file));
	files = Array.from({ length: Math.min(50, candidates.length) }, (_, index) => candidates[Math.floor(index * candidates.length / Math.min(50, candidates.length))].file);
}
if (has('--slug')) files = files.filter((file) => file === `${value('--slug')}.json`);
if (has('--changed')) {
	const diff = execFileSync('git', ['diff', '--name-only', 'origin/main', '--', 'src/data/movies'], { encoding: 'utf8' });
	const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard', '--', 'src/data/movies'], { encoding: 'utf8' });
	const changed = new Set((diff + '\n' + untracked).split(/\r?\n/).filter(Boolean).map((file) => path.basename(file)));
	files = files.filter((file) => changed.has(file));
}
if (has('--slug') && !files.length) throw new Error('No existe la ficha solicitada.');
async function request(endpoint, params = {}, context) {
	const url = new URL(`https://api.themoviedb.org/3${endpoint}`);
	for (const [name, val] of Object.entries(params)) url.searchParams.set(name, val);
	const cacheKey = url.pathname + url.search;
	const cachePath = path.join(cacheDir, `${createHash('sha256').update(cacheKey).digest('hex')}.json`);
	const cached = await readJson(cachePath, null);
	if (cached !== null && Date.now() - (await stat(cachePath)).mtimeMs < 90 * 86400000 && !has('--retry-pending') && !has('--refresh')) {
		context.oldestResponse = Math.min(context.oldestResponse, (await stat(cachePath)).mtimeMs);
		return cached;
	}
	if (inflight.has(cacheKey)) { const result = await inflight.get(cacheKey); context.oldestResponse = Math.min(context.oldestResponse, result.at); return result.data; }
	const pending = fetchAndCache();
	inflight.set(cacheKey, pending);
	try { const result = await pending; context.oldestResponse = Math.min(context.oldestResponse, result.at); return result.data; }
	finally { inflight.delete(cacheKey); }
	async function fetchAndCache() {
	url.searchParams.set('api_key', key);
	for (let attempt = 0; attempt < 4; attempt++) {
		// Conservative ceiling of 10 requests/s, well below TMDB's published approximate upper limit.
		const start = Math.max(Date.now(), nextRequestAt); nextRequestAt = start + 100;
		await delay(Math.max(0, start - Date.now()));
		let response;
		try { response = await fetch(url, { signal: AbortSignal.timeout(15000) }); }
		catch { await delay(Math.min(30000, 1000 * 2 ** attempt)); continue; }
		if (response.status === 429 || response.status >= 500) {
			const retry = response.headers.get('retry-after');
			const retryDate = retry ? Date.parse(retry) : NaN;
			const seconds = retry && /^\d+$/.test(retry) ? Number(retry) * 1000 : Number.isFinite(retryDate) ? Math.max(0, retryDate - Date.now()) : 0;
			if (seconds > 60000) throw new Error(`TMDB solicitó esperar ${Math.ceil(seconds / 1000)} segundos; lote detenido para reanudar después.`);
			const pause = Math.min(60000, Math.max(seconds, 1000 * 2 ** attempt));
			nextRequestAt = Math.max(nextRequestAt, Date.now() + pause);
			await delay(pause); continue;
		}
		if (!response.ok) throw new Error(`TMDB HTTP ${response.status} en ${url.pathname}`);
		const data = await response.json(); await atomic(cachePath, data); return { data, at: Date.now() };
	}
	throw new Error(`TMDB agotó reintentos en ${url.pathname}`);
	}
}
let processed = 0;
let cursor = 0;
let stopped = false;
async function worker() { while (!stopped && cursor < files.length && processed < limit) {
	const file = files[cursor++];
	const filePath = path.join(dir, file);
	const original = await readFile(filePath, 'utf8');
	const movie = JSON.parse(original);
	const fingerprint = createHash('sha256').update(JSON.stringify([movie.title, movie.originalTitle, movie.year, movie.director, movie.mainCast, movie.mainCast.map((actor) => people[actor]?.imdbId)])).digest('hex');
	if (checkpoint[file]?.fingerprint === fingerprint && !has('--retry-pending') && !has('--refresh') && (checkpoint[file]?.status === 'pending' || (checkpoint[file]?.status === 'verified' && movie.castCharacters?.length))) continue;
	if (processed >= limit || stopped) return;
	processed++;
	const context = { oldestResponse: Date.now() };
	const checkedAt = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
	try {
		const title = movie.originalTitle || movie.title;
		const results = await request('/search/movie', { query: title, year: String(movie.year), language: 'en-US', include_adult: 'false' }, context);
		if (results.total_pages > 1) { checkpoint[file] = { status: 'pending', fingerprint, checkedAt, reason: 'busqueda-con-multiples-paginas' }; await saveCheckpoint(); continue; }
		const found = selectMovie(movie, results.results ?? []);
		if (!found) { checkpoint[file] = { status: 'pending', fingerprint, checkedAt, reason: 'titulo-o-ano-ambiguo' }; await saveCheckpoint(); continue; }
		const credits = await request(`/movie/${found.id}/credits`, { language: 'en-US' }, context);
		const eligible = (credits.cast ?? []).filter((c) => normalize(c.name) && movie.mainCast.some((name) => normalize(name) === normalize(c.name)) && c.id && c.character);
		const ids = {};
		for (const person of eligible) ids[person.id] = (await request(`/person/${person.id}/external_ids`, {}, context)).imdb_id;
		const result = matchCredits(movie, credits, people, ids, found.id);
		const verifiedAt = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(context.oldestResponse));
		result.credits = result.credits.map((credit) => ({ ...credit, verifiedAt }));
		checkpoint[file] = { ...result, fingerprint, checkedAt, tmdbMovieId: found.id };
		if (has('--refresh') && result.status === 'verified') {
			const unresolved = (movie.castCharacters ?? []).filter((prior) => !result.credits.some((candidate) => candidate.actor === prior.actor && candidate.tmdbPersonId === prior.tmdbPersonId && candidate.tmdbMovieId === prior.tmdbMovieId && candidate.character === prior.character)).map((credit) => credit.actor);
			if (unresolved.length) checkpoint[file].needsReview = unresolved;
		}
		if (has('--apply') && result.status === 'verified') {
			const current = JSON.parse(await readFile(filePath, 'utf8'));
			if (JSON.stringify(current) !== JSON.stringify(movie)) throw new Error('La ficha cambió durante el procesamiento; no se escribió.');
			const existing = (movie.castCharacters ?? []).map((prior) => {
				const verified = has('--refresh') && result.credits.find((candidate) => candidate.actor === prior.actor && candidate.tmdbPersonId === prior.tmdbPersonId && candidate.tmdbMovieId === prior.tmdbMovieId && candidate.character === prior.character);
				return verified ? { ...prior, verifiedAt: verified.verifiedAt } : prior;
			});
			const additions = result.credits.filter((credit) => !existing.some((prior) => prior.actor === credit.actor || prior.tmdbPersonId === credit.tmdbPersonId));
			if (additions.length || JSON.stringify(existing) !== JSON.stringify(movie.castCharacters ?? [])) {
				movie.castCharacters = [...existing, ...additions];
				const indentation = original.match(/\n([\t ]+)"/ )?.[1] ?? '\t';
				await atomic(filePath, movie, indentation, original.includes('\r\n') ? '\r\n' : '\n');
			}
		}
		await saveCheckpoint();
	} catch (error) {
		stopped = true; checkpoint[file] = { status: 'error', reason: error.message }; await saveCheckpoint();
		console.error(`${file}: ${error.message}`); process.exitCode = 1; return;
	}
} }
await Promise.all(Array.from({ length: 8 }, () => worker()));
console.log(JSON.stringify({ processed, applied: has('--apply'), checkpoint: checkpointPath }, null, 2));
