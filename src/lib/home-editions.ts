import type { Movie } from '../types/movie';
import { formatCinePostaScore, getMovieCinePostaScore, getLegacyVerdictFromScore } from './cineposta-score.ts';
import { getWeeklyRecommendationPlatform, WEEKLY_RECOMMENDATION_ERA_LABELS } from './weekly-recommendations.ts';
import type { WeeklyRecommendationManifest } from './weekly-recommendations.ts';

export interface WeeklyRecommendationCard {
	slug: string;
	title: string;
	year: number;
	posterUrl: string;
	movieUrl: string;
	platform: string;
	verdictLabel: string;
	verdictClass: string;
	eraLabel: string;
}

/** Freeze the visible cards, not just their slugs: later movie loads cannot change the edition. */
export function createWeeklyRecommendationCards(movies: Movie[], manifest: WeeklyRecommendationManifest): WeeklyRecommendationCard[] {
	return manifest.recommendations.map(({ slug, era }) => {
		const movie = movies.find((candidate) => candidate.slug === slug);
		const score = movie && getMovieCinePostaScore(movie);
		const platform = movie && getWeeklyRecommendationPlatform(movie);
		if (!movie || !score || !platform || !movie.poster.startsWith('assets/posters/')) {
			throw new Error(`Invalid weekly recommendation: ${slug}`);
		}
		return {
			slug, title: movie.title, year: movie.year,
			posterUrl: `/${movie.poster}`, movieUrl: `/peliculas/${slug}/`, platform,
			verdictLabel: formatCinePostaScore(score),
			verdictClass: score === 10 ? 'badge--absolute-cinema' : `badge--${getLegacyVerdictFromScore(score)}`,
			eraLabel: WEEKLY_RECOMMENDATION_ERA_LABELS[era],
		};
	});
}

export function getArgentinaDateKey(date = new Date()): string {
	return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}
