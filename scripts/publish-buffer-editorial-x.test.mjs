import test from 'node:test';
import assert from 'node:assert/strict';
import { editorialPostPlan, alreadyPublished } from './publish-buffer-editorial-x.mjs';
import { weightedXLength } from './publish-buffer-x.mjs';
const editorial = { slug: 'estrenos-streaming-26-octubre-1-noviembre-2026', title: 'Guía semanal', cover: { src: 'assets/editorial/estrenos-streaming-26-octubre-1-noviembre-2026/tony.webp', alt: 'Dos cocineros en Tony.' } };
test('la guía genera un post de X con enlaces, hashtags y portada del sitio', () => {
	const plan = editorialPostPlan(editorial);
	assert.ok(weightedXLength(plan.text) <= 250);
	assert.match(plan.text, /Argentina/u);
	assert.ok(plan.text.includes(plan.url));
	assert.match(plan.text, /#Estrenos #Streaming #CinePosta/u);
	assert.equal(plan.imageUrl, `https://www.cineposta.com.ar/${editorial.cover.src}`);
});
test('rechaza rutas arbitrarias y portadas externas antes de publicar', () => {
	for (const slug of ['../../secrets', 'otra-nota', undefined]) assert.throws(() => editorialPostPlan({ ...editorial, slug }));
	assert.throws(() => editorialPostPlan({ ...editorial, cover: { ...editorial.cover, src: 'https://otro.sitio/image.webp' } }));
});
test('un post existente de la misma guía bloquea la duplicación', () => {
	const { url } = editorialPostPlan(editorial);
	assert.equal(alreadyPublished([{ text: `Mirá acá ${url}` }], url), true);
	assert.equal(alreadyPublished([{ text: 'Otro estreno' }], url), false);
});
