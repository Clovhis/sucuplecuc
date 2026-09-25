import { lstat, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

const MOVIES_DIR = path.resolve('src/data/movies');
const PEOPLE_CATALOG_PATH = path.resolve('src/data/people.json');
const PUBLIC_DIR = path.resolve('public');
const PEOPLE_PUBLIC_DIR = path.resolve(PUBLIC_DIR, 'people');

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

function hasFirstAndLastName(value) {
	const words = normalizeKey(value)
		.split(' ')
		.filter((word) => word.replace(/[^a-z']/g, '').length > 1);
	return words.length >= 2;
}

function resolveLocalPortraitPath(personRecord) {
	const image = typeof personRecord?.image === 'string' ? personRecord.image.trim() : '';
	if (!/^\/people\/(?:[^/\\]+\/)*[^/\\]+\.(?:jpe?g|png|webp)$/i.test(image)) {
		return null;
	}

	const imagePath = path.resolve(PUBLIC_DIR, `.${image}`);
	const peopleRoot = `${PEOPLE_PUBLIC_DIR}${path.sep}`;
	if (!imagePath.startsWith(peopleRoot)) {
		return null;
	}
	return imagePath;
}

async function validatePersonCredit(personName, role, personRecord, problems, warnings) {
	if (!personRecord) {
		problems.push(`${role}: ${personName} no tiene una ficha personal con nombre y retrato local verificado; completarla o quitar ese crédito de la película.`);
		return { qualifiesForMinimum: false };
	}

	const displayName = normalizeWhitespace(personRecord.name);
	const aliases = Array.isArray(personRecord.aliases)
		? personRecord.aliases.filter((alias) => typeof alias === 'string').map(normalizeKey)
		: [];
	const normalizedCredit = normalizeKey(personName);
	const nameMatchesCredit = Boolean(displayName) &&
		(normalizeKey(displayName) === normalizedCredit || aliases.includes(normalizedCredit));
	if (!displayName) {
		problems.push(`${role}: ${personName} no tiene un nombre visible en people.json`);
	} else if (!nameMatchesCredit) {
		problems.push(`${role}: el nombre de people.json (${displayName}) ni sus aliases coinciden con el crédito ${personName}`);
	}

	if (!personRecord.birthDate && !personRecord.birthYear) {
		warnings.push(`${role}: ${personName} no tiene fecha de nacimiento pública verificada`);
	}

	if (!personRecord.nationalityPrimary) {
		warnings.push(`${role}: ${personName} no tiene nacionalidad pública verificada; nationalityPrimary queda ausente.`);
	}

	const portraitPath = resolveLocalPortraitPath(personRecord);
	let hasLocalPortrait = false;
	if (!portraitPath) {
		problems.push(`${role}: ${personName} necesita un retrato local válido en public/people`);
	} else {
		try {
			const imageStat = await lstat(portraitPath);
			if (!imageStat.isFile()) {
				throw new Error('portrait path is not a regular file');
			}
			const image = await readFile(portraitPath);
			const metadata = await sharp(image, { animated: false, failOn: 'warning' }).metadata();
			if (!['jpeg', 'png', 'webp'].includes(metadata.format) || !metadata.width || !metadata.height) {
				throw new Error('portrait is not a decodable raster image');
			}
			await sharp(image, { animated: false, failOn: 'warning' }).resize(1, 1).toBuffer();
			if (metadata.width < 200 || metadata.height < 250) {
				problems.push(`${role}: ${personName} necesita un retrato local de al menos 200x250 px (actual ${metadata.width}x${metadata.height})`);
			} else {
				hasLocalPortrait = true;
			}
		} catch {
			problems.push(`${role}: ${personName} no tiene un archivo local de retrato válido en ${personRecord.image}`);
		}
	}

	const referenceUrls = Array.isArray(personRecord.referenceUrls)
		? personRecord.referenceUrls.filter((url) => {
			if (typeof url !== 'string') return false;
			try {
				return ['http:', 'https:'].includes(new URL(url).protocol);
			} catch {
				return false;
			}
		})
		: [];
	const hasTraceableReference =
		(typeof personRecord.imdbUrl === 'string' && /^https?:\/\/(?:www\.)?imdb\.com\/name\/nm\d+\/?$/i.test(personRecord.imdbUrl)) ||
		referenceUrls.length > 0;
	if (!hasTraceableReference) {
		problems.push(`${role}: ${personName} necesita al menos una referencia trazable para validar identidad y retrato`);
	}

	return {
		qualifiesForMinimum:
			nameMatchesCredit &&
			hasFirstAndLastName(displayName) &&
			hasFirstAndLastName(personName) &&
			hasLocalPortrait &&
			hasTraceableReference,
		personIdentity: normalizeKey(displayName),
	};
}

function validateMovieCreditMinimum(directorChecks, castChecks, problems) {
	const directors = new Set(directorChecks.map(({ name }) => normalizeKey(name)).filter(Boolean));
	const cast = new Set(castChecks.map(({ name }) => normalizeKey(name)).filter(Boolean));
	const fullyNamedDirectors = new Set(
		directorChecks
			.filter(({ result }) => result.qualifiesForMinimum)
			.map(({ result }) => result.personIdentity),
	);
	const fullyNamedActors = new Set(
		castChecks
			.filter(({ result }) => result.qualifiesForMinimum)
			.map(({ result }) => result.personIdentity),
	);

	if (directors.size < 1) {
		problems.push('director: la película debe conservar al menos un director verificado');
	}
	if (fullyNamedDirectors.size < 1) {
		problems.push('director: al menos un director debe tener nombre y apellido, referencia trazable y retrato local');
	}
	if (cast.size < 2) {
		problems.push('cast: la película debe conservar al menos dos actores/intérpretes principales distintos y verificados');
	}
	if (fullyNamedActors.size < 2) {
		problems.push('cast: al menos dos actores/intérpretes deben tener nombre y apellido, referencia trazable y retrato local');
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

	const catalog = await loadJson(PEOPLE_CATALOG_PATH);
	const catalogIndex = buildCatalogIndex(catalog);
	const movies = await loadMovies(args);
	const problems = [];
	const warnings = [];

	for (const movie of movies) {
		const directors = splitCreditNames(movie.data.director);
		const cast = Array.isArray(movie.data.mainCast)
			? movie.data.mainCast.flatMap((entry) => splitCreditNames(entry))
			: [];
		const directorChecks = [];
		const castChecks = [];

		for (const director of directors) {
			const entry = findCatalogEntry(catalog, catalogIndex, director);
			const result = await validatePersonCredit(director, 'director', entry, problems, warnings);
			directorChecks.push({ name: director, result });
		}

		for (const actor of cast) {
			const entry = findCatalogEntry(catalog, catalogIndex, actor);
			const result = await validatePersonCredit(actor, 'cast', entry, problems, warnings);
			castChecks.push({ name: actor, result });
		}

		validateMovieCreditMinimum(directorChecks, castChecks, problems);
	}

	if (problems.length > 0) {
		console.error('Movie people audit failed:');
		for (const problem of problems) {
			console.error(`- ${problem}`);
		}
		process.exit(1);
	}

	if (warnings.length > 0) {
		console.warn('Movie people audit warnings:');
		for (const warning of warnings) console.warn(`- ${warning}`);
	}
	console.log(`Movie people audit passed for ${movies.length} movie file(s).`);
}

main().catch((error) => {
	console.error(error.message);
	process.exit(1);
});
