// Only searchable/filterable fields and the small card presentation cross to the browser.
export interface HomeMovieRecord {
	slug: string;
	title: string;
	year: string;
	searchable: string;
	normalizedTitle: string;
	normalizedOriginalTitle: string;
	normalizedMeta: string;
	releaseTimestamp: number;
	recentPremiere: boolean;
	score: number | null;
	url: string;
	posterUrl: string;
	meta: string;
	cast: string;
	platforms: string[];
	genres: string[];
	subgenres: string[];
	primaryGenre: string;
	card: {
		verdictLabel: string;
		verdictClass: string;
		genreLabels: string[];
		audienceRating: string;
		cult: boolean;
		platformLabels: string[];
	};
}
