import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const MOVIES_DIR = path.resolve('src/data/movies');
const USER_AGENT = 'cine-posta-synopsis-enricher/3.0';
const CONCURRENCY = 6;
const MAX_SYNOPSIS_LENGTH = 320;
const WIKIPEDIA_REQUEST_DELAY_MS = 1200;
const SECTION_TITLES = ['Sinopsis', 'Argumento', 'Trama', 'Plot', 'Premise', 'Synopsis', 'Story'];
const TITLE_TOKEN_STOP_WORDS = new Set([
	'a',
	'al',
	'an',
	'and',
	'chapter',
	'de',
	'del',
	'el',
	'en',
	'film',
	'la',
	'las',
	'los',
	'movie',
	'of',
	'part',
	'the',
	'un',
	'una',
	'y',
]);
const PREMISE_PATTERNS = [
	/\bit follows\b/i,
	/\bthe film follows\b/i,
	/\bthis film follows\b/i,
	/\bcenters on\b/i,
	/\brevolves around\b/i,
	/\btells the story of\b/i,
	/\bchronicles\b/i,
	/\bdepicts\b/i,
	/\bfocuses on\b/i,
	/\bis set in\b/i,
	/\bsigue a\b/i,
	/\bla pelicula sigue a\b/i,
	/\bla película sigue a\b/i,
	/\bse centra en\b/i,
	/\bgira en torno a\b/i,
	/\brelata\b/i,
	/\bnarra\b/i,
	/\bcuenta la historia de\b/i,
	/\btranscurre en\b/i,
];
const BLOCKED_PATTERNS = [
	/\bsoundtrack\b/i,
	/\balbum\b/i,
	/\bscore\b/i,
	/\bvideo game\b/i,
	/\bcharacter\b/i,
	/\bdisambiguation\b/i,
	/\bfilmography\b/i,
	/\btelevision\b/i,
	/\btv series\b/i,
	/\bmini-series\b/i,
	/\bminiseries\b/i,
	/\bbanda sonora\b/i,
	/\bvideojuego\b/i,
	/\bpersonaje\b/i,
	/\bdesambiguaci[oó]n\b/i,
	/\bfilmograf[ií]a\b/i,
	/\bserie de televisi[oó]n\b/i,
];
const REVIEWISH_PATTERNS = [
	/\bla cr[ií]tica\b/i,
	/\breseñ(?:as|a)\b/i,
	/\brecepcion\b/i,
	/\brecepci[oó]n\b/i,
	/\bconsenso\b/i,
	/\bfunciona mejor\b/i,
	/\bse deja ver\b/i,
	/\bnunca termina de\b/i,
	/\bqueda m[aá]s cerca\b/i,
	/\bqueda en /i,
	/\bentra del lado\b/i,
	/\bpara verla\b/i,
	/\bpelicul[oó]n\b/i,
	/\bemociona\b/i,
	/\bmuy bien llevada\b/i,
	/\bde principio a fin\b/i,
	/\bte deja pensando\b/i,
	/\bsi te pega\b/i,
	/\bsuper recomendada\b/i,
	/\bmuy buena\b/i,
	/\best[aá] buena\b/i,
	/\bgarpa\b/i,
	/\brecomendada\b/i,
	/\bno recomendada\b/i,
	/\bobra maestra\b/i,
	/\bzafa\b/i,
	/\bmal[ií]sima\b/i,
	/\bembole\b/i,
	/\bvale la pena\b/i,
	/\bsi te gusta\b/i,
	/\bla recibi[oó]\b/i,
];
const ABBREVIATION_PATTERNS = [
	/\bDr\./g,
	/\bDra\./g,
	/\bMr\./g,
	/\bMrs\./g,
	/\bMs\./g,
	/\bSr\./g,
	/\bSra\./g,
	/\bProf\./g,
];
const TRUSTED_WEB_SOURCE_PATTERNS = [
	/\.wikipedia\.org\//i,
	/rottentomatoes\.com\//i,
	/netflix\.com\//i,
	/filmaffinity\.com\//i,
	/sensacine\.com/i,
	/imdb\.com\//i,
	/about\.netflix\.com\//i,
	/asmik-ace\.co\.jp\//i,
	/sonypictures\.com\//i,
	/themoviedb\.org\//i,
];

const METADATA_SYNOPSIS_PATTERNS = [
	/^[^.]+ es una [^.]+\bdirigida por\b/i,
	/^[^.]+ es una [^.]+\bprotagonizada por\b/i,
	/^[^.]+ es una [^.]+\bcon\b/i,
	/^[^.]+ es una pel[ií]cula [^.]+\bdirigida por\b/i,
	/^[^.]+ es una pel[ií]cula [^.]+\bprotagonizada\b/i,
	/^[^.]+ is a [^.]+\bfilm\b/i,
	/\bdirigida por [^.]+ con [^.]+\.$/i,
	/\bwritten by\b/i,
];

const jsonCache = new Map();
const translationCache = new Map();
const textCache = new Map();
let lastWikipediaRequestAt = 0;

function parseArgs(argv) {
	const args = {
		concurrency: CONCURRENCY,
		force: argv.includes('--force'),
		onlyBad: argv.includes('--only-bad'),
		start: '',
		end: '',
	};

	for (let index = 0; index < argv.length; index += 1) {
		const token = argv[index];
		const value = argv[index + 1];
		if ((token === '--start' || token === '--end') && value && !value.startsWith('--')) {
			args[token.slice(2)] = value.trim();
			index += 1;
			continue;
		}
		if (token === '--concurrency' && value && !value.startsWith('--')) {
			const parsed = Number.parseInt(value, 10);
			if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 8) {
				args.concurrency = parsed;
			}
			index += 1;
		}
	}

	return args;
}

function normalizeText(value) {
	return String(value ?? '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function synopsisCopiesReview(synopsis, review) {
	const normalizedSynopsis = normalizeText(synopsis);
	const normalizedReview = normalizeText(review);
	return Boolean(normalizedSynopsis && normalizedReview && normalizedReview.includes(normalizedSynopsis));
}

function normalizeTitleVariant(value) {
	return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function titleTokens(value) {
	return normalizeText(value)
		.split(' ')
		.filter((token) => token.length >= 2 && !TITLE_TOKEN_STOP_WORDS.has(token));
}

function getTitleVariants(movie) {
	return Array.from(
		new Set(
			[movie.title, movie.originalTitle]
				.filter((value) => typeof value === 'string' && value.trim().length > 0)
				.map((value) => normalizeTitleVariant(value)),
		),
	);
}

function getYearCandidates(movie) {
	const years = new Set([movie.year]);
	if (typeof movie.releaseDate === 'string' && /^\d{4}-/.test(movie.releaseDate)) {
		years.add(Number.parseInt(movie.releaseDate.slice(0, 4), 10));
	}

	for (const year of Array.from(years)) {
		years.add(year - 1);
		years.add(year + 1);
	}

	return Array.from(years).filter((year) => Number.isInteger(year) && year >= 1888 && year <= 2100);
}

function getDirectorTokens(movie) {
	return normalizeText(movie.director)
		.split(' ')
		.filter((token) => token.length >= 3);
}

function getLeadCastTokens(movie) {
	return (Array.isArray(movie.mainCast) ? movie.mainCast : [])
		.slice(0, 3)
		.flatMap((name) => normalizeText(name).split(' '))
		.filter((token) => token.length >= 4);
}

function tokenizeSentence(value) {
	const placeholders = [];
	let normalized = String(value ?? '')
		.replace(/\s+/g, ' ')
		.trim();

	for (const pattern of ABBREVIATION_PATTERNS) {
		normalized = normalized.replace(pattern, (match) => {
			const token = `__ABBR_${placeholders.length}__`;
			placeholders.push(match);
			return token;
		});
	}

	return normalized
		.split(/(?<=[.!?])\s+/)
		.map((sentence) => {
			let restored = sentence;
			for (let index = 0; index < placeholders.length; index += 1) {
				restored = restored.replace(`__ABBR_${index}__`, placeholders[index]);
			}
			return restored.trim();
		})
		.filter(Boolean);
}

function trimSynopsis(value) {
	const collapsed = String(value ?? '').replace(/\s+/g, ' ').trim();
	if (collapsed.length <= MAX_SYNOPSIS_LENGTH) {
		return collapsed;
	}

	const clipped = collapsed.slice(0, MAX_SYNOPSIS_LENGTH + 1);
	const lastBreak = Math.max(clipped.lastIndexOf('. '), clipped.lastIndexOf(', '), clipped.lastIndexOf(' '));
	const safeEnd = lastBreak >= 120 ? lastBreak : MAX_SYNOPSIS_LENGTH;
	return `${clipped.slice(0, safeEnd).trim().replace(/[,:;.-]+$/g, '')}.`;
}

function buildSynopsisFromText(value) {
	const sentences = tokenizeSentence(value);
	if (sentences.length === 0) {
		return '';
	}

	let synopsis = sentences[0];
	for (let index = 1; index < Math.min(sentences.length, 3); index += 1) {
		const candidate = `${synopsis} ${sentences[index]}`;
		if (candidate.length > MAX_SYNOPSIS_LENGTH) {
			break;
		}
		synopsis = candidate;
	}

	return trimSynopsis(synopsis);
}

function decodeHtmlEntities(value) {
	return value
		.replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
		.replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&apos;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>');
}

function stripHtml(value) {
	return decodeHtmlEntities(
		value
			.replace(/<style[\s\S]*?<\/style>/gi, ' ')
			.replace(/<script[\s\S]*?<\/script>/gi, ' ')
			.replace(/<sup[\s\S]*?<\/sup>/gi, ' ')
			.replace(/<span class="mw-editsection[\s\S]*?<\/span>/gi, ' ')
			.replace(/<br\s*\/?>/gi, ' ')
			.replace(/<\/?(?:i|b|strong|em|small|abbr|code|mark)[^>]*>/gi, '')
			.replace(/<[^>]+>/g, ' '),
	)
		.replace(/\[[^\]]+\]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function extractParagraphsFromHtml(html) {
	return Array.from(String(html ?? '').matchAll(/<p>([\s\S]*?)<\/p>/gi))
		.map((match) => stripHtml(match[1]))
		.filter((paragraph) => paragraph.length >= 60);
}

function isWikipediaUrl(url) {
	return /^https:\/\/(?:[a-z]+\.)?wikipedia\.org\//i.test(url);
}

async function waitForWikipediaTurn() {
	const waitMs = Math.max(0, lastWikipediaRequestAt + WIKIPEDIA_REQUEST_DELAY_MS - Date.now());
	if (waitMs > 0) {
		await new Promise((resolve) => {
			setTimeout(resolve, waitMs);
		});
	}
	lastWikipediaRequestAt = Date.now();
}

async function fetchJson(url) {
	if (jsonCache.has(url)) {
		return jsonCache.get(url);
	}

	for (let attempt = 1; attempt <= 5; attempt += 1) {
		if (isWikipediaUrl(url)) {
			await waitForWikipediaTurn();
		}
		const response = await fetch(url, {
			headers: {
				'user-agent': USER_AGENT,
			},
		});

		if (response.ok) {
			const text = await response.text();
			try {
				const payload = JSON.parse(text);
				jsonCache.set(url, payload);
				return payload;
			} catch (error) {
				if (/too many requests/i.test(text) && attempt < 5) {
					await new Promise((resolve) => {
						setTimeout(resolve, attempt * 10000);
					});
					continue;
				}
				throw error;
			}
		}

		if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 5) {
			throw new Error(`Request failed with ${response.status}: ${url}`);
		}

		await new Promise((resolve) => {
			setTimeout(resolve, attempt * 2500);
		});
	}

	throw new Error(`Request failed: ${url}`);
}

async function fetchText(url) {
	if (textCache.has(url)) {
		return textCache.get(url);
	}

	for (let attempt = 1; attempt <= 5; attempt += 1) {
		if (isWikipediaUrl(url)) {
			await waitForWikipediaTurn();
		}
		const response = await fetch(url, {
			headers: {
				'user-agent': USER_AGENT,
			},
		});

		if (response.ok) {
			const text = await response.text();
			textCache.set(url, text);
			return text;
		}

		if (response.status === 429 && attempt < 5) {
			await new Promise((resolve) => {
				setTimeout(resolve, attempt * 10000);
			});
			continue;
		}

		if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 5) {
			throw new Error(`Request failed with ${response.status}: ${url}`);
		}

		await new Promise((resolve) => {
			setTimeout(resolve, attempt * 2500);
		});
	}

	throw new Error(`Request failed: ${url}`);
}

async function searchWikipedia(language, query) {
	const params = new URLSearchParams({
		action: 'query',
		list: 'search',
		srsearch: query,
		format: 'json',
		origin: '*',
	});
	const url = `https://${language}.wikipedia.org/w/api.php?${params.toString()}`;
	const payload = await fetchJson(url);
	return Array.isArray(payload?.query?.search) ? payload.query.search.slice(0, 5) : [];
}

function toWikipediaPagePath(title) {
	return encodeURIComponent(String(title ?? '').replace(/\s+/g, '_').trim());
}

async function fetchPageIntro(language, title) {
	const url = `https://${language}.wikipedia.org/api/rest_v1/page/summary/${toWikipediaPagePath(title)}`;
	let payload;
	try {
		payload = await fetchJson(url);
	} catch {
		return '';
	}
	return String(payload?.extract ?? '').replace(/\s+/g, ' ').trim();
}

async function fetchSections(language, title) {
	const params = new URLSearchParams({
		action: 'parse',
		page: title,
		prop: 'sections',
		format: 'json',
		origin: '*',
	});
	const url = `https://${language}.wikipedia.org/w/api.php?${params.toString()}`;
	const payload = await fetchJson(url);
	return Array.isArray(payload?.parse?.sections) ? payload.parse.sections : [];
}

async function fetchSectionHtml(language, title, index) {
	const params = new URLSearchParams({
		action: 'parse',
		page: title,
		prop: 'text',
		section: String(index),
		format: 'json',
		origin: '*',
	});
	const url = `https://${language}.wikipedia.org/w/api.php?${params.toString()}`;
	const payload = await fetchJson(url);
	return String(payload?.parse?.text?.['*'] ?? '');
}

async function fetchWikipediaPageHtml(language, title) {
	const url = `https://${language}.wikipedia.org/wiki/${toWikipediaPagePath(title)}`;
	try {
		return await fetchText(url);
	} catch {
		return '';
	}
}

function hasBlockedPattern(value) {
	return BLOCKED_PATTERNS.some((pattern) => pattern.test(String(value ?? '')));
}

function countSharedTokens(text, tokens) {
	const normalized = normalizeText(text);
	return tokens.filter((token) => normalized.includes(token)).length;
}

function scoreYearMatch(text, yearCandidates) {
	const years = Array.from(new Set(String(text ?? '').match(/\b(19|20)\d{2}\b/g) ?? [])).map((value) =>
		Number.parseInt(value, 10),
	);
	let best = 0;
	for (const candidate of yearCandidates) {
		for (const year of years) {
			if (year === candidate) {
				best = Math.max(best, 30);
			} else if (Math.abs(year - candidate) === 1) {
				best = Math.max(best, 18);
			}
		}
	}
	return best;
}

function scoreCandidateFromSearch(movie, candidate) {
	let score = 0;
	const titleText = `${candidate.title} ${candidate.snippet}`;
	const titleVariantTokens = getTitleVariants(movie).flatMap((value) => titleTokens(value));
	const directorTokens = getDirectorTokens(movie);
	const yearCandidates = getYearCandidates(movie);
	const normalizedCandidateTitle = normalizeText(candidate.title);

	if (hasBlockedPattern(titleText)) {
		return -500;
	}

	const exactVariants = getTitleVariants(movie).map((value) => normalizeText(value));
	if (exactVariants.includes(normalizedCandidateTitle)) {
		score += 80;
	}

	score += countSharedTokens(candidate.title, titleVariantTokens) * 12;
	score += countSharedTokens(candidate.snippet, directorTokens) * 10;
	score += scoreYearMatch(titleText, yearCandidates);

	if (/\bfilm\b|\bpel[ií]cula\b|\banime\b|\banimated\b/i.test(titleText)) {
		score += 16;
	}

	score += Math.max(0, 24 - candidate.rank * 4);
	score += Math.max(0, 12 - candidate.queryRank * 2);
	return score;
}

function buildSearchQueries(movie) {
	const titles = getTitleVariants(movie);
	const queries = [];

	for (const title of titles) {
		queries.push({ language: 'es', query: `${title} ${movie.year} pelicula ${movie.director}` });
		queries.push({ language: 'en', query: `${title} ${movie.year} film ${movie.director}` });
		queries.push({ language: 'es', query: `${title} pelicula ${movie.director}` });
		queries.push({ language: 'en', query: `${title} film ${movie.director}` });
	}

	return queries.filter(
		(entry, index, array) =>
			array.findIndex((candidate) => candidate.language === entry.language && candidate.query === entry.query) ===
			index,
	);
}

function buildDirectCandidates(movie) {
	const years = Array.from(new Set([movie.year, movie.year - 1, movie.year + 1])).filter((year) => year >= 1888);
	const titles = getTitleVariants(movie);
	const candidates = [];

	for (const title of titles) {
		candidates.push({ language: 'es', title, kind: 'direct', rank: 0, queryRank: 0, snippet: '' });
		candidates.push({
			language: 'es',
			title: `${title} (película)`,
			kind: 'direct',
			rank: 0,
			queryRank: 0,
			snippet: '',
		});
		candidates.push({ language: 'en', title, kind: 'direct', rank: 0, queryRank: 0, snippet: '' });
		candidates.push({
			language: 'en',
			title: `${title} (film)`,
			kind: 'direct',
			rank: 0,
			queryRank: 0,
			snippet: '',
		});
		for (const year of years) {
			candidates.push({
				language: 'en',
				title: `${title} (${year} film)`,
				kind: 'direct',
				rank: 0,
				queryRank: 0,
				snippet: '',
			});
		}
	}

	return candidates;
}

async function collectCandidates(movie) {
	const candidates = new Map();

	for (const entry of buildDirectCandidates(movie)) {
		const key = `${entry.language}:${entry.title}`;
		candidates.set(key, {
			language: entry.language,
			title: entry.title,
			snippet: entry.snippet,
			rank: entry.rank,
			queryRank: entry.queryRank,
			preScore: scoreCandidateFromSearch(movie, entry) + 30,
		});
	}

	const queries = buildSearchQueries(movie);
	for (let queryRank = 0; queryRank < queries.length; queryRank += 1) {
		const entry = queries[queryRank];
		let results = [];
		try {
			results = await searchWikipedia(entry.language, entry.query);
		} catch {
			continue;
		}

		for (let rank = 0; rank < results.length; rank += 1) {
			const result = results[rank];
			const candidate = {
				language: entry.language,
				title: String(result.title ?? '').trim(),
				snippet: stripHtml(result.snippet ?? ''),
				rank,
				queryRank,
			};
			if (!candidate.title) {
				continue;
			}

			const key = `${candidate.language}:${candidate.title}`;
			const preScore = scoreCandidateFromSearch(movie, candidate);
			const existing = candidates.get(key);
			if (!existing || preScore > existing.preScore) {
				candidates.set(key, { ...candidate, preScore });
			}
		}
	}

	return Array.from(candidates.values())
		.sort((a, b) => b.preScore - a.preScore || a.title.localeCompare(b.title, 'es'))
		.slice(0, 8);
}

async function hydrateCandidate(movie, candidate) {
	const intro = await fetchPageIntro(candidate.language, candidate.title);
	if (!intro) {
		return null;
	}

	let score = candidate.preScore;
	const directorTokens = getDirectorTokens(movie);
	const leadCastTokens = getLeadCastTokens(movie);
	const yearCandidates = getYearCandidates(movie);
	const searchSurface = `${candidate.title} ${candidate.snippet}`;

	if (hasBlockedPattern(searchSurface)) {
		return null;
	}

	if (/\bfilm\b|\bpel[ií]cula\b|\banime\b|\banimated\b/i.test(intro)) {
		score += 18;
	}
	score += countSharedTokens(intro, directorTokens) * 12;
	score += countSharedTokens(intro, leadCastTokens) * 5;
	score += scoreYearMatch(`${searchSurface} ${intro}`, yearCandidates);

	if (!/\bfilm\b|\bpel[ií]cula\b|\banime\b|\banimated\b/i.test(intro) && countSharedTokens(intro, directorTokens) === 0) {
		return null;
	}

	return {
		...candidate,
		intro,
		score,
	};
}

async function resolveArticle(movie) {
	const directCandidates = Array.from(
		new Map(
			buildDirectCandidates(movie)
				.map((candidate) => ({
					...candidate,
					preScore: scoreCandidateFromSearch(movie, candidate) + 30,
				}))
				.map((candidate) => [`${candidate.language}:${candidate.title}`, candidate]),
		).values(),
	).sort((a, b) => b.preScore - a.preScore || a.title.localeCompare(b.title, 'es'));
	let best = null;

	for (const candidate of directCandidates) {
		try {
			const hydrated = await hydrateCandidate(movie, candidate);
			if (!hydrated) {
				continue;
			}

			if (!best || hydrated.score > best.score) {
				best = hydrated;
			}
			if (hydrated.score >= 120) {
				return hydrated;
			}
		} catch {
			// Skip failed candidates and continue.
		}
	}

	if (best && best.score >= 70) {
		return best;
	}

	const candidates = await collectCandidates(movie);
	for (const candidate of candidates) {
		try {
			const hydrated = await hydrateCandidate(movie, candidate);
			if (!hydrated) {
				continue;
			}

			if (!best || hydrated.score > best.score) {
				best = hydrated;
			}
		} catch {
			// Skip failed candidates and continue.
		}
	}

	if (!best || best.score < 70) {
		return null;
	}

	return best;
}

function extractPremiseFromIntro(intro) {
	const sentences = tokenizeSentence(intro);
	for (const sentence of sentences) {
		if (!PREMISE_PATTERNS.some((pattern) => pattern.test(sentence))) {
			continue;
		}
		return sentence;
	}

	return '';
}

function extractSectionParagraphsFromWikipediaHtml(html) {
	for (const match of String(html ?? '').matchAll(/<h([2-4])[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>([\s\S]*?)(?=<h[2-4]\b|$)/gi)) {
		const headingSurface = `${match[2]} ${stripHtml(match[3])}`;
		const isTargetSection = SECTION_TITLES.some((title) => normalizeText(headingSurface).includes(normalizeText(title)));
		if (!isTargetSection) {
			continue;
		}

		const paragraphs = extractParagraphsFromHtml(match[4]).filter((paragraph) => paragraph.length >= 80);
		if (paragraphs.length > 0) {
			return paragraphs;
		}
	}

	return [];
}

async function extractPlotSynopsis(article) {
	const pageHtml = await fetchWikipediaPageHtml(article.language, article.title);
	const paragraphs = extractSectionParagraphsFromWikipediaHtml(pageHtml);
	if (paragraphs.length > 0) {
		return buildSynopsisFromText(paragraphs.slice(0, 2).join(' '));
	}

	const sections = await fetchSections(article.language, article.title);
	const targetSection = sections.find((section) =>
		SECTION_TITLES.some((title) => normalizeText(section.line) === normalizeText(title)),
	);
	if (!targetSection) {
		return '';
	}

	const html = await fetchSectionHtml(article.language, article.title, targetSection.index);
	const fallbackParagraphs = extractParagraphsFromHtml(html);
	if (fallbackParagraphs.length === 0) {
		return '';
	}

	return buildSynopsisFromText(fallbackParagraphs.slice(0, 2).join(' '));
}

async function translateToSpanish(value) {
	const normalized = value.trim();
	if (!normalized) {
		return '';
	}

	if (translationCache.has(normalized)) {
		return translationCache.get(normalized);
	}

	const url =
		'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=' +
		encodeURIComponent(normalized);
	const payload = await fetchJson(url);
	const translated = Array.isArray(payload?.[0])
		? payload[0]
				.map((chunk) => (Array.isArray(chunk) && typeof chunk[0] === 'string' ? chunk[0] : ''))
				.join('')
				.trim()
		: '';

	translationCache.set(normalized, translated);
	return translated;
}

function unwrapDuckDuckGoUrl(value) {
	try {
		const absolute = value.startsWith('//') ? `https:${value}` : value;
		const parsed = new URL(absolute, 'https://duckduckgo.com');
		return parsed.searchParams.get('uddg') ?? parsed.toString();
	} catch {
		return value;
	}
}

function parseDuckDuckGoResults(html) {
	return Array.from(
		String(html ?? '').matchAll(
			/<div class="result results_links results_links_deep web-result[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g,
		),
	)
		.slice(0, 8)
		.map((match) => {
			const block = match[0];
			const titleMatch = block.match(/class="result__a" href="([^"]+)">([\s\S]*?)<\/a>/i);
			const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/i);
			const title = decodeHtmlEntities((titleMatch?.[2] ?? '').replace(/<[^>]+>/g, ' '))
				.replace(/\s+/g, ' ')
				.trim();
			const snippet = decodeHtmlEntities((snippetMatch?.[1] ?? '').replace(/<[^>]+>/g, ' '))
				.replace(/\s+/g, ' ')
				.trim();
			const url = unwrapDuckDuckGoUrl(titleMatch?.[1] ?? '');
			return { title, snippet, url };
		})
		.filter((result) => result.title && result.snippet);
}

async function searchDuckDuckGo(query) {
	const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
	const html = await fetchText(url);
	return parseDuckDuckGoResults(html);
}

function buildWebSearchQueries(movie) {
	const queries = [];
	for (const title of getTitleVariants(movie)) {
		queries.push(`"${title}" ${movie.year} ${movie.director} synopsis`);
		queries.push(`"${title}" ${movie.year} sinopsis`);
		queries.push(`"${title}" ${movie.year} argumento`);
		queries.push(`"${title}" ${movie.year} de que trata`);
		queries.push(`"${title}" ${movie.year} story`);
		queries.push(`"${title}" ${movie.year} plot`);
		if (/[^\u0000-\u007f]/.test(title)) {
			queries.push(`"${title}" あらすじ`);
			queries.push(`"${title}" story`);
		}
	}

	return queries.filter((query, index, array) => array.indexOf(query) === index).slice(0, 8);
}

function scoreWebResult(movie, result, queryRank, rank) {
	const surface = `${result.title} ${result.snippet}`;
	if (hasBlockedPattern(surface)) {
		return -500;
	}

	let score = 0;
	const titleVariantTokens = getTitleVariants(movie).flatMap((value) => titleTokens(value));
	const directorTokens = getDirectorTokens(movie);

	score += countSharedTokens(surface, titleVariantTokens) * 8;
	score += countSharedTokens(surface, directorTokens) * 10;
	score += scoreYearMatch(surface, getYearCandidates(movie));

	if (/\bsynopsis\b|\bplot\b|\bstory\b|\bpremise\b|\btrama\b|\bsinopsis\b|\bhistoria\b|あらすじ|作品情報/i.test(result.title)) {
		score += 30;
	}
	if (
		/\bfollows\b|\bcenters on\b|\bset in\b|\breunite\b|\breencuentro\b|\bchildhood\b|\byouth\b|\bdepicts\b|\b描く\b|再会|物語|工場|花火/i.test(
			result.snippet,
		)
	) {
		score += 24;
	}
	if (/\breview\b|\breseña\b|感想|critic/i.test(result.title)) {
		score -= 20;
	}
	if (TRUSTED_WEB_SOURCE_PATTERNS.some((pattern) => pattern.test(result.url))) {
		score += 20;
	}

	score += Math.max(0, 18 - rank * 3);
	score += Math.max(0, 12 - queryRank * 2);
	return score;
}

function isAcceptableSynopsis(value, review = '') {
	const synopsis = String(value ?? '').trim();
	if (!synopsis || synopsisNeedsRefresh(synopsis, review)) {
		return false;
	}
	if (looksLikeMetadataSynopsis(synopsis)) {
		return false;
	}
	if (synopsis.length < 45) {
		return false;
	}
	if (/\b(?:Dr|Dra|Mr|Mrs|Ms|Sr|Sra|Prof)\.$/.test(synopsis)) {
		return false;
	}
	if ((synopsis.match(/"/g) ?? []).length % 2 === 1) {
		return false;
	}
	return /[.!?]$/.test(synopsis);
}

async function resolveSynopsisFromWeb(movie) {
	const candidates = [];
	const queries = buildWebSearchQueries(movie);

	for (let queryRank = 0; queryRank < queries.length; queryRank += 1) {
		let results = [];
		try {
			results = await searchDuckDuckGo(queries[queryRank]);
		} catch {
			continue;
		}

		for (let rank = 0; rank < results.length; rank += 1) {
			const result = results[rank];
			candidates.push({
				...result,
				score: scoreWebResult(movie, result, queryRank, rank),
			});
		}
	}

	const ranked = candidates
		.filter((candidate) => candidate.score > 0)
		.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, 'es'))
		.slice(0, 8);

	for (const candidate of ranked) {
		const translated = await translateToSpanish(candidate.snippet);
		const synopsis = cleanupSpanishSynopsis(buildSynopsisFromText(translated));
		if (!isAcceptableSynopsis(synopsis, movie.review)) {
			continue;
		}

		return {
			synopsis,
			source: 'web',
		};
	}

	return null;
}

function cleanupSpanishSynopsis(value) {
	return trimSynopsis(
		String(value ?? '')
			.replace(/^La pel[ií]cula sigue a /i, 'Sigue a ')
			.replace(/^El filme sigue a /i, 'Sigue a ')
			.replace(/^La cinta sigue a /i, 'Sigue a ')
			.replace(/^La historia sigue a /i, 'Sigue a ')
			.replace(/\s+([.,;:!?])/g, '$1')
			.replace(/\s+/g, ' ')
			.trim(),
	);
}

function looksLikeMetadataSynopsis(value) {
	const synopsis = String(value ?? '').trim();
	return METADATA_SYNOPSIS_PATTERNS.some((pattern) => pattern.test(synopsis));
}

function synopsisNeedsRefresh(value, review = '') {
	const synopsis = String(value ?? '').trim();
	if (!synopsis) {
		return true;
	}
	if (synopsis.startsWith('Completar ')) {
		return true;
	}
	if (synopsisCopiesReview(synopsis, review)) {
		return true;
	}
	if (REVIEWISH_PATTERNS.some((pattern) => pattern.test(synopsis))) {
		return true;
	}
	if (looksLikeMetadataSynopsis(synopsis)) {
		return true;
	}
	return false;
}

async function resolveSynopsis(movie) {
	const article = await resolveArticle(movie);
	if (!article) {
		const webSynopsis = await resolveSynopsisFromWeb(movie);
		if (webSynopsis) {
			return webSynopsis;
		}
		return null;
	}

	let sourceText = extractPremiseFromIntro(article.intro);
	let sourceLanguage = article.language;
	let source = 'intro';

	if (!sourceText && article.language !== 'en') {
		const englishIntro = await fetchPageIntro('en', article.title);
		const englishPremise = extractPremiseFromIntro(englishIntro);
		if (englishPremise) {
			sourceText = englishPremise;
			sourceLanguage = 'en';
			source = 'intro';
		}
	}

	if (!sourceText) {
		sourceText = await extractPlotSynopsis(article);
		sourceLanguage = article.language;
		source = sourceText ? 'plot' : 'fallback';
	}

	if (!sourceText) {
		const webSynopsis = await resolveSynopsisFromWeb(movie);
		if (webSynopsis) {
			return webSynopsis;
		}
		return null;
	}

	const spanishText = sourceLanguage === 'es' ? sourceText : await translateToSpanish(sourceText);
	const synopsis = cleanupSpanishSynopsis(buildSynopsisFromText(spanishText));

	if (!isAcceptableSynopsis(synopsis, movie.review)) {
		return null;
	}

	return { synopsis, source };
}

async function loadMovies() {
	const fileNames = (await readdir(MOVIES_DIR)).filter((fileName) => fileName.endsWith('.json'));
	return Promise.all(
		fileNames.map(async (fileName) => {
			const filePath = path.join(MOVIES_DIR, fileName);
			const movie = JSON.parse(await readFile(filePath, 'utf8'));
			return { filePath, movie };
		}),
	);
}

function shouldProcessMovie(existingSynopsis, review, force, onlyBad) {
	if (force) {
		return true;
	}
	if (onlyBad) {
		return synopsisNeedsRefresh(existingSynopsis, review) || !isAcceptableSynopsis(existingSynopsis, review);
	}
	return synopsisNeedsRefresh(existingSynopsis, review);
}

async function runWorker(entries, stats, options) {
	const { force, onlyBad } = options;
	for (;;) {
		const entry = entries.shift();
		if (!entry) {
			return;
		}

		const existingSynopsis = typeof entry.movie.synopsis === 'string' ? entry.movie.synopsis.trim() : '';
		const review = typeof entry.movie.review === 'string' ? entry.movie.review.trim() : '';
		if (!shouldProcessMovie(existingSynopsis, review, force, onlyBad)) {
			continue;
		}

		try {
			const result = await resolveSynopsis(entry.movie);
			if (!result || !result.synopsis || !result.source) {
				stats.unresolved.push(entry.movie.slug);
				console.log(`Skipped ${entry.movie.slug} (unresolved)`);
				continue;
			}
			const { synopsis, source } = result;
			const nextMovie = {
				...entry.movie,
				synopsis,
			};
			await writeFile(entry.filePath, `${JSON.stringify(nextMovie, null, '\t')}\n`, 'utf8');
			stats.updated += 1;
			stats.sources[source] = (stats.sources[source] ?? 0) + 1;
			console.log(`Updated ${entry.movie.slug} (${source})`);
		} catch (error) {
			stats.unresolved.push(entry.movie.slug);
			stats.errors.push(`${entry.movie.slug}: ${error instanceof Error ? error.message : String(error)}`);
			console.log(`Skipped ${entry.movie.slug} (error)`);
		}
	}
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	const entries = (await loadMovies()).filter(({ movie }) => {
		if (args.start && movie.slug < args.start) {
			return false;
		}
		if (args.end && movie.slug > args.end) {
			return false;
		}
		if (args.onlyBad) {
			const existingSynopsis = typeof movie.synopsis === 'string' ? movie.synopsis.trim() : '';
			const review = typeof movie.review === 'string' ? movie.review.trim() : '';
			if (!synopsisNeedsRefresh(existingSynopsis, review) && isAcceptableSynopsis(existingSynopsis, review)) {
				return false;
			}
		}
		return true;
	});
	const queue = [...entries];
	const stats = {
		updated: 0,
		sources: {},
		unresolved: [],
		errors: [],
	};

	await Promise.all(
		Array.from({ length: args.concurrency }).map(() =>
			runWorker(queue, stats, { force: args.force, onlyBad: args.onlyBad }),
		),
	);

	console.log(`Updated synopses for ${stats.updated} movies.`);
	console.log(`Source usage: ${JSON.stringify(stats.sources)}`);
	console.log(`Unresolved: ${stats.unresolved.length}`);
	if (stats.unresolved.length > 0) {
		console.log(`Unresolved slugs: ${stats.unresolved.slice(0, 60).join(', ')}`);
	}
	if (stats.errors.length > 0) {
		console.log(stats.errors.slice(0, 20).join('\n'));
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
