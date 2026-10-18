import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createWeeklyRecommendationCards, getArgentinaDateKey } from '../src/lib/home-editions.ts';
import { extractArgentinaReleases, extractYoutubeIds, findEmbeddableTrailer } from './upcoming-release-source.mjs';

assert.equal(getArgentinaDateKey(new Date('2026-10-18T02:59:59Z')), '2026-10-17');
assert.equal(getArgentinaDateKey(new Date('2026-10-18T04:00:00Z')), '2026-10-18');

// Keep each edition on its own schedule and connect successful publishers to Pages.
const deploy = await readFile(new URL('../.github/workflows/deploy.yml', import.meta.url), 'utf8');
for (const [file, cron, generator, snapshot, forbiddenGenerator] of [
	['refresh-weekly-recommendations.yml', '0 4 * * 0', 'refresh:weekly-recommendations', 'weeklyRecommendations.generated.ts', 'update-upcoming-releases'],
	['refresh-upcoming-releases.yml', '0 4 * * *', 'update-upcoming-releases', 'upcomingReleases.generated.ts', 'refresh:weekly-recommendations'],
]) {
	const workflow = await readFile(new URL(`../.github/workflows/${file}`, import.meta.url), 'utf8');
	const name = workflow.match(/^name: '([^']+)'/m)?.[1];
	assert.ok(name && deploy.includes(`- '${name}'`), `${file} must trigger Pages using its exact workflow name`);
	assert.ok(workflow.includes(`cron: '${cron}'`), `${file} must retain its Argentina schedule`);
	assert.match(workflow, /workflow_dispatch:/, 'Each edition must support manual recovery');
	assert.ok(workflow.includes(`run: npm run ${generator}`));
	assert.ok(!workflow.includes(forbiddenGenerator), 'An edition must not regenerate the other section');
	assert.match(workflow, /group: publish-home-editions\s+cancel-in-progress: false/, 'Publishers must serialize writes to main');
	const runs = [...workflow.matchAll(/^\s+run: (.+)$/gm)].map((match) => match[1]);
	const validate = runs.indexOf('npm run validate:content -- --astro-check');
	const publish = runs.indexOf(`node scripts/publish-home-edition.mjs src/data/${snapshot}`);
	assert.ok(validate >= 0 && publish > validate, 'Validate before publishing exactly the owned snapshot');
	assert.ok(!workflow.includes('continue-on-error:'), 'Failed generation or validation must preserve the published edition');
}

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

const realFetch = globalThis.fetch;
try {
	globalThis.fetch = async (url) => new URL(url).searchParams.get('url')?.includes('blocked1234')
		? new Response('', { status: 403 })
		: new Response(JSON.stringify({ type: 'video', title: 'Trailer oficial', author_name: 'Distribuidor argentino' }));
	assert.equal((await findEmbeddableTrailer(['blocked1234', 'Z_yVJ1PHHrA']))?.id, 'Z_yVJ1PHHrA', 'Skip a blocked video and test the next trailer of the same film');
} finally { globalThis.fetch = realFetch; }
console.log('Home automation: Argentine dates and frozen editions verified.');

const radarWorkflow = await readFile(new URL('../.github/workflows/refresh-cinema-news.yml', import.meta.url), 'utf8');
assert.ok(radarWorkflow.includes("cron: '0 13 * * *'"));
assert.ok(deploy.includes('Radar de Cine diario (10:00 AR)'));
assert.ok(!radarWorkflow.includes('node scripts/publish-home-edition') && !radarWorkflow.includes('refresh:cinema-news'));
assert.ok(radarWorkflow.includes('run: npm run validate:content -- --astro-check'));
