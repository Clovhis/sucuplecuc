import { getEditorials } from './editorial';
import { selectCinemaNews } from './cinema-news-selection';
export type { CinemaNewsItem } from './cinema-news-selection';

/** Every build includes new local notes; the daily rebuild expires old ones. */
export function getCinemaNews(now = new Date()) {
	return {
		items: selectCinemaNews(getEditorials(), now),
		sourceLabel: 'Notas de CinePosta · últimos 30 días',
		updatedLabel: 'Hasta seis notas recientes',
		isFallback: false,
	};
}
