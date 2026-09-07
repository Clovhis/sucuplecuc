import assert from 'node:assert/strict';
import { chooseCopyStyle, nextDueAt, renderPostText, selectMovie, weightedXLength } from './publish-buffer-x.mjs';

const movie = { slug: 'akira-1988', title: 'Akira', year: 1988, category: 'Ciencia ficción', releaseDate: '2026-09-05', releasePlatform: 'Netflix', poster: 'assets/posters/1988/akira-1988.webp', verdict: 'recomendada', verdictLabel: 'BUENISIMA', review: 'Akira arranca con una pandilla de adolescentes en un Neo-Tokio explosivo y usa la transformación de Tetsuo para hablar de poder, violencia y una ciudad que no termina de curarse. Katsuhiro Otomo dirige con una energía desatada.' };
const text = renderPostText(movie);
assert.match(text, /Akira \(1988\)/u);
assert.match(text, /BUENISIMA/u);
assert.match(text, /https:\/\/www\.cineposta\.com\.ar\/peliculas\/akira-1988\//u);
assert.ok(weightedXLength(text) <= 250);

const styles = Array.from({ length: 24 }, (_, index) => ({ opening: index, availability: index, editorial: index, verdict: index, link: index }));
const variants = styles.map((style, index) => renderPostText({ ...movie, slug: `akira-1988-${index}` }, style));
const endings = variants.map((variant) => variant.split('\n\n').at(-1).split('\n'));
assert.equal(new Set(variants.map((variant) => variant.split('\n\n')[0])).size, 12, 'los arranques deben rotar por toda la familia de estilos');
assert.equal(new Set(endings.map(([, link]) => link.replace(/https:\/\/[^\s]+/u, 'URL'))).size, 8, 'los cierres de enlace deben rotar');
assert.equal(new Set(endings.map(([verdict]) => verdict)).size, 8, 'los veredictos deben rotar');
for (const variant of variants) {
	assert.ok(weightedXLength(variant) <= 250);
	assert.match(variant, /Akira arranca con una pandilla/u);
}

const longTitleMovie = { ...movie, slug: 'adolescencia-sexo-y-muerte-en-campamento-miasma-2026', title: 'Adolescencia, sexo y muerte en campamento Miasma: una historia extraordinariamente larga', verdictLabel: 'RECOMENDADISIMA' };
const compactText = renderPostText(longTitleMovie, { opening: 10, availability: 3, editorial: 9, verdict: 7, link: 7 });
assert.ok(weightedXLength(compactText) <= 250, 'los títulos largos deben conservar el margen de X');
assert.match(compactText, /Adolescencia, sexo y muerte/u);
assert.match(compactText, /Akira arranca con una pandilla/u);

const historyWithRecentStyles = { version: 1, posts: styles.slice(0, 3).map((copyStyle, index) => ({ slug: `anterior-${index}`, copyStyle })) };
const freshStyle = chooseCopyStyle(movie, historyWithRecentStyles);
for (const previous of historyWithRecentStyles.posts) {
	assert.notEqual(freshStyle.opening % 12, previous.copyStyle.opening % 12, 'el arranque no debe repetir los últimos tres estilos');
	assert.notEqual(freshStyle.verdict % 8, previous.copyStyle.verdict % 8, 'el veredicto no debe repetir los últimos tres estilos');
	assert.notEqual(freshStyle.link % 8, previous.copyStyle.link % 8, 'el cierre no debe repetir los últimos tres estilos');
}

const selection = selectMovie([{ movie, posterUrl: 'https://www.cineposta.com.ar/assets/posters/1988/akira-1988.webp' }, { movie: { ...movie, slug: 'paprika-2006', title: 'Paprika' }, posterUrl: 'https://www.cineposta.com.ar/assets/posters/2006/paprika-2006.webp' }], { version: 1, posts: [{ slug: 'akira-1988' }] });
assert.equal(selection.movie.slug, 'paprika-2006');
assert.equal(nextDueAt(new Date('2026-09-06T21:30:00.000Z')), '2026-09-06T22:00:00.000Z');
assert.equal(nextDueAt(new Date('2026-09-06T22:00:00.000Z')), '2026-09-07T22:00:00.000Z');
console.log('Buffer X publisher tests passed.');
