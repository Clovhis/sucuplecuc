import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, argentinaDate, digest } from './lib/social-media.mjs';
import { nextDate, planEdition, editionCaption, renderEdition, slugsOf } from './lib/instagram-editorial.mjs';
import {visualMovies} from './lib/instagram-images.mjs';

export const STATE_BRANCH = 'cineposta-instagram-state';
export const HISTORY_FILE = 'history.json';
const EXPECTED_HANDLE = 'cineposta.ar';
const POST_FIELDS = 'id text dueAt status externalLink';

export async function bufferRequest(key, query, variables = {}) {
	if (!key?.trim()) throw new Error('Falta BUFFER_API_KEY (secret de Actions). OAuth local no se exporta a Actions.');
	const response = await fetch('https://api.buffer.com', {method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({query,variables}),signal:AbortSignal.timeout(30000)});
	const body = await response.json().catch(() => ({}));
	if (!response.ok || body.errors?.length || !body.data) {
		const message = (body.errors || []).map(error => error.message).join('; ').split(key).join('[redacted]');
		throw new Error(`Buffer HTTP ${response.status}: ${message || 'respuesta inválida'}. No se reintentan mutaciones automáticamente.`);
	}
	return body.data;
}

export function assertInstagramChannel(channel, channelId) {
	if (!channel || channel.id !== channelId || channel.service !== 'instagram' || channel.name.replace(/^@/u,'').toLowerCase() !== EXPECTED_HANDLE) throw new Error('El canal no es Instagram @cineposta.ar.');
	if (channel.type !== 'business' || channel.metadata?.defaultToReminders !== false || channel.isDisconnected || channel.isLocked || channel.isQueuePaused) throw new Error('Instagram requiere conexión profesional, publicación automática y cola habilitada. No se habilita una cuenta personal ni por recordatorios.');
	return channel;
}

export async function checkInstagram({key,organizationId,channelId,request=bufferRequest}) {
	if (!/^[a-f0-9]{24}$/u.test(organizationId ?? '') || !/^[a-f0-9]{24}$/u.test(channelId ?? '')) throw new Error('Configurá BUFFER_ORGANIZATION_ID y BUFFER_INSTAGRAM_CHANNEL_ID con IDs verificados.');
	const data = await request(key,'query InstagramChannels($organizationId: OrganizationId!) { channels(input: { organizationId: $organizationId }) { id name service type isDisconnected isLocked isQueuePaused metadata { ... on InstagramMetadata { defaultToReminders } } } }',{organizationId});
	const channel = assertInstagramChannel(data.channels.find(channel => channel.id === channelId),channelId);
	const posts = await readInstagramPosts({key,organizationId,channelId,request});
	const pending = posts.filter(post => ['scheduled','sending','needs_approval'].includes(post.status)).length;
	return {channel,posts,pending};
}

export async function readInstagramPosts({key,organizationId,channelId,request=bufferRequest}) {
	const posts = [];
	let after = null;
	for (let page = 0; page < 20; page++) {
		const data = await request(key,`query InstagramPosts($organizationId: OrganizationId!, $channelIds: [ChannelId!], $after: String) { posts(first: 100, after: $after, input: { organizationId: $organizationId, filter: { channelIds: $channelIds } }) { edges { node { ${POST_FIELDS} } } pageInfo { hasNextPage endCursor } } }`,{organizationId,channelIds:[channelId],after});
		posts.push(...data.posts.edges.map(edge => edge.node));
		const cursor = data.posts.pageInfo;
		if (!cursor.hasNextPage) return posts;
		if (!cursor.endCursor || cursor.endCursor === after) throw new Error('Buffer no pudo completar la búsqueda de duplicados.');
		after = cursor.endCursor;
	}
	throw new Error('La búsqueda de duplicados excede 20 páginas; revisar historial y cuota antes de continuar.');
}

export function remoteSlugs(posts) {
	const slugs = new Set();
	for (const post of posts) {
		for (const match of (post.text || '').matchAll(/https:\/\/(?:www\.)?cineposta\.com\.ar\/peliculas\/([a-z0-9-]+)(?:\/|[?\s]|$)/gu)) slugs.add(match[1]);
	}
	return slugs;
}

export function dailyGuard(posts, today) {
	return posts.filter(post => post.dueAt && argentinaDate(new Date(post.dueAt)) === today && !['draft','error'].includes(post.status));
}

export function entryMatches(posts, entry) {
	return posts.filter(post => (entry.bufferPostId && post.id === entry.bufferPostId) || slugsOf(entry).some(slug=>remoteSlugs([post]).has(slug)));
}

export function editionDate(now, edition='today') {
	if (!['today','tomorrow'].includes(edition)) throw new Error('La edición debe ser today o tomorrow.');
	return edition === 'tomorrow' ? nextDate(argentinaDate(now)) : argentinaDate(now);
}

export async function readHistory(stateDir) {
	const history = JSON.parse(await readFile(path.join(stateDir,HISTORY_FILE),'utf8'));
	if (history.version !== 1 || !Array.isArray(history.posts) || history.posts.some(post => !post.date || !post.slug || !post.state)) throw new Error('Historial Instagram inválido. No se borra ni reinicia.');
	return history;
}

export async function saveHistory(stateDir, history) {
	await mkdir(stateDir,{recursive:true});
	const filename = path.join(stateDir,HISTORY_FILE);
	await writeFile(`${filename}.tmp`,`${JSON.stringify(history,null,2)}\n`);
	await rename(`${filename}.tmp`,filename);
}

export function publicMediaUrl(repository, ref, mediaPath) {
	if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u.test(repository ?? '') || !/^[a-f0-9]{40}$/u.test(ref ?? '') || !/^media\/[a-z0-9-]+\.jpg$/u.test(mediaPath ?? '')) throw new Error('La imagen requiere repositorio, SHA inmutable y ruta media/*.jpg válidos.');
	return `https://raw.githubusercontent.com/${repository}/${ref}/${mediaPath}`;
}

export async function verifyPublicMedia(url, expectedHash, fetcher = fetch) {
	const response = await fetcher(url,{signal:AbortSignal.timeout(30000),cache:'no-store'});
	if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error('La placa pública todavía no es accesible. No se crea el post.');
	const bytes = Buffer.from(await response.arrayBuffer());
	if (digest(bytes) !== expectedHash) throw new Error('La imagen pública no coincide con la placa aprobada.');
}

export function buildInstagramInput(channelId, entry, imageUrls) {
	const urls=Array.isArray(imageUrls)?imageUrls:[imageUrls];
	if(urls.length<1 || urls.length>6)throw new Error('Se admiten entre una y seis placas por edición.');
	return {channelId,text:entry.text,schedulingType:'automatic',mode:'customScheduled',dueAt:entry.dueAt,needsApproval:false,metadata:{instagram:{type:'post',shouldShareToFeed:true}},assets:urls.map((url,i)=>({image:{url,metadata:{altText:entry.media?.[i]?.alt || entry.alt}}}))};
}

export async function prepareInstagram({stateDir,key,organizationId,channelId,attemptId,now=new Date(),root=ROOT,request=bufferRequest,edition='today'}) {
	const today = editionDate(now,edition);
	const dueAt = new Date(`${today}T19:15:00-03:00`).toISOString();
	if (new Date(dueAt).getTime() - now.getTime() < 5*60000) return {mode:'skipped',reason:'La franja de hoy ya pasó o faltan menos de cinco minutos. No se traslada al día siguiente.'};
	const history = await readHistory(stateDir);
	const {posts,pending} = await checkInstagram({key,organizationId,channelId,request});
	// Reconcile previous receipts too; yesterday's scheduled state isn't proof of delivery.
	for(const previous of history.posts) {
		const found=posts.find(p=>p.id===previous.bufferPostId);
		if(found) Object.assign(previous,{state:found.status,externalLink:found.externalLink});
		if(previous.date<today && ['error','reserved','needs_approval'].includes(previous.state))console.error(`::warning::Instagram ${previous.date}: ${previous.state}, ID ${previous.bufferPostId || 'sin recibo'}. Revisar el registro; no se reprograma.`);
	}
	await saveHistory(stateDir,history);
	const entry = history.posts.find(post => post.date === today);
	if (entry) {
		const matches = entryMatches(posts,entry);
		if (matches.length > 1) throw new Error('Hay varios posts para la misma película; resolverlos en Buffer antes de continuar.');
		if (matches.length) {
			Object.assign(entry,{state:matches[0].status,bufferPostId:matches[0].id,externalLink:matches[0].externalLink});
			await saveHistory(stateDir,history);
			if (!['scheduled','sending','sent'].includes(entry.state)) throw new Error(`Buffer conserva ${entry.bufferPostId} con estado ${entry.state}. Revisar ese ID antes de continuar.`);
			return {mode:'skipped',reason:'Publicación ya recibida por Buffer.',bufferPostId:entry.bufferPostId,status:entry.state};
		}
		throw new Error('Existe una reserva sin post visible en Buffer. Revisar el run anterior; no se repite una mutación ambigua. Ver docs/buffer-instagram-automation.md.');
	}
	if (dailyGuard(posts,today).length) return {mode:'skipped',reason:'Instagram ya tiene una publicación para hoy.'};
	if (pending >= 10) return {mode:'skipped',reason:'Cola de Instagram llena (10). X conserva su propia cuota.'};
	const movies = await visualMovies(root,{history,today});
	const excluded = remoteSlugs(posts);
	// A render or rights-ledger error excludes the candidate; never substitute unlicensed art.
	for (let candidate = 0; candidate < 20; candidate++) {
		const plan=planEdition(movies,history,excluded,today);
		let cards,text;
		try { text=editionCaption(plan);cards=await renderEdition(plan,path.join(stateDir,'media'),{root}); } catch(error) {plan.slugs.forEach(slug=>excluded.add(slug));console.error(`Se omite ${plan.slugs.join(', ')}: ${error.message}`);continue;}
		const movie=plan.movies[0];
		const record = {date:today,slug:movie.slug,slugs:plan.slugs,category:plan.category,format:plan.format,theme:plan.theme,palette:plan.palette,state:'reserved',attemptId,dueAt,channelId,media:cards.map(({path:_path,...card})=>card),text,createdAt:now.toISOString()};
		history.posts.push(record);
		await saveHistory(stateDir,history);
		return {mode:'prepared',slugs:plan.slugs,format:plan.format,dueAt,images:cards.length};
	}
	throw new Error('No se pudo generar una placa entre 20 candidatos. Revisar medios y fuentes locales.');
}

export async function publishInstagram({stateDir,key,organizationId,channelId,attemptId,repository,mediaRef,now=new Date(),request=bufferRequest,verifyMedia=verifyPublicMedia,edition='today'}) {
	const today = editionDate(now,edition);
	const history = await readHistory(stateDir);
	const entry = history.posts.find(post => post.date === today);
	if (!entry) return {mode:'skipped',reason:'No hay una reserva para hoy.'};
	const {posts,pending} = await checkInstagram({key,organizationId,channelId,request});
	const matches = entryMatches(posts,entry);
	if (matches.length > 1) throw new Error('Duplicados en Buffer; no se crea otro post.');
	if (matches.length) {
		Object.assign(entry,{state:matches[0].status,bufferPostId:matches[0].id,externalLink:matches[0].externalLink});
		await saveHistory(stateDir,history);
		if (!['scheduled','sending','sent'].includes(entry.state)) throw new Error(`Buffer conserva ${entry.bufferPostId} con estado ${entry.state}. Revisar ese ID antes de continuar.`);
		return {mode:'existing',bufferPostId:entry.bufferPostId,status:entry.state};
	}
	if (entry.state !== 'reserved' || entry.attemptId !== attemptId || entry.attemptedAt || entry.channelId !== channelId) throw new Error('La reserva no pertenece a este intento o su envío es ambiguo. Revisar antes de reintentar.');
	if (new Date(entry.dueAt).getTime()-now.getTime() < 5*60000) return {mode:'skipped',reason:'La franja quedó demasiado cerca o ya pasó.'};
	if (dailyGuard(posts,today).length || pending >= 10) return {mode:'skipped',reason:'La franja o la cola ya está ocupada.'};
	if(!entry.media?.length || entry.media.some(card=>card.rights?.type!=='licensed-photography'))throw new Error('La reserva no tiene fotografías autorizadas. No se publica una reserva antigua de gráficos abstractos.');
	const media=entry.media || [{mediaPath:entry.mediaPath,sha256:entry.mediaSha256,alt:entry.alt}];
	const imageUrls=[];
	for(const card of media) {
		const url=publicMediaUrl(repository,mediaRef,card.mediaPath);
		await verifyMedia(url,card.sha256);
		imageUrls.push(url);
	}
	entry.attemptedAt = now.toISOString();
	entry.imageUrls = imageUrls;
	await saveHistory(stateDir,history);
	// One mutation only. Even a timeout preserves the reservation and requires reconciliation.
	const data = await request(key,`mutation InstagramPost($input: CreatePostInput!) { createPost(input: $input) { __typename ... on PostActionSuccess { post { id dueAt status externalLink } } ... on MutationError { message } } }`,{input:buildInstagramInput(channelId,entry,imageUrls)});
	if (data.createPost.__typename !== 'PostActionSuccess') throw new Error(`Buffer no aceptó el post: ${data.createPost.message || data.createPost.__typename}`);
	const post = data.createPost.post;
	Object.assign(entry,{state:post.status,bufferPostId:post.id,externalLink:post.externalLink,scheduledAt:now.toISOString()});
	await saveHistory(stateDir,history);
	if (post.status !== 'scheduled') throw new Error(`Buffer guardó ${post.id} con estado ${post.status}. Revisar ese ID; no crear otro.`);
	if(new Date(post.dueAt).getTime()!==new Date(entry.dueAt).getTime())throw new Error(`Buffer guardó ${post.id} con otra hora. Revisar ese ID.`);
	return {mode:'scheduled',bufferPostId:post.id,status:post.status,dueAt:post.dueAt,imageUrls};
}

async function main() {
	const args = process.argv.slice(2);
	const modes = args.filter(arg => ['--check','--prepare','--publish'].includes(arg));
	if (modes.length > 1) throw new Error('Elegí un solo modo.');
	const value = name => args.includes(name) ? args[args.indexOf(name)+1] : undefined;
	const allowed = new Set(['--check','--prepare','--publish','--state-dir','--media-ref','--edition']);
	for(let i=0;i<args.length;i++){if(!allowed.has(args[i]))throw new Error(`Argumento desconocido: ${args[i]}`); if(['--state-dir','--media-ref','--edition'].includes(args[i])){if(!args[i+1] || args[i+1].startsWith('--'))throw new Error('Falta valor.');i++;}}
	const options = {stateDir:path.resolve(value('--state-dir') || '.tmp/instagram-preview'),key:process.env.BUFFER_API_KEY,organizationId:process.env.BUFFER_ORGANIZATION_ID,channelId:process.env.BUFFER_INSTAGRAM_CHANNEL_ID,attemptId:`${process.env.GITHUB_RUN_ID || 'local'}:${process.env.GITHUB_RUN_ATTEMPT || '1'}`,repository:process.env.GITHUB_REPOSITORY,mediaRef:value('--media-ref'),edition:value('--edition') || process.env.INSTAGRAM_EDITION || 'today'};
	let result;
	if (modes[0] === '--check') {
		const checked = await checkInstagram(options);
		result = {mode:'checked',channel:checked.channel,pending:checked.pending,postsRead:checked.posts.length};
	} else if(modes[0] === '--prepare') result = await prepareInstagram(options);
	else if(modes[0] === '--publish') result = await publishInstagram(options);
	else {
		// Offline preview: no Buffer request, secret access or operational history writes.
		const plan=planEdition(await visualMovies(),{posts:[]},new Set(),editionDate(new Date(),options.edition));
		const cards=await renderEdition(plan,options.stateDir);
		result = {mode:'dry-run',slugs:plan.slugs,format:plan.format,dueAt:new Date(`${plan.date}T19:15:00-03:00`).toISOString(),text:editionCaption(plan),cards};
	}
	console.log(JSON.stringify(result,null,2));
	if(process.env.GITHUB_STEP_SUMMARY)await writeFile(process.env.GITHUB_STEP_SUMMARY,`### Instagram: ${result.mode}\n\n\`\`\`json\n${JSON.stringify(result,null,2)}\n\`\`\`\n`,{flag:'a'});
	// Don't let an empty/late run masquerade as a successful publication in Actions.
	if(result.mode==='skipped' && !result.bufferPostId && modes[0]!=='--check')throw new Error(`No se programó una publicación: ${result.reason}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => {console.error(error.message.split(process.env.BUFFER_API_KEY || '\u0000').join('[redacted]'));process.exitCode=1;});
