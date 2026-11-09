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

test('la guía de salas usa cine, dos enlaces y una imagen local sin anunciar streaming', () => {
	const plan = editorialPostPlan({ ...editorial, slug: 'estrenos-cines-5-noviembre-2026' });
	assert.ok(weightedXLength(plan.text) <= 250);
	assert.match(plan.text, /estrenos de cine/u);
	assert.match(plan.text, /#Estrenos #Cine #BuenosAires #CinePosta/u);
	assert.doesNotMatch(plan.text, /streaming|plataformas/iu);
	assert.ok(plan.text.includes(plan.url));
	assert.ok(plan.text.includes('Más cine: https://www.cineposta.com.ar/'));
});

const daily = { ...editorial, date: '2026-11-09', slug: 'godzilla-estreno-global', title: 'Un estreno global' };
const originalText = `La ventana también cuenta: estrenar casi al mismo tiempo cambia cómo una película encuentra a su público. https://www.cineposta.com.ar/editorial/${daily.slug}/ #Godzilla #Cine`;

test('el tweet diario conserva el comentario original, URL y 1–3 hashtags con ponderación X', () => {
	const plan = editorialPostPlan(daily, originalText);
	assert.equal(plan.text, originalText);
	assert.ok(weightedXLength(plan.text) <= 250);
	for (const text of [originalText.replace(plan.url, ''), `${originalText} #Otro #Cuarto`, originalText.replace(/#Godzilla #Cine/, ''), `${'a'.repeat(280)} ${plan.url} #Cine`]) assert.throws(() => editorialPostPlan(daily, text));
	assert.equal(weightedXLength('🍿'), 2);
	assert.equal(weightedXLength('👨‍👩‍👧‍👦'), 2);
	assert.equal(weightedXLength('日本'), 4);
	assert.equal(weightedXLength('café'), 4);
	assert.equal(weightedXLength('https://www.cineposta.com.ar/editorial/una-nota-larga/'), 23);
});

const { publishEditorialNow, verifyEditorialOnline } = await import('./publish-buffer-editorial-x.mjs');
function bufferFixture(existing = []) {
	const calls = [], receipts = [];
	const request = async (_key, query, variables) => {
		calls.push({ query, variables });
		if (query.includes('query Channels')) return { channels: [{ id: 'channel', name: '@cineposta', service: 'twitter' }] };
		if (query.includes('query ExistingPosts')) return { posts: { edges: existing.map(node => ({ node })), pageInfo: { hasNextPage: false } } };
		if (query.includes('mutation CreatePost')) return { createPost: { __typename: 'PostActionSuccess', post: { id: 'buffer-post', status: 'sending' } } };
		if (query.includes('mutation RetryEditorial')) return { editPost: { __typename: 'PostActionSuccess', post: { id: variables.input.id, status: 'sending' } } };
		if (query.includes('query VerifyPost')) return { post: { id: variables.id, status: 'sent', externalLink: 'https://x.com/cineposta/status/fixture' } };
		throw Error('Unexpected fixture request');
	};
	const options = { editorial: daily, text: originalText, key: 'fixture-key', request, resolveChannel: async () => ({ organizationId: 'org', channel: { id: 'channel' } }), verifyOnline: async () => {}, pause: async () => {}, save: async value => { receipts.push(structuredClone(value)); } };
	return { options, calls, receipts };
}

test('Buffer diario verifica online antes de mutar, usa shareNow y confirma sent/enlace', async () => {
	const f = bufferFixture();
	const result = await publishEditorialNow(f.options);
	const create = f.calls.find(call => call.query.includes('mutation CreatePost'));
	assert.equal(create.variables.input.mode, 'shareNow');
	assert.equal(create.variables.input.dueAt, undefined);
	assert.equal(result.status, 'sent');
	assert.match(result.externalLink, /^https:\/\/x.com\//);
	assert.ok(f.receipts.some(receipt => receipt.id === 'buffer-post'));
	const offline = bufferFixture();
	await assert.rejects(publishEditorialNow({ ...offline.options, verifyOnline: async () => { throw Error('article offline'); } }), /offline/);
	assert.equal(offline.calls.length, 0);
	assert.equal(offline.receipts.at(-1).mode, 'error');
});

test('Buffer reintenta sólo el mismo post; un sent existente nunca crea otro', async () => {
	for (const status of ['sent', 'error', 'sending']) {
		const f = bufferFixture([{ id: 'existing', status, text: originalText, externalLink: status === 'sent' ? 'https://x.com/cineposta/status/old' : null }]);
		const result = await publishEditorialNow(f.options);
		assert.equal(result.id, 'existing');
		assert.equal(result.status, 'sent');
		assert.equal(f.calls.filter(call => call.query.includes('mutation CreatePost')).length, 0);
		if (status === 'error') assert.equal(f.calls.find(call => call.query.includes('mutation RetryEditorial')).variables.input.mode, 'shareNow');
	}
});

test('Buffer conserva error/ID sin afectar la nota y oculta la clave en diagnósticos', async () => {
	const f = bufferFixture();
	await assert.rejects(publishEditorialNow({ ...f.options, request: async (key, query, variables) => {
		if (query.includes('query VerifyPost')) throw Error('temporary API failure fixture-key');
		return f.options.request(key, query, variables);
	} }), /temporary API failure \[redacted\]/);
	assert.equal(f.receipts.at(-1).id, 'buffer-post');
	assert.equal(f.receipts.at(-1).mode, 'error');
	assert.ok(!JSON.stringify(f.receipts).includes('fixture-key'));
});

test('la comprobación pública rechaza soft-404, fecha incorrecta y origen ajeno', async () => {
	const plan = editorialPostPlan(daily, originalText);
	const response = (url, html) => { const r = new Response(html, { headers: { 'content-type': url === plan.imageUrl ? 'image/webp' : 'text/html' } }); Object.defineProperty(r, 'url', { value: url }); return r; };
	await verifyEditorialOnline(plan, async url => response(url, `<link rel="canonical" href="${plan.url}"><time datetime="${daily.date}">`));
	await assert.rejects(verifyEditorialOnline(plan, async url => response(url, '<h1>not found</h1>')), /canonical/);
});

test('un ID persistido evita duplicados aunque Buffer acorte el enlace del texto', async () => {
	const f = bufferFixture();
	const result = await publishEditorialNow({ ...f.options, priorReceipt: { id: 'saved-post', url: editorialPostPlan(daily, originalText).url } });
	assert.equal(result.id, 'saved-post');
	assert.equal(result.status, 'sent');
	assert.equal(f.calls.filter(call => call.query.includes('mutation CreatePost')).length, 0);
});
