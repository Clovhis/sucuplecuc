import { existsSync } from 'node:fs';
import { lstat, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';
import { hasFirstAndLastName, normalizeCreditName, validateMovieCreditCoverage } from './movie-credit-coverage.mjs';

const MOVIES_DIR = path.resolve('src/data/movies');
const PEOPLE_CATALOG_PATH = path.resolve('src/data/people.json');
const PUBLIC_DIR = path.resolve('public');
const PEOPLE_PUBLIC_DIR = path.resolve(PUBLIC_DIR, 'people');

function parseArgs(argv) {
	const args = {
		movies: [],
		files: [],
		creditReview: undefined,
		baseRef: 'origin/main',
	};

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === '--movie') {
			args.movies.push(argv[++index]);
		} else if (arg === '--file') {
			args.files.push(argv[++index]);
		} else if (arg === '--credit-review') {
			args.creditReview = argv[++index];
			if (!args.creditReview || args.creditReview.startsWith('--')) throw new Error('--credit-review necesita la ruta del ledger de elenco.');
		} else if (arg === '--base-ref') {
			args.baseRef = argv[++index];
			if (!args.baseRef || args.baseRef.startsWith('--')) throw new Error('--base-ref necesita una referencia Git existente.');
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
			'  npm run audit:movie-people -- --movie project-hail-mary-2026 --base-ref origin/main --credit-review reports/movie-intake/project-hail-mary-2026.json',
		].join('\n'),
	);
}

function normalizeWhitespace(value) {
	return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeKey(value) {
	return normalizeCreditName(value);
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

function runGit(args) {
	return spawnSync('git', args, { cwd: process.cwd(), encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
}

function isNewMovieFile(filePath, preferredBaseRef) {
	const relative = path.relative(process.cwd(), path.resolve(filePath)).replace(/\\/g, '/');
	if (!relative.startsWith('src/data/movies/') || relative.includes('..')) return false;
	for (const ref of [...new Set([preferredBaseRef, 'origin/main', 'main', 'HEAD'].filter(Boolean))]) {
		if (runGit(['rev-parse', '--verify', '--quiet', ref]).status !== 0) continue;
		return runGit(['cat-file', '-e', `${ref}:${relative}`]).status !== 0;
	}
	const tracked = runGit(['ls-files', '--error-unmatch', '--', relative]).status === 0;
	if (!tracked) return true;
	return runGit(['diff', '--cached', '--name-only', '--diff-filter=A', 'HEAD', '--', relative]).stdout.trim() === relative;
}

function defaultReviewPath(movie) {
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(movie.slug ?? '')) throw new Error('La ficha nueva necesita un slug válido para ubicar su ledger de elenco.');
	return path.resolve(`reports/movie-intake/${movie.slug}.json`);
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

async function validatePersonCredit(personName, role, personRecord, problems, warnings, allowPortraitException = false) {
	if (allowPortraitException && (personRecord?.image?.trim() || personRecord?.remoteImageUrl?.trim())) {
		problems.push(`${role}: ${personName} declara excepción de retrato aunque conserva una ruta de imagen; quitá la URI o aportá un retrato verificado.`);
		return { qualifiesForMinimum: false };
	}
	if (!personRecord) {
		if (allowPortraitException) return { qualifiesForMinimum: false };
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
		const hasBrokenOrRemotePortrait = Boolean(personRecord.image?.trim() || personRecord.remoteImageUrl?.trim());
		if (!allowPortraitException || hasBrokenOrRemotePortrait) problems.push(`${role}: ${personName} necesita un retrato local válido en public/people`);
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
	if (!hasTraceableReference && !allowPortraitException) {
		problems.push(`${role}: ${personName} necesita al menos una referencia trazable para validar identidad y retrato`);
	}

	return {
		qualifiesForMinimum:
			!allowPortraitException &&
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
	if (args.creditReview && movies.length !== 1) throw new Error('--credit-review sólo puede acompañar una ficha por ejecución.');
	const problems = [];
	const warnings = [];

	for (const movie of movies) {
		const isNew = isNewMovieFile(movie.filePath, args.baseRef);
		let portraitExceptions = new Set();
		const defaultPath = defaultReviewPath(movie.data);
		const reviewPath = args.creditReview ? path.resolve(args.creditReview) : defaultPath;
		const hasPublishedReview = existsSync(defaultPath);
		if (args.creditReview && !isNew && !hasPublishedReview) {
			problems.push(`${movie.filePath}: --credit-review no puede aplicar retroactivamente el contrato de nuevas altas a una ficha histórica sin ledger.`);
			continue;
		}
		if (args.creditReview && reviewPath !== defaultPath) {
			problems.push(`${movie.filePath}: el ledger debe corresponder a esta ficha: ${path.relative(process.cwd(), defaultPath)}`);
			continue;
		}
		const applyNewCreditContract = isNew || hasPublishedReview;
		if (applyNewCreditContract) {
			if (isNew && !existsSync(reviewPath)) {
				problems.push(`${movie.filePath}: falta el ledger de elenco ${path.relative(process.cwd(), reviewPath)}`);
				continue;
			}
			try {
				const review = await loadJson(reviewPath);
				const coverage = validateMovieCreditCoverage(movie.data, review);
				portraitExceptions = coverage.portraitExceptions;
				problems.push(...coverage.errors.map(problem => `${movie.filePath}: ${problem}`));
			} catch (error) {
				problems.push(`${movie.filePath}: ${error.code === 'ENOENT' ? `falta el ledger de elenco ${path.relative(process.cwd(), reviewPath)}` : error.message}`);
			}
		}
		const directors = splitCreditNames(movie.data.director);
		const cast = Array.isArray(movie.data.mainCast)
			? movie.data.mainCast.flatMap((entry) => splitCreditNames(entry))
			: [];
		const directorChecks = [];
		const castChecks = [];

		for (const director of directors) {
			const entry = findCatalogEntry(catalog, catalogIndex, director);
			const result = await validatePersonCredit(director, 'director', entry, problems, warnings, portraitExceptions.has(`director:${normalizeCreditName(director)}`));
			directorChecks.push({ name: director, result });
		}

		for (const actor of cast) {
			const entry = findCatalogEntry(catalog, catalogIndex, actor);
			const result = await validatePersonCredit(actor, 'cast', entry, problems, warnings, portraitExceptions.has(`performer:${normalizeCreditName(actor)}`));
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
