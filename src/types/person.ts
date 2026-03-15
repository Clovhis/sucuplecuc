export interface PersonRecord {
	name: string;
	birthYear?: number;
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

export interface MoviePersonCredit extends PersonRecord {
	creditedName: string;
	initials: string;
}

export interface MoviePeopleGroups {
	directors: MoviePersonCredit[];
	cast: MoviePersonCredit[];
}
