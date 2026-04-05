import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { updateMovieCatalogReference } from './update-movie-catalog-reference.mjs';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MOVIES_DIR = path.join(ROOT_DIR, 'src/data/movies');
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36';
const REQUEST_HEADERS = {
	'user-agent': USER_AGENT,
	'accept-language': 'es-AR,es;q=0.9,en;q=0.8',
};

function parseArgs(argv) {
	const result = {
		all: false,
		missingOnly: false,
	};

	for (let index = 0; index < argv.length; index += 1) {
		const token = argv[index];
		if (token === '--all') {
			result.all = true;
			continue;
		}
		if (token === '--missing-only') {
			result.missingOnly = true;
			continue;
		}
		if (token === '--movie') {
			result.movie = argv[index + 1];
			index += 1;
			continue;
		}
		if (token === '--limit') {
			result.limit = Number.parseInt(argv[index + 1], 10);
			index += 1;
			continue;
		}
		throw new Error(`Argumento no reconocido: ${token}`);
	}

	return result;
}

function normalizeText(value = '') {
	return String(value)
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, ' ')
		.trim();
}

function decodeHtmlEntities(value = '') {
	return String(value)
		.replace(/&#39;/g, "'")
		.replace(/&amp;/g, '&')
		.replace(/&quot;/g, '"')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>');
}

function getTokenSet(value) {
	return new Set(normalizeText(value).split(/\s+/).filter(Boolean));
}

function getTitleScore(referenceTitles, candidateTitle) {
	const candidateNormalized = normalizeText(candidateTitle);
	if (!candidateNormalized) {
		return 0;
	}

	let bestScore = 0;
	const candidateTokens = getTokenSet(candidateTitle);

	for (const title of referenceTitles) {
		const normalizedTitle = normalizeText(title);
		if (!normalizedTitle) {
			continue;
		}

		if (normalizedTitle === candidateNormalized) {
			bestScore = Math.max(bestScore, 120);
			continue;
		}

		if (normalizedTitle.includes(candidateNormalized) || candidateNormalized.includes(normalizedTitle)) {
			bestScore = Math.max(bestScore, 95);
		}

		const titleTokens = getTokenSet(title);
		const overlap = [...titleTokens].filter((token) => candidateTokens.has(token)).length;
		if (overlap > 0) {
			const ratio = overlap / Math.max(titleTokens.size, candidateTokens.size);
			bestScore = Math.max(bestScore, Math.round(ratio * 80));
		}
	}

	return bestScore;
}

function scoreCandidate(movie, candidate) {
	let score = getTitleScore([movie.title, movie.originalTitle], candidate.title);
	const yearDistance = Math.abs((candidate.year ?? 0) - movie.year);

	if (candidate.year === movie.year) {
		score += 120;
	} else if (yearDistance === 1) {
		score += 35;
	} else if (yearDistance === 2) {
		score += 10;
	} else {
		score -= yearDistance * 20;
	}

	if (candidate.certification) {
		score += 10;
	}

	if (candidate.rank === 0) {
		score += 30;
	} else if (candidate.rank === 1) {
		score += 10;
	}

	return score;
}

function normalizeAudienceRating(rawValue) {
	const raw = String(rawValue ?? '')
		.trim()
		.toUpperCase();

	if (!raw) {
		return null;
	}

	if (['ATP', 'TP', 'G', 'U', 'AL', 'A', 'L', 'PG', 'APTA', 'SR'].includes(raw)) {
		return 'ATP';
	}

	const numericMatches = [...raw.matchAll(/\d{1,2}/g)].map((match) => Number.parseInt(match[0], 10));
	if (numericMatches.length > 0) {
		return `+${String(Math.max(...numericMatches))}`;
	}

	if (raw === 'R') {
		return '+17';
	}

	if (raw === 'M') {
		return '+15';
	}

	if (raw === 'NC-17' || raw === 'X' || raw === 'TV-MA' || raw === 'MA') {
		return '+18';
	}

	return null;
}

function inferAudienceRatingFromMetadata(movie) {
	const haystack = normalizeText([movie.category, ...(movie.genres ?? [])].join(' '));

	if (haystack.includes('terror') || haystack.includes('thriller') || haystack.includes('suspense')) {
		return '+16';
	}

	if (
		haystack.includes('drama') ||
		haystack.includes('crimen') ||
		haystack.includes('historia') ||
		haystack.includes('guerra') ||
		haystack.includes('accion') ||
		haystack.includes('science fiction') ||
		haystack.includes('ciencia ficcion') ||
		haystack.includes('anime')
	) {
		return '+13';
	}

	return 'ATP';
}

async function fetchHtml(url) {
	const response = await fetch(url, {
		headers: REQUEST_HEADERS,
	});

	if (!response.ok) {
		throw new Error(`HTTP ${response.status} para ${url}`);
	}

	return response.text();
}

function extractTmdbLinks(searchHtml) {
	return [...new Set([...searchHtml.matchAll(/href="(\/movie\/\d+(?:-[^"#?]+)?)"/g)].map((match) => match[1]))].filter(
		(link) => !['/movie/now-playing', '/movie/upcoming', '/movie/top-rated'].includes(link),
	);
}

async function findTmdbCandidates(query) {
	const searchHtml = await fetchHtml(`https://www.themoviedb.org/search/movie?query=${encodeURIComponent(query)}`);
	const links = extractTmdbLinks(searchHtml).slice(0, 6);
	const candidates = [];

	for (const link of links) {
		const detailHtml = await fetchHtml(`https://www.themoviedb.org${link}`);
		const titleMatch = detailHtml.match(/<title>(.*?) \((\d{4})\).*?<\/title>/i);
		if (!titleMatch) {
			continue;
		}

		const certification = detailHtml.match(/<span class="certification">\s*([^<]+?)\s*<\/span>/i)?.[1]?.trim();
		candidates.push({
			source: 'tmdb',
			query,
			rank: candidates.length,
			link: `https://www.themoviedb.org${link}`,
			title: decodeHtmlEntities(titleMatch[1].trim()),
			year: Number.parseInt(titleMatch[2], 10),
			certification: normalizeAudienceRating(certification),
			rawCertification: certification?.trim() ?? '',
		});
	}

	return candidates;
}

function extractApolloState(html) {
	const start = html.indexOf('window.__APOLLO_STATE__=');
	if (start === -1) {
		return null;
	}
	const end = html.indexOf('</script>', start);
	if (end === -1) {
		return null;
	}

	const sandbox = { window: {} };
	vm.runInNewContext(html.slice(start, end), sandbox);
	return sandbox.window.__APOLLO_STATE__?.defaultClient ?? null;
}

async function findJustWatchCandidates(query) {
	const searchHtml = await fetchHtml(`https://www.justwatch.com/ar/buscar?q=${encodeURIComponent(query)}`);
	const state = extractApolloState(searchHtml);
	if (!state) {
		return [];
	}

	const searchKey = Object.keys(state).find(
		(key) =>
			key.startsWith('$ROOT_QUERY.searchTitles({') &&
			key.includes(`"searchQuery":"${query.replace(/"/g, '\\"')}"`) &&
			!key.includes('.edges') &&
			!key.includes('.pageInfo'),
	);

	if (!searchKey) {
		return [];
	}

	const result = state[searchKey];
	if (!result?.edges) {
		return [];
	}

	const candidates = [];
	for (const edgeRef of result.edges.slice(0, 6)) {
		const edge = state[edgeRef.id];
		const node = state[edge?.node?.id];
		if (!node || node.objectType !== 'MOVIE') {
			continue;
		}

		const contentKey = Object.keys(node).find((key) => key.startsWith('content({"country":"AR","language":"es"})'));
		if (!contentKey) {
			continue;
		}

		const content = state[node[contentKey]?.id];
		if (!content?.fullPath) {
			continue;
		}

		const detailHtml = await fetchHtml(`https://www.justwatch.com${content.fullPath}`);
		const contentRating = detailHtml.match(/"contentRating":"([^"]+)"/)?.[1]?.trim();
		candidates.push({
			source: 'justwatch',
			query,
			rank: candidates.length,
			link: `https://www.justwatch.com${content.fullPath}`,
			title: content.title?.trim() ?? '',
			year: Number.parseInt(content.originalReleaseYear, 10),
			certification: normalizeAudienceRating(contentRating),
			rawCertification: contentRating ?? '',
		});
	}

	return candidates;
}

async function resolveAudienceRating(movie) {
	const queries = [
		movie.title,
		movie.originalTitle,
		`${movie.title} ${movie.year}`,
		`${movie.originalTitle} ${movie.year}`,
	]
		.filter(Boolean)
		.filter((value, index, array) => array.indexOf(value) === index);

	const allCandidates = [];
	for (const query of queries) {
		allCandidates.push(...(await findTmdbCandidates(query)));
	}

	const tmdbBest = allCandidates
		.map((candidate) => ({ candidate, score: scoreCandidate(movie, candidate) }))
		.sort((left, right) => right.score - left.score)[0];

	if (tmdbBest?.candidate?.certification && tmdbBest.score >= 150) {
		return {
			...tmdbBest.candidate,
			score: tmdbBest.score,
		};
	}

	const justWatchCandidates = [];
	for (const query of queries) {
		justWatchCandidates.push(...(await findJustWatchCandidates(query)));
	}

	const justWatchBest = justWatchCandidates
		.map((candidate) => ({ candidate, score: scoreCandidate(movie, candidate) }))
		.sort((left, right) => right.score - left.score)[0];

	if (justWatchBest?.candidate?.certification && justWatchBest.score >= 150) {
		return {
			...justWatchBest.candidate,
			score: justWatchBest.score,
		};
	}

	if (tmdbBest?.candidate?.certification && tmdbBest.candidate.year === movie.year && tmdbBest.score >= 110) {
		return {
			...tmdbBest.candidate,
			score: tmdbBest.score,
		};
	}

	return null;
}

async function loadMovieEntries() {
	const fileNames = (await readdir(MOVIES_DIR)).filter((fileName) => fileName.endsWith('.json')).sort();
	return Promise.all(
		fileNames.map(async (fileName) => {
			const filePath = path.join(MOVIES_DIR, fileName);
			const raw = await readFile(filePath, 'utf8');
			return {
				fileName,
				filePath,
				movie: JSON.parse(raw),
			};
		}),
	);
}

async function saveMovie(filePath, movie) {
	await writeFile(filePath, `${JSON.stringify(movie, null, '\t')}\n`, 'utf8');
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	if (!args.all && !args.movie) {
		throw new Error('Usa --all o --movie <slug>.');
	}

	const entries = await loadMovieEntries();
	let selectedEntries = entries;

	if (args.movie) {
		selectedEntries = entries.filter((entry) => entry.movie.slug === args.movie);
		if (selectedEntries.length === 0) {
			throw new Error(`No existe la pelicula con slug "${args.movie}".`);
		}
	}

	if (args.missingOnly) {
		selectedEntries = selectedEntries.filter((entry) => !entry.movie.audienceRating?.trim());
	}

	if (Number.isInteger(args.limit) && args.limit > 0) {
		selectedEntries = selectedEntries.slice(0, args.limit);
	}

	const unresolved = [];
	let updated = 0;

	for (const entry of selectedEntries) {
		const resolution = await resolveAudienceRating(entry.movie);
		if (!resolution?.certification) {
			entry.movie.audienceRating = inferAudienceRatingFromMetadata(entry.movie);
			if (entry.movie.editorial?.idealFor) {
				delete entry.movie.editorial.idealFor;
			}
			await saveMovie(entry.filePath, entry.movie);
			updated += 1;
			console.log(`Inferida ${entry.movie.slug}: ${entry.movie.audienceRating}`);
			continue;
		}

		entry.movie.audienceRating = resolution.certification;
		if (entry.movie.editorial?.idealFor) {
			delete entry.movie.editorial.idealFor;
		}

		await saveMovie(entry.filePath, entry.movie);
		updated += 1;
		console.log(
			`Actualizada ${entry.movie.slug}: ${resolution.certification} (${resolution.source} - ${resolution.link})`,
		);
	}

	if (updated > 0) {
		await updateMovieCatalogReference();
	}

	if (unresolved.length > 0) {
		console.log('\nPendientes:');
		for (const slug of unresolved) {
			console.log(`- ${slug}`);
		}
		process.exitCode = 1;
		return;
	}

	console.log(`\nClasificaciones actualizadas: ${updated}`);
}

main().catch((error) => {
	console.error(error.message);
	process.exit(1);
});
