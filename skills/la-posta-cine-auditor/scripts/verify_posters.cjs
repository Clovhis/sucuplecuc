'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULT_ROOT = 'src/data/movies';
const PUBLIC_ROOT = path.resolve('public');
const MAX_POSTER_BYTES = 100 * 1024;
const TARGET_MIN_BYTES = 40 * 1024;
const TARGET_MAX_BYTES = 80 * 1024;
const MAX_WIDTH = 480;
const MAX_HEIGHT = 720;
const LOCAL_POSTER_PATTERN = /^assets\/posters\/(?:poster-fallback|\d{4}\/[a-z0-9]+(?:-[a-z0-9]+)*)\.webp$/;

let optionalSharp = null;
try { optionalSharp = require('sharp'); } catch (_error) { optionalSharp = null; }

function parseArgs(argv) {
	const args = { root: DEFAULT_ROOT, candidates: [], all: false, format: 'text' };
	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === '--root') args.root = argv[++index];
		else if (arg === '--candidate') args.candidates.push(argv[++index]);
		else if (arg === '--all') args.all = true;
		else if (arg === '--format') args.format = argv[++index];
		else if (arg === '--help' || arg === '-h') args.help = true;
		else throw new Error(`Unknown argument: ${arg}`);
	}
	if (!['text', 'json'].includes(args.format)) throw new Error('--format must be text or json.');
	return args;
}

function usage() {
	console.log([
		'Usage:',
		'  node verify_posters.cjs --candidate src/data/movies/foo-2024.json',
		'  node verify_posters.cjs --candidate src/data/movies/foo-2024.json --candidate src/data/movies/bar-2025.json',
		'  node verify_posters.cjs --all [--format json]',
		'',
		'Validates local WebP posters in public/assets/posters: path, existence, format, portrait dimensions and 100 KiB maximum.',
	].join('\n'));
}

function listMovieFiles(root) {
	return fs.readdirSync(root, { withFileTypes: true })
		.filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
		.map((entry) => path.join(root, entry.name))
		.sort();
}

function readCandidate(filePath) {
	try {
		return { filePath, movie: JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8')), readError: null };
	} catch (error) {
		return { filePath, movie: null, readError: error.code === 'ENOENT' ? `Candidate file does not exist: ${filePath}` : `Failed to parse JSON: ${error.message}` };
	}
}

function readUInt24LE(buffer, offset) { return buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16); }

function parseWebp(buffer) {
	if (buffer.length < 16 || buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') return null;
	const chunkType = buffer.toString('ascii', 12, 16);
	if (chunkType === 'VP8X' && buffer.length >= 30) return { format: 'webp', width: readUInt24LE(buffer, 24) + 1, height: readUInt24LE(buffer, 27) + 1 };
	if (chunkType === 'VP8L' && buffer.length >= 25 && buffer[20] === 0x2f) return { format: 'webp', width: 1 + (((buffer[22] & 0x3f) << 8) | buffer[21]), height: 1 + (((buffer[24] & 0xf) << 10) | (buffer[23] << 2) | ((buffer[22] & 0xc0) >> 6)) };
	if (chunkType === 'VP8 ' && buffer.length >= 30) {
		for (let index = 20; index + 9 < buffer.length; index += 1) {
			if (buffer[index] === 0x9d && buffer[index + 1] === 0x01 && buffer[index + 2] === 0x2a) return { format: 'webp', width: buffer.readUInt16LE(index + 3) & 0x3fff, height: buffer.readUInt16LE(index + 5) & 0x3fff };
		}
	}
	return null;
}

async function parseImageDimensions(buffer) {
	const header = parseWebp(buffer);
	if (header) return header;
	if (!optionalSharp) return null;
	try {
		const metadata = await optionalSharp(buffer).metadata();
		return { format: metadata.format || 'unknown', width: metadata.width, height: metadata.height };
	} catch (_error) { return null; }
}

function errorResult(entry, code, message, details = {}) {
	return { filePath: entry.filePath, poster: entry.movie?.poster, ok: false, severity: 'error', code, message, ...details };
}

async function verifyOne(entry) {
	if (entry.readError) return errorResult(entry, 'candidate-file', entry.readError);
	const poster = entry.movie?.poster;
	if (typeof poster !== 'string' || !LOCAL_POSTER_PATTERN.test(poster)) return errorResult(entry, 'poster-local-path', 'poster must be a local assets/posters/<year>/<slug>.webp path.');
	const absolutePath = path.resolve(PUBLIC_ROOT, poster);
	if (!absolutePath.startsWith(`${PUBLIC_ROOT}${path.sep}`)) return errorResult(entry, 'poster-local-path', 'poster path escapes public/.');
	let bytes;
	let buffer;
	try {
		const info = fs.statSync(absolutePath);
		if (!info.isFile()) return errorResult(entry, 'poster-missing', 'poster path is not a file.');
		bytes = info.size;
		buffer = fs.readFileSync(absolutePath);
	} catch (_error) { return errorResult(entry, 'poster-missing', `local poster does not exist: ${poster}`); }
	if (bytes > MAX_POSTER_BYTES) return errorResult(entry, 'poster-too-large', `poster is ${bytes} bytes; maximum is ${MAX_POSTER_BYTES} bytes.`, { bytes });
	const dimensions = await parseImageDimensions(buffer);
	if (!dimensions || dimensions.format !== 'webp' || !dimensions.width || !dimensions.height) return errorResult(entry, 'poster-invalid-image', 'poster must be a parseable WebP image.', { bytes });
	if (dimensions.height <= dimensions.width) return errorResult(entry, 'poster-horizontal', `poster dimensions are ${dimensions.width}x${dimensions.height}; movie posters must be portrait.`, { bytes, ...dimensions });
	if (dimensions.width > MAX_WIDTH || dimensions.height > MAX_HEIGHT) return errorResult(entry, 'poster-dimensions', `poster dimensions are ${dimensions.width}x${dimensions.height}; maximum is ${MAX_WIDTH}x${MAX_HEIGHT}.`, { bytes, ...dimensions });
	const targetWarning = bytes < TARGET_MIN_BYTES || bytes > TARGET_MAX_BYTES;
	return { filePath: entry.filePath, poster, ok: true, severity: targetWarning ? 'warn' : 'pass', code: targetWarning ? 'poster-outside-target-size' : 'poster-ok', message: targetWarning ? `poster is valid at ${bytes} bytes; preferred range is ${TARGET_MIN_BYTES}-${TARGET_MAX_BYTES} bytes.` : `local poster verified at ${dimensions.width}x${dimensions.height}, ${bytes} bytes.`, bytes, ...dimensions };
}

async function verifyPosterUrls(entries) { return Promise.all(entries.map(verifyOne)); }

function createReport(entries, results, options) {
	return { candidates: entries.map((entry) => entry.filePath), options, results, summary: { total: results.length, passed: results.filter((result) => result.severity === 'pass').length, warnings: results.filter((result) => result.severity === 'warn').length, errors: results.filter((result) => result.severity === 'error').length } };
}

function printTextReport(report) {
	console.log(`Verified ${report.summary.total} local poster(s): ${report.summary.passed} pass, ${report.summary.warnings} warning(s), ${report.summary.errors} error(s).`);
	for (const result of report.results) {
		const dimensions = result.width && result.height ? ` ${result.width}x${result.height}` : '';
		const bytes = Number.isFinite(result.bytes) ? ` ${result.bytes} bytes` : '';
		console.log(`[${result.severity.toUpperCase()}] ${result.filePath} :: ${result.code}${dimensions}${bytes} :: ${result.message}`);
	}
}

async function main() {
	let args;
	try { args = parseArgs(process.argv.slice(2)); } catch (error) { console.error(error.message); usage(); process.exit(1); }
	if (args.help) return usage();
	if (!args.all && args.candidates.length === 0) { console.error('Pass at least one --candidate or use --all.'); usage(); process.exit(1); }
	const candidates = args.all ? listMovieFiles(path.resolve(args.root)) : args.candidates;
	const entries = candidates.map(readCandidate);
	const report = createReport(entries, await verifyPosterUrls(entries), args);
	if (args.format === 'json') console.log(JSON.stringify(report, null, 2)); else printTextReport(report);
	if (report.summary.errors) process.exitCode = 1;
}

module.exports = { verifyPosterUrls, parseImageDimensions, MAX_POSTER_BYTES, TARGET_MIN_BYTES, TARGET_MAX_BYTES, LOCAL_POSTER_PATTERN };
if (require.main === module) main().catch((error) => { console.error(error.stack || error.message); process.exit(1); });
