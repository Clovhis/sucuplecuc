import type { Movie } from '../types/movie';

const INCLUDE_CATEGORY_TOKENS = ['gore'];

const SCORE_OVERRIDES: Record<string, number> = {
	'terrifier-2-2022': 99,
	'terrifier-3-2024': 99,
	'the-human-centipede-2-full-sequence-2011': 98,
	'hostel-part-ii-2007': 92,
	'saw-iii-2006': 91,
	'saw-x-2023': 90,
	'terrifier-2016': 89,
	'saw-3d-2010': 88,
	'hostel-2005': 86,
	'saw-vi-2009': 85,
	'the-human-centipede-3-final-sequence-2015': 84,
	'saw-iv-2007': 83,
	'hostel-part-iii-2011': 78,
	'saw-v-2008': 77,
	'jigsaw-2017': 75,
	'saw-ii-2005': 74,
	'the-human-centipede-first-sequence-2009': 72,
	'spiral-from-the-book-of-saw-2021': 68,
	'saw-2004': 62,
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

function clampSangrometroScore(value: number): number {
	return Math.min(99, Math.max(1, Math.round(value)));
}

function hasAny(value: string, patterns: RegExp[]): boolean {
	return patterns.some((pattern) => pattern.test(value));
}

export function shouldShowSangrometro(movie: Pick<Movie, 'category'>): boolean {
	const category = getPrimaryCategory(movie);
	return INCLUDE_CATEGORY_TOKENS.some((token) => category.includes(token));
}

export function getSangrometroScore(movie: Movie): number | undefined {
	if (!shouldShowSangrometro(movie)) return undefined;

	const override = SCORE_OVERRIDES[movie.slug];
	if (override !== undefined) {
		return clampSangrometroScore(override);
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

	let score = 64;
	if (context.includes('tortura') || context.includes('torture')) score += 13;
	if (context.includes('splatter') || context.includes('slasher')) score += 9;
	if (context.includes('body horror') || context.includes('corporal')) score += 8;
	if (context.includes('sobrenatural')) score += 3;
	if (context.includes('thriller')) score -= 4;
	if (movie.verdict === 'recomendada') score += 5;
	if (movie.verdict === 'zafa') score -= 3;
	if (movie.verdict === 'no_recomendada') score -= 10;
	if (movie.verdict === 'basura_atomica') score -= 18;

	if (hasAny(text, [/\b(gore|sangre|sangrienta|sangriento|visceral|visceras|tripas|mutilacion|mutilaciones)\b/])) score += 13;
	if (hasAny(text, [/\b(tortura|torturas|trampa|trampas|serrucho|sierra|desmembrar|desmembramiento)\b/])) score += 11;
	if (hasAny(text, [/\b(practico|practicos|prostetico|prosteticos|efectos artesanales|maquillaje)\b/])) score += 7;
	if (hasAny(text, [/\b(repulsiva|repulsivo|nausea|nauseabunda|asquerosa|asqueroso)\b/])) score += 8;
	if (hasAny(text, [/\b(sugerida|sugerido|fuera de campo|se guarda|poco explicita|poco explicito)\b/])) score -= 18;
	if (hasAny(text, [/\b(liviana|liviano|moderada|moderado|mas thriller que gore)\b/])) score -= 12;

	return clampSangrometroScore(score);
}

export function getSangrometroLabel(score: number): string {
	if (score >= 90) return 'Festival de achuras, mirala con estómago';
	if (score >= 75) return 'Salpica fuerte y sin pedir permiso';
	if (score >= 55) return 'Hay sangre para rato';
	return 'Gore con la canilla medio cerrada';
}
