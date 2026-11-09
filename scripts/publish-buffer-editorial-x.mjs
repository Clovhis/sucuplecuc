import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bufferRequest, getXChannel, weightedXLength } from './publish-buffer-x.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = 'https://www.cineposta.com.ar';
const guideSlug = /^estrenos-(?:streaming|cines)-[a-z0-9-]+$/u;

export function validateEditorialTweet(text, url) {
	if (typeof text !== 'string' || !text.includes(url)) throw new Error('El tweet debe incluir la URL directa de la nota.');
	const tags = text.match(/#[\p{L}\p{N}_]+/gu) || [];
	if (tags.length < 1 || tags.length > 3 || new Set(tags).size !== tags.length) throw new Error('El tweet necesita 1–3 hashtags distintos.');
	if (weightedXLength(text) > 250) throw new Error('El tweet supera el margen ponderado de 250 caracteres de X.');
	const commentary = text.replace(url, '').replace(/#[\p{L}\p{N}_]+/gu, '').trim();
	if (commentary.length < 40) throw new Error('Falta un comentario editorial original en el tweet.');
	return text;
}

export function editorialPostPlan(editorial, authoredText) {
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(editorial?.slug ?? '')) throw new Error('Slug editorial inválido.');
	if (authoredText === undefined && !guideSlug.test(editorial.slug)) throw new Error('La nota diaria necesita su tweet original guardado por Luna.');
	if (!editorial.title || !editorial.cover?.src || !editorial.cover.alt) throw new Error('La nota necesita título y portada con descripción.');
	const imagePath = editorial.cover.src;
	if (!/^assets\/editorial\/[a-z0-9-]+\/[a-z0-9-]+\.webp$/u.test(imagePath)) throw new Error('La imagen debe pertenecer al sitio.');
	const url = `${site}/editorial/${editorial.slug}/`;
	const cinema = editorial.slug.startsWith('estrenos-cines-');
	const text = authoredText !== undefined ? validateEditorialTweet(authoredText, url) : cinema
		? `¡Actualizamos los estrenos de cine de la semana! 🍿\nGuía, trailers y fichas para elegir la próxima salida. ¡Nos vemos en la sala!\n${url}\nMás cine: ${site}/\n#Estrenos #Cine #BuenosAires #CinePosta`
		: `¡Actualizamos CinePosta con los estrenos de streaming de la semana! 🍿\nQué llegó a plataformas en Argentina, trailers y fichas para elegir sin dar mil vueltas.\n${url}\nMás cine: ${site}/\n#Estrenos #Streaming #CinePosta`;
	if (weightedXLength(text) > 250) throw new Error('El texto supera el margen de X.');
	return { text, url, imageUrl: `${site}/${imagePath}`, alt: editorial.cover.alt, slug: editorial.slug, date: editorial.date, title: editorial.title };
}

const escapedHtml = value => String(value).replace(/&/gu, '&amp;').replace(/</gu, '&lt;').replace(/>/gu, '&gt;').replace(/"/gu, '&quot;').replace(/'/gu, '&#39;');

export function selectAuthoredEditorialTweet({ slug, date, dailyReceipts = [], weeklyReceipts = [], requireOriginal = false }) {
	const matches = [...dailyReceipts, ...weeklyReceipts].filter(receipt => receipt.slug === slug && receipt.date === date && typeof receipt.tweet === 'string' && receipt.tweet.trim());
	if (matches.length > 1) throw new Error(`Hay más de un tweet original para ${slug}; revisar los recibos antes de publicar.`);
	if (matches.length === 1) return matches[0].tweet;
	if (requireOriginal && guideSlug.test(slug ?? '')) throw new Error(`La guía ${slug} no tiene un tweet original guardado en su recibo semanal.`);
	return undefined;
}

export function alreadyPublished(posts, url) {
	return posts.some(({ text }) => typeof text === 'string' && text.includes(url));
}

export async function verifyEditorialOnline(plan, fetcher = fetch) {
	for (const url of [plan.url, plan.imageUrl]) {
		const response = await fetcher(url, { signal: AbortSignal.timeout(20000), cache: 'no-store' });
		if (!response.ok || new URL(response.url).origin !== site) throw new Error(`La URL pública no está disponible: ${url}`);
		if (url === plan.imageUrl) {
			if (!response.headers.get('content-type')?.startsWith('image/')) throw new Error('La portada pública no es una imagen.');
			await response.body?.cancel();
		} else {
			const html = await response.text();
			const canonical = html.match(/<link\b(?=[^>]*\brel=["']canonical["'])(?=[^>]*\bhref=["']([^"']+)["'])[^>]*>/iu)?.[1];
			const hasCover = html.includes(new URL(plan.imageUrl).pathname) || html.includes(new URL(plan.imageUrl).pathname.replace(/^\//u, ''));
			if (canonical !== plan.url || !plan.date || !html.includes(`datetime="${plan.date}"`) || (!html.includes(plan.title) && !html.includes(escapedHtml(plan.title))) || !hasCover) throw new Error('La URL no contiene la nota publicada con su título, fecha, portada y canonical correctos.');
		}
	}
}

export async function publishEditorialNow({ editorial, text, key, priorReceipt, request = bufferRequest, resolveChannel = getXChannel, verifyOnline = verifyEditorialOnline, save = async () => {}, pause = ms => new Promise(resolve => setTimeout(resolve, ms)) }) {
	const plan = editorialPostPlan(editorial, text);
	const receipt = { mode: 'starting', ...plan, attemptedAt: new Date().toISOString() };
	try {
		await save(receipt);
		await verifyOnline(plan); // No Buffer mutation before a real, deployed article exists.
		if (!key) throw new Error('Falta BUFFER_API_KEY.');
		const { organizationId, channel } = await resolveChannel(key);
		const channels = await request(key, 'query Channels($organizationId: OrganizationId!) { channels(input: { organizationId: $organizationId }) { id name service } }', { organizationId });
		const actual = channels.channels.find(c => c.id === channel.id && c.service === 'twitter' && /^@?cineposta$/iu.test(c.name.trim()));
		if (!actual) throw new Error('El canal verificado no es X @cineposta.');
		receipt.channel = actual.name;
		const matches = [];
		let after = null;
		if (priorReceipt?.id && priorReceipt.url === plan.url) {
			const checked = await request(key, 'query VerifyPost($id: PostId!) { post(input: { id: $id }) { id text status externalLink } }', { id: priorReceipt.id });
			matches.push(checked.post);
		} else {
		do {
			const existing = await request(key, 'query ExistingPosts($organizationId: OrganizationId!, $channelIds: [ChannelId!], $after: String) { posts(first: 100, after: $after, input: { organizationId: $organizationId, filter: { channelIds: $channelIds } }) { edges { node { id text status externalLink } } pageInfo { hasNextPage endCursor } } }', { organizationId, channelIds: [actual.id], after });
			matches.push(...existing.posts.edges.map(e => e.node).filter(post => alreadyPublished([post], plan.url)));
			const page = existing.posts.pageInfo;
			if (page.hasNextPage && (!page.endCursor || page.endCursor === after)) throw new Error('Buffer no pudo completar la búsqueda de duplicados.');
			after = page.hasNextPage ? page.endCursor : null;
		} while (after);
		}
		const sent = matches.find(post => post.status === 'sent');
		let post = sent || matches[0];
		if (sent) {
			Object.assign(receipt, sent, { mode: 'already-sent' });
			if (!receipt.externalLink) {
				const checked = await request(key, 'query VerifyPost($id: PostId!) { post(input: { id: $id }) { id status externalLink } }', { id: receipt.id });
				Object.assign(receipt, checked.post);
			}
			await save(receipt);
			return receipt;
		}
		if (matches.length > 1) throw new Error('Hay varios posts de esta URL pendientes; revisar en Buffer sin crear otro.');
		if (post) {
			Object.assign(receipt, post, { mode: 'existing-post' });
			await save(receipt);
			if (['error', 'draft', 'scheduled'].includes(post.status)) {
				const edited = await request(key, 'mutation RetryEditorial($input: EditPostInput!) { editPost(input: $input) { __typename ... on PostActionSuccess { post { id dueAt status externalLink } } ... on MutationError { message } } }', { input: { id: post.id, mode: 'shareNow', schedulingType: 'automatic' } });
				if (edited.editPost.__typename !== 'PostActionSuccess') throw new Error(edited.editPost.message ?? 'Buffer no pudo reintentar el post existente.');
				post = edited.editPost.post;
			}
		} else {
			const input = { text: plan.text, channelId: actual.id, schedulingType: 'automatic', mode: 'shareNow', needsApproval: false, assets: [{ image: { url: plan.imageUrl, metadata: { altText: plan.alt } } }] };
			const data = await request(key, 'mutation CreatePost($input: CreatePostInput!) { createPost(input: $input) { __typename ... on PostActionSuccess { post { id dueAt status externalLink } } ... on MutationError { message } } }', { input });
			if (data.createPost.__typename !== 'PostActionSuccess') throw new Error(data.createPost.message ?? 'Buffer no creó el post.');
			post = data.createPost.post;
		}
		Object.assign(receipt, post, { mode: 'submitted-now' });
		await save(receipt); // Persist the ID before polling; retries must reuse it.
		for (let attempt = 0; attempt < 18; attempt++) {
			if (receipt.status === 'sent') return receipt;
			if (receipt.status === 'error') throw new Error(`Buffer recibió ${receipt.id}, pero falló el envío. Reintentar este ID, no crear otro.`);
			await pause(5000);
			const checked = await request(key, 'query VerifyPost($id: PostId!) { post(input: { id: $id }) { id status externalLink } }', { id: receipt.id });
			Object.assign(receipt, checked.post);
			await save(receipt);
		}
		if (receipt.status === 'sent') return receipt;
		throw new Error(`Buffer recibió ${receipt.id}, pero su estado sigue ${receipt.status}. Verificar el mismo post antes de reintentar.`);
	} catch (error) {
		receipt.error = String(error.message).split(key || '\u0000').join('[redacted]');
		receipt.mode = 'error';
		await save(receipt);
		throw new Error(receipt.error);
	}
}

async function main() {
	const slug = process.argv[2];
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(slug ?? '')) throw new Error('Indicá un slug editorial válido.');
	const editorial = JSON.parse(await readFile(path.join(root, 'src/data/editorials', `${slug}.json`), 'utf8'));
	const dailyReceipts = [];
	try {
		const report = JSON.parse(await readFile(path.join(root, 'reports/daily-editorial', `${editorial.date}.json`), 'utf8'));
		dailyReceipts.push(report);
	} catch (error) { if (error.code !== 'ENOENT') throw error; }
	const weeklyReceipts = [];
	for (const kind of ['cine', 'plataformas']) {
		const directory = path.join(root, 'reports/weekly-releases', kind);
		let files = [];
		try { files = (await readdir(directory)).filter(file => file.endsWith('.json')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
		for (const file of files) weeklyReceipts.push(JSON.parse(await readFile(path.join(directory, file), 'utf8')));
	}
	const requireOriginal = process.argv.includes('--require-original-tweet');
	const text = selectAuthoredEditorialTweet({ slug, date: editorial.date, dailyReceipts, weeklyReceipts, requireOriginal });
	const plan = editorialPostPlan(editorial, text);
	await readFile(path.join(root, 'public', editorial.cover.src));
	if (!process.argv.includes('--publish-now')) { console.log(JSON.stringify({ mode: 'dry-run', ...plan, xWeightedLength: weightedXLength(plan.text) }, null, 2)); return; }
	let priorReceipt;
	try { priorReceipt = JSON.parse(await readFile(path.join(root, 'reports/buffer-editorial', `${slug}.json`), 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
	const receipt = await publishEditorialNow({ editorial, text, priorReceipt, key: process.env.BUFFER_API_KEY?.trim(), save: receipt => writeFile(path.join(root, 'buffer-editorial-receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`) });
	console.log(JSON.stringify(receipt, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error.message); process.exitCode = 1; });
