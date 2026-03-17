export type MovieVerdict =
	| 'recomendada'
	| 'zafa'
	| 'no_recomendada'
	| 'basura_atomica';

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

export type MovieIdealForTag = 'solo' | 'en pareja' | 'con amigos' | 'domingo' | 'trasnoche';

export interface MovieEditorial {
	runtimeComment?: string;
	idealFor?: MovieIdealForTag[];
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
