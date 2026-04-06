import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MOVIES_DIR = path.join(ROOT_DIR, 'src/data/movies');
const OUTPUT_PATH = path.join(ROOT_DIR, 'docs/movie-catalog-reference.md');

function compareMovies(a, b) {
	return (
		b.year - a.year ||
		a.title.localeCompare(b.title, 'es', { sensitivity: 'base' }) ||
		a.slug.localeCompare(b.slug, 'es', { sensitivity: 'base' })
	);
}

function escapeCell(value) {
	return String(value ?? '').replace(/\|/g, '\\|');
}

function getCatalogPlatformLabel(movie) {
	const platforms =
		Array.isArray(movie.releasePlatforms) && movie.releasePlatforms.length > 0
			? movie.releasePlatforms
			: [movie.releasePlatform];

	return [...new Set(platforms.map((value) => String(value ?? '').trim()).filter(Boolean))].slice(0, 2).join(' + ');
}

async function loadMovies() {
	const fileNames = (await readdir(MOVIES_DIR)).filter((fileName) => fileName.endsWith('.json'));
	const movies = await Promise.all(
		fileNames.map(async (fileName) => {
			const raw = await readFile(path.join(MOVIES_DIR, fileName), 'utf8');
			return JSON.parse(raw);
		}),
	);

	return movies.sort(compareMovies);
}

export async function updateMovieCatalogReference() {
	const movies = await loadMovies();
	const today = new Date().toISOString().slice(0, 10);
	const lines = [
		'# Catalogo de peliculas del sitio',
		'',
		`Generado automaticamente el ${today}. Fuente: src/data/movies/*.json`,
		'',
		`Total de peliculas: ${movies.length}`,
		'',
		'| Año | Titulo | Slug | Categoria | Plataforma | Clasificación |',
		'| --- | --- | --- | --- | --- | --- |',
		...movies.map(
			(movie) =>
				`| ${escapeCell(movie.year)} | ${escapeCell(movie.title)} | ${escapeCell(movie.slug)} | ${escapeCell(movie.category)} | ${escapeCell(getCatalogPlatformLabel(movie))} | ${escapeCell(movie.audienceRating ?? '')} |`,
		),
		'',
	];

	await writeFile(OUTPUT_PATH, `${lines.join('\n')}`, 'utf8');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
	updateMovieCatalogReference().catch((error) => {
		console.error(error.message);
		process.exit(1);
	});
}
