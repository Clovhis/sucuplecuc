import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const MOVIES_DIR = path.resolve('src/data/movies');
const TEMPLATE_PATH = path.resolve('templates/movie.template.json');
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function parseArgs(argv) {
	const result = {};
	for (let i = 0; i < argv.length; i += 1) {
		const token = argv[i];
		if (token === '--dry-run' || token === '--json') {
			result[token.slice(2)] = true;
			continue;
		}
		if (!token.startsWith('--')) continue;
		const key = token.slice(2);
		const value = argv[i + 1];
		if (!value || value.startsWith('--')) {
			throw new Error(`Falta valor para --${key}`);
		}
		result[key] = value;
		i += 1;
	}
	return result;
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

function assertValidInput(args) {
	const { title, year } = args;
	if (!title || !year) {
		throw new Error(
			'Uso: npm run new-movie -- --title "Mi Peli" --year 2026 [--slug "mi-peli-2026"] [--dry-run]',
		);
	}
	args.slug = String(args.slug ?? `${slugify(title)}-${year}`).trim();
	const { slug } = args;
	if (!SLUG_PATTERN.test(slug)) {
		throw new Error('Slug invalido. Usa solo minusculas, numeros y guiones.');
	}
	const numericYear = Number(year);
	if (!Number.isInteger(numericYear) || numericYear < 1888 || numericYear > 2100) {
		throw new Error('Year invalido. Debe ser un entero entre 1888 y 2100.');
	}
	return numericYear;
}

async function loadTemplate() {
	const rawTemplate = await readFile(TEMPLATE_PATH, 'utf8');
	return JSON.parse(rawTemplate);
}

function sameMovie(candidate, movie) {
	const sameSlug = movie.slug === candidate.slug;
	const sameYearAndTitle =
		Number(movie.year) === Number(candidate.year) &&
		[movie.title, movie.originalTitle].some((value) => normalizeText(value) === normalizeText(candidate.title));
	return sameSlug || sameYearAndTitle;
}

async function findDuplicates(candidate) {
	const files = await readdir(MOVIES_DIR);
	const duplicates = [];
	for (const fileName of files) {
		if (!fileName.endsWith('.json')) continue;
		const filePath = path.join(MOVIES_DIR, fileName);
		const movie = JSON.parse(await readFile(filePath, 'utf8'));
		if (sameMovie(candidate, movie)) {
			duplicates.push(filePath);
		}
	}
	return duplicates;
}

function printResult(result, asJson) {
	if (asJson) {
		console.log(JSON.stringify(result, null, 2));
		return;
	}

	console.log(`slug: ${result.slug}`);
	console.log(`output: ${result.outputPath}`);
	console.log(`duplicate: ${result.duplicates.length > 0 ? result.duplicates.join(', ') : 'no'}`);
	console.log(`dry run: ${result.dryRun ? 'yes' : 'no'}`);
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	const year = assertValidInput(args);

	await mkdir(MOVIES_DIR, { recursive: true });
	const outputPath = path.join(MOVIES_DIR, `${args.slug}.json`);
	const duplicates = await findDuplicates({ slug: args.slug, title: args.title, year });
	const result = {
		slug: args.slug,
		outputPath: outputPath.replace(/\\/g, '/'),
		duplicates: duplicates.map((duplicate) => duplicate.replace(/\\/g, '/')),
		dryRun: Boolean(args['dry-run']),
	};
	if (duplicates.length > 0) {
		printResult(result, args.json);
		throw new Error('La pelicula ya existe. No se creo ni modifico ningun archivo.');
	}
	if (args['dry-run']) {
		printResult(result, args.json);
		return;
	}

	const template = await loadTemplate();
	const movieData = {
		...template,
		editorial: {
			becauseYouLiked: [],
			related: [],
			...(template.editorial ?? {}),
		},
		slug: args.slug,
		title: args.title,
		year,
		synopsis:
			typeof args.synopsis === 'string' && args.synopsis.trim().length > 0
				? args.synopsis.trim()
				: template.synopsis,
	};

	await writeFile(outputPath, `${JSON.stringify(movieData, null, '\t')}\n`, 'utf8');
	printResult(result, args.json);
}

main().catch((error) => {
	console.error(error.message);
	process.exit(1);
});
