import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createMovieSearch, parseMovieQuery, matchesParsedQuery } from '../src/lib/movie-search.ts';
import { encodeHomeSearchIndex, decodeHomeSearchIndex } from '../src/lib/home-search-codec.ts';
import { readFile } from 'node:fs/promises';

function movie(slug, title, year, director, cast, genres, platforms, score, extra = {}) {
	const norm = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
	return { slug, title, year: String(year), normalizedTitle: norm(title), normalizedOriginalTitle: '', searchAliases: '', searchDirector: norm(director), searchCast: norm(cast), searchable: norm(`${title} ${year} ${director} ${cast}`), primaryGenre: genres[0], genres, subgenres: [], platforms, score, ...extra };
}
const records = [
	movie('shining', 'El resplandor', 1980, 'Stanley Kubrick', 'Jack Nicholson', ['terror', 'culto'], ['hbo max'], 9, { normalizedOriginalTitle: 'the shining' }),
	movie('space', '2001: Odisea del espacio', 1968, 'Stanley Kubrick', 'Keir Dullea', ['sci-fi'], ['hbo max'], 10),
	movie('fight', 'El club de la pelea', 1999, 'David Fincher', 'Brad Pitt | Edward Norton', ['drama'], ['netflix'], 8, { normalizedOriginalTitle: 'fight club', searchAliases: 'el club de la lucha' }),
	movie('seven', 'Seven', 1995, 'David Fincher', 'Brad Pitt | Morgan Freeman', ['thriller'], ['hbo max'], 8),
	movie('alien', 'Alien', 1979, 'Ridley Scott', 'Sigourney Weaver', ['terror', 'sci-fi'], ['disney plus'], 9),
	movie('unranked', 'Sin puntaje', 1985, 'Alguien', '', ['sci-fi'], ['netflix'], null),
	movie('mention', 'Una entrevista', 2026, 'Alguien', '', ['documental'], ['netflix'], 5, { searchable: 'un documental que menciona a brad pitt y stanley kubrick' }),
	movie('1984', '1984', 1984, 'Michael Radford', 'John Hurt', ['drama'], ['netflix'], 7),
	movie('musical', 'Una animación musical', 1988, '', '', ['animacion', 'musical'], ['netflix'], 7),
];
const engine = await createMovieSearch(records);
const search = (query) => [...engine.search(query).ranks.keys()].sort();

test('interpreta los cuatro ejemplos, sin falsos positivos por menciones en sinopsis', () => {
	assert.deepEqual(search('película vieja de Kubrick'), ['shining', 'space']);
	assert.deepEqual(search('terror de los 80'), ['shining']);
	assert.deepEqual(search('Brad Pitt en Netflix'), ['fight']);
	assert.deepEqual(search('ciencia ficción con más de 8 puntos'), ['space']);
});
test('títulos originales, alternativos y errores de escritura', () => {
	assert.equal(search('the shining')[0], 'shining');
	assert.deepEqual(search('EL RESPLÁNDOR'), ['shining']);
	assert.deepEqual(search('el club de la lucha'), ['fight']);
	assert.deepEqual(search('pelicula de Kubrik'), ['shining', 'space']);
	assert.deepEqual(search('Bradd Pitt en Netflx'), ['fight']);
	assert.deepEqual(search('resplndor'), ['shining']);
	assert.deepEqual(search('shinnig'), ['shining']);
	assert.deepEqual(search('pelicula de Kubrcik'), ['shining', 'space']);
});
test('protege títulos numéricos y palabras entre comillas', () => {
	assert.deepEqual(search('2001: Odisea del espacio'), ['space']);
	assert.deepEqual(search('1984'), ['1984']);
	assert.equal(engine.search('1984').parsed.minYear, null);
	assert.equal(engine.search('1984 en Netflix').parsed.minYear, null);
	assert.equal(engine.search('1984 en Netflix').parsed.text, '1984');
	assert.equal(engine.search('"terror"').parsed.genres.length, 0);
	assert.deepEqual(search('"2001: Odisea del espacio"'), ['space']);
});
test('puntajes estrictos, inclusivos, decimales, rangos y sin rankear', () => {
	assert.deepEqual(search('sci-fi con más de 8 puntos'), ['space']);
	assert.deepEqual(search('sci-fi con al menos 8 puntos'), ['space']);
	assert.deepEqual(search('score >= 9'), ['alien', 'shining', 'space']);
	assert.deepEqual(search('>= 9'), ['alien', 'shining', 'space']);
	assert.deepEqual(search('menos de 8 puntos'), ['1984', 'mention', 'musical']);
	assert.deepEqual(search('más de 8,5 puntos'), ['alien', 'shining', 'space']);
	assert.deepEqual(search('entre 8 y 9 puntos'), ['alien', 'fight', 'seven', 'shining']);
	assert.equal(matchesParsedQuery(records[5], parseMovieQuery('hasta 9 puntos')), false);
});
test('años, décadas y rangos nunca se tratan como puntajes', () => {
	for (const query of ['terror de los 80', 'terror de la década del 80', 'terror 1980s', 'terror 80s']) assert.deepEqual(search(query), ['shining']);
	assert.deepEqual(search('entre 1980 y 1989'), ['1984', 'musical', 'shining', 'unranked']);
	assert.deepEqual(search('antes de 1970'), ['space']);
	assert.deepEqual(search('después de 2020'), ['mention']);
	assert.equal(parseMovieQuery('más de 1980').minScore, null);
});

test('los límites acumulados se intersectan y no amplían una restricción anterior', () => {
	assert.deepEqual(search('de los 80 antes de 2000'), ['1984', 'musical', 'shining', 'unranked']);
	assert.deepEqual(search('antes de 2000 de los 80'), ['1984', 'musical', 'shining', 'unranked']);
	assert.deepEqual(search('más de 8 puntos y al menos 7 puntos'), ['alien', 'shining', 'space']);
	assert.deepEqual(search('menos de 8 puntos y hasta 9 puntos'), ['1984', 'mention', 'musical']);
	assert.deepEqual(search('antes de 1980 y después de 2000'), []);
	assert.deepEqual(search('más de 8 puntos y menos de 7 puntos'), []);
});
test('roles, sinónimos, límites y filtros comparten semántica con los controles', () => {
	assert.deepEqual(search('dirigida por Brad Pitt'), []);
	assert.deepEqual(search('con el actor Brad Pitt'), ['fight', 'seven']);
	assert.deepEqual(search('musical de los 80'), ['musical']);
	assert.deepEqual(search('terror de culto'), ['shining']);
	assert.deepEqual(search('ciencia ficcion de culto'), []);
	assert.deepEqual(search('suspenso en Max'), ['seven']);
	assert.deepEqual(search('terror en Disney+'), ['alien']);
	assert.deepEqual(search('terror en Netflix'), []);
	assert.deepEqual(search('noexistezzzz'), []);
	assert.doesNotThrow(() => engine.search('z'.repeat(10000)));
});
test('el ranking antepone un título exacto a una sinopsis, y cachea al cambiar filtros', () => {
	const result = engine.search('Alien');
	assert.equal([...result.ranks].sort((a, b) => a[1] - b[1])[0][0], 'alien');
	assert.equal(engine.search('Alien'), result);
});

test('un título conocido no coincide por accidente con otra palabra o una etiqueta', async () => {
	const source = [...records, movie('brave', 'Valiente', 2012, '', '', ['animacion'], ['disney plus'], 7)];
	const engine = await createMovieSearch(source);
	assert.deepEqual([...engine.search('Alien').ranks.keys()], ['alien']);
	assert.deepEqual([...engine.search('Alien en Netflix').ranks.keys()], []);
});

test('decodifica sin perder campos y rechaza formatos o referencias inválidas', async () => {
	const source = [{ ...records[0], normalizedMeta: '1980 · terror · hbo max jack nicholson', releaseTimestamp: 0, recentPremiere: false, url: '/peliculas/shining/', posterUrl: '/assets/posters/1980/shining.webp', meta: '1980 · Terror · HBO Max', cast: 'Jack Nicholson', card: { verdictLabel: 'Obra maestra', verdictClass: 'badge--recomendada', genreLabels: ['Terror'], audienceRating: '+16', cult: true, platformLabels: ['HBO Max'] } }];
	assert.deepEqual(decodeHomeSearchIndex(encodeHomeSearchIndex(source)), source);
	assert.throws(() => decodeHomeSearchIndex({ version: 3, movies: [], cards: [] }));
	const invalid = encodeHomeSearchIndex(source.slice(0, 1));
	invalid.movies[0][invalid.movies[0].length - 1] = 9999;
	assert.throws(() => decodeHomeSearchIndex(invalid));
});

test('las altas semanales entran por título y original sin exigir alias ni cambiar el motor', async () => {
	const added = movie('weekly-fixture', 'Película semanal', 2026, 'Directora nueva', 'Actriz nueva', ['drama'], ['netflix'], 7, { normalizedOriginalTitle: 'weekly release', searchable: 'pelicula semanal weekly release directora nueva actriz nueva' });
	const search = await createMovieSearch([...records, added]);
	assert.equal(search.search('weekly release').ranks.get('weekly-fixture'), 0);
	assert.equal(search.search('Película semanal').ranks.get('weekly-fixture'), 0);
});

test('negaciones simples, décadas escritas, años y texto no latino no producen búsquedas amplias', () => {
	assert.deepEqual(search('terror sin gore'), ['alien', 'shining']);
	assert.deepEqual(search('terror de los ochenta'), ['shining']);
	assert.deepEqual(search('año 1984'), ['1984']);
	assert.deepEqual(search('不存在的電影'), []);
	assert.deepEqual(search('"brad freeman"'), []);
	assert.deepEqual(search('actor Brad Freeman'), []);
});

test('cada alias adicional conserva película, año y URL de su evidencia', async () => {
	const { entries } = JSON.parse(await readFile('src/data/movie-search-aliases.json', 'utf8'));
	for (const entry of entries) {
		const movie = JSON.parse(await readFile(`src/data/movies/${entry.slug}.json`, 'utf8'));
		assert.equal(movie.year, entry.year);
		assert.ok(entry.titles.length);
		for (const title of entry.titles) {
			assert.ok(title.title.trim());
			assert.match(title.source, /^https:\/\/(?:www\.justwatch\.com|(?:m\.|www\.)?cinesargentinos\.com\.ar|tv\.apple\.com)\//);
			if (new URL(title.source).hostname === 'tv.apple.com') assert.ok(new URL(title.source).pathname.startsWith('/ar/'));
			assert.ok(['AR','ES','US'].includes(title.region));
		}
	}
});
