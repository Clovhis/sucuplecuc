import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { generateMovieEditorialRecommendations } from '../src/lib/recommendation-engine.ts';

const MOVIES_DIR = path.resolve('src/data/movies');

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

		const currentEditorial = entry.movie.editorial ?? {};
		if (
			JSON.stringify(currentEditorial.becauseYouLiked ?? []) === JSON.stringify(nextEditorial.becauseYouLiked) &&
			JSON.stringify(currentEditorial.related ?? []) === JSON.stringify(nextEditorial.related)
		) {
			continue;
		}

		entry.movie.editorial = nextEditorial;
		await writeFile(entry.filePath, `${JSON.stringify(entry.movie, null, '\t')}\n`, 'utf8');
		updatedCount += 1;
	}

	console.log(JSON.stringify({ movies: entries.length, updatedCount }, null, 2));
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
