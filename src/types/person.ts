export interface PersonRecord {
	name: string;
	birthDate?: string;
	birthYear?: number;
	deathDate?: string;
	deathYear?: number;
	nationalityPrimary?: string;
	image?: string;
	imdbId?: string;
	imdbUrl?: string;
	lastVerifiedAt?: string;
	notes?: string;
	referenceUrls?: string[];
	remoteImageUrl?: string;
	source?: string;
}

export interface PersonStat {
	label: string;
	value: string;
}

export interface PersonAwardHighlight {
	label: string;
	category: string;
	work?: string;
	year?: number;
}

/**
 * `approved` is reserved for copy written and manually reviewed by Cine Posta.
 * Legacy/imported biographies must never be promoted by word count alone.
 */
export type PersonEditorialStatus = 'approved' | 'pending' | 'informational';

export interface PersonProfileRecord {
	slug: string;
	name: string;
	profileImage?: string;
	headline: string;
	roles: string[];
	birthPlace?: string;
	spotlight: string;
	/**
	 * Historical/imported material retained for editorial reference only. It is
	 * deliberately not a public-content field.
	 */
	biography: string[];
	/** Original, manually approved Cine Posta biography eligible for public render. */
	editorialBiography?: string[];
	editorialStatus?: PersonEditorialStatus;
	stats?: PersonStat[];
	awards: PersonAwardHighlight[];
	knownFor: string[];
	referenceUrls?: string[];
}

export interface PersonProfile extends PersonRecord, PersonProfileRecord {
	profilePath: string;
}

export type PersonContributionRole = 'actor' | 'director' | 'producer';

export interface PersonFilmographyEntry {
	movieSlug: string;
	title: string;
	year: number;
	poster: string;
	url: string;
	roles: PersonContributionRole[];
}

export interface PersonSearchEntry {
	slug: string;
	title: string;
	url: string;
	posterUrl: string;
	meta: string;
	ageLabel?: string;
	nationalityLabel: string;
	knownFor: string;
	searchableText: string;
}

export interface MoviePersonCredit extends PersonRecord {
	creditedName: string;
	initials: string;
	profilePath?: string;
}

export interface MoviePeopleGroups {
	directors: MoviePersonCredit[];
	cast: MoviePersonCredit[];
}
