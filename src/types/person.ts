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

export interface PersonProfileRecord {
	slug: string;
	name: string;
	profileImage?: string;
	headline: string;
	roles: string[];
	birthPlace?: string;
	spotlight: string;
	biography: string[];
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
	ageLabel: string;
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
