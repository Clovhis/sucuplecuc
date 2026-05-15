import type { Movie } from '../types/movie';

const INCLUDE_CATEGORY_TOKENS = ['drama', 'romance'];

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

function normalize(value: string): string {
	return String(value ?? '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim();
}

function getPrimaryCategory(movie: Pick<Movie, 'category'>): string {
	return normalize(movie.category ?? '');
}

function getMovieContext(movie: Pick<Movie, 'category' | 'genres'>): string {
	return [movie.category ?? '', ...(movie.genres ?? [])].map(normalize).join(' ');
}

function clampLagrimometroScore(value: number): number {
	return Math.min(99, Math.max(1, Math.round(value)));
}

function hasAny(value: string, patterns: RegExp[]): boolean {
	return patterns.some((pattern) => pattern.test(value));
}

export function shouldShowLagrimometro(movie: Pick<Movie, 'category'>): boolean {
	const category = getPrimaryCategory(movie);
	return !category.includes('comedia') && INCLUDE_CATEGORY_TOKENS.some((token) => category.includes(token));
}

export function getLagrimometroScore(movie: Movie): number | undefined {
	if (!shouldShowLagrimometro(movie)) return undefined;

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

	let score = normalizedCategory.includes('romance') ? 48 : 42;
	if (normalizedCategory.includes('drama')) score += 4;
	if (context.includes('romance')) score += 5;
	if (context.includes('familia')) score += 6;
	if (context.includes('guerra') || context.includes('historia')) score += 6;
	if (context.includes('comedia')) score -= 8;
	if (movie.verdict === 'recomendada') score += 4;
	if (movie.verdict === 'zafa') score -= 4;
	if (movie.verdict === 'no_recomendada') score -= 10;
	if (movie.verdict === 'basura_atomica') score -= 18;
	if ((movie.awards?.wins ?? []).length > 0) score += 4;
	if ((movie.runtimeMinutes ?? 0) >= 125) score += 3;

	if (hasAny(text, [/\b(llorar|lagrima|lagrimas|panuelos|devastadora|devastador|desgarradora|desgarrador)\b/])) score += 18;
	else if (hasAny(text, [/\b(emocion|emociona|conmueve|conmovedora|conmovedor|nudo en la garganta|triste)\b/])) score += 11;

	if (hasAny(text, [/\b(muerte|muere|fallece|fallecio|perdida|pierde|despedida|sacrificio|duelo)\b/])) score += 13;
	if (hasAny(text, [/\b(enfermedad|terminal|hospital|memoria|recuerdo|soledad|abandono)\b/])) score += 9;
	if (hasAny(text, [/\b(madre|padre|hijo|hija|familia|hermano|hermana|pareja)\b/])) score += 7;
	if (hasAny(text, [/\b(amor|romance|promesa|destino|reencuentro|separacion)\b/])) score += 6;
	if (hasAny(text, [/\b(guerra|holocausto|esclavitud|injusticia|dictadura|prision)\b/])) score += 9;
	if (hasAny(text, [/\b(no busca golpe bajo|sin golpe bajo|seca|sobria|distante|fria)\b/])) score -= 6;
	if (hasAny(text, [/\b(thriller|crimen|accion|terror|horror|satira)\b/])) score -= 5;

	return clampLagrimometroScore(score);
}

export function getLagrimometroLabel(score: number): string {
	if (score >= 85) return 'Te llorás la vida, mirala con pañuelos';
	if (score >= 70) return 'Se viene el nudo en la garganta';
	if (score >= 50) return 'Quedás al borde del lagrimón';
	return 'Asoma el lagrimón';
}
