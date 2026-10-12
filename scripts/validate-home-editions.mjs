import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { WEEKLY_RECOMMENDATIONS, WEEKLY_RECOMMENDATION_CARDS } from '../src/data/weeklyRecommendations.generated.ts';
import { GENERATED_UPCOMING_RELEASES, GENERATED_UPCOMING_RELEASES_UPDATED_AT } from '../src/data/upcomingReleases.generated.ts';
import { getArgentinaDateKey } from '../src/lib/home-editions.ts';

const news = JSON.parse(await readFile(new URL('../src/data/cinemaNews.generated.json', import.meta.url), 'utf8'));
const newsHosts = new Set(['lanacion.com.ar', 'clarin.com', 'pagina12.com.ar', 'ambito.com', 'infobae.com', 'cinesargentinos.com.ar']);
const dateKey = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;
assert.ok(Number.isFinite(Date.parse(news.updatedAt)), 'Radar must have a dated, published snapshot');
assert.ok(news.items.length > 0 && news.items.length <= 8, 'Radar must have 1–8 stories');
assert.equal(new Set(news.items.map(({ link }) => link)).size, news.items.length, 'Duplicate Radar links');
for (const item of news.items) {
	const url = new URL(item.link);
	assert.ok(url.protocol === 'https:' && newsHosts.has(url.hostname.replace(/^www\./, '')), `Untrusted Radar article: ${item.link}`);
	assert.ok(item.title && Number.isFinite(Date.parse(item.publishedAt)), 'Invalid Radar story');
}
assert.ok(dateKey(WEEKLY_RECOMMENDATIONS.weekKey) && dateKey(WEEKLY_RECOMMENDATIONS.generatedAt));
assert.equal(new Date(`${WEEKLY_RECOMMENDATIONS.weekKey}T12:00:00Z`).getUTCDay(), 0, 'Weekly edition must start on Sunday');
assert.equal(WEEKLY_RECOMMENDATION_CARDS.length, 6, 'Weekly edition must contain six frozen cards');
assert.deepEqual(WEEKLY_RECOMMENDATION_CARDS.map(({ slug }) => slug), WEEKLY_RECOMMENDATIONS.recommendations.map(({ slug }) => slug));
for (const card of WEEKLY_RECOMMENDATION_CARDS) {
	assert.ok(card.movieUrl === `/peliculas/${card.slug}/` && card.posterUrl.startsWith('/assets/posters/'));
	assert.ok(!['Cine', 'Otras plataformas', 'A confirmar'].includes(card.platform));
	assert.match(card.verdictLabel, /^(?:7|8|9|10) · /);
	await access(new URL(`../public${card.posterUrl}`, import.meta.url));
	await access(new URL(`../src/data/movies/${card.slug}.json`, import.meta.url));
}
assert.ok(Number.isFinite(Date.parse(GENERATED_UPCOMING_RELEASES_UPDATED_AT)));
assert.ok(GENERATED_UPCOMING_RELEASES.length >= 5 && GENERATED_UPCOMING_RELEASES.length <= 16);
const generationDate = getArgentinaDateKey(new Date(GENERATED_UPCOMING_RELEASES_UPDATED_AT));
for (const release of GENERATED_UPCOMING_RELEASES) {
	assert.ok(dateKey(release.releaseDate) && release.releaseDate > generationDate, 'Trailers must be upcoming on the edition date');
	assert.match(release.videoUrl, /^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/);
	assert.match(release.sourceUrl, /^https:\/\/www\.cinesargentinos\.com\.ar\/pelicula\/\d+-[^/]+\/$/);
}
assert.equal(new Set(GENERATED_UPCOMING_RELEASES.map(({ sourceUrl }) => sourceUrl)).size, GENERATED_UPCOMING_RELEASES.length);

// A movie load must never refresh or revert the independent editions.
const base = process.argv[process.argv.indexOf('--base') + 1];
if (process.argv.includes('--base') && base) {
	const changed = [...execFileSync('git', ['diff', '--name-only', base], { encoding: 'utf8' }).split(/\r?\n/),
		...execFileSync('git', ['ls-files', '--others', '--exclude-standard', '--', 'src/data/movies'], { encoding: 'utf8' }).split(/\r?\n/)];
	const hasMovies = changed.some((file) => file.startsWith('src/data/movies/'));
	const editions = ['src/data/cinemaNews.generated.json', 'src/data/weeklyRecommendations.generated.ts', 'src/data/upcomingReleases.generated.ts'];
	assert.ok(!hasMovies || !changed.some((file) => editions.includes(file)), 'Movie loads cannot change home editions. Rebase onto current main and preserve its generated snapshots.');
}
console.log('Home editions: valid, frozen and independent of movie loads.');
