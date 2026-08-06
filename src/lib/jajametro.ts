import type { Movie } from '../types/movie';

const INCLUDE_CATEGORY_TOKENS = ['comedia', 'comedy'];
const ROMANCE_CATEGORY_TOKENS = ['romance', 'romantica', 'romantic'];
const DRAMA_CATEGORY_TOKENS = ['drama', 'dramatic', 'dramatica'];
const FORCE_SHOW_JAJAMETRO_SLUGS = new Set([
	'despicable-me-4-2024',
	'minions-monstruos-2026',
]);

const SCORE_OVERRIDES: Record<string, number> = {
	'scary-movie-2000': 90,
	'esperando-la-carroza-1985': 97,
	'tiempo-de-valientes-2005': 92,
	'y-donde-esta-el-policia-2025': 88,
	'home-alone-1990': 87,
	'beetlejuice-1988': 84,
	'annie-hall-1977': 82,
	'the-grand-budapest-hotel-2014': 81,
	'forrest-gump-1994': 42,
	'1941-1979': 35,
	'home-sweet-home-alone-2021': 18,
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

function clampJajametroScore(value: number): number {
	return Math.min(99, Math.max(1, Math.round(value)));
}

function hasAny(value: string, patterns: RegExp[]): boolean {
	return patterns.some((pattern) => pattern.test(value));
}

export function shouldShowJajametro(movie: Pick<Movie, 'slug' | 'category'>): boolean {
	if (FORCE_SHOW_JAJAMETRO_SLUGS.has(movie.slug)) {
		return true;
	}

	const category = getPrimaryCategory(movie);
	const isComedy = INCLUDE_CATEGORY_TOKENS.some((token) => category.includes(token));
	const leansRomanceOrDrama = [...ROMANCE_CATEGORY_TOKENS, ...DRAMA_CATEGORY_TOKENS].some((token) => category.includes(token));
	return isComedy && !leansRomanceOrDrama;
}

export function getJajametroScore(movie: Movie): number | undefined {
	if (!shouldShowJajametro(movie)) {
		return undefined;
	}

	const override = SCORE_OVERRIDES[movie.slug];
	if (override !== undefined) {
		return clampJajametroScore(override);
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

	let score = normalizedCategory.includes('comedia') ? 52 : 44;
	if (context.includes('parodia')) score += 10;
	if (context.includes('satira')) score += 8;
	if (context.includes('terror') || context.includes('horror')) score += 3;
	if (context.includes('familia') || context.includes('animacion')) score += 2;
	if (context.includes('drama')) score -= 6;
	if (context.includes('documental') || context.includes('documentary')) score -= 12;
	if (movie.verdict === 'recomendada') score += 6;
	if (movie.verdict === 'zafa') score -= 4;
	if (movie.verdict === 'no_recomendada') score -= 12;
	if (movie.verdict === 'basura_atomica') score -= 24;
	if ((movie.runtimeMinutes ?? 0) > 125) score -= 4;
	if ((movie.runtimeMinutes ?? 0) > 0 && (movie.runtimeMinutes ?? 0) <= 100) score += 2;

	if (hasAny(text, [/\b(carcajada|carcajadas|desopilante|graciosisima|graciosisimo|desternillante)\b/])) score += 15;
	else if (hasAny(text, [/\b(risa|risas|reir|rie|hace reir|graciosa|gracioso|divertid[ao]s?)\b/])) score += 9;

	if (hasAny(text, [/\b(chiste|chistes|gag|gags|remate|remates|sketch|sketches)\b/])) score += 8;
	if (hasAny(text, [/\b(absurdo|disparate|delirio|delirante|parodia|satira)\b/])) score += 6;
	if (hasAny(text, [/\b(timing|torpe|torpeza|caos|neurosis|veneno|filosa|ingeniosa|ingenioso)\b/])) score += 5;
	if (hasAny(text, [/\b(humor familiar|simpatic[ao]s?|tierna|tierno|calida|calido|amable)\b/])) score -= 6;
	if (hasAny(text, [/\b(no intenta ser una bomba de chistes|no es una bomba de chistes|no vive de carcajadas)\b/])) score -= 14;
	if (hasAny(text, [/\b(no tiene gracia|sin gracia|poca gracia|casi nada de lo nuevo tiene gracia)\b/])) score -= 24;
	if (hasAny(text, [/\b(cansadora|forzada|floja|irregular|medio pelo|aburrida|aburrido)\b/])) score -= 12;
	if (hasAny(text, [/\b(triste|duelo|melancolia|dolor|muerte|enfermedad)\b/])) score -= 6;

	return clampJajametroScore(score);
}

export function getJajametroLabel(score: number): string {
	if (score >= 90) return 'Te meás de risa';
	if (score >= 75) return 'Viene cargada de jajás';
	if (score >= 60) return 'Te hace reír, pero tranqui';
	if (score >= 40) return 'Algún jaja te saca';
	return 'No le encontrás la gracia';
}
