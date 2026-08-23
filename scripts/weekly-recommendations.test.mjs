import assert from 'node:assert/strict';

import {
	getConfirmedStreamingPlatforms,
	getWeeklyRecommendationManifest,
} from '../src/lib/weekly-recommendations.ts';

function createMovie(overrides) {
	return {
		slug: overrides.slug,
		title: overrides.title ?? overrides.slug,
		originalTitle: overrides.title ?? overrides.slug,
		synopsis: 'Sinopsis de prueba.',
		year: overrides.year,
		releaseDate: overrides.releaseDate,
		audienceRating: 'ATP',
		category: 'Drama',
		poster: 'posters/test.jpg',
		trailerYoutubeId: 'test123',
		releasePlatform: overrides.releasePlatform,
		releasePlatforms: overrides.releasePlatforms,
		director: 'Directora de prueba',
		mainCast: [],
		productionCompany: 'Productora de prueba',
		verdict: overrides.verdict ?? 'recomendada',
		verdictLabel: overrides.verdictLabel ?? 'Recomendada',
		review: 'Reseña de prueba.',
	};
}

const movies = [
	createMovie({ slug: 'nueva-1', year: 2026, releaseDate: '2026-08-01', releasePlatform: 'Netflix', verdictLabel: 'Imperdible' }),
	createMovie({ slug: 'nueva-2', year: 2025, releaseDate: '2025-10-01', releasePlatform: 'HBO Max', verdictLabel: 'Muy buena' }),
	createMovie({ slug: 'clasica-1', year: 1985, releasePlatform: 'Disney Plus', verdictLabel: 'Clásico total' }),
	createMovie({ slug: 'clasica-2', year: 2000, releasePlatform: 'Apple TV', verdictLabel: 'Muy recomendada' }),
	createMovie({ slug: 'intermedia', year: 2015, releasePlatform: 'Prime Video', verdictLabel: 'Recomendada' }),
	createMovie({ slug: 'zafa', year: 2024, releaseDate: '2024-08-01', releasePlatform: 'Netflix', verdict: 'zafa', verdictLabel: 'Zafa' }),
	createMovie({ slug: 'cine', year: 2024, releaseDate: '2024-08-01', releasePlatform: 'Cine', verdictLabel: 'Imperdible' }),
	createMovie({ slug: 'cine-y-streaming', year: 2024, releaseDate: '2024-08-01', releasePlatforms: ['Netflix', 'Cine'], verdictLabel: 'Imperdible' }),
	createMovie({ slug: 'sin-proveedor-confirmado', year: 2024, releaseDate: '2024-08-01', releasePlatform: 'Otras plataformas', verdictLabel: 'Imperdible' }),
];

assert.deepEqual(getConfirmedStreamingPlatforms(movies[0]), ['Netflix']);
assert.deepEqual(getConfirmedStreamingPlatforms(movies[6]), []);
assert.deepEqual(getConfirmedStreamingPlatforms(movies[7]), []);
assert.deepEqual(getConfirmedStreamingPlatforms(movies[8]), []);

const manifest = getWeeklyRecommendationManifest(movies, new Date('2026-08-23T12:00:00Z'));
const selectedSlugs = manifest.recommendations.map(({ slug }) => slug);
const selectedEras = new Set(manifest.recommendations.map(({ era }) => era));

assert.equal(manifest.weekKey, '2026-08-23');
assert.equal(manifest.recommendations.length, 5);
assert.ok(selectedEras.has('nueva'), 'debe incluir novedades');
assert.ok(selectedEras.has('clasica'), 'debe incluir películas clásicas');
assert.ok(!selectedSlugs.includes('zafa'), 'no debe incluir Zafa');
assert.ok(!selectedSlugs.includes('cine'), 'no debe incluir películas de cine');
assert.ok(!selectedSlugs.includes('cine-y-streaming'), 'no debe incluir títulos mixtos cine/plataforma');
assert.ok(!selectedSlugs.includes('sin-proveedor-confirmado'), 'no debe incluir disponibilidad no confirmada');

console.log('weekly recommendations: ok');
