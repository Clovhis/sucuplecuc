'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULT_ROOT = 'src/data/movies';
const DEFAULT_TIMEOUT_MS = 15000;
const DEFAULT_RETRIES = 2;
const DEFAULT_PER_HOST_CONCURRENCY = 2;
const DEFAULT_GLOBAL_CONCURRENCY = 8;
const DEFAULT_HOST_SPACING_MS = 200;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const PREFERRED_MIN_WIDTH = 500;
const RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);
const ACCEPTED_STATUSES = new Set([200, 206]);

let optionalSharp = null;
try {
	// sharp is optional: common JPEG/PNG/GIF/WebP headers are parsed below so
	// the verifier remains usable in a fresh install without an extra package.
	optionalSharp = require('sharp');
} catch (_error) {
	optionalSharp = null;
}

function sleep(milliseconds) {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function parsePositiveInteger(value, name) {
	const parsed = Number.parseInt(String(value), 10);
	if (!Number.isInteger(parsed) || parsed < 0) {
		throw new Error(`${name} must be a non-negative integer.`);
	}
	return parsed;
}

function parseArgs(argv) {
	const args = {
		root: DEFAULT_ROOT,
		candidates: [],
		all: false,
		format: 'text',
		timeoutMs: DEFAULT_TIMEOUT_MS,
		retries: DEFAULT_RETRIES,
		perHostConcurrency: DEFAULT_PER_HOST_CONCURRENCY,
		globalConcurrency: DEFAULT_GLOBAL_CONCURRENCY,
		hostSpacingMs: DEFAULT_HOST_SPACING_MS,
	};

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === '--root') {
			args.root = argv[++index];
		} else if (arg === '--candidate') {
			args.candidates.push(argv[++index]);
		} else if (arg === '--all') {
			args.all = true;
		} else if (arg === '--format') {
			args.format = argv[++index];
		} else if (arg === '--timeout-ms') {
			args.timeoutMs = parsePositiveInteger(argv[++index], '--timeout-ms');
		} else if (arg === '--retries') {
			args.retries = parsePositiveInteger(argv[++index], '--retries');
		} else if (arg === '--per-host-concurrency') {
			args.perHostConcurrency = Math.max(1, parsePositiveInteger(argv[++index], '--per-host-concurrency'));
		} else if (arg === '--global-concurrency') {
			args.globalConcurrency = Math.max(1, parsePositiveInteger(argv[++index], '--global-concurrency'));
		} else if (arg === '--host-spacing-ms') {
			args.hostSpacingMs = parsePositiveInteger(argv[++index], '--host-spacing-ms');
		} else if (arg === '--help' || arg === '-h') {
			args.help = true;
		} else {
			throw new Error(`Unknown argument: ${arg}`);
		}
	}

	if (!['text', 'json'].includes(args.format)) {
		throw new Error('--format must be text or json.');
	}

	return args;
}

function usage() {
	console.log(
		[
			'Usage:',
			'  node verify_posters.cjs --candidate src/data/movies/foo-2024.json',
			'  node verify_posters.cjs --candidate src/data/movies/foo-2024.json --candidate src/data/movies/bar-2025.json',
			'  node verify_posters.cjs --all',
			'',
			'Options:',
			'  --root <dir>                 Movie directory. Default: src/data/movies',
			'  --candidate <path>           Explicit candidate movie file. Repeat for batches.',
			'  --all                        Verify every movie JSON file under the root.',
			'  --format <type>              text | json. Default: text',
			'  --timeout-ms <n>             Per-request timeout. Default: 15000',
			'  --retries <n>                Retries for transient failures. Default: 2',
			'  --per-host-concurrency <n>   Concurrent requests per host. Default: 2',
			'  --global-concurrency <n>     Concurrent requests across hosts. Default: 8',
			'  --host-spacing-ms <n>        Minimum spacing between host attempts. Default: 200',
		].join('\n'),
	);
}

function listMovieFiles(root) {
	return fs
		.readdirSync(root, { withFileTypes: true })
		.filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
		.map((entry) => path.join(root, entry.name))
		.sort();
}

function readCandidate(filePath) {
	const absolutePath = path.resolve(filePath);
	if (!fs.existsSync(absolutePath)) {
		return {
			filePath,
			movie: null,
			readError: `Candidate file does not exist: ${filePath}`,
		};
	}

	try {
		return {
			filePath,
			movie: JSON.parse(fs.readFileSync(absolutePath, 'utf8')),
			readError: null,
		};
	} catch (error) {
		return {
			filePath,
			movie: null,
			readError: `Failed to parse JSON: ${error.message}`,
		};
	}
}

function getUrlHost(value) {
	try {
		return new URL(value).host.toLowerCase();
	} catch (_error) {
		return 'invalid-url';
	}
}

function parsePng(buffer) {
	if (buffer.length < 24 || buffer.toString('hex', 0, 8) !== '89504e470d0a1a0a') {
		return null;
	}
	return {
		format: 'png',
		width: buffer.readUInt32BE(16),
		height: buffer.readUInt32BE(20),
	};
}

function parseGif(buffer) {
	if (buffer.length < 10 || !['GIF87a', 'GIF89a'].includes(buffer.toString('ascii', 0, 6))) {
		return null;
	}
	return {
		format: 'gif',
		width: buffer.readUInt16LE(6),
		height: buffer.readUInt16LE(8),
	};
}

function isJpegStartOfFrame(marker) {
	return (
		(marker >= 0xc0 && marker <= 0xc3) ||
		(marker >= 0xc5 && marker <= 0xc7) ||
		(marker >= 0xc9 && marker <= 0xcb) ||
		(marker >= 0xcd && marker <= 0xcf)
	);
}

function parseJpeg(buffer) {
	if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
		return null;
	}

	let offset = 2;
	while (offset + 9 < buffer.length) {
		if (buffer[offset] !== 0xff) {
			offset += 1;
			continue;
		}

		while (offset < buffer.length && buffer[offset] === 0xff) {
			offset += 1;
		}
		const marker = buffer[offset];
		offset += 1;
		if (marker === 0xd9 || marker === 0xda) {
			break;
		}
		if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
			continue;
		}
		if (offset + 2 > buffer.length) {
			break;
		}

		const segmentLength = buffer.readUInt16BE(offset);
		if (segmentLength < 2 || offset + segmentLength > buffer.length) {
			break;
		}
		if (isJpegStartOfFrame(marker) && segmentLength >= 7) {
			return {
				format: 'jpeg',
				width: buffer.readUInt16BE(offset + 5),
				height: buffer.readUInt16BE(offset + 3),
			};
		}
		offset += segmentLength;
	}

	return null;
}

function readUInt24LE(buffer, offset) {
	return buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16);
}

function parseWebp(buffer) {
	if (buffer.length < 16 || buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') {
		return null;
	}

	const chunkType = buffer.toString('ascii', 12, 16);
	if (chunkType === 'VP8X' && buffer.length >= 30) {
		return {
			format: 'webp',
			width: readUInt24LE(buffer, 24) + 1,
			height: readUInt24LE(buffer, 27) + 1,
		};
	}

	if (chunkType === 'VP8L' && buffer.length >= 25 && buffer[20] === 0x2f) {
		const width = 1 + (((buffer[22] & 0x3f) << 8) | buffer[21]);
		const height = 1 + (((buffer[24] & 0xf) << 10) | (buffer[23] << 2) | ((buffer[22] & 0xc0) >> 6));
		return { format: 'webp', width, height };
	}

	if (chunkType === 'VP8 ' && buffer.length >= 30) {
		for (let index = 20; index + 9 < buffer.length; index += 1) {
			if (buffer[index] === 0x9d && buffer[index + 1] === 0x01 && buffer[index + 2] === 0x2a) {
				return {
					format: 'webp',
					width: buffer.readUInt16LE(index + 3) & 0x3fff,
					height: buffer.readUInt16LE(index + 5) & 0x3fff,
				};
			}
		}
	}

	return null;
}

async function parseImageDimensions(buffer) {
	const headerDimensions = parsePng(buffer) || parseGif(buffer) || parseJpeg(buffer) || parseWebp(buffer);
	if (headerDimensions) {
		return headerDimensions;
	}
	if (!optionalSharp) {
		return null;
	}
	try {
		const metadata = await optionalSharp(buffer).metadata();
		return {
			format: metadata.format || 'unknown',
			width: metadata.width,
			height: metadata.height,
		};
	} catch (_error) {
		return null;
	}
}

async function readResponseBody(response) {
	if (!response.body) {
		const buffer = Buffer.from(await response.arrayBuffer());
		if (buffer.length > MAX_IMAGE_BYTES) {
			throw new Error(`image body exceeds ${MAX_IMAGE_BYTES} bytes`);
		}
		return buffer;
	}

	const reader = response.body.getReader();
	const chunks = [];
	let totalBytes = 0;
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) {
				break;
			}
			totalBytes += value.byteLength;
			if (totalBytes > MAX_IMAGE_BYTES) {
				await reader.cancel();
				throw new Error(`image body exceeds ${MAX_IMAGE_BYTES} bytes`);
			}
			chunks.push(Buffer.from(value));
		}
	} finally {
		reader.releaseLock();
	}
	return Buffer.concat(chunks, totalBytes);
}

function createSemaphore(limit) {
	let active = 0;
	const waiters = [];

	return {
		async acquire() {
			if (active < limit) {
				active += 1;
				return;
			}
			await new Promise((resolve) => waiters.push(resolve));
			active += 1;
		},
		release() {
			active -= 1;
			const next = waiters.shift();
			if (next) {
				next();
			}
		},
	};
}

function createHostState() {
	return { nextAvailableAt: 0 };
}

async function waitForHostSlot(hostState, spacingMs) {
	const startAt = Math.max(Date.now(), hostState.nextAvailableAt);
	hostState.nextAvailableAt = startAt + spacingMs;
	if (startAt > Date.now()) {
		await sleep(startAt - Date.now());
	}
}

function isRetryableError(error) {
	return error?.name === 'AbortError' || /timeout|network|fetch|socket|body|terminated|reset/i.test(String(error?.message || error));
}

function externalFailure(code, message, details = {}) {
	return {
		ok: false,
		severity: 'warn',
		code,
		message,
		...details,
	};
}

async function verifyOne(entry, options, hostState, semaphore) {
	const filePath = entry.filePath;
	const poster = entry.movie?.poster;
	if (typeof poster !== 'string' || !/^https?:\/\//i.test(poster)) {
		return {
			filePath,
			poster,
			ok: false,
			severity: 'error',
			code: 'poster-url',
			message: 'poster must be an absolute http(s) URL.',
		};
	}

	let parsedUrl;
	try {
		parsedUrl = new URL(poster);
		if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
			throw new Error('unsupported protocol');
		}
	} catch (error) {
		return {
			filePath,
			poster,
			ok: false,
			severity: 'error',
			code: 'poster-url',
			message: `poster URL is invalid: ${error.message}`,
		};
	}

	let lastError = null;
	let lastStatus = null;
	let lastFinalUrl = poster;
	let lastContentType = '';

	for (let attempt = 0; attempt <= options.retries; attempt += 1) {
		if (attempt > 0) {
			await sleep(Math.min(4000, 400 * (2 ** (attempt - 1))));
		}
		await waitForHostSlot(hostState, options.hostSpacingMs);
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), options.timeoutMs);
		try {
			await semaphore.acquire();
			let response;
			try {
				response = await fetch(poster, {
					redirect: 'follow',
					headers: {
						accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*;q=0.8,*/*;q=0.5',
						'user-agent': 'CinePosta-poster-audit/1.0 (+https://www.cineposta.com.ar)',
					},
					signal: controller.signal,
				});
			} finally {
				semaphore.release();
			}

			lastStatus = response.status;
			lastFinalUrl = response.url || poster;
			lastContentType = response.headers.get('content-type') || '';
			if (RETRYABLE_STATUSES.has(response.status) && attempt < options.retries) {
				continue;
			}
			if (!ACCEPTED_STATUSES.has(response.status)) {
				if (RETRYABLE_STATUSES.has(response.status)) {
					return externalFailure(
						'poster-external-http',
						`poster request ended with transient HTTP ${response.status} after ${attempt + 1} attempt(s).`,
						{ filePath, poster, status: response.status, finalUrl: lastFinalUrl, contentType: lastContentType },
					);
				}
				return {
					filePath,
					poster,
					ok: false,
					severity: 'error',
					code: 'poster-http',
					message: `poster request returned HTTP ${response.status}.`,
					status: response.status,
					finalUrl: lastFinalUrl,
					contentType: lastContentType,
				};
			}
			if (!/^image\//i.test(lastContentType)) {
				return {
					filePath,
					poster,
					ok: false,
					severity: 'error',
					code: 'poster-content-type',
					message: `poster response must be image/*, received "${lastContentType || 'missing'}".`,
					status: response.status,
					finalUrl: lastFinalUrl,
					contentType: lastContentType,
				};
			}

			const contentLength = Number.parseInt(response.headers.get('content-length') || '', 10);
			if (Number.isFinite(contentLength) && contentLength > MAX_IMAGE_BYTES) {
				return {
					filePath,
					poster,
					ok: false,
					severity: 'error',
					code: 'poster-body-too-large',
					message: `poster response exceeds ${MAX_IMAGE_BYTES} bytes.`,
					status: response.status,
					finalUrl: lastFinalUrl,
					contentType: lastContentType,
				};
			}

			const buffer = await readResponseBody(response);
			const dimensions = await parseImageDimensions(buffer);
			if (!dimensions || !Number.isFinite(dimensions.width) || !Number.isFinite(dimensions.height)) {
				return {
					filePath,
					poster,
					ok: false,
					severity: 'error',
					code: 'poster-invalid-image',
					message: 'poster body is not a parseable raster image.',
					status: response.status,
					finalUrl: lastFinalUrl,
					contentType: lastContentType,
				};
			}
			if (dimensions.height <= dimensions.width) {
				return {
					filePath,
					poster,
					ok: false,
					severity: 'error',
					code: 'poster-horizontal',
					message: `poster dimensions are ${dimensions.width}x${dimensions.height}; movie posters must be portrait.`,
					status: response.status,
					finalUrl: lastFinalUrl,
					contentType: lastContentType,
					...dimensions,
				};
			}

			return {
				filePath,
				poster,
				ok: true,
				severity: dimensions.width < PREFERRED_MIN_WIDTH ? 'warn' : 'pass',
				code: dimensions.width < PREFERRED_MIN_WIDTH ? 'poster-low-resolution' : 'poster-ok',
				message: dimensions.width < PREFERRED_MIN_WIDTH
					? `poster is portrait but only ${dimensions.width}x${dimensions.height}; prefer at least ${PREFERRED_MIN_WIDTH}px wide when a clean source exists.`
					: `poster verified at ${dimensions.width}x${dimensions.height}.`,
				status: response.status,
				finalUrl: lastFinalUrl,
				contentType: lastContentType,
				...dimensions,
			};
		} catch (error) {
			lastError = error;
			if (!isRetryableError(error) || attempt >= options.retries) {
				return externalFailure(
					error?.name === 'AbortError' ? 'poster-timeout' : 'poster-external-fetch',
					`poster request could not be verified after ${attempt + 1} attempt(s): ${error.message}`,
					{ filePath, poster, status: lastStatus, finalUrl: lastFinalUrl, contentType: lastContentType },
				);
			}
		} finally {
			clearTimeout(timeout);
		}
	}

	return externalFailure('poster-external-fetch', `poster request could not be verified: ${lastError?.message || 'unknown error'}.`, {
		filePath,
		poster,
		status: lastStatus,
		finalUrl: lastFinalUrl,
		contentType: lastContentType,
	});
}

async function verifyPosterUrls(entries, options = {}) {
	const normalizedOptions = {
		timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
		retries: options.retries ?? DEFAULT_RETRIES,
		perHostConcurrency: options.perHostConcurrency ?? DEFAULT_PER_HOST_CONCURRENCY,
		globalConcurrency: options.globalConcurrency ?? DEFAULT_GLOBAL_CONCURRENCY,
		hostSpacingMs: options.hostSpacingMs ?? DEFAULT_HOST_SPACING_MS,
	};
	const results = new Array(entries.length);
	const groups = new Map();

	entries.forEach((entry, index) => {
		const host = getUrlHost(entry.movie?.poster);
		if (!groups.has(host)) {
			groups.set(host, []);
		}
		groups.get(host).push({ entry, index });
	});

	const semaphore = createSemaphore(Math.max(1, normalizedOptions.globalConcurrency));
	await Promise.all([...groups.entries()].map(async ([host, group]) => {
		const hostState = createHostState();
		let nextIndex = 0;
		const workerCount = Math.min(normalizedOptions.perHostConcurrency, group.length);
		await Promise.all(Array.from({ length: workerCount }, async () => {
			while (nextIndex < group.length) {
				const item = group[nextIndex];
				nextIndex += 1;
				results[item.index] = await verifyOne(item.entry, normalizedOptions, hostState, semaphore);
			}
		}));
		void host;
	}));

	return results;
}

function createReport(entries, results, options) {
	return {
		candidates: entries.map((entry) => entry.filePath),
		options,
		results,
		summary: {
			total: results.length,
			passed: results.filter((result) => result?.ok && result.severity === 'pass').length,
			warnings: results.filter((result) => result?.severity === 'warn').length,
		errors: results.filter((result) => result?.severity === 'error').length,
		},
	};
}

function printTextReport(report) {
	console.log(`Verified ${report.summary.total} poster(s): ${report.summary.passed} pass, ${report.summary.warnings} warning(s), ${report.summary.errors} error(s).`);
	for (const result of report.results) {
		const label = result.severity === 'pass' ? 'PASS' : result.severity.toUpperCase();
		const dimensions = result.width && result.height ? ` ${result.width}x${result.height}` : '';
		const status = result.status ? ` HTTP ${result.status}` : '';
		const finalUrl = result.finalUrl && result.finalUrl !== result.poster ? ` final=${result.finalUrl}` : '';
		console.log(`[${label}] ${result.filePath} :: ${result.code}${status}${dimensions}${finalUrl} :: ${result.message}`);
	}
}

async function main() {
	let args;
	try {
		args = parseArgs(process.argv.slice(2));
	} catch (error) {
		console.error(error.message);
		usage();
		process.exit(1);
	}

	if (args.help) {
		usage();
		process.exit(0);
	}
	if (!args.all && args.candidates.length === 0) {
		console.error('Pass at least one --candidate or use --all.');
		usage();
		process.exit(1);
	}

	const root = path.resolve(args.root);
	const candidates = args.all ? listMovieFiles(root) : args.candidates;
	const entries = candidates.map(readCandidate);
	const unreadable = entries.filter((entry) => entry.readError);
	for (const entry of unreadable) {
		entry.movie = { poster: null };
	}
	const report = createReport(entries, await verifyPosterUrls(entries, args), args);
	for (const entry of unreadable) {
		const result = report.results[entries.indexOf(entry)];
		result.ok = false;
		result.severity = 'error';
		result.code = 'candidate-file';
		result.message = entry.readError;
	}

	if (args.format === 'json') {
		console.log(JSON.stringify(report, null, 2));
	} else {
		printTextReport(report);
	}
	process.exit(report.results.some((result) => result.severity === 'error') ? 1 : 0);
}

module.exports = {
	verifyPosterUrls,
	parseImageDimensions,
	MAX_IMAGE_BYTES,
	PREFERRED_MIN_WIDTH,
};

if (require.main === module) {
	main();
}
