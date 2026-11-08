import MiniSearch from 'minisearch';
import type { HomeMovieRecord } from '../types/home-catalog';
import { matchesAnyFilterValue, matchesCatalogGenre } from './catalog-filters.ts';

export const normalizeQuery = (value: string): string => value.toLowerCase().normalize('NFD')
	.replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}+<>=.,"\s-]/gu, ' ').replace(/\s+/g, ' ').trim();
const words = (value: string): string[] => value.match(/[\p{L}\p{N}]+/gu) ?? [];
const stopWords = new Set('pelicula peliculas peli pelis filme filmes cine una un el la los las de del en con por para que sea sean quiero ver buscar buscame mostrar mostrame algo y o'.split(' '));
const genreAliases: Record<string, string[]> = {
	accion: ['accion', 'action'], comedia: ['comedia', 'comedias', 'comedy'],
	documental: ['documental', 'documentales'], terror: ['terror', 'horror', 'miedo'],
	drama: ['drama', 'dramas'], thriller: ['thriller', 'suspenso', 'suspense'],
	'sci-fi': ['ciencia ficcion', 'sci fi', 'scifi', 'sci-fi'],
	superheroes: ['superheroes'], animacion: ['animacion', 'animada', 'animadas', 'dibujos animados'],
	anime: ['anime'], romance: ['romance', 'romantica', 'romanticas'], musical: ['musical', 'musicales'],
	crimen: ['crimen', 'criminal', 'policial', 'policiales'], aventura: ['aventura', 'aventuras'],
	guerra: ['guerra', 'belica', 'belicas'], culto: ['de culto'],
	'pelicula-nacional': ['argentina', 'argentinas', 'argentino', 'argentinos', 'nacional', 'nacionales'],
};
const subgenreAliases: Record<string, string[]> = {
	gore: ['gore'], slasher: ['slasher'], 'found-footage': ['found footage', 'metraje encontrado'],
	romcom: ['comedia romantica', 'comedias romanticas', 'romcom'], 'body-horror': ['body horror', 'terror corporal'],
	psychological: ['psicologico', 'psicologica'], supernatural: ['sobrenatural'], heist: ['heist', 'robos'],
	'road-movie': ['road movie'], 'coming-of-age': ['coming of age'], mockumentary: ['mockumentary', 'falso documental'],
	exploitation: ['exploitation'],
};
const platformAliases: Record<string, string[]> = {
	netflix: ['netflix'], 'hbo max': ['hbo max', 'hbo', 'max'],
	'disney plus': ['disney plus', 'disney+', 'disney'], 'prime video': ['amazon prime video', 'amazon prime', 'prime video', 'prime'],
	'paramount plus': ['paramount plus', 'paramount+', 'paramount'], 'apple tv': ['apple tv+', 'apple tv', 'apple'],
	'mercado play': ['mercado play'], 'cine.ar': ['cine ar', 'cine.ar'], cine: ['en cines', 'en salas'],
	flow: ['personal flow', 'flow'], mubi: ['mubi'], crunchyroll: ['crunchyroll'], 'otras plataformas': ['otras plataformas'],
};

type FacetKind = 'genres' | 'subgenres' | 'platforms';
const editorialGenreIds = new Set(['superheroes', 'pelicula-nacional', 'guerra', 'culto', 'oscar-mejor-pelicula']);
type Alias = { phrase: string; value: string; kind: FacetKind };
const aliases: Alias[] = Object.entries({ genres: genreAliases, subgenres: subgenreAliases, platforms: platformAliases })
	.flatMap(([kind, values]) => Object.entries(values).flatMap(([value, phrases]) => phrases.map((phrase) => ({ phrase, value, kind: kind as FacetKind }))))
	.sort((a, b) => b.phrase.length - a.phrase.length);
const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const numberPattern = '(10|[0-9](?:[.,][0-9])?)(?![0-9])';

export interface ParsedMovieQuery {
	text: string;
	genres: string[];
	editorialFilters: string[];
	subgenres: string[];
	platforms: string[];
	minYear: number | null;
	maxYear: number | null;
	minScore: number | null;
	maxScore: number | null;
	role: 'searchDirector' | 'searchCast' | null;
	labels: string[];
	excludedGenres: string[];
	excludedSubgenres: string[];
	excludedPlatforms: string[];
	phrases: string[];
}

// A single insertion, deletion, substitution or adjacent transposition. Only used
// for long, unambiguous facet names; never fuzzy-match dates or numeric scores.
function oneTypo(a: string, b: string): boolean {
	if (a === b) return true;
	if (Math.abs(a.length - b.length) > 1) return false;
	if (a.length === b.length) {
		const differences = [...a].flatMap((char, i) => char === b[i] ? [] : [i]);
		return differences.length === 1 || (differences.length === 2 && differences[1] === differences[0] + 1 &&
			a[differences[0]] === b[differences[1]] && a[differences[1]] === b[differences[0]]);
	}
	const [shorter, longer] = a.length < b.length ? [a, b] : [b, a];
	let i = 0;
	while (i < shorter.length && shorter[i] === longer[i]) i++;
	return shorter.slice(i) === longer.slice(i + 1);
}

export function parseMovieQuery(raw: string, titles: ReadonlySet<string> = new Set(), names?: ReadonlySet<string>): ParsedMovieQuery {
	let query = normalizeQuery(raw.slice(0, 300));
	const parsed: ParsedMovieQuery = { text: '', genres: [], editorialFilters: [], subgenres: [], platforms: [], minYear: null, maxYear: null, minScore: null, maxScore: null, role: null, labels: [], excludedGenres: [], excludedSubgenres: [], excludedPlatforms: [], phrases: [] };
	const intersectRange = (minKey: 'minYear' | 'minScore', maxKey: 'maxYear' | 'maxScore', min: number | null, max: number | null): void => {
		if (min !== null) parsed[minKey] = Math.max(parsed[minKey] ?? min, min);
		if (max !== null) parsed[maxKey] = Math.min(parsed[maxKey] ?? max, max);
	};
	const years = (min: number | null, max: number | null): void => intersectRange('minYear', 'maxYear', min, max);
	const scores = (min: number | null, max: number | null): void => intersectRange('minScore', 'maxScore', min, max);
	const protectedText: string[] = [];
	const protect = (text: string): string => { protectedText.push(text); return ` zprotected${protectedText.length - 1}z `; };
	// Quotes and known titles win over facet words/numbers: "1984", Max,
	// 2001: Odisea del espacio, etc. Only whole titles, never arbitrary substrings.
	query = query.replace(/"([^"]+)"/g, (_, text: string) => { parsed.phrases.push(text); return protect(text); });
	const tokens = query.split(' ');
	for (let i = 0; i < tokens.length; i++) {
		for (let end = tokens.length; end > i; end--) {
			const phrase = tokens.slice(i, end).join(' ');
			const numericTitleWithPlatform = /^\d{4}$/.test(phrase) && tokens[end] === 'en' && (i === 0 || !/^(de|del|ano)$/.test(tokens[i - 1]));
			if ((titles.has(phrase) && (end - i > 1 || tokens.length === 1 || numericTitleWithPlatform)) || (end - i > 1 && names?.has(phrase))) {
				tokens.splice(i, end - i, protect(phrase).trim());
				break;
			}
		}
	}
	query = tokens.join(' ');
	const score = (value: string): number => Number(value.replace(',', '.'));
	query = query.replace(new RegExp(`\\bentre ${numberPattern} y ${numberPattern} (?:puntos?|estrellas?)\\b`, 'g'), (_, low: string, high: string) => {
		scores(score(low), score(high)); return ' ';
	});
	query = query.replace(new RegExp(`(?:\\b(?:score|puntaje|puntuacion|nota)\\s*)?(?:\\b(mas de|mayor (?:a|que)|menos de|menor (?:a|que)|al menos|minimo(?: de)?|como minimo|hasta|como maximo|maximo(?: de)?)\\s*|([<>]=?|=)\\s*)${numberPattern}(?:\\s*(?:puntos?|estrellas?|de score))?`, 'g'), (_, operator: string, symbol: string, value: string) => {
		const n = score(value);
		const op = symbol || ({ 'mas de': '>', 'mayor a': '>', 'mayor que': '>', 'menos de': '<', 'menor a': '<', 'menor que': '<', hasta: '<=', 'como maximo': '<=', maximo: '<=', 'maximo de': '<=' }[operator] ?? '>=');
		if (op === '>') scores(Math.floor(n) + 1, null);
		else if (op === '>=') scores(n, null);
		else if (op === '<') scores(null, Math.ceil(n) - 1);
		else if (op === '<=') scores(null, n);
		else scores(n, n);
		return ' ';
	});
	query = query.replace(new RegExp(`\\b(?:score|puntaje|puntuacion|nota)(?: de)? ${numberPattern}(?:\\s*puntos?)?\\b`, 'g'), (_, value: string) => {
		scores(score(value), score(value)); return ' ';
	});
	query = query.replace(/\bentre ((?:18|19|20)\d{2}) y ((?:18|19|20)\d{2})\b/g, (_, low: string, high: string) => {
		years(Number(low), Number(high)); return ' ';
	});
	const decadeNames: Record<string, number> = { veinte: 2020, treinta: 1930, cuarenta: 1940, cincuenta: 1950, sesenta: 1960, setenta: 1970, ochenta: 1980, noventa: 1990 };
	query = query.replace(/\b(?:de )?(?:los |anos )?(veinte|treinta|cuarenta|cincuenta|sesenta|setenta|ochenta|noventa)\b/g, (_, decade: string) => {
		years(decadeNames[decade], decadeNames[decade] + 9); return ' ';
	});
	query = query.replace(/\b(?:de (?:la )?decada (?:de|del)|(?:de )?los) ['’]?((?:(?:19|20)\d{2})|\d{2})\b|\b((?:19|20)?\d{2})s\b/g, (_, decade: string, suffix: string) => {
		const n = Number(decade ?? suffix);
		const year = n < 100 ? (n <= 20 ? 2000 : 1900) + n : n;
		const start = Math.floor(year / 10) * 10;
		years(start, start + 9); return ' ';
	});
	query = query.replace(/\b(?:antes de|anterior(?:es)? a|despues de|posterior(?:es)? a) ((?:18|19|20)\d{2})\b/g, (phrase: string, year: string) => {
		if (/^(antes|anterior)/.test(phrase)) years(null, Number(year) - 1);
		else years(Number(year) + 1, null);
		return ' ';
	});
	query = query.replace(/\b(?:viejas?|antiguas?|clasicas?|clasicos?)\b/g, () => { years(null, 1999); return ' '; });
	query = query.replace(/\b(?:del? (?:ano )?|ano )?((?:18|19|20)\d{2})\b/g, (_, year: string) => {
		years(Number(year), Number(year)); return ' ';
	});
	// Longest phrases first keeps "comedia romántica" and CINE.AR intact.
	for (const alias of aliases) {
		query = query.replace(new RegExp(`\\b(?:sin|excepto)\\s+${escapeRegex(alias.phrase)}(?=\\s|$|[,.])`, 'g'), () => {
			const target = alias.kind === 'genres' ? parsed.excludedGenres : alias.kind === 'subgenres' ? parsed.excludedSubgenres : parsed.excludedPlatforms;
			if (!target.includes(alias.value)) target.push(alias.value);
			return ' ';
		});
		query = query.replace(new RegExp(`(^|\\s)${escapeRegex(alias.phrase)}(?=\\s|$|[,.])`, 'g'), () => {
			if (!parsed[alias.kind].includes(alias.value)) parsed[alias.kind].push(alias.value);
			return ' ';
		});
	}
	query = query.split(/\s+/).map((token) => {
		if (token.length < 5 || /\d/.test(token)) return token;
		const candidates = aliases.filter((alias) => !alias.phrase.includes(' ') && alias.phrase.length >= 5 && oneTypo(token, alias.phrase));
		const unique = new Map(candidates.map((alias) => [`${alias.kind}:${alias.value}`, alias]));
		if (unique.size !== 1) return token;
		const alias = [...unique.values()][0];
		if (!parsed[alias.kind].includes(alias.value)) parsed[alias.kind].push(alias.value);
		return '';
	}).join(' ');
	query = query.replace(/\b(?:dirigida|dirigidas|dirigido|dirigidos|director|directora)(?: por)?\b/g, () => { parsed.role = 'searchDirector'; return ' '; });
	query = query.replace(/\b(?:protagonizada|protagonizadas|protagonizado|protagonizados|actor|actriz)(?: por)?\b/g, () => { parsed.role = 'searchCast'; return ' '; });
	parsed.text = query.replace(/[.,]+/g, ' ').split(/\s+/).filter((token) => token && !stopWords.has(token)).join(' ')
		.replace(/zprotected(\d+)z/g, (_, index: string) => protectedText[Number(index)]).trim();
	parsed.editorialFilters = parsed.genres.filter((genre) => editorialGenreIds.has(genre));
	parsed.genres = parsed.genres.filter((genre) => !editorialGenreIds.has(genre));
	const displayLabels: Record<string, string> = { accion: 'Acción', comedia: 'Comedia', terror: 'Terror', documental: 'Documentales', drama: 'Drama', thriller: 'Suspenso', animacion: 'Animación', musical: 'Musical', romance: 'Romance', crimen: 'Crimen', aventura: 'Aventura', culto: 'De culto', gore: 'Gore', romcom: 'Comedia romántica', psychological: 'Psicológico', supernatural: 'Sobrenatural', heist: 'Robos', 'sci-fi': 'Ciencia ficción', 'pelicula-nacional': 'Cine nacional', 'hbo max': 'HBO Max', netflix: 'Netflix', 'disney plus': 'Disney+', 'prime video': 'Prime Video', 'apple tv': 'Apple TV', 'paramount plus': 'Paramount+', mubi: 'MUBI', 'cine.ar': 'CINE.AR' };
	const label = (value: string): string => displayLabels[value] ?? value.replaceAll('-', ' ');
	parsed.labels = [...parsed.genres, ...parsed.editorialFilters, ...parsed.subgenres, ...parsed.platforms].map(label);
	parsed.labels.push(...[...parsed.excludedGenres, ...parsed.excludedSubgenres, ...parsed.excludedPlatforms].map((value) => `Sin ${label(value)}`));
	if (parsed.minYear !== null || parsed.maxYear !== null) parsed.labels.push(parsed.minYear !== null && parsed.maxYear !== null && parsed.minYear > parsed.maxYear ? 'Años incompatibles' : parsed.minYear === parsed.maxYear ? `${parsed.minYear}` : parsed.minYear === null ? `Anterior a ${parsed.maxYear! + 1}` : parsed.maxYear === null ? `Desde ${parsed.minYear}` : `${parsed.minYear}–${parsed.maxYear}`);
	if (parsed.minScore !== null || parsed.maxScore !== null) parsed.labels.push(parsed.minScore !== null && parsed.maxScore !== null && parsed.minScore > parsed.maxScore ? 'Puntajes incompatibles' : parsed.minScore === parsed.maxScore ? `Score = ${parsed.minScore}` : parsed.minScore === null ? `Score ≤ ${parsed.maxScore}` : parsed.maxScore === null ? `Score ≥ ${parsed.minScore}` : `Score ${parsed.minScore}–${parsed.maxScore}`);
	if (parsed.role) parsed.labels.push(parsed.role === 'searchDirector' ? 'dirección' : 'reparto');
	return parsed;
}

export function matchesParsedQuery(entry: HomeMovieRecord, parsed: ParsedMovieQuery): boolean {
	return matchesCatalogGenre(parsed.genres, entry) && matchesAnyFilterValue(parsed.editorialFilters, entry.genres) && matchesAnyFilterValue(parsed.subgenres, entry.subgenres) &&
		matchesAnyFilterValue(parsed.platforms, entry.platforms) &&
		!parsed.excludedGenres.some((genre) => editorialGenreIds.has(genre) ? entry.genres.includes(genre) : matchesCatalogGenre([genre], entry)) &&
		!parsed.excludedSubgenres.some((value) => entry.subgenres.includes(value)) && !parsed.excludedPlatforms.some((value) => entry.platforms.includes(value)) &&
		(parsed.minYear === null || Number(entry.year) >= parsed.minYear) && (parsed.maxYear === null || Number(entry.year) <= parsed.maxYear) &&
		(parsed.minScore === null || (entry.score !== null && entry.score >= parsed.minScore)) &&
		(parsed.maxScore === null || (entry.score !== null && entry.score <= parsed.maxScore));
}

export interface MovieSearchResult {
	ranks: Map<string, number>;
	parsed: ParsedMovieQuery;
	explanation: string;
}

export function matchesPersonName(name: string, query: string): boolean {
	return Boolean(query) && (name.includes(query) || (query.length >= 5 && oneTypo(name, query)));
}

export async function createMovieSearch(records: HomeMovieRecord[]) {
	const titles = new Set<string>();
	const names = new Set<string>();
	const directors = new Set<string>();
	const directorCounts = new Map<string, number>();
	const castCounts = new Map<string, number>();
	const recordTitles = new Map<string, string[]>();
	for (const entry of records) {
		const values = [entry.normalizedTitle, entry.normalizedOriginalTitle, ...entry.searchAliases.split(' | ')];
		for (const title of values) if (title) { titles.add(normalizeQuery(title)); titles.add(normalizeTitle(title)); }
		recordTitles.set(entry.slug, values.map(normalizeTitle));
		for (const [isDirector, value] of [[true, entry.searchDirector], [false, entry.searchCast]] as const) {
			for (const name of value.split(isDirector ? /\s*(?:,|\/|&| and | y )\s*/ : ' | ')) {
				if (!name) continue;
				names.add(name); if (isDirector) directors.add(name);
				const surname = words(name).at(-1);
				if (surname && surname.length >= 4) { names.add(surname); if (isDirector) directors.add(surname); }
				const counts = isDirector ? directorCounts : castCounts;
				for (const key of new Set([name, ...surname && surname.length >= 4 ? [surname] : []])) counts.set(key, (counts.get(key) ?? 0) + 1);
			}
		}
	}
	const namesByLength = new Map<number, string[]>();
	for (const name of names) {
		const group = namesByLength.get(name.length) ?? []; group.push(name); namesByLength.set(name.length, group);
	}
	const index = new MiniSearch({
		idField: 'slug', fields: ['normalizedTitle', 'normalizedOriginalTitle', 'searchAliases', 'searchDirector', 'searchCast'],
		tokenize: words, processTerm: (term) => term,
		searchOptions: { combineWith: 'AND', boost: { normalizedTitle: 8, normalizedOriginalTitle: 7, searchAliases: 7, searchDirector: 5, searchCast: 4 } },
	});
	// The synopsis remains searchable by a literal scan; indexing it multiplies
	// postings, startup cost and fuzzy false positives without helping title/credit queries.
	await index.addAllAsync(records, { chunkSize: 200 });
	let lastQuery = '';
	let cached: MovieSearchResult | undefined;
	return {
		stats: { documents: index.documentCount, terms: index.termCount },
		search(raw: string): MovieSearchResult {
			const query = normalizeQuery(raw.slice(0, 300));
			if (cached && query === lastQuery) return cached;
			lastQuery = query;
			const parsed = parseMovieQuery(query, titles, names);
			let person = names.has(parsed.text) ? parsed.text : '';
			if (!person && parsed.text.length >= 5 && !titles.has(parsed.text)) {
				const candidates = [-1, 0, 1].flatMap((offset) => namesByLength.get(parsed.text.length + offset) ?? []).filter((name) => oneTypo(name, parsed.text));
				if (candidates.length === 1) person = candidates[0];
			}
			// "de Spielberg" indicates direction when the name is a known director;
			// an explicit actor/actress instruction always wins.
			if (!parsed.role && directors.has(person) && (directorCounts.get(person) ?? 0) >= 2 && (directorCounts.get(person) ?? 0) > 2 * (castCounts.get(person) ?? 0) && /\bde\s/.test(query)) parsed.role = 'searchDirector';
			const titleQuery = !parsed.role && (titles.has(parsed.text) || titles.has(normalizeTitle(parsed.text)));
			const fields = parsed.role ? [parsed.role] : titleQuery ? ['normalizedTitle', 'normalizedOriginalTitle', 'searchAliases'] : person ? ['searchDirector', 'searchCast'] : undefined;
			const personPattern = person && fields && !titleQuery ? new RegExp(`(^|[^\\p{L}])${escapeRegex(person)}($|[^\\p{L}])`, 'u') : null;
			const creditTerms = words(parsed.text);
			const phraseTitles = parsed.phrases.map(normalizeTitle);
			const eligible = records.filter((entry) => matchesParsedQuery(entry, parsed) &&
				(!parsed.phrases.length || parsed.phrases.every((phrase, i) => entry.searchable.includes(phrase) || recordTitles.get(entry.slug)?.includes(phraseTitles[i]))) &&
				(!personPattern || fields!.some((field) => personPattern.test(entry[field as 'searchDirector' | 'searchCast']))) &&
				(!parsed.role || person || !creditTerms.length || entry[parsed.role].split(parsed.role === 'searchCast' ? ' | ' : /\s*(?:,|\/|&| and | y )\s*/).some((name) => creditTerms.every((term) => words(name).some((part) => part === term || (term.length >= 3 && part.startsWith(term)) || (term.length >= 4 && oneTypo(part, term)))))));
			const eligibleIds = new Set(eligible.map((entry) => entry.slug));
			const ranks = new Map<string, number>();
			let fuzzy = false;
			const text = words(parsed.text).join(' ');
			const normalizedText = normalizeTitle(parsed.text);
			if (text) {
				const options = { fields, filter: (result: { id: string | number }) => eligibleIds.has(String(result.id)), prefix: (term: string) => term.length >= 3 && !parsed.phrases.length };
				let results = index.search(text, options);
				if (!results.length && !titleQuery && !parsed.phrases.length && words(text).some((word) => word.length >= 4)) {
					results = index.search(text, { ...options, fuzzy: (term) => term.length >= 6 ? 2 : term.length >= 4 ? 1 : false, maxFuzzy: 2 });
					fuzzy = results.length > 0;
				}
				for (const result of results) {
					const matchingTitles = (recordTitles.get(String(result.id)) ?? []).filter((title) => result.terms.every((term) => words(title).includes(term)));
					const rank = fuzzy && matchingTitles.length ? 80 + Math.min(...matchingTitles.map((title) => words(title).length)) + 1 / (1 + result.score) : 200 - 140 * result.score / (20 + result.score);
					ranks.set(String(result.id), rank);
				}
			}
			for (const entry of eligible) {
				if (!text) { ranks.set(entry.slug, 200); continue; }
				// Preserve literal substring matches, including synopsis. Unknown text
				// can also match all its terms literally, but never fuzzily in synopsis.
				const literal = !fields && entry.searchable.includes(query.replaceAll('"', ''));
				if (literal && !ranks.has(entry.slug)) ranks.set(entry.slug, 220);
				if (ranks.has(entry.slug)) {
					if ((!fields || titleQuery) && recordTitles.get(entry.slug)?.includes(normalizedText)) ranks.set(entry.slug, 0);
					else if ((!fields || titleQuery) && recordTitles.get(entry.slug)?.some((title) => title.startsWith(normalizedText))) ranks.set(entry.slug, 20);
				}
			}
			if (!ranks.size && !fields && !parsed.phrases.length && text) {
				const terms = words(text);
				for (const entry of eligible) if (terms.every((term) => entry.searchable.includes(term))) ranks.set(entry.slug, 240);
			}
			const labels = parsed.labels.slice();
			if (person && parsed.role && !labels.includes('dirección') && !labels.includes('reparto')) labels.push(parsed.role === 'searchDirector' ? 'dirección' : 'reparto');
			const explanation = [...labels.length ? [`Interpretamos: ${labels.join(' · ')}.`] : [], ...fuzzy && ranks.size ? ['Incluimos coincidencias por escritura aproximada.'] : []].join(' ');
			cached = { ranks, parsed, explanation };
			return cached;
		},
	};
}

const normalizeTitle = (title: string): string => words(title).join(' ');
