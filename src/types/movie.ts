export type MovieVerdict =
	| 'recomendada'
	| 'zafa'
	| 'no_recomendada'
	| 'basura_atomica';

export type MovieAudienceRating = 'ATP' | `+${number}`;

export type MovieAwardType = 'oscar' | 'grammy' | 'cannes';

export interface MovieAwardWin {
	award: MovieAwardType;
	category: string;
	recipient?: string;
	year?: number;
}

export interface MovieAwards {
	wins: MovieAwardWin[];
}

export interface MovieEditorial {
	runtimeComment?: string;
	becauseYouLiked?: string[];
	related?: string[];
}

export interface Movie {
	slug: string;
	title: string;
	originalTitle: string;
	synopsis: string;
	year: number;
	releaseDate?: string;
	audienceRating: MovieAudienceRating;
	category: string;
	genres?: string[];
	country?: string;
	isArgentinian?: boolean;
	poster: string;
	screenshots?: string[];
	trailerYoutubeId: string;
	releasePlatform?: string;
	director: string;
	mainCast: string[];
	productionCompany: string;
	verdict: MovieVerdict;
	verdictLabel?: string;
	awards?: MovieAwards;
	runtimeMinutes?: number;
	editorial?: MovieEditorial;
	review: string;
}
