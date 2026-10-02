import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSearchUrl, lookupMetadata, parseArgs, selectTitleMatch, toOutput } from './watchmode-metadata.mjs';

const args = { title: 'Schumacher 94', originalTitle: 'Schumacher & Schumacher', year: 2026, imdbId: 'tt39453404', tmdbId: null };
const match = { id: 11229290, name: 'Schumacher and Schumacher', type: 'movie', year: 2026, imdb_id: args.imdbId, tmdb_id: 123 };
const details = { ...match, title: match.name, user_rating: 7.3, critic_score: 68, cast: [] };
const searchUrl = buildSearchUrl(args);
const detailsUrl = new URL(`https://api.watchmode.com/v1/title/${match.id}/details/`);
const output = (fields = {}, options = {}) => toOutput(match, { ...details, ...fields }, searchUrl, detailsUrl, options);

test('CLI parses optional ratings without losing title, year or known IDs', () => {
	assert.deepEqual(parseArgs(['--title', 'Schumacher 94', '--year', '2026', '--imdb-id', args.imdbId, '--include-ratings']), {
		title: args.title, originalTitle: null, year: 2026, imdbId: args.imdbId, tmdbId: null, includeRatings: true,
	});
	assert.equal(parseArgs(['--title', 'Film', '--year', '2026']).includeRatings, false);
	assert.throws(() => parseArgs(['--title', 'Film', '--year', '2026', '--imdb-id', 'nm123']), /tt1234567/);
});

test('search prioritizes IMDb, then TMDb movie ID, then title', () => {
	for (const [input, field, value] of [
		[{ ...args, tmdbId: 123 }, 'imdb_id', args.imdbId],
		[{ ...args, imdbId: null, tmdbId: 123 }, 'tmdb_movie_id', '123'],
		[{ ...args, imdbId: null }, 'name', args.title],
	]) {
		const url = buildSearchUrl(input);
		assert.equal(url.searchParams.get('search_field'), field);
		assert.equal(url.searchParams.get('search_value'), value);
		assert.equal(url.searchParams.get('types'), 'movie');
		assert.equal(url.searchParams.has('apiKey'), false);
	}
});

test('known exact IMDb ID resolves a different localized title', () => {
	assert.equal(selectTitleMatch({ title_results: [match] }, args), match);
});

test('known TMDb ID resolves a localized title independently of its name', () => {
	assert.equal(selectTitleMatch({ title_results: [match] }, { ...args, imdbId: null, tmdbId: 123 }), match);
});

test('name-only lookup requires exact normalized AR or original title', () => {
	const nameArgs = { ...args, title: 'Otro título', originalTitle: 'Schúmacher and Schumacher', imdbId: null };
	assert.equal(selectTitleMatch({ title_results: [match] }, nameArgs), match);
	assert.throws(() => selectTitleMatch({ title_results: [match] }, { ...nameArgs, originalTitle: null }), /no devolvió/);
});

test('ID matches cannot override wrong year, series type or conflicting IDs', () => {
	for (const wrong of [{ year: 2025 }, { type: 'tv_series' }, { imdb_id: 'tt999' }, { tmdb_id: 999 }]) {
		assert.throws(() => selectTitleMatch({ title_results: [{ ...match, ...wrong }] }, { ...args, tmdbId: 123 }), /no devolvió/);
	}
});

test('ambiguous and empty searches fail rather than choosing the first result', () => {
	assert.throws(() => selectTitleMatch({ title_results: [match, { ...match, id: 99 }] }, args), /varias coincidencias/);
	assert.throws(() => selectTitleMatch({}, args), /no devolvió/);
});

test('details revalidate matched identity before exposing any fields', () => {
	for (const wrong of [{ id: 999 }, { year: 2025 }, { type: 'tv_movie' }, { imdb_id: 'tt999' }, { tmdb_id: 999 }]) {
		assert.throws(() => output(wrong), /no coinciden/);
	}
});

test('default output excludes ratings, third-party images and editorial prose', () => {
	const result = output({ poster: 'https://example.com/poster.jpg', plot_overview: 'Source copy', review_summary: 'Source review' });
	assert.equal('ratings' in result, false);
	assert.equal(JSON.stringify(result).includes('example.com'), false);
	assert.equal(JSON.stringify(result).includes('Source copy'), false);
	assert.equal(JSON.stringify(result).includes('Source review'), false);
});

test('opt-in ratings expose raw scales and unknown vote counts with Watchmode attribution', () => {
	assert.deepEqual(output({}, { includeRatings: true }).ratings, {
		source: 'Watchmode', audience: { value: 7.3, scale: 10, voteCount: null }, critics: { value: 68, scale: 100 },
	});
});

test('null, missing, string, non-finite and out-of-scale ratings never become a score', () => {
	for (const value of [null, undefined, '7.3', NaN, Infinity, -1, 101]) {
		const ratings = output({ user_rating: value, critic_score: value }, { includeRatings: true }).ratings;
		assert.equal(ratings.audience.value, null);
		assert.equal(ratings.critics.value, null);
	}
	assert.equal(output({ user_rating: 10.1 }, { includeRatings: true }).ratings.audience.value, null);
});

test('a verified numeric zero stays distinct from null', () => {
	const ratings = output({ user_rating: 0, critic_score: 0 }, { includeRatings: true }).ratings;
	assert.equal(ratings.audience.value, 0);
	assert.equal(ratings.critics.value, 0);
});

test('lookup retrieves credits and optional ratings in exactly two calls using only header auth', async (t) => {
	const calls = [];
	t.mock.method(globalThis, 'fetch', async (url, options) => {
		calls.push({ url: new URL(url), options });
		return { ok: true, json: async () => calls.length === 1 ? { title_results: [match] } : details };
	});
	const result = await lookupMetadata({ ...args, includeRatings: true }, 'test-only-key');
	assert.equal(calls.length, 2);
	assert.equal(calls[1].url.pathname, `/v1/title/${match.id}/details/`);
	assert.equal(calls[1].url.searchParams.get('append_to_response'), 'cast-crew');
	assert.equal(result.ratings.audience.value, 7.3);
	for (const call of calls) {
		assert.equal(call.options.headers['X-API-Key'], 'test-only-key');
		assert.ok(call.options.signal instanceof AbortSignal);
		assert.equal(call.url.toString().includes('test-only-key'), false);
	}
	assert.equal(JSON.stringify(result).includes('test-only-key'), false);
});

test('HTTP quota failure stops with a safe error and does not retry', async (t) => {
	let calls = 0;
	t.mock.method(globalThis, 'fetch', async () => { calls += 1; return { ok: false, status: 429 }; });
	await assert.rejects(lookupMetadata(args, 'test-only-key'), { message: 'Watchmode respondió HTTP 429.' });
	assert.equal(calls, 1);
});
