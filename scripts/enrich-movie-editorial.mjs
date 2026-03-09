import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const MOVIES_DIR = path.resolve('src/data/movies');
const USER_AGENT = 'cine-posta-editorial-enricher/1.0';
const SEARCH_LIMIT = 5;
const CONCURRENCY = 2;
const searchCache = new Map();
const entityCache = new Map();

function normalizeTitleVariant(value) {
	return value.replace(/\s+/g, ' ').trim();
}

function normalizeTitleKey(value) {
	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, ' ')
		.trim();
}

function buildTitleVariants(movie) {
	const variants = new Set();
	const sourceTitles = [movie.originalTitle, movie.title].filter(
		(value) => typeof value === 'string' && value.trim().length > 0,
	);

	for (const sourceTitle of sourceTitles) {
		const normalized = normalizeTitleVariant(sourceTitle);
		if (!normalized) continue;

		variants.add(normalized);
		variants.add(normalized.replace(/[’]/g, "'"));
		variants.add(normalizeTitleVariant(normalized.replace(/\s*\([^)]*\)\s*/g, ' ')));
		variants.add(normalizeTitleVariant(normalized.replace(/\s*&\s*/g, ' and ')));
		variants.add(normalizeTitleVariant(normalized.replace(/\s+and\s+/gi, ' & ')));
	}

	return Array.from(variants).filter(Boolean);
}

async function fetchJson(url) {
	for (let attempt = 1; attempt <= 5; attempt += 1) {
		const response = await fetch(url, {
			headers: {
				accept: 'application/json',
				'user-agent': USER_AGENT,
			},
		});

		if (response.ok) {
			return response.json();
		}

		if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 5) {
			throw new Error(`Request failed with ${response.status}: ${url}`);
		}

		const retryAfter = Number.parseInt(response.headers.get('retry-after') ?? '', 10);
		const waitMs = Number.isInteger(retryAfter) ? retryAfter * 1000 : attempt * 2000;
		await new Promise((resolve) => {
			setTimeout(resolve, waitMs);
		});
	}
}

async function searchEntities(query, language) {
	const cacheKey = `${language}:${query}`;
	if (searchCache.has(cacheKey)) {
		return searchCache.get(cacheKey);
	}

	const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&type=item&limit=${SEARCH_LIMIT}&language=${language}&search=${encodeURIComponent(query)}`;
	const payload = await fetchJson(url);
	const results = Array.isArray(payload?.search) ? payload.search : [];
	searchCache.set(cacheKey, results);
	return results;
}

async function getEntity(entityId) {
	if (entityCache.has(entityId)) {
		return entityCache.get(entityId);
	}

	const payload = await fetchJson(`https://www.wikidata.org/wiki/Special:EntityData/${entityId}.json`);
	const entity = payload?.entities?.[entityId];
	entityCache.set(entityId, entity ?? null);
	return entity ?? null;
}

function getClaimValues(entity, propertyId) {
	return Array.isArray(entity?.claims?.[propertyId]) ? entity.claims[propertyId] : [];
}

function getEntityIdsFromClaims(entity, propertyId) {
	return getClaimValues(entity, propertyId)
		.map((claim) => claim?.mainsnak?.datavalue?.value)
		.filter((value) => value?.['entity-type'] === 'item' && Number.isInteger(value?.['numeric-id']))
		.map((value) => `Q${value['numeric-id']}`);
}

function getMovieYear(entity) {
	for (const claim of getClaimValues(entity, 'P577')) {
		const timeValue = claim?.mainsnak?.datavalue?.value?.time;
		if (typeof timeValue !== 'string' || timeValue.length < 5) continue;
		const year = Number.parseInt(timeValue.slice(1, 5), 10);
		if (Number.isInteger(year)) {
			return year;
		}
	}
	return null;
}

function getRuntimeMinutes(entity) {
	for (const claim of getClaimValues(entity, 'P2047')) {
		const amount = claim?.mainsnak?.datavalue?.value?.amount;
		const numericValue = Number.parseFloat(typeof amount === 'string' ? amount : '');
		if (Number.isFinite(numericValue) && numericValue >= 40 && numericValue <= 360) {
			return Math.round(numericValue);
		}
	}
	return null;
}

function isFilmEntity(entity) {
	const instanceIds = new Set(getEntityIdsFromClaims(entity, 'P31'));
	return instanceIds.has('Q11424') || instanceIds.has('Q24869') || instanceIds.has('Q202866');
}

function getEntityTitleKeys(entity) {
	const titleKeys = new Set();

	for (const label of Object.values(entity?.labels ?? {})) {
		if (typeof label?.value === 'string' && label.value.trim()) {
			titleKeys.add(normalizeTitleKey(label.value));
		}
	}

	for (const aliasGroup of Object.values(entity?.aliases ?? {})) {
		for (const alias of aliasGroup ?? []) {
			if (typeof alias?.value === 'string' && alias.value.trim()) {
				titleKeys.add(normalizeTitleKey(alias.value));
			}
		}
	}

	return titleKeys;
}

async function resolveRuntimeMinutes(movie) {
	const variants = buildTitleVariants(movie);
	const variantKeys = new Set(variants.map((variant) => normalizeTitleKey(variant)));

	for (const variant of variants) {
		for (const language of ['en', 'es']) {
			const searchResults = await searchEntities(variant, language);

			for (const result of searchResults) {
				if (!result?.id) {
					continue;
				}

				const entity = await getEntity(result.id);
				if (!entity || !isFilmEntity(entity)) {
					continue;
				}

				const entityYear = getMovieYear(entity);
				if (entityYear !== movie.year) {
					continue;
				}

				const runtimeMinutes = getRuntimeMinutes(entity);
				if (!runtimeMinutes) {
					continue;
				}

				const entityTitleKeys = getEntityTitleKeys(entity);
				const hasExactTitleMatch = Array.from(variantKeys).some((variantKey) => entityTitleKeys.has(variantKey));
				if (hasExactTitleMatch) {
					return runtimeMinutes;
				}
			}
		}
	}

	return null;
}

function buildUpdatedMovie(movie, runtimeMinutes) {
	const { review, runtimeMinutes: _previousRuntime, ...rest } = movie;
	return {
		...rest,
		runtimeMinutes,
		review,
	};
}

async function loadMovies() {
	const fileNames = (await readdir(MOVIES_DIR)).filter((fileName) => fileName.endsWith('.json'));
	const movies = [];

	for (const fileName of fileNames) {
		const filePath = path.join(MOVIES_DIR, fileName);
		const movie = JSON.parse(await readFile(filePath, 'utf8'));
		movies.push({ filePath, movie });
	}

	return movies;
}

async function runWorker(entries, results) {
	for (;;) {
		const entry = entries.shift();
		if (!entry) {
			return;
		}

		const runtimeMinutes = await resolveRuntimeMinutes(entry.movie);
		results.push({
			filePath: entry.filePath,
			movie: entry.movie,
			runtimeMinutes,
		});
		console.log(`Processed ${entry.movie.slug}: ${runtimeMinutes ?? 'no-match'}`);
	}
}

async function main() {
	const movieEntries = await loadMovies();
	const pendingEntries = movieEntries.filter(({ movie }) => !Number.isInteger(movie.runtimeMinutes));
	const workQueue = [...pendingEntries];
	const results = [];

	await Promise.all(
		Array.from({ length: CONCURRENCY }).map(() => runWorker(workQueue, results)),
	);

	let updatedCount = 0;
	const unmatched = [];

	for (const result of results) {
		if (!result.runtimeMinutes) {
			unmatched.push(result.movie.slug);
			continue;
		}

		const nextMovie = buildUpdatedMovie(result.movie, result.runtimeMinutes);
		if (JSON.stringify(nextMovie) === JSON.stringify(result.movie)) {
			continue;
		}

		await writeFile(result.filePath, `${JSON.stringify(nextMovie, null, '\t')}\n`, 'utf8');
		updatedCount += 1;
	}

	console.log(`Updated runtimes for ${updatedCount} movies.`);
	console.log(`Unmatched movies: ${unmatched.length}`);
	if (unmatched.length > 0) {
		console.log(unmatched.slice(0, 40).join(', '));
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
