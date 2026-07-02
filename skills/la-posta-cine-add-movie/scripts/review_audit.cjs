#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DEFAULT_ROOT = 'src/data/movies';
const MIN_DUPLICATE_SENTENCE_WORDS = 6;
const MAX_DUPLICATE_SENTENCE_WORDS = 28;
const MIN_SHARED_SENTENCE_COUNT = 3;
const MIN_REVIEW_WORDS = 24;
const MIN_UNDERDEVELOPED_WORDS = 32;
const MIN_DUPLICATE_SENTENCE_LENGTH = 55;
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
	'a <title> le conviene entrarla por',
	'hay una version buena de <title>',
	'lo mejor aparece cuando',
	'la contra suele aparecer cuando',
	'cumple mejor como plan puntual que como pelicula para defender a muerte',
	'rinde por tramos mas que por contundencia total',
	'si buscas una funcion de accion con pulso tiene con que',
	'si el cuerpo te pide aventura o golpes tiene material',
	'tiene mas para ofrecer en la friccion que en el misterio puro',
	'no todo le sale igual de bien especialmente cuando',
	'funciona mejor como thriller seco que como rompecabezas solemne',
	'la pelicula deja en claro su disparador desde temprano y se mueve a partir de ahi',
	'esta buena porque hay una pelicula viva detras del concepto',
	'igual entra facil por ritmo elenco o por una idea que',
	'puede ser mas seca o mas ligera segun el caso',
	'quiza no sea su titulo mas arrollador pero se sostiene con autoridad de principio a fin',
	'lo mejor esta en como la pelicula',
	'no reinventa el genero pero',
	'tiene personalidad propia',
	'cuando el relato se pone mas convencional',
	'si ya estabas adentro',
	'para el que viene acompanando la saga',
];
const VERDICT_LED_OPENERS = [
	'zafa',
	'pasable',
	'se deja ver',
	'recomendada',
	'esta buena',
	'esta muy bien',
	'mala',
	'malisima',
	'no la mires',
	'basura total',
];
const VERDICT_LED_SUFFIX_MARKERS = [
	'entra bien si',
	'para una salida de cartelera',
	'si queres pasarla bien',
	'si buscas',
	'si te gustan',
	'si el cuerpo te pide',
	'para verla si',
];
const VERDICT_LABEL_STOCK_PATTERNS = [
	'<label> porque',
	'lo que la vuelve <label>',
	'el veredicto de <label>',
	'el <label> viene de',
	'la <label> viene de',
];

function parseArgs(argv) {
	const args = {
		root: DEFAULT_ROOT,
		candidates: [],
	};

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === '--root') {
			args.root = argv[++index];
		} else if (arg === '--candidate') {
			args.candidates.push(argv[++index]);
		} else if (arg === '--help' || arg === '-h') {
			args.help = true;
		} else {
			throw new Error(`Unknown argument: ${arg}`);
		}
	}

	return args;
}

function usage() {
	console.log(
		[
			'Usage:',
			'  node review_audit.cjs --root src/data/movies',
			'  node review_audit.cjs --root src/data/movies --candidate src/data/movies/foo-2024.json',
		].join('\n'),
	);
}

function normalizeText(value) {
	return String(value || '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^\p{L}\p{N}\s]/gu, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function escapeRegex(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function wordCount(value) {
	return String(value || '')
		.trim()
		.split(/\s+/)
		.filter(Boolean).length;
}

function rawSentenceCount(value) {
	return String(value || '')
		.split(/[\n\r]+|(?<=[.!?])\s+/)
		.map((sentence) => sentence.trim())
		.filter(Boolean).length;
}

function splitLongSentences(review) {
	return String(review || '')
		.split(/[\n\r]+|(?<=[.!?])\s+/)
		.map((sentence) => sentence.trim())
		.filter((sentence) => sentence.length >= MIN_DUPLICATE_SENTENCE_LENGTH);
}

function splitComparableSentences(review) {
	return String(review || '')
		.split(/[\n\r]+|(?<=[.!?])\s+/)
		.map((sentence) => normalizeText(sentence))
		.filter(Boolean)
		.filter((sentence) => {
			const words = wordCount(sentence);
			return words >= MIN_DUPLICATE_SENTENCE_WORDS && words <= MAX_DUPLICATE_SENTENCE_WORDS;
		});
}

function firstSentence(value) {
	return (
		String(value || '')
			.split(/(?<=[.!?])\s+/)
			.map((part) => part.trim())
			.find(Boolean) || ''
	);
}

function listAllFiles(rootDir) {
	return fs
		.readdirSync(rootDir, { withFileTypes: true })
		.filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
		.map((entry) => path.join(rootDir, entry.name))
		.sort((left, right) => left.localeCompare(right));
}

function buildTitleVariants(movie) {
	return [...new Set([movie.title, movie.originalTitle].map((value) => normalizeText(value)).filter(Boolean))];
}

function buildOpenerPattern(movie) {
	let pattern = normalizeText(firstSentence(movie.review));
	for (const titleVariant of buildTitleVariants(movie)) {
		if (!titleVariant) {
			continue;
		}
		pattern = pattern.replace(new RegExp(`\\b${escapeRegex(titleVariant)}\\b`, 'g'), '<title>');
	}
	return pattern;
}

function countPhraseOccurrences(haystack, needle) {
	if (!haystack || !needle) {
		return 0;
	}

	const matches = haystack.match(new RegExp(`\\b${escapeRegex(needle)}\\b`, 'g'));
	return matches?.length ?? 0;
}

function getCastMatches(movie, normalizedReview) {
	return (Array.isArray(movie.mainCast) ? movie.mainCast : [])
		.slice(0, 3)
		.map((name) => normalizeText(name))
		.filter(Boolean)
		.filter((name) => normalizedReview.includes(name));
}

function listCandidates(rootDir, explicitCandidates) {
	if (explicitCandidates.length > 0) {
		return explicitCandidates.map((candidate) => path.resolve(candidate));
	}

	return listAllFiles(rootDir);
}

function buildCorpus(rootDir) {
	return listAllFiles(rootDir).map((filePath) => ({
		filePath: path.resolve(filePath),
		movie: JSON.parse(fs.readFileSync(filePath, 'utf8')),
	}));
}

function buildRepeatedSentenceMap(entries) {
	const sentenceMap = new Map();

	for (const entry of entries) {
		for (const sentence of new Set(splitComparableSentences(entry.movie.review))) {
			if (!sentenceMap.has(sentence)) {
				sentenceMap.set(sentence, []);
			}
			sentenceMap.get(sentence).push(entry.filePath);
		}
	}

	return sentenceMap;
}

function buildLongSentenceMap(entries) {
	const sentenceMap = new Map();

	for (const entry of entries) {
		for (const sentence of new Set(splitLongSentences(entry.movie.review))) {
			const normalizedSentence = normalizeText(sentence);
			if (!normalizedSentence) {
				continue;
			}
			if (!sentenceMap.has(normalizedSentence)) {
				sentenceMap.set(normalizedSentence, []);
			}
			sentenceMap.get(normalizedSentence).push(entry.filePath);
		}
	}

	return sentenceMap;
}

function buildOpenerPatternMap(entries) {
	const openerMap = new Map();

	for (const entry of entries) {
		const pattern = buildOpenerPattern(entry.movie);
		if (!pattern) {
			continue;
		}
		if (!openerMap.has(pattern)) {
			openerMap.set(pattern, []);
		}
		openerMap.get(pattern).push(entry.filePath);
	}

	return openerMap;
}

function decorateMarker(marker, movie) {
	if (!marker.includes('<title>')) {
		return marker;
	}

	const titleVariant = buildTitleVariants(movie)[0] || '';
	return marker.replaceAll('<title>', titleVariant);
}

function getVerdictLedTemplateHit(review) {
	const sentences = String(review || '')
		.split(/[\n\r]+|(?<=[.!?])\s+/)
		.map((sentence) => sentence.trim())
		.filter(Boolean);
	const tailSentence = normalizeText(sentences[sentences.length - 1] || '');
	if (!tailSentence) {
		return null;
	}

	const opener = VERDICT_LED_OPENERS.find((token) => tailSentence === token || tailSentence.startsWith(`${token} `));
	if (!opener) {
		return null;
	}

	const suffix = VERDICT_LED_SUFFIX_MARKERS.find((marker) => tailSentence.includes(marker));
	if (!suffix) {
		return null;
	}

	return `verdict-led stock closing :: ${opener} :: ${suffix}`;
}

function getVerdictLabelStockHits(movie) {
	const normalizedReview = normalizeText(movie.review);
	const normalizedVerdictLabel = normalizeText(movie.verdictLabel);
	if (!normalizedReview || !normalizedVerdictLabel) {
		return [];
	}

	return VERDICT_LABEL_STOCK_PATTERNS
		.map((pattern) => pattern.replaceAll('<label>', normalizedVerdictLabel))
		.filter((pattern) => normalizedReview.includes(pattern))
		.map((pattern) => `verdict-label stock phrase :: ${pattern}`);
}

function getSuspectSignals(movie, repeatedSentenceMap, openerPatternMap) {
	const normalizedReview = normalizeText(movie.review);
	const normalizedDirector = normalizeText(movie.director);
	const normalizedVerdictLabel = normalizeText(movie.verdictLabel);
	const normalizedPlatform = normalizeText(movie.releasePlatform);
	const markerHits = GENERATED_REVIEW_MARKERS.filter((marker) =>
		normalizedReview.includes(decorateMarker(marker, movie)),
	);
	const verdictLedTemplateHit = getVerdictLedTemplateHit(movie.review);
	if (verdictLedTemplateHit) {
		markerHits.push(verdictLedTemplateHit);
	}
	for (const hit of getVerdictLabelStockHits(movie)) {
		markerHits.push(hit);
	}
	const titleMentions = Math.max(...buildTitleVariants(movie).map((variant) => countPhraseOccurrences(normalizedReview, variant)), 0);
	const castMatches = getCastMatches(movie, normalizedReview);
	const castHits = castMatches.length;
	const directorHit = normalizedDirector ? normalizedReview.includes(normalizedDirector) : false;
	const runtimeHit =
		Number.isInteger(movie.runtimeMinutes) && normalizedReview.includes(`${String(movie.runtimeMinutes)} minutos`);
	const platformHit = normalizedPlatform ? normalizedReview.includes(normalizedPlatform) : false;
	const verdictLabelHit = normalizedVerdictLabel ? normalizedReview.includes(normalizedVerdictLabel) : false;
	const ellipsisHit = String(movie.review || '').includes('...');
	const openerPattern = buildOpenerPattern(movie);
	const openerPatternCount = (openerPatternMap.get(openerPattern) || []).length;
	const repeatedSentenceHits = [...new Set(splitComparableSentences(movie.review))]
		.filter((sentence) => ((repeatedSentenceMap.get(sentence) || []).length >= MIN_SHARED_SENTENCE_COUNT))
		.map((sentence) => ({
			sentence,
			count: (repeatedSentenceMap.get(sentence) || []).length,
		}))
		.sort((left, right) => right.count - left.count || left.sentence.localeCompare(right.sentence, 'es'));

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
	if (markerHits.length >= 2 || score >= 6) {
		severity = 'error';
	} else if (openerPatternCount >= 3 || repeatedSentenceHits.some((entry) => entry.count >= 3)) {
		severity = 'error';
	}

	return {
		severity,
		markerHits,
		openerPattern,
		openerPatternCount,
		repeatedSentenceHits,
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

	const corpus = buildCorpus(rootDir);
	const corpusMap = new Map(corpus.map((entry) => [entry.filePath, entry]));
	const candidates = listCandidates(rootDir, args.candidates);
	const repeatedSentenceMap = buildRepeatedSentenceMap(corpus);
	const longSentenceMap = buildLongSentenceMap(corpus);
	const openerPatternMap = buildOpenerPatternMap(corpus);
	const fullReviewMap = new Map();
	const errors = [];
	const warnings = [];

	for (const entry of corpus) {
		const normalizedReview = normalizeText(entry.movie.review);
		if (!normalizedReview) {
			continue;
		}
		if (!fullReviewMap.has(normalizedReview)) {
			fullReviewMap.set(normalizedReview, []);
		}
		fullReviewMap.get(normalizedReview).push(entry.filePath);
	}

	for (const candidatePath of candidates) {
		const resolvedPath = path.resolve(candidatePath);
		const entry = corpusMap.get(resolvedPath);

		if (!entry) {
			errors.push(`missing candidate :: ${candidatePath}`);
			continue;
		}

		const { movie } = entry;
		const review = String(movie.review || '').trim();
		const normalizedReview = normalizeText(review);
		const reviewWords = wordCount(review);
		const sentenceCount = rawSentenceCount(review);

		if (!review) {
			errors.push(`missing review :: ${candidatePath}`);
			continue;
		}

		if (reviewWords < MIN_REVIEW_WORDS) {
			errors.push(`short-review :: ${candidatePath} :: ${reviewWords} words is too short for editorial copy`);
		} else if (reviewWords < MIN_UNDERDEVELOPED_WORDS && sentenceCount < 2) {
			errors.push(`underdeveloped-review :: ${candidatePath} :: ${reviewWords} words and ${sentenceCount} sentence look too thin`);
		}

		const duplicateFullReviewFiles = [...new Set(fullReviewMap.get(normalizedReview) || [])];
		if (duplicateFullReviewFiles.length > 1) {
			errors.push(`duplicate full review :: ${duplicateFullReviewFiles.join(', ')}`);
		}

		for (const sentence of new Set(splitLongSentences(review).map((value) => normalizeText(value)).filter(Boolean))) {
			const files = [...new Set(longSentenceMap.get(sentence) || [])];
			if (files.length > 1) {
				errors.push(`duplicate-long-sentence :: ${candidatePath} :: ${files.join(', ')}`);
			}
		}

		const signals = getSuspectSignals(movie, repeatedSentenceMap, openerPatternMap);
		if (signals.openerPatternCount >= MIN_SHARED_SENTENCE_COUNT) {
			errors.push(
				`reused-opener-pattern :: ${candidatePath} :: opener repeats across ${signals.openerPatternCount} reviews`,
			);
		}

		for (const repeatedSentence of signals.repeatedSentenceHits) {
			if (repeatedSentence.count >= MIN_SHARED_SENTENCE_COUNT) {
				errors.push(
					`reused-sentence-skeleton :: ${candidatePath} :: "${repeatedSentence.sentence}" appears in ${repeatedSentence.count} reviews`,
				);
			}
		}

		for (const marker of signals.markerHits) {
			errors.push(`generated-review-marker :: ${candidatePath} :: matched "${marker}"`);
		}

		if (signals.severity === 'clean' && reviewWords < 40) {
			warnings.push(`concise-review :: ${candidatePath} :: ${reviewWords} words`);
		}
	}

	if (errors.length > 0) {
		for (const error of errors) {
			console.error(error);
		}
		process.exit(1);
	}

	const summary = [`review audit passed for ${candidates.length} file(s)`];
	if (warnings.length > 0) {
		summary.push(`${warnings.length} warning(s)`);
	}
	console.log(summary.join(' | '));
}

main();
