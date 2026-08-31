import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MOVIES_DIR = path.join(ROOT_DIR, 'src/data/movies');
const OUTPUT_PATH = path.join(ROOT_DIR, 'src/data/personProfileCatalogCredits.generated.ts');
const PROFILE_SOURCE_PATH = path.join(ROOT_DIR, 'src/data/personProfiles.ts');

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

function compareMovies(a, b) {
	return (
		b.year - a.year ||
		a.title.localeCompare(b.title, 'es', { sensitivity: 'base' }) ||
		a.slug.localeCompare(b.slug, 'es', { sensitivity: 'base' })
	);
}

function movieCredits(movie) {
	const credits = [
		...(Array.isArray(movie.mainCast) ? movie.mainCast : []),
		...splitCreditNames(movie.director),
		...(movie.awards?.wins?.recipient ? [movie.awards.wins.recipient] : []),
	];

	return new Set(credits.map(normalizePersonName).filter(Boolean));
}

async function loadMovies() {
	const fileNames = (await readdir(MOVIES_DIR)).filter((fileName) => fileName.endsWith('.json')).sort();
	const movies = await Promise.all(
		fileNames.map(async (fileName) => JSON.parse(await readFile(path.join(MOVIES_DIR, fileName), 'utf8'))),
	);

	return movies.sort(compareMovies);
}

async function loadProfiles() {
	const { personProfiles } = await import(pathToFileURL(PROFILE_SOURCE_PATH).href);
	return Object.values(personProfiles).sort((a, b) => a.slug.localeCompare(b.slug, 'en'));
}

export async function buildPersonProfileCatalogLinks() {
	const [profiles, movies] = await Promise.all([loadProfiles(), loadMovies()]);
	const links = {};

	for (const profile of profiles) {
		const personName = normalizePersonName(profile.name);
		links[profile.slug] = movies.filter((movie) => movieCredits(movie).has(personName)).map((movie) => movie.slug);
	}

	return [
		'// This file is generated from src/data/personProfiles.ts and src/data/movies/*.json.',
		'// Run npm run catalog:people after changing either source.',
		'',
		`export const personProfileCatalogCredits: Record<string, string[]> = ${JSON.stringify(links, null, 2)};`,
		'',
	].join('\n');
}

export async function updatePersonProfileCatalogLinks() {
	await writeFile(OUTPUT_PATH, await buildPersonProfileCatalogLinks(), 'utf8');
}

export async function checkPersonProfileCatalogLinks() {
	const [current, expected] = await Promise.all([readFile(OUTPUT_PATH, 'utf8'), buildPersonProfileCatalogLinks()]);

	if (current.replace(/\r\n/g, '\n') !== expected.replace(/\r\n/g, '\n')) {
		throw new Error(
			'src/data/personProfileCatalogCredits.generated.ts is out of sync with profiles or movies. Run npm run catalog:people.',
		);
	}
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
	const task = process.argv[2] === '--check' ? checkPersonProfileCatalogLinks : updatePersonProfileCatalogLinks;

	task().catch((error) => {
		console.error(error.message);
		process.exit(1);
	});
}
