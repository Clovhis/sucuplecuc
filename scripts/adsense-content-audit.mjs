import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const MOVIE_DIR = 'src/data/movies';
const MIN_REVIEW_WORDS = 70;
const MIN_REVIEW_SENTENCES = 2;
const MIN_SYNOPSIS_WORDS = 25;
const MAX_EXAMPLES = 30;
const FULL_OUTPUT = process.argv.includes('--full');
const STRICT = process.argv.includes('--strict');
const referenceDate = new Date();

function wordCount(value) {
	return String(value ?? '')
		.trim()
		.split(/\s+/)
		.filter(Boolean).length;
}

function sentenceCount(value) {
	return String(value ?? '')
		.split(/[\n\r]+|(?<=[.!?])\s+/)
		.map((sentence) => sentence.trim())
		.filter(Boolean).length;
}

function normalize(value) {
	return String(value ?? '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/\s+/g, ' ')
		.trim();
}

function isReleased(movie) {
	if (movie.releaseDate) {
		const releaseDate = new Date(`${movie.releaseDate}T00:00:00Z`);
		return !Number.isNaN(releaseDate.getTime()) && releaseDate <= referenceDate;
	}

	return Number(movie.year) < referenceDate.getUTCFullYear();
}

function hasCutOffSynopsis(value) {
	const synopsis = String(value ?? '').trim();
	if (!synopsis) return true;

	return (
		!/[.!?…][”’\)]?$/.test(synopsis) ||
		/(?<!\p{L})(?:con|de|la|el|los|las|y|o|para|por|como|que|un)\.$/iu.test(synopsis) ||
		/[,:;—-]$/.test(synopsis) ||
		(synopsis.match(/\(/g)?.length ?? 0) !== (synopsis.match(/\)/g)?.length ?? 0) ||
		(synopsis.match(/[«“]/g)?.length ?? 0) !== (synopsis.match(/[»”]/g)?.length ?? 0)
	);
}

function synopsisHygieneIssues(value) {
	const synopsis = String(value ?? '');
	const issues = [];
	if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200D\uFEFF\uFFFD]/u.test(synopsis)) issues.push('invisible-or-control-character');
	if (/\(\s+|\s+\)/.test(synopsis)) issues.push('imported-parenthesis-spacing');
	if (/&(?:nbsp|amp|quot|lt|gt);|&#(?:\d+|x[\da-f]+);/i.test(synopsis)) issues.push('html-entity');
	if (/\b(?:pelicula|accion|tambien|despues|mision|publico|critica|version|continuacion)\b/i.test(synopsis)) issues.push('possible-missing-accent');
	return issues;
}

function shingles(value, size = 4) {
	const tokens = normalize(value).match(/[a-zñ]+/g) ?? [];
	const result = new Set();
	for (let index = 0; index <= tokens.length - size; index += 1) result.add(tokens.slice(index, index + size).join(' '));
	return result;
}

function findSimilarSynopses(movies) {
	const index = new Map();
	const pairs = new Map();
	for (const movie of movies) {
		const movieShingles = shingles(movie.synopsis);
		for (const shingle of movieShingles) {
			for (const other of index.get(shingle) ?? []) {
				const key = [other.slug, movie.slug].sort().join('|');
				pairs.set(key, (pairs.get(key) ?? 0) + 1);
			}
			if (!index.has(shingle)) index.set(shingle, []);
			index.get(shingle).push(movie);
		}
	}
	return [...pairs.entries()]
		.filter(([, shared]) => shared >= 3)
		.map(([key, shared]) => {
			const [leftSlug, rightSlug] = key.split('|');
			const left = movies.find((movie) => movie.slug === leftSlug);
			const right = movies.find((movie) => movie.slug === rightSlug);
			const union = new Set([...shingles(left.synopsis), ...shingles(right.synopsis)]).size;
			return { left: leftSlug, right: rightSlug, sharedFourWordPhrases: shared, similarity: Number((shared / union).toFixed(2)) };
		})
		.filter((pair) => pair.similarity >= 0.2)
		.sort((left, right) => right.similarity - left.similarity || right.sharedFourWordPhrases - left.sharedFourWordPhrases);
}

function summarizeWords(values) {
	const sorted = values.slice().sort((left, right) => left - right);
	const total = sorted.reduce((sum, value) => sum + value, 0);

	return {
		min: sorted[0] ?? 0,
		median: sorted[Math.floor(sorted.length / 2)] ?? 0,
		avg: sorted.length ? Math.round(total / sorted.length) : 0,
		max: sorted.at(-1) ?? 0,
	};
}

const movieFiles = readdirSync(MOVIE_DIR).filter((fileName) => fileName.endsWith('.json'));
const movies = movieFiles.map((fileName) => {
	const filePath = join(MOVIE_DIR, fileName);
	const movie = JSON.parse(readFileSync(filePath, 'utf8'));
	return {
		filePath,
		slug: movie.slug,
		title: movie.title,
		released: isReleased(movie),
		reviewWords: wordCount(movie.review),
		reviewSentences: sentenceCount(movie.review),
		synopsisWords: wordCount(movie.synopsis),
		synopsis: movie.synopsis,
		cutOffSynopsis: hasCutOffSynopsis(movie.synopsis),
		synopsisHygieneIssues: synopsisHygieneIssues(movie.synopsis),
		reviewRepeatsSynopsis: normalize(movie.review).includes(normalize(movie.synopsis)),
		posterIsExternal: /^https?:\/\//i.test(String(movie.poster ?? '')),
		hasScreenshots: Array.isArray(movie.screenshots) && movie.screenshots.length > 0,
	};
});

const releasedMovies = movies.filter((movie) => movie.released);
const shortReviews = releasedMovies
	.filter(
		(movie) =>
			movie.reviewWords < MIN_REVIEW_WORDS || movie.reviewSentences < MIN_REVIEW_SENTENCES,
	)
	.sort(
		(left, right) =>
			left.reviewWords - right.reviewWords ||
			left.reviewSentences - right.reviewSentences ||
			left.slug.localeCompare(right.slug),
	);
const weakSynopses = releasedMovies
	.filter((movie) => movie.synopsisWords < MIN_SYNOPSIS_WORDS || movie.cutOffSynopsis || movie.reviewRepeatsSynopsis)
	.sort((left, right) => left.synopsisWords - right.synopsisWords || left.slug.localeCompare(right.slug));
const synopsisHygiene = releasedMovies
	.filter((movie) => movie.synopsisHygieneIssues.length > 0)
	.sort((left, right) => left.slug.localeCompare(right.slug));
const similarSynopses = findSimilarSynopses(releasedMovies);
const externalImageOnly = releasedMovies.filter((movie) => movie.posterIsExternal && !movie.hasScreenshots);

const report = {
	referenceDate: referenceDate.toISOString(),
	movieFiles: movieFiles.length,
	releasedMovies: releasedMovies.length,
	reviewWords: summarizeWords(releasedMovies.map((movie) => movie.reviewWords)),
	synopsisWords: summarizeWords(releasedMovies.map((movie) => movie.synopsisWords)),
	shortReviews: {
		thresholdWords: MIN_REVIEW_WORDS,
		minimumSentences: MIN_REVIEW_SENTENCES,
		note: 'Una reseña editorial debe desarrollar una postura; menos de 70 palabras o menos de dos oraciones requiere reescritura manual.',
		count: shortReviews.length,
		examples: shortReviews.slice(0, MAX_EXAMPLES).map((movie) => ({
			slug: movie.slug,
			title: movie.title,
			words: movie.reviewWords,
			sentences: movie.reviewSentences,
			filePath: movie.filePath,
		})),
		...(FULL_OUTPUT
			? {
				all: shortReviews.map((movie) => ({
					slug: movie.slug,
					title: movie.title,
					words: movie.reviewWords,
					sentences: movie.reviewSentences,
					filePath: movie.filePath,
				})),
			}
			: {}),
	},
	weakSynopses: {
		count: weakSynopses.length,
		examples: weakSynopses.slice(0, MAX_EXAMPLES).map((movie) => ({
			slug: movie.slug,
			title: movie.title,
			words: movie.synopsisWords,
			cutOff: movie.cutOffSynopsis,
			repeatsReview: movie.reviewRepeatsSynopsis,
			filePath: movie.filePath,
		})),
	},
	synopsisHygiene: {
		count: synopsisHygiene.length,
		examples: synopsisHygiene.slice(0, MAX_EXAMPLES).map((movie) => ({ slug: movie.slug, title: movie.title, issues: movie.synopsisHygieneIssues, filePath: movie.filePath })),
	},
	similarSynopses: {
		count: similarSynopses.length,
		examples: similarSynopses.slice(0, MAX_EXAMPLES),
	},
	externalImageOnly: {
		count: externalImageOnly.length,
		note: 'External posters are not automatically a policy issue, but original screenshots or owned assets help the page feel less copied.',
	},
};

console.log(JSON.stringify(report, null, 2));

if (STRICT && (weakSynopses.length || synopsisHygiene.length || similarSynopses.length)) process.exit(1);
