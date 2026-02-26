export type MovieVerdict =
	| 'recomendada'
	| 'zafa'
	| 'no_recomendada'
	| 'basura_atomica';

export interface Movie {
	slug: string;
	title: string;
	originalTitle: string;
	year: number;
	category: string;
	poster: string;
	screenshots?: string[];
	trailerYoutubeId: string;
	releasePlatform?: string;
	director: string;
	mainCast: string[];
	productionCompany: string;
	verdict: MovieVerdict;
	verdictLabel?: string;
	review: string;
}
