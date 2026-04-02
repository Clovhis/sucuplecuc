import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const MOVIES_DIR = path.resolve('src/data/movies');
const CATALOG_PATH = path.resolve('docs/movie-catalog-reference.md');
const DAY_MS = 24 * 60 * 60 * 1000;

function parseArgs(argv) {
	const args = {
		recentDays: 90,
		json: false,
	};

	for (let index = 0; index < argv.length; index += 1) {
		const token = argv[index];
		if (token === '--json') {
			args.json = true;
			continue;
		}
		if (!token.startsWith('--')) {
			throw new Error(`Unknown argument: ${token}`);
		}
		const key = token.slice(2);
		const value = argv[index + 1];
		if (!value || value.startsWith('--')) {
			throw new Error(`Missing value for --${key}`);
		}
		args[key] = value;
		index += 1;
	}

	return args;
}

function usage() {
	console.log(
		[
			'Usage:',
			'  node check_recent_candidate.mjs --title "Movie Title" --year 2026 --release-date 2026-03-14',
			'  node check_recent_candidate.mjs --title "Movie Title" --year 2026 --release-date 2026-03-14 --slug "movie-title-2026" --today 2026-04-01 --json',
		].join('\n'),
	);
}

function normalizeText(value) {
	return String(value ?? '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, ' ')
		.trim()
		.replace(/\s+/g, ' ');
}

function slugify(value) {
	return normalizeText(value).replace(/\s+/g, '-');
}

function parseIsoDate(value, label) {
	if (!value) return null;
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		throw new Error(`${label} must use YYYY-MM-DD format.`);
	}
	const parsed = new Date(`${value}T00:00:00Z`);
	if (Number.isNaN(parsed.getTime())) {
		throw new Error(`${label} is not a valid date.`);
	}
	return parsed;
}

function diffInDays(leftDate, rightDate) {
	return Math.floor((leftDate.getTime() - rightDate.getTime()) / DAY_MS);
}

async function loadCatalogRows() {
	try {
		const raw = await readFile(CATALOG_PATH, 'utf8');
		return raw
			.split(/\r?\n/)
			.filter((line) => /^\|\s*\d{4}\s*\|/.test(line))
			.map((line) => {
				const cells = line
					.split('|')
					.slice(1, -1)
					.map((cell) => cell.trim());
				return {
					year: Number(cells[0]),
					title: cells[1] ?? '',
					slug: cells[2] ?? '',
					category: cells[3] ?? '',
					platform: cells[4] ?? '',
				};
			});
	} catch {
		return [];
	}
}

async function loadMovieFiles() {
	const entries = await readdir(MOVIES_DIR, { withFileTypes: true });
	const movies = [];
	for (const entry of entries) {
		if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
		const filePath = path.join(MOVIES_DIR, entry.name);
		const raw = await readFile(filePath, 'utf8');
		const movie = JSON.parse(raw);
		movies.push({ filePath, movie });
	}
	return movies;
}

function isMatchingMovie(candidate, existing) {
	const candidateTitle = normalizeText(candidate.title);
	const candidateSlug = normalizeText(candidate.slug);
	const existingTitle = normalizeText(existing.title);
	const existingOriginalTitle = normalizeText(existing.originalTitle);
	const existingSlug = normalizeText(existing.slug);

	const sameYear = Number(existing.year) === Number(candidate.year);
	const titleMatch = Boolean(candidateTitle) && (existingTitle === candidateTitle || existingOriginalTitle === candidateTitle);
	const slugMatch = Boolean(candidateSlug) && existingSlug === candidateSlug;

	return slugMatch || (sameYear && titleMatch);
}

function buildResult(args, catalogRows, movieFiles) {
	const today = parseIsoDate(args.today ?? new Date().toISOString().slice(0, 10), 'today');
	const releaseDate = parseIsoDate(args['release-date'], 'release-date');
	const year = Number(args.year);
	if (!Number.isInteger(year)) {
		throw new Error('year must be an integer.');
	}

	const title = String(args.title ?? '').trim();
	if (!title) {
		throw new Error('title is required.');
	}

	const slug = String(args.slug ?? `${slugify(title)}-${year}`).trim();

	const candidate = {
		title,
		year,
		slug,
	};

	const catalogMatches = catalogRows.filter((row) => isMatchingMovie(candidate, row));
	const fileMatches = movieFiles
		.filter(({ movie }) => isMatchingMovie(candidate, movie))
		.map(({ filePath, movie }) => ({
			filePath: filePath.replace(/\\/g, '/'),
			title: movie.title ?? '',
			year: movie.year ?? '',
			slug: movie.slug ?? '',
		}));

	let recency = {
		status: 'unknown',
		ageDays: null,
		window: {
			recentDays: Number(args.recentDays),
		},
		message: 'No exact release date was provided.',
	};

	if (releaseDate) {
		const ageDays = diffInDays(today, releaseDate);
		const isReleased = ageDays >= 0;
		const isRecent = isReleased && ageDays <= Number(args.recentDays);
		recency = {
			status: isRecent ? 'recent' : isReleased ? 'stale' : 'unreleased',
			ageDays,
			window: {
				recentDays: Number(args.recentDays),
			},
			message: isRecent
				? `Release date ${args['release-date']} is inside the allowed window relative to ${args.today ?? today.toISOString().slice(0, 10)}.`
				: isReleased
					? `Release date ${args['release-date']} is already past, but outside the allowed recent window relative to ${args.today ?? today.toISOString().slice(0, 10)}.`
					: `Release date ${args['release-date']} is in the future relative to ${args.today ?? today.toISOString().slice(0, 10)}.`,
		};
	} else if (year === today.getUTCFullYear()) {
		recency = {
			status: 'coarse-current-year',
			ageDays: null,
			window: {
				recentDays: Number(args.recentDays),
			},
			message: 'No exact release date was provided. Manual verification is still required to prove the movie was already released.',
		};
	} else {
		recency = {
			status: 'stale',
			ageDays: null,
			window: {
				recentDays: Number(args.recentDays),
			},
			message: 'Without an exact release date, only current-year titles may pass as a fallback, and they still need release verification.',
		};
	}

	return {
		title,
		year,
		slug,
		today: args.today ?? today.toISOString().slice(0, 10),
		releaseDate: args['release-date'] ?? null,
		isDuplicate: catalogMatches.length > 0 || fileMatches.length > 0,
		catalogMatches,
		fileMatches,
		recency,
		okToProceed:
			(catalogMatches.length === 0 && fileMatches.length === 0) &&
			(recency.status === 'recent' || recency.status === 'coarse-current-year'),
	};
}

function printHuman(result) {
	console.log(`title: ${result.title}`);
	console.log(`year: ${result.year}`);
	console.log(`suggested slug: ${result.slug}`);
	console.log(`today: ${result.today}`);
	console.log(`release date: ${result.releaseDate ?? 'missing'}`);
	console.log(`duplicate: ${result.isDuplicate ? 'yes' : 'no'}`);
	if (result.catalogMatches.length > 0) {
		console.log(`catalog matches: ${result.catalogMatches.map((entry) => `${entry.title} (${entry.year}) [${entry.slug}]`).join(' | ')}`);
	}
	if (result.fileMatches.length > 0) {
		console.log(`file matches: ${result.fileMatches.map((entry) => `${entry.filePath} [${entry.slug}]`).join(' | ')}`);
	}
	console.log(`recency: ${result.recency.status}`);
	console.log(`recency note: ${result.recency.message}`);
	console.log(`ok to proceed: ${result.okToProceed ? 'yes' : 'no'}`);
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

	if (args.help || args.h) {
		usage();
		process.exit(0);
	}

	try {
		const [catalogRows, movieFiles] = await Promise.all([loadCatalogRows(), loadMovieFiles()]);
		const result = buildResult(args, catalogRows, movieFiles);

		if (args.json) {
			console.log(JSON.stringify(result, null, 2));
		} else {
			printHuman(result);
		}

		if (result.isDuplicate) {
			process.exit(2);
		}
		if (!(result.recency.status === 'recent' || result.recency.status === 'coarse-current-year')) {
			process.exit(3);
		}
		process.exit(0);
	} catch (error) {
		console.error(error.message);
		process.exit(1);
	}
}

main();
