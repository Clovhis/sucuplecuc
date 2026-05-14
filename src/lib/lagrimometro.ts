import type { Movie } from '../types/movie';

const INCLUDE_CATEGORY_TOKENS = ['drama', 'romance', 'comedia romantica'];
const EXCLUDE_CONTEXT_TOKENS = ['accion', 'action', 'documental', 'documentary', 'docu', 'terror', 'horror'];
const EXCLUDE_TITLE_TOKENS = [
	'a quiet place',
	'alien',
	'avengers',
	'batman',
	'captain america',
	'chucky',
	'deadpool',
	'friday the 13th',
	'halloween',
	'joker',
	'nightmare on elm street',
	'nosferatu',
	'psycho',
	'scream',
	'spider-man',
	'superman',
	'the exorcist',
	'the shining',
	'wolverine',
	'x-men',
];

const SCORE_OVERRIDES: Record<string, number> = {
	'million-dollar-baby-2004': 89,
	'12-years-a-slave-2013': 95,
	'a-beautiful-mind-2001': 82,
	'big-fish-2003': 86,
	'camila-1984': 87,
	'casablanca-1943': 76,
	'eternal-sunshine-of-the-spotless-mind-2004': 84,
	'good-will-hunting-1997': 80,
	'grave-of-the-fireflies-1988': 99,
	'schindler-s-list-1993': 98,
	'the-color-purple-1985': 91,
	'the-shawshank-redemption-1994': 83,
	'the-whale-2022': 93,
	'titanic-1997': 96,
	'terms-of-endearment-1983': 97,
	'up-2009': 88,
};

const TEAR_KEYWORDS = [
	{ pattern: /\b(llorar|lagrima|emocion|emociona|conmueve|triste|dolor|duelo)\b/g, weight: 12 },
	{ pattern: /\b(muerte|muere|fallece|fallecio|perdida|pierde|despedida|sacrificio)\b/g, weight: 10 },
	{ pattern: /\b(enfermedad|terminal|hospital|memoria|recuerdo|soledad|abandono)\b/g, weight: 8 },
	{ pattern: /\b(madre|padre|hijo|hija|familia|hermano|hermana|pareja)\b/g, weight: 6 },
	{ pattern: /\b(amor|romance|promesa|destino|reencuentro|separacion)\b/g, weight: 5 },
	{ pattern: /\b(guerra|holocausto|esclavitud|injusticia|dictadura|prision)\b/g, weight: 7 },
];

function normalize(value: string): string {
	return String(value ?? '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim();
}

function getMovieContext(movie: Pick<Movie, 'category' | 'genres'>): string {
	return [movie.category ?? '', ...(movie.genres ?? [])].map(normalize).join(' ');
}

function clampLagrimometroScore(value: number): number {
	return Math.min(99, Math.max(1, Math.round(value)));
}

export function shouldShowLagrimometro(movie: Pick<Movie, 'category' | 'genres'>): boolean {
	const context = getMovieContext(movie);
	if (!INCLUDE_CATEGORY_TOKENS.some((token) => context.includes(token))) {
		return false;
	}

	return !EXCLUDE_CONTEXT_TOKENS.some((token) => context.includes(token));
}

function hasExcludedTitleToken(movie: Pick<Movie, 'slug' | 'title' | 'originalTitle'>): boolean {
	const titleContext = normalize([movie.slug, movie.title, movie.originalTitle].join(' ')).replace(/-/g, ' ');
	return EXCLUDE_TITLE_TOKENS.some((token) => titleContext.includes(token));
}

export function getLagrimometroScore(movie: Movie): number | undefined {
	if (!shouldShowLagrimometro(movie) || hasExcludedTitleToken(movie)) {
		return undefined;
	}

	const override = SCORE_OVERRIDES[movie.slug];
	if (override !== undefined) {
		return clampLagrimometroScore(override);
	}

	const context = getMovieContext(movie);
	const normalizedCategory = normalize(movie.category ?? '');
	const text = normalize(
		[
			movie.title,
			movie.originalTitle,
			movie.synopsis,
			movie.review,
			movie.director,
			movie.productionCompany,
			...(movie.genres ?? []),
		].join(' '),
	);

	let score = normalizedCategory.includes('romance') ? 44 : 36;
	if (normalizedCategory.includes('drama')) score += 10;
	if (normalizedCategory.includes('comedia romantica')) score += 4;
	if (context.includes('romance')) score += 8;
	if (context.includes('familia')) score += 6;
	if (context.includes('guerra') || context.includes('historia')) score += 5;
	if (context.includes('comedia')) score -= 6;
	if (movie.verdict === 'recomendada') score += 4;
	if ((movie.awards?.wins ?? []).length > 0) score += 4;
	if ((movie.runtimeMinutes ?? 0) >= 125) score += 3;

	for (const keyword of TEAR_KEYWORDS) {
		const matches = text.match(keyword.pattern);
		if (matches) {
			score += Math.min(keyword.weight * matches.length, keyword.weight * 2);
		}
	}

	return clampLagrimometroScore(score);
}

export function getLagrimometroLabel(score: number): string {
	if (score >= 85) return 'Pañuelos obligatorios';
	if (score >= 70) return 'Alta chance de nudo en la garganta';
	if (score >= 50) return 'Puede pegar de costado';
	return 'Lágrima discreta';
}
