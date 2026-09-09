import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { generateMovieEditorialRecommendations } from '../src/lib/recommendation-engine.ts';

const MOVIES_DIR = path.resolve('src/data/movies');
const PRESERVE_SOURCE_DIR = process.env.MOVIE_RECOMMENDATIONS_PRESERVE_SOURCE_DIR
	? path.resolve(process.env.MOVIE_RECOMMENDATIONS_PRESERVE_SOURCE_DIR)
	: null;

async function loadMovies() {
	const fileNames = (await readdir(MOVIES_DIR)).filter((fileName) => fileName.endsWith('.json')).sort();
	const movies = [];

	for (const fileName of fileNames) {
		const filePath = path.join(MOVIES_DIR, fileName);
		const movie = JSON.parse(await readFile(filePath, 'utf8'));
		movies.push({ filePath, movie });
	}

	return movies;
}

function findEditorialObjectRange(source, filePath) {
	const propertyPattern = /"editorial"\s*:\s*/g;
	let property = null;
	for (let match = propertyPattern.exec(source); match; match = propertyPattern.exec(source)) {
		property = match;
	}
	if (!property) {
		throw new Error(`No se encontró editorial en ${filePath}.`);
	}

	const start = property.index + property[0].length;
	if (source[start] !== '{') {
		throw new Error(`editorial no es un objeto en ${filePath}.`);
	}

	let depth = 0;
	let inString = false;
	let escaped = false;
	for (let index = start; index < source.length; index += 1) {
		const character = source[index];
		if (inString) {
			if (escaped) {
				escaped = false;
			} else if (character === '\\') {
				escaped = true;
			} else if (character === '"') {
				inString = false;
			}
			continue;
		}
		if (character === '"') {
			inString = true;
		} else if (character === '{') {
			depth += 1;
		} else if (character === '}') {
			depth -= 1;
			if (depth === 0) {
				return { start, end: index + 1 };
			}
		}
	}

	throw new Error(`editorial quedó sin cerrar en ${filePath}.`);
}

function replaceEditorial(source, filePath, editorial) {
	const { start, end } = findEditorialObjectRange(source, filePath);
	const previousEditorial = source.slice(start, end);
	const indentation = previousEditorial.includes('\n') ? '\t' : undefined;
	const nextEditorial = JSON.stringify(editorial, null, indentation);
	return `${source.slice(0, start)}${nextEditorial}${source.slice(end)}`;
}

async function main() {
	const entries = await loadMovies();
	const allMovies = entries.map((entry) => entry.movie);
	let updatedCount = 0;

	for (const entry of entries) {
		const recommendations = generateMovieEditorialRecommendations(entry.movie, allMovies);
		const nextEditorial = {
			...(entry.movie.editorial && typeof entry.movie.editorial === 'object' ? entry.movie.editorial : {}),
			becauseYouLiked: recommendations.becauseYouLiked,
			related: recommendations.related,
		};

		const relativeFilePath = path.relative(process.cwd(), entry.filePath);
		const sourcePath = PRESERVE_SOURCE_DIR ? path.join(PRESERVE_SOURCE_DIR, relativeFilePath) : entry.filePath;
		const source = await readFile(sourcePath, 'utf8');
		const sourceMovie = JSON.parse(source);
		const currentEditorial = sourceMovie.editorial ?? {};
		if (
			JSON.stringify(currentEditorial.becauseYouLiked ?? []) === JSON.stringify(nextEditorial.becauseYouLiked) &&
			JSON.stringify(currentEditorial.related ?? []) === JSON.stringify(nextEditorial.related) &&
			sourcePath === entry.filePath
		) {
			continue;
		}

		await writeFile(entry.filePath, replaceEditorial(source, entry.filePath, nextEditorial), 'utf8');
		updatedCount += 1;
	}

	console.log(JSON.stringify({ movies: entries.length, updatedCount }, null, 2));
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
