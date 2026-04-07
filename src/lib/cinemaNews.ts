export interface CinemaNewsItem {
	title: string;
	summary: string;
	link: string;
	source: string;
	publishedAt: string;
	publishedLabel: string;
	category?: string;
	imageUrl?: string;
}

interface CinemaNewsFeed {
	name: string;
	url: string;
	articleHosts: string[];
}

interface CinemaNewsResult {
	items: CinemaNewsItem[];
	sourceLabel: string;
	updatedLabel: string;
	isFallback: boolean;
}

const MAX_NEWS_ITEMS = 8;
const FEEDS: CinemaNewsFeed[] = [
	{
		name: 'LA NACION',
		url: 'https://www.lanacion.com.ar/arc/outboundfeeds/rss/category/espectaculos/?outputType=xml',
		articleHosts: ['lanacion.com.ar', 'www.lanacion.com.ar'],
	},
	{
		name: 'Clarín',
		url: 'https://www.clarin.com/rss/espectaculos/cine/',
		articleHosts: ['clarin.com', 'www.clarin.com'],
	},
	{
		name: 'Página/12',
		url: 'https://www.pagina12.com.ar/arc/outboundfeeds/rss/suplementos/cultura-y-espectaculos/notas',
		articleHosts: ['pagina12.com.ar', 'www.pagina12.com.ar'],
	},
	{
		name: 'EscribiendoCine',
		url: 'https://www.escribiendocine.com/rss/noticias/',
		articleHosts: ['escribiendocine.com', 'www.escribiendocine.com'],
	},
	{
		name: 'Cines Argentinos',
		url: 'https://feeds.feedburner.com/cinesargentinos',
		articleHosts: ['cinesargentinos.com.ar', 'www.cinesargentinos.com.ar'],
	},
];

const HTML_ENTITIES: Record<string, string> = {
	amp: '&',
	apos: "'",
	copy: '©',
	eacute: 'é',
	hellip: '…',
	iacute: 'í',
	iexcl: '¡',
	iquest: '¿',
	laquo: '«',
	ldquo: '“',
	lsquo: '‘',
	lt: '<',
	mdash: '—',
	nbsp: ' ',
	ndash: '–',
	ntilde: 'ñ',
	oacute: 'ó',
	quot: '"',
	raquo: '»',
	rdquo: '”',
	rsquo: '’',
	gt: '>',
	uacute: 'ú',
	aacute: 'á',
	Aacute: 'Á',
	Eacute: 'É',
	Iacute: 'Í',
	Ntilde: 'Ñ',
	Oacute: 'Ó',
	Uacute: 'Ú',
	uuml: 'ü',
	Uuml: 'Ü',
};

const FALLBACK_ITEMS: Omit<CinemaNewsItem, 'publishedLabel'>[] = [
	{
		title: 'Todos los ganadores de los Premios Oscar 2026',
		summary: 'La premiación consagró a Una batalla tras otra como gran ganadora y repartió varios de los premios más pesados de la noche.',
		link: 'https://www.escribiendocine.com/noticias/2026/03/15/21599-todos-los-ganadores-de-los-premios-oscar-2026',
		source: 'EscribiendoCine',
		publishedAt: '2026-03-16T02:02:01Z',
		imageUrl:
			'https://escribiendocine-s3.cdn.net.ar/s3i233/2026/03/escribiendocine/images/02/51/19/2511930_07ac4cf2417960184050e4e0dcc0e0a3a0b14a960fd13bada83dbb790853a9e9/sm.jpg',
	},
	{
		title: 'Hoppers: Saltar de una conciencia humana a una animal',
		summary: 'Pixar presentó una nueva historia donde el punto de vista se mete de lleno en el mundo animal.',
		link: 'https://www.cinesargentinos.com.ar/noticia/7101-hoppers-saltar-de-una-conciencia-humana-a-una-animal',
		source: 'Cines Argentinos',
		publishedAt: '2026-03-03T10:30:00-03:00',
		imageUrl: 'https://www.cinesargentinos.com.ar/static/archivos/72950',
	},
	{
		title: 'Todos los ganadores de los Razzie Awards 2026 a lo peor del año',
		summary: 'La ceremonia volvió a marcar los grandes fracasos del año en Hollywood con una lista que dio que hablar.',
		link: 'https://www.escribiendocine.com/noticias/2026/03/14/21592-todos-los-ganadores-de-los-razzie-awards-2026-a-lo-peor-del-ano',
		source: 'EscribiendoCine',
		publishedAt: '2026-03-14T14:08:03Z',
		imageUrl:
			'https://escribiendocine-s3.cdn.net.ar/s3i233/2026/03/escribiendocine/images/02/51/04/2510405_9ac6ad5924cd6d53dff009f52b8b72eb90ee95b54c20d0991531360036611c37/sm.jpg',
	},
];

const EXCLUDED_PATTERNS = [
	/^cr[ií]tica de\b/i,
	/\bcurs[oa]\b/i,
	/\blibro(?:s)?\b/i,
	/\bliteratura\b/i,
	/\bgrammy\b/i,
	/\bm[uú]sic[ao]\b/i,
	/\brecital(?:es)?\b/i,
	/\bconcierto(?:s)?\b/i,
	/\bteatro\b/i,
	/\btelevisi[oó]n\b/i,
	/\btv\b/i,
	/\breality\b/i,
	/\bnovela(?:s)?\b/i,
	/\bvideojuego(?:s)?\b/i,
	/\bmachosfera\b/i,
	/\bsam altman\b/i,
	/\bmuseo\b/i,
	/\bzoom\b/i,
	/\balfombra roja\b/i,
	/\blooks\b/i,
	/\buniversal\+\b/i,
	/\bmoda\b/i,
	/\bserie(?:s)?\b/i,
	/\btemporada\b/i,
	/\bnetflix\b/i,
	/\bprime video\b/i,
	/\bdisney\+\b/i,
	/\bhbo max\b/i,
	/\bmovistar\+\b/i,
	/\bfilmin\b/i,
	/\bdisney\b/i,
	/\bstreaming\b/i,
];

const EXCLUDED_CATEGORIES = new Set(['videos y fotos']);
const DEDICATED_CINEMA_SOURCES = new Set(['Clarín', 'EscribiendoCine', 'Cines Argentinos']);
const REQUIRED_CINEMA_PATTERNS = [
	/\bcine\b/i,
	/\bpel[ií]cula(?:s)?\b/i,
	/\bfilme(?:s)?\b/i,
	/\bfilm\b/i,
	/\btaquilla\b/i,
	/\btr[aá]iler\b/i,
	/\bestreno(?:s)?\b/i,
	/\bdocumental(?:es)?\b/i,
	/\banimaci[oó]n\b/i,
	/\bbiopic\b/i,
	/\bhollywood\b/i,
	/\boscar(?:es)?\b/i,
	/\bfestival(?:es)?\b/i,
	/\bcannes\b/i,
	/\bvenecia\b/i,
	/\bberl[ií]n\b/i,
	/\bmar del plata\b/i,
	/\bsan sebasti[aá]n\b/i,
	/\brodaje\b/i,
	/\bcartelera\b/i,
];

const fetchHeaders = {
	accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
	'user-agent': 'Mozilla/5.0 (compatible; CinePostaBot/1.0; +https://www.cineposta.com.ar)',
};
const SITE_TIMEZONE = 'America/Argentina/Buenos_Aires';
const ALLOWED_REMOTE_PROTOCOLS = new Set(['https:']);
const MAX_REDIRECT_HOPS = 3;

export async function getCinemaNews(): Promise<CinemaNewsResult> {
	const collectedItems: CinemaNewsItem[] = [];

	for (const feed of FEEDS) {
		try {
			const feedUrl = new URL(feed.url);
			const xml = await fetchTrustedText(feedUrl, [normalizeHostname(feedUrl.hostname)]);
			const items = parseFeedItems(xml, feed);
			if (items.length > 0) {
				collectedItems.push(...items);
			}
		} catch (error) {
			console.warn(`[cinemaNews] Failed to fetch ${feed.name}:`, error);
		}
	}

	const items = dedupeAndSortItems(collectedItems).slice(0, MAX_NEWS_ITEMS);
	if (items.length > 0) {
		const enrichedItems = await enrichItemsWithImages(items);
		return {
			items: enrichedItems,
			sourceLabel: 'medios argentinos',
			updatedLabel: formatUpdatedLabel(enrichedItems[0]?.publishedAt ?? new Date().toISOString()),
			isFallback: false,
		};
	}

	const fallbackItems = FALLBACK_ITEMS.map((item) => ({
		...item,
		publishedLabel: formatPublishedLabel(item.publishedAt),
	}));

	return {
		items: fallbackItems,
		sourceLabel: 'medios argentinos',
		updatedLabel: 'respaldo local',
		isFallback: true,
	};
}

function parseFeedItems(xml: string, feed: CinemaNewsFeed) {
	const itemBlocks = Array.from(xml.matchAll(/<item\b[\s\S]*?<\/item>/gi), (match) => match[0]);
	const items = itemBlocks
		.map((block) => parseFeedItem(block, feed))
		.filter((item): item is CinemaNewsItem => Boolean(item));

	return items.slice(0, MAX_NEWS_ITEMS);
}

function parseFeedItem(block: string, feed: CinemaNewsFeed): CinemaNewsItem | null {
	const title = cleanText(extractTag(block, 'title'));
	const link = normalizeArticleUrl(extractTag(block, 'link'), feed);
	const category = cleanText(extractTag(block, 'category'));
	const description = extractTag(block, 'description') || extractTag(block, 'content:encoded');
	const publishedAt = normalizePublishedAt(cleanText(extractTag(block, 'pubDate')));
	const summary = summarizeDescription(description);
	const imageUrl = extractImageUrl(block, link);
	const haystack = `${title} ${summary}`;

	if (!title || !link || !publishedAt || summary.length < 30) {
		return null;
	}

	if (EXCLUDED_CATEGORIES.has(category.toLowerCase())) {
		return null;
	}

	if (EXCLUDED_PATTERNS.some((pattern) => pattern.test(haystack))) {
		return null;
	}

	if (!looksLikeCinemaStory(feed.name, category, haystack, link)) {
		return null;
	}

	return {
		title,
		summary,
		link,
		source: feed.name,
		publishedAt,
		publishedLabel: formatPublishedLabel(publishedAt),
		category,
		imageUrl,
	};
}

function looksLikeCinemaStory(source: string, category: string, haystack: string, link: string) {
	if (DEDICATED_CINEMA_SOURCES.has(source)) {
		return true;
	}

	const cinemaSignals = `${category} ${haystack} ${link}`;
	return REQUIRED_CINEMA_PATTERNS.some((pattern) => pattern.test(cinemaSignals));
}

function dedupeAndSortItems(items: CinemaNewsItem[]) {
	const seenLinks = new Set<string>();
	return items
		.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
		.filter((item) => {
			if (seenLinks.has(item.link)) {
				return false;
			}

			seenLinks.add(item.link);
			return true;
		});
}

async function enrichItemsWithImages(items: CinemaNewsItem[]) {
	return Promise.all(
		items.map(async (item) => {
			if (item.imageUrl) {
				return item;
			}

			const matchingFeed = FEEDS.find((feed) => feed.name === item.source);
			const imageUrl = matchingFeed ? await fetchArticleImage(item.link, matchingFeed.articleHosts) : '';
			return imageUrl ? { ...item, imageUrl } : item;
		}),
	);
}

function extractTag(input: string, tag: string) {
	const safeTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const match = input.match(new RegExp(`<${safeTag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${safeTag}>`, 'i'));
	return match?.[1] ?? '';
}

function extractAttribute(input: string, tagName: string, attributeName: string, requiresImageType = false) {
	const safeTagName = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const safeAttributeName = attributeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const tagPattern = new RegExp(`<${safeTagName}\\b([^>]*)\\/?>`, 'gi');

	for (const match of input.matchAll(tagPattern)) {
		const attributes = match[1] ?? '';
		if (
			requiresImageType &&
			!/\btype\s*=\s*['"][^'"]*image\//i.test(attributes)
		) {
			continue;
		}

		const attributeMatch = attributes.match(
			new RegExp(`${safeAttributeName}\\s*=\\s*['"]([^'"]+)['"]`, 'i'),
		);
		if (attributeMatch?.[1]) {
			return attributeMatch[1];
		}
	}

	return '';
}

function extractImageUrl(block: string, articleUrl: string) {
	const candidates = [
		extractAttribute(block, 'media:content', 'url'),
		extractAttribute(block, 'media:thumbnail', 'url'),
		extractAttribute(block, 'enclosure', 'url', true),
		extractAttribute(block, 'img', 'src'),
	];

	for (const candidate of candidates) {
		const normalized = normalizeImageUrl(candidate, articleUrl);
		if (normalized) {
			return normalized;
		}
	}

	return '';
}

function cleanText(input: string) {
	return decodeHtmlEntities(stripTags(stripCdata(input)))
		.replace(/\s+/g, ' ')
		.trim();
}

function normalizeImageUrl(input: string, articleUrl: string) {
	const decoded = decodeHtmlEntities(stripCdata(input)).trim();
	if (!decoded) {
		return '';
	}

	try {
		const normalized = new URL(decoded, articleUrl);
		return ALLOWED_REMOTE_PROTOCOLS.has(normalized.protocol) ? normalized.toString() : '';
	} catch {
		return '';
	}
}

function normalizeHostname(input: string) {
	return input.trim().toLowerCase().replace(/\.$/, '');
}

function isAllowedHost(input: string, allowedHosts: string[]) {
	const normalized = normalizeHostname(input);
	return allowedHosts.some((host) => normalizeHostname(host) === normalized);
}

function normalizeArticleUrl(input: string, feed: CinemaNewsFeed) {
	const decoded = decodeHtmlEntities(stripCdata(input)).trim();
	if (!decoded) {
		return '';
	}

	try {
		const normalized = new URL(decoded, feed.url);
		if (!ALLOWED_REMOTE_PROTOCOLS.has(normalized.protocol)) {
			return '';
		}

		return isAllowedHost(normalized.hostname, feed.articleHosts) ? normalized.toString() : '';
	} catch {
		return '';
	}
}

function summarizeDescription(input: string) {
	const stripped = decodeHtmlEntities(
		stripTags(
			stripCdata(input)
				.replace(/<script[\s\S]*?<\/script>/gi, ' ')
				.replace(/<style[\s\S]*?<\/style>/gi, ' ')
				.replace(/<br\s*\/?>/gi, ' ')
				.replace(/<\/(p|div|li|h2|h3|blockquote)>/gi, '. '),
		),
	)
		.replace(/En Espinof \|[\s\S]*$/i, '')
		.replace(/La noticia[\s\S]*?fue publicada originalmente[\s\S]*$/i, '')
		.replace(/Artículo original publicado[\s\S]*$/i, '')
		.replace(/\s+/g, ' ')
		.trim();

	const firstSentence = stripped.match(/^(.{40,210}?[.!?])(?:\s|$)/)?.[1];
	const candidate = firstSentence ?? stripped;
	return trimText(candidate, 175);
}

function stripTags(input: string) {
	return input.replace(/<[^>]+>/g, ' ');
}

function stripCdata(input: string) {
	return input.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
}

function decodeHtmlEntities(input: string) {
	return input
		.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
			const codePoint = Number.parseInt(hex, 16);
			return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : '';
		})
		.replace(/&#(\d+);/g, (_, numeric) => {
			const codePoint = Number.parseInt(numeric, 10);
			return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : '';
		})
		.replace(/&([a-zA-Z][a-zA-Z0-9]+);/g, (fullMatch, entity) => HTML_ENTITIES[entity] ?? fullMatch);
}

async function fetchArticleImage(articleUrl: string, allowedHosts: string[]) {
	try {
		const html = await fetchTrustedText(new URL(articleUrl), allowedHosts);
		const candidates = [
			extractMetaContent(html, 'property', 'og:image'),
			extractMetaContent(html, 'name', 'twitter:image'),
			extractMetaContent(html, 'name', 'twitter:image:src'),
		];

		for (const candidate of candidates) {
			const normalized = normalizeImageUrl(candidate, articleUrl);
			if (normalized) {
				return normalized;
			}
		}
	} catch (error) {
		console.warn(`[cinemaNews] Failed to extract article image for ${articleUrl}:`, error);
	}

	return '';
}

async function fetchTrustedText(url: URL, allowedHosts: string[]) {
	let nextUrl = url;

	for (let hop = 0; hop <= MAX_REDIRECT_HOPS; hop += 1) {
		if (!ALLOWED_REMOTE_PROTOCOLS.has(nextUrl.protocol) || !isAllowedHost(nextUrl.hostname, allowedHosts)) {
			throw new Error(`Blocked outbound request to ${nextUrl.toString()}`);
		}

		const response = await fetch(nextUrl, {
			headers: fetchHeaders,
			redirect: 'manual',
		});

		if ([301, 302, 303, 307, 308].includes(response.status)) {
			const location = response.headers.get('location');
			if (!location) {
				throw new Error(`Redirect without location for ${nextUrl.toString()}`);
			}

			nextUrl = new URL(location, nextUrl);
			continue;
		}

		if (!response.ok) {
			throw new Error(`Request failed with ${response.status}`);
		}

		if (response.url) {
			const finalUrl = new URL(response.url);
			if (!ALLOWED_REMOTE_PROTOCOLS.has(finalUrl.protocol) || !isAllowedHost(finalUrl.hostname, allowedHosts)) {
				throw new Error(`Blocked redirected response from ${finalUrl.toString()}`);
			}
		}

		return response.text();
	}

	throw new Error(`Too many redirects for ${url.toString()}`);
}

function extractMetaContent(input: string, key: 'property' | 'name', value: string) {
	const metaPattern = /<meta\b[^>]*>/gi;

	for (const match of input.matchAll(metaPattern)) {
		const tag = match[0] ?? '';
		const normalizedTag = tag.toLowerCase();
		if (!normalizedTag.includes(`${key.toLowerCase()}=`) || !normalizedTag.includes(value.toLowerCase())) {
			continue;
		}

		const contentMatch = tag.match(/\bcontent\s*=\s*['"]([^'"]+)['"]/i);
		if (contentMatch?.[1]) {
			return contentMatch[1];
		}
	}

	return '';
}

function trimText(input: string, maxLength: number) {
	if (input.length <= maxLength) {
		return input;
	}

	const trimmed = input.slice(0, maxLength + 1).replace(/\s+\S*$/, '');
	return `${trimmed}…`;
}

function normalizePublishedAt(input: string) {
	const publishedAt = new Date(input);
	return Number.isNaN(publishedAt.getTime()) ? '' : publishedAt.toISOString();
}

function formatPublishedLabel(input: string) {
	const publishedAt = new Date(input);
	if (Number.isNaN(publishedAt.getTime())) {
		return 'recién';
	}

	return new Intl.DateTimeFormat('es-AR', {
		day: 'numeric',
		month: 'short',
		timeZone: SITE_TIMEZONE,
	}).format(publishedAt);
}

function formatUpdatedLabel(input: string) {
	const publishedAt = new Date(input);
	if (Number.isNaN(publishedAt.getTime())) {
		return 'actualización reciente';
	}

	return `actualizado ${new Intl.DateTimeFormat('es-AR', {
		day: 'numeric',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit',
		timeZone: SITE_TIMEZONE,
	}).format(publishedAt)}`;
}
