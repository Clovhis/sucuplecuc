import { access, mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MOVIES_DIR = path.join(ROOT_DIR, 'src/data/movies');
const DEFAULT_HISTORY_PATH = path.join(ROOT_DIR, '.github/cineposta-buffer-x-history.json');
const SITE_URL = 'https://www.cineposta.com.ar';
// Buffer/X can add URL normalization overhead beyond the public t.co estimate.
// Keep a deliberate margin so a valid preview is never rejected at scheduling time.
const MAX_X_WEIGHTED_LENGTH = 250;
const URL_WEIGHT = 23;
const RECENT_PREMIERE_DAYS = 90;
const COPY_VARIANT_HISTORY_SIZE = 3;

const OPENING_TEMPLATES = [
	({ title, availability }) => `${title} ${availability}.`,
	({ title, availability, genre }) => `Si buscás algo de ${genre}, ${title} ${availability}.`,
	({ title, availability, genre }) => `¿Con ganas de ${genre}? ${title} ${availability}.`,
	({ title, availability }) => `Una para agendar: ${title} ${availability}.`,
	({ title, availability, genre }) => `Para una noche de ${genre}, ${title} ${availability}.`,
	({ title, availability }) => `Atenti con ${title}: ${availability}.`,
	({ title, availability, genre }) => `Si te pinta ${genre}, ${title} ${availability}.`,
	({ title, availability }) => `Plan de peli: ${title} ${availability}.`,
	({ title, availability, genre }) => `¿Qué mirar si te gusta ${genre}? ${title} ${availability}.`,
	({ title, availability }) => `Para sumar a la lista: ${title} ${availability}.`,
	({ title, availability, genre }) => `Para quienes vienen buscando ${genre}, ${title} ${availability}.`,
	({ title, availability }) => `Anotá esta: ${title} ${availability}.`,
];

const EDITORIAL_INTROS = [
	'',
	'La posta: ',
	'En la reseña, ',
	'Lo que nos dejó: ',
	'Va por acá: ',
	'Para tener en cuenta: ',
	'La mirada de Cine Posta: ',
	'¿Qué propone? ',
	'El foco está puesto en esto: ',
	'Un adelanto de nuestra reseña: ',
];

const VERDICT_TEMPLATES = [
	(label) => `Nuestro veredicto: ${label}.`,
	(label) => `Veredicto Cine Posta: ${label}.`,
	(label) => `Balance final: ${label}.`,
	(label) => `Para Cine Posta: ${label}.`,
	(label) => `¿La recomendamos? ${label}.`,
	(label) => `El veredicto queda así: ${label}.`,
	(label) => `La posta del equipo: ${label}.`,
	(label) => `${label}, según Cine Posta.`,
];

const LINK_TEMPLATES = [
	(url) => `La reseña completa: ${url}`,
	(url) => `Ficha y reseña: ${url}`,
	(url) => `Leé la reseña: ${url}`,
	(url) => `La tenés acá: ${url}`,
	(url) => `Todo el detalle: ${url}`,
	(url) => `Pasá por la ficha: ${url}`,
	(url) => `La crítica completa: ${url}`,
	(url) => `Más sobre la peli: ${url}`,
];

const ANTI_REPEAT_COMPONENTS = ['opening', 'verdict', 'link'];
const COPY_COMPONENT_TEMPLATES = { opening: OPENING_TEMPLATES, verdict: VERDICT_TEMPLATES, link: LINK_TEMPLATES };

function parseArguments(argumentsList) {
	const values = new Map();
	for (let index = 0; index < argumentsList.length; index += 1) {
		const argument = argumentsList[index];
		if (!argument.startsWith('--')) continue;
		const [key, inlineValue] = argument.slice(2).split('=', 2);
		values.set(key, inlineValue ?? argumentsList[index + 1]);
		if (inlineValue === undefined && argumentsList[index + 1] && !argumentsList[index + 1].startsWith('--')) index += 1;
	}
	return { publish: values.has('publish'), historyPath: values.get('history') ? path.resolve(ROOT_DIR, values.get('history')) : DEFAULT_HISTORY_PATH, dueAt: values.get('due-at') };
}

function requiredString(value, field, movie) {
	if (typeof value !== 'string' || !value.trim()) throw new Error(`La película ${movie?.slug ?? '(sin slug)'} no tiene ${field}.`);
	return value.trim();
}

function verdictLabel(movie) {
	if (typeof movie.verdictLabel === 'string' && movie.verdictLabel.trim()) return movie.verdictLabel.trim();
	return ({ recomendada: 'MIRALA', zafa: 'ZAFA', 'no-recomendada': 'MEJOR PASÁ' })[movie.verdict] ?? String(movie.verdict ?? '').trim().toUpperCase();
}

function moviePlatforms(movie) {
	const values = Array.isArray(movie.releasePlatforms) ? movie.releasePlatforms : [movie.releasePlatform];
	return values.filter((value) => typeof value === 'string' && value.trim() && value !== 'Otras plataformas').map((value) => value.trim());
}

function availabilityLabels(movie) {
	const platforms = moviePlatforms(movie);
	if (platforms.includes('Cine')) return ['ya está en cines de Argentina', 'acaba de llegar a los cines argentinos', 'ya se puede ver en salas argentinas', 'se estrenó en los cines argentinos'];
	const platformLabel = platforms.length === 1 ? platforms[0] : platforms.length === 2 ? `${platforms[0]} y ${platforms[1]}` : `${platforms.slice(0, -1).join(', ')} y ${platforms.at(-1)}`;
	const catalogLabel = platforms.length === 1 ? `al catálogo de ${platformLabel}` : `a los catálogos de ${platformLabel}`;
	return [`ya está disponible en ${platformLabel}`, `acaba de sumarse a ${platformLabel}`, `ya la encontrás en ${platformLabel}`, `llegó ${catalogLabel}`];
}

async function localPosterUrl(movie) {
	const poster = requiredString(movie.poster, 'poster', movie);
	if (!poster.startsWith('assets/posters/')) return null;
	try { await access(path.join(ROOT_DIR, 'public', ...poster.split('/'))); } catch { return null; }
	return `${SITE_URL}/${poster}`;
}

function movieUrl(slug) { return `${SITE_URL}/peliculas/${encodeURIComponent(slug)}/`; }

function firstSentence(value) {
	const normalized = value.replace(/\s+/g, ' ').trim();
	return normalized.match(/^(.+?[.!?…])(?:\s|$)/u)?.[1] ?? normalized;
}

export function weightedXLength(text) {
	const urls = text.match(/https?:\/\/[^\s]+/gu) ?? [];
	return [...text].length - urls.reduce((total, url) => total + [...url].length, 0) + urls.length * URL_WEIGHT;
}

function shorten(text, maximumLength) {
	if ([...text].length <= maximumLength) return text;
	return `${[...text].slice(0, Math.max(1, maximumLength - 1)).join('').trimEnd()}…`;
}

function pickVariant(values, index) {
	return values[((index % values.length) + values.length) % values.length];
}

function isCopyStyle(value) {
	return value && ['opening', 'availability', 'editorial', 'verdict', 'link'].every((key) => Number.isInteger(value[key]));
}

function defaultCopyStyle(movie) {
	return {
		opening: hash(`${movie.slug}:opening`),
		availability: hash(`${movie.slug}:availability`),
		editorial: hash(`${movie.slug}:editorial`),
		verdict: hash(`${movie.slug}:verdict`),
		link: hash(`${movie.slug}:link`),
	};
}

export function chooseCopyStyle(movie, history = { posts: [] }) {
	const recentStyles = history.posts.slice(-COPY_VARIANT_HISTORY_SIZE).map(({ copyStyle }) => copyStyle).filter(isCopyStyle);
	const baseStyle = defaultCopyStyle(movie);
	for (let offset = 0; offset < 64; offset += 1) {
		const style = Object.fromEntries(Object.entries(baseStyle).map(([key, value]) => [key, value + offset]));
		const repeatsRecentStyle = recentStyles.some((recent) => ANTI_REPEAT_COMPONENTS.some((key) => pickVariant(COPY_COMPONENT_TEMPLATES[key], recent[key]) === pickVariant(COPY_COMPONENT_TEMPLATES[key], style[key])));
		if (!repeatsRecentStyle) return style;
	}
	return baseStyle;
}

export function renderPostText(movie, copyStyle = defaultCopyStyle(movie)) {
	const title = requiredString(movie.title, 'título', movie);
	const review = requiredString(movie.review, 'reseña', movie);
	if (!Number.isInteger(movie.year)) throw new Error(`La película ${movie.slug} no tiene un año válido.`);
	const label = requiredString(verdictLabel(movie), 'veredicto', movie);
	const url = movieUrl(requiredString(movie.slug, 'slug', movie));
	const category = typeof movie.category === 'string' && movie.category.trim() ? movie.category.trim().toLocaleLowerCase('es-AR') : 'buen cine';
	const style = isCopyStyle(copyStyle) ? copyStyle : defaultCopyStyle(movie);
	const availability = pickVariant(availabilityLabels(movie), style.availability);
	let opening = pickVariant(OPENING_TEMPLATES, style.opening)({ title: `${title} (${movie.year})`, genre: category, availability });
	let editorialIntro = pickVariant(EDITORIAL_INTROS, style.editorial);
	const suffix = `\n\n${pickVariant(VERDICT_TEMPLATES, style.verdict)(label)}\n${pickVariant(LINK_TEMPLATES, style.link)(url)}`;
	let excerptBudget = MAX_X_WEIGHTED_LENGTH - weightedXLength(`${opening}\n\n${editorialIntro}`) - weightedXLength(suffix);
	// Some real release titles are very long. Keep their post readable instead of
	// failing the whole daily run because a decorative template consumed the excerpt.
	if (excerptBudget < 24) {
		opening = `${title} ${availability}.`;
		editorialIntro = '';
		excerptBudget = MAX_X_WEIGHTED_LENGTH - weightedXLength(`${opening}\n\n`) - weightedXLength(suffix);
	}
	if (excerptBudget < 24) throw new Error(`El título de ${movie.slug} no deja espacio suficiente para una publicación en X.`);
	return `${opening}\n\n${editorialIntro}${shorten(firstSentence(review), excerptBudget)}${suffix}`;
}

function hash(value) {
	let current = 2166136261;
	for (const character of value) { current ^= character.codePointAt(0); current = Math.imul(current, 16777619); }
	return current >>> 0;
}

async function loadMovies() {
	const files = (await readdir(MOVIES_DIR)).filter((file) => file.endsWith('.json')).sort();
	return Promise.all(files.map(async (file) => JSON.parse(await readFile(path.join(MOVIES_DIR, file), 'utf8'))));
}

async function readHistory(historyPath) {
	try {
		const history = JSON.parse(await readFile(historyPath, 'utf8'));
		if (history?.version !== 1 || !Array.isArray(history.posts)) throw new Error('formato no reconocido');
		return history;
	} catch (error) {
		if (error?.code === 'ENOENT') return { version: 1, posts: [] };
		throw new Error(`No se pudo leer el historial de Buffer: ${error.message}`);
	}
}

function argentinaDate(now = new Date()) {
	const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' });
	const values = Object.fromEntries(formatter.formatToParts(now).filter(({ type }) => type !== 'literal').map(({ type, value }) => [type, value]));
	return `${values.year}-${values.month}-${values.day}`;
}

export function nextDueAt(now = new Date()) {
	const sevenPmArgentina = new Date(`${argentinaDate(now)}T22:00:00.000Z`);
	return new Date(now.getTime() < sevenPmArgentina.getTime() ? sevenPmArgentina : sevenPmArgentina.getTime() + 86_400_000).toISOString();
}

function isRecentPremiere(movie, today = argentinaDate()) {
	if (movie?.isPremiere !== true || !/^\d{4}-\d{2}-\d{2}$/u.test(movie.releaseDate ?? '')) return false;
	const releaseAt = new Date(`${movie.releaseDate}T00:00:00.000Z`);
	const todayAt = new Date(`${today}T00:00:00.000Z`);
	const oldestAt = new Date(todayAt.getTime() - RECENT_PREMIERE_DAYS * 86_400_000);
	return releaseAt <= todayAt && releaseAt >= oldestAt && moviePlatforms(movie).length > 0;
}

async function eligibleMovies(movies, today) {
	const eligible = [];
	for (const movie of movies) {
		if (!movie?.slug || !movie?.title || !movie?.review || !movie?.year || !verdictLabel(movie) || !isRecentPremiere(movie, today)) continue;
		const posterUrl = await localPosterUrl(movie);
		if (posterUrl) eligible.push({ movie, posterUrl });
	}
	return eligible;
}

export function selectMovie(eligible, history, externallyUsedSlugs = new Set()) {
	const usedSlugs = new Set([...history.posts.map(({ slug }) => slug), ...externallyUsedSlugs]);
	const candidates = eligible.filter(({ movie }) => !usedSlugs.has(movie.slug));
	if (candidates.length === 0) throw new Error('No quedan películas elegibles sin publicar en Buffer. Revisá el historial antes de habilitar un nuevo ciclo.');
	return candidates.sort((left, right) => right.movie.releaseDate.localeCompare(left.movie.releaseDate) || hash(left.movie.slug) - hash(right.movie.slug) || left.movie.slug.localeCompare(right.movie.slug))[0];
}

async function bufferRequest(apiKey, query, variables = {}) {
	const response = await fetch('https://api.buffer.com', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ query, variables }) });
	const body = await response.json().catch(() => ({}));
	if (!response.ok || body.errors?.length) throw new Error(`Buffer respondió ${response.status}: ${(body.errors ?? [{ message: 'respuesta inválida' }]).map(({ message }) => message).join('; ')}`);
	return body.data;
}

async function getXChannel(apiKey) {
	const expectedChannelId = process.env.BUFFER_X_CHANNEL_ID?.trim();
	const configuredOrganizationId = process.env.BUFFER_ORGANIZATION_ID?.trim();
	if (configuredOrganizationId && expectedChannelId) return { organizationId: configuredOrganizationId, channel: { id: expectedChannelId, name: '@cineposta' } };
	const organizations = await bufferRequest(apiKey, 'query { account { organizations { id name } } }');
	for (const organization of organizations.account.organizations) {
		const data = await bufferRequest(apiKey, 'query Channels($organizationId: OrganizationId!) { channels(input: { organizationId: $organizationId }) { id name service } }', { organizationId: organization.id });
		const twitterChannels = data.channels.filter((channel) => channel.service === 'twitter');
		const exact = twitterChannels.find((channel) => channel.id === expectedChannelId || /^@?cineposta$/iu.test(channel.name.trim()));
		if (exact) return { organizationId: organization.id, channel: exact };
		if (expectedChannelId && twitterChannels.some((channel) => channel.id === expectedChannelId)) throw new Error('BUFFER_X_CHANNEL_ID no corresponde a una cuenta X accesible de Buffer.');
	}
	throw new Error('No se encontró el canal X @cineposta en Buffer. Conectalo en Buffer o configurá BUFFER_X_CHANNEL_ID como variable del repositorio.');
}

async function getBufferPostGuard(apiKey, organizationId, channelId, dueAt) {
	const query = 'query ExistingPosts($organizationId: OrganizationId!, $channelIds: [ChannelId!]) { posts(first: 100, input: { organizationId: $organizationId, filter: { status: [sent, scheduled, draft, needs_approval], channelIds: $channelIds } }) { edges { node { text dueAt } } } }';
	const data = await bufferRequest(apiKey, query, { organizationId, channelIds: [channelId] });
	const slugs = new Set();
	let targetSlotOccupied = false;
	for (const edge of data.posts.edges) {
		if (edge.node.dueAt === dueAt) targetSlotOccupied = true;
		const match = edge.node.text?.match(/https:\/\/www\.cineposta\.com\.ar\/peliculas\/([^/?#\s]+)\/?/iu);
		if (match) slugs.add(decodeURIComponent(match[1]));
	}
	return { slugs, targetSlotOccupied };
}

async function createPost(apiKey, channelId, plan) {
	const mutation = 'mutation CreatePost($input: CreatePostInput!) { createPost(input: $input) { __typename ... on PostActionSuccess { post { id dueAt status } } ... on MutationError { message } } }';
	const input = { text: plan.text, channelId, schedulingType: 'automatic', mode: 'customScheduled', dueAt: plan.dueAt, needsApproval: false, assets: [{ image: { url: plan.posterUrl, metadata: { altText: `Poster de ${plan.movie.title} (${plan.movie.year})` } } }] };
	const data = await bufferRequest(apiKey, mutation, { input });
	if (data.createPost.__typename !== 'PostActionSuccess') throw new Error(`Buffer no creó la publicación: ${data.createPost.message ?? data.createPost.__typename}`);
	return data.createPost.post;
}

async function writeHistory(historyPath, history) {
	await mkdir(path.dirname(historyPath), { recursive: true });
	const temporaryPath = `${historyPath}.tmp`;
	await writeFile(temporaryPath, `${JSON.stringify(history, null, '\t')}\n`, 'utf8');
	await rename(temporaryPath, historyPath);
}

export async function buildPlan({ historyPath = DEFAULT_HISTORY_PATH, dueAt } = {}) {
	const [movies, history] = await Promise.all([loadMovies(), readHistory(historyPath)]);
	const selected = selectMovie(await eligibleMovies(movies), history);
	const plan = { ...selected, dueAt: new Date(dueAt ?? nextDueAt()).toISOString(), copyStyle: chooseCopyStyle(selected.movie, history) };
	plan.text = renderPostText(plan.movie, plan.copyStyle);
	if (weightedXLength(plan.text) > MAX_X_WEIGHTED_LENGTH) throw new Error(`La publicación de ${plan.movie.slug} supera el límite de X.`);
	return { history, plan };
}

async function main() {
	const options = parseArguments(process.argv.slice(2));
	const { history, plan: initialPlan } = await buildPlan(options);
	let plan = initialPlan;
	if (!options.publish) {
		console.log(JSON.stringify({ mode: 'dry-run', slug: plan.movie.slug, title: plan.movie.title, year: plan.movie.year, verdict: verdictLabel(plan.movie), dueAt: plan.dueAt, posterUrl: plan.posterUrl, url: movieUrl(plan.movie.slug), xWeightedLength: weightedXLength(plan.text), text: plan.text }, null, 2));
		return;
	}
	const apiKey = process.env.BUFFER_API_KEY?.trim();
	if (!apiKey) throw new Error('Falta BUFFER_API_KEY. Configurala como secret de GitHub Actions; nunca la agregues al repositorio.');
	const { organizationId, channel } = await getXChannel(apiKey);
	const guard = await getBufferPostGuard(apiKey, organizationId, channel.id, plan.dueAt);
	if (guard.targetSlotOccupied) {
		console.log(JSON.stringify({ mode: 'skipped', reason: 'Buffer ya tiene una publicación para esta franja.', channel: channel.name, dueAt: plan.dueAt }, null, 2));
		return;
	}
	const externallyUsedSlugs = guard.slugs;
	if (externallyUsedSlugs.has(plan.movie.slug)) {
		plan = selectMovie(await eligibleMovies(await loadMovies()), history, externallyUsedSlugs);
		plan.dueAt = initialPlan.dueAt;
		plan.copyStyle = chooseCopyStyle(plan.movie, history);
		plan.text = renderPostText(plan.movie, plan.copyStyle);
	}
	const post = await createPost(apiKey, channel.id, plan);
	history.posts.push({ slug: plan.movie.slug, bufferPostId: post.id, dueAt: post.dueAt, scheduledAt: new Date().toISOString(), copyStyle: plan.copyStyle });
	await writeHistory(options.historyPath, history);
	console.log(JSON.stringify({ mode: 'scheduled', channel: channel.name, slug: plan.movie.slug, bufferPostId: post.id, dueAt: post.dueAt, xWeightedLength: weightedXLength(plan.text) }, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	main().catch((error) => { console.error(error.message); process.exit(1); });
}
