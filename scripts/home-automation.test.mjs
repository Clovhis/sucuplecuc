import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createWeeklyRecommendationCards, getArgentinaDateKey } from '../src/lib/home-editions.ts';
import { collectCinemaNews, getCinemaNews } from '../src/lib/cinemaNews.ts';
import { extractArgentinaReleases, extractYoutubeIds, findEmbeddableTrailer } from './upcoming-release-source.mjs';

assert.equal(getArgentinaDateKey(new Date('2026-10-18T02:59:59Z')), '2026-10-17');
assert.equal(getArgentinaDateKey(new Date('2026-10-18T04:00:00Z')), '2026-10-18');

const movie = { slug: 'test', title: 'Original', year: 2020, poster: 'assets/posters/2020/test.webp', cinepostaScore: 8, releasePlatform: 'Netflix' };
const cards = createWeeklyRecommendationCards([movie], { generatedAt: '2026-10-11', weekKey: '2026-10-11', recommendations: [{ slug: 'test', era: 'para-descubrir' }] });
Object.assign(movie, { title: 'Later edit', cinepostaScore: 7, releasePlatform: 'Prime Video' });
assert.equal(cards[0].title, 'Original');
assert.equal(cards[0].verdictLabel, '8 · Excelente');
assert.equal(cards[0].platform, 'Netflix', 'A content edit must not mutate the published card');

const html = '<div class="subTitulo">Jueves 15 de Octubre de 2026</div><div class="estrenoDelDia"><h2 class="lblTitulo"><a href="/pelicula/123-exact-film/">Título &amp; otro</a></h2><div class="paginacion">';
assert.deepEqual(extractArgentinaReleases(html), [{ title: 'Título & otro', releaseDate: '2026-10-15', sourceUrl: 'https://www.cinesargentinos.com.ar/pelicula/123-exact-film/', sourceId: '123' }]);
assert.deepEqual(extractYoutubeIds('<a href="https://www.youtube.com/v/Z_yVJ1PHHrA?x=1">video</a><iframe src="https://youtube.com/embed/Z_yVJ1PHHrA"></iframe>'), ['Z_yVJ1PHHrA']);
assert.deepEqual(extractYoutubeIds('<a href="https://evil.com/?youtube-id=bad">video</a>'), []);

const snapshot = JSON.parse(await readFile(new URL('../src/data/cinemaNews.generated.json', import.meta.url), 'utf8'));
const realFetch = globalThis.fetch;
try {
	globalThis.fetch = async (url) => new URL(url).searchParams.get('url')?.includes('blocked1234')
		? new Response('', { status: 403 })
		: new Response(JSON.stringify({ type: 'video', title: 'Trailer oficial', author_name: 'Distribuidor argentino' }));
	assert.equal((await findEmbeddableTrailer(['blocked1234', 'Z_yVJ1PHHrA']))?.id, 'Z_yVJ1PHHrA', 'Skip a blocked video and test the next trailer of the same film');
	globalThis.fetch = async () => { throw new Error('Build-time network forbidden'); };
	assert.deepEqual(getCinemaNews().items, snapshot.items, 'A build must read the Radar snapshot without remote requests');
	await assert.rejects(collectCinemaNews(snapshot), /All Radar sources failed/);
	globalThis.fetch = async (url) => {
		const host = new URL(url).hostname;
		if (host.includes('lanacion')) throw new Error('One newspaper unavailable');
		return new Response('<rss><channel><item><title>El festival musical anuncia su grilla</title><link>https://www.clarin.com/espectaculos/musica/festival.html</link><category>Música</category><description>El festival se realizará durante tres días con grandes artistas invitados.</description><pubDate>Sun, 11 Oct 2026 13:00:00 GMT</pubDate></item><item><title>Una película llega al cine</title><link>https://www.clarin.com/espectaculos/cine/test.html</link><description>Una película llega al cine argentino con una nueva historia y un estreno confirmado.</description><pubDate>Sun, 11 Oct 2026 12:00:00 GMT</pubDate></item></channel></rss>');
	};
	const partial = await collectCinemaNews(snapshot);
	assert.equal(partial.sources.find(({ name }) => name === 'LA NACION').status, 'preserved');
	assert.deepEqual(partial.sourceItems['LA NACION'], snapshot.sourceItems['LA NACION'], 'Preserve the failed source instead of wiping it');
	assert.ok(!partial.items.some(({ title }) => title === 'El festival musical anuncia su grilla'), 'A music festival must not count as cinema news just because its title says festival');
} finally { globalThis.fetch = realFetch; }
console.log('Home automation: source failures, Argentine dates and frozen editions verified.');
