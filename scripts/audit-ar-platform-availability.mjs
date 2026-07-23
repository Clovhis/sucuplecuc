#!/usr/bin/env node

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const MOVIES_DIR = path.resolve('src/data/movies');
const CHECK_ALL = process.argv.includes('--all');
const JSON_OUTPUT = process.argv.includes('--json');
const ONLY_MISMATCHES = process.argv.includes('--only-mismatches');
const argumentValue = (name, fallback) => {
	const value = process.argv[process.argv.indexOf(name) + 1];
	const parsed = Number.parseInt(value, 10);
	return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};
const CONCURRENCY = argumentValue('--concurrency', 1);
const OFFSET = argumentValue('--offset', 0);
const LIMIT = argumentValue('--limit', Number.POSITIVE_INFINITY);
const REQUEST_DELAY_MS = argumentValue('--delay-ms', 1200);

const JUSTWATCH_SEARCH_QUERY = `
query SearchTitles($searchQuery: String!, $country: Country!, $language: Language!) {
  popularTitles(country: $country, first: 10, filter: { searchQuery: $searchQuery, objectTypes: [MOVIE] }) {
    edges {
      node {
        id
        ... on Movie {
          content(country: $country, language: $language) { title originalReleaseYear fullPath }
          offers(country: $country, platform: WEB) {
            monetizationType
            package { id clearName technicalName shortName }
          }
        }
      }
    }
  }
}`;

const PROVIDER_MAP = [
	[/netflix/i, 'Netflix'],
	[/amazon (prime )?video|prime video/i, 'Prime Video'],
	[/hbo max|(^|\s)max(\s|$)/i, 'HBO Max'],
	[/paramount\+|paramount plus/i, 'Paramount Plus'],
	[/disney\+|disney plus/i, 'Disney Plus'],
	[/apple tv/i, 'Apple TV'],
	[/crunchyroll/i, 'Crunchyroll'],
	[/mercado play/i, 'Mercado Play'],
	[/cine\.ar|cine ar/i, 'CINE.AR'],
];

const SUBSCRIPTION_TYPES = new Set(['FLATRATE', 'FLATRATE_AND_BUY', 'ADS', 'FREE', 'FAST']);

function normalize(value = '') {
	return String(value)
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/&/g, ' and ')
		.replace(/[^a-z0-9]+/g, ' ')
		.trim();
}

function titleScore(movie, candidate) {
	const targets = [movie.title, movie.originalTitle].filter(Boolean).map(normalize);
	const actual = normalize(candidate.title);
	let score = 0;
	for (const target of targets) {
		if (target === actual) score = Math.max(score, 120);
		else if (target && (actual.includes(target) || target.includes(actual))) score = Math.max(score, 90);
		else {
			const targetTokens = new Set(target.split(' ').filter((token) => token.length > 1));
			const actualTokens = new Set(actual.split(' ').filter((token) => token.length > 1));
			const common = [...targetTokens].filter((token) => actualTokens.has(token)).length;
			if (common) score = Math.max(score, Math.round((common / Math.max(targetTokens.size, actualTokens.size)) * 80));
		}
	}
	if (Number(candidate.year) === Number(movie.year)) score += 30;
	return score;
}

function providerForPackage(pkg) {
	const name = `${pkg?.clearName ?? ''} ${pkg?.technicalName ?? ''} ${pkg?.shortName ?? ''}`;
	return PROVIDER_MAP.find(([pattern]) => pattern.test(name))?.[1] ?? null;
}

async function fetchJustWatch(movie) {
	const query = movie.originalTitle || movie.title;
	const response = await fetch('https://apis.justwatch.com/graphql', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ query: JUSTWATCH_SEARCH_QUERY, variables: { searchQuery: query, country: 'AR', language: 'es' } }),
	});
	if (!response.ok) throw new Error(`HTTP ${response.status}`);
	const payload = await response.json();
	if (payload.errors?.length) throw new Error(payload.errors.map((error) => error.message).join('; '));
	const candidates = (payload.data?.popularTitles?.edges ?? [])
		.map((edge) => edge.node)
		.filter((node) => node?.content)
		.filter((node) => !movie.year || Math.abs(Number(node.content.originalReleaseYear) - Number(movie.year)) <= 1)
		.map((node) => ({ node, content: node.content, score: titleScore(movie, { title: node.content.title, year: node.content.originalReleaseYear }) }))
		.sort((left, right) => right.score - left.score);
	const best = candidates[0];
	if (!best || best.score < 100 || !best.content?.fullPath) return { status: 'unmatched', url: `https://www.justwatch.com/ar/buscar?q=${encodeURIComponent(query)}`, candidates: candidates.slice(0, 3).map(({ content, score }) => ({ title: content?.title, year: content?.originalReleaseYear, score })) };

	const offers = best.node.offers ?? [];
	const providers = new Map();
	for (const offer of offers) {
		const provider = providerForPackage(offer?.package);
		if (!provider) continue;
		const offerType = offer?.monetizationType;
		const kind = SUBSCRIPTION_TYPES.has(offerType) ? 'subscription' : ['BUY', 'RENT'].includes(offerType) ? 'transactional' : offerType === 'CINEMA' ? 'cinema' : null;
		if (!kind) continue;
		const existing = providers.get(provider);
		if (!existing || (existing.kind === 'transactional' && kind !== 'transactional')) providers.set(provider, { provider, kind, offerType });
	}
	return {
		status: 'matched',
		url: `https://www.justwatch.com${best.content.fullPath}`,
		matchedTitle: best.content.title,
		matchedYear: best.content.originalReleaseYear,
		providers: [...providers.values()],
	};
}

function expectedPlatform(providers) {
	const preferred = providers.find((entry) => entry.kind === 'subscription') ?? providers.find((entry) => entry.kind === 'cinema') ?? providers[0];
	return preferred?.provider ?? 'Otras plataformas';
}

function classify(entry, availability) {
	if (availability.status !== 'matched') return { status: availability.status };
	const labels = new Set([entry.movie.releasePlatform, ...(entry.movie.releasePlatforms ?? [])]);
	const verified = new Set(availability.providers.map((provider) => provider.provider));
	if ([...labels].some((label) => verified.has(label))) return { status: 'verified' };
	if (labels.has('Otras plataformas') && verified.size === 0) return { status: 'verified' };
	return { status: 'mismatch', expected: expectedPlatform(availability.providers) };
}

const files = (await readdir(MOVIES_DIR)).filter((file) => file.endsWith('.json')).sort();
const entries = await Promise.all(files.map(async (file) => ({ file, movie: JSON.parse(await readFile(path.join(MOVIES_DIR, file), 'utf8')) })));
const candidates = (CHECK_ALL ? entries : entries.filter((entry) => entry.movie.releasePlatform !== 'Otras plataformas')).slice(OFFSET, OFFSET + LIMIT);
const results = [];
let cursor = 0;
await Promise.all(
	Array.from({ length: CONCURRENCY }, async () => {
		while (cursor < candidates.length) {
			const entry = candidates[cursor++];
			try {
				const availability = await fetchJustWatch(entry.movie);
				results.push({ file: entry.file, title: entry.movie.title, year: entry.movie.year, current: entry.movie.releasePlatform, availability, ...classify(entry, availability) });
			} catch (error) {
				results.push({ file: entry.file, title: entry.movie.title, year: entry.movie.year, current: entry.movie.releasePlatform, status: 'error', error: error.message });
			}
			if (REQUEST_DELAY_MS > 0) await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));
		}
	}),
);

results.sort((left, right) => left.file.localeCompare(right.file));
const summary = Object.fromEntries(['verified', 'mismatch', 'unmatched', 'error'].map((status) => [status, results.filter((result) => result.status === status).length]));
const auditDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date());
const output = { auditDate, checked: results.length, summary, results };
if (JSON_OUTPUT) console.log(JSON.stringify(output, null, 2));
else {
	console.log(`AR platform audit (${output.auditDate}): ${output.checked} titles checked.`);
	console.log(Object.entries(summary).map(([key, value]) => `${key}: ${value}`).join(' | '));
	const reportedResults = ONLY_MISMATCHES ? results.filter((result) => result.status === 'mismatch') : results.filter((result) => result.status !== 'verified');
	for (const result of reportedResults) {
		const providers = result.availability?.providers?.map((provider) => `${provider.provider} (${provider.kind})`).join(', ') || 'none';
		console.log(`${result.status.toUpperCase()} | ${result.file} | ${result.current} -> ${result.expected ?? '-'} | ${providers} | ${result.availability?.url ?? result.error ?? ''}`);
	}
}
