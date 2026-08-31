import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PEOPLE_PATH = path.join(ROOT_DIR, 'src/data/people.json');
const MOVIES_DIR = path.join(ROOT_DIR, 'src/data/movies');

function normalizePersonName(value) {
	return String(value ?? '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9\s']/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function splitCreditNames(value) {
	return String(value ?? '')
		.trim()
		.split(/\s*,\s*|\s+y\s+/i)
		.map((entry) => entry.trim())
		.filter(Boolean);
}

function isExactDate(value) {
	return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function movieCredits(movie) {
	return [
		...(Array.isArray(movie.mainCast) ? movie.mainCast : []),
		...splitCreditNames(movie.director),
		...(movie.awards?.wins?.recipient ? [movie.awards.wins.recipient] : []),
	].map(normalizePersonName);
}

async function loadMovies() {
	const fileNames = (await readdir(MOVIES_DIR)).filter((fileName) => fileName.endsWith('.json'));
	return Promise.all(fileNames.map(async (fileName) => JSON.parse(await readFile(path.join(MOVIES_DIR, fileName), 'utf8'))));
}

export async function auditPersonProfileFacts() {
	const [{ personProfiles }, people, movies] = await Promise.all([
		import('../src/data/personProfiles.ts'),
		readFile(PEOPLE_PATH, 'utf8').then(JSON.parse),
		loadMovies(),
	]);
	const peopleByName = new Map();
	const duplicatePeopleNames = [];

	for (const [key, person] of Object.entries(people)) {
		const normalized = normalizePersonName(key);
		if (peopleByName.has(normalized)) {
			duplicatePeopleNames.push([key, peopleByName.get(normalized).name]);
		} else {
			peopleByName.set(normalized, person);
		}
	}

	const duplicateProfileNames = [];
	const profileNames = new Set();
	const invalidKnownFor = [];
	const missingCatalogLinks = [];
	const missingPeopleRecords = [];
	const noSources = [];
	const yearOnlyBirth = [];
	const missingBirth = [];
	const exactBirth = [];
	const deathRecords = [];
	const exactDeath = [];
	const invalidAwards = [];
	let totalKnownForLinks = 0;
	let totalCatalogCredits = 0;
let awardHighlights = 0;

	for (const [slug, profile] of Object.entries(personProfiles)) {
		const normalizedName = normalizePersonName(profile.name);
		if (profileNames.has(normalizedName)) duplicateProfileNames.push([slug, profile.name]);
		profileNames.add(normalizedName);

		const catalogCredits = new Set(
			movies.filter((movie) => movieCredits(movie).includes(normalizedName)).map((movie) => movie.slug),
		);
		totalCatalogCredits += catalogCredits.size;
		totalKnownForLinks += profile.knownFor.length;
		const invalid = profile.knownFor.filter((movieSlug) => !catalogCredits.has(movieSlug));
		const missing = [...catalogCredits].filter((movieSlug) => !profile.knownFor.includes(movieSlug));
		if (invalid.length) invalidKnownFor.push({ slug, movieSlugs: invalid });
		if (missing.length) missingCatalogLinks.push({ slug, count: missing.length });
		if (!(profile.referenceUrls ?? []).length) noSources.push(slug);

		const person = peopleByName.get(normalizedName);
		if (!person) {
			missingPeopleRecords.push({ slug, name: profile.name });
			continue;
		}
		if (isExactDate(person.birthDate)) exactBirth.push(profile.name);
		else if (person.birthYear || person.birthDate) yearOnlyBirth.push(profile.name);
		else missingBirth.push(profile.name);
		if (person.deathDate || person.deathYear) {
			deathRecords.push(profile.name);
			if (isExactDate(person.deathDate)) exactDeath.push(profile.name);
		}

		for (const award of profile.awards ?? []) {
			awardHighlights += 1;
			if (
				!award.label ||
				!award.category ||
				(award.year !== undefined && (!Number.isInteger(award.year) || award.year < 1900 || award.year > 2026))
			) {
				invalidAwards.push({ slug, award });
			}
		}
	}

	const report = {
		profiles: Object.keys(personProfiles).length,
		movies: movies.length,
		uniqueProfileNames: profileNames.size,
		peopleRecords: Object.keys(people).length,
		duplicatePeopleNames,
		duplicateProfileNames,
		missingPeopleRecords,
		noSources,
		approvedProfiles: Object.values(personProfiles).filter((profile) => profile.editorialStatus === 'approved').length,
		profilesWithEditorialBiography: Object.values(personProfiles).filter((profile) => (profile.editorialBiography ?? []).length > 0).length,
		totalCatalogCredits,
		totalKnownForLinks,
		invalidKnownFor,
		missingCatalogLinks,
		birth: {
			exactDate: exactBirth.length,
			yearOrPartialOnly: yearOnlyBirth.length,
			missing: missingBirth.length,
			yearOrPartialNames: yearOnlyBirth,
			missingNames: missingBirth,
		},
		death: {
			withDeathRecord: deathRecords.length,
			exactDate: exactDeath.length,
		},
		awardHighlights,
		invalidAwards,
	};

	const blockingFailures = [
		...duplicateProfileNames.map(([slug]) => `duplicate profile name: ${slug}`),
		...invalidKnownFor.map(({ slug }) => `invalid knownFor: ${slug}`),
		...missingCatalogLinks.map(({ slug }) => `missing catalog links: ${slug}`),
		...noSources.map((slug) => `missing profile sources: ${slug}`),
		...invalidAwards.map(({ slug }) => `invalid award: ${slug}`),
	];

	if (blockingFailures.length) {
		throw new Error(`${JSON.stringify(report, null, 2)}\nBlocking failures:\n${blockingFailures.join('\n')}`);
	}

	return report;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
	auditPersonProfileFacts()
		.then((report) => {
			console.log(JSON.stringify(report, null, 2));
		})
		.catch((error) => {
			console.error(error.message);
			process.exit(1);
		});
}
