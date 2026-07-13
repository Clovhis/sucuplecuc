import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const MOVIE_DIR = 'src/data/movies';
const MIN_REVIEW_WORDS = 70;
const MIN_REVIEW_SENTENCES = 2;
const MIN_SYNOPSIS_WORDS = 25;
const MAX_EXAMPLES = 30;
const FULL_OUTPUT = process.argv.includes('--full');
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

	return /(?:\bcon|\bde|\bla|\bel|\blos|\blas|\by|\bo|\bpara|\bpor|\bcomo|\bque|\bun|\buna)\.$/i.test(
		synopsis,
	);
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
		cutOffSynopsis: hasCutOffSynopsis(movie.synopsis),
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
	externalImageOnly: {
		count: externalImageOnly.length,
		note: 'External posters are not automatically a policy issue, but original screenshots or owned assets help the page feel less copied.',
	},
};

console.log(JSON.stringify(report, null, 2));
