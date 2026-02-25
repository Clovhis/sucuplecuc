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
	trailerYoutubeId: string;
	verdict: MovieVerdict;
	review: string;
}

