import peopleCatalog from '../data/people.json';
import type { Movie } from '../types/movie';
import type { MoviePeopleGroups, MoviePersonCredit, PersonRecord } from '../types/person';

const catalogEntries = Object.entries(peopleCatalog as Record<string, PersonRecord>);
const normalizedCatalog = new Map(
	catalogEntries.map(([name, person]) => [normalizePersonName(name), { ...person, name: person.name || name }]),
);

function normalizeWhitespace(value: string): string {
	return value.replace(/\s+/g, ' ').trim();
}

export function normalizePersonName(value: string): string {
	return normalizeWhitespace(value)
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9\s']/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

export function splitCreditNames(value: string): string[] {
	return normalizeWhitespace(value)
		.split(/\s*,\s*|\s+y\s+/i)
		.map((entry) => normalizeWhitespace(entry))
		.filter(Boolean);
}

function getInitials(name: string): string {
	const tokens = normalizeWhitespace(name)
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2);

	if (tokens.length === 0) {
		return '?';
	}

	return tokens
		.map((token) => token[0]?.toUpperCase() ?? '')
		.join('')
		.slice(0, 2);
}

function findPersonRecord(name: string): PersonRecord | undefined {
	const exactMatch = (peopleCatalog as Record<string, PersonRecord>)[name];
	if (exactMatch) {
		return {
			...exactMatch,
			name: exactMatch.name || name,
		};
	}

	return normalizedCatalog.get(normalizePersonName(name));
}

function buildMoviePersonCredit(name: string): MoviePersonCredit {
	const person = findPersonRecord(name);
	return {
		creditedName: name,
		name: person?.name || name,
		birthYear: person?.birthYear,
		deathYear: person?.deathYear,
		nationalityPrimary: person?.nationalityPrimary,
		image: person?.image,
		imdbId: person?.imdbId,
		imdbUrl: person?.imdbUrl,
		remoteImageUrl: person?.remoteImageUrl,
		source: person?.source,
		initials: getInitials(name),
	};
}

function uniqueCredits(values: string[]): string[] {
	const seen = new Set<string>();
	const output: string[] = [];

	for (const value of values) {
		const normalized = normalizePersonName(value);
		if (!normalized || seen.has(normalized)) {
			continue;
		}
		seen.add(normalized);
		output.push(value);
	}

	return output;
}

export function getMoviePeopleGroups(movie: Pick<Movie, 'director' | 'mainCast'>): MoviePeopleGroups {
	const directors = uniqueCredits(splitCreditNames(movie.director)).map((name) => buildMoviePersonCredit(name));
	const cast = uniqueCredits(
		(movie.mainCast ?? []).flatMap((entry) => splitCreditNames(String(entry || ''))),
	).map((name) => buildMoviePersonCredit(name));

	return {
		directors,
		cast,
	};
}
