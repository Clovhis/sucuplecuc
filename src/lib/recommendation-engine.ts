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
	| 'oscar-mejor-pelicula'
	| 'pelicula-nacional';

const RECOMMENDATION_GENRE_WEIGHTS: Record<RecommendationGenreId, number> = {
	accion: 8,
	comedia: 8,
	documental: 11,
	terror: 11,
	drama: 3,
	thriller: 10,
	'sci-fi': 11,
	superheroes: 12,
	animacion: 10,
	anime: 13,
	romance: 8,
	crimen: 10,
	aventura: 8,
	'oscar-mejor-pelicula': 5,
	'pelicula-nacional': 16,
};

const LOW_SIGNAL_GENRE_IDS = new Set<RecommendationGenreId>(['drama', 'oscar-mejor-pelicula']);
const LOW_SIGNAL_AFFINITY_TOKENS = new Set([
	'drama',
	'ficcion',
	'movie',
	'pelicula',
	'science',
]);
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
];
const SUPERHERO_INCLUDED_SLUGS = new Set([
	'catwoman-2004',
	'dark-phoenix-2019',
	'logan-2017',
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
		normalized.includes('adventure') ||
		normalized.includes('fantasia') ||
		normalized.includes('fantasy')
	) {
		target.add('aventura');
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

	return Object.keys(RECOMMENDATION_GENRE_WEIGHTS).filter((genreId) =>
		genreSet.has(genreId as RecommendationGenreId),
	) as RecommendationGenreId[];
}

function getNormalizedTitleTokens(movie: Pick<Movie, 'title' | 'originalTitle' | 'slug'>): string[] {
	const source = normalizeSearchText([movie.title, movie.originalTitle, movie.slug].join(' '))
		.replace(/[^a-z0-9\s]/g, ' ')
		.split(/\s+/)
		.map((token) => (token.endsWith('s') && token.length > 4 ? token.slice(0, -1) : token))
		.filter((token) => token.length >= 3 && !TITLE_TOKEN_STOP_WORDS.has(token) && !/^\d+$/.test(token));

	return Array.from(new Set(source));
}

function getSharedTitleTokenCount(
	sourceMovie: Pick<Movie, 'title' | 'originalTitle' | 'slug'>,
	candidateMovie: Pick<Movie, 'title' | 'originalTitle' | 'slug'>,
): number {
	const sourceTokens = new Set(getNormalizedTitleTokens(sourceMovie));
	if (sourceTokens.size === 0) {
		return 0;
	}

	return getNormalizedTitleTokens(candidateMovie).filter((token) => sourceTokens.has(token)).length;
}

function getAffinityTokens(movie: Pick<Movie, 'category' | 'genres'>): string[] {
	const values = [movie.category ?? '', ...(movie.genres ?? [])];
	const tokenSet = new Set<string>();

	for (const value of values) {
		for (const token of normalizeSearchText(value)
			.replace(/[^a-z0-9\s]/g, ' ')
			.split(/\s+/)) {
			if (token.length < 4 || LOW_SIGNAL_AFFINITY_TOKENS.has(token)) {
				continue;
			}
			tokenSet.add(token);
		}
	}

	return [...tokenSet];
}

function scoreSharedAffinityTokens(source: Pick<Movie, 'category' | 'genres'>, candidate: Pick<Movie, 'category' | 'genres'>) {
	const sourceTokens = new Set(getAffinityTokens(source));
	const sharedTokens = getAffinityTokens(candidate).filter((token) => sourceTokens.has(token));
	return {
		count: sharedTokens.length,
		score: sharedTokens.length * 4,
	};
}

function scoreMovieAffinity(source: Movie, candidate: Movie): number {
	if (source.slug === candidate.slug) {
		return Number.NEGATIVE_INFINITY;
	}

	const sourceGenres = getRecommendationGenres(source);
	const candidateGenres = getRecommendationGenres(candidate);
	const sharedGenres = candidateGenres.filter((genreId) => sourceGenres.includes(genreId));
	const genreScore = sharedGenres.reduce((total, genreId) => total + RECOMMENDATION_GENRE_WEIGHTS[genreId], 0);
	const hasSpecificGenreMatch = sharedGenres.some((genreId) => !LOW_SIGNAL_GENRE_IDS.has(genreId));
	const sharedTitleTokens = getSharedTitleTokenCount(source, candidate);
	const sameDirector = normalizeSearchText(source.director) === normalizeSearchText(candidate.director);
	const sourceCast = new Set(source.mainCast.map((castMember) => normalizeSearchText(castMember)));
	const sharedCastCount = candidate.mainCast.filter((castMember) =>
		sourceCast.has(normalizeSearchText(castMember)),
	).length;
	const sourceCountry = normalizeSearchText(source.country ?? '');
	const candidateCountry = normalizeSearchText(candidate.country ?? '');
	const sameCountry = Boolean(sourceCountry) && sourceCountry === candidateCountry;
	const bothArgentinian = isArgentinianMovie(source) && isArgentinianMovie(candidate);
	const sharedAffinityTokens = scoreSharedAffinityTokens(source, candidate);
	const yearDistance = Math.abs(source.year - candidate.year);
	const sameUniverse = sharedTitleTokens >= 2;
	const hasMeaningfulLink =
		sameDirector ||
		sharedCastCount > 0 ||
		sharedTitleTokens > 0 ||
		hasSpecificGenreMatch ||
		sharedAffinityTokens.count > 0 ||
		bothArgentinian;

	if (!hasMeaningfulLink && sharedGenres.length === 0) {
		return Number.NEGATIVE_INFINITY;
	}

	let score = genreScore;
	score += sharedAffinityTokens.score;
	score += sharedTitleTokens * 14;
	score += sharedCastCount * 10;

	if (sameUniverse) {
		score += 28;
	}
	if (sameDirector) {
		score += 30;
	}
	if (bothArgentinian) {
		score += 18;
	} else if (sameCountry) {
		score += 7;
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
	if (candidate.verdict === source.verdict) {
		score += 2;
	}
	if (candidate.verdict === 'recomendada') {
		score += 1;
	}

	if (
		sharedGenres.length === 1 &&
		sharedGenres[0] === 'drama' &&
		!sameDirector &&
		sharedCastCount === 0 &&
		sharedTitleTokens === 0 &&
		sharedAffinityTokens.count === 0
	) {
		score -= bothArgentinian ? 4 : 22;
	}

	if (
		sourceGenres.includes('pelicula-nacional') &&
		!candidateGenres.includes('pelicula-nacional') &&
		!sameDirector &&
		sharedCastCount === 0 &&
		sharedTitleTokens === 0
	) {
		score -= 14;
	}

	if (sourceGenres.includes('anime') !== candidateGenres.includes('anime')) {
		score -= 12;
	}

	if (sourceGenres.includes('superheroes') !== candidateGenres.includes('superheroes')) {
		score -= 10;
	}

	if (!hasMeaningfulLink) {
		score -= 18;
	}

	return score;
}

export function generateMovieEditorialRecommendations(
	movie: Movie,
	allMovies: Movie[],
): { becauseYouLiked: string[]; related: string[] } {
	const ranked = allMovies
		.filter((candidate) => candidate.slug !== movie.slug)
		.map((candidate) => ({
			candidate,
			score: scoreMovieAffinity(movie, candidate),
		}))
		.filter((entry) => Number.isFinite(entry.score))
		.sort(
			(left, right) =>
				right.score - left.score ||
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
