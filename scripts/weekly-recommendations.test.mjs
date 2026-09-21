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
		cinepostaScore: overrides.cinepostaScore ?? 7,
		review: 'Reseña de prueba.',
	};
}

const movies = [
	createMovie({ slug: 'nueva-1', year: 2026, releaseDate: '2026-08-01', releasePlatform: 'Netflix', cinepostaScore: 9 }),
	createMovie({ slug: 'nueva-2', year: 2025, releaseDate: '2025-10-01', releasePlatform: 'HBO Max', cinepostaScore: 8 }),
	createMovie({ slug: 'clasica-1', year: 1985, releasePlatform: 'Disney Plus', cinepostaScore: 10 }),
	createMovie({ slug: 'clasica-2', year: 2000, releasePlatform: 'Apple TV', cinepostaScore: 8 }),
	createMovie({ slug: 'intermedia', year: 2015, releasePlatform: 'Prime Video', cinepostaScore: 7 }),
	createMovie({ slug: 'zafa', year: 2024, releaseDate: '2024-08-01', releasePlatform: 'Netflix', cinepostaScore: 5 }),
	createMovie({ slug: 'cine', year: 2024, releaseDate: '2024-08-01', releasePlatform: 'Cine', cinepostaScore: 9 }),
	createMovie({ slug: 'cine-y-streaming', year: 2024, releaseDate: '2024-08-01', releasePlatforms: ['Netflix', 'Cine'], cinepostaScore: 9 }),
	createMovie({ slug: 'sin-proveedor-confirmado', year: 2024, releaseDate: '2024-08-01', releasePlatform: 'Otras plataformas', cinepostaScore: 9 }),
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

const forcedManifest = getWeeklyRecommendationManifest(
	movies,
	new Date('2026-08-23T12:00:00Z'),
	3,
	new Set(['nueva-1', 'clasica-1']),
);
const forcedSlugs = forcedManifest.recommendations.map(({ slug }) => slug);
assert.ok(!forcedSlugs.includes('nueva-1'), 'la rotación forzada debe excluir la edición vigente');
assert.ok(!forcedSlugs.includes('clasica-1'), 'la rotación forzada debe excluir la edición vigente');

const rotationPool = [
	...Array.from({ length: 12 }, (_, index) =>
		createMovie({
			slug: `rotation-new-${index + 1}`,
			year: 2025,
			releaseDate: '2025-01-01',
			releasePlatform: 'Netflix',
		}),
	),
	...Array.from({ length: 12 }, (_, index) =>
		createMovie({
			slug: `rotation-classic-${index + 1}`,
			year: 1980,
			releasePlatform: 'Netflix',
		}),
	),
];

const firstWeek = getWeeklyRecommendationManifest(rotationPool, new Date('2026-08-23T12:00:00Z'));
const sameWeek = getWeeklyRecommendationManifest(rotationPool, new Date('2026-08-23T18:00:00Z'));
const nextWeek = getWeeklyRecommendationManifest(rotationPool, new Date('2026-08-30T12:00:00Z'));
const firstWeekSlugs = firstWeek.recommendations.map(({ slug }) => slug);
const nextWeekSlugs = nextWeek.recommendations.map(({ slug }) => slug);
const repeatedSlugs = nextWeekSlugs.filter((slug) => firstWeekSlugs.includes(slug));

assert.deepEqual(
	sameWeek.recommendations,
	firstWeek.recommendations,
	'la edición debe ser estable durante la misma semana',
);
assert.equal(repeatedSlugs.length, 0, 'la edición siguiente no debe repetir la anterior si hay candidatos suficientes');
assert.notDeepEqual(nextWeek.recommendations, firstWeek.recommendations, 'la semana siguiente debe rotar la selección');

console.log('weekly recommendations: ok');
