#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DEFAULT_ROOT = 'src/data/movies';
const MIN_DUPLICATE_SENTENCE_WORDS = 6;
const MAX_DUPLICATE_SENTENCE_WORDS = 28;
const MIN_SHARED_SENTENCE_COUNT = 3;
const MIN_REVIEW_WORDS = 70;
const MIN_UNDERDEVELOPED_WORDS = 70;
const MIN_REVIEW_SENTENCES = 2;
const MIN_SYNOPSIS_WORDS = 28;
const MAX_SYNOPSIS_WORDS = 90;
const TEN_SECOND_TAKE_FIELDS = [
	'verdict',
	'whatToExpect',
	'pace',
	'intensity',
	'practicalContext',
	'forFansOf',
	'notForYouIf',
];
const CINEPOSTA_SCORE_LABELS = ['Basura total', 'Pésima', 'Muy mala', 'Mala', 'Regular', 'Buena', 'Muy buena', 'Excelente', 'Obra maestra', 'Absolute Cinema'];

function getCinePostaScoreLabel(movie) {
	const score = Number(movie.cinepostaScore);
	return Number.isInteger(score) && score >= 1 && score <= 10 ? CINEPOSTA_SCORE_LABELS[score - 1] : '';
}
const TEN_SECOND_TAKE_GENERIC_MARKERS = [
	'depende bastante de tu animo',
	'sin pedirte media vida',
	'tiene lo suyo',
	'no vuela pero tampoco se queda clavada',
	'mejor agarrarla con tiempo de sobra',
	'resumen rapido para decidir',
	'plan sin datos extra',
	'entra bastante derecho desde el arranque',
	'se deja ver liviana',
];
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
const SCORE_LABEL_STOCK_PATTERNS = [
	'<label> porque',
	'lo que la vuelve <label>',
	'el veredicto de <label>',
	'el <label> viene de',
	'la <label> viene de',
];
const MECHANICAL_SCORE_LABELS = [
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
const SOURCE_LIKE_SYNOPSIS_PATTERNS = [
	/^la (pelicula|trama|historia) (cuenta|narra|relata|sigue)\b/i,
	/^el (filme|largometraje) (cuenta|narra|relata|sigue)\b/i,
	/^sinopsis\s*:/i,
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
		} else if (arg === '--require-ten-second-take') {
			args.requireTenSecondTake = true;
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
			'  node review_audit.cjs --root src/data/movies --require-ten-second-take',
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

function buildTenSecondTakeFieldMap(entries) {
	const fieldMap = new Map();
	for (const entry of entries) {
		const take = entry.movie.editorial?.tenSecondTake;
		if (!take || typeof take !== 'object') continue;
		for (const field of TEN_SECOND_TAKE_FIELDS) {
			const value = normalizeText(take[field]);
			if (!value) continue;
			const key = `${field}::${value}`;
			fieldMap.set(key, [...(fieldMap.get(key) || []), entry.filePath]);
		}
	}
	return fieldMap;
}

function getTenSecondTakeIssues(movie, fieldMap) {
	const take = movie.editorial?.tenSecondTake;
	if (!take || typeof take !== 'object' || Array.isArray(take)) {
		return ['missing ten-second take'];
	}

	const issues = [];
	const keys = Object.keys(take);
	for (const field of TEN_SECOND_TAKE_FIELDS) {
		const value = take[field];
		const words = wordCount(value);
		if (typeof value !== 'string' || !value.trim()) {
			issues.push(`missing ten-second field :: ${field}`);
			continue;
		}
		if (words < 5 || words > 60) issues.push(`thin-or-long ten-second field :: ${field} :: ${words} words`);
		const normalized = normalizeText(value);
		for (const marker of TEN_SECOND_TAKE_GENERIC_MARKERS) {
			if (normalized.includes(marker)) issues.push(`generic ten-second marker :: ${field} :: ${marker}`);
		}
		const matchingFiles = [...new Set(fieldMap.get(`${field}::${normalized}`) || [])];
		if (matchingFiles.length > 1) {
			issues.push(`reused ten-second field :: ${field} :: ${matchingFiles.join(', ')}`);
		}
	}

	for (const key of keys) {
		if (!TEN_SECOND_TAKE_FIELDS.includes(key)) issues.push(`unsupported ten-second field :: ${key}`);
	}

	const normalizedValues = TEN_SECOND_TAKE_FIELDS.map((field) => normalizeText(take[field])).filter(Boolean);
	if (new Set(normalizedValues).size !== normalizedValues.length) issues.push('repeated ten-second field within movie');
	const allText = normalizedValues.join(' ');
	const specificityTerms = [...new Set([movie.title, movie.originalTitle, movie.director, ...(movie.mainCast || [])]
		.map((value) => normalizeText(value))
		.filter((value) => value.length > 2))];
	const specificityHits = specificityTerms.filter((term) => allText.includes(term));
	if (specificityHits.length < 2) issues.push(`ten-second take lacks film-specific anchors :: ${specificityHits.length}/2`);
	const normalizedScoreLabel = normalizeText(getCinePostaScoreLabel(movie));
	const normalizedTakeVerdict = normalizeText(take.verdict);
	if (
		normalizedScoreLabel &&
		(normalizedTakeVerdict === normalizedScoreLabel || normalizedTakeVerdict.startsWith(`${normalizedScoreLabel} porque`))
	) {
		issues.push('ten-second take repeats the canonical score label instead of explaining the judgement');
	}
	return issues;
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

function getScoreLabelStockHits(movie) {
	const normalizedReview = normalizeText(movie.review);
	const normalizedScoreLabel = normalizeText(getCinePostaScoreLabel(movie));
	if (!normalizedReview || !normalizedScoreLabel) {
		return [];
	}

	return SCORE_LABEL_STOCK_PATTERNS
		.map((pattern) => pattern.replaceAll('<label>', normalizedScoreLabel))
		.filter((pattern) => normalizedReview.includes(pattern))
		.map((pattern) => `score-label stock phrase :: ${pattern}`);
}

function getScoreLabelFormattingHits(movie) {
	const review = String(movie.review || '');
	if (!review) {
		return [];
	}

	const labels = [...new Set([getCinePostaScoreLabel(movie), ...MECHANICAL_SCORE_LABELS].map((value) => String(value || '').trim()).filter(Boolean))];
	const matchingLabels = labels
		.filter((label) => new RegExp(`\\b${escapeRegex(label)}\\s*:`, 'iu').test(review))
		.sort((left, right) => right.length - left.length || left.localeCompare(right, 'es'));
	return matchingLabels
		.filter(
			(label) =>
				!matchingLabels.some(
					(otherLabel) => otherLabel.length > label.length && normalizeText(otherLabel).endsWith(normalizeText(label)),
				),
		)
		.map((label) => `score-label colon :: ${label}`);
}

function getSuspectSignals(movie, repeatedSentenceMap, openerPatternMap) {
	const normalizedReview = normalizeText(movie.review);
	const normalizedDirector = normalizeText(movie.director);
	const normalizedScoreLabel = normalizeText(getCinePostaScoreLabel(movie));
	const normalizedPlatform = normalizeText(movie.releasePlatform);
	const markerHits = GENERATED_REVIEW_MARKERS.filter((marker) =>
		normalizedReview.includes(decorateMarker(marker, movie)),
	);
	const verdictLedTemplateHit = getVerdictLedTemplateHit(movie.review);
	if (verdictLedTemplateHit) {
		markerHits.push(verdictLedTemplateHit);
	}
	for (const hit of getScoreLabelStockHits(movie)) {
		markerHits.push(hit);
	}
	for (const hit of getScoreLabelFormattingHits(movie)) {
		markerHits.push(hit);
	}
	const titleMentions = Math.max(...buildTitleVariants(movie).map((variant) => countPhraseOccurrences(normalizedReview, variant)), 0);
	const castMatches = getCastMatches(movie, normalizedReview);
	const castHits = castMatches.length;
	const directorHit = normalizedDirector ? normalizedReview.includes(normalizedDirector) : false;
	const runtimeHit =
		Number.isInteger(movie.runtimeMinutes) && normalizedReview.includes(`${String(movie.runtimeMinutes)} minutos`);
	const platformHit = normalizedPlatform ? normalizedReview.includes(normalizedPlatform) : false;
	const scoreLabelHit = normalizedScoreLabel ? normalizedReview.includes(normalizedScoreLabel) : false;
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
	score += scoreLabelHit ? 1 : 0;
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
	const tenSecondTakeFieldMap = buildTenSecondTakeFieldMap(corpus);
	const fullReviewMap = new Map();
	const fullSynopsisMap = new Map();
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

		const normalizedSynopsis = normalizeText(entry.movie.synopsis);
		if (normalizedSynopsis) {
			if (!fullSynopsisMap.has(normalizedSynopsis)) {
				fullSynopsisMap.set(normalizedSynopsis, []);
			}
			fullSynopsisMap.get(normalizedSynopsis).push(entry.filePath);
		}
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
		const synopsis = String(movie.synopsis || '').trim();
		const synopsisWords = wordCount(synopsis);
		const tenSecondTakeIssues = getTenSecondTakeIssues(movie, tenSecondTakeFieldMap);
		const requiresTenSecondTake = args.requireTenSecondTake || args.candidates.length > 0;
		if (tenSecondTakeIssues.length > 0) {
			for (const issue of tenSecondTakeIssues) {
				if (issue === 'missing ten-second take' && !requiresTenSecondTake) {
					warnings.push(`legacy ${issue} :: ${candidatePath}`);
				} else {
					errors.push(`${issue} :: ${candidatePath}`);
				}
			}
		}

		if (!review) {
			errors.push(`missing review :: ${candidatePath}`);
			continue;
		}

		if (reviewWords < MIN_REVIEW_WORDS) {
			errors.push(`short-review :: ${candidatePath} :: ${reviewWords} words is too short for editorial copy`);
		} else if (reviewWords < MIN_UNDERDEVELOPED_WORDS || sentenceCount < MIN_REVIEW_SENTENCES) {
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

		if (!synopsis) {
			errors.push(`missing-synopsis :: ${candidatePath}`);
		} else {
			if (synopsisWords < MIN_SYNOPSIS_WORDS) {
				errors.push(`short-synopsis :: ${candidatePath} :: ${synopsisWords} words is too short to be useful`);
			}
			if (synopsisWords > MAX_SYNOPSIS_WORDS) {
				errors.push(`long-synopsis :: ${candidatePath} :: ${synopsisWords} words reads more like a plot recap than a synopsis`);
			}
			if (SOURCE_LIKE_SYNOPSIS_PATTERNS.some((pattern) => pattern.test(synopsis))) {
				errors.push(`template-shaped-synopsis :: ${candidatePath} :: rewrite the generic source-like opener from scratch`);
			}
			const duplicateSynopsisFiles = [...new Set(fullSynopsisMap.get(normalizeText(synopsis)) || [])];
			if (duplicateSynopsisFiles.length > 1) {
				errors.push(`duplicate-synopsis :: ${candidatePath} :: ${duplicateSynopsisFiles.join(', ')}`);
			}
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
