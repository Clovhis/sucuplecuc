export interface CinemaNewsItem {
	title: string;
	summary: string;
	link: string;
	source: string;
	publishedAt: string;
	publishedLabel: string;
	imageUrl: string;
}

interface RadarEditorial {
	slug: string;
	title: string;
	excerpt: string;
	date: string;
	cover: { src: string; srcSmall?: string };
}

export const RADAR_MAX_ITEMS = 6;
export const RADAR_DAYS = 30;

/** Inclusive Argentine calendar window: today and the previous 29 days. */
export function selectCinemaNews(entries: RadarEditorial[], now = new Date()): CinemaNewsItem[] {
	const today = new Intl.DateTimeFormat('en-CA', {
		timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit',
	}).format(now);
	const cutoff = new Date(`${today}T12:00:00Z`);
	cutoff.setUTCDate(cutoff.getUTCDate() - RADAR_DAYS + 1);
	const oldest = cutoff.toISOString().slice(0, 10);
	const seen = new Set<string>();
	return [...entries]
		.filter((entry) => /^\d{4}-\d{2}-\d{2}$/.test(entry.date) && entry.date >= oldest && entry.date <= today)
		.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug))
		.filter((entry) => {
			if (seen.has(entry.slug)) return false;
			seen.add(entry.slug);
			return true;
		})
		.slice(0, RADAR_MAX_ITEMS)
		.map((entry) => ({
			title: entry.title, summary: entry.excerpt,
			link: `/editorial/${entry.slug}/`, source: 'CinePosta',
			publishedAt: `${entry.date}T00:00:00-03:00`,
			publishedLabel: new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${entry.date}T12:00:00Z`)),
			imageUrl: `/${entry.cover.srcSmall ?? entry.cover.src}`,
		}));
}
