import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const MOVIES_DIR = path.resolve('src/data/movies');
const PEOPLE_CATALOG_PATH = path.resolve('src/data/people.json');
const PUBLIC_DIR = path.resolve('public');

function parseArgs(argv) {
	const args = {
		movies: [],
		files: [],
	};

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === '--movie') {
			args.movies.push(argv[++index]);
		} else if (arg === '--file') {
			args.files.push(argv[++index]);
		} else if (arg === '--help' || arg === '-h') {
			args.help = true;
		} else {
			throw new Error(`Unknown argument: ${arg}`);
		}
	}

	return args;
}

function usage() {
	console.log(
		[
			'Usage:',
			'  npm run audit:movie-people -- --movie project-hail-mary-2026',
			'  npm run audit:movie-people -- --file src/data/movies/project-hail-mary-2026.json',
		].join('\n'),
	);
}

function normalizeWhitespace(value) {
	return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeKey(value) {
	return normalizeWhitespace(value)
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9\s']/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function splitCreditNames(value) {
	return normalizeWhitespace(value)
		.split(/\s*,\s*|\s+y\s+/i)
		.map((entry) => normalizeWhitespace(entry))
		.filter(Boolean);
}

function buildCatalogIndex(catalog) {
	return new Map(Object.keys(catalog).map((key) => [normalizeKey(key), key]));
}

function findCatalogEntry(catalog, index, personName) {
	const direct = catalog[personName];
	if (direct) {
		return direct;
	}

	const normalizedKey = index.get(normalizeKey(personName));
	return normalizedKey ? catalog[normalizedKey] : undefined;
}

async function loadJson(filePath) {
	return JSON.parse(await readFile(filePath, 'utf8'));
}

async function loadMovies(args) {
	const moviePaths = [
		...args.files.map((filePath) => path.resolve(filePath)),
		...args.movies.map((slug) => path.join(MOVIES_DIR, `${slug}.json`)),
	];

	if (moviePaths.length === 0) {
		throw new Error('Specify at least one --movie or --file.');
	}

	return Promise.all(
		moviePaths.map(async (moviePath) => ({
			filePath: moviePath,
			data: await loadJson(moviePath),
		})),
	);
}

function validatePersonCredit(personName, role, personRecord) {
	const errors = [];

	if (!personRecord) {
		errors.push(`${role}: ${personName} no existe en src/data/people.json`);
		return errors;
	}

	if (!personRecord.birthDate && !personRecord.birthYear) {
		errors.push(`${role}: ${personName} no tiene fecha de nacimiento cargada`);
	}

	if (!personRecord.nationalityPrimary) {
		errors.push(`${role}: ${personName} no tiene nacionalidad cargada`);
	}

	if (!personRecord.image) {
		errors.push(`${role}: ${personName} no tiene retrato local cargado`);
	}
	return errors;
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

	const catalog = await loadJson(PEOPLE_CATALOG_PATH);
	const catalogIndex = buildCatalogIndex(catalog);
	const movies = await loadMovies(args);
	const problems = [];

	for (const movie of movies) {
		const directors = splitCreditNames(movie.data.director);
		const cast = Array.isArray(movie.data.mainCast)
			? movie.data.mainCast.flatMap((entry) => splitCreditNames(entry))
			: [];

		for (const director of directors) {
			const entry = findCatalogEntry(catalog, catalogIndex, director);
			problems.push(
				...validatePersonCredit(director, 'director', entry),
			);
			if (entry?.image) {
				try {
					await readFile(path.resolve(PUBLIC_DIR, `.${entry.image}`));
				} catch {
					problems.push(`director: ${director} no tiene archivo de retrato en ${entry.image}`);
				}
			}
		}

		for (const actor of cast) {
			const entry = findCatalogEntry(catalog, catalogIndex, actor);
			problems.push(
				...validatePersonCredit(actor, 'cast', entry),
			);
			if (entry?.image) {
				try {
					await readFile(path.resolve(PUBLIC_DIR, `.${entry.image}`));
				} catch {
					problems.push(`cast: ${actor} no tiene archivo de retrato en ${entry.image}`);
				}
			}
		}
	}

	if (problems.length > 0) {
		console.error('Movie people audit failed:');
		for (const problem of problems) {
			console.error(`- ${problem}`);
		}
		process.exit(1);
	}

	console.log(`Movie people audit passed for ${movies.length} movie file(s).`);
}

main().catch((error) => {
	console.error(error.message);
	process.exit(1);
});
