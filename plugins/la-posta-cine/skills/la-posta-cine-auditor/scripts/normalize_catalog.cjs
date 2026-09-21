#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DEFAULT_ROOT = 'src/data/movies';

function parseArgs(argv) {
	const args = { root: DEFAULT_ROOT };
	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === '--root') {
			args.root = argv[++index];
		} else if (arg === '--help' || arg === '-h') {
			args.help = true;
		} else {
			throw new Error(`Unknown argument: ${arg}`);
		}
	}
	return args;
}

function usage() {
	console.log(['Usage:', '  node normalize_catalog.cjs --root src/data/movies'].join('\n'));
}

function normalizeText(value) {
	return String(value || '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function getNormalizedPlatforms(movie) {
	const sourcePlatforms =
		Array.isArray(movie.releasePlatforms) && movie.releasePlatforms.length > 0
			? movie.releasePlatforms
			: [movie.releasePlatform];

	return Array.from(new Set(sourcePlatforms.map((platform) => normalizeText(platform)).filter(Boolean))).slice(0, 2);
}

function buildMovieData(rootDir) {
	return fs
		.readdirSync(rootDir, { withFileTypes: true })
		.filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
		.map((entry) => {
			const filePath = path.join(rootDir, entry.name);
			const movie = JSON.parse(fs.readFileSync(filePath, 'utf8'));
			const categoryTokens = normalizeText(movie.category).split(' ').filter(Boolean);
			const genreTokens = Array.isArray(movie.genres)
				? movie.genres.flatMap((genre) => normalizeText(genre).split(' ').filter(Boolean))
				: [];
			const subgenreTokens = Array.isArray(movie.subgenres)
				? movie.subgenres.flatMap((subgenre) => normalizeText(subgenre).split(' ').filter(Boolean))
				: [];
			return {
				filePath,
				movie,
				categoryTokens,
				genreTokens,
				subgenreTokens,
				director: normalizeText(movie.director),
				cast: new Set((Array.isArray(movie.mainCast) ? movie.mainCast : []).map((name) => normalizeText(name)).filter(Boolean)),
				country: normalizeText(movie.country),
				platforms: new Set(getNormalizedPlatforms(movie)),
			};
		})
		.sort((left, right) => String(left.movie.slug).localeCompare(String(right.movie.slug)));
}

function scorePair(source, target) {
	if (source.movie.slug === target.movie.slug) {
		return -Infinity;
	}

	let score = 0;
	const sourceCategories = new Set(source.categoryTokens);
	const sourceGenres = new Set(source.genreTokens);
	const sourceSubgenres = new Set(source.subgenreTokens);
	for (const token of target.categoryTokens) {
		if (sourceCategories.has(token)) score += 70;
	}
	for (const token of target.genreTokens) {
		if (sourceGenres.has(token)) score += 24;
	}
	for (const token of target.subgenreTokens) {
		if (sourceSubgenres.has(token)) score += 36;
	}
	if (source.director && source.director === target.director) score += 60;
	for (const castMember of target.cast) {
		if (source.cast.has(castMember)) score += 18;
	}
	if (source.country && source.country === target.country) score += 6;
	if ([...source.platforms].some((platform) => target.platforms.has(platform))) score += 4;

	const yearDelta = Math.abs(Number(source.movie.year || 0) - Number(target.movie.year || 0));
	score += Math.max(0, 25 - yearDelta);

	return score;
}

function chooseRecommendations(source, allMovies) {
	const ranked = allMovies
		.map((target) => ({
			slug: target.movie.slug,
			score: scorePair(source, target),
			yearDelta: Math.abs(Number(source.movie.year || 0) - Number(target.movie.year || 0)),
		}))
		.filter((entry) => Number.isFinite(entry.score))
		.sort((left, right) => right.score - left.score || left.yearDelta - right.yearDelta || left.slug.localeCompare(right.slug));

	const becauseYouLiked = ranked.slice(0, 2).map((entry) => entry.slug);
	const related = ranked
		.filter((entry) => !becauseYouLiked.includes(entry.slug))
		.slice(0, 4)
		.map((entry) => entry.slug);

	return {
		becauseYouLiked,
		related,
	};
}

function main() {
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

	const rootDir = path.resolve(args.root);
	if (!fs.existsSync(rootDir)) {
		console.error(`Movies directory not found: ${rootDir}`);
		process.exit(1);
	}

	const movies = buildMovieData(rootDir);
	let editorialChanged = 0;
	let awardsChanged = 0;

	for (const movieData of movies) {
		const { movie } = movieData;
		const original = JSON.stringify(movie);

		if (!movie.awards || !Array.isArray(movie.awards.wins)) {
			movie.awards = { wins: [] };
			awardsChanged += 1;
		}

		const recommendations = chooseRecommendations(movieData, movies);
		const nextEditorial = {
			...(movie.editorial && typeof movie.editorial === 'object' && !Array.isArray(movie.editorial) ? movie.editorial : {}),
			becauseYouLiked: recommendations.becauseYouLiked,
			related: recommendations.related,
		};
		delete nextEditorial.idealFor;
		movie.editorial = nextEditorial;

		if (JSON.stringify(movie) !== original) {
			if (JSON.stringify(movie.editorial) !== JSON.stringify((JSON.parse(original).editorial))) {
				editorialChanged += 1;
			}
			fs.writeFileSync(movieData.filePath, JSON.stringify(movie, null, '\t') + '\n');
		}
	}

	console.log(
		JSON.stringify(
			{
				movies: movies.length,
				editorialChanged,
				awardsChanged,
			},
			null,
			2,
		),
	);
}

main();
