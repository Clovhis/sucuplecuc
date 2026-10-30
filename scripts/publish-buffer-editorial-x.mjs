import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bufferRequest, getXChannel, weightedXLength } from './publish-buffer-x.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = 'https://www.cineposta.com.ar';

export function editorialPostPlan(editorial) {
	if (!/^estrenos-streaming-[a-z0-9-]+$/u.test(editorial?.slug ?? '')) throw new Error('Se requiere una guía semanal de streaming.');
	if (!editorial.title || !editorial.cover?.src || !editorial.cover.alt) throw new Error('La nota necesita título y portada con descripción.');
	const imagePath = editorial.cover.src;
	if (!/^assets\/editorial\/[a-z0-9-]+\/[a-z0-9-]+\.webp$/u.test(imagePath)) throw new Error('La imagen debe pertenecer al sitio.');
	const url = `${site}/editorial/${editorial.slug}/`;
	const text = `¡Actualizamos CinePosta con los estrenos de streaming de la semana! 🍿\nQué llegó a plataformas en Argentina, trailers y fichas para elegir sin dar mil vueltas.\n${url}\nMás cine: ${site}/\n#Estrenos #Streaming #CinePosta`;
	if (weightedXLength(text) > 250) throw new Error('El texto supera el margen de X.');
	return { text, url, imageUrl: `${site}/${imagePath}`, alt: editorial.cover.alt };
}

export function alreadyPublished(posts, url) {
	return posts.some(({ text }) => typeof text === 'string' && text.includes(url));
}

async function main() {
	const slug = process.argv[2];
	if (!/^estrenos-streaming-[a-z0-9-]+$/u.test(slug ?? '')) throw new Error('Indicá el slug de la guía semanal.');
	const editorial = JSON.parse(await readFile(path.join(root, 'src/data/editorials', `${slug}.json`), 'utf8'));
	const plan = editorialPostPlan(editorial);
	await readFile(path.join(root, 'public', editorial.cover.src));
	if (!process.argv.includes('--publish-now')) { console.log(JSON.stringify({ mode: 'dry-run', ...plan, xWeightedLength: weightedXLength(plan.text) }, null, 2)); return; }
	for (const url of [plan.url, plan.imageUrl, `${site}/`]) {
		const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
		if (!response.ok || new URL(response.url).origin !== site) throw new Error(`La URL pública no está disponible: ${url}`);
		if (url === plan.imageUrl && !response.headers.get('content-type')?.startsWith('image/')) throw new Error('La portada pública no es una imagen.');
	}
	const key = process.env.BUFFER_API_KEY?.trim();
	if (!key) throw new Error('Falta BUFFER_API_KEY.');
	const { organizationId, channel } = await getXChannel(key);
	const channels = await bufferRequest(key, 'query Channels($organizationId: OrganizationId!) { channels(input: { organizationId: $organizationId }) { id name service } }', { organizationId });
	const actual = channels.channels.find(c => c.id === channel.id && c.service === 'twitter' && /^@?cineposta$/iu.test(c.name.trim()));
	if (!actual) throw new Error('El canal verificado no es X @cineposta.');
	let after = null;
	do {
		const existing = await bufferRequest(key, 'query ExistingPosts($organizationId: OrganizationId!, $channelIds: [ChannelId!], $after: String) { posts(first: 100, after: $after, input: { organizationId: $organizationId, filter: { channelIds: $channelIds } }) { edges { node { id text } } pageInfo { hasNextPage endCursor } } }', { organizationId, channelIds: [actual.id], after });
		if (alreadyPublished(existing.posts.edges.map(e => e.node), plan.url)) throw new Error('Esta guía ya tiene una publicación en Buffer; no se duplica.');
		const page = existing.posts.pageInfo;
		if (page.hasNextPage && (!page.endCursor || page.endCursor === after)) throw new Error('Buffer no pudo completar la búsqueda de duplicados.');
		after = page.hasNextPage ? page.endCursor : null;
	} while (after);
	const input = { text: plan.text, channelId: actual.id, schedulingType: 'automatic', mode: 'shareNow', needsApproval: false, assets: [{ image: { url: plan.imageUrl, metadata: { altText: plan.alt } } }] };
	const data = await bufferRequest(key, 'mutation CreatePost($input: CreatePostInput!) { createPost(input: $input) { __typename ... on PostActionSuccess { post { id dueAt status externalLink } } ... on MutationError { message } } }', { input });
	if (data.createPost.__typename !== 'PostActionSuccess') throw new Error(data.createPost.message ?? 'Buffer no creó el post.');
	const receipt = { mode: 'submitted-now', channel: actual.name, ...data.createPost.post, ...plan };
	await writeFile(path.join(root, 'buffer-editorial-receipt.json'), JSON.stringify(receipt, null, 2));
	for (let attempt = 0; attempt < 18 && receipt.status !== 'error'; attempt += 1) {
		const checked = await bufferRequest(key, 'query VerifyPost($id: PostId!) { post(input: { id: $id }) { id status externalLink assets { mimeType source } } }', { id: receipt.id });
		Object.assign(receipt, checked.post);
		await writeFile(path.join(root, 'buffer-editorial-receipt.json'), JSON.stringify(receipt, null, 2));
		if (receipt.status === 'sent' && receipt.externalLink) break;
		await new Promise(resolve => setTimeout(resolve, 5000));
	}
	console.log(JSON.stringify(receipt, null, 2));
	if (receipt.status !== 'sent' || !receipt.externalLink) throw new Error(`Buffer recibió el post ${receipt.id}, pero su estado es ${receipt.status}. No volver a crearlo.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error.message); process.exitCode = 1; });
