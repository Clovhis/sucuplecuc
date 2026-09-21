export type MovieVerdict =
	| 'recomendada'
	| 'zafa'
	| 'no_recomendada'
	| 'basura_atomica';

export type CinePostaScore = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

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

/**
 * Micro-guía editorial escrita para esta película. No admite valores derivados
 * de la ficha: cada campo es una conclusión original y específica.
 */
export interface MovieTenSecondTake {
	verdict: string;
	whatToExpect: string;
	pace: string;
	intensity: string;
	practicalContext: string;
	forFansOf: string;
	notForYouIf: string;
}

export interface MovieEditorial {
	runtimeComment?: string;
	becauseYouLiked?: string[];
	related?: string[];
	tenSecondTake?: MovieTenSecondTake;
}

export interface Movie {
	slug: string;
	title: string;
	originalTitle: string;
	synopsis: string;
	year: number;
	releaseDate?: string;
	/** Señala un estreno vigente; la fecha argentina de salida vive en releaseDate. */
	isPremiere?: boolean;
	premiereLabel?: string;
	reviewPublishedAt?: string;
	audienceRating: MovieAudienceRating;
	category: string;
	genres?: string[];
	subgenres?: string[];
	/** ISO 3166-1 alpha-2 production-country codes, comma-separated for co-productions. */
	country: string;
	isArgentinian?: boolean;
	poster: string;
	screenshots?: string[];
	trailerYoutubeId: string;
	/** Verified number of mid/post-credit scenes. */
	postCreditsScenes?: number;
	releasePlatform?: string;
	releasePlatforms?: string[];
	director: string;
	mainCast: string[];
	productionCompany: string;
	/** Canonical Cine Posta editorial rating. Omit only while a movie remains unranked. */
	cinepostaScore?: CinePostaScore | null;
	/** Compatibility metadata; ranking and filtering must use cinepostaScore. */
	verdict?: MovieVerdict;
	/** Historical label; display labels are derived from cinepostaScore. */
	verdictLabel?: string;
	/** Compatibility metadata; Absolute Cinema is exactly cinepostaScore 10. */
	absoluteCinema?: boolean;
	awards?: MovieAwards;
	runtimeMinutes?: number;
	editorial?: MovieEditorial;
	review: string;
}
