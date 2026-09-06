import assert from 'node:assert/strict';
import { nextDueAt, renderPostText, selectMovie } from './publish-buffer-x.mjs';

const movie = { slug: 'akira-1988', title: 'Akira', year: 1988, poster: 'assets/posters/1988/akira-1988.webp', verdict: 'recomendada', verdictLabel: 'BUENISIMA', review: 'Akira arranca con una pandilla de adolescentes en un Neo-Tokio explosivo y usa la transformación de Tetsuo para hablar de poder, violencia y una ciudad que no termina de curarse. Katsuhiro Otomo dirige con una energía desatada.' };
const text = renderPostText(movie);
assert.match(text, /^Akira \(1988\)/u);
assert.match(text, /Veredicto Cine Posta: BUENISIMA\./u);
assert.match(text, /https:\/\/www\.cineposta\.com\.ar\/peliculas\/akira-1988\//u);
assert.ok([...text].length <= 280);
const selection = selectMovie([{ movie, posterUrl: 'https://www.cineposta.com.ar/assets/posters/1988/akira-1988.webp' }, { movie: { ...movie, slug: 'paprika-2006', title: 'Paprika' }, posterUrl: 'https://www.cineposta.com.ar/assets/posters/2006/paprika-2006.webp' }], { version: 1, posts: [{ slug: 'akira-1988' }] });
assert.equal(selection.movie.slug, 'paprika-2006');
assert.equal(nextDueAt(new Date('2026-09-06T21:30:00.000Z')), '2026-09-06T22:00:00.000Z');
assert.equal(nextDueAt(new Date('2026-09-06T22:00:00.000Z')), '2026-09-07T22:00:00.000Z');
console.log('Buffer X publisher tests passed.');
