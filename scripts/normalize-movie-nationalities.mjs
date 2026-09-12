import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const MOVIES_DIR = path.resolve('src/data/movies');
const TMDB_HEADERS = { 'user-agent': 'CinePosta nationality audit/1.0 (metadata verification)' };
const WIKIDATA_ENDPOINT = 'https://query.wikidata.org/sparql';
let nextTmdbRequestAt = 0;
const COUNTRY_ALIASES = new Map([
	['argentina', 'AR'], ['australia', 'AU'], ['austria', 'AT'], ['alemania', 'DE'], ['germany', 'DE'], ['belgica', 'BE'], ['belgium', 'BE'], ['brasil', 'BR'], ['brazil', 'BR'], ['canada', 'CA'],
	['chile', 'CL'], ['china', 'CN'], ['colombia', 'CO'], ['corea del sur', 'KR'], ['south korea', 'KR'], ['dinamarca', 'DK'], ['denmark', 'DK'], ['espana', 'ES'], ['spain', 'ES'],
	['estados unidos', 'US'], ['united states', 'US'], ['united states of america', 'US'], ['etats unis', 'US'], ['vereinigte staaten us', 'US'],
	['filipinas', 'PH'], ['philippines', 'PH'], ['finlandia', 'FI'], ['finland', 'FI'], ['francia', 'FR'], ['france', 'FR'], ['hong kong', 'HK'], ['india', 'IN'], ['indonesia', 'ID'],
	['irlanda', 'IE'], ['ireland', 'IE'], ['islandia', 'IS'], ['iceland', 'IS'], ['italia', 'IT'], ['italy', 'IT'], ['japon', 'JP'], ['japan', 'JP'], ['kazajistan', 'KZ'], ['kazakhstan', 'KZ'], ['malasia', 'MY'], ['malaysia', 'MY'],
	['marruecos', 'MA'], ['morocco', 'MA'], ['mexico', 'MX'], ['nigeria', 'NG'], ['noruega', 'NO'], ['norway', 'NO'], ['nueva zelanda', 'NZ'], ['new zealand', 'NZ'], ['paises bajos', 'NL'], ['netherlands', 'NL'],
	['peru', 'PE'], ['reino unido', 'GB'], ['united kingdom', 'GB'], ['republica checa', 'CZ'], ['czech republic', 'CZ'], ['republica dominicana', 'DO'], ['dominican republic', 'DO'], ['rusia', 'RU'], ['russia', 'RU'],
	['sudafrica', 'ZA'], ['south africa', 'ZA'], ['suecia', 'SE'], ['sweden', 'SE'], ['suiza', 'CH'], ['switzerland', 'CH'], ['tailandia', 'TH'], ['thailand', 'TH'], ['turquia', 'TR'], ['turkey', 'TR'], ['union sovietica', 'SU'], ['soviet union', 'SU'],
	['checoslovaquia', 'XC'], ['czechoslovakia', 'XC'], ['taiwan', 'TW'], ['arabia saudita', 'SA'], ['saudi arabia', 'SA'], ['uk', 'GB'],
]);

function parseArgs(argv) {
	const args = { write: false, limit: Number.POSITIVE_INFINITY };
	for (let index = 0; index < argv.length; index += 1) {
		const token = argv[index];
		if (token === '--write') args.write = true;
		else if (token === '--limit') args.limit = Number(argv[++index]);
		else if (token === '--help' || token === '-h') {
			console.log('Usage: node scripts/normalize-movie-nationalities.mjs [--write] [--limit <count>]');
			process.exit(0);
		} else throw new Error(`Argumento no reconocido: ${token}`);
	}
	if (args.limit !== Number.POSITIVE_INFINITY && (!Number.isInteger(args.limit) || args.limit < 1)) {
		throw new Error('--limit debe ser un entero positivo.');
	}
	return args;
}

function normalizeText(value) {
	return String(value ?? '')
		.replaceAll('¹', '1')
		.replaceAll('²', '2')
		.replaceAll('³', '3')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/([a-z])([0-9])/g, '$1 $2')
		.replace(/[^a-z0-9]+/g, ' ')
		.trim();
}

function canonicalizeCountryToken(value) {
	const normalized = normalizeText(value);
	if (/^[a-z]{2}$/.test(normalized)) return normalized.toUpperCase() === 'UK' ? 'GB' : normalized.toUpperCase();
	return COUNTRY_ALIASES.get(normalized);
}

function canonicalizeCountryList(value) {
	const tokens = String(value ?? '')
		.replace(/\s+(?:y|and)\s+/gi, ',')
		.replaceAll('/', ',')
		.split(',');
	const codes = tokens.map(canonicalizeCountryToken).filter(Boolean);
	return [...new Set(codes)].join(', ');
}

function extractMovieSchema(html) {
	for (const match of html.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)<\/script>/g)) {
		const json = match[1].replace(/^\s*\/\*\s*<!\[CDATA\[\s*\*\/\s*/i, '').replace(/\s*\/\*\s*\]\]>\s*\*\/\s*$/i, '');
		try {
			const parsed = JSON.parse(json);
			if (parsed?.['@type'] === 'Movie') return parsed;
		} catch {
			// Ignore non-JSON schema blocks and keep looking for the Movie payload.
		}
	}
	return null;
}

async function fetchText(url) {
	for (let attempt = 0; attempt < 4; attempt += 1) {
		const waitMs = Math.max(0, nextTmdbRequestAt - Date.now());
		if (waitMs > 0) await new Promise((resolve) => setTimeout(resolve, waitMs));
		nextTmdbRequestAt = Date.now() + 350;
		const response = await fetch(url, { headers: TMDB_HEADERS });
		if (response.ok) return response.text();
		if (response.status !== 429 || attempt === 3) throw new Error(`TMDB HTTP ${response.status}`);
		await new Promise((resolve) => setTimeout(resolve, 2_000 * (attempt + 1)));
	}
	throw new Error('TMDB request exhausted unexpectedly.');
}

async function findTmdbMovie(movie) {
	const queries = [...new Set([
		`${movie.originalTitle} ${movie.year}`,
		`${movie.title} ${movie.year}`,
		movie.originalTitle,
		movie.title,
	].filter(Boolean))];
	const seen = new Set();
	const candidates = [];
	for (const query of queries) {
		const search = await fetchText(`https://www.themoviedb.org/search/movie?query=${encodeURIComponent(query)}`);
		const links = [...new Set([...search.matchAll(/href="(\/movie\/\d+(?:-[^"#?]+)?)/g)].map((match) => match[1]))].slice(0, 6);
		for (const link of links) {
			if (seen.has(link)) continue;
			seen.add(link);
			const schema = extractMovieSchema(await fetchText(`https://www.themoviedb.org${link}`));
			if (!schema?.name || !Array.isArray(schema.countryOfOrigin)) continue;
			const year = Number(String(schema.releasedEvent?.[0]?.startDate ?? '').slice(0, 4));
			const candidateTitle = normalizeText(schema.name);
			const exactTitle = [movie.title, movie.originalTitle].some((title) => normalizeText(title) === candidateTitle);
			const countries = schema.countryOfOrigin.map((country) => canonicalizeCountryToken(country?.name)).filter(Boolean);
			if (exactTitle && Math.abs(year - movie.year) <= 1 && countries.length > 0) {
				return { country: [...new Set(countries)].join(', '), source: `https://www.themoviedb.org${link}` };
			}
			candidates.push({ title: schema.name, year, link: `https://www.themoviedb.org${link}` });
		}
	}
	return { candidates };
}

function escapeSparqlLiteral(value) {
	return String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}

function chunk(values, size) {
	return Array.from({ length: Math.ceil(values.length / size) }, (_, index) => values.slice(index * size, (index + 1) * size));
}

async function findWikidataMovies(entries) {
	const matches = new Map();
	for (const group of chunk(entries, 40)) {
		const values = group
			.map((entry) => `("${escapeSparqlLiteral(entry.movie.originalTitle)}"@en ${entry.movie.year})`)
			.join(' ');
		const query = `
SELECT ?title ?year ?item ?countryCode WHERE {
  VALUES (?title ?year) { ${values} }
  ?item rdfs:label ?title ; wdt:P577 ?releaseDate ; wdt:P495 ?country .
  ?country wdt:P297 ?countryCode .
  FILTER(YEAR(?releaseDate) = ?year)
}`;
		const response = await fetch(`${WIKIDATA_ENDPOINT}?format=json&query=${encodeURIComponent(query)}`, {
			headers: { accept: 'application/sparql-results+json', 'user-agent': 'CinePosta nationality audit/1.0 (metadata verification)' },
		});
		if (!response.ok) throw new Error(`Wikidata HTTP ${response.status}`);
		const payload = await response.json();
		const byIdentity = new Map();
		for (const binding of payload.results?.bindings ?? []) {
			const key = `${normalizeText(binding.title?.value)}::${binding.year?.value}`;
			const code = canonicalizeCountryToken(binding.countryCode?.value);
			if (!code) continue;
			const current = byIdentity.get(key) ?? { codes: new Set(), source: binding.item?.value };
			current.codes.add(code);
			byIdentity.set(key, current);
		}
		for (const entry of group) {
			const found = byIdentity.get(`${normalizeText(entry.movie.originalTitle)}::${entry.movie.year}`);
			if (found?.codes.size) {
				matches.set(entry.file, { entry, country: [...found.codes].sort().join(', '), source: found.source });
			}
		}
	}
	return matches;
}

async function mapWithConcurrency(values, limit, mapper) {
	const result = new Array(values.length);
	let cursor = 0;
	await Promise.all(Array.from({ length: Math.min(limit, values.length) }, async () => {
		while (cursor < values.length) {
			const index = cursor++;
			result[index] = await mapper(values[index]);
		}
	}));
	return result;
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	const files = (await readdir(MOVIES_DIR)).filter((file) => file.endsWith('.json')).sort();
	const entries = await Promise.all(files.map(async (file) => ({
		file,
		filePath: path.join(MOVIES_DIR, file),
		movie: JSON.parse(await readFile(path.join(MOVIES_DIR, file), 'utf8')),
	})));
	const missing = entries.filter((entry) => !canonicalizeCountryList(entry.movie.country)).slice(0, args.limit);
	const wikidataMatches = await findWikidataMovies(missing);
	const unresolvedAfterWikidata = missing.filter((entry) => !wikidataMatches.has(entry.file));
	const tmdbResolved = await mapWithConcurrency(unresolvedAfterWikidata, 1, async (entry) => {
		try {
			const match = await findTmdbMovie(entry.movie);
			return { entry, ...match };
		} catch (error) {
			return { entry, error: error instanceof Error ? error.message : String(error) };
		}
	});
	const resolved = missing.map((entry) => wikidataMatches.get(entry.file) ?? tmdbResolved.find((item) => item.entry.file === entry.file));

	const sourceByFile = new Map(resolved.filter((item) => item?.country).map((item) => [item.entry.file, item]));
	const unresolved = resolved.filter((item) => !item?.country);
	let changed = 0;
	for (const entry of entries) {
		const country = canonicalizeCountryList(entry.movie.country) || sourceByFile.get(entry.file)?.country;
		if (!country) continue;
		const isArgentinian = country.split(', ').includes('AR');
		if (entry.movie.country !== country || entry.movie.isArgentinian !== isArgentinian) {
			changed += 1;
			if (args.write) {
				entry.movie.country = country;
				entry.movie.isArgentinian = isArgentinian;
				await writeFile(entry.filePath, `${JSON.stringify(entry.movie, null, '\t')}\n`, 'utf8');
			}
		}
	}

	console.log(JSON.stringify({
		total: entries.length,
		missingBefore: missing.length,
		resolvedFromWikidata: wikidataMatches.size,
		resolvedFromTmdb: sourceByFile.size - wikidataMatches.size,
		changed,
		unresolved: unresolved.map((item) => item ? ({ file: item.entry.file, title: item.entry.movie.title, year: item.entry.movie.year, error: item.error, candidates: item.candidates ?? [] }) : null),
		mode: args.write ? 'write' : 'check',
	}, null, 2));
	if (unresolved.length > 0) process.exitCode = 1;
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
});
