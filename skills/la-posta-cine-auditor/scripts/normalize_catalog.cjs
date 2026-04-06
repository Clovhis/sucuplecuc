#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DEFAULT_ROOT = 'src/data/movies';
const LEGENDARY_MOVIE_SLUGS = new Set([
	'the-godfather-1972',
	'the-godfather-part-ii-1974',
	'casablanca-1943',
	'schindler-s-list-1993',
	'the-lord-of-the-rings-the-return-of-the-king-2003',
	'spirited-away-2001',
	'the-dark-knight-2008',
	'pulp-fiction-1994',
	'parasite-2019',
	'back-to-the-future-1985',
	'terminator-2-judgment-day-1991',
	'the-silence-of-the-lambs-1991',
	'star-wars-episode-v-the-empire-strikes-back-1980',
	'the-matrix-1999',
]);
const LABEL_POOLS = {
	recomendada: ['RECOMENDADA', 'ESTA BUENA', 'MUY BUENA', 'IMPERDIBLE', 'ESTA MUY BIEN', 'BUENISIMA'],
	zafa: ['PASABLE', 'ZAFA', 'ESTA OK', 'SE DEJA VER', 'CUMPLE', 'MAS O MENOS'],
	no_recomendada: ['NO LA MIRES', 'MALA', 'MALISIMA', 'ES UNA VERGA', 'UN GARRON', 'MUY FLOJA'],
	basura_atomica: ['BASURA TOTAL', 'NI LA PONGAS', 'HORRIBLE', 'DESASTRE', 'TODO MAL'],
	legendaria: ['LEGENDARIA', 'OBRA MAESTRA', 'CLASICO TOTAL'],
};

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

function stableHash(value) {
	let hash = 0;
	const text = String(value || '');
	for (let index = 0; index < text.length; index += 1) {
		hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
	}
	return hash;
}

function rotate(values, offset) {
	if (values.length === 0) {
		return values;
	}
	const safeOffset = ((offset % values.length) + values.length) % values.length;
	return values.slice(safeOffset).concat(values.slice(0, safeOffset));
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
			return {
				filePath,
				movie,
				categoryTokens,
				genreTokens,
				director: normalizeText(movie.director),
				cast: new Set((Array.isArray(movie.mainCast) ? movie.mainCast : []).map((name) => normalizeText(name)).filter(Boolean)),
				country: normalizeText(movie.country),
				platforms: new Set(getNormalizedPlatforms(movie)),
			};
		})
		sort((left, right) => String(left.movie.slug).localeCompare(String(right.movie.slug)));
}

function buildLabelPool(movieData) {
	if (LEGENDARY_MOVIE_SLUGS.has(String(movieData.movie.slug || ''))) {
		return rotate(LABEL_POOLS.legendaria, stableHash(movieData.movie.slug));
	}
	const verdict = movieData.movie.verdict;
	const hash = stableHash(movieData.movie.slug);
	const pool = LABEL_POOLS[verdict] || LABEL_POOLS.no_recomendada;
	return rotate(pool, hash);
}

function scorePair(source, target) {
	if (source.movie.slug === target.movie.slug) {
		return -Infinity;
	}

	let score = 0;
	const sourceCategories = new Set(source.categoryTokens);
	const sourceGenres = new Set(source.genreTokens);
	for (const token of target.categoryTokens) {
		if (sourceCategories.has(token)) score += 70;
	}
	for (const token of target.genreTokens) {
		if (sourceGenres.has(token)) score += 24;
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
	let labelsChanged = 0;
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

		const labelPool = buildLabelPool(movieData);
		const chosenLabel = labelPool[0];
		if (movie.verdictLabel !== chosenLabel) {
			movie.verdictLabel = chosenLabel;
			labelsChanged += 1;
		}

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
				labelsChanged,
				editorialChanged,
				awardsChanged,
			},
			null,
			2,
		),
	);
}

main();
