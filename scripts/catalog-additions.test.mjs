import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getLatestCatalogAdditions } from '../src/lib/catalog-additions.ts';

test('las incorporaciones usan su fecha real y el día de Argentina, sin confundir estrenos ni reseñas', () => {
	const oldFilm = { slug: 'clasico', title: 'Clásico', year: 1970, catalogAddedAt: '2026-10-23', releaseDate: '1970-01-01' };
	const premiere = { slug: 'estreno', title: 'Estreno', year: 2026, catalogAddedAt: '2026-10-22', releaseDate: '2026-10-23' };
	const future = { slug: 'futura', title: 'Futura', catalogAddedAt: '2026-10-24' };
	const undated = { slug: 'sin-fecha', title: 'Sin fecha', reviewPublishedAt: '2026-10-24' };
	const movies = [premiere, undated, future, oldFilm];
	// 01:00 UTC on the 24th is still the 23rd in Argentina.
	const now = new Date('2026-10-24T01:00:00Z');
	assert.deepEqual(getLatestCatalogAdditions(movies, now), [oldFilm, premiere]);
	assert.deepEqual(movies, [premiere, undated, future, oldFilm]);
	assert.deepEqual(getLatestCatalogAdditions(movies, now, 1), [oldFilm]);
	assert.deepEqual(getLatestCatalogAdditions(movies, now, 0), []);
	assert.deepEqual(getLatestCatalogAdditions([undated], now), []);
});
