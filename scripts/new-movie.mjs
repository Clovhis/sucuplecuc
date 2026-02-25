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

function assertValidInput(args) {
	const { slug, title, year } = args;
	if (!slug || !title || !year) {
		throw new Error(
			'Uso: npm run new-movie -- --slug "mi-peli-2026" --title "Mi Peli" --year 2026',
		);
	}
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

async function slugAlreadyExists(newSlug) {
	const files = await readdir(MOVIES_DIR);
	for (const fileName of files) {
		if (!fileName.endsWith('.json')) continue;
		const filePath = path.join(MOVIES_DIR, fileName);
		const movie = JSON.parse(await readFile(filePath, 'utf8'));
		if (movie.slug === newSlug) {
			return filePath;
		}
	}
	return null;
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	const year = assertValidInput(args);

	await mkdir(MOVIES_DIR, { recursive: true });
	const duplicatePath = await slugAlreadyExists(args.slug);
	if (duplicatePath) {
		throw new Error(`Ya existe una pelicula con ese slug: ${duplicatePath}`);
	}

	const outputPath = path.join(MOVIES_DIR, `${args.slug}.json`);
	const template = await loadTemplate();
	const movieData = {
		...template,
		slug: args.slug,
		title: args.title,
		year,
	};

	await writeFile(outputPath, `${JSON.stringify(movieData, null, '\t')}\n`, 'utf8');
	console.log(`Entrada creada en ${outputPath}`);
}

main().catch((error) => {
	console.error(error.message);
	process.exit(1);
});

