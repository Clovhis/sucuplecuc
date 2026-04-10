import { personProfiles } from '../data/personProfiles';
import peopleCatalog from '../data/people.json';
import { getMoviePath, getMovies, getPosterUrl, normalizeSearchText } from './movies';
import type { Movie } from '../types/movie';
import type {
	MoviePeopleGroups,
	MoviePersonCredit,
	PersonContributionRole,
	PersonFilmographyEntry,
	PersonProfile,
	PersonRecord,
	PersonSearchEntry,
} from '../types/person';

const catalogEntries = Object.entries(peopleCatalog as Record<string, PersonRecord>);
const normalizedCatalog = new Map(
	catalogEntries.map(([name, person]) => [normalizePersonName(name), { ...person, name: person.name || name }]),
);
const profileEntries = Object.values(personProfiles);
const normalizedProfiles = new Map(
	profileEntries.map((profile) => [normalizePersonName(profile.name), profile]),
);

function withTrailingSlash(value: string): string {
	return value.endsWith('/') ? value : `${value}/`;
}

function joinWithBase(pathPart: string): string {
	const base = withTrailingSlash(import.meta.env.BASE_URL || '/');
	return `${base}${pathPart.replace(/^\/+/, '')}`;
}

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

function findPersonProfileRecord(name: string) {
	return normalizedProfiles.get(normalizePersonName(name));
}

export function getPersonPath(slug: string): string {
	return joinWithBase(`personas/${slug}/`);
}

export function getPersonProfileBySlug(slug: string): PersonProfile | undefined {
	const profile = personProfiles[slug];
	if (!profile) {
		return undefined;
	}

	const person = findPersonRecord(profile.name);

	return {
		...person,
		...profile,
		name: profile.name,
		profilePath: getPersonPath(profile.slug),
		referenceUrls: profile.referenceUrls ?? person?.referenceUrls,
	};
}

export function getPersonProfiles(): PersonProfile[] {
	return Object.keys(personProfiles)
		.map((slug) => getPersonProfileBySlug(slug))
		.filter((profile): profile is PersonProfile => Boolean(profile));
}

function buildMoviePersonCredit(name: string): MoviePersonCredit {
	const person = findPersonRecord(name);
	const profile = findPersonProfileRecord(name);
	return {
		creditedName: name,
		name: person?.name || name,
		birthDate: person?.birthDate,
		birthYear: person?.birthYear,
		deathDate: person?.deathDate,
		deathYear: person?.deathYear,
		nationalityPrimary: person?.nationalityPrimary,
		image: person?.image,
		imdbId: person?.imdbId,
		imdbUrl: person?.imdbUrl,
		remoteImageUrl: person?.remoteImageUrl,
		source: person?.source,
		initials: getInitials(name),
		profilePath: profile ? getPersonPath(profile.slug) : undefined,
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

function addRole(target: Set<PersonContributionRole>, role: PersonContributionRole): void {
	target.add(role);
}

export function getPersonFilmography(name: string): PersonFilmographyEntry[] {
	const normalizedName = normalizePersonName(name);

	return getMovies()
		.flatMap((movie): PersonFilmographyEntry[] => {
			const roles = new Set<PersonContributionRole>();
			const directorNames = splitCreditNames(movie.director);
			const castNames = (movie.mainCast ?? []).flatMap((entry) => splitCreditNames(String(entry || '')));
			const awardRecipients = (movie.awards?.wins ?? [])
				.flatMap((win) => splitCreditNames(win.recipient ?? ''))
				.filter(Boolean);

			if (directorNames.some((entry) => normalizePersonName(entry) === normalizedName)) {
				addRole(roles, 'director');
			}

			if (castNames.some((entry) => normalizePersonName(entry) === normalizedName)) {
				addRole(roles, 'actor');
			}

			if (awardRecipients.some((entry) => normalizePersonName(entry) === normalizedName)) {
				addRole(roles, 'producer');
			}

			if (roles.size === 0) {
				return [];
			}

			return [{
				movieSlug: movie.slug,
				title: movie.title,
				year: movie.year,
				poster: getPosterUrl(movie.poster),
				url: getMoviePath(movie.slug),
				roles: Array.from(roles),
			}];
		})
		.sort((left, right) => right.year - left.year || left.title.localeCompare(right.title, 'es'));
}

export function getPersonSearchEntries(): PersonSearchEntry[] {
	const movies = getMovies();

	return getPersonProfiles().map((profile) => {
		const knownForMovies = profile.knownFor
			.map((slug) => movies.find((movie) => movie.slug === slug))
			.filter((movie): movie is Movie => Boolean(movie));
		const fallbackFilmography =
			knownForMovies.length > 0
				? knownForMovies
				: movies.filter((movie) =>
						(movie.mainCast ?? []).some((entry) => normalizePersonName(entry) === normalizePersonName(profile.name)),
					);
		const posterUrl = profile.image ?? profile.remoteImageUrl ?? '/posters/poster-no-disponible.svg';
		const knownFor = fallbackFilmography
			.slice(0, 3)
			.map((movie) => movie.title)
			.join(' · ');

		return {
			slug: profile.slug,
			title: profile.name,
			url: profile.profilePath,
			posterUrl,
			meta: `Perfil · ${profile.roles.join(' · ')}`,
			knownFor,
			searchableText: normalizeSearchText(
				[
					profile.name,
					profile.headline,
					profile.roles.join(' '),
					profile.birthPlace ?? '',
					profile.biography.join(' '),
					knownFor,
				].join(' '),
			),
		};
	});
}
