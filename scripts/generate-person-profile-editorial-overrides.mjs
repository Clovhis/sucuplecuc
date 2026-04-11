import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const REPO_ROOT = process.cwd();
const require = createRequire(import.meta.url);
const PERSON_PROFILES_PATH = path.resolve(REPO_ROOT, 'src/data/personProfiles.ts');
const PEOPLE_CATALOG_PATH = path.resolve(REPO_ROOT, 'src/data/people.json');
const MOVIES_DIR = path.resolve(REPO_ROOT, 'src/data/movies');
const USER_AGENT = 'cine-posta-person-profile-editorial/1.0';
const REQUEST_GAP_MS = 320;
const MIN_BIO_WORDS = 70;
const START_MARKER = '/* __PERSON_PROFILE_EDITORIAL_OVERRIDES_START__ */';
const END_MARKER = '/* __PERSON_PROFILE_EDITORIAL_OVERRIDES_END__ */';

const SPANISH_MONTHS = [
	'enero',
	'febrero',
	'marzo',
	'abril',
	'mayo',
	'junio',
	'julio',
	'agosto',
	'septiembre',
	'octubre',
	'noviembre',
	'diciembre',
];
const ENGLISH_MONTHS = [
	'january',
	'february',
	'march',
	'april',
	'may',
	'june',
	'july',
	'august',
	'september',
	'october',
	'november',
	'december',
];
const SPANISH_START_PATTERNS = [
	{ test: /(obras? de teatro escolares?|school plays?)/i, text: 'Empezó actuando en obras escolares antes de dar el salto profesional.' },
	{ test: /(actriz|actor) infantil|child actor|child actress|a los \d+ años|desde niña|desde nino|desde chico|desde chica/i, text: 'Arrancó muy joven, con formación y primeros trabajos que la fueron acercando a la pantalla.' },
	{ test: /(televisión|television|tv|serie|series)/i, text: 'Sus primeros pasos visibles estuvieron en la televisión, desde donde fue ampliando su recorrido en cine.' },
	{ test: /(teatro|theatre|actors studio|stagecoach|escuela de teatro|escuela de actuaci)/i, text: 'Se formó en actuación antes de afirmarse en cine, y esa base teatral quedó muy marcada en su trabajo.' },
	{ test: /(modelo|model)/i, text: 'Antes de consolidarse en cine también pasó por el modelaje y otros trabajos frente a cámara.' },
	{ test: /(guionista|screenwriter|writing|escrib)/i, text: 'Sus primeros pasos estuvieron ligados a la escritura y a la construcción de proyectos propios, algo que después siguió visible en su carrera.' },
];
const INVALID_BIRTH_PLACE_PATTERNS = [
	/\//,
	/^\//,
	/pronunci/i,
	/en ingl[eé]s/i,
	/\bhangul\b/i,
	/\bhebreo\b/i,
	/\bgriego\b/i,
	/\bchino\b/i,
	/\bnacido\b/i,
	/\bnacida\b/i,
	/\bregistrad/i,
	/\bde soltera\b/i,
];
const TEMPLATE_BIO_PATTERNS = [
	/Su carrera quedó muy ligada a /,
	/Dentro del catálogo del sitio su recorrido /,
	/Con el tiempo, [A-ZÁÉÍÓÚÑ][^.,;:!?]+ fue ganando lugar dentro de la industria\./,
];
const BACKGROUND_SENTENCE_PATTERNS = [
	/\bcomenz/i,
	/\binici/i,
	/\bempez/i,
	/\bdebut/i,
	/\ba los \d+ años\b/i,
	/\bestudi/i,
	/\bescuela\b/i,
	/\bteatro\b/i,
	/\btelevisi[óo]n\b/i,
	/\bserie\b/i,
	/\bparticipó\b/i,
	/\bprimera aparición\b/i,
	/\bprimer papel\b/i,
	/\bprimer trabajo\b/i,
];
const HIGHLIGHT_SENTENCE_PATTERNS = [
	/\bes conocido\b/i,
	/\bobtuvo\b/i,
	/\breconocimiento\b/i,
	/\bfama\b/i,
	/\bnomin/i,
	/\bpremio\b/i,
	/\boscar\b/i,
	/\bglobo\b/i,
	/\bpapel\b/i,
	/\bprotagon/i,
	/\binterpret/i,
	/\bdirig/i,
	/\bcreador/i,
	/\bfranquicia\b/i,
	/\bsaga\b/i,
	/\bganó\b/i,
	/\bfue candidato\b/i,
];

const wikidataEntityCache = new Map();
const wikipediaExtractCache = new Map();
let lastRequestAt = 0;

function parseArgs(argv) {
	const args = {
		write: false,
		slugs: [],
		limit: undefined,
		templateOnly: false,
	};

	for (let index = 0; index < argv.length; index += 1) {
		const token = argv[index];
		if (token === '--write') {
			args.write = true;
		} else if (token === '--slug') {
			args.slugs.push(argv[index + 1]);
			index += 1;
		} else if (token === '--limit') {
			args.limit = Number.parseInt(argv[index + 1], 10);
			index += 1;
		} else if (token === '--template-only') {
			args.templateOnly = true;
		} else if (token === '--help' || token === '-h') {
			console.log(
				[
					'Usage:',
					'  node scripts/generate-person-profile-editorial-overrides.mjs',
					'  node scripts/generate-person-profile-editorial-overrides.mjs --slug emma-watson',
					'  node scripts/generate-person-profile-editorial-overrides.mjs --template-only --limit 50',
					'  node scripts/generate-person-profile-editorial-overrides.mjs --limit 10',
					'  node scripts/generate-person-profile-editorial-overrides.mjs --write',
				].join('\n'),
			);
			process.exit(0);
		} else {
			throw new Error(`Unknown argument: ${token}`);
		}
	}

	return args;
}

function normalizeWhitespace(value) {
	return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizePersonName(value) {
	return normalizeWhitespace(value)
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9\s']/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function splitSentences(value) {
	const protectedValue = normalizeWhitespace(value)
		.replace(/\b(Jr|Sr|Dr|Mr|Mrs|Ms)\./g, '$1__DOT__')
		.replace(/!!/g, '__DOUBLE_BANG__');
	const rawParts = protectedValue
		.split(/(?<=[.!?])\s+/)
		.map((entry) =>
			normalizeWhitespace(entry)
				.replace(/__DOT__/g, '.')
				.replace(/__DOUBLE_BANG__/g, '!!'),
		)
		.filter(Boolean);
	const mergedParts = [];

	for (const part of rawParts) {
		if (
			mergedParts.length > 0 &&
			(/^[([{"'0-9]/.test(part) || /^[a-záéíóúñ]/.test(part) || /^(y|e|o|u)\b/.test(part))
		) {
			mergedParts[mergedParts.length - 1] = `${mergedParts[mergedParts.length - 1]} ${part}`.trim();
			continue;
		}

		mergedParts.push(part);
	}

	return mergedParts;
}

function uniqueValues(values) {
	return Array.from(new Set(values.filter(Boolean)));
}

function escapeSingleQuoted(value) {
	return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function formatDateEs(value) {
	if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return undefined;
	}

	const [year, month, day] = value.split('-').map((entry) => Number.parseInt(entry, 10));
	const monthLabel = SPANISH_MONTHS[month - 1];
	if (!year || !monthLabel || !day) {
		return undefined;
	}

	return `${day} de ${monthLabel} de ${year}`;
}

function joinWithAnd(values) {
	if (values.length === 0) return '';
	if (values.length === 1) return values[0];
	if (values.length === 2) return `${values[0]} y ${values[1]}`;
	return `${values.slice(0, -1).join(', ')} y ${values.at(-1)}`;
}

function pickDisplayName(profile) {
	const tokens = normalizeWhitespace(profile.name).split(/\s+/).filter(Boolean);
	return tokens[0] ?? profile.name;
}

function getRoleCareerAreas(profile) {
	const areaMap = {
		actor: 'la actuación',
		actriz: 'la actuación',
		director: 'la dirección',
		productor: 'la producción',
		productora: 'la producción',
		guionista: 'la escritura',
	};

	return Array.from(
		new Set(
			(profile.roles || [])
				.map((role) => areaMap[normalizeWhitespace(role).toLowerCase()] || `el trabajo como ${normalizeWhitespace(role).toLowerCase()}`)
				.filter(Boolean),
		),
	);
}

function getMovieTitleBySlug(moviesBySlug, slug) {
	return moviesBySlug.get(slug)?.title;
}

function getKnownForTitles(profile, moviesBySlug) {
	return (profile.knownFor || [])
		.map((slug) => getMovieTitleBySlug(moviesBySlug, slug))
		.filter(Boolean)
		.slice(0, 3);
}

function getAwardSentence(profile) {
	const award = (profile.awards || [])[0];
	if (!award?.label) {
		return undefined;
	}

	const work = normalizeWhitespace(award.work || '');
	const year = award.year ? ` (${award.year})` : '';
	return work
		? `Entre sus reconocimientos destacados figura un ${award.label} por ${work}${year}.`
		: `Entre sus reconocimientos destacados figura un ${award.label}${year}.`;
}

function getBirthPlaceFromIntro(extract) {
	const firstSentence = splitSentences(extract)[0] || '';
	const parenMatch = firstSentence.match(/\(([^)]+)\)/);
	if (!parenMatch) {
		return undefined;
	}

	let inner = normalizeWhitespace(parenMatch[1]);
	inner = inner.replace(/^born\s+/i, '');
	inner = inner.replace(/^nacido(?:a)?\s+en\s+/i, '');
	if (!inner) {
		return undefined;
	}

	if (inner.includes(';')) {
		inner = normalizeWhitespace(inner.split(';')[0]);
	}

	const datePattern =
		new RegExp(
			`\\b(?:\\d{1,2}\\s+de\\s+(?:${SPANISH_MONTHS.join('|')})\\s+de\\s+\\d{4}|\\d{1,2}\\s+(?:${ENGLISH_MONTHS.join('|')})\\s+\\d{4}|\\d{4})\\b`,
			'i',
		);
	const dateMatch = inner.match(datePattern);
	if (dateMatch) {
		inner = normalizeWhitespace(inner.slice(0, dateMatch.index));
	}

	inner = inner.replace(/[,;:\-]+$/g, '').trim();
	if (!inner || INVALID_BIRTH_PLACE_PATTERNS.some((pattern) => pattern.test(inner))) {
		return undefined;
	}

	return inner || undefined;
}

function isGenericBiography(profile) {
	return (profile.biography || []).some((paragraph) => /mantiene una carrera muy visible/i.test(paragraph));
}

function isTemplateBiography(profile) {
	return (profile.biography || []).some((paragraph) =>
		TEMPLATE_BIO_PATTERNS.some((pattern) => pattern.test(paragraph)),
	);
}

function isSuspiciousBirthPlace(value) {
	const normalized = normalizeWhitespace(value);
	if (!normalized) {
		return false;
	}

	return (
		INVALID_BIRTH_PLACE_PATTERNS.some((pattern) => pattern.test(normalized)) ||
		/^\/|^\p{Ll}/u.test(normalized)
	);
}

function biographyHasSuspiciousContent(profile) {
	return (profile.biography || []).some((paragraph) => INVALID_BIRTH_PLACE_PATTERNS.some((pattern) => pattern.test(paragraph)));
}

function biographyWordCount(profile) {
	return (profile.biography || []).join(' ').split(/\s+/).filter(Boolean).length;
}

function shouldRewriteBiography(profile) {
	return (
		isGenericBiography(profile) ||
		isTemplateBiography(profile) ||
		biographyWordCount(profile) < MIN_BIO_WORDS ||
		biographyHasSuspiciousContent(profile)
	);
}

function getWikidataId(...groups) {
	for (const group of groups) {
		for (const value of group || []) {
			const match = String(value || '').match(/\/wiki\/(Q\d+)(?:$|[/?#])|\/EntityData\/(Q\d+)\.json/i);
			if (match) {
				return match[1] || match[2];
			}
		}
	}

	return undefined;
}

function getClaimEntityId(entity, claimId) {
	const value = entity?.claims?.[claimId]?.[0]?.mainsnak?.datavalue?.value;
	if (value && typeof value === 'object' && typeof value.id === 'string') {
		return value.id;
	}

	return undefined;
}

function getSitelinkTitle(entity, key) {
	return entity?.sitelinks?.[key]?.title;
}

function getLabel(entity) {
	return (
		entity?.labels?.es?.value ||
		entity?.labels?.en?.value ||
		entity?.labels?.fr?.value ||
		entity?.labels?.de?.value ||
		entity?.labels?.it?.value
	);
}

async function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url) {
	for (let attempt = 0; attempt < 6; attempt += 1) {
		const now = Date.now();
		const gap = now - lastRequestAt;
		if (gap < REQUEST_GAP_MS) {
			await sleep(REQUEST_GAP_MS - gap);
		}

		const response = await fetch(url, {
			headers: {
				'user-agent': USER_AGENT,
				'accept': 'application/json',
			},
		});
		lastRequestAt = Date.now();

		if (response.ok) {
			return response.json();
		}

		if (response.status === 429 || response.status >= 500) {
			const retryAfterHeader = Number.parseInt(response.headers.get('retry-after') || '', 10);
			const retryAfterMs =
				Number.isFinite(retryAfterHeader) && retryAfterHeader > 0
					? retryAfterHeader * 1000
					: REQUEST_GAP_MS * (attempt + 2) * 3;
			await sleep(retryAfterMs);
			continue;
		}

		throw new Error(`Request failed for ${url} with ${response.status}`);
	}

	throw new Error(`Request failed for ${url} after multiple retries`);
}

async function getWikidataEntity(id) {
	if (!id) {
		return undefined;
	}

	if (wikidataEntityCache.has(id)) {
		return wikidataEntityCache.get(id);
	}

	const data = await fetchJson(`https://www.wikidata.org/wiki/Special:EntityData/${id}.json`);
	const entity = data?.entities?.[id];
	wikidataEntityCache.set(id, entity);
	return entity;
}

async function getWikipediaExtract(lang, title) {
	if (!lang || !title) {
		return undefined;
	}

	const cacheKey = `${lang}:${title}`;
	if (wikipediaExtractCache.has(cacheKey)) {
		return wikipediaExtractCache.get(cacheKey);
	}

	const url =
		`https://${lang}.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&format=json&titles=` +
		encodeURIComponent(title);
	const data = await fetchJson(url);
	const page = Object.values(data?.query?.pages || {})[0];
	const extract = normalizeWhitespace(page?.extract || '');
	const value = extract || undefined;
	wikipediaExtractCache.set(cacheKey, value);
	return value;
}

async function loadPersonProfiles() {
	const source = await fs.readFile(PERSON_PROFILES_PATH, 'utf8');
	const transformed = source
		.replace(/^import\s+type\s+.+?;\s*$/gm, '')
		.replace(
			/export\s+const\s+personProfiles\s*:\s*Record<string,\s*PersonProfileRecord>\s*=/,
			'module.exports.personProfiles =',
		);
	const sandbox = {
		module: { exports: {} },
		exports: {},
		require,
		console,
	};
	vm.runInNewContext(transformed, sandbox, { filename: PERSON_PROFILES_PATH });
	return sandbox.module.exports.personProfiles || {};
}

async function loadMoviesBySlug() {
	const entries = await fs.readdir(MOVIES_DIR);
	const records = await Promise.all(
		entries
			.filter((entry) => entry.endsWith('.json'))
			.map(async (entry) => {
				const raw = await fs.readFile(path.join(MOVIES_DIR, entry), 'utf8');
				const movie = JSON.parse(raw);
				return [movie.slug, movie];
			}),
	);
	return new Map(records);
}

function sanitizeParentheticalContent(content) {
	const normalized = normalizeWhitespace(content);
	if (!normalized) {
		return '';
	}

	const parts = normalized
		.split(/\s*;\s*/)
		.map((part) => normalizeWhitespace(part))
		.filter(Boolean);
	const usefulParts = parts.filter((part) => !INVALID_BIRTH_PLACE_PATTERNS.some((pattern) => pattern.test(part)));
	if (usefulParts.length === 0) {
		return '';
	}

	return usefulParts.join('; ');
}

function cleanWikipediaSentence(sentence) {
	let value = normalizeWhitespace(String(sentence || '').replace(/[\u200B-\u200D\uFEFF]/g, ' '));
	if (!value) {
		return '';
	}

	value = value.replace(/\(([^()]*)\)/g, (match, content) => {
		const sanitized = sanitizeParentheticalContent(content);
		return sanitized ? `(${sanitized})` : '';
	});
	value = value
		.replace(/\s+([,.;:!?])/g, '$1')
		.replace(/\(\s+/g, '(')
		.replace(/\s+\)/g, ')')
		.replace(/\s{2,}/g, ' ')
		.trim();

	return value;
}

function looksUsefulBiographySentence(sentence) {
	const value = cleanWikipediaSentence(sentence);
	if (!value || value.length < 30) {
		return false;
	}

	if (/^Es un actor de doblaje prolífico/i.test(value)) {
		return true;
	}

	return true;
}

function isBackgroundSentence(sentence) {
	return BACKGROUND_SENTENCE_PATTERNS.some((pattern) => pattern.test(sentence));
}

function isHighlightSentence(sentence) {
	return HIGHLIGHT_SENTENCE_PATTERNS.some((pattern) => pattern.test(sentence));
}

function buildCatalogContextParagraph({ profile, moviesBySlug }) {
	const knownForTitles = getKnownForTitles(profile, moviesBySlug);
	if (knownForTitles.length === 0) {
		return undefined;
	}

	const roleIsDirectorOnly =
		(profile.roles || []).some((role) => /director/i.test(role)) &&
		!(profile.roles || []).some((role) => /actor|actriz/i.test(role));

	return roleIsDirectorOnly
		? `En Cine Posta su obra queda conectada con ${joinWithAnd(knownForTitles)}, que hoy funcionan como entrada rápida a su filmografía dentro del sitio.`
		: `En Cine Posta aparece ligado a ${joinWithAnd(knownForTitles)}, tres títulos que ayudan a seguir su recorrido dentro del sitio.`;
}

function buildWikipediaDrivenBiography({ profile, extract, moviesBySlug }) {
	const cleanedSentences = uniqueValues(
		splitSentences(extract)
			.map((sentence) => cleanWikipediaSentence(sentence))
			.filter((sentence) => looksUsefulBiographySentence(sentence)),
	);
	if (cleanedSentences.length === 0) {
		return undefined;
	}

	const selected = [];
	const used = new Set();

	function takeSentence(sentence) {
		if (!sentence || used.has(sentence)) {
			return;
		}
		used.add(sentence);
		selected.push(sentence);
	}

	takeSentence(cleanedSentences[0]);
	takeSentence(cleanedSentences.find((sentence, index) => index > 0 && isBackgroundSentence(sentence)));
	takeSentence(cleanedSentences.find((sentence, index) => index > 0 && !used.has(sentence) && isHighlightSentence(sentence)));

	for (const sentence of cleanedSentences) {
		if (selected.length >= 3) {
			break;
		}
		takeSentence(sentence);
	}

	if (selected.length < 2) {
		const catalogParagraph = buildCatalogContextParagraph({ profile, moviesBySlug });
		if (catalogParagraph) {
			selected.push(catalogParagraph);
		}
	}

	return selected.slice(0, 3);
}

function buildIdentityParagraph({ profile, person, birthPlace }) {
	const roleAreas = getRoleCareerAreas(profile);
	const birthDate = formatDateEs(person?.birthDate || profile.birthDate);
	const birthYear = person?.birthYear || profile.birthYear;
	const pieces = [];

	if (birthDate && birthPlace) {
		pieces.push(`${profile.name} nació el ${birthDate} en ${birthPlace}.`);
	} else if (birthDate) {
		pieces.push(`${profile.name} nació el ${birthDate}.`);
	} else if (birthPlace && birthYear) {
		pieces.push(`${profile.name} nació en ${birthPlace} en ${birthYear}.`);
	} else if (birthYear) {
		pieces.push(`${profile.name} nació en ${birthYear}.`);
	} else if (birthPlace) {
		pieces.push(`${profile.name} nació en ${birthPlace}.`);
	}

	if (roleAreas.length > 0) {
		pieces.push(`Su carrera quedó muy ligada a ${joinWithAnd(roleAreas)}.`);
	}

	return normalizeWhitespace(pieces.join(' '));
}

function buildCareerStartParagraph({ profile, extract }) {
	const shortName = pickDisplayName(profile);
	for (const matcher of SPANISH_START_PATTERNS) {
		if (matcher.test.test(extract)) {
			return normalizeWhitespace(`${matcher.text} Con el tiempo, ${shortName} fue ganando lugar dentro de la industria.`);
		}
	}

	if (/premio|oscar|festival|cannes|forbes|time/i.test(extract)) {
		return `${shortName} fue sumando visibilidad de manera sostenida hasta quedar entre los nombres más reconocibles de su generación.`;
	}

	if ((profile.roles || []).some((role) => /director/i.test(role))) {
		return `${shortName} fue armando sus primeros proyectos detrás de cámara antes de consolidarse como una voz reconocible en el largometraje.`;
	}

	return `${shortName} fue construyendo sus primeros trabajos antes de alcanzar una visibilidad mucho más amplia en cine.`;
}

function buildCareerHighlightsParagraph({ profile, moviesBySlug }) {
	const shortName = pickDisplayName(profile);
	const knownForTitles = getKnownForTitles(profile, moviesBySlug);
	const awardSentence = getAwardSentence(profile);
	const roleIsDirectorOnly =
		(profile.roles || []).some((role) => /director/i.test(role)) &&
		!(profile.roles || []).some((role) => /actor|actriz/i.test(role));
	let baseSentence = '';

	if (knownForTitles.length > 0) {
		baseSentence = roleIsDirectorOnly
			? `Dentro del catálogo del sitio su recorrido detrás de cámara se puede seguir en títulos como ${joinWithAnd(
					knownForTitles,
			  )}.`
			: `Dentro del catálogo del sitio su recorrido en pantalla se puede seguir en títulos como ${joinWithAnd(
					knownForTitles,
			  )}.`;
	} else {
		baseSentence = `${shortName} fue sosteniendo un recorrido con presencia tanto industrial como autoral.`;
	}

	return normalizeWhitespace([baseSentence, awardSentence].filter(Boolean).join(' '));
}

function buildFallbackBiography({ profile, person, birthPlace, extract, moviesBySlug }) {
	const paragraphs = [
		buildIdentityParagraph({ profile, person, birthPlace }),
		buildCareerStartParagraph({ profile, extract }),
		buildCareerHighlightsParagraph({ profile, moviesBySlug }),
	].filter(Boolean);

	return paragraphs.slice(0, 3);
}

async function enrichProfile({ profile, person, moviesBySlug }) {
	const wikidataId = getWikidataId(person?.referenceUrls, profile.referenceUrls);
	const wikidataEntity = await getWikidataEntity(wikidataId);
	const birthPlaceId = getClaimEntityId(wikidataEntity, 'P19');
	const birthPlaceEntity = await getWikidataEntity(birthPlaceId);
	const eswikiTitle = getSitelinkTitle(wikidataEntity, 'eswiki');
	const enwikiTitle = getSitelinkTitle(wikidataEntity, 'enwiki');
	const esExtract = await getWikipediaExtract('es', eswikiTitle);
	const enExtract = esExtract ? undefined : await getWikipediaExtract('en', enwikiTitle);
	const extract = esExtract || enExtract || '';
	const birthPlaceFromIntro = getBirthPlaceFromIntro(extract);
	const birthPlace = birthPlaceFromIntro || getLabel(birthPlaceEntity) || profile.birthPlace;
	const biography =
		(esExtract
			? buildWikipediaDrivenBiography({
					profile,
					extract: esExtract,
					moviesBySlug,
			  })
			: undefined) ??
		buildFallbackBiography({
			profile,
			person,
			birthPlace,
			extract,
			moviesBySlug,
		});

	return {
		birthPlace,
		biography,
		wikidataId,
		hasExtract: Boolean(extract),
	};
}

function serializeArray(values, indent) {
	if (!values.length) {
		return '[]';
	}

	return `[\n${values.map((value) => `${indent}\t'${escapeSingleQuoted(value)}'`).join(',\n')}\n${indent}]`;
}

function serializeOverrideEntry(slug, override, indent) {
	const lines = [`${indent}'${slug}': {`];
	if (override.birthPlace) {
		lines.push(`${indent}\tbirthPlace: '${escapeSingleQuoted(override.birthPlace)}',`);
	}
	if (override.biography) {
		lines.push(`${indent}\tbiography: ${serializeArray(override.biography, `${indent}\t`)},`);
	}
	lines.push(`${indent}},`);
	return lines.join('\n');
}

function parseExistingOverrides(source) {
	const startIndex = source.indexOf(START_MARKER);
	const endIndex = source.indexOf(END_MARKER);
	if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
		throw new Error('No se encontraron los marcadores del bloque editorial.');
	}

	const rawBlock = source.slice(startIndex + START_MARKER.length, endIndex).trim();
	if (!rawBlock) {
		return {};
	}

	const sandbox = {
		module: { exports: {} },
		exports: {},
	};
	vm.runInNewContext(`module.exports = {\n${rawBlock}\n};`, sandbox, { filename: 'personProfileEditorialOverrides.vm' });
	return sandbox.module.exports || {};
}

async function writeOverridesBlock(overrides) {
	const source = await fs.readFile(PERSON_PROFILES_PATH, 'utf8');
	const startIndex = source.indexOf(START_MARKER);
	const endIndex = source.indexOf(END_MARKER);
	if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
		throw new Error('No se encontraron los marcadores del bloque editorial.');
	}

	const existingOverrides = parseExistingOverrides(source);
	const mergedOverrides = { ...existingOverrides, ...overrides };
	const body =
		Object.keys(mergedOverrides)
			.sort((left, right) => left.localeCompare(right, 'es'))
			.map((slug) => serializeOverrideEntry(slug, mergedOverrides[slug], '\t'))
			.join('\n') + '\n';
	const nextSource =
		source.slice(0, startIndex + START_MARKER.length) +
		'\n' +
		body +
		source.slice(endIndex);
	await fs.writeFile(PERSON_PROFILES_PATH, nextSource, 'utf8');
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	const [profiles, peopleCatalog, moviesBySlug] = await Promise.all([
		loadPersonProfiles(),
		fs.readFile(PEOPLE_CATALOG_PATH, 'utf8').then((raw) => JSON.parse(raw)),
		loadMoviesBySlug(),
	]);
	const peopleByName = new Map(
		Object.entries(peopleCatalog).map(([key, value]) => [normalizePersonName(value?.name || key), value]),
	);

	const allProfiles = Object.values(profiles);
	let targets = args.templateOnly
		? allProfiles.filter((profile) => isTemplateBiography(profile))
		: allProfiles.filter((profile) => shouldRewriteBiography(profile) || !profile.birthPlace || isSuspiciousBirthPlace(profile.birthPlace));
	if (args.slugs.length > 0) {
		const wanted = new Set(args.slugs);
		targets = allProfiles.filter((profile) => wanted.has(profile.slug));
	}
	if (typeof args.limit === 'number' && Number.isFinite(args.limit)) {
		targets = targets.slice(0, args.limit);
	}

	const overrides = {};
	let rewritten = 0;
	let birthPlacesFilled = 0;
	let missingExtracts = 0;

	for (const profile of targets) {
		const person = peopleByName.get(normalizePersonName(profile.name));
		const enriched = await enrichProfile({ profile, person, moviesBySlug });
		const nextOverride = {};
		if ((!profile.birthPlace || isSuspiciousBirthPlace(profile.birthPlace)) && enriched.birthPlace) {
			nextOverride.birthPlace = enriched.birthPlace;
			birthPlacesFilled += 1;
		}
		if (shouldRewriteBiography(profile)) {
			nextOverride.biography = enriched.biography;
			rewritten += 1;
		}
		if (!enriched.hasExtract) {
			missingExtracts += 1;
		}
		if (Object.keys(nextOverride).length > 0) {
			overrides[profile.slug] = nextOverride;
		}
		console.log(
			`[ok] ${profile.slug} | bio:${nextOverride.biography ? 'yes' : 'no'} | birthPlace:${
				nextOverride.birthPlace ? 'yes' : 'no'
			} | source:${enriched.hasExtract ? 'wiki' : 'local-fallback'}`,
		);
	}

	console.log(
		`\nProcesados: ${targets.length}\nBios reescritas: ${rewritten}\nBirthPlace completados: ${birthPlacesFilled}\nSin extracto wiki: ${missingExtracts}`,
	);

	if (args.write) {
		await writeOverridesBlock(overrides);
		console.log(`\nBloque editorial actualizado en ${path.relative(REPO_ROOT, PERSON_PROFILES_PATH)}.`);
	} else {
		const preview = Object.fromEntries(Object.entries(overrides).slice(0, 3));
		console.log('\nVista previa:\n');
		console.log(JSON.stringify(preview, null, 2));
	}
}

main().catch((error) => {
	console.error(error instanceof Error ? error.stack || error.message : String(error));
	process.exit(1);
});
