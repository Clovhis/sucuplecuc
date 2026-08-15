#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const { spawnSync } = require('child_process');

const DEFAULT_ROOT = 'src/data/movies';
const DEFAULT_BASE_REF = 'main';
const PEOPLE_CATALOG_PATH = path.resolve('src/data/people.json');
const PERSON_PROFILE_CATALOG_PATH = path.resolve('docs/person-profile-catalog-reference.md');
const PEOPLE_PUBLIC_ROOT = path.resolve('public');
const ALLOWED_PLATFORMS = new Set([
	'Netflix',
	'HBO Max',
	'Paramount Plus',
	'Apple TV',
	'Cine',
	'CINE.AR',
	'Prime Video',
	'Disney Plus',
	'Mercado Play',
	'Crunchyroll',
	'DGO',
	'Otras plataformas',
]);
const ALLOWED_VERDICTS = new Set(['recomendada', 'zafa', 'no_recomendada', 'basura_atomica']);
const ALLOWED_AWARDS = new Set(['oscar', 'grammy', 'cannes']);
const CANONICAL_SUBGENRE_DEFINITIONS = [
	{ id: 'gore', label: 'Gore', matchers: ['gore', 'splatter'] },
	{ id: 'found-footage', label: 'Found Footage', matchers: ['found footage', 'found-footage'] },
	{ id: 'slasher', label: 'Slasher', matchers: ['slasher'] },
	{ id: 'romcom', label: 'RomCom', matchers: ['romcom', 'rom-com', 'rom com', 'comedia romantica', 'romantic comedy'] },
	{ id: 'body-horror', label: 'Body Horror', matchers: ['body horror', 'terror corporal', 'horror corporal'] },
	{ id: 'psychological', label: 'Psicológico', matchers: ['psychological', 'psicologico', 'psicologica'] },
	{ id: 'supernatural', label: 'Sobrenatural', matchers: ['supernatural', 'sobrenatural'] },
	{ id: 'heist', label: 'Heist', matchers: ['heist'] },
	{ id: 'road-movie', label: 'Road Movie', matchers: ['road movie', 'road-movie'] },
	{ id: 'coming-of-age', label: 'Coming of Age', matchers: ['coming of age', 'coming-of-age'] },
	{ id: 'mockumentary', label: 'Mockumentary', matchers: ['mockumentary', 'falso documental'] },
	{ id: 'exploitation', label: 'Exploitation', matchers: ['exploitation'] },
];
const GENERIC_SUBGENRE_TOKENS = new Set([
	'accion',
	'action',
	'aventura',
	'adventure',
	'anime',
	'animacion',
	'animation',
	'comedia',
	'comedy',
	'crimen',
	'crime',
	'documental',
	'documentary',
	'drama',
	'fantasia',
	'fantasy',
	'horror',
	'romance',
	'romantica',
	'sci fi',
	'sci-fi',
	'scifi',
	'science fiction',
	'superheroes',
	'superhero',
	'suspenso',
	'terror',
	'thriller',
]);
const MAX_VERDICT_LABEL_LENGTH = 21;
const AUDIENCE_RATING_PATTERN = /^(ATP|\+\d{1,2})$/;
const CURRENT_YEAR = new Date().getUTCFullYear();
const HTML_ENTITY_PATTERN = /&(?:#x?[0-9a-f]+|amp|quot|lt|gt|nbsp);/i;
const SCRAPE_ARTIFACT_PATTERN = /\[\s*,?\s*[0-9a-z]+\s*,?\s*\]/i;
const FORBIDDEN_POSTER_URL_PATTERN =
	/(?:^https?:\/\/(?:i\.ytimg\.com|img\.youtube\.com)\/|\/vi\/[a-z0-9_-]+\/(?:hqdefault|mqdefault|sddefault|maxresdefault)\.(?:jpg|webp|avif|png)|(?:hqdefault|mqdefault|sddefault|maxresdefault)\.(?:jpg|webp|avif|png))/i;
const HORIZONTAL_POSTER_PATH_PATTERN = /\/(?:backdrop|still|screenshot|thumbnail)\//i;
const MAX_REVIEW_AUDIT_BATCH_SIZE = 100;
const SUPERHERO_INCLUDE_TOKENS = [
	'ant-man', 'aquaman', 'avengers', 'batman', 'batgirl', 'batman v superman', 'birds of prey', 'black adam', 'black panther', 'black widow', 'blade', 'blue beetle', 'captain america', 'captain marvel', 'daredevil', 'deadpool', 'doctor strange', 'elektra', 'eternals', 'fantastic four', 'ghost rider', 'green lantern', 'guardians of the galaxy', 'howard the duck', 'hulk', 'iron man', 'justice league', 'kraven', 'madame web', 'man of steel', 'morbius', 'punisher', 'shang-chi', 'shazam', 'spider-man', 'suicide squad', 'supergirl', 'superman', 'the avengers', 'the flash', 'the incredible hulk', 'the marvels', 'thunderbolts', 'thor', 'venom', 'watchmen', 'wolverine', 'wonder woman', 'x-men', 'zack snyders justice league',
];
const SUPERHERO_EXCLUDE_TOKENS = ['big hero 6', 'into the spider-verse', 'across the spider-verse', 'spider-verse', 'mario', 'blade runner'];
const SUPERHERO_INCLUDED_SLUGS = new Set(['catwoman-2004', 'constantine-2005', 'dark-phoenix-2019', 'jonah-hex-2010', 'logan-2017', 'the-dark-knight-2008', 'the-dark-knight-rises-2012', 'the-new-mutants-2020']);
const RECOMMENDED_LABEL_PATTERNS = [
	'recomendada',
	'esta buena',
	'muy buena',
	'imperdible',
	'esta muy bien',
	'buenisima',
	'garpa',
	'buena',
	'legendaria',
	'obra maestra',
	'clasico total',
];
const PASSABLE_LABEL_PATTERNS = [
	'pasable',
	'zafa',
	'esta ok',
	'se deja ver',
	'cumple',
	'mas o menos',
];
const NEGATIVE_LABEL_PATTERNS = [
	'no la mires',
	'mala',
	'malisima',
	'es una verga',
	'un garron',
	'flojisima',
	'no va',
	'plomazo',
	'aburrida',
	'muy floja',
	'se cae',
	'basura total',
	'ni la pongas',
	'horrible',
	'desastre',
	'todo mal',
];
const FORBIDDEN_REVIEW_SITE_REFERENCES = [
	'rotten tomatoes',
	'rotten',
	'metacritic',
	'imdb',
	'letterboxd',
	'filmaffinity',
	'sensacine',
	'tomatazos',
];
const DISALLOWED_SHARE_FIELDS = [
	'share',
	'shareUrl',
	'shareText',
	'shareLinks',
	'social',
	'socialLinks',
	'whatsapp',
	'whatsappUrl',
	'xShare',
	'xShareUrl',
	'twitter',
	'twitterUrl',
	'instagram',
	'instagramUrl',
	'tiktok',
	'tiktokUrl',
	'copyUrl',
	'canonicalUrl',
];
const DISALLOWED_REACTION_FIELDS = [
	'reaction',
	'reactionSlug',
	'reactionImage',
	'reactionCopy',
	'teamReaction',
	'teamReactionSlug',
	'teamReactionImage',
];
const REACTION_BY_VERDICT = {
	recomendada: { label: 'Mirala', kind: 'up' },
	zafa: { label: 'Zafa', kind: 'meh' },
	no_recomendada: { label: 'Mejor pasá', kind: 'down' },
	basura_atomica: { label: 'Ni te gastes', kind: 'down' },
};
const OPAQUE_VERDICT_LABEL_TOKENS = [
	'seca',
	'calida',
	'visceral',
	'noble',
	'turbia',
	'suelta',
	'pura',
	'moderna',
	'clasica',
	'noir',
	'epica',
	'oscura',
	'de autor',
	'de culto',
	'de peso',
	'de pulso',
	'de golpe',
	'de riesgo',
	'de viaje',
	'de trauma',
	'luminosa',
	'juguetona',
	'salvaje',
	'retorcida',
	'directa',
	'macabra',
	'brava',
	'mental',
	'argenta',
	'japo',
	'noventera',
	'ochentosa',
	'dosmilera',
	'actual',
];
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
const LEGENDARY_LABEL_PATTERNS = ['legendaria', 'obra maestra', 'clasico total'];
const TRUSTED_PERSON_IMAGE_HOSTS = new Set([
	'commons.wikimedia.org',
	'images.plex.tv',
	'media.themoviedb.org',
	'metadata-static.plex.tv',
	'api.screendollars.com',
	'images.squarespace-cdn.com',
	's3-eu-west-1.amazonaws.com',
	'firstwind.co.jp',
	'swallow-p.com',
	'tn.com.ar',
	'cdn.milenio.com',
	'i.guim.co.uk',
	'www.sonypicturesanimation.com',
	'sonypicturesanimation.com',
]);
const SUSPICIOUS_PERSON_IMAGE_HOSTS = new Set(['static.wixstatic.com']);
const SUSPICIOUS_PERSON_IMAGE_TOKENS = ['logo', 'favicon', 'placeholder', 'default-avatar', 'default_profile', 'no-image', 'site-icon'];
const ARGENTINA_TITLE_SIGNAL_TOKENS = new Set([
	'el',
	'la',
	'los',
	'las',
	'un',
	'una',
	'unos',
	'unas',
	'del',
	'de',
	'al',
	'y',
	'en',
	'para',
	'con',
	'sin',
]);

function parseArgs(argv) {
	const args = {
		root: DEFAULT_ROOT,
		baseRef: DEFAULT_BASE_REF,
		candidates: [],
		recent: false,
		format: 'text',
		skipYoutube: false,
		verifyCommunityBuild: false,
		verifyReactionBuild: false,
		verifyCinemaCarouselBuild: false,
		verifyStreamingCarouselBuild: false,
	};

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === '--root') {
			args.root = argv[++index];
		} else if (arg === '--base-ref') {
			args.baseRef = argv[++index];
		} else if (arg === '--candidate') {
			args.candidates.push(argv[++index]);
		} else if (arg === '--recent') {
			args.recent = true;
		} else if (arg === '--format') {
			args.format = argv[++index];
		} else if (arg === '--skip-youtube') {
			args.skipYoutube = true;
		} else if (arg === '--verify-community-build') {
			args.verifyCommunityBuild = true;
		} else if (arg === '--verify-reaction-build') {
			args.verifyReactionBuild = true;
		} else if (arg === '--verify-cinema-carousel-build') {
			args.verifyCinemaCarouselBuild = true;
		} else if (arg === '--verify-streaming-carousel-build') {
			args.verifyStreamingCarouselBuild = true;
		} else if (arg === '--all') {
			args.all = true;
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
			'  node audit_recent_movies.cjs --base-ref main --recent',
			'  node audit_recent_movies.cjs --candidate src/data/movies/foo-2024.json --candidate src/data/movies/bar-2025.json',
			'',
			'Options:',
			'  --root <dir>         Movie directory. Default: src/data/movies',
			'  --base-ref <ref>     Git base ref for recent diff. Default: main',
			'  --candidate <path>   Explicit candidate movie file. Repeat for batch mode.',
			'  --recent             Audit files added/modified in <base-ref>...HEAD under movie root.',
			'  --all                Audit every movie JSON file under the root directory.',
			'  --format <type>      text | json. Default: text',
			'  --skip-youtube       Skip YouTube oEmbed checks.',
			'  --verify-community-build  Require the built per-movie Comunidad route in dist/.',
			'  --verify-reaction-build   Require the verdict-derived reaction panel in the built detail route.',
			'  --verify-cinema-carousel-build  Require eligible current Cine entries in the homepage trailer carousel.',
			'  --verify-streaming-carousel-build  Require eligible current streaming entries in the homepage trailer carousel.',
		].join('\n'),
	);
}

function normalizeText(value) {
	return String(value || '')
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^\p{L}\p{N}\s]/gu, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function normalizePersonKey(value) {
	return String(value || '')
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^\p{L}\p{N}\s']/gu, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function splitCreditNames(value) {
	return String(value || '')
		.replace(/\s+/g, ' ')
		.trim()
		.split(/\s*,\s*|\s+y\s+/i)
		.map((entry) => entry.trim())
		.filter(Boolean);
}

function cleanTaxonomyList(values) {
	return Array.isArray(values)
		? values.map((value) => (typeof value === 'string' ? value.trim() : '')).filter(Boolean)
		: [];
}

function splitTaxonomyFragments(value) {
	return String(value || '')
		.split(/[,/|]/g)
		.map((fragment) => fragment.trim())
		.filter(Boolean);
}

function getCanonicalSubgenreDefinition(value) {
	const normalized = normalizeText(value).replace(/\s+/g, ' ');
	if (!normalized) {
		return null;
	}

	return (
		CANONICAL_SUBGENRE_DEFINITIONS.find((definition) =>
			definition.matchers.some((matcher) => normalized.includes(matcher)),
		) || null
	);
}

function collectCanonicalSubgenreDefinitions(values) {
	const definitions = new Map();

	for (const value of values) {
		for (const fragment of new Set([value, ...splitTaxonomyFragments(value)])) {
			const definition = getCanonicalSubgenreDefinition(fragment);
			if (definition) {
				definitions.set(definition.id, definition);
			}
		}
	}

	return definitions;
}

function getHostname(value) {
	try {
		return new URL(String(value || '')).hostname.toLowerCase();
	} catch {
		return '';
	}
}

function isSuspiciousPersonImageUrl(value) {
	const normalized = String(value || '').toLowerCase();
	if (!normalized) {
		return false;
	}

	return SUSPICIOUS_PERSON_IMAGE_TOKENS.some((token) => normalized.includes(token));
}

function getUrlBasenameSlug(value) {
	try {
		const pathname = new URL(String(value || '')).pathname;
		const parsed = path.posix.basename(pathname);
		if (!parsed) {
			return '';
		}

		return parsed.replace(/\.[a-z0-9]+$/i, '');
	} catch {
		return '';
	}
}

function countSharedLongTokens(left, right) {
	const rightText = normalizeText(right);
	return normalizeText(left)
		.split(' ')
		.filter((token) => token.length >= 4)
		.filter((token) => rightText.includes(token)).length;
}

function detectArgentinaTitleDrift(movie) {
	const posterHost = getHostname(movie.poster);
	if (!/justwatch\.com$/i.test(posterHost) && !/justwatch\.com$/i.test(posterHost.replace(/^images\./, ''))) {
		return null;
	}

	if (normalizeText(movie.title) !== normalizeText(movie.originalTitle)) {
		return null;
	}

	const posterSlug = getUrlBasenameSlug(movie.poster);
	const normalizedPosterSlug = normalizeText(posterSlug);
	const normalizedTitle = normalizeText(movie.title);
	const normalizedOriginalTitle = normalizeText(movie.originalTitle);
	if (!normalizedPosterSlug || normalizedPosterSlug === normalizedTitle || normalizedPosterSlug === normalizedOriginalTitle) {
		return null;
	}

	const posterTokens = normalizedPosterSlug.split(' ').filter((token) => token.length >= 3);
	if (posterTokens.length < 2) {
		return null;
	}

	const sharedWithTitle = countSharedLongTokens(normalizedPosterSlug, normalizedTitle);
	if (sharedWithTitle >= 2) {
		return null;
	}

	const hasArgentinaTitleSignal = posterTokens.some((token) => ARGENTINA_TITLE_SIGNAL_TOKENS.has(token));
	if (!hasArgentinaTitleSignal && posterTokens.length < 3) {
		return null;
	}

	return posterSlug.replace(/[-_]+/g, ' ');
}

function runGit(args, options = {}) {
	const result = spawnSync('git', args, {
		cwd: options.cwd || process.cwd(),
		encoding: 'utf8',
	});

	if (result.status !== 0) {
		const stderr = result.stderr?.trim();
		throw new Error(stderr || `git ${args.join(' ')} failed`);
	}

	return result.stdout.trim();
}

function listRecentCandidates(rootDir, baseRef) {
	const output = runGit(['diff', '--name-status', '--diff-filter=AM', '--relative', `${baseRef}...HEAD`, '--', rootDir]);
	if (!output) {
		return [];
	}

	return output
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean)
		.map((line) => {
			const [, filePath] = line.split(/\s+/, 2);
			return filePath;
		})
		.filter(Boolean);
}

function listCommittedChanges(baseRef) {
	const output = runGit(['diff', '--name-only', '--relative', `${baseRef}...HEAD`]);
	if (!output) {
		return [];
	}

	return output
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean);
}

function isLegendaryMovie(movie) {
	return LEGENDARY_MOVIE_SLUGS.has(String(movie.slug || ''));
}

function listAllCandidates(rootDir) {
	return fs
		.readdirSync(rootDir, { withFileTypes: true })
		.filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
		.map((entry) => path.join(rootDir, entry.name))
		.sort((left, right) => left.localeCompare(right));
}

function readJson(filePath) {
	return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadPeopleCatalog() {
	if (!fs.existsSync(PEOPLE_CATALOG_PATH)) {
		return {};
	}

	try {
		return readJson(PEOPLE_CATALOG_PATH);
	} catch {
		return {};
	}
}

function buildPeopleCatalogIndex(peopleCatalog) {
	return new Map(Object.keys(peopleCatalog).map((key) => [normalizePersonKey(key), key]));
}

function loadExclusiveProfileCatalog() {
	if (!fs.existsSync(PERSON_PROFILE_CATALOG_PATH)) {
		return [];
	}

	try {
		return fs
			.readFileSync(PERSON_PROFILE_CATALOG_PATH, 'utf8')
			.split(/\r?\n/)
			.map((line) => line.trim())
			.filter((line) => line.startsWith('|'))
			.map((line) => line.split('|').map((cell) => cell.trim()))
			.filter((cells) => cells.length >= 7)
			.filter((cells) => cells[1] && cells[1] !== 'Nombre' && cells[1] !== '---')
			.map((cells) => ({
				name: cells[1].replace(/`/g, ''),
				slug: cells[2].replace(/`/g, ''),
				route: cells[3].replace(/`/g, ''),
			}))
			.filter((entry) => entry.name && entry.slug);
	} catch {
		return [];
	}
}

function buildExclusiveProfileIndex(entries) {
	return new Map(entries.map((entry) => [normalizePersonKey(entry.name), entry]));
}

function addFinding(findings, severity, code, file, message) {
	findings.push({ severity, code, file, message });
}

function isValidIsoDateString(value) {
	if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return false;
	}

	const parsed = new Date(`${value}T00:00:00Z`);
	return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function collectStringFields(value, currentPath, output) {
	if (typeof value === 'string') {
		output.push({ path: currentPath, value });
		return;
	}

	if (Array.isArray(value)) {
		for (const [index, entry] of value.entries()) {
			collectStringFields(entry, `${currentPath}[${index}]`, output);
		}
		return;
	}

	if (value && typeof value === 'object') {
		for (const [key, entry] of Object.entries(value)) {
			collectStringFields(entry, currentPath ? `${currentPath}.${key}` : key, output);
		}
	}
}

function validateEditorialSlugList({
	movieSlug,
	candidatePath,
	fieldName,
	value,
	findings,
	knownMovieSlugs,
	requiredMinimum,
	recommendedMaximum,
}) {
	if (!Array.isArray(value) || value.length < requiredMinimum) {
		addFinding(
			findings,
			'error',
			fieldName === 'becauseYouLiked' ? 'missing-editorial-bridge' : 'missing-editorial-related',
			candidatePath,
			`editorial.${fieldName} must include at least ${requiredMinimum} existing movie slug${requiredMinimum === 1 ? '' : 's'}.`,
		);
		return;
	}

	if (value.length > recommendedMaximum) {
		addFinding(
			findings,
			'warn',
			'editorial-list-too-long',
			candidatePath,
			`editorial.${fieldName} has ${value.length} entries, but the UI only uses up to ${recommendedMaximum}.`,
		);
	}

	const seen = new Set();
	for (const [index, item] of value.entries()) {
		if (typeof item !== 'string' || item.trim().length === 0) {
			addFinding(findings, 'error', 'invalid-editorial-slug', candidatePath, `editorial.${fieldName}[${index}] must be a non-empty slug string.`);
			continue;
		}

		const slug = item.trim();
		if (slug === movieSlug) {
			addFinding(findings, 'error', 'self-editorial-slug', candidatePath, `editorial.${fieldName}[${index}] points back to the same movie.`);
		}
		if (seen.has(slug)) {
			addFinding(findings, 'error', 'duplicate-editorial-slug', candidatePath, `editorial.${fieldName} repeats slug "${slug}".`);
		}
		seen.add(slug);

		if (!knownMovieSlugs.has(slug)) {
			addFinding(findings, 'error', 'unknown-editorial-slug', candidatePath, `editorial.${fieldName}[${index}] references unknown slug "${slug}".`);
		}
	}
}

function isLagrimometroCategory(category) {
	return (
		category.includes('drama') ||
		category.includes('romance') ||
		category.includes('romantica') ||
		category.includes('romantic')
	);
}

function isJajametroCategory(category) {
	const isComedy = category.includes('comedia') || category.includes('comedy');
	return isComedy && !isLagrimometroCategory(category);
}

function isSangrometroCategory(category) {
	return category.includes('gore');
}

function validateMeterEligibility(movie, candidatePath, findings) {
	const disallowedMeterFields = [
		'jajametro',
		'jajametroScore',
		'jajámetro',
		'lagrimometro',
		'lagrimometroScore',
		'lagrimómetro',
		'cagazometro',
		'cagazometroScore',
		'cagazómetro',
		'explosiometro',
		'explosiometroScore',
		'explosiómetro',
		'sangrometro',
		'sangrometroScore',
		'sangrómetro',
	];
	for (const field of disallowedMeterFields) {
		if (Object.prototype.hasOwnProperty.call(movie, field)) {
			addFinding(
				findings,
				'error',
				'manual-meter-field',
				candidatePath,
				`Do not add "${field}" to movie JSON. Lagrimómetro/Jajámetro/Cagazómetro/Explosiómetro/Sangrómetro are automatic from primary category.`,
			);
		}
	}

	const category = normalizeText(movie.category || '');
	const taxonomyText = normalizeText(
		[...cleanTaxonomyList(movie.genres), ...cleanTaxonomyList(movie.subgenres)].join(' '),
	);
	const primaryShowsSangrometro = isSangrometroCategory(category);
	const primaryShowsLagrimometro = !primaryShowsSangrometro && isLagrimometroCategory(category);
	const primaryShowsJajametro = !primaryShowsLagrimometro && isJajametroCategory(category);
	const primaryShowsCagazometro = !primaryShowsSangrometro && !primaryShowsJajametro && !primaryShowsLagrimometro && category.includes('terror');
	const primaryShowsExplosiometro =
		!primaryShowsSangrometro && !primaryShowsJajametro && !primaryShowsCagazometro && !primaryShowsLagrimometro && category.includes('accion');

	if ([primaryShowsSangrometro, primaryShowsJajametro, primaryShowsLagrimometro, primaryShowsCagazometro, primaryShowsExplosiometro].filter(Boolean).length > 1) {
		addFinding(findings, 'error', 'conflicting-meter-category', candidatePath, 'Primary category cannot trigger more than one automatic meter.');
	}

	const taxonomyMentionsLagrimometro = isLagrimometroCategory(taxonomyText);
	const taxonomyMentionsComedy = taxonomyText.includes('comedia') || taxonomyText.includes('comedy');

	if (!primaryShowsJajametro && taxonomyMentionsComedy && !taxonomyMentionsLagrimometro) {
		addFinding(
			findings,
			'info',
			'secondary-comedy-meter-hidden',
			candidatePath,
			'Comedy appears only in secondary taxonomy; Jajámetro will stay hidden because only primary laugh-first category "Comedia" activates it.',
		);
	}

	if (!primaryShowsLagrimometro && !primaryShowsJajametro && taxonomyMentionsLagrimometro) {
		addFinding(
			findings,
			'info',
			'secondary-tear-meter-hidden',
			candidatePath,
			'Drama/Romance/Romántica appears only in secondary taxonomy; Lagrimómetro will stay hidden because only primary category activates it.',
		);
	}

	if (!primaryShowsSangrometro && taxonomyText.includes('gore')) {
		addFinding(
			findings,
			'info',
			'secondary-gore-meter-hidden',
			candidatePath,
			'Gore appears only in secondary taxonomy; Sangrómetro will stay hidden because only primary category "Gore" activates it.',
		);
	}

	if (!primaryShowsSangrometro && !primaryShowsCagazometro && taxonomyText.includes('terror')) {
		addFinding(
			findings,
			'info',
			'secondary-horror-meter-hidden',
			candidatePath,
			'Terror appears only in secondary taxonomy; Cagazómetro will stay hidden because only primary category "Terror" activates it.',
		);
	}

	if (!primaryShowsExplosiometro && taxonomyText.includes('accion')) {
		addFinding(
			findings,
			'info',
			'secondary-action-meter-hidden',
			candidatePath,
			'Action appears only in secondary taxonomy; Explosiómetro will stay hidden because only primary category "Accion"/"Acción" activates it.',
		);
	}
}

function validateSubgenres(movie, candidatePath, findings) {
	const normalizedCategory = normalizeText(movie.category || '').replace(/\s+/g, ' ');
	const explicitValues = cleanTaxonomyList(movie.subgenres);
	const explicitDefinitions = new Map();
	const seenRawSubgenres = new Set();

	if (movie.subgenres !== undefined && !Array.isArray(movie.subgenres)) {
		addFinding(findings, 'error', 'invalid-subgenres-format', candidatePath, 'subgenres must be an array of non-empty strings when present.');
		return;
	}

	for (const value of explicitValues) {
		const normalizedValue = normalizeText(value).replace(/\s+/g, ' ');
		if (!normalizedValue) {
			addFinding(findings, 'error', 'invalid-subgenre-entry', candidatePath, 'subgenres cannot contain empty values.');
			continue;
		}

		if (seenRawSubgenres.has(normalizedValue)) {
			addFinding(findings, 'warn', 'duplicate-subgenre-entry', candidatePath, `subgenres repeats "${value}".`);
		}
		seenRawSubgenres.add(normalizedValue);

		let matchedCanonical = false;
		for (const fragment of new Set([value, ...splitTaxonomyFragments(value)])) {
			const normalizedFragment = normalizeText(fragment).replace(/\s+/g, ' ');
			if (!normalizedFragment) {
				continue;
			}

			const definition = getCanonicalSubgenreDefinition(fragment);
			const duplicatesBroadTaxonomy =
				GENERIC_SUBGENRE_TOKENS.has(normalizedFragment) ||
				(normalizedFragment === normalizedCategory && !definition);
			if (duplicatesBroadTaxonomy) {
				addFinding(
					findings,
					'error',
					'generic-subgenre-token',
					candidatePath,
					`subgenres should not duplicate broad taxonomy like "${fragment}". Use category/genres for broad genres and reserve subgenres for finer labels.`,
				);
			}

			if (!definition) {
				continue;
			}

			matchedCanonical = true;
			if (explicitDefinitions.has(definition.id)) {
				addFinding(findings, 'warn', 'duplicate-subgenre-signal', candidatePath, `subgenres resolves "${fragment}" more than once as "${definition.label}".`);
			}
			explicitDefinitions.set(definition.id, definition);

			if (normalizedFragment !== normalizeText(definition.label).replace(/\s+/g, ' ')) {
				addFinding(
					findings,
					'warn',
					'non-canonical-subgenre-label',
					candidatePath,
					`subgenres uses "${fragment}". Prefer canonical label "${definition.label}" for cleaner content loads and easier audits.`,
				);
			}
		}

		if (!matchedCanonical) {
			addFinding(
				findings,
				'warn',
				'custom-subgenre-label',
				candidatePath,
				`subgenres includes "${value}", which is outside the current canonical chip list. Verify that shipping a custom subgenre chip is intentional.`,
			);
		}
	}

	const inferredDefinitions = collectCanonicalSubgenreDefinitions([
		movie.category,
		...cleanTaxonomyList(movie.genres),
	]);

	for (const definition of inferredDefinitions.values()) {
		if (explicitDefinitions.has(definition.id)) {
			continue;
		}

		addFinding(
			findings,
			'error',
			'missing-explicit-subgenre',
			candidatePath,
			`Recognized subgenre "${definition.label}" appears in category/genres but is missing from subgenres. Mirror it explicitly so the home subgenre filter and future loads stay consistent.`,
		);
	}
}

function validateShareFields(movie, candidatePath, findings) {
	for (const field of DISALLOWED_SHARE_FIELDS) {
		if (Object.prototype.hasOwnProperty.call(movie, field)) {
			addFinding(
				findings,
				'error',
				'manual-share-field',
				candidatePath,
				`Do not add "${field}" to movie JSON. The movie detail Share panel derives links from slug/canonical URL.`,
			);
		}
	}
}

function validateReactionFields(movie, candidatePath, findings) {
	for (const field of DISALLOWED_REACTION_FIELDS) {
		if (Object.prototype.hasOwnProperty.call(movie, field)) {
			addFinding(
				findings,
				'error',
				'manual-reaction-field',
				candidatePath,
				`Do not add "${field}" to movie JSON. The global reaction panel derives its copy and illustration from verdict and slug.`,
			);
		}
	}
}

function isMarvelOrDcSuperheroMovie(movie) {
	const taxonomyText = normalizeText([movie.category || '', ...cleanTaxonomyList(movie.genres), ...cleanTaxonomyList(movie.subgenres)].join(' '));
	if (taxonomyText.includes('animacion') || taxonomyText.includes('animation') || taxonomyText.includes('anime')) return false;
	if (SUPERHERO_INCLUDED_SLUGS.has(movie.slug)) return true;
	const heroText = normalizeText([movie.slug, movie.title, movie.originalTitle].join(' '));
	return !SUPERHERO_EXCLUDE_TOKENS.some((token) => heroText.includes(normalizeText(token))) && SUPERHERO_INCLUDE_TOKENS.some((token) => heroText.includes(normalizeText(token)));
}

function validatePostCredits(movie, candidatePath, findings) {
	const isSuperheroMovie = isMarvelOrDcSuperheroMovie(movie);
	const hasField = Object.prototype.hasOwnProperty.call(movie, 'postCreditsScenes');
	if (!isSuperheroMovie && hasField) {
		addFinding(findings, 'error', 'post-credits-non-superhero', candidatePath, 'postCreditsScenes is reserved for Marvel/DC superhero movies.');
		return;
	}
	if (isSuperheroMovie && !hasField) {
		addFinding(findings, 'error', 'missing-post-credits', candidatePath, 'Marvel/DC superhero movies must declare a verified postCreditsScenes count; use 0 when there are no scenes.');
		return;
	}
	if (hasField && (!Number.isInteger(movie.postCreditsScenes) || movie.postCreditsScenes < 0)) {
		addFinding(findings, 'error', 'invalid-post-credits', candidatePath, 'postCreditsScenes must be a verified non-negative integer; null is not allowed.');
	}
}

function validateCommunityBuildRoute(movie, candidatePath, findings) {
	const slug = typeof movie.slug === 'string' ? movie.slug.trim() : '';
	if (!slug) return;

	const routePath = path.join('dist', 'comunidad', 'peliculas', encodeURIComponent(slug), 'index.html');
	if (!fs.existsSync(routePath)) {
		addFinding(
			findings,
			'error',
			'missing-community-route',
			candidatePath,
			`Expected built Comunidad discussion route is missing: ${routePath}. Run npm run build and confirm the movie slug is valid.`,
		);
	}
}

function validateReactionBuildRoute(movie, candidatePath, findings) {
	const slug = typeof movie.slug === 'string' ? movie.slug.trim() : '';
	const reaction = REACTION_BY_VERDICT[movie.verdict];
	if (!slug || !reaction) return;

	const routePath = path.join('dist', 'peliculas', encodeURIComponent(slug), 'index.html');
	if (!fs.existsSync(routePath)) {
		addFinding(
			findings,
			'error',
			'missing-reaction-build-route',
			candidatePath,
			`Expected built movie detail route is missing: ${routePath}. Run npm run build and confirm the movie slug is valid.`,
		);
		return;
	}

	const builtHtml = fs.readFileSync(routePath, 'utf8');
	if (!builtHtml.includes('movie-reaction')) {
		addFinding(findings, 'error', 'missing-reaction-panel', candidatePath, `Built detail route is missing the global movie-reaction panel: ${routePath}.`);
		return;
	}
	if (!builtHtml.includes(`movie-reaction--${reaction.kind}`) || !builtHtml.includes(reaction.label)) {
		addFinding(
			findings,
			'error',
			'reaction-panel-mismatch',
			candidatePath,
			`Built reaction panel must render "${reaction.label}" with the ${reaction.kind} state for verdict "${movie.verdict}".`,
		);
	}
}

function validateCinemaCarouselBuild(movie, candidatePath, findings) {
	const releaseDate = typeof movie.releaseDate === 'string' ? movie.releaseDate.trim() : '';
	const releaseTimestamp = Date.parse(`${releaseDate}T00:00:00Z`);
	const todayTimestamp = Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate());
	const windowStartTimestamp = todayTimestamp - 42 * 24 * 60 * 60 * 1000;
	const isInTheaters = movie.releasePlatform === 'Cine' || (Array.isArray(movie.releasePlatforms) && movie.releasePlatforms.includes('Cine'));

	if (!isInTheaters || Number.isNaN(releaseTimestamp) || releaseTimestamp < windowStartTimestamp || releaseTimestamp > todayTimestamp) {
		return;
	}

	const indexPath = path.join('dist', 'index.html');
	if (!fs.existsSync(indexPath)) {
		addFinding(findings, 'error', 'missing-cinema-carousel-build', candidatePath, 'Expected built homepage is missing. Run npm run build before verifying the cinema carousel.');
		return;
	}

	const builtHtml = fs.readFileSync(indexPath, 'utf8');
	if (!builtHtml.includes('data-cinema-release-carousel') || !builtHtml.includes(movie.title)) {
		addFinding(
			findings,
			'error',
			'cinema-carousel-missing-entry',
			candidatePath,
			`Current Cine entry "${movie.title}" must render in the built homepage trailer carousel. Check releaseDate, releasePlatform, poster and trailerYoutubeId.`,
		);
	}
}

function validateStreamingCarouselBuild(movie, candidatePath, findings) {
	const releaseDate = typeof movie.releaseDate === 'string' ? movie.releaseDate.trim() : '';
	const releaseTimestamp = Date.parse(`${releaseDate}T00:00:00Z`);
	const todayTimestamp = Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate());
	const windowStartTimestamp = todayTimestamp - 42 * 24 * 60 * 60 * 1000;
	const platforms = Array.isArray(movie.releasePlatforms) && movie.releasePlatforms.length > 0
		? movie.releasePlatforms
		: [movie.releasePlatform];
	const hasConfirmedStreamingPlatform = platforms.some((platform) => platform && platform !== 'Cine' && platform !== 'Otras plataformas');
	const isAlsoInTheaters = platforms.includes('Cine');

	if (
		!hasConfirmedStreamingPlatform ||
		isAlsoInTheaters ||
		Number.isNaN(releaseTimestamp) ||
		releaseTimestamp < windowStartTimestamp ||
		releaseTimestamp > todayTimestamp
	) {
		return;
	}

	const indexPath = path.join('dist', 'index.html');
	if (!fs.existsSync(indexPath)) {
		addFinding(findings, 'error', 'missing-streaming-carousel-build', candidatePath, 'Expected built homepage is missing. Run npm run build before verifying the streaming carousel.');
		return;
	}

	const builtHtml = fs.readFileSync(indexPath, 'utf8');
	if (!builtHtml.includes('data-cinema-release-carousel="streaming-release-carousel"') || !builtHtml.includes(movie.title)) {
		addFinding(
			findings,
			'error',
			'streaming-carousel-missing-entry',
			candidatePath,
			`Current streaming entry "${movie.title}" must render in the built homepage trailer carousel. Check releaseDate, confirmed releasePlatform, poster and trailerYoutubeId.`,
		);
	}
}

function validateMovieShape(movie, candidatePath, catalogText, findings, knownMovieSlugs) {
	const requiredStrings = [
		'slug',
		'title',
		'originalTitle',
		'category',
		'poster',
		'director',
		'productionCompany',
		'verdict',
		'verdictLabel',
		'review',
	];

	for (const field of requiredStrings) {
		if (typeof movie[field] !== 'string' || movie[field].trim().length === 0) {
			addFinding(findings, 'error', 'missing-field', candidatePath, `Missing or empty string field "${field}".`);
		}
	}

	validateReactionFields(movie, candidatePath, findings);

	if (typeof movie.audienceRating !== 'string' || !AUDIENCE_RATING_PATTERN.test(movie.audienceRating.trim())) {
		addFinding(findings, 'error', 'invalid-audience-rating', candidatePath, 'audienceRating must be `ATP` or `+<edad>`.');
	}

	if (!Number.isInteger(movie.year) || movie.year < 1888 || movie.year > 2100) {
		addFinding(findings, 'error', 'invalid-year', candidatePath, `Invalid year "${String(movie.year)}".`);
	}

	const normalizedReleaseDate = typeof movie.releaseDate === 'string' ? movie.releaseDate.trim() : '';
	if (movie.releaseDate !== undefined && !isValidIsoDateString(normalizedReleaseDate)) {
		addFinding(findings, 'error', 'invalid-release-date', candidatePath, 'releaseDate must use a real YYYY-MM-DD date.');
	}

	const normalizedReviewPublishedAt =
		typeof movie.reviewPublishedAt === 'string' ? movie.reviewPublishedAt.trim() : '';
	if (movie.reviewPublishedAt !== undefined && !isValidIsoDateString(normalizedReviewPublishedAt)) {
		addFinding(
			findings,
			'error',
			'invalid-review-published-at',
			candidatePath,
			'reviewPublishedAt must use a real YYYY-MM-DD date.',
		);
	}

	if (!normalizedReviewPublishedAt) {
		addFinding(
			findings,
			'warn',
			'missing-review-published-at',
			candidatePath,
			'Set reviewPublishedAt on newly published reviews so the homepage block "Últimas reseñas" sorts by publication freshness instead of releaseDate fallback.',
		);
	}

	if (Number.isInteger(movie.year) && movie.year >= CURRENT_YEAR && !normalizedReleaseDate) {
		addFinding(
			findings,
			'error',
			'missing-release-date',
			candidatePath,
			`Current-year and future entries must include releaseDate. Astro 7 filters home/search visibility through getMovies(), so a ${CURRENT_YEAR}+ movie without releaseDate can build successfully but stay hidden from the homepage.`,
		);
	}

	if (!Array.isArray(movie.mainCast) || movie.mainCast.length < 2) {
		addFinding(findings, 'error', 'invalid-cast', candidatePath, 'mainCast must contain at least two credited performers.');
	}

	const normalizedCategory = normalizeText(movie.category || '');
	validateSubgenres(movie, candidatePath, findings);
	validateShareFields(movie, candidatePath, findings);
	validateMeterEligibility(movie, candidatePath, findings);
	validatePostCredits(movie, candidatePath, findings);

	const isAnimatedTitle =
		normalizedCategory === 'anime' || normalizedCategory === 'animacion' || normalizedCategory === 'animación';
	const isDocumentaryTitle = normalizedCategory === 'documental';
	if (Array.isArray(movie.mainCast) && !isAnimatedTitle && !isDocumentaryTitle && movie.mainCast.length < 3) {
		addFinding(
			findings,
			'warn',
			'short-principal-cast',
			candidatePath,
			'Live-action entries should usually carry at least 3 principal performers in mainCast unless reliable official billing clearly supports fewer.',
		);
	}

	if (Array.isArray(movie.mainCast)) {
		const seenCast = new Set();
		for (const castName of movie.mainCast) {
			const normalizedCastName = normalizeText(castName);
			if (!normalizedCastName) {
				continue;
			}
			if (seenCast.has(normalizedCastName)) {
				addFinding(findings, 'warn', 'duplicate-cast-name', candidatePath, `mainCast repeats "${castName}".`);
			}
			seenCast.add(normalizedCastName);
		}
	}

	if (!Array.isArray(movie.screenshots)) {
		addFinding(findings, 'error', 'invalid-screenshots', candidatePath, 'screenshots must be an array.');
	}

	if (movie.editorial === undefined || movie.editorial === null || typeof movie.editorial !== 'object' || Array.isArray(movie.editorial)) {
		addFinding(findings, 'error', 'missing-editorial', candidatePath, 'editorial must exist as an object so the recommendation blocks can render with curated links.');
	} else {
		if (movie.editorial.idealFor !== undefined) {
			addFinding(findings, 'error', 'deprecated-ideal-for', candidatePath, 'editorial.idealFor is deprecated and must be removed from movie files.');
		}

		validateEditorialSlugList({
			movieSlug: String(movie.slug || ''),
			candidatePath,
			fieldName: 'becauseYouLiked',
			value: movie.editorial.becauseYouLiked,
			findings,
			knownMovieSlugs,
			requiredMinimum: 1,
			recommendedMaximum: 2,
		});

		validateEditorialSlugList({
			movieSlug: String(movie.slug || ''),
			candidatePath,
			fieldName: 'related',
			value: movie.editorial.related,
			findings,
			knownMovieSlugs,
			requiredMinimum: 3,
			recommendedMaximum: 4,
		});

		if (Array.isArray(movie.editorial.becauseYouLiked) && Array.isArray(movie.editorial.related)) {
			const overlap = movie.editorial.becauseYouLiked.filter((slug) => movie.editorial.related.includes(slug));
			if (overlap.length > 0) {
				addFinding(findings, 'warn', 'editorial-overlap', candidatePath, `editorial.becauseYouLiked and editorial.related repeat: ${overlap.join(', ')}.`);
			}
		}
	}

	if (!movie.awards || !Array.isArray(movie.awards.wins)) {
		addFinding(findings, 'error', 'invalid-awards', candidatePath, 'awards.wins must exist and be an array.');
	} else {
		for (const [index, win] of movie.awards.wins.entries()) {
			if (!win || typeof win !== 'object') {
				addFinding(findings, 'error', 'invalid-award-entry', candidatePath, `Award entry #${index + 1} is not an object.`);
				continue;
			}

			if (!ALLOWED_AWARDS.has(win.award)) {
				addFinding(findings, 'error', 'unsupported-award', candidatePath, `Unsupported award type "${String(win.award)}".`);
			}

			if (typeof win.category !== 'string' || win.category.trim().length === 0) {
				addFinding(findings, 'error', 'award-missing-category', candidatePath, `Award entry #${index + 1} is missing category.`);
			}

			if (win.year !== undefined && (!Number.isInteger(win.year) || win.year < 1900 || win.year > 2100)) {
				addFinding(findings, 'error', 'award-invalid-year', candidatePath, `Award entry #${index + 1} has invalid year "${String(win.year)}".`);
			}

			const normalizedAwardCategory = normalizeText(win.category);
			if (win.award === 'oscar' && normalizedAwardCategory.includes('mejor pelicula')) {
				if (typeof win.recipient !== 'string' || win.recipient.trim().length === 0) {
					addFinding(findings, 'error', 'award-missing-recipient', candidatePath, 'Oscar wins for "Mejor película" require recipient.');
				}
			}

			if (
				typeof win.recipient === 'string' &&
				win.recipient.trim().length > 0 &&
				/(^| )actor( |$)|(^| )actriz( |$)/.test(normalizedAwardCategory)
			) {
				const creditedCast = Array.isArray(movie.mainCast) ? movie.mainCast.map((entry) => normalizeText(String(entry || ''))) : [];
				if (!creditedCast.includes(normalizeText(win.recipient))) {
					addFinding(
						findings,
						'error',
						'acting-award-missing-from-cast',
						candidatePath,
						`Acting award recipient "${win.recipient}" must appear in mainCast.`,
					);
				}
			}
		}
	}

	if (!ALLOWED_VERDICTS.has(movie.verdict)) {
		addFinding(findings, 'error', 'invalid-verdict', candidatePath, `Unsupported verdict "${String(movie.verdict)}".`);
	}

	const normalizedVerdictLabel = normalizeText(movie.verdictLabel);
	const normalizedMovieTitle = normalizeText(movie.title);
	if (movie.verdictLabel.trim().length > MAX_VERDICT_LABEL_LENGTH) {
		addFinding(
			findings,
			'error',
			'verdict-label-too-long',
			candidatePath,
			`verdictLabel must stay within ${String(MAX_VERDICT_LABEL_LENGTH)} visible characters so the card badge does not clip.`,
		);
	}

	if (/\b(19|20)\d{2}\b/.test(movie.verdictLabel)) {
		addFinding(findings, 'warn', 'verdict-label-noisy', candidatePath, 'verdictLabel should read like a short user-facing quality signal, not metadata.');
	}

	if (
		normalizedMovieTitle &&
		normalizedMovieTitle
			.split(' ')
			.some((token) => token.length >= 4 && normalizedVerdictLabel.includes(token))
	) {
		addFinding(findings, 'warn', 'verdict-label-title-leak', candidatePath, 'verdictLabel should not repeat the movie title.');
	}

	if (movie.verdict === 'recomendada' && !RECOMMENDED_LABEL_PATTERNS.some((pattern) => normalizedVerdictLabel.includes(pattern))) {
		addFinding(findings, 'warn', 'verdict-label-tone', candidatePath, 'recomendada entries should use a clearly positive verdictLabel.');
	}

	if (isLegendaryMovie(movie) && !LEGENDARY_LABEL_PATTERNS.some((pattern) => normalizedVerdictLabel.includes(pattern))) {
		addFinding(findings, 'error', 'legendary-verdict-label', candidatePath, 'legendary movies should use a verdictLabel that explicitly recognizes their status, like LEGENDARIA or OBRA MAESTRA.');
	}

	if (movie.verdict === 'zafa' && !PASSABLE_LABEL_PATTERNS.some((pattern) => normalizedVerdictLabel.includes(pattern))) {
		addFinding(findings, 'error', 'verdict-label-tone', candidatePath, 'zafa entries should use a clearly passable verdictLabel.');
	}

	if ((movie.verdict === 'no_recomendada' || movie.verdict === 'basura_atomica') && !NEGATIVE_LABEL_PATTERNS.some((pattern) => normalizedVerdictLabel.includes(pattern))) {
		addFinding(findings, 'error', 'verdict-label-tone', candidatePath, 'negative entries should use a clearly negative verdictLabel.');
	}

	if (OPAQUE_VERDICT_LABEL_TOKENS.some((token) => normalizedVerdictLabel.includes(token))) {
		addFinding(findings, 'error', 'opaque-verdict-label', candidatePath, 'verdictLabel should be direct and easy to understand, not a cryptic adjective mashup.');
	}

	if (movie.releasePlatform !== undefined && !ALLOWED_PLATFORMS.has(movie.releasePlatform)) {
		addFinding(findings, 'error', 'invalid-platform', candidatePath, `Unsupported releasePlatform "${String(movie.releasePlatform)}".`);
	}

	if (movie.releasePlatforms !== undefined) {
		if (!Array.isArray(movie.releasePlatforms)) {
			addFinding(findings, 'error', 'invalid-platforms', candidatePath, 'releasePlatforms must be an array when present.');
		} else {
			if (movie.releasePlatforms.length === 0) {
				addFinding(findings, 'error', 'empty-platforms', candidatePath, 'releasePlatforms should not be an empty array.');
			}
			if (movie.releasePlatforms.length > 2) {
				addFinding(findings, 'error', 'too-many-platforms', candidatePath, 'releasePlatforms supports at most 2 platforms.');
			}

			const normalizedPlatforms = new Set();
			for (const platform of movie.releasePlatforms) {
				if (typeof platform !== 'string' || platform.trim().length === 0) {
					addFinding(findings, 'error', 'invalid-platforms', candidatePath, 'releasePlatforms can only contain non-empty strings.');
					continue;
				}
				if (!ALLOWED_PLATFORMS.has(platform)) {
					addFinding(findings, 'error', 'invalid-platform', candidatePath, `Unsupported releasePlatforms entry "${String(platform)}".`);
				}
				const normalizedPlatform = platform.trim().toLowerCase();
				if (normalizedPlatforms.has(normalizedPlatform)) {
					addFinding(findings, 'warn', 'duplicate-platform', candidatePath, `releasePlatforms repeats "${platform}".`);
				}
				normalizedPlatforms.add(normalizedPlatform);
			}

			if (
				typeof movie.releasePlatform === 'string' &&
				movie.releasePlatform.trim().length > 0 &&
				!movie.releasePlatforms.includes(movie.releasePlatform)
			) {
				addFinding(findings, 'warn', 'platform-mismatch', candidatePath, 'releasePlatform should be included in releasePlatforms when both are present.');
			}
		}
	}

	const argentinaTitleCandidate = detectArgentinaTitleDrift(movie);
	if (argentinaTitleCandidate) {
		addFinding(
			findings,
			'warn',
			'argentina-title-suspect',
			candidatePath,
			`title matches originalTitle, but the Argentine-facing poster/localized asset suggests a different market title ("${argentinaTitleCandidate}"). Verify against AR sources.`,
		);
	}

	if (typeof movie.poster !== 'string' || !/^https?:\/\//.test(movie.poster)) {
		addFinding(findings, 'warn', 'poster-url', candidatePath, 'poster should use an absolute http(s) URL.');
	} else {
		if (FORBIDDEN_POSTER_URL_PATTERN.test(movie.poster)) {
			addFinding(
				findings,
				'error',
				'poster-youtube-thumbnail',
				candidatePath,
				'poster must be real vertical movie poster/key art; do not use YouTube trailer thumbnails such as i.ytimg.com hqdefault/maxresdefault.',
			);
		}

		if (HORIZONTAL_POSTER_PATH_PATTERN.test(movie.poster)) {
			addFinding(
				findings,
				'error',
				'poster-horizontal-asset',
				candidatePath,
				'poster appears to be a horizontal backdrop/still/thumbnail path. Use a portrait poster asset instead.',
			);
		}
	}

	if (movie.country === 'AR' && movie.isArgentinian !== true) {
		addFinding(findings, 'warn', 'argentina-flag', candidatePath, 'country is AR but isArgentinian is not true.');
	}

	if (movie.isArgentinian === true && movie.country !== 'AR') {
		addFinding(findings, 'warn', 'argentina-country', candidatePath, 'isArgentinian is true but country is not AR.');
	}

	const sentences = String(movie.review || '')
		.split(/(?<=[.!?])\s+/)
		.map((part) => part.trim())
		.filter(Boolean);

	if (movie.review.trim().length < 140) {
		addFinding(findings, 'warn', 'short-review', candidatePath, 'review is unusually short.');
	}

	if (sentences.length < 2) {
		addFinding(findings, 'warn', 'review-sentences', candidatePath, 'review should usually have at least two sentences.');
	}

	if (/\b\d+(?:[.,]\d+)?\s*\/\s*(?:10|100)\b/.test(movie.review) || /\b\d{1,3}\s*%\b/.test(movie.review)) {
		addFinding(findings, 'warn', 'numeric-score-review', candidatePath, 'review leaks raw numeric score(s).');
	}

	const normalizedReview = normalizeText(movie.review);
	for (const forbiddenReference of FORBIDDEN_REVIEW_SITE_REFERENCES) {
		if (normalizedReview.includes(forbiddenReference)) {
			addFinding(
				findings,
				'error',
				'review-third-party-reference',
				candidatePath,
				`review must not mention third-party sites or brands like "${forbiddenReference}" in user-facing copy.`,
			);
		}
	}

	if (!catalogText.includes(`| ${movie.year} | ${movie.title} | ${movie.slug} |`)) {
		addFinding(findings, 'warn', 'catalog-sync', candidatePath, 'Movie row was not found in docs/movie-catalog-reference.md.');
	}

	const stringFields = [];
	collectStringFields(movie, '', stringFields);
	for (const field of stringFields) {
		if (HTML_ENTITY_PATTERN.test(field.value)) {
			addFinding(findings, 'error', 'html-entity-artifact', candidatePath, `Field "${field.path}" still contains HTML entities.`);
		}

		if (SCRAPE_ARTIFACT_PATTERN.test(field.value)) {
			addFinding(findings, 'error', 'scrape-artifact', candidatePath, `Field "${field.path}" still contains citation or scrape artifacts.`);
		}
	}
}

function validatePeoplePool(movie, candidatePath, findings, peopleCatalog, peopleCatalogIndex, exclusiveProfileIndex) {
	const creditNames = [
		...splitCreditNames(movie.director),
		...(Array.isArray(movie.mainCast) ? movie.mainCast.flatMap((entry) => splitCreditNames(entry)) : []),
	];
	const uniqueNames = [...new Set(creditNames)];

	for (const personName of uniqueNames) {
		const exclusiveProfile = exclusiveProfileIndex.get(normalizePersonKey(personName));
		if (exclusiveProfile && personName !== exclusiveProfile.name) {
			addFinding(
				findings,
				'error',
				'exclusive-profile-name-drift',
				candidatePath,
				`"${personName}" matches the exclusive profile "${exclusiveProfile.name}" (${exclusiveProfile.route}). Use the canonical catalog name so the dynamic profile link resolves consistently.`,
			);
		}

		const catalogKey = peopleCatalog[personName]
			? personName
			: peopleCatalogIndex.get(normalizePersonKey(personName));
		const personEntry = catalogKey ? peopleCatalog[catalogKey] : undefined;
		if (!personEntry || typeof personEntry !== 'object') {
			addFinding(
				findings,
				'error',
				'missing-person-entry',
				candidatePath,
				`"${personName}" is missing from src/data/people.json.`,
			);
			continue;
		}

		const derivedBirthYear =
			Number.isInteger(personEntry.birthYear)
				? personEntry.birthYear
				: /^\d{4}/.test(String(personEntry.birthDate || ''))
					? Number.parseInt(String(personEntry.birthDate).slice(0, 4), 10)
					: undefined;
		const derivedDeathYear =
			Number.isInteger(personEntry.deathYear)
				? personEntry.deathYear
				: /^\d{4}/.test(String(personEntry.deathDate || ''))
					? Number.parseInt(String(personEntry.deathDate).slice(0, 4), 10)
					: undefined;
		const traceableReferenceUrls = Array.isArray(personEntry.referenceUrls)
			? personEntry.referenceUrls.filter((entry) => typeof entry === 'string' && entry.trim().length > 0)
			: [];
		const hasTraceProfile =
			(typeof personEntry.imdbUrl === 'string' &&
				/https?:\/\/(?:www\.)?imdb\.com\/name\/nm\d+\/?/i.test(personEntry.imdbUrl)) ||
			traceableReferenceUrls.some((entry) =>
				/(?:wikidata\.org\/wiki\/Q\d+|themoviedb\.org\/person\/|watch\.plex\.tv\/person\/|anime-planet\.com\/people\/|screendollars\.com\/celebrity\/)/i.test(
					entry,
				),
			);

		if (!Number.isInteger(derivedBirthYear) || derivedBirthYear < 1850 || derivedBirthYear > 2100) {
			addFinding(
				findings,
				'warn',
				'missing-person-birth',
				candidatePath,
				`"${personName}" should include a verifiable birthDate or birthYear in src/data/people.json when public sources support it.`,
			);
		}

		if (
			Number.isInteger(derivedDeathYear) &&
			(Number.isInteger(derivedBirthYear) ? derivedDeathYear < derivedBirthYear : false)
		) {
			addFinding(
				findings,
				'error',
				'invalid-person-death-year',
				candidatePath,
				`"${personName}" has a death year earlier than birth year in src/data/people.json.`,
			);
		}

		if (Number.isInteger(derivedDeathYear) && derivedDeathYear > CURRENT_YEAR) {
			addFinding(
				findings,
				'error',
				'invalid-person-death-year-future',
				candidatePath,
				`"${personName}" has a death year in the future in src/data/people.json.`,
			);
		}

		if (
			Number.isInteger(derivedBirthYear) &&
			!Number.isInteger(derivedDeathYear) &&
			CURRENT_YEAR - derivedBirthYear > 110
		) {
			addFinding(
				findings,
				'warn',
				'missing-person-death-year',
				candidatePath,
				`"${personName}" looks old enough to require a deathYear check in src/data/people.json.`,
			);
		}

		if (typeof personEntry.nationalityPrimary !== 'string' || personEntry.nationalityPrimary.trim().length === 0) {
			addFinding(
				findings,
				'error',
				'missing-person-nationality',
				candidatePath,
				`"${personName}" must include nationalityPrimary in src/data/people.json.`,
			);
		}

		if (typeof personEntry.image !== 'string' || personEntry.image.trim().length === 0) {
			addFinding(
				findings,
				'error',
				'missing-person-image',
				candidatePath,
				`"${personName}" must include a trusted cached portrait in src/data/people.json. Do not publish credited directors/main cast with initials-only cards.`,
			);
		} else {
			const normalizedImagePath = personEntry.image.replace(/^\/+/, '').replace(/\//g, path.sep);
			const absoluteImagePath = path.join(PEOPLE_PUBLIC_ROOT, normalizedImagePath);
			if (!fs.existsSync(absoluteImagePath)) {
				addFinding(
					findings,
					'error',
					'missing-person-image-file',
					candidatePath,
					`"${personName}" points to missing image file "${personEntry.image}".`,
				);
			}
		}

		if (typeof personEntry.remoteImageUrl === 'string' && personEntry.remoteImageUrl.trim().length > 0) {
			const imageHost = getHostname(personEntry.remoteImageUrl);
			if (SUSPICIOUS_PERSON_IMAGE_HOSTS.has(imageHost) || isSuspiciousPersonImageUrl(personEntry.remoteImageUrl)) {
				addFinding(
					findings,
					'error',
					'suspicious-person-image-source',
					candidatePath,
					`"${personName}" uses a suspicious portrait source ("${personEntry.remoteImageUrl}") that looks more like a logo, favicon or generic site asset than a real headshot.`,
				);
			} else if (!TRUSTED_PERSON_IMAGE_HOSTS.has(imageHost)) {
				addFinding(
					findings,
					'warn',
					'untrusted-person-image-source',
					candidatePath,
					`"${personName}" uses an uncommon portrait host ("${imageHost}"). Verify that the cached image is a real actor/director headshot.`,
				);
			}
		}

		if (typeof personEntry.imdbUrl === 'string' && personEntry.imdbUrl.trim().length > 0) {
			if (!/https?:\/\/(?:www\.)?imdb\.com\/name\/nm\d+\/?/i.test(personEntry.imdbUrl)) {
				addFinding(
					findings,
					'warn',
					'invalid-person-imdb-url',
					candidatePath,
					`"${personName}" has an invalid IMDb profile URL in src/data/people.json.`,
				);
			}
		} else if (!hasTraceProfile) {
			addFinding(
				findings,
				'warn',
				'missing-person-trace-url',
				candidatePath,
				`"${personName}" should keep at least one traceable profile URL (IMDb, Wikidata, TMDb, Plex, Anime-Planet or similar).`,
			);
		}
	}
}

function validateTrailerId(movie, candidatePath, findings) {
	const value = String(movie.trailerYoutubeId || '').trim();
	if (!value) {
		addFinding(findings, 'error', 'missing-trailer', candidatePath, 'trailerYoutubeId is empty.');
		return null;
	}

	if (!/^[A-Za-z0-9_-]{11}$/.test(value)) {
		addFinding(findings, 'error', 'invalid-trailer-id', candidatePath, `trailerYoutubeId "${value}" does not look like a YouTube video id.`);
		return null;
	}

	return value;
}

function fetchText(url, redirectsLeft = 3) {
	return new Promise((resolve) => {
		const request = https.get(
			url,
			{
				headers: {
					'User-Agent': 'Mozilla/5.0 (compatible; la-posta-cine-auditor/1.0)',
				},
			},
			(response) => {
				let body = '';
				if (
					response.statusCode >= 300 &&
					response.statusCode < 400 &&
					response.headers.location &&
					redirectsLeft > 0
				) {
					response.resume();
					resolve(fetchText(response.headers.location, redirectsLeft - 1));
					return;
				}

				response.on('data', (chunk) => {
					body += chunk;
				});
				response.on('end', () => {
					resolve({
						ok: response.statusCode === 200,
						statusCode: response.statusCode,
						body,
					});
				});
			},
		);

		request.setTimeout(8000, () => {
			request.destroy(new Error('timeout'));
		});

		request.on('error', (error) => {
			resolve({
				ok: false,
				reason: error.message,
				body: '',
			});
		});
	});
}

function extractYoutubeResultIds(html) {
	return [...new Set((html.match(/watch\?v=([A-Za-z0-9_-]{11})/g) || []).map((match) => match.slice(8)))];
}

function analyzeYoutubeTitle(movie, embedTitle) {
	const normalizedEmbedTitle = normalizeText(embedTitle);
	const candidateTitles = [...new Set([movie.title, movie.originalTitle].filter((value) => typeof value === 'string' && value.trim().length > 0))];
	const titleAnalyses = candidateTitles
		.map((title) => {
			const normalizedTitle = normalizeText(title);
			const titleTokens = normalizedTitle.split(' ').filter(Boolean);
			const titlePhraseMatch = normalizedTitle.length > 0 && normalizedEmbedTitle.includes(normalizedTitle);
			const longTokenMatch = titleTokens.some((token) => token.length >= 5 && normalizedEmbedTitle.includes(token));
			const isShortOrAmbiguousTitle = titleTokens.length <= 2 || normalizedTitle.length <= 12;
			return {
				title,
				titlePhraseMatch,
				longTokenMatch,
				isShortOrAmbiguousTitle,
				titleLooksRelated: titlePhraseMatch || (!isShortOrAmbiguousTitle && longTokenMatch),
			};
		})
		.filter((entry) => entry.title);
	const mentionedYears = [...String(embedTitle || '').matchAll(/\b(19|20)\d{2}\b/g)].map((match) => Number(match[0]));
	const matchedVariant = titleAnalyses.find((entry) => entry.titleLooksRelated);

	return {
		titlePhraseMatch: titleAnalyses.some((entry) => entry.titlePhraseMatch),
		longTokenMatch: titleAnalyses.some((entry) => entry.longTokenMatch),
		yearMentioned: mentionedYears.length > 0,
		yearMatches: mentionedYears.includes(movie.year),
		mentionedYears,
		isShortOrAmbiguousTitle: titleAnalyses.every((entry) => entry.isShortOrAmbiguousTitle),
		titleLooksRelated: titleAnalyses.some((entry) => entry.titleLooksRelated),
		matchedVariant: matchedVariant?.title,
	};
}

function checkYoutubeOEmbed(videoId) {
	const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

	return new Promise((resolve) => {
		const request = https.get(url, (response) => {
			let body = '';
			response.on('data', (chunk) => {
				body += chunk;
			});
			response.on('end', () => {
				if (response.statusCode !== 200) {
					resolve({
						ok: false,
						statusCode: response.statusCode,
						reason: `YouTube oEmbed returned HTTP ${response.statusCode}.`,
					});
					return;
				}

				try {
					const data = JSON.parse(body);
					resolve({
						ok: true,
						title: data.title || '',
						authorName: data.author_name || '',
					});
				} catch (error) {
					resolve({
						ok: false,
						reason: `YouTube oEmbed JSON parse failed: ${error.message}`,
					});
				}
			});
		});

		request.setTimeout(8000, () => {
			request.destroy(new Error('timeout'));
		});

		request.on('error', (error) => {
			resolve({
				ok: false,
				reason: `YouTube oEmbed request failed: ${error.message}`,
			});
		});
	});
}

async function searchYoutubeResults(movie) {
	const queries = [...new Set([movie.title, movie.originalTitle].filter((value) => typeof value === 'string' && value.trim().length > 0))];
	const collectedIds = new Set();
	let failureReason = 'YouTube search did not return usable results.';
	let sawSuccess = false;

	for (const title of queries) {
		const query = encodeURIComponent(`${title} ${movie.year} trailer`);
		const result = await fetchText(`https://www.youtube.com/results?search_query=${query}`);
		if (!result.ok) {
			failureReason = result.reason || `YouTube search returned HTTP ${result.statusCode}.`;
			continue;
		}

		sawSuccess = true;
		for (const videoId of extractYoutubeResultIds(result.body).slice(0, 10)) {
			collectedIds.add(videoId);
		}
	}

	if (!sawSuccess) {
		return {
			ok: false,
			reason: failureReason,
			videoIds: [],
		};
	}

	return {
		ok: true,
		videoIds: [...collectedIds].slice(0, 10),
	};
}

function runEditorialAudit(rootDir, candidates) {
	const fallbackPaths = [
		path.resolve(__dirname, '../../la-posta-cine-add-movie/scripts/review_audit.cjs'),
		path.resolve(__dirname, '../../la-posta-cine-add-movie/scripts/review_audit.js'),
		path.resolve(process.env.USERPROFILE || '', '.codex/skills/la-posta-cine-add-movie/scripts/review_audit.cjs'),
		path.resolve(process.env.USERPROFILE || '', '.codex/skills/la-posta-cine-add-movie/scripts/review_audit.js'),
	];
	const reviewAuditPath = fallbackPaths.find((candidatePath) => candidatePath && fs.existsSync(candidatePath));
	if (!reviewAuditPath) {
		return {
			status: 'warn',
			message: `review_audit.cjs not found in expected repo or global skill locations.`,
		};
	}

	const candidateBatches =
		candidates.length > 0
			? Array.from({ length: Math.ceil(candidates.length / MAX_REVIEW_AUDIT_BATCH_SIZE) }, (_, batchIndex) =>
					candidates.slice(
						batchIndex * MAX_REVIEW_AUDIT_BATCH_SIZE,
						(batchIndex + 1) * MAX_REVIEW_AUDIT_BATCH_SIZE,
					),
			  )
			: [[]];
	const failureMessages = [];

	for (const batch of candidateBatches) {
		const args = [reviewAuditPath, '--root', rootDir];
		for (const candidate of batch) {
			args.push('--candidate', candidate);
		}

		const result = spawnSync(process.execPath, args, {
			cwd: process.cwd(),
			encoding: 'utf8',
		});

		if (result.status !== 0) {
			const message = (result.stderr || result.stdout || 'review audit failed').trim();
			if (message) {
				failureMessages.push(message);
			}
		}
	}

	if (failureMessages.length > 0) {
		return {
			status: 'error',
			message: [...new Set(failureMessages)].join('\n'),
		};
	}

	return {
		status: 'ok',
		message:
			candidates.length > 0
				? `review audit passed for ${candidates.length} file(s)`
				: 'review audit passed',
	};
}

function loadKnownMovieSlugs(rootDir) {
	const knownMovieSlugs = new Set();
	for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
		if (!entry.isFile() || !entry.name.endsWith('.json')) {
			continue;
		}

		try {
			const movie = readJson(path.join(rootDir, entry.name));
			if (typeof movie.slug === 'string' && movie.slug.trim().length > 0) {
				knownMovieSlugs.add(movie.slug.trim());
			}
		} catch {
			// Ignore malformed files here; they are handled later when audited directly.
		}
	}

	return knownMovieSlugs;
}

function validateCatalogUniqueness(rootDir, candidatePaths, findings) {
	const candidateAbsolutePaths = new Set(candidatePaths.map((candidate) => path.resolve(candidate)));
	const indexes = new Map();
	const titleIndexes = new Map();

	for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
		if (!entry.isFile() || !entry.name.endsWith('.json')) {
			continue;
		}

		const filePath = path.join(rootDir, entry.name);
		let movie;
		try {
			movie = readJson(filePath);
		} catch {
			continue;
		}

		const keys = [];
		if (typeof movie.slug === 'string' && movie.slug.trim().length > 0) {
			keys.push(`slug:${normalizeText(movie.slug)}`);
		}
		if (Number.isInteger(movie.year)) {
			for (const titleVariant of [movie.title, movie.originalTitle]) {
				const normalizedTitle = normalizeText(titleVariant);
				if (normalizedTitle) {
					keys.push(`title-year:${movie.year}:${normalizedTitle}`);
					const titleOwners = titleIndexes.get(normalizedTitle) || new Map();
					titleOwners.set(path.resolve(filePath), movie.year);
					titleIndexes.set(normalizedTitle, titleOwners);
				}
			}
		}

		for (const key of new Set(keys)) {
			const owners = indexes.get(key) || new Set();
			owners.add(path.resolve(filePath));
			indexes.set(key, owners);
		}
	}

	for (const [key, owners] of indexes) {
		if (owners.size < 2) {
			continue;
		}

		const ownerList = [...owners].sort();
		for (const owner of ownerList) {
			if (!candidateAbsolutePaths.has(owner)) {
				continue;
			}
			const otherOwners = ownerList.filter((other) => other !== owner);
			addFinding(
				findings,
				'error',
				'duplicate-catalog-entry',
				owner,
				`Candidate conflicts with ${otherOwners.join(', ')} on ${key}. Keep only one source entry or correct the title/year/slug before publication.`,
			);
		}
	}

	for (const [normalizedTitle, owners] of titleIndexes) {
		const years = new Set(owners.values());
		if (years.size < 2) {
			continue;
		}

		for (const owner of owners.keys()) {
			if (!candidateAbsolutePaths.has(owner)) {
				continue;
			}
			addFinding(
				findings,
				'info',
				'same-title-different-year',
				owner,
				`Catalog also contains the normalized title "${normalizedTitle}" in year(s) ${[...years].sort().join(', ')}. Confirm this is a distinct remake or release before publication.`,
			);
		}
	}
}

async function auditCandidates(args) {
	const rootDir = path.resolve(args.root);
	if (!fs.existsSync(rootDir)) {
		throw new Error(`Movies directory not found: ${rootDir}`);
	}

	const candidatePaths = args.candidates.length > 0
		? args.candidates
		: args.all
			? listAllCandidates(rootDir)
			: listRecentCandidates(args.root, args.baseRef);

	if (candidatePaths.length === 0) {
		return {
			baseRef: args.baseRef,
			root: args.root,
			candidates: [],
			editorialAudit: {
				status: 'skip',
				message: 'No candidate movie files found to audit.',
			},
			findings: [],
		};
	}

	const catalogPath = path.resolve('docs/movie-catalog-reference.md');
	const catalogText = fs.existsSync(catalogPath) ? fs.readFileSync(catalogPath, 'utf8') : '';
	const knownMovieSlugs = loadKnownMovieSlugs(rootDir);
	const peopleCatalog = loadPeopleCatalog();
	const peopleCatalogIndex = buildPeopleCatalogIndex(peopleCatalog);
	const exclusiveProfileCatalog = loadExclusiveProfileCatalog();
	const exclusiveProfileIndex = buildExclusiveProfileIndex(exclusiveProfileCatalog);
	const findings = [];
	const candidateMovies = [];
	validateCatalogUniqueness(rootDir, candidatePaths, findings);

	const committedChanges = listCommittedChanges(args.baseRef);
	const normalizedRoot = args.root.replace(/\\/g, '/').replace(/\/+$/, '');
	const unexpectedCommittedChanges = committedChanges.filter((filePath) => {
		const normalizedPath = filePath.replace(/\\/g, '/');
		if (normalizedPath.startsWith(`${normalizedRoot}/`)) {
			return false;
		}
		if (normalizedPath === 'src/data/people.json') {
			return false;
		}
		if (normalizedPath.startsWith('public/people/')) {
			return false;
		}
		return normalizedPath !== 'docs/movie-catalog-reference.md' && normalizedPath !== 'src/data/upcomingReleases.generated.ts';
	});

	for (const filePath of unexpectedCommittedChanges) {
		addFinding(findings, 'warn', 'unexpected-committed-change', filePath, 'Committed diff vs base includes a non-movie path.');
	}

	for (const candidate of candidatePaths) {
		const absolutePath = path.resolve(candidate);
		if (!fs.existsSync(absolutePath)) {
			addFinding(findings, 'error', 'missing-file', candidate, 'Candidate file does not exist on disk.');
			continue;
		}

		let movie;
		try {
			movie = readJson(absolutePath);
		} catch (error) {
			addFinding(findings, 'error', 'invalid-json', candidate, `Failed to parse JSON: ${error.message}`);
			continue;
		}

		candidateMovies.push({
			filePath: candidate,
			movie,
		});

		validateMovieShape(movie, candidate, catalogText, findings, knownMovieSlugs);
		if (args.verifyCommunityBuild) {
			validateCommunityBuildRoute(movie, candidate, findings);
		}
		if (args.verifyReactionBuild) {
			validateReactionBuildRoute(movie, candidate, findings);
		}
		if (args.verifyCinemaCarouselBuild) {
			validateCinemaCarouselBuild(movie, candidate, findings);
		}
		if (args.verifyStreamingCarouselBuild) {
			validateStreamingCarouselBuild(movie, candidate, findings);
		}
		validatePeoplePool(movie, candidate, findings, peopleCatalog, peopleCatalogIndex, exclusiveProfileIndex);
		const trailerId = validateTrailerId(movie, candidate, findings);

		if (trailerId && !args.skipYoutube) {
			const trailerResult = await checkYoutubeOEmbed(trailerId);
			if (!trailerResult.ok) {
				addFinding(findings, 'error', 'youtube-oembed', candidate, trailerResult.reason);
				continue;
			}

			const trailerTitleAnalysis = analyzeYoutubeTitle(movie, trailerResult.title);
			let youtubeSearch = null;
			if (trailerTitleAnalysis.isShortOrAmbiguousTitle || !trailerTitleAnalysis.titleLooksRelated || !trailerTitleAnalysis.yearMentioned) {
				youtubeSearch = await searchYoutubeResults(movie);
				if (!youtubeSearch.ok) {
					addFinding(findings, 'warn', 'youtube-search-unavailable', candidate, youtubeSearch.reason);
				}
			}

			if (trailerTitleAnalysis.yearMentioned && !trailerTitleAnalysis.yearMatches) {
				const hasNearbyYear = trailerTitleAnalysis.mentionedYears.some((value) => Math.abs(value - movie.year) <= 1);
				addFinding(
					findings,
					hasNearbyYear && trailerTitleAnalysis.titleLooksRelated ? 'warn' : 'error',
					'youtube-year-mismatch',
					candidate,
					`YouTube title "${trailerResult.title}" mentions a different year than ${movie.year}.`,
				);
			}

			if (!trailerTitleAnalysis.titleLooksRelated) {
				if (youtubeSearch?.ok && youtubeSearch.videoIds.includes(trailerId)) {
					addFinding(findings, 'warn', 'youtube-title-mismatch', candidate, `YouTube title "${trailerResult.title}" does not text-match "${movie.title}", but the video does appear in YouTube search results for the movie.`);
				} else {
					addFinding(
						findings,
						'error',
						'youtube-title-mismatch',
						candidate,
						`YouTube title "${trailerResult.title}" does not look related enough to "${movie.title}".`,
					);
				}
			}

			if (
				(trailerTitleAnalysis.isShortOrAmbiguousTitle || !trailerTitleAnalysis.yearMentioned) &&
				!trailerTitleAnalysis.titleLooksRelated &&
				youtubeSearch?.ok &&
				!youtubeSearch.videoIds.includes(trailerId)
			) {
				addFinding(
					findings,
					'error',
					'youtube-search-mismatch',
					candidate,
					`trailerYoutubeId "${trailerId}" was not found in YouTube search results for "${movie.title} ${movie.year} trailer".`,
				);
			}
		}
	}

	const editorialAudit = runEditorialAudit(args.root, candidatePaths);
	if (editorialAudit.status === 'error') {
		addFinding(findings, 'error', 'review-audit', 'batch', editorialAudit.message);
	} else if (editorialAudit.status === 'warn') {
		addFinding(findings, 'warn', 'review-audit-missing', 'batch', editorialAudit.message);
	}

	return {
		baseRef: args.baseRef,
		root: args.root,
		candidates: candidatePaths,
		editorialAudit,
		findings,
	};
}

function printTextReport(report) {
	const errors = report.findings.filter((finding) => finding.severity === 'error');
	const warnings = report.findings.filter((finding) => finding.severity === 'warn');
	const infos = report.findings.filter((finding) => finding.severity === 'info');

	console.log(`Audited ${report.candidates.length} candidate file(s) from ${report.baseRef} against ${report.root}.`);
	console.log(`Editorial audit: ${report.editorialAudit.message}`);

	if (report.findings.length === 0) {
		console.log('Result: PASS');
		return;
	}

	if (errors.length === 0 && warnings.length === 0) {
		console.log(`Result: PASS WITH INFO (${infos.length} informational finding(s))`);
	} else if (errors.length === 0) {
		console.log(`Result: PASS WITH WARNINGS (${warnings.length} warning(s))`);
	} else {
		console.log(`Result: FAIL (${errors.length} error(s), ${warnings.length} warning(s))`);
	}
	for (const finding of report.findings) {
		console.log(`[${finding.severity.toUpperCase()}] ${finding.code} :: ${finding.file} :: ${finding.message}`);
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

	if (!args.recent && !args.all && args.candidates.length === 0) {
		args.recent = true;
	}

	try {
		const report = await auditCandidates(args);
		if (args.format === 'json') {
			console.log(JSON.stringify(report, null, 2));
		} else {
			printTextReport(report);
		}

		const hasErrors = report.findings.some((finding) => finding.severity === 'error');
		process.exit(hasErrors ? 1 : 0);
	} catch (error) {
		console.error(error.message);
		process.exit(1);
	}
}

main();

