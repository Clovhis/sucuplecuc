import test from 'node:test';
import assert from 'node:assert/strict';
import { assertWeeklyReleaseScope, getWeeklyReleasePeriod, validateWeeklyRelease } from './lib/weekly-release-policy.mjs';

const runDate = '2026-11-12';
const period = getWeeklyReleasePeriod('cine', runDate);
const execution = {
	provider: 'codex-native', model: 'gpt-6-luna', effort: 'max', status: 'completed', probe: 'passed', agentId: 'fixture-agent',
	parentCompletion: { attestedBy: 'native-task-root', agentId: 'fixture-agent', completedAt: '2026-11-12T13:01:00.000Z' },
};
const modelCatalog = { observedAt: '2026-11-12T13:00:00.000Z', models: [{ model: 'gpt-6-luna', reasoningEfforts: ['medium', 'max'] }] };
const slug = 'estrenos-cines-12-noviembre-2026';
const sources = [
	{ label: 'Distribuidora', url: 'https://distribuidora.example/estreno' },
	{ label: 'Exhibidor', url: 'https://cinemark.example/cartelera' },
];
const note = {
	slug, title: 'Estrenos de cine del 12 al 18 de noviembre', date: runDate, author: 'CinePosta', type: 'nota',
	excerpt: 'Guía de funciones verificadas en Buenos Aires.', sources,
	cover: { src: `assets/editorial/${slug}/portada.webp`, alt: 'Cartelera con funciones de la semana.' },
	content: [{ type: 'paragraph', text: 'Una semana de películas para elegir. La película de prueba tiene una función confirmada en una sala comercial.' }],
};
const movie = { slug: 'pelicula-de-prueba-2026', title: 'La película de prueba', releasePlatform: 'Cine', cinepostaScore: 7 };
const tweet = `Una función de La película de prueba ya está confirmada en Buenos Aires. https://www.cineposta.com.ar/editorial/${slug}/ #Estrenos #Cine`;
const report = {
	kind: 'cine', date: runDate, period, slug, execution, tweet, social: { tweet }, includedSlugs: [movie.slug], homeSlugs: [movie.slug],
	candidates: [{ slug: movie.slug, status: 'existing', include: true, evidence: { showings: [{ date: runDate, chain: 'Cinemark', venue: 'Cinemark Palermo', locality: 'CABA', jurisdiction: 'CABA', url: 'https://www.cinemark.com.ar/cartelera' }] } }],
	sources, imageChecks: [{ sourceUrl: 'https://distribuidora.example/arte', description: 'Se observó la portada oficial y coincide con el estreno anunciado.' }],
};

test('weekly windows are Thursday–Wednesday for cinema and current Monday–Sunday for platforms', () => {
	assert.deepEqual(getWeeklyReleasePeriod('cine', '2026-11-12'), { kind: 'cine', runDate: '2026-11-12', start: '2026-11-12', end: '2026-11-18', schedule: 'jueves-10-art' });
	assert.deepEqual(getWeeklyReleasePeriod('plataformas', '2026-11-13'), { kind: 'plataformas', runDate: '2026-11-13', start: '2026-11-09', end: '2026-11-15', schedule: 'viernes-10-art' });
	assert.throws(() => getWeeklyReleasePeriod('cine', '2026-11-13'), /jueves/u);
	assert.throws(() => getWeeklyReleasePeriod('plataformas', '2026-11-12'), /viernes/u);
});

test('cinema guide requires an eligible Buenos Aires chain, actual week function, and native execution record', () => {
	const result = validateWeeklyRelease({ kind: 'cine', runDate, period, execution, modelCatalog, report: structuredClone(report), note, moviesBySlug: { [movie.slug]: movie }, now: new Date('2026-11-12T15:00:00Z') });
	assert.equal(result.includedCount, 1);
	for (const invalid of [
		{ ...report, candidates: [{ ...report.candidates[0], evidence: { showings: [{ ...report.candidates[0].evidence.showings[0], jurisdiction: 'Córdoba' }] } }] },
		{ ...report, candidates: [{ ...report.candidates[0], evidence: { showings: [{ ...report.candidates[0].evidence.showings[0], date: '2026-11-19' }] } }] },
		{ ...report, candidates: [{ ...report.candidates[0], evidence: { showings: [{ ...report.candidates[0].evidence.showings[0], chain: 'Cineclub barrial' }] } }] },
	]) assert.throws(() => validateWeeklyRelease({ kind: 'cine', runDate, period, execution, modelCatalog, report: invalid, note, moviesBySlug: { [movie.slug]: movie }, now: new Date('2026-11-12T15:00:00Z') }));
	assert.throws(() => validateWeeklyRelease({ kind: 'cine', runDate, period, execution: { ...execution, probe: 'failed' }, modelCatalog, report: structuredClone(report), note, moviesBySlug: { [movie.slug]: movie }, now: new Date('2026-11-12T15:00:00Z') }), /Luna Max/u);
	assert.throws(() => validateWeeklyRelease({ kind: 'cine', runDate, period, execution: { ...execution, parentCompletion: undefined }, modelCatalog, report: structuredClone(report), note, moviesBySlug: { [movie.slug]: movie }, now: new Date('2026-11-12T15:00:00Z') }), /tarea raíz/u);
});

test('Thursday manifest revalidates every prior Cine title, including removals outside the guide', () => {
	const stale = { slug: 'stale-cine-2004', title: 'Ficha fuera de cartelera', releasePlatform: 'Netflix', cinepostaScore: 6 };
	const currentCandidate = {
		...report.candidates[0],
		cinemaRevalidation: { decision: 'retained', checkedOn: runDate, showings: [{ date: runDate, chain: 'Cinemark', venue: 'Cinemark Palermo', locality: 'CABA', jurisdiction: 'CABA', url: 'https://www.cinemark.com.ar/cartelera' }] },
	};
	const removedCandidate = {
		slug: stale.slug, status: 'updated', include: false, changedFile: `src/data/movies/${stale.slug}.json`, reason: 'No conserva funciones elegibles; se confirmó Netflix AR.',
		cinemaRevalidation: {
			decision: 'removed', checkedOn: runDate,
			venueChecks: [
				{ url: 'https://www.cinesargentinos.com.ar/cartelera/', checkedOn: runDate, result: 'no-eligible-showing', official: false },
				{ url: 'https://www.cinemark.com.ar/cartelera/', checkedOn: runDate, result: 'no-eligible-showing', official: true },
			],
			availability: { justwatchUrl: 'https://www.justwatch.com/ar/pelicula/ficha-fuera-de-cartelera', checkedOn: runDate, offers: [{ provider: 'Netflix', offerType: 'FLATRATE', country: 'AR', url: 'https://www.netflix.com/title/123456' }] },
		},
	};
	const fullReport = { ...structuredClone(report), candidates: [currentCandidate, removedCandidate] };
	const checked = validateWeeklyRelease({
		kind: 'cine', runDate, period, execution, modelCatalog, report: fullReport, note,
		moviesBySlug: { [movie.slug]: movie, [stale.slug]: stale },
		baselineCinemaSlugs: [movie.slug, stale.slug],
		baselineMoviesBySlug: { [movie.slug]: movie, [stale.slug]: { ...stale, releasePlatform: 'Cine' } },
		now: new Date('2026-11-12T15:00:00Z'),
	});
	assert.equal(checked.includedCount, 1);
	assert.throws(() => validateWeeklyRelease({
		kind: 'cine', runDate, period, execution, modelCatalog, report: { ...fullReport, candidates: [currentCandidate] }, note,
		moviesBySlug: { [movie.slug]: movie, [stale.slug]: stale },
		baselineCinemaSlugs: [movie.slug, stale.slug],
		baselineMoviesBySlug: { [movie.slug]: movie, [stale.slug]: { ...stale, releasePlatform: 'Cine' } },
		now: new Date('2026-11-12T15:00:00Z'),
	}), /manifiesto semanal/u);
});

test('streaming evidence names the Argentina provider, offer type and release date; simultaneous Cine is allowed', () => {
	const date = '2026-11-13';
	const streamPeriod = getWeeklyReleasePeriod('plataformas', date);
	const streamSlug = 'estrenos-streaming-6-al-12-noviembre-2026';
	const streamMovie = { slug: 'estreno-de-prueba-2026', title: 'Un estreno de prueba', releasePlatform: 'Netflix', cinepostaScore: 6 };
	const cinemaStreamMovie = { slug: 'estreno-simultaneo-2026', title: 'Un estreno simultáneo', releasePlatform: 'Netflix', releasePlatforms: ['Netflix', 'Cine'], cinepostaScore: 6 };
	const streamSources = [{ label: 'JustWatch AR', url: 'https://www.justwatch.com/ar/pelicula/un-estreno-de-prueba' }, { label: 'Netflix', url: 'https://www.netflix.com/title/123456' }];
	const streamNote = { ...note, slug: streamSlug, title: 'Novedades de plataformas de la semana', date, sources: streamSources, content: [{ type: 'paragraph', text: 'Un estreno de prueba y Un estreno simultáneo llegaron esta semana con Netflix y están disponibles para el público argentino.' }] };
	const streamExecution = { ...execution };
	const streamCatalog = { observedAt: '2026-11-13T13:00:00.000Z', models: modelCatalog.models };
	const streamReport = {
		kind: 'plataformas', date, period: streamPeriod, slug: streamSlug, execution: streamExecution,
		tweet: `Esta semana llegó Un estreno de prueba a Netflix en Argentina. https://www.cineposta.com.ar/editorial/${streamSlug}/ #Estrenos #Streaming`,
		social: { tweet: `Esta semana llegó Un estreno de prueba a Netflix en Argentina. https://www.cineposta.com.ar/editorial/${streamSlug}/ #Estrenos #Streaming` },
		includedSlugs: [streamMovie.slug, cinemaStreamMovie.slug], homeSlugs: [streamMovie.slug], candidates: [{ slug: streamMovie.slug, status: 'existing', include: true, evidence: { availability: {
			justwatchUrl: 'https://www.justwatch.com/ar/pelicula/un-estreno-de-prueba', reason: 'new-availability', activeOn: '2026-11-09', checkedOn: date,
			offers: [{ provider: 'Netflix', offerType: 'FLATRATE', country: 'AR', url: 'https://www.netflix.com/title/123456' }],
		} } }, { slug: cinemaStreamMovie.slug, status: 'existing', include: true, evidence: { availability: {
			justwatchUrl: 'https://www.justwatch.com/ar/pelicula/estreno-simultaneo', reason: 'new-availability', activeOn: date, checkedOn: date,
			offers: [{ provider: 'Netflix', offerType: 'FLATRATE', country: 'AR', url: 'https://www.netflix.com/title/654321' }],
		} } }], sources: streamSources, imageChecks: [{ sourceUrl: 'https://distribuidora.example/arte', description: 'Se observó el arte de la película y su correspondencia con la ficha oficial.' }],
	};
	const result = validateWeeklyRelease({ kind: 'plataformas', runDate: date, period: streamPeriod, execution: streamExecution, modelCatalog: streamCatalog, report: streamReport, note: streamNote, moviesBySlug: { [streamMovie.slug]: streamMovie, [cinemaStreamMovie.slug]: cinemaStreamMovie }, now: new Date('2026-11-13T15:00:00Z') });
	assert.equal(result.includedCount, 2);
	for (const change of [
		{ activeOn: '2026-11-14', checkedOn: date },
		{ activeOn: '2026-11-12', checkedOn: '2026-11-12' },
	]) {
		const invalid = structuredClone(streamReport);
		Object.assign(invalid.candidates[0].evidence.availability, change);
		assert.throws(() => validateWeeklyRelease({ kind: 'plataformas', runDate: date, period: streamPeriod, execution: streamExecution, modelCatalog: streamCatalog, report: invalid, note: streamNote, moviesBySlug: { [streamMovie.slug]: streamMovie, [cinemaStreamMovie.slug]: cinemaStreamMovie }, now: new Date('2026-11-13T15:00:00Z') }));
	}
});

test('a streaming guide may list no home cards when every included title is still in Cine', () => {
	const date = '2026-11-13';
	const streamPeriod = getWeeklyReleasePeriod('plataformas', date);
	const streamSlug = 'estrenos-streaming-6-al-12-noviembre-2026';
	const simultaneous = { slug: 'estreno-simultaneo-2026', title: 'Un estreno simultáneo', releasePlatform: 'Netflix', releasePlatforms: ['Netflix', 'Cine'], cinepostaScore: 6 };
	const streamSources = [{ label: 'JustWatch AR', url: 'https://www.justwatch.com/ar/pelicula/estreno-simultaneo' }, { label: 'Netflix', url: 'https://www.netflix.com/title/654321' }];
	const streamNote = { ...note, slug: streamSlug, title: 'Novedades de plataformas de la semana', date, sources: streamSources, content: [{ type: 'paragraph', text: 'Un estreno simultáneo llegó a Netflix en Argentina mientras continúa en cartelera.' }] };
	const tweet = `Un estreno simultáneo llegó a Netflix y sigue en cartelera. https://www.cineposta.com.ar/editorial/${streamSlug}/ #Estrenos #Streaming`;
	const streamReport = {
		kind: 'plataformas', date, period: streamPeriod, slug: streamSlug, execution,
		tweet, social: { tweet }, includedSlugs: [simultaneous.slug], homeSlugs: [],
		homeOmissionReason: 'El carrusel Streaming omite las fichas que todavía tienen Cine activo.',
		candidates: [{ slug: simultaneous.slug, status: 'existing', include: true, evidence: { availability: {
			justwatchUrl: streamSources[0].url, reason: 'new-availability', activeOn: date, checkedOn: date,
			offers: [{ provider: 'Netflix', offerType: 'FLATRATE', country: 'AR', url: streamSources[1].url }],
		} } }], sources: streamSources,
		imageChecks: [{ sourceUrl: 'https://distribuidora.example/arte', description: 'Se verificó el arte de la película y su correspondencia con la ficha oficial.' }],
	};
	const options = { kind: 'plataformas', runDate: date, period: streamPeriod, execution, modelCatalog: { ...modelCatalog, observedAt: '2026-11-13T13:00:00.000Z' }, report: streamReport, note: streamNote, moviesBySlug: { [simultaneous.slug]: simultaneous }, now: new Date('2026-11-13T15:00:00Z') };
	assert.equal(validateWeeklyRelease(options).includedCount, 1);
	assert.throws(() => validateWeeklyRelease({ ...options, report: { ...streamReport, homeOmissionReason: undefined } }), /homeOmissionReason/u);
});

test('un título sin score o evidencia permanece pendiente; no se le inventa una nota', () => {
	const pendingReport = structuredClone(report);
	const missingSlug = 'titulo-sin-score-2026';
	pendingReport.candidates.push({ slug: missingSlug, status: 'pending', include: false, reason: 'No se encontró un agregado público después de la secuencia de búsqueda.', scoreSearches: ['IMDb', 'Metacritic', 'Watchmode'] });
	const result = validateWeeklyRelease({ kind: 'cine', runDate, period, execution, modelCatalog, report: pendingReport, note, moviesBySlug: { [movie.slug]: movie, [missingSlug]: undefined }, now: new Date('2026-11-12T15:00:00Z') });
	assert.equal(result.includedCount, 1);
	assert.throws(() => validateWeeklyRelease({ kind: 'cine', runDate, period, execution, modelCatalog, report: { ...pendingReport, candidates: [{ ...report.candidates[0], status: 'loaded' }], includedSlugs: [movie.slug] }, note, moviesBySlug: { [movie.slug]: { ...movie, cinepostaScore: undefined } }, now: new Date('2026-11-12T15:00:00Z') }), /score público/u);
});

test('publication footprint allows catalog and editorial assets but rejects home snapshots/deletions', () => {
	const opts = { kind: 'cine', date: runDate, slug };
	assert.equal(assertWeeklyReleaseScope([
		{ status: 'M', path: `src/data/editorials/${slug}.json` },
		{ status: 'A', path: 'src/data/movies/pelicula-de-prueba-2026.json' },
		{ status: 'M', path: 'src/data/personProfileCatalogCredits.generated.ts' },
		{ status: 'A', path: `public/assets/editorial/${slug}/portada.webp` },
		{ status: 'A', path: `reports/weekly-releases/cine/${runDate}.json` },
	], opts), true);
	assert.throws(() => assertWeeklyReleaseScope([{ status: 'M', path: 'src/data/weeklyRecommendations.generated.ts' }], opts), /fuera del alcance/u);
	assert.throws(() => assertWeeklyReleaseScope([{ status: 'M', path: 'src/data/personProfileCatalog.generated.ts' }], opts), /fuera del alcance/u);
	assert.throws(() => assertWeeklyReleaseScope([{ status: 'M', path: 'src/data/personProfileCatalogCredits.generated.tsx' }], opts), /fuera del alcance/u);
	assert.throws(() => assertWeeklyReleaseScope([{ status: 'D', path: `src/data/editorials/${slug}.json` }], opts), /borrados/u);
});
