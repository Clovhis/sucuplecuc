import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const MOVIE_DIR = 'src/data/movies';
const MAX_EXAMPLES = 40;
const MIN_REPEAT_SENTENCE_WORDS = 6;
const MAX_REPEAT_SENTENCE_WORDS = 28;
const MIN_SHARED_SENTENCE_COUNT = 3;
const MIN_REVIEW_WORDS = 24;
const MIN_UNDERDEVELOPED_WORDS = 32;
const FULL_OUTPUT = process.argv.includes('--full');
const referenceDate = new Date();

const GENERATED_REVIEW_MARKERS = [
	'tiene esta base narrativa',
	'no puede esconderse demasiado',
	'la decision pasa menos por disponibilidad',
	'este cruce puntual de nombres genero y premisa',
	'con una puesta que aprovecha a',
	'no depende unicamente de explicar la trama',
	'tiene un gancho concreto y suficientes elementos propios',
	'tiene atractivos reconocibles aunque tambien deja la sensacion',
	'promete mas de lo que termina ordenando',
	'se juega en como sostiene su tono',
	'necesita que esos nombres le den pulso propio a la historia',
];
const TEMPLATE_REVIEW_MARKERS = [
	'recomendada porque',
	'pasable porque',
	'esta muy bien porque',
	'esta buena porque',
	'entiende que quiere ver el publico',
	'tiene momentos con brillo',
	'suma fuerte',
	'se juega en como sostiene su tono',
	'no se juega tanto en la novedad',
	'encuentra aire propio',
	'pierde un poco de fuerza',
	'rinde por tramos',
];
const VERDICT_LABEL_TEMPLATE_PATTERNS = [
	'<label> porque',
	'lo que la vuelve <label>',
	'el veredicto de <label>',
	'el <label> viene de',
	'la <label> viene de',
];
const MECHANICAL_VERDICT_LABELS = [
	'NO RECOMENDADA',
	'NO VA',
	'BASURA ATOMICA',
	'BASURA TOTAL',
	'MALISIMA',
	'MALA',
	'PASABLE',
	'SE DEJA VER',
	'MUY RECOMENDADA',
	'RECOMENDADA',
	'MUY BUENA',
	'ESTA MUY BIEN',
	'ESTA BUENA',
	'ESTA OK',
	'ZAFABLE',
	'ZAFA',
	'MAS O MENOS',
];

function wordCount(value) {
	return String(value ?? '')
		.trim()
		.split(/\s+/)
		.filter(Boolean).length;
}

function normalize(value) {
	return String(value ?? '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function escapeRegex(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isReleased(movie) {
	if (movie.releaseDate) {
		const releaseDate = new Date(`${movie.releaseDate}T00:00:00Z`);
		return !Number.isNaN(releaseDate.getTime()) && releaseDate <= referenceDate;
	}

	return Number(movie.year) < referenceDate.getUTCFullYear();
}

function splitIntoSentences(value) {
	return String(value ?? '')
		.split(/[\n\r]+|(?<=[.!?])\s+/)
		.map((sentence) => normalize(sentence))
		.filter(Boolean)
		.filter((sentence) => {
			const words = wordCount(sentence);
			return words >= MIN_REPEAT_SENTENCE_WORDS && words <= MAX_REPEAT_SENTENCE_WORDS;
		});
}

function rawSentenceCount(value) {
	return String(value ?? '')
		.split(/[\n\r]+|(?<=[.!?])\s+/)
		.map((sentence) => sentence.trim())
		.filter(Boolean).length;
}

function loadMovies() {
	return readdirSync(MOVIE_DIR)
		.filter((fileName) => fileName.endsWith('.json'))
		.map((fileName) => {
			const filePath = join(MOVIE_DIR, fileName);
			const movie = JSON.parse(readFileSync(filePath, 'utf8'));
			return { filePath, movie };
		});
}

function getTitleVariants(movie) {
	return [...new Set([movie.title, movie.originalTitle].map((value) => normalize(value)).filter(Boolean))];
}

function countPhraseOccurrences(haystack, needle) {
	if (!haystack || !needle) {
		return 0;
	}

	const matches = haystack.match(new RegExp(`\\b${escapeRegex(needle)}\\b`, 'g'));
	return matches?.length ?? 0;
}

function firstSentence(value) {
	const sentence = String(value ?? '')
		.split(/(?<=[.!?])\s+/)
		.map((part) => part.trim())
		.find(Boolean);
	return sentence ?? '';
}

function buildOpenerPattern(movie, review) {
	let pattern = normalize(firstSentence(review));
	for (const titleVariant of getTitleVariants(movie)) {
		if (!titleVariant) continue;
		pattern = pattern.replace(new RegExp(`\\b${escapeRegex(titleVariant)}\\b`, 'g'), '<title>');
	}
	return pattern;
}

function buildRepeatedSentenceMap(entries) {
	const repeatedSentences = new Map();

	for (const { filePath, movie } of entries) {
		for (const sentence of new Set(splitIntoSentences(movie.review))) {
			const current = repeatedSentences.get(sentence) ?? [];
			current.push({
				slug: movie.slug,
				title: movie.title,
				filePath,
			});
			repeatedSentences.set(sentence, current);
		}
	}

	return repeatedSentences;
}

function buildOpenerPatternMap(entries) {
	const openerPatterns = new Map();

	for (const { filePath, movie } of entries) {
		const openerPattern = buildOpenerPattern(movie, movie.review);
		if (!openerPattern) {
			continue;
		}

		const current = openerPatterns.get(openerPattern) ?? [];
		current.push({
			slug: movie.slug,
			title: movie.title,
			filePath,
		});
		openerPatterns.set(openerPattern, current);
	}

	return openerPatterns;
}

function getRepeatedEntryCount(map, key) {
	const entries = map.get(key) ?? [];
	return entries.length;
}

function getCastMatches(movie, normalizedReview) {
	return (Array.isArray(movie.mainCast) ? movie.mainCast : [])
		.slice(0, 3)
		.map((name) => normalize(name))
		.filter(Boolean)
		.filter((name) => normalizedReview.includes(name));
}

function getRepeatedSentenceHits(movie, repeatedSentenceMap) {
	return [...new Set(splitIntoSentences(movie.review))]
		.filter((sentence) => getRepeatedEntryCount(repeatedSentenceMap, sentence) >= MIN_SHARED_SENTENCE_COUNT)
		.map((sentence) => ({
			sentence,
			count: getRepeatedEntryCount(repeatedSentenceMap, sentence),
		}))
		.sort((left, right) => right.count - left.count || left.sentence.localeCompare(right.sentence, 'es'));
}

function getVerdictLabelTemplateHits(movie) {
	const normalizedReview = normalize(movie.review);
	const normalizedVerdictLabel = normalize(movie.verdictLabel);
	if (!normalizedReview || !normalizedVerdictLabel) {
		return [];
	}

	const stockPhraseHits = VERDICT_LABEL_TEMPLATE_PATTERNS
		.map((pattern) => pattern.replaceAll('<label>', normalizedVerdictLabel))
		.filter((pattern) => normalizedReview.includes(pattern));
	const review = String(movie.review ?? '');
	const labels = [...new Set([movie.verdictLabel, ...MECHANICAL_VERDICT_LABELS].map((value) => String(value ?? '').trim()).filter(Boolean))];
	const matchingLabels = labels
		.filter((label) => new RegExp(`\\b${escapeRegex(label)}\\s*:`, 'iu').test(review))
		.sort((left, right) => right.length - left.length || left.localeCompare(right, 'es'));
	const colonHits = matchingLabels
		.filter(
			(label) =>
				!matchingLabels.some(
					(otherLabel) => otherLabel.length > label.length && normalize(otherLabel).endsWith(normalize(label)),
				),
		)
		.map((label) => `verdict-label colon :: ${label}`);
	return [...stockPhraseHits, ...colonHits];
}

function getSuspectSignals(movie, repeatedSentenceMap, openerPatternMap) {
	const normalizedReview = normalize(movie.review);
	const normalizedDirector = normalize(movie.director);
	const normalizedVerdictLabel = normalize(movie.verdictLabel);
	const normalizedPlatform = normalize(movie.releasePlatform);
	const markerHits = GENERATED_REVIEW_MARKERS.filter((marker) => normalizedReview.includes(marker));
	const titleMentions = Math.max(...getTitleVariants(movie).map((titleVariant) => countPhraseOccurrences(normalizedReview, titleVariant)), 0);
	const castMatches = getCastMatches(movie, normalizedReview);
	const castHits = castMatches.length;
	const directorHit = normalizedDirector ? normalizedReview.includes(normalizedDirector) : false;
	const runtimeHit =
		Number.isInteger(movie.runtimeMinutes) && normalizedReview.includes(`${String(movie.runtimeMinutes)} minutos`);
	const platformHit = normalizedPlatform ? normalizedReview.includes(normalizedPlatform) : false;
	const verdictLabelHit = normalizedVerdictLabel ? normalizedReview.includes(normalizedVerdictLabel) : false;
	const ellipsisHit = String(movie.review ?? '').includes('...');
	const openerPattern = buildOpenerPattern(movie, movie.review);
	const openerPatternCount = getRepeatedEntryCount(openerPatternMap, openerPattern);
	const repeatedSentenceHits = getRepeatedSentenceHits(movie, repeatedSentenceMap);

	let score = 0;
	score += markerHits.length * 2;
	score += titleMentions >= 5 ? 3 : titleMentions >= 4 ? 2 : titleMentions >= 3 ? 1 : 0;
	score += directorHit && castHits >= 2 ? 2 : directorHit || castHits >= 2 ? 1 : 0;
	score += runtimeHit ? 1 : 0;
	score += platformHit ? 1 : 0;
	score += verdictLabelHit ? 1 : 0;
	score += ellipsisHit ? 1 : 0;
	score += openerPatternCount >= 4 ? 2 : openerPatternCount >= 3 ? 1 : 0;

	let severity = 'clean';
	if (markerHits.length >= 4 || score >= 10) {
		severity = 'high';
	} else if (markerHits.length >= 2 || score >= 6) {
		severity = 'medium';
	} else if (openerPatternCount >= 3 || repeatedSentenceHits.some((entry) => entry.count >= 4)) {
		severity = 'low';
	}

	return {
		score,
		severity,
		markerHits,
		titleMentions,
		directorHit,
		castHits,
		castMatches,
		runtimeHit,
		platformHit,
		verdictLabelHit,
		ellipsisHit,
		openerPattern,
		openerPatternCount,
		repeatedSentenceHits,
	};
}

const entries = loadMovies().filter(({ movie }) => isReleased(movie));
const repeatedSentenceMap = buildRepeatedSentenceMap(entries);
const openerPatternMap = buildOpenerPatternMap(entries);

const repeatedReviewSentences = Array.from(repeatedSentenceMap.entries())
	.map(([sentence, movies]) => ({
		sentence,
		count: movies.length,
		movies,
	}))
	.filter((entry) => entry.count >= MIN_SHARED_SENTENCE_COUNT)
	.sort((left, right) => right.count - left.count || left.sentence.localeCompare(right.sentence, 'es'));

const repeatedOpeningPatterns = Array.from(openerPatternMap.entries())
	.map(([pattern, movies]) => ({
		pattern,
		count: movies.length,
		movies,
	}))
	.filter((entry) => entry.count >= MIN_SHARED_SENTENCE_COUNT)
	.sort((left, right) => right.count - left.count || left.pattern.localeCompare(right.pattern, 'es'));

const generatedReviewCandidates = [];
const repeatedEditorialCandidates = [];
const primaryGenreMismatch = [];
const shortReviewCandidates = [];
const templateReviewCandidates = [];

for (const { filePath, movie } of entries) {
	const signals = getSuspectSignals(movie, repeatedSentenceMap, openerPatternMap);
	const category = normalize(movie.category);
	const genres = Array.isArray(movie.genres) ? movie.genres.map((genre) => normalize(genre)).filter(Boolean) : [];
	const reviewWordCount = wordCount(movie.review);
	const reviewSentenceCount = rawSentenceCount(movie.review);
	const templateHits = [
		...TEMPLATE_REVIEW_MARKERS.filter((marker) => normalize(movie.review).includes(marker)),
		...getVerdictLabelTemplateHits(movie),
	];

	if (
		reviewWordCount < MIN_REVIEW_WORDS ||
		(reviewWordCount < MIN_UNDERDEVELOPED_WORDS && reviewSentenceCount < 2)
	) {
		shortReviewCandidates.push({
			slug: movie.slug,
			title: movie.title,
			filePath,
			wordCount: reviewWordCount,
			sentenceCount: reviewSentenceCount,
		});
	}

	if (templateHits.length > 0) {
		templateReviewCandidates.push({
			slug: movie.slug,
			title: movie.title,
			filePath,
			wordCount: reviewWordCount,
			templateHits,
		});
	}

	if (signals.severity === 'high' || signals.severity === 'medium') {
		generatedReviewCandidates.push({
			slug: movie.slug,
			title: movie.title,
			filePath,
			score: signals.score,
			severity: signals.severity,
			markerHits: signals.markerHits,
			titleMentions: signals.titleMentions,
			directorHit: signals.directorHit,
			castHits: signals.castHits,
			castMatches: signals.castMatches,
			runtimeHit: signals.runtimeHit,
			platformHit: signals.platformHit,
			verdictLabelHit: signals.verdictLabelHit,
			ellipsisHit: signals.ellipsisHit,
			openerPattern: signals.openerPattern,
			openerPatternCount: signals.openerPatternCount,
		});
	} else if (signals.severity === 'low') {
		repeatedEditorialCandidates.push({
			slug: movie.slug,
			title: movie.title,
			filePath,
			score: signals.score,
			openerPattern: signals.openerPattern,
			openerPatternCount: signals.openerPatternCount,
			repeatedSentenceHits: signals.repeatedSentenceHits.slice(0, 3),
		});
	}

	if (category && genres.length > 0 && genres[0] !== category) {
		primaryGenreMismatch.push({
			slug: movie.slug,
			title: movie.title,
			category: movie.category,
			firstGenre: movie.genres[0],
			filePath,
		});
	}
}

generatedReviewCandidates.sort(
	(left, right) =>
		right.score - left.score ||
		right.markerHits.length - left.markerHits.length ||
		left.slug.localeCompare(right.slug, 'es'),
);

repeatedEditorialCandidates.sort(
	(left, right) =>
		right.openerPatternCount - left.openerPatternCount ||
		(right.repeatedSentenceHits[0]?.count ?? 0) - (left.repeatedSentenceHits[0]?.count ?? 0) ||
		left.slug.localeCompare(right.slug, 'es'),
);

templateReviewCandidates.sort(
	(left, right) =>
		right.templateHits.length - left.templateHits.length ||
		left.wordCount - right.wordCount ||
		left.slug.localeCompare(right.slug, 'es'),
);

const report = {
	referenceDate: referenceDate.toISOString(),
	releasedMovies: entries.length,
	generatedReviewCandidates: {
		count: generatedReviewCandidates.length,
		highSeverity: generatedReviewCandidates.filter((entry) => entry.severity === 'high').length,
		mediumSeverity: generatedReviewCandidates.filter((entry) => entry.severity === 'medium').length,
		examples: generatedReviewCandidates.slice(0, MAX_EXAMPLES),
		...(FULL_OUTPUT ? { all: generatedReviewCandidates } : {}),
	},
	shortReviewCandidates: {
		count: shortReviewCandidates.length,
		examples: shortReviewCandidates.slice(0, MAX_EXAMPLES),
		...(FULL_OUTPUT ? { all: shortReviewCandidates } : {}),
	},
	templateReviewCandidates: {
		count: templateReviewCandidates.length,
		examples: templateReviewCandidates.slice(0, MAX_EXAMPLES),
		...(FULL_OUTPUT ? { all: templateReviewCandidates } : {}),
	},
	repeatedEditorialCandidates: {
		count: repeatedEditorialCandidates.length,
		examples: repeatedEditorialCandidates.slice(0, MAX_EXAMPLES),
		...(FULL_OUTPUT ? { all: repeatedEditorialCandidates } : {}),
	},
	primaryGenreMismatch: {
		count: primaryGenreMismatch.length,
		examples: primaryGenreMismatch.slice(0, MAX_EXAMPLES),
		...(FULL_OUTPUT ? { all: primaryGenreMismatch } : {}),
	},
	repeatedOpeningPatterns: {
		count: repeatedOpeningPatterns.length,
		examples: repeatedOpeningPatterns.slice(0, 20).map((entry) => ({
			pattern: entry.pattern,
			count: entry.count,
			movies: entry.movies.slice(0, 8),
		})),
		...(FULL_OUTPUT ? { all: repeatedOpeningPatterns } : {}),
	},
	repeatedReviewSentences: {
		count: repeatedReviewSentences.length,
		examples: repeatedReviewSentences.slice(0, 20).map((entry) => ({
			sentence: entry.sentence,
			count: entry.count,
			movies: entry.movies.slice(0, 8),
		})),
		...(FULL_OUTPUT ? { all: repeatedReviewSentences } : {}),
	},
};

console.log(JSON.stringify(report, null, 2));
