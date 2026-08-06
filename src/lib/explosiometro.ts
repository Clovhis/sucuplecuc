import type { Movie } from '../types/movie';

const INCLUDE_CATEGORY_TOKENS = ['accion', 'action'];

// Valores calibrados con conteos publicados de AOBG y fuentes de produccion/critica.
// La escala mide quilombo de accion: tiroteos, persecuciones, explosiones, peleas y set pieces.
const SCORE_OVERRIDES: Record<string, number> = {
	'john-wick-chapter-4-2023': 99,
	'terminator-2-judgment-day-1991': 98,
	'mad-max-fury-road-2015': 97,
	'john-wick-chapter-3-parabellum-2019': 97,
	'avengers-endgame-2019': 96,
	'john-wick-chapter-2-2017': 95,
	'avengers-infinity-war-2018': 94,
	'mission-impossible-fallout-2018': 93,
	'top-gun-maverick-2022': 92,
	'the-dark-knight-rises-2012': 91,
	'john-wick-2014': 90,
	'logan-2017': 89,
	'the-terminator-1984': 88,
	'the-equalizer-2014': 75,
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

function clampExplosiometroScore(value: number): number {
	return Math.min(99, Math.max(1, Math.round(value)));
}

function hasAny(value: string, patterns: RegExp[]): boolean {
	return patterns.some((pattern) => pattern.test(value));
}

export function shouldShowExplosiometro(movie: Pick<Movie, 'category'>): boolean {
	const category = getPrimaryCategory(movie);
	return INCLUDE_CATEGORY_TOKENS.some((token) => category.includes(token));
}

export function getExplosiometroScore(movie: Movie): number | undefined {
	if (!shouldShowExplosiometro(movie)) return undefined;

	const override = SCORE_OVERRIDES[movie.slug];
	if (override !== undefined) {
		return clampExplosiometroScore(override);
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

	let score = 56;
	if (context.includes('aventura') || context.includes('adventure')) score += 4;
	if (context.includes('ciencia ficcion') || context.includes('sci-fi') || context.includes('science fiction')) score += 5;
	if (context.includes('thriller') || context.includes('crimen')) score += 4;
	if (context.includes('guerra') || context.includes('war')) score += 7;
	if (context.includes('superheroe') || context.includes('superhero') || context.includes('comics')) score += 6;
	if (context.includes('familia') || context.includes('animacion') || context.includes('anime')) score -= 8;
	if (context.includes('drama')) score -= 3;
	if (context.includes('comedia')) score -= 4;
	if (movie.verdict === 'recomendada') score += 4;
	if (movie.verdict === 'zafa') score -= 3;
	if (movie.verdict === 'no_recomendada') score -= 10;
	if (movie.verdict === 'basura_atomica') score -= 18;
	if ((movie.runtimeMinutes ?? 0) >= 135) score += 3;

	if (hasAny(text, [/\b(explosion|explosiones|explota|explotan|bomba|bombas|misil|misiles|granada|granadas|dinamita)\b/])) score += 15;
	if (hasAny(text, [/\b(tiroteo|tiroteos|balacera|balaceras|disparos|ametralladora|armas|pistola|escopeta)\b/])) score += 12;
	if (hasAny(text, [/\b(persecucion|persecuciones|chase|carrera|autos|motos|helicoptero|avion|jet|combate aereo)\b/])) score += 11;
	if (hasAny(text, [/\b(pelea|peleas|combate|batalla|batallas|duelo|duelos|artes marciales|cuerpo a cuerpo)\b/])) score += 9;
	if (hasAny(text, [/\b(caos|quilombo|destruccion|masacre|asedio|invasion|guerra total|apocalipsis)\b/])) score += 10;
	if (hasAny(text, [/\b(set piece|stunt|practico|practicos|acrobacia|acrobacias|coreografia|coreografiada)\b/])) score += 7;
	if (hasAny(text, [/\b(lenta|lento|sobria|sobrio|intima|intimo|contemplacion|pausada|pausado)\b/])) score -= 10;
	if (hasAny(text, [/\b(poca accion|sin accion|accion liviana|mas charla que accion|se guarda el quilombo)\b/])) score -= 20;

	return clampExplosiometroScore(score);
}

export function getExplosiometroLabel(score: number): string {
	if (score >= 90) return 'Revienta todo: agarrate del sillón';
	if (score >= 75) return 'Hay quilombo del lindo';
	if (score >= 60) return 'Hay movimiento, pero tranqui';
	if (score >= 40) return 'Trae algo de acción, sin pasarse';
	return 'Acción con el freno puesto';
}
