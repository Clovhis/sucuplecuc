export type MovieVerdict =
	| 'recomendada'
	| 'zafa'
	| 'no_recomendada'
	| 'basura_atomica';

export interface Movie {
	slug: string;
	title: string;
	year: number;
	poster: string;
	screenshots?: string[];
	trailerYoutubeId: string;
	releasePlatform?: string;
	verdict: MovieVerdict;
	verdictLabel?: string;
	review: string;
}
