#!/usr/bin/env node

import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

const MOVIES_ROOT = path.resolve('src/data/movies');
const PUBLIC_ROOT = path.resolve('public');
const FALLBACK_RELATIVE_PATH = 'assets/posters/poster-fallback.webp';
const MAX_BYTES = 100 * 1024;
const TARGET_BYTES = 80 * 1024;
const QUALITY_STEPS = [84, 80, 76, 72, 68, 64, 60, 56, 52, 48, 44, 40, 36];

function parseArgs(argv) {
	const args = { candidates: [], all: false, concurrency: 8, delayMs: 0, report: null, retryReport: null, dryRun: false, sourceUrl: null };
	for (let index = 0; index < argv.length; index += 1) {
		const token = argv[index];
		if (token === '--all') args.all = true;
		else if (token === '--dry-run') args.dryRun = true;
		else if (token === '--candidate') args.candidates.push(argv[++index]);
		else if (token === '--movie') args.candidates.push(path.join(MOVIES_ROOT, `${argv[++index]}.json`));
		else if (token === '--concurrency') args.concurrency = Number.parseInt(argv[++index], 10);
		else if (token === '--delay-ms') args.delayMs = Number.parseInt(argv[++index], 10);
		else if (token === '--report') args.report = argv[++index];
		else if (token === '--retry-report') args.retryReport = argv[++index];
		else if (token === '--source-url') args.sourceUrl = argv[++index];
		else if (token === '--help' || token === '-h') args.help = true;
		else throw new Error(`Unknown argument: ${token}`);
	}
	if (!Number.isInteger(args.concurrency) || args.concurrency < 1 || args.concurrency > 16) {
		throw new Error('--concurrency must be an integer between 1 and 16.');
	}
	if (!Number.isInteger(args.delayMs) || args.delayMs < 0 || args.delayMs > 10000) throw new Error('--delay-ms must be an integer between 0 and 10000.');
	return args;
}

function usage() {
	console.log([
		'Usage:',
		'  node scripts/localize-movie-posters.mjs --all [--concurrency 8] [--report reports/local-posters.json]',
		'  node scripts/localize-movie-posters.mjs --movie <slug>',
		'  node scripts/localize-movie-posters.mjs --candidate src/data/movies/<slug>.json [--source-url https://…]',
		'  node scripts/localize-movie-posters.mjs --retry-report reports/local-posters-migration.json [--concurrency 1]',
		'',
		'Converts the source poster to public/assets/posters/<year>/<slug>.webp and stores that local path in movie JSON.',
	].join('\n'));
}

function isHttpUrl(value) {
	return /^https?:\/\//i.test(String(value ?? ''));
}

function isLocalPosterPath(value) {
	return /^assets\/posters\/(?:poster-fallback|\d{4}\/[a-z0-9]+(?:-[a-z0-9]+)*)\.webp$/i.test(String(value ?? ''));
}

function posterPathFor(movie) {
	if (!Number.isInteger(movie.year) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(movie.slug ?? '')) {
		throw new Error('movie requires a numeric year and canonical slug.');
	}
	return `assets/posters/${movie.year}/${movie.slug}.webp`;
}

function replacePoster(raw, value) {
	const replacement = `"poster": ${JSON.stringify(value)}`;
	const pattern = /"poster"\s*:\s*"(?:\\.|[^"\\])*"/;
	if (!pattern.test(raw)) throw new Error('could not find the poster field in JSON.');
	return raw.replace(pattern, replacement);
}

async function fetchSource(url) {
	let lastError;
	for (let attempt = 0; attempt < 3; attempt += 1) {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 20000);
		try {
			const response = await fetch(url, {
				redirect: 'follow',
				headers: { accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8', 'user-agent': 'CinePosta-local-poster-migration/1.0' },
				signal: controller.signal,
			});
			if (!response.ok) throw new Error(`HTTP ${response.status}`);
			const type = response.headers.get('content-type') ?? '';
			if (!/^image\//i.test(type)) throw new Error(`expected image/*, got ${type || 'missing content-type'}`);
			const buffer = Buffer.from(await response.arrayBuffer());
			if (buffer.length > 10 * 1024 * 1024) throw new Error('source image exceeds 10 MiB');
			return buffer;
		} catch (error) {
			lastError = error;
			if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 500 * (2 ** attempt)));
		} finally {
			clearTimeout(timeout);
		}
	}
	throw lastError;
}

async function optimizePoster(source) {
	const metadata = await sharp(source, { failOn: 'none' }).rotate().metadata();
	if (!metadata.width || !metadata.height || metadata.height <= metadata.width) {
		throw new Error(`source is not a portrait raster (${metadata.width ?? '?'}x${metadata.height ?? '?'})`);
	}

	let smallest = null;
	for (const quality of QUALITY_STEPS) {
		const output = await sharp(source, { failOn: 'none' })
			.rotate()
			.resize({ width: 480, height: 720, fit: 'inside', withoutEnlargement: false })
			.webp({ quality, effort: 5, smartSubsample: true })
			.toBuffer();
		if (!smallest || output.length < smallest.buffer.length) smallest = { quality, buffer: output };
		if (output.length <= TARGET_BYTES) return { quality, buffer: output };
	}
	if (smallest.buffer.length > MAX_BYTES) {
		throw new Error(`cannot optimize below ${MAX_BYTES} bytes (smallest ${smallest.buffer.length} bytes)`);
	}
	return smallest;
}

async function createFallback(dryRun) {
	const destination = path.join(PUBLIC_ROOT, FALLBACK_RELATIVE_PATH);
	try {
		const info = await stat(destination);
		return { path: FALLBACK_RELATIVE_PATH, bytes: info.size };
	} catch (error) {
		if (error.code !== 'ENOENT') throw error;
	}
	if (dryRun) return { path: FALLBACK_RELATIVE_PATH, bytes: null };
	throw new Error(`required committed fallback is missing: ${FALLBACK_RELATIVE_PATH}`);
}

async function listMovieFiles() {
	return (await readdir(MOVIES_ROOT))
		.filter((file) => file.endsWith('.json'))
		.sort()
		.map((file) => path.join(MOVIES_ROOT, file));
}

async function migrateOne(filePath, args) {
	const raw = await readFile(filePath, 'utf8');
	const movie = JSON.parse(raw);
	const outputPath = posterPathFor(movie);
	const outputAbsolutePath = path.join(PUBLIC_ROOT, outputPath);
	const sourceUrl = args.sourceUrl ?? movie.poster;

	if (isLocalPosterPath(movie.poster) && !args.sourceUrl) {
		try {
			const info = await stat(path.join(PUBLIC_ROOT, movie.poster));
			return { filePath, slug: movie.slug, status: 'already-local', outputPath: movie.poster, bytes: info.size };
		} catch {
			// Repair a missing local asset only when a source URL was supplied explicitly.
			throw new Error(`local poster is missing and no --source-url was supplied: ${movie.poster}`);
		}
	}

	if (!isHttpUrl(sourceUrl)) throw new Error('movie poster must be an http(s) source URL before localization.');
	try {
		const source = await fetchSource(sourceUrl);
		const optimized = await optimizePoster(source);
		if (!args.dryRun) {
			await mkdir(path.dirname(outputAbsolutePath), { recursive: true });
			await writeFile(outputAbsolutePath, optimized.buffer);
			await writeFile(filePath, replacePoster(raw, outputPath), 'utf8');
		}
		return { filePath, slug: movie.slug, status: 'migrated', outputPath, bytes: optimized.buffer.length, quality: optimized.quality, sourceUrl };
	} catch (error) {
		if (!args.dryRun) await writeFile(filePath, replacePoster(raw, FALLBACK_RELATIVE_PATH), 'utf8');
		return { filePath, slug: movie.slug, status: 'fallback', outputPath: FALLBACK_RELATIVE_PATH, sourceUrl, error: error.message };
	}
}

async function mapWithConcurrency(items, limit, mapper) {
	const results = new Array(items.length);
	let nextIndex = 0;
	await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
		while (nextIndex < items.length) {
			const index = nextIndex;
			nextIndex += 1;
			results[index] = await mapper(items[index]);
		}
	}));
	return results;
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	if (args.help) return usage();
	if (args.retryReport && (args.all || args.candidates.length > 0 || args.sourceUrl)) {
		throw new Error('--retry-report cannot be combined with --all, --candidate/--movie, or --source-url.');
	}
	if (!args.retryReport && args.all === (args.candidates.length > 0)) throw new Error('Use exactly one of --all or one/more --candidate/--movie.');
	let previousReport = null;
	let retrySources = new Map();
	let candidates;
	if (args.retryReport) {
		previousReport = JSON.parse(await readFile(path.resolve(args.retryReport), 'utf8'));
		candidates = previousReport.results
			.filter((result) => result.status === 'fallback' && isHttpUrl(result.sourceUrl))
			.map((result) => {
				const resolved = path.resolve(result.filePath);
				retrySources.set(resolved, result.sourceUrl);
				return resolved;
			});
	} else {
		candidates = args.all ? await listMovieFiles() : [...new Set(args.candidates.map((value) => path.resolve(value)))];
	}
	const fallback = await createFallback(args.dryRun);
	const attempted = await mapWithConcurrency(candidates, args.concurrency, async (filePath) => {
		const result = await migrateOne(filePath, { ...args, sourceUrl: retrySources.get(filePath) ?? args.sourceUrl });
		if (args.delayMs) await new Promise((resolve) => setTimeout(resolve, args.delayMs));
		return result;
	});
	const replacements = new Map(attempted.map((result) => [path.resolve(result.filePath), result]));
	const results = previousReport
		? previousReport.results.map((result) => replacements.get(path.resolve(result.filePath)) ?? result)
		: attempted;
	const summary = {
		total: results.length,
		migrated: results.filter((result) => result.status === 'migrated').length,
		alreadyLocal: results.filter((result) => result.status === 'already-local').length,
		fallback: results.filter((result) => result.status === 'fallback').length,
	};
	const report = { generatedAt: new Date().toISOString(), fallback, summary, results };
	if (args.report && !args.dryRun) {
		await mkdir(path.dirname(path.resolve(args.report)), { recursive: true });
		await writeFile(args.report, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
	}
	console.log(JSON.stringify(report, null, 2));
	if (summary.fallback > 0) process.exitCode = 2;
}

main().catch((error) => {
	console.error(error.stack || error.message);
	process.exit(1);
});
