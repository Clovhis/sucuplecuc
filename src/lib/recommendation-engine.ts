import type { Movie } from '../types/movie';
import { moviesSharePlatform } from './platforms.ts';

export type RecommendationGenreId =
	| 'accion'
	| 'comedia'
	| 'documental'
	| 'terror'
	| 'drama'
	| 'thriller'
	| 'sci-fi'
	| 'superheroes'
	| 'animacion'
	| 'anime'
	| 'romance'
	| 'crimen'
	| 'aventura'
	| 'fantasia'
	| 'familia'
	| 'musical'
	| 'western'
	| 'guerra'
	| 'misterio'
	| 'biografica'
	| 'deportes'
	| 'politica'
	| 'historia'
	| 'gore'
	| 'oscar-mejor-pelicula'
	| 'pelicula-nacional';

const RECOMMENDATION_GENRE_WEIGHTS: Record<RecommendationGenreId, number> = {
	accion: 13,
	comedia: 13,
	documental: 18,
	terror: 16,
	drama: 6,
	thriller: 15,
	'sci-fi': 17,
	superheroes: 14,
	animacion: 15,
	anime: 20,
	romance: 13,
	crimen: 16,
	aventura: 12,
	fantasia: 16,
	familia: 14,
	musical: 18,
	western: 19,
	guerra: 17,
	misterio: 15,
	biografica: 11,
	deportes: 15,
	politica: 16,
	historia: 9,
	gore: 14,
	'oscar-mejor-pelicula': 4,
	'pelicula-nacional': 8,
};

const LOW_SIGNAL_GENRE_IDS = new Set<RecommendationGenreId>(['drama', 'historia', 'biografica', 'oscar-mejor-pelicula']);
const TITLE_TOKEN_STOP_WORDS = new Set([
	'a',
	'al',
	'and',
	'chapter',
	'de',
	'del',
	'el',
	'la',
	'las',
	'los',
	'movie',
	'of',
	'part',
	'the',
	'un',
	'una',
	'vol',
	'y',
]);
const FRANCHISE_GENERIC_TITLE_TOKENS = new Set([
	'after',
	'black',
	'blue',
	'chapter',
	'chronicles',
	'dark',
	'day',
	'dead',
	'final',
	'last',
	'new',
	'night',
	'part',
	'return',
	'rise',
	'star',
	'the',
]);
const FRANCHISE_SHORT_TOKENS = new Set(['dc', 'it', 'ip', 'mib', 'xmen']);
const SUBGENRE_LABELS: Record<string, string> = {
	'body horror': 'body horror',
	'coming of age': 'coming of age',
	exploitation: 'exploitation',
	'found footage': 'found footage',
	gore: 'gore',
	heist: 'heist',
	mockumentary: 'mockumentary',
	psicologico: 'suspenso psicológico',
	'road movie': 'road movie',
	romcom: 'comedia romántica',
	slasher: 'slasher',
	sobrenatural: 'terror sobrenatural',
};
const RECOMMENDATION_GENRE_LABELS: Partial<Record<RecommendationGenreId, string>> = {
	accion: 'acción',
	aventura: 'aventura',
	comedia: 'comedia',
	crimen: 'crimen',
	documental: 'documental',
	fantasia: 'fantasía',
	guerra: 'guerra',
	misterio: 'misterio',
	romance: 'romance',
	'sci-fi': 'ciencia ficción',
	superheroes: 'superhéroes',
	terror: 'terror',
	thriller: 'thriller',
};
const EDITORIAL_THEME_PATTERNS: Array<[string, RegExp]> = [
	['crimen', /\b(atraco|asesin[oa]|chantaje|crimen|criminal|detective|estafa|mafia|polici[ai]|robo|secuestro)\b/],
	['poder', /\b(corrupci[oó]n|dictadura|gobierno|militar|poder|pol[ií]tica)\b/],
	['familia', /\b(familia|herman[oa]s?|madre|maternidad|padre|paternidad)\b/],
	['crecimiento', /\b(adolescencia|crecer|infancia|juventud|madurar)\b/],
	['miedo', /\b(demonio|fantasma|maldici[oó]n|monstruo|pesadilla|posesi[oó]n|vampir[oa]|zombie)\b/],
	['ciencia-ficcion', /\b(distop[ií]a|espacio|extraterrestre|futuro|inteligencia artificial|planeta|robot|viaje temporal)\b/],
	['supervivencia', /\b(escape|huida|perseguir|supervivencia)\b/],
];
const RECOMMENDATION_GENRE_CACHE = new WeakMap<object, RecommendationGenreId[]>();
const SUBGENRE_SIGNAL_CACHE = new WeakMap<object, string[]>();
const EDITORIAL_THEME_CACHE = new WeakMap<object, string[]>();
const TITLE_TOKEN_CACHE = new WeakMap<object, string[]>();
const PRIMARY_GENRE_CACHE = new WeakMap<object, RecommendationGenreId[]>();
const SUPERHERO_INCLUDE_TOKENS = [
	'ant-man',
	'aquaman',
	'avengers',
	'batman',
	'batgirl',
	'batman v superman',
	'birds of prey',
	'black adam',
	'black panther',
	'black widow',
	'blade',
	'blue beetle',
	'captain america',
	'captain marvel',
	'daredevil',
	'deadpool',
	'doctor strange',
	'elektra',
	'eternals',
	'fantastic four',
	'ghost rider',
	'green lantern',
	'guardians of the galaxy',
	'howard the duck',
	'hulk',
	'iron man',
	'justice league',
	'kraven',
	'madame web',
	'man of steel',
	'morbius',
	'punisher',
	'shang-chi',
	'shazam',
	'spider-man',
	'suicide squad',
	'supergirl',
	'superman',
	'the avengers',
	'the flash',
	'the incredible hulk',
	'the marvels',
	'thunderbolts',
	'thor',
	'venom',
	'watchmen',
	'wolverine',
	'wonder woman',
	'x-men',
	'zack snyders justice league',
];
const SUPERHERO_EXCLUDE_TOKENS = [
	'big hero 6',
	'into the spider-verse',
	'across the spider-verse',
	'spider-verse',
	'mario',
	'blade runner',
	'tetsuo',
];
const SUPERHERO_INCLUDED_SLUGS = new Set([
	'catwoman-2004',
	'constantine-2005',
	'dark-phoenix-2019',
	'jonah-hex-2010',
	'logan-2017',
	'the-dark-knight-2008',
	'the-dark-knight-rises-2012',
	'the-new-mutants-2020',
]);

function normalizeSearchText(value: string): string {
	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim();
}

function hasAnyToken(haystack: string, tokens: string[]): boolean {
	return tokens.some((token) => haystack.includes(token));
}

function isAnimationOrAnimeMovie(movie: Pick<Movie, 'category' | 'genres'>): boolean {
	const genreText = normalizeSearchText([movie.category ?? '', ...(movie.genres ?? [])].join(' '));
	return (
		genreText.includes('animacion') ||
		genreText.includes('animation') ||
		genreText.includes('anime')
	);
}

function isMarvelOrDcSuperheroMovie(
	movie: Pick<Movie, 'slug' | 'title' | 'originalTitle' | 'category' | 'genres'>,
): boolean {
	if (isAnimationOrAnimeMovie(movie)) {
		return false;
	}

	if (SUPERHERO_INCLUDED_SLUGS.has(movie.slug)) {
		return true;
	}

	const heroText = normalizeSearchText([movie.slug, movie.title, movie.originalTitle].join(' '));
	if (hasAnyToken(heroText, SUPERHERO_EXCLUDE_TOKENS)) {
		return false;
	}

	return hasAnyToken(heroText, SUPERHERO_INCLUDE_TOKENS);
}

function mapGenreToken(token: string, target: Set<RecommendationGenreId>): void {
	const normalized = normalizeSearchText(token).replace(/\s+/g, ' ');
	if (!normalized) return;

	if (normalized.includes('accion') || normalized === 'action') {
		target.add('accion');
	}
	if (normalized.includes('comedia')) {
		target.add('comedia');
	}
	if (normalized.includes('documental') || normalized.includes('documentary') || normalized.includes('docu')) {
		target.add('documental');
	}
	if (normalized.includes('terror') || normalized.includes('horror')) {
		target.add('terror');
	}
	if (normalized.includes('gore') || normalized.includes('splatter') || normalized.includes('tortura')) {
		target.add('gore');
		target.add('terror');
	}
	if (normalized.includes('drama') || normalized.includes('biografic')) {
		target.add('drama');
	}
	if (normalized.includes('thriller') || normalized.includes('suspenso')) {
		target.add('thriller');
	}
	if (
		normalized.includes('ciencia ficcion') ||
		normalized.includes('science fiction') ||
		normalized.includes('sci fi') ||
		normalized.includes('scifi') ||
		normalized.includes('sci-fi')
	) {
		target.add('sci-fi');
	}
	if (normalized.includes('animacion') || normalized.includes('animation')) {
		target.add('animacion');
	}
	if (
		normalized.includes('romance') ||
		normalized.includes('romantica') ||
		normalized.includes('romantic')
	) {
		target.add('romance');
	}
	if (normalized.includes('crimen') || normalized.includes('crime') || normalized.includes('policial')) {
		target.add('crimen');
	}
	if (
		normalized.includes('aventura') ||
		normalized.includes('adventure')
	) {
		target.add('aventura');
	}
	if (normalized.includes('fantasia') || normalized.includes('fantasy')) {
		target.add('fantasia');
	}
	if (normalized.includes('familia') || normalized.includes('familiar') || normalized.includes('family')) {
		target.add('familia');
	}
	if (normalized.includes('musical') || normalized.includes('musica') || normalized.includes('music')) {
		target.add('musical');
	}
	if (normalized.includes('western')) {
		target.add('western');
	}
	if (normalized.includes('belica') || normalized.includes('guerra') || normalized.includes('war')) {
		target.add('guerra');
	}
	if (normalized.includes('misterio') || normalized.includes('mystery')) {
		target.add('misterio');
	}
	if (normalized.includes('biografic') || normalized.includes('biopic') || normalized.includes('biografia')) {
		target.add('biografica');
	}
	if (normalized.includes('deporte') || normalized.includes('sport')) {
		target.add('deportes');
	}
	if (normalized.includes('politic')) {
		target.add('politica');
	}
	if (normalized.includes('historia') || normalized.includes('historical')) {
		target.add('historia');
	}
}

function isOscarBestPictureWinner(movie: Pick<Movie, 'awards'>): boolean {
	return (movie.awards?.wins ?? []).some((win) => {
		if (win.award !== 'oscar') {
			return false;
		}

		const normalizedCategory = normalizeSearchText(win.category);
		return (
			normalizedCategory.includes('mejor pelicula') ||
			normalizedCategory.includes('best picture') ||
			normalizedCategory.includes('outstanding picture')
		);
	});
}

function isArgentinianMovie(movie: Pick<Movie, 'country' | 'isArgentinian'>): boolean {
	if (movie.isArgentinian === true) {
		return true;
	}
	return movie.country?.trim().toUpperCase() === 'AR';
}

function getRecommendationGenres(
	movie: Pick<
		Movie,
		'slug' | 'title' | 'originalTitle' | 'category' | 'genres' | 'country' | 'isArgentinian' | 'awards'
	>,
): RecommendationGenreId[] {
	const cached = RECOMMENDATION_GENRE_CACHE.get(movie);
	if (cached) return cached;

	const genreSet = new Set<RecommendationGenreId>();
	let hasAnimeToken = false;
	const sourceGenres = Array.isArray(movie.genres) && movie.genres.length > 0 ? movie.genres : [];

	const normalizedCategory = normalizeSearchText(movie.category ?? '');
	if (normalizedCategory.includes('anime')) {
		hasAnimeToken = true;
	}
	mapGenreToken(movie.category ?? '', genreSet);
	for (const sourceGenre of sourceGenres) {
		const normalizedGenre = normalizeSearchText(sourceGenre);
		if (normalizedGenre.includes('anime')) {
			hasAnimeToken = true;
		}
		mapGenreToken(sourceGenre, genreSet);
		for (const chunk of sourceGenre.split(/[,/|]/g)) {
			const normalizedChunk = normalizeSearchText(chunk);
			if (normalizedChunk.includes('anime')) {
				hasAnimeToken = true;
			}
			mapGenreToken(chunk, genreSet);
		}
	}

	if (hasAnimeToken && movie.country?.trim().toUpperCase() === 'JP') {
		genreSet.delete('animacion');
		genreSet.add('anime');
	}

	if (isArgentinianMovie(movie)) {
		genreSet.add('pelicula-nacional');
	}

	if (isOscarBestPictureWinner(movie)) {
		genreSet.add('oscar-mejor-pelicula');
	}

	if (isMarvelOrDcSuperheroMovie(movie)) {
		genreSet.add('superheroes');
	}

	const genres = Object.keys(RECOMMENDATION_GENRE_WEIGHTS).filter((genreId) =>
		genreSet.has(genreId as RecommendationGenreId),
	) as RecommendationGenreId[];
	RECOMMENDATION_GENRE_CACHE.set(movie, genres);
	return genres;
}

function getNormalizedTitleTokens(movie: Pick<Movie, 'title' | 'originalTitle' | 'slug'>): string[] {
	const source = normalizeSearchText([movie.title, movie.originalTitle, movie.slug].join(' '))
		.replace(/[^a-z0-9\s]/g, ' ')
		.split(/\s+/)
		.map((token) => (token.endsWith('s') && token.length > 4 ? token.slice(0, -1) : token))
		.filter((token) => token.length >= 3 && !TITLE_TOKEN_STOP_WORDS.has(token) && !/^\d+$/.test(token));

	return Array.from(new Set(source));
}

function getSubgenreSignals(movie: Pick<Movie, 'subgenres'>): string[] {
	const cached = SUBGENRE_SIGNAL_CACHE.get(movie);
	if (cached) return cached;

	const signals = new Set<string>();
	for (const subgenre of movie.subgenres ?? []) {
		const normalized = normalizeSearchText(subgenre).replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
		if (normalized) {
			signals.add(normalized);
		}
	}
	const result = [...signals];
	SUBGENRE_SIGNAL_CACHE.set(movie, result);
	return result;
}

function getEditorialThemes(movie: Pick<Movie, 'synopsis' | 'review'>): string[] {
	const cached = EDITORIAL_THEME_CACHE.get(movie);
	if (cached) return cached;

	const text = normalizeSearchText(`${movie.synopsis ?? ''} ${movie.review ?? ''}`);
	const themes = EDITORIAL_THEME_PATTERNS.filter(([, pattern]) => pattern.test(text)).map(([theme]) => theme);
	EDITORIAL_THEME_CACHE.set(movie, themes);
	return themes;
}

function getSharedValues(sourceValues: string[], candidateValues: string[]): string[] {
	const sourceSet = new Set(sourceValues);
	return candidateValues.filter((value) => sourceSet.has(value));
}

function getComparableTitleTokens(movie: Pick<Movie, 'title' | 'originalTitle' | 'slug'>): string[] {
	const cached = TITLE_TOKEN_CACHE.get(movie);
	if (cached) return cached;

	const tokens = getNormalizedTitleTokens(movie).filter(
		(token) =>
			!FRANCHISE_GENERIC_TITLE_TOKENS.has(token) &&
			(token.length >= 5 || FRANCHISE_SHORT_TOKENS.has(token)),
	);
	TITLE_TOKEN_CACHE.set(movie, tokens);
	return tokens;
}

function areSameFranchise(source: Pick<Movie, 'title' | 'originalTitle' | 'slug'>, candidate: Pick<Movie, 'title' | 'originalTitle' | 'slug'>): boolean {
	const sourceTokens = getComparableTitleTokens(source);
	const candidateTokens = getComparableTitleTokens(candidate);
	if (sourceTokens.length === 0 || candidateTokens.length === 0) {
		return false;
	}

	const shared = sourceTokens.filter((token) => candidateTokens.includes(token));
	if (shared.length >= 2) {
		return true;
	}

	const [sourceLead] = sourceTokens;
	const [candidateLead] = candidateTokens;
	return sourceLead === candidateLead && sourceLead.length >= 5;
}

export interface MovieRecommendationAffinity {
	score: number;
	reason?: string;
}

function getPrimaryGenreMatches(source: Movie, candidate: Movie): RecommendationGenreId[] {
	function getPrimaryGenres(movie: Movie): RecommendationGenreId[] {
		const cached = PRIMARY_GENRE_CACHE.get(movie);
		if (cached) return cached;
		const genres = new Set<RecommendationGenreId>();
		mapGenreToken(movie.category, genres);
		const result = [...genres];
		PRIMARY_GENRE_CACHE.set(movie, result);
		return result;
	}

	const sourcePrimary = new Set(getPrimaryGenres(source));
	const candidatePrimary = new Set(getPrimaryGenres(candidate));
	return [...sourcePrimary].filter((genreId) => candidatePrimary.has(genreId));
}

function getRecommendationReason({
	sharedSubgenres,
	sharedThemes,
	sharedGenres,
	sameDirector,
	sharedCastCount,
	bothArgentinian: _bothArgentinian,
}: {
	sharedSubgenres: string[];
	sharedThemes: string[];
	sharedGenres: RecommendationGenreId[];
	sameDirector: boolean;
	sharedCastCount: number;
	bothArgentinian: boolean;
}): string | undefined {
	const labelGenre = (genre: RecommendationGenreId | undefined) =>
		genre ? RECOMMENDATION_GENRE_LABELS[genre] ?? genre : 'mismo clima';
	const labelTheme = (theme: string) => (theme === 'ciencia-ficcion' ? 'ciencia ficción' : theme);

	if (sameDirector) return 'Otra mirada del mismo director';
	if (sharedSubgenres.length > 0) return SUBGENRE_LABELS[sharedSubgenres[0]] ?? sharedSubgenres[0];
	if (sharedThemes.length > 0 && sharedGenres.length > 0) {
		return `${labelGenre(sharedGenres[0])} · ${labelTheme(sharedThemes[0])}`;
	}
	if (sharedCastCount > 0) return 'Un puente en el elenco';
	return undefined;
}

export function getMovieRecommendationAffinity(source: Movie, candidate: Movie): MovieRecommendationAffinity | null {
	if (source.slug === candidate.slug) {
		return null;
	}

	if (areSameFranchise(source, candidate)) {
		return null;
	}

	if (candidate.verdict !== 'recomendada') {
		return null;
	}

	const sourceGenres = getRecommendationGenres(source);
	const candidateGenres = getRecommendationGenres(candidate);
	const sharedGenres = candidateGenres.filter((genreId) => sourceGenres.includes(genreId));
	const genreScore = sharedGenres.reduce((total, genreId) => total + RECOMMENDATION_GENRE_WEIGHTS[genreId], 0);
	const hasSpecificGenreMatch = sharedGenres.some((genreId) => !LOW_SIGNAL_GENRE_IDS.has(genreId));
	const sharedPrimaryGenres = getPrimaryGenreMatches(source, candidate);
	const sameDirector = normalizeSearchText(source.director) === normalizeSearchText(candidate.director);
	const sourceCast = new Set(source.mainCast.map((castMember) => normalizeSearchText(castMember)));
	const sharedCastCount = candidate.mainCast.filter((castMember) =>
		sourceCast.has(normalizeSearchText(castMember)),
	).length;
	const sourceCountry = normalizeSearchText(source.country ?? '');
	const candidateCountry = normalizeSearchText(candidate.country ?? '');
	const sameCountry = Boolean(sourceCountry) && sourceCountry === candidateCountry;
	const bothArgentinian = isArgentinianMovie(source) && isArgentinianMovie(candidate);
	const sharedSubgenres = getSharedValues(getSubgenreSignals(source), getSubgenreSignals(candidate));
	const sharedThemes = getSharedValues(getEditorialThemes(source), getEditorialThemes(candidate));
	const yearDistance = Math.abs(source.year - candidate.year);
	const hasMeaningfulLink =
		sameDirector ||
		sharedCastCount > 0 ||
		hasSpecificGenreMatch ||
		sharedSubgenres.length > 0 ||
		sharedThemes.length > 0 ||
		sharedPrimaryGenres.length > 0;

	if (!hasMeaningfulLink) {
		return null;
	}

	let score = genreScore;
	score += sharedPrimaryGenres.length * 12;
	score += sharedSubgenres.length * 24;
	score += sharedThemes.length * 7;
	score += sharedCastCount * 8;

	if (sameDirector) {
		score += 18;
	}
	if (bothArgentinian) {
		score += hasSpecificGenreMatch || sharedThemes.length > 0 ? 8 : 2;
	} else if (sameCountry) {
		score += 4;
	}
	if (moviesSharePlatform(source, candidate)) {
		score += 2;
	}
	if (yearDistance === 0) {
		score += 6;
	} else if (yearDistance <= 3) {
		score += 4;
	} else if (yearDistance <= 8) {
		score += 2;
	} else if (yearDistance <= 15) {
		score += 1;
	}
	if (
		sharedGenres.length === 1 &&
		sharedGenres[0] === 'drama' &&
		!sameDirector &&
		sharedCastCount === 0 &&
		sharedSubgenres.length === 0 &&
		sharedThemes.length === 0
	) {
		score -= 22;
	}

	if (
		sourceGenres.includes('pelicula-nacional') &&
		!candidateGenres.includes('pelicula-nacional') &&
		!sameDirector &&
		sharedCastCount === 0
	) {
		score -= 10;
	}

	if (sourceGenres.includes('anime') !== candidateGenres.includes('anime')) {
		score -= 28;
	}

	if (sourceGenres.includes('superheroes') !== candidateGenres.includes('superheroes')) {
		score -= 32;
	} else if (sourceGenres.includes('superheroes')) {
		score += 20;
	}

	return {
		score,
		reason: getRecommendationReason({
			sharedSubgenres,
			sharedThemes,
			sharedGenres,
			sameDirector,
			sharedCastCount,
			bothArgentinian,
		}),
	};
}

export function generateMovieEditorialRecommendations(
	movie: Movie,
	allMovies: Movie[],
): { becauseYouLiked: string[]; related: string[] } {
	const ranked = allMovies
		.filter((candidate) => candidate.slug !== movie.slug)
		.map((candidate) => ({ candidate, affinity: getMovieRecommendationAffinity(movie, candidate) }))
		.filter((entry): entry is { candidate: Movie; affinity: MovieRecommendationAffinity } => entry.affinity !== null)
		.sort(
			(left, right) =>
				right.affinity.score - left.affinity.score ||
				Math.abs(left.candidate.year - movie.year) - Math.abs(right.candidate.year - movie.year) ||
				left.candidate.title.localeCompare(right.candidate.title, 'es'),
		);

	const becauseYouLiked = ranked.slice(0, 2).map((entry) => entry.candidate.slug);
	const related = ranked
		.filter((entry) => !becauseYouLiked.includes(entry.candidate.slug))
		.slice(0, 4)
		.map((entry) => entry.candidate.slug);

	return {
		becauseYouLiked,
		related,
	};
}
