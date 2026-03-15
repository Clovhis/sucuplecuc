import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const MOVIES_DIR = path.resolve('src/data/movies');
const PEOPLE_CATALOG_PATH = path.resolve('src/data/people.json');
const PEOPLE_PUBLIC_DIR = path.resolve('public/people');
const USER_AGENT = 'cine-posta-people-pool/1.0';
const SEARCH_LIMIT = 5;
const CONCURRENCY = 1;
const IMAGE_WIDTH = 120;
const REQUEST_GAP_MS = Number.parseInt(process.env.PEOPLE_REQUEST_GAP_MS ?? '900', 10);
const RETRY_BASE_MS = Number.parseInt(process.env.PEOPLE_RETRY_BASE_MS ?? '8000', 10);
const VERIFIED_DATE = new Date().toISOString().slice(0, 10);
const CURRENT_YEAR = new Date().getUTCFullYear();
const FEMALE_GENDER_ENTITY_ID = 'Q6581072';
const MALE_GENDER_ENTITY_ID = 'Q6581097';
const HUMAN_ENTITY_ID = 'Q5';
const ENTERTAINMENT_DESCRIPTION_TOKENS = [
	'actor',
	'actress',
	'director',
	'filmmaker',
	'screenwriter',
	'producer',
	'voice actor',
	'voice actress',
	'animator',
	'writer',
	'comedian',
	'seiyuu',
];
const SUSPICIOUS_PORTRAIT_TOKENS = [
	'screenshot',
	'spy x family',
	'despicable me',
	'aff 8 brothers',
	'ryan fleck anne boden',
	'scottbeck',
];
const SUSPICIOUS_PORTRAIT_SOURCE_TOKENS = ['group cache'];
const NATIONALITY_BY_COUNTRY_ID = {
	Q16: { male: 'Canadiense', female: 'Canadiense', neutral: 'Canadiense' },
	Q17: { male: 'Japonés', female: 'Japonesa', neutral: 'Japonés' },
	Q20: { male: 'Noruego', female: 'Noruega', neutral: 'Noruego' },
	Q27: { male: 'Irlandés', female: 'Irlandesa', neutral: 'Irlandés' },
	Q29: { male: 'Español', female: 'Española', neutral: 'Español' },
	Q30: { male: 'Estadounidense', female: 'Estadounidense', neutral: 'Estadounidense' },
	Q31: { male: 'Belga', female: 'Belga', neutral: 'Belga' },
	Q33: { male: 'Finlandés', female: 'Finlandesa', neutral: 'Finlandés' },
	Q34: { male: 'Sueco', female: 'Sueca', neutral: 'Sueco' },
	Q35: { male: 'Danés', female: 'Danesa', neutral: 'Danés' },
	Q38: { male: 'Italiano', female: 'Italiana', neutral: 'Italiano' },
	Q39: { male: 'Suizo', female: 'Suiza', neutral: 'Suizo' },
	Q55: { male: 'Neerlandés', female: 'Neerlandesa', neutral: 'Neerlandés' },
	Q96: { male: 'Mexicano', female: 'Mexicana', neutral: 'Mexicano' },
	Q114: { male: 'Keniano', female: 'Keniana', neutral: 'Keniano' },
	Q145: { male: 'Británico', female: 'Británica', neutral: 'Británico' },
	Q148: { male: 'Chino', female: 'China', neutral: 'Chino' },
	Q155: { male: 'Brasileño', female: 'Brasileña', neutral: 'Brasileño' },
	Q183: { male: 'Alemán', female: 'Alemana', neutral: 'Alemán' },
	Q189: { male: 'Islandés', female: 'Islandesa', neutral: 'Islandés' },
	Q211: { male: 'Letón', female: 'Letona', neutral: 'Letón' },
	Q212: { male: 'Ucraniano', female: 'Ucraniana', neutral: 'Ucraniano' },
	Q213: { male: 'Checo', female: 'Checa', neutral: 'Checo' },
	Q214: { male: 'Eslovaco', female: 'Eslovaca', neutral: 'Eslovaco' },
	Q218: { male: 'Rumano', female: 'Rumana', neutral: 'Rumano' },
	Q252: { male: 'Indonesio', female: 'Indonesia', neutral: 'Indonesio' },
	Q258: { male: 'Sudafricano', female: 'Sudafricana', neutral: 'Sudafricano' },
	Q298: { male: 'Chileno', female: 'Chilena', neutral: 'Chileno' },
	Q334: { male: 'Singapurense', female: 'Singapurense', neutral: 'Singapurense' },
	Q408: { male: 'Australiano', female: 'Australiana', neutral: 'Australiano' },
	Q414: { male: 'Argentino', female: 'Argentina', neutral: 'Argentino' },
	Q419: { male: 'Peruano', female: 'Peruana', neutral: 'Peruano' },
	Q664: { male: 'Neozelandés', female: 'Neozelandesa', neutral: 'Neozelandés' },
	Q668: { male: 'Indio', female: 'India', neutral: 'Indio' },
	Q736: { male: 'Ecuatoriano', female: 'Ecuatoriana', neutral: 'Ecuatoriano' },
	Q739: { male: 'Colombiano', female: 'Colombiana', neutral: 'Colombiano' },
	Q750: { male: 'Boliviano', female: 'Boliviana', neutral: 'Boliviano' },
	Q754: { male: 'Trinitense', female: 'Trinitense', neutral: 'Trinitense' },
	Q774: { male: 'Guatemalteco', female: 'Guatemalteca', neutral: 'Guatemalteco' },
	Q783: { male: 'Hondureño', female: 'Hondureña', neutral: 'Hondureño' },
	Q786: { male: 'Dominicano', female: 'Dominicana', neutral: 'Dominicano' },
	Q792: { male: 'Salvadoreño', female: 'Salvadoreña', neutral: 'Salvadoreño' },
	Q794: { male: 'Iraní', female: 'Iraní', neutral: 'Iraní' },
	Q801: { male: 'Israelí', female: 'Israelí', neutral: 'Israelí' },
	Q865: { male: 'Taiwanés', female: 'Taiwanesa', neutral: 'Taiwanés' },
	Q869: { male: 'Tailandés', female: 'Tailandesa', neutral: 'Tailandés' },
	Q881: { male: 'Vietnamita', female: 'Vietnamita', neutral: 'Vietnamita' },
	Q884: { male: 'Coreano', female: 'Coreana', neutral: 'Coreano' },
	Q928: { male: 'Filipino', female: 'Filipina', neutral: 'Filipino' },
	Q974: { male: 'Congoleño', female: 'Congoleña', neutral: 'Congoleño' },
	Q1008: { male: 'Marfileño', female: 'Marfileña', neutral: 'Marfileño' },
	Q1011: { male: 'Caboverdiano', female: 'Caboverdiana', neutral: 'Caboverdiano' },
	Q1033: { male: 'Nigeriano', female: 'Nigeriana', neutral: 'Nigeriano' },
	Q1041: { male: 'Senegalés', female: 'Senegalesa', neutral: 'Senegalés' },
	Q142: { male: 'Francés', female: 'Francesa', neutral: 'Francés' },
	Q159: { male: 'Ruso', female: 'Rusa', neutral: 'Ruso' },
};

const searchCache = new Map();
const entityCache = new Map();
let lastNetworkRequestAt = 0;

function parseArgs(argv) {
	const args = {
		all: false,
		limit: undefined,
		offset: 0,
		movies: [],
		people: [],
		missingPeopleOnly: false,
		missingOnly: false,
	};

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === '--all') {
			args.all = true;
		} else if (arg === '--movie') {
			args.movies.push(argv[++index]);
		} else if (arg === '--person') {
			args.people.push(argv[++index]);
		} else if (arg === '--limit') {
			args.limit = Number.parseInt(argv[++index], 10);
		} else if (arg === '--offset') {
			args.offset = Number.parseInt(argv[++index], 10);
		} else if (arg === '--missing-people-only') {
			args.missingPeopleOnly = true;
		} else if (arg === '--missing-only') {
			args.missingOnly = true;
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
			'  npm run enrich-people -- --all',
			'  npm run enrich-people -- --all --offset 0 --limit 25 --missing-only',
			'  npm run enrich-people -- --all --limit 5 --missing-only',
			'  npm run enrich-people -- --movie 28-years-later-the-bone-temple-2026',
			'  npm run enrich-people -- --movie alien-1979 --movie aliens-1986 --missing-only',
			'  npm run enrich-people -- --missing-people-only --offset 0 --limit 50',
			'  npm run enrich-people -- --person "Alan Arkin" --person "Mads Mikkelsen"',
		].join('\n'),
	);
}

function normalizeWhitespace(value) {
	return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeKey(value) {
	return normalizeWhitespace(value)
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9\s']/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function slugify(value) {
	return normalizeKey(value).replace(/'/g, '').replace(/\s+/g, '-');
}

function mergeReferenceUrls(...groups) {
	return Array.from(
		new Set(
			groups
				.flat()
				.filter((value) => typeof value === 'string' && value.trim().length > 0)
				.map((value) => value.trim()),
		),
	);
}

function buildCatalogIndex(catalog) {
	return new Map(Object.keys(catalog).map((key) => [normalizeKey(key), key]));
}

function findCatalogKey(catalog, index, name) {
	if (catalog[name]) {
		return name;
	}

	return index.get(normalizeKey(name));
}

function getCatalogEntry(catalog, index, name) {
	const key = findCatalogKey(catalog, index, name);
	return key ? catalog[key] : undefined;
}

function setCatalogEntry(catalog, index, name, value) {
	const existingKey = findCatalogKey(catalog, index, name);
	const targetKey = existingKey ?? name;
	catalog[targetKey] = value;
	index.set(normalizeKey(targetKey), targetKey);
	return targetKey;
}

async function saveCatalog(catalog) {
	const sortedCatalog = Object.fromEntries(
		Object.entries(catalog).sort((left, right) => left[0].localeCompare(right[0], 'es')),
	);
	await writeFile(PEOPLE_CATALOG_PATH, `${JSON.stringify(sortedCatalog, null, '\t')}\n`, 'utf8');
}

function splitCreditNames(value) {
	return normalizeWhitespace(value)
		.split(/\s*,\s*|\s+y\s+/i)
		.map((entry) => normalizeWhitespace(entry))
		.filter(Boolean);
}

function normalizeTitleVariant(value) {
	return normalizeWhitespace(value);
}

function normalizeTitleKey(value) {
	return normalizeWhitespace(value)
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, ' ')
		.trim();
}

function buildTitleVariants(movie) {
	const variants = new Set();
	const sourceTitles = [movie.originalTitle, movie.title].filter(
		(value) => typeof value === 'string' && value.trim().length > 0,
	);

	for (const sourceTitle of sourceTitles) {
		const normalized = normalizeTitleVariant(sourceTitle);
		if (!normalized) continue;

		variants.add(normalized);
		variants.add(normalized.replace(/[’]/g, "'"));
		variants.add(normalizeTitleVariant(normalized.replace(/\s*\([^)]*\)\s*/g, ' ')));
		variants.add(normalizeTitleVariant(normalized.replace(/\s*&\s*/g, ' and ')));
		variants.add(normalizeTitleVariant(normalized.replace(/\s+and\s+/gi, ' & ')));
	}

	return Array.from(variants).filter(Boolean);
}

async function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

async function throttleNetwork() {
	const elapsedMs = Date.now() - lastNetworkRequestAt;
	if (elapsedMs < REQUEST_GAP_MS) {
		await sleep(REQUEST_GAP_MS - elapsedMs);
	}
	lastNetworkRequestAt = Date.now();
}

async function fetchJson(url) {
	for (let attempt = 1; attempt <= 5; attempt += 1) {
		await throttleNetwork();
		const response = await fetch(url, {
			headers: {
				accept: 'application/json',
				'user-agent': USER_AGENT,
			},
		});

		if (response.ok) {
			return response.json();
		}

		if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 5) {
			throw new Error(`Request failed with ${response.status}: ${url}`);
		}

		const retryAfter = Number.parseInt(response.headers.get('retry-after') ?? '', 10);
		const waitMs = Number.isInteger(retryAfter)
			? retryAfter * 1000
			: Math.max(RETRY_BASE_MS * attempt, attempt * 3000);
		await sleep(waitMs);
	}

	throw new Error(`Request exhausted retries: ${url}`);
}

async function searchEntities(query, language = 'en') {
	const cacheKey = `${language}:${query}`;
	if (searchCache.has(cacheKey)) {
		return searchCache.get(cacheKey);
	}

	const payload = await fetchJson(
		`https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&type=item&limit=${SEARCH_LIMIT}&language=${language}&search=${encodeURIComponent(query)}`,
	);
	const results = Array.isArray(payload?.search) ? payload.search : [];
	searchCache.set(cacheKey, results);
	return results;
}

async function getEntity(entityId) {
	if (entityCache.has(entityId)) {
		return entityCache.get(entityId);
	}

	const payload = await fetchJson(`https://www.wikidata.org/wiki/Special:EntityData/${entityId}.json`);
	const entity = payload?.entities?.[entityId] ?? null;
	entityCache.set(entityId, entity);
	return entity;
}

function getClaimValues(entity, propertyId) {
	return Array.isArray(entity?.claims?.[propertyId]) ? entity.claims[propertyId] : [];
}

function getEntityIdsFromClaims(entity, propertyId) {
	return getClaimValues(entity, propertyId)
		.map((claim) => claim?.mainsnak?.datavalue?.value)
		.filter((value) => value?.['entity-type'] === 'item' && Number.isInteger(value?.['numeric-id']))
		.map((value) => `Q${value['numeric-id']}`);
}

function getMovieYear(entity) {
	for (const claim of getClaimValues(entity, 'P577')) {
		const year = getYearFromTimeValue(claim?.mainsnak?.datavalue?.value?.time);
		if (Number.isInteger(year)) {
			return year;
		}
	}
	return null;
}

function getYearFromTimeValue(timeValue) {
	if (typeof timeValue !== 'string' || timeValue.length < 6) {
		return null;
	}

	const match = timeValue.match(/^([+-]?\d+)-(\d{2})-(\d{2})T/);
	if (!match) {
		return null;
	}

	const year = Number.parseInt(match[1], 10);
	return Number.isInteger(year) ? year : null;
}

function getIsoDateClaim(entity, propertyId) {
	for (const claim of getClaimValues(entity, propertyId)) {
		const timeValue = claim?.mainsnak?.datavalue?.value?.time;
		const precision = claim?.mainsnak?.datavalue?.value?.precision;
		const match = typeof timeValue === 'string' ? timeValue.match(/^([+-]?\d+)-(\d{2})-(\d{2})T/) : null;
		if (!match) {
			continue;
		}

		const year = Number.parseInt(match[1], 10);
		if (!Number.isInteger(year) || year <= 0) {
			continue;
		}

		const normalizedYear = String(year).padStart(4, '0');
		if (precision >= 11) {
			return `${normalizedYear}-${match[2]}-${match[3]}`;
		}
		if (precision === 10) {
			return `${normalizedYear}-${match[2]}`;
		}
		if (precision === 9) {
			return normalizedYear;
		}
	}

	return null;
}

function getBirthYear(entity) {
	const birthDate = getIsoDateClaim(entity, 'P569');
	return birthDate ? Number.parseInt(birthDate.slice(0, 4), 10) : null;
}

function getDeathYear(entity) {
	const deathDate = getIsoDateClaim(entity, 'P570');
	return deathDate ? Number.parseInt(deathDate.slice(0, 4), 10) : null;
}

function getGenderEntityId(entity) {
	return getEntityIdsFromClaims(entity, 'P21')[0] ?? null;
}

function getMonolingualTexts(entity, propertyId, language) {
	return getClaimValues(entity, propertyId)
		.map((claim) => claim?.mainsnak?.datavalue?.value)
		.filter((value) => value?.language === language && typeof value?.text === 'string')
		.map((value) => normalizeWhitespace(value.text))
		.filter(Boolean);
}

function capitalizeWord(value) {
	return value ? value[0].toUpperCase() + value.slice(1) : value;
}

function singularizeSpanishDemonym(value) {
	const demonym = normalizeWhitespace(value).toLowerCase();
	if (!demonym) {
		return null;
	}

	const irregular = {
		britanicos: 'británico',
		britanicas: 'británica',
		espanoles: 'español',
		espanolas: 'española',
		alemanes: 'alemán',
		alemanas: 'alemana',
		franceses: 'francés',
		francesas: 'francesa',
		ingleses: 'inglés',
		inglesas: 'inglesa',
		irlandeses: 'irlandés',
		irlandesas: 'irlandesa',
		japoneses: 'japonés',
		japonesas: 'japonesa',
		neozelandeses: 'neozelandés',
		neozelandesas: 'neozelandesa',
		daneses: 'danés',
		danesas: 'danesa',
		senegaleses: 'senegalés',
		senegalesas: 'senegalesa',
	};
	const normalizedKey = demonym
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '');
	if (irregular[normalizedKey]) {
		return irregular[normalizedKey];
	}

	if (demonym.endsWith('enses')) return demonym.slice(0, -1);
	if (demonym.endsWith('anos') || demonym.endsWith('anas')) return demonym.slice(0, -1);
	if (demonym.endsWith('inos') || demonym.endsWith('inas')) return demonym.slice(0, -1);
	if (demonym.endsWith('enos') || demonym.endsWith('enas')) return demonym.slice(0, -1);
	if (demonym.endsWith('nos') || demonym.endsWith('nas')) return demonym.slice(0, -1);
	if (demonym.endsWith('cos') || demonym.endsWith('cas')) return demonym.slice(0, -1);
	if (demonym.endsWith('os') || demonym.endsWith('as')) return demonym.slice(0, -1);
	return demonym;
}

function pickGenderedNationality(labels, genderEntityId) {
	const normalized = labels
		.map((label) => singularizeSpanishDemonym(label))
		.filter(Boolean);
	if (normalized.length === 0) {
		return null;
	}

	if (genderEntityId === FEMALE_GENDER_ENTITY_ID) {
		return (
			normalized.find((label) => /a$/.test(label) || /ense$/.test(label) || /i$/.test(label)) ??
			normalized[0]
		);
	}

	if (genderEntityId === MALE_GENDER_ENTITY_ID) {
		return (
			normalized.find((label) => !/a$/.test(label) || /ense$/.test(label) || /i$/.test(label)) ??
			normalized[0]
		);
	}

	return normalized[0];
}

async function getPrimaryNationality(entity) {
	const genderEntityId = getGenderEntityId(entity);
	const countryId = getEntityIdsFromClaims(entity, 'P27')[0] ?? null;
	if (!countryId) {
		return null;
	}

	const mappedNationality = NATIONALITY_BY_COUNTRY_ID[countryId];
	if (mappedNationality) {
		if (genderEntityId === FEMALE_GENDER_ENTITY_ID) return mappedNationality.female;
		if (genderEntityId === MALE_GENDER_ENTITY_ID) return mappedNationality.male;
		return mappedNationality.neutral;
	}

	const countryEntity = await getEntity(countryId);
	const spanishDemonyms = getMonolingualTexts(countryEntity, 'P1549', 'es');
	const picked = pickGenderedNationality(spanishDemonyms, genderEntityId);
	if (picked) {
		return capitalizeWord(picked);
	}

	const label =
		countryEntity?.labels?.es?.value ||
		countryEntity?.labels?.en?.value ||
		countryEntity?.labels?.fr?.value ||
		null;
	return label ? capitalizeWord(label) : null;
}

function getStringClaim(entity, propertyId) {
	for (const claim of getClaimValues(entity, propertyId)) {
		const value = claim?.mainsnak?.datavalue?.value;
		if (typeof value === 'string' && value.trim()) {
			return value.trim();
		}
	}
	return null;
}

function getWikidataEntityIdFromReferenceUrls(referenceUrls = []) {
	let matchId = null;
	for (const url of referenceUrls) {
		const match = String(url).match(/wikidata\.org\/wiki\/(Q\d+)/i);
		if (match) {
			matchId = match[1];
		}
	}

	return matchId;
}

function isHumanEntity(entity) {
	return getEntityIdsFromClaims(entity, 'P31').includes(HUMAN_ENTITY_ID);
}

function isFilmEntity(entity) {
	const instanceIds = new Set(getEntityIdsFromClaims(entity, 'P31'));
	return instanceIds.has('Q11424') || instanceIds.has('Q24869') || instanceIds.has('Q202866');
}

function getEntityTitleKeys(entity) {
	const titleKeys = new Set();

	for (const label of Object.values(entity?.labels ?? {})) {
		if (typeof label?.value === 'string' && label.value.trim()) {
			titleKeys.add(normalizeTitleKey(label.value));
		}
	}

	for (const aliasGroup of Object.values(entity?.aliases ?? {})) {
		for (const alias of aliasGroup ?? []) {
			if (typeof alias?.value === 'string' && alias.value.trim()) {
				titleKeys.add(normalizeTitleKey(alias.value));
			}
		}
	}

	return titleKeys;
}

async function resolveMovieEntity(movie) {
	const variants = buildTitleVariants(movie);
	const variantKeys = new Set(variants.map((variant) => normalizeTitleKey(variant)));

	for (const variant of variants) {
		for (const language of ['en', 'es']) {
			const searchResults = await searchEntities(variant, language);

			for (const result of searchResults) {
				if (!result?.id) {
					continue;
				}

				const entity = await getEntity(result.id);
				if (!entity || !isFilmEntity(entity)) {
					continue;
				}

				if (getMovieYear(entity) !== movie.year) {
					continue;
				}

				const entityTitleKeys = getEntityTitleKeys(entity);
				const hasExactTitleMatch = Array.from(variantKeys).some((variantKey) => entityTitleKeys.has(variantKey));
				if (hasExactTitleMatch) {
					return entity;
				}
			}
		}
	}

	return null;
}

function getEntityNameKeys(entity) {
	const nameKeys = new Set();

	for (const label of Object.values(entity?.labels ?? {})) {
		if (typeof label?.value === 'string' && label.value.trim()) {
			nameKeys.add(normalizeKey(label.value));
		}
	}

	for (const aliasGroup of Object.values(entity?.aliases ?? {})) {
		for (const alias of aliasGroup ?? []) {
			if (typeof alias?.value === 'string' && alias.value.trim()) {
				nameKeys.add(normalizeKey(alias.value));
			}
		}
	}

	return nameKeys;
}

function isLikelyEntertainmentSearchResult(result) {
	const description = normalizeKey(result?.description ?? '');
	if (!description) {
		return false;
	}

	return ENTERTAINMENT_DESCRIPTION_TOKENS.some((token) => description.includes(token));
}

function hasImplausibleLifeData(person) {
	if (!person?.birthYear) {
		return false;
	}

	if (person.deathYear && person.deathYear < person.birthYear) {
		return true;
	}

	if (!person.deathYear && CURRENT_YEAR - person.birthYear > 105) {
		return true;
	}

	return person.birthYear < 1850;
}

function isSuspiciousRemoteImageUrl(remoteImageUrl) {
	const normalizedUrl = normalizeKey(remoteImageUrl ?? '');
	return SUSPICIOUS_PORTRAIT_TOKENS.some((token) => normalizedUrl.includes(token));
}

function hasSuspiciousPortrait(person) {
	const source = normalizeKey(person?.source ?? '');

	if (SUSPICIOUS_PORTRAIT_SOURCE_TOKENS.some((token) => source.includes(token))) {
		return true;
	}

	return isSuspiciousRemoteImageUrl(person?.remoteImageUrl);
}

function hasTraceableProfile(person) {
	if (typeof person?.imdbUrl === 'string' && /https?:\/\/(?:www\.)?imdb\.com\/name\/nm\d+\/?/i.test(person.imdbUrl)) {
		return true;
	}

	if (!Array.isArray(person?.referenceUrls)) {
		return false;
	}

	return person.referenceUrls.some(
		(entry) =>
			typeof entry === 'string' &&
			/(?:wikidata\.org\/wiki\/Q\d+|themoviedb\.org\/person\/|watch\.plex\.tv\/person\/|anime-planet\.com\/people\/|screendollars\.com\/celebrity\/)/i.test(entry),
	);
}

async function resolvePersonByName(name, existingEntry) {
	const normalizedName = normalizeKey(name);
	let bestMatch = null;
	let bestScore = Number.NEGATIVE_INFINITY;

	for (const language of ['en', 'es']) {
		const searchResults = await searchEntities(name, language);
		for (const result of searchResults) {
			if (!result?.id) {
				continue;
			}

			const entity = await getEntity(result.id);
			if (!entity || !isHumanEntity(entity)) {
				continue;
			}

			if (!getEntityNameKeys(entity).has(normalizedName)) {
				continue;
			}

			const imdbId = getStringClaim(entity, 'P345');
			const birthYear = getBirthYear(entity);
			const deathYear = getDeathYear(entity);
			let score = 0;

			if (normalizeKey(getEntityDisplayName(entity, name)) === normalizedName) {
				score += 12;
			}
			if (isLikelyEntertainmentSearchResult(result)) {
				score += 20;
			}
			if (imdbId) {
				score += 12;
			}
			if (getStringClaim(entity, 'P18')) {
				score += 4;
			}
			if (getIsoDateClaim(entity, 'P569')) {
				score += 3;
			}
			if (existingEntry?.imdbId && imdbId === existingEntry.imdbId) {
				score += 80;
			}
			if (existingEntry?.birthYear && birthYear === existingEntry.birthYear) {
				score += 25;
			}
			if (existingEntry?.deathYear && deathYear === existingEntry.deathYear) {
				score += 15;
			}
			if (birthYear && birthYear < 1850) {
				score -= 80;
			}
			if (birthYear && !deathYear && CURRENT_YEAR - birthYear > 105) {
				score -= 60;
			}
			if (!isLikelyEntertainmentSearchResult(result) && !imdbId) {
				score -= 12;
			}

			if (score > bestScore) {
				bestScore = score;
				bestMatch = entity;
			}
		}
	}

	return bestScore > -20 ? bestMatch : null;
}

async function resolvePeopleForMovie(movie) {
	const movieEntity = await resolveMovieEntity(movie);
	const credits = [
		...splitCreditNames(movie.director),
		...(Array.isArray(movie.mainCast) ? movie.mainCast.flatMap((entry) => splitCreditNames(entry)) : []),
	];
	const uniqueNames = Array.from(new Set(credits));
	const resolved = new Map();

	const entityIds = movieEntity
		? [
				...getEntityIdsFromClaims(movieEntity, 'P57'),
				...getEntityIdsFromClaims(movieEntity, 'P161'),
			]
		: [];

	const entityPool = await Promise.all(entityIds.map((entityId) => getEntity(entityId)));

	for (const creditName of uniqueNames) {
		const normalizedCreditName = normalizeKey(creditName);
		let matchedEntity =
			entityPool.find((entity) => entity && getEntityNameKeys(entity).has(normalizedCreditName)) ?? null;

		if (!matchedEntity) {
			matchedEntity = await resolvePersonByName(creditName);
		}

		if (!matchedEntity) {
			continue;
		}

		resolved.set(creditName, matchedEntity);
	}

	return {
		movieEntity,
		resolved,
	};
}

function getEntityDisplayName(entity, fallbackName) {
	return (
		entity?.labels?.en?.value ||
		entity?.labels?.es?.value ||
		entity?.labels?.fr?.value ||
		fallbackName
	);
}

function getRemoteImageUrl(fileName) {
	if (!fileName) {
		return undefined;
	}
	return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=${IMAGE_WIDTH}`;
}

async function fetchTmdbPersonFallback(name) {
	const searchUrl = `https://www.themoviedb.org/search?query=${encodeURIComponent(name)}`;
	await throttleNetwork();
	const searchResponse = await fetch(searchUrl, {
		headers: {
			'user-agent': USER_AGENT,
		},
	});

	if (!searchResponse.ok) {
		return null;
	}

	const searchHtml = await searchResponse.text();
	const candidateUrls = Array.from(
		new Set(
			[...searchHtml.matchAll(/href="(\/person\/\d+-[^"]+)"/g)]
				.map((match) => match[1])
				.filter(Boolean),
		),
	)
		.slice(0, 5)
		.map((value) => new URL(value, 'https://www.themoviedb.org').toString());

	for (const candidateUrl of candidateUrls) {
		await throttleNetwork();
		const pageResponse = await fetch(candidateUrl, {
			headers: {
				'user-agent': USER_AGENT,
			},
		});

		if (!pageResponse.ok) {
			continue;
		}

		const html = await pageResponse.text();
		const title = html.match(/<title>([^<]+)<\/title>/i)?.[1] ?? '';
		const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/i)?.[1] ?? '';
		const metaDescription = html.match(/<meta name="description" content="([^"]+)"/i)?.[1] ?? '';
		const hasNameMatch = [title, ogTitle, metaDescription].some((value) =>
			normalizeKey(value).includes(normalizeKey(name)),
		);
		if (!hasNameMatch && candidateUrls.length !== 1) {
			continue;
		}

		const imageUrl = html.match(/<meta property="og:image" content="([^"]+)"/i)?.[1];
		if (imageUrl) {
			return {
				imageUrl,
				referenceUrl: candidateUrl,
			};
		}
	}

	return null;
}

async function fetchPlexPersonFallback(name) {
	const candidateUrl = `https://watch.plex.tv/person/${slugify(name)}`;
	await throttleNetwork();
	const response = await fetch(candidateUrl, {
		headers: {
			'user-agent': USER_AGENT,
		},
	});

	if (!response.ok) {
		return null;
	}

	const html = await response.text();
	const title = html.match(/<title>([^<]+)<\/title>/i)?.[1] ?? '';
	const hasNameMatch = normalizeKey(title).includes(normalizeKey(name));
	if (!hasNameMatch) {
		return null;
	}

	const rawImageUrl = html.match(/<meta property="og:image" content="([^"]+)"/i)?.[1];
	if (!rawImageUrl) {
		return null;
	}

	const imageUrl = rawImageUrl.replace(/&amp;/g, '&');
	if (imageUrl.includes('watch-social-share')) {
		return null;
	}

	return {
		imageUrl,
		referenceUrl: candidateUrl,
	};
}

function inferExtension(url, contentType) {
	const pathname = new URL(url).pathname;
	const rawExtension = path.extname(pathname).toLowerCase();
	if (rawExtension) {
		return rawExtension;
	}

	if (contentType?.includes('png')) return '.png';
	if (contentType?.includes('webp')) return '.webp';
	if (contentType?.includes('jpeg') || contentType?.includes('jpg')) return '.jpg';
	return '.img';
}

async function downloadPersonImage(name, imdbId, remoteImageUrl) {
	if (!remoteImageUrl) {
		return undefined;
	}

	await mkdir(PEOPLE_PUBLIC_DIR, { recursive: true });
	let response;
	for (let attempt = 1; attempt <= 5; attempt += 1) {
		await throttleNetwork();
		response = await fetch(remoteImageUrl, {
			headers: {
				'user-agent': USER_AGENT,
			},
		});

		if (response.ok) {
			break;
		}

		if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 5) {
			throw new Error(`Image download failed with ${response.status}: ${remoteImageUrl}`);
		}

		const retryAfter = Number.parseInt(response.headers.get('retry-after') ?? '', 10);
		const waitMs = Number.isInteger(retryAfter)
			? retryAfter * 1000
			: Math.max(RETRY_BASE_MS * attempt, attempt * 3000);
		await sleep(waitMs);
	}

	const finalUrl = response.url || remoteImageUrl;
	const extension = inferExtension(finalUrl, response.headers.get('content-type'));
	const fileBase = imdbId ? `${slugify(name)}-${imdbId}` : slugify(name);
	const fileName = `${fileBase}${extension}`;
	const filePath = path.join(PEOPLE_PUBLIC_DIR, fileName);
	const bytes = Buffer.from(await response.arrayBuffer());
	await writeFile(filePath, bytes);
	return `/people/${fileName}`;
}

async function fileExists(filePath) {
	try {
		const fileStats = await stat(filePath);
		return fileStats.isFile();
	} catch {
		return false;
	}
}

async function loadMovies(movieSlugs) {
	const fileNames = (await readdir(MOVIES_DIR))
		.filter((fileName) => fileName.endsWith('.json'))
		.sort((left, right) => left.localeCompare(right, 'es'));
	const selected = [];

	for (const fileName of fileNames) {
		const filePath = path.join(MOVIES_DIR, fileName);
		const movie = JSON.parse(await readFile(filePath, 'utf8'));
		if (movieSlugs.length > 0 && !movieSlugs.includes(movie.slug)) {
			continue;
		}
		selected.push(movie);
	}

	return selected;
}

async function collectCatalogPeopleNames(movieSlugs = []) {
	const movies = await loadMovies(movieSlugs);
	const names = new Set();

	for (const movie of movies) {
		for (const name of [
			...splitCreditNames(movie.director),
			...(Array.isArray(movie.mainCast) ? movie.mainCast.flatMap((entry) => splitCreditNames(entry)) : []),
		]) {
			names.add(name);
		}
	}

	return Array.from(names).sort((left, right) => left.localeCompare(right, 'es'));
}

async function loadPeopleCatalog() {
	try {
		return JSON.parse(await readFile(PEOPLE_CATALOG_PATH, 'utf8'));
	} catch {
		return {};
	}
}

function needsEnrichment(existing) {
	return (
		!existing?.image ||
		(!existing?.birthDate && !existing?.birthYear) ||
		!existing?.nationalityPrimary ||
		!hasTraceableProfile(existing) ||
		hasSuspiciousPortrait(existing) ||
		(Number.isInteger(existing?.birthYear) &&
			!Number.isInteger(existing?.deathYear) &&
			CURRENT_YEAR - existing.birthYear > 100) ||
		hasImplausibleLifeData(existing)
	);
}

async function enrichPersonRecord(personName, catalog, catalogIndex, stats, resolvedEntity) {
	const existingEntry = getCatalogEntry(catalog, catalogIndex, personName);
	const existingEntityId = getWikidataEntityIdFromReferenceUrls(existingEntry?.referenceUrls);
	let entity = resolvedEntity ?? null;

	if (!entity && existingEntry && !hasImplausibleLifeData(existingEntry)) {
		const existingEntityId = getWikidataEntityIdFromReferenceUrls(existingEntry.referenceUrls);
		if (existingEntityId && !hasSuspiciousPortrait(existingEntry)) {
			const existingEntity = await getEntity(existingEntityId);
			const existingEntityImdbId = getStringClaim(existingEntity, 'P345');
			const imdbAligned =
				!existingEntry?.imdbId || (existingEntityImdbId && existingEntityImdbId === existingEntry.imdbId);
			if (existingEntity && isHumanEntity(existingEntity) && imdbAligned) {
				entity = existingEntity;
			}
		}
	}

	if (!entity) {
		entity = await resolvePersonByName(personName, existingEntry);
	}

	if (!entity) {
		stats.missing.push({ movie: 'people-pool', name: personName });
		return false;
	}

	const shouldResetLegacyIdentity = existingEntityId && entity.id && existingEntityId !== entity.id;
	const shouldResetLegacyDates =
		hasImplausibleLifeData(existingEntry) || (existingEntityId && entity.id && existingEntityId !== entity.id);
	const safeExistingBirthDate = shouldResetLegacyDates ? undefined : existingEntry?.birthDate;
	const safeExistingBirthYear = shouldResetLegacyDates ? undefined : existingEntry?.birthYear;
	const safeExistingDeathDate = shouldResetLegacyDates ? undefined : existingEntry?.deathDate;
	const safeExistingDeathYear = shouldResetLegacyDates ? undefined : existingEntry?.deathYear;
	const birthDate = getIsoDateClaim(entity, 'P569') ?? safeExistingBirthDate;
	const birthYear = getBirthYear(entity);
	const deathDate = getIsoDateClaim(entity, 'P570') ?? safeExistingDeathDate;
	const deathYear = getDeathYear(entity);
	const nationalityPrimary = await getPrimaryNationality(entity);
	const imdbId = getStringClaim(entity, 'P345') ?? existingEntry?.imdbId ?? undefined;
	const wikidataRemoteImageUrl = getRemoteImageUrl(getStringClaim(entity, 'P18'));
	const safeWikidataRemoteImageUrl = isSuspiciousRemoteImageUrl(wikidataRemoteImageUrl)
		? undefined
		: wikidataRemoteImageUrl;
	const shouldRefreshPortrait =
		shouldResetLegacyIdentity ||
		hasSuspiciousPortrait(existingEntry) ||
		!existingEntry?.image ||
		!(await fileExists(path.resolve(`public${existingEntry?.image ?? ''}`)));
	const tmdbFallback =
		!safeWikidataRemoteImageUrl || !birthDate || shouldRefreshPortrait
			? await fetchTmdbPersonFallback(personName)
			: null;
	const plexFallback =
		!safeWikidataRemoteImageUrl && !tmdbFallback?.imageUrl ? await fetchPlexPersonFallback(personName) : null;
	const safeExistingRemoteImageUrl = shouldResetLegacyIdentity ? undefined : existingEntry?.remoteImageUrl;
	const remoteImageUrl =
		safeWikidataRemoteImageUrl ??
		tmdbFallback?.imageUrl ??
		plexFallback?.imageUrl ??
		safeExistingRemoteImageUrl;
	let localImage =
		hasSuspiciousPortrait(existingEntry) || shouldResetLegacyIdentity ? undefined : existingEntry?.image;

	if (remoteImageUrl && (!localImage || shouldRefreshPortrait || remoteImageUrl !== existingEntry?.remoteImageUrl)) {
		try {
			localImage = await downloadPersonImage(personName, imdbId, remoteImageUrl);
		} catch (error) {
			console.log(`Image download failed for ${personName}: ${error.message}`);
		}
	}

	setCatalogEntry(catalog, catalogIndex, personName, {
		name: getEntityDisplayName(entity, personName),
		birthDate,
		birthYear: birthYear ?? safeExistingBirthYear ?? (birthDate ? Number.parseInt(birthDate.slice(0, 4), 10) : undefined),
		deathDate,
		deathYear: deathYear ?? safeExistingDeathYear ?? (deathDate ? Number.parseInt(deathDate.slice(0, 4), 10) : undefined),
		nationalityPrimary: nationalityPrimary ?? existingEntry?.nationalityPrimary,
		image: localImage,
		imdbId,
		imdbUrl: imdbId ? `https://www.imdb.com/name/${imdbId}/` : existingEntry?.imdbUrl,
		remoteImageUrl,
		referenceUrls: mergeReferenceUrls(
			existingEntry?.referenceUrls,
			[`https://www.wikidata.org/wiki/${entity.id}`],
			imdbId ? [`https://www.imdb.com/name/${imdbId}/`] : [],
			tmdbFallback?.referenceUrl ? [tmdbFallback.referenceUrl] : [],
			plexFallback?.referenceUrl ? [plexFallback.referenceUrl] : [],
		),
		lastVerifiedAt: VERIFIED_DATE,
		notes: existingEntry?.notes,
		source: plexFallback?.imageUrl
			? 'wikidata-imdb-plex-cache'
			: remoteImageUrl === safeWikidataRemoteImageUrl
				? 'wikidata-imdb-cache'
				: 'wikidata-imdb-tmdb-cache',
	});

	stats.updated += 1;
	return true;
}

async function runWorker(queue, catalog, catalogIndex, stats, missingOnly) {
	for (;;) {
		const movie = queue.shift();
		if (!movie) {
			return;
		}

		const creditNames = [
			...splitCreditNames(movie.director),
			...(Array.isArray(movie.mainCast) ? movie.mainCast.flatMap((entry) => splitCreditNames(entry)) : []),
		];
		const targetNames = Array.from(new Set(creditNames)).filter((name) => {
			if (!missingOnly) {
				return true;
			}

			const existing = getCatalogEntry(catalog, catalogIndex, name);
			return needsEnrichment(existing);
		});

		if (targetNames.length === 0) {
			console.log(`Skipped ${movie.slug}: no missing people.`);
			continue;
		}

		let movieEntity;
		let resolved;
		try {
			const result = await resolvePeopleForMovie(movie);
			movieEntity = result.movieEntity;
			resolved = result.resolved;
		} catch (error) {
			stats.failures.push({ movie: movie.slug, reason: error.message });
			console.log(`Failed ${movie.slug}: ${error.message}`);
			continue;
		}
		if (!movieEntity) {
			console.log(`No movie entity match for ${movie.slug}.`);
		}

		for (const personName of targetNames) {
			const entity = resolved.get(personName);
			if (!entity) {
				stats.missing.push({ movie: movie.slug, name: personName });
				continue;
			}

			await enrichPersonRecord(personName, catalog, catalogIndex, stats, entity);
		}

		await saveCatalog(catalog);
		console.log(`Processed ${movie.slug}: ${targetNames.length} people.`);
	}
}

async function main() {
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

	const movieSlugs = Array.from(new Set(args.movies.filter(Boolean)));
	const explicitPeople = Array.from(new Set(args.people.filter(Boolean)));
	if (!args.all && !args.missingPeopleOnly && movieSlugs.length === 0 && explicitPeople.length === 0) {
		args.all = true;
	}

	const catalog = await loadPeopleCatalog();
	const catalogIndex = buildCatalogIndex(catalog);
	const stats = {
		updated: 0,
		missing: [],
		failures: [],
	};

	if (args.missingPeopleOnly || explicitPeople.length > 0) {
		let peopleNames =
			explicitPeople.length > 0 ? explicitPeople : await collectCatalogPeopleNames(movieSlugs);

		if (args.missingPeopleOnly) {
			peopleNames = peopleNames.filter((name) => needsEnrichment(getCatalogEntry(catalog, catalogIndex, name)));
		}

		if (peopleNames.length === 0) {
			throw new Error('No matching people found to enrich.');
		}

		if (Number.isInteger(args.limit) && args.limit > 0) {
			const offset = Number.isInteger(args.offset) && args.offset > 0 ? args.offset : 0;
			peopleNames = peopleNames.slice(offset, offset + args.limit);
		} else if (Number.isInteger(args.offset) && args.offset > 0) {
			peopleNames = peopleNames.slice(args.offset);
		}

		for (const personName of peopleNames) {
			try {
				await enrichPersonRecord(personName, catalog, catalogIndex, stats);
			} catch (error) {
				stats.failures.push({ movie: personName, reason: error.message });
				console.log(`Failed ${personName}: ${error.message}`);
			}
			await saveCatalog(catalog);
		}
	} else {
		let movies = await loadMovies(movieSlugs);
		if (movies.length === 0) {
			throw new Error('No matching movies found to enrich.');
		}

		if (Number.isInteger(args.limit) && args.limit > 0) {
			const offset = Number.isInteger(args.offset) && args.offset > 0 ? args.offset : 0;
			movies = movies.slice(offset, offset + args.limit);
		} else if (Number.isInteger(args.offset) && args.offset > 0) {
			movies = movies.slice(args.offset);
		}

		const queue = [...movies];
		await Promise.all(
			Array.from({ length: CONCURRENCY }).map(() =>
				runWorker(queue, catalog, catalogIndex, stats, args.missingOnly),
			),
		);
		await saveCatalog(catalog);
	}

	console.log(`People updated: ${stats.updated}`);
	console.log(`Missing people: ${stats.missing.length}`);
	console.log(`Failed movies: ${stats.failures.length}`);
	if (stats.missing.length > 0) {
		console.log(stats.missing.slice(0, 40).map((entry) => `${entry.movie}:${entry.name}`).join(', '));
	}
	if (stats.failures.length > 0) {
		console.log(stats.failures.slice(0, 20).map((entry) => `${entry.movie}:${entry.reason}`).join(', '));
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
