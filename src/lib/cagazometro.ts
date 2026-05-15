import type { Movie } from '../types/movie';

const INCLUDE_CATEGORY_TOKENS = ['terror'];

const SCORE_OVERRIDES: Record<string, number> = {
	'the-exorcist-1973': 96,
	'the-shining-1980': 92,
	'halloween-1978': 90,
	'a-nightmare-on-elm-street-1984': 88,
	'alien-romulus-2024': 83,
	'hereditary-2018': 94,
	'the-substance-2024': 82,
	'longlegs-2024': 78,
	'smile-2-2024': 76,
	'the-monkey-2025': 58,
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

function clampCagazometroScore(value: number): number {
	return Math.min(99, Math.max(1, Math.round(value)));
}

function hasAny(value: string, patterns: RegExp[]): boolean {
	return patterns.some((pattern) => pattern.test(value));
}

export function shouldShowCagazometro(movie: Pick<Movie, 'category'>): boolean {
	const category = getPrimaryCategory(movie);
	return INCLUDE_CATEGORY_TOKENS.some((token) => category.includes(token));
}

export function getCagazometroScore(movie: Movie): number | undefined {
	if (!shouldShowCagazometro(movie)) return undefined;

	const override = SCORE_OVERRIDES[movie.slug];
	if (override !== undefined) {
		return clampCagazometroScore(override);
	}

	const context = getMovieContext(movie);
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

	let score = 52;
	if (context.includes('sobrenatural') || context.includes('posesion') || context.includes('exorcismo')) score += 10;
	if (context.includes('slasher') || context.includes('asesino')) score += 8;
	if (context.includes('gore') || context.includes('sangre') || context.includes('body horror')) score += 7;
	if (context.includes('psicologico') || context.includes('misterio')) score += 6;
	if (context.includes('comedia') || context.includes('satira')) score -= 10;
	if (context.includes('familia') || context.includes('animacion')) score -= 12;
	if (movie.verdict === 'recomendada') score += 5;
	if (movie.verdict === 'zafa') score -= 3;
	if (movie.verdict === 'no_recomendada') score -= 12;
	if (movie.verdict === 'basura_atomica') score -= 22;
	if ((movie.runtimeMinutes ?? 0) > 125) score -= 3;

	if (hasAny(text, [/\b(aterradora|aterrador|terror puro|miedo fuerte|no te deja respirar|pesadilla|pesadillesca)\b/])) score += 17;
	else if (hasAny(text, [/\b(miedo|asusta|asustan|susto|sustos|tension|tensa|inquietante|escalofrio)\b/])) score += 10;

	if (hasAny(text, [/\b(jump scare|jumpscare|sobresalto|sobresaltos|pegar un salto|pega saltos)\b/])) score += 10;
	if (hasAny(text, [/\b(posesion|demonio|demonios|maleficio|exorcismo|entidad|fantasma|fantasmas)\b/])) score += 8;
	if (hasAny(text, [/\b(slasher|asesino|asesina|masacre|cuchillo|persecucion|acecho)\b/])) score += 7;
	if (hasAny(text, [/\b(gore|sangrienta|sangriento|visceral|repulsiva|repulsivo|body horror)\b/])) score += 7;
	if (hasAny(text, [/\b(perturbadora|perturbador|opresiva|opresivo|claustrofobica|claustrofobico|paranoia)\b/])) score += 8;
	if (hasAny(text, [/\b(atmosfera|clima|silencio|lento|lenta|sugestion)\b/])) score += 4;
	if (hasAny(text, [/\b(no asusta|casi no asusta|poco miedo|poca tension|sin tension|terror liviano)\b/])) score -= 24;
	if (hasAny(text, [/\b(predecible|floja|flojo|generica|generico|cansadora|aburrida|aburrido)\b/])) score -= 12;
	if (hasAny(text, [/\b(comedia|chiste|parodia|satira|camp|ridicula|ridiculo)\b/])) score -= 8;

	return clampCagazometroScore(score);
}

export function getCagazometroLabel(score: number): string {
	if (score >= 85) return 'Te cagás en las patas mal';
	if (score >= 70) return 'Te deja con el culo en la mano';
	if (score >= 50) return 'Te mantiene medio perseguido';
	return 'Algún saltito te saca';
}
