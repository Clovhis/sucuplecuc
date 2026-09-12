import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const moviesDirectory = path.join(repoRoot, 'src', 'data', 'movies');
const flagsDirectory = path.join(repoRoot, 'public', 'images', 'flags');
const flagIconsBaseUrl = 'https://raw.githubusercontent.com/lipis/flag-icons/main/flags/4x3';
const sovietUnionFlagUrl = 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Flag_of_the_Soviet_Union.svg';

function flagCodeFor(countryCode) {
	return countryCode === 'XC' ? 'cz' : countryCode.toLowerCase();
}

async function fileExists(filePath) {
	try {
		return (await stat(filePath)).isFile();
	} catch {
		return false;
	}
}

async function fetchFlag(countryCode) {
	const url = countryCode === 'SU' ? sovietUnionFlagUrl : `${flagIconsBaseUrl}/${flagCodeFor(countryCode)}.svg`;
	const response = await fetch(url, { headers: { 'User-Agent': 'CinePosta-country-flag-sync' } });
	if (!response.ok) throw new Error(`No se pudo descargar ${countryCode}: ${response.status} ${url}`);
	return Buffer.from(await response.arrayBuffer());
}

const countries = new Set();
for (const filename of await readdir(moviesDirectory)) {
	if (!filename.endsWith('.json')) continue;
	const movie = JSON.parse(await readFile(path.join(moviesDirectory, filename), 'utf8'));
	for (const countryCode of String(movie.country ?? '').split(',')) {
		if (countryCode.trim()) countries.add(countryCode.trim());
	}
}

await mkdir(flagsDirectory, { recursive: true });
let downloaded = 0;
for (const countryCode of [...countries].sort()) {
	const target = path.join(flagsDirectory, `${flagCodeFor(countryCode)}.svg`);
	if (await fileExists(target)) continue;
	await writeFile(target, await fetchFlag(countryCode));
	downloaded += 1;
}

console.log(`Banderas locales verificadas: ${countries.size}; descargadas: ${downloaded}.`);
