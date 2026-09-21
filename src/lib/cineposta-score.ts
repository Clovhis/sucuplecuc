import type { CinePostaScore, Movie, MovieVerdict } from '../types/movie';

export const CINEPOSTA_SCORE_LABELS: Readonly<Record<CinePostaScore, string>> = {
	1: 'Basura total',
	2: 'Pésima',
	3: 'Muy mala',
	4: 'Mala',
	5: 'Regular',
	6: 'Buena',
	7: 'Muy buena',
	8: 'Excelente',
	9: 'Obra maestra',
	10: 'Absolute Cinema',
};

export const CINEPOSTA_SCORES = Object.freeze(
	Object.keys(CINEPOSTA_SCORE_LABELS).map(Number) as CinePostaScore[],
);

export function isCinePostaScore(value: unknown): value is CinePostaScore {
	return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 10;
}

export function getCinePostaScoreLabel(score: CinePostaScore): string {
	return CINEPOSTA_SCORE_LABELS[score];
}

export function formatCinePostaScore(score: CinePostaScore): string {
	return `${String(score)} · ${getCinePostaScoreLabel(score)}`;
}

export function getMovieCinePostaScore(movie: Pick<Movie, 'cinepostaScore'>): CinePostaScore | null {
	return isCinePostaScore(movie.cinepostaScore) ? movie.cinepostaScore : null;
}

/** Compatibility adapter for UI systems that still use the four legacy reaction tones. */
export function getLegacyVerdictFromScore(score: CinePostaScore): MovieVerdict {
	if (score >= 7) return 'recomendada';
	if (score >= 5) return 'zafa';
	if (score >= 2) return 'no_recomendada';
	return 'basura_atomica';
}

export function getMovieLegacyVerdict(
	movie: Pick<Movie, 'cinepostaScore' | 'verdict'>,
): MovieVerdict | null {
	const score = getMovieCinePostaScore(movie);
	if (score !== null) return getLegacyVerdictFromScore(score);
	return movie.verdict ?? null;
}
