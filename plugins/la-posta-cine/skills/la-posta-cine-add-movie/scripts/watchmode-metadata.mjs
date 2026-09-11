import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..', '..', '..');
const API_ORIGIN = 'https://api.watchmode.com/v1';

function usage() {
	console.error('Uso: node skills/la-posta-cine-add-movie/scripts/watchmode-metadata.mjs --title "Titulo AR" --year YYYY [--original-title "Titulo original"] [--imdb-id tt...] [--tmdb-id N]');
}

function parseArgs(argv) {
	const args = {};
	for (let index = 0; index < argv.length; index += 1) {
		const argument = argv[index];
		if (argument === '--help' || argument === '-h') return { help: true };
		if (!['--title', '--original-title', '--year', '--imdb-id', '--tmdb-id'].includes(argument)) throw new Error(`Argumento desconocido: ${argument}`);
		const value = argv[index + 1];
		if (!value || value.startsWith('--')) throw new Error(`Falta el valor de ${argument}`);
		args[argument.slice(2)] = value;
		index += 1;
	}

	if (!args.title?.trim()) throw new Error('Falta --title.');
	if (!/^\d{4}$/.test(args.year ?? '')) throw new Error('--year debe tener cuatro dígitos.');
	if (args['imdb-id'] && !/^tt\d+$/u.test(args['imdb-id'])) throw new Error('--imdb-id debe usar el formato tt1234567.');
	if (args['tmdb-id'] && !/^\d+$/u.test(args['tmdb-id'])) throw new Error('--tmdb-id debe ser numérico.');
	return {
		title: args.title.trim(),
		originalTitle: args['original-title']?.trim() || null,
		year: Number.parseInt(args.year, 10),
		imdbId: args['imdb-id'] ?? null,
		tmdbId: args['tmdb-id'] ? Number.parseInt(args['tmdb-id'], 10) : null,
	};
}

function normalizeTitle(value) {
	return value
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLocaleLowerCase('es-AR')
		.replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
		.trim();
}

function parseDotenvValue(value) {
	const trimmed = value.trim();
	if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
		return trimmed.slice(1, -1);
	}
	return trimmed;
}

async function readApiKey() {
	if (process.env.WATCHMODE_API_KEY?.trim()) return process.env.WATCHMODE_API_KEY.trim();

	try {
		const dotenv = await readFile(path.join(repositoryRoot, '.env'), 'utf8');
		for (const line of dotenv.split(/\r?\n/u)) {
			const match = line.match(/^\s*WATCHMODE_API_KEY\s*=\s*(.*)$/u);
			if (match) return parseDotenvValue(match[1]);
		}
	} catch (error) {
		if (error.code !== 'ENOENT') throw error;
	}

	throw new Error('Falta WATCHMODE_API_KEY en el entorno o en el .env local ignorado.');
}

async function fetchJson(url, apiKey) {
	const response = await fetch(url, {
		headers: {
			'X-API-Key': apiKey,
			Accept: 'application/json',
			'User-Agent': 'la-posta-cine-watchmode-metadata/1.0',
		},
		signal: AbortSignal.timeout(15_000),
	});
	if (!response.ok) throw new Error(`Watchmode respondió HTTP ${response.status}.`);
	return response.json();
}

function selectTitleMatch(results, { title, originalTitle, year, imdbId, tmdbId }) {
	const normalizedTitles = new Set([title, originalTitle].filter(Boolean).map(normalizeTitle));
	const candidates = (results.title_results ?? []).filter((candidate) =>
		candidate?.type === 'movie' &&
		candidate.year === year &&
		normalizedTitles.has(normalizeTitle(candidate.name ?? '')) &&
		(!imdbId || candidate.imdb_id === imdbId) &&
		(!tmdbId || candidate.tmdb_id === tmdbId),
	);

	if (candidates.length === 0) throw new Error('Watchmode no devolvió una coincidencia inequívoca de película para el título y año indicados.');
	if (candidates.length > 1) throw new Error('Watchmode devolvió varias coincidencias para el título y año indicados; resolvela con fuentes primarias.');
	return candidates[0];
}

function toOutput(match, details, searchUrl, detailsUrl) {
	return {
		provider: 'Watchmode',
		queries: {
			searchUrl: searchUrl.toString(),
			detailsUrl: detailsUrl.toString(),
		},
		match: {
			watchmodeId: match.id,
			title: match.name,
			year: match.year,
			type: match.type,
			imdbId: match.imdb_id ?? null,
			tmdbId: match.tmdb_id ?? null,
		},
		metadata: {
			title: details.title ?? null,
			originalTitle: details.original_title ?? null,
			englishTitle: details.english_title ?? null,
			year: details.year ?? null,
			originalLanguage: details.original_language ?? null,
			runtimeMinutes: details.runtime_minutes ?? null,
			releaseDate: details.release_date ?? null,
			genres: details.genre_names ?? [],
			imdbId: details.imdb_id ?? null,
			tmdbId: details.tmdb_id ?? null,
			trailerYoutubeUrl: details.trailer ?? null,
			similarWatchmodeTitleIds: details.similar_titles ?? [],
			credits: (details.cast ?? []).map((credit) => ({
				watchmodePersonId: credit.person_id ?? null,
				name: credit.full_name ?? null,
				type: credit.type ?? null,
				role: credit.role ?? null,
				order: credit.order ?? null,
			})),
		},
	};
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	if (args.help) {
		usage();
		return;
	}

	const apiKey = await readApiKey();
	const searchUrl = new URL(`${API_ORIGIN}/search/`);
	searchUrl.searchParams.set('search_field', 'name');
	searchUrl.searchParams.set('search_value', args.title);
	const results = await fetchJson(searchUrl, apiKey);
	const match = selectTitleMatch(results, args);
	const detailsUrl = new URL(`${API_ORIGIN}/title/${match.id}/details/`);
	detailsUrl.searchParams.set('append_to_response', 'cast-crew');
	detailsUrl.searchParams.set('language', 'es');
	const details = await fetchJson(detailsUrl, apiKey);
	console.log(JSON.stringify(toOutput(match, details, searchUrl, detailsUrl), null, 2));
}

main().catch((error) => {
	console.error(error.message);
	process.exitCode = 1;
});
