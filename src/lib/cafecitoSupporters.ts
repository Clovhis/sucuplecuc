export interface CafecitoSupporter {
	name: string;
	message: string;
	coffeesLabel: string;
	timeAgo: string;
}

interface CafecitoSupportersResult {
	items: CafecitoSupporter[];
	profileUrl: string;
	isFallback: boolean;
}

const CAFECITO_PROFILE_URL = 'https://cafecito.app/cineposta';
const ALLOWED_HOST = 'cafecito.app';
const FETCH_HEADERS = {
	accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
	'user-agent': 'Mozilla/5.0 (compatible; CinePostaBot/1.0; +https://www.cineposta.com.ar)',
};

const FALLBACK_ITEMS: CafecitoSupporter[] = [
	{
		name: 'Herre',
		message: 'Gran Proyecto!!',
		coffeesLabel: '4 cafecitos',
		timeAgo: 'hace 3 dias',
	},
	{
		name: 'Antares Requiem',
		message: 'Vamos neneeeee! jajahaja',
		coffeesLabel: '1 cafecito',
		timeAgo: 'hace 5 dias',
	},
];

const MAX_SUPPORTERS = 10;

export async function getCafecitoSupporters(): Promise<CafecitoSupportersResult> {
	try {
		const html = await fetchProfileHtml();
		const items = parseSupporters(html);
		if (items.length > 0) {
			return {
				items,
				profileUrl: CAFECITO_PROFILE_URL,
				isFallback: false,
			};
		}
	} catch (error) {
		console.warn('[cafecitoSupporters] Failed to fetch supporters:', error);
	}

	return {
		items: FALLBACK_ITEMS,
		profileUrl: CAFECITO_PROFILE_URL,
		isFallback: true,
	};
}

async function fetchProfileHtml() {
	const response = await fetch(CAFECITO_PROFILE_URL, {
		headers: FETCH_HEADERS,
		redirect: 'follow',
	});

	if (!response.ok) {
		throw new Error(`Request failed with ${response.status}`);
	}

	if (response.url) {
		const finalUrl = new URL(response.url);
		if (finalUrl.protocol !== 'https:' || normalizeHostname(finalUrl.hostname) !== ALLOWED_HOST) {
			throw new Error(`Blocked redirected response from ${finalUrl.toString()}`);
		}
	}

	return response.text();
}

function parseSupporters(html: string) {
	const supporterBlocks = Array.from(
		html.matchAll(/<section class="[^"]*__coffeeContainer"[\s\S]*?<\/section>/gi),
		(match) => match[0],
	);
	const seen = new Set<string>();
	const supporters: CafecitoSupporter[] = [];

	for (const block of supporterBlocks) {
		const name = extractClassText(block, '__name');
		const message = extractClassText(block, '__text');
		const coffeesLabel = normalizeCoffeesLabel(extractClassText(block, '__countCoffees'));
		const timeAgo = normalizeRelativeTime(extractClassText(block, '__timeAgo'));

		if (!name || !message || !coffeesLabel) {
			continue;
		}

		const dedupeKey = `${name}::${message}`;
		if (seen.has(dedupeKey)) {
			continue;
		}

		seen.add(dedupeKey);
		supporters.push({
			name,
			message,
			coffeesLabel,
			timeAgo,
		});

		if (supporters.length >= MAX_SUPPORTERS) {
			break;
		}
	}

	return supporters;
}

function extractClassText(block: string, classSuffix: string) {
	const safeSuffix = escapeRegExp(classSuffix);
	const match = block.match(
		new RegExp(`<[^>]+class="[^"]*${safeSuffix}(?:\\s[^"]*)?"[^>]*>([\\s\\S]*?)<\\/[^>]+>`, 'i'),
	);
	return cleanText(match?.[1] ?? '');
}

function cleanText(input: string) {
	return decodeHtmlEntities(stripTags(input))
		.replace(/\s+/g, ' ')
		.trim();
}

function stripTags(input: string) {
	return input.replace(/<[^>]+>/g, ' ');
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
		.replace(/&(amp|apos|quot|lt|gt|nbsp);/g, (fullMatch, entity) => {
			switch (entity) {
				case 'amp':
					return '&';
				case 'apos':
					return "'";
				case 'quot':
					return '"';
				case 'lt':
					return '<';
				case 'gt':
					return '>';
				case 'nbsp':
					return ' ';
				default:
					return fullMatch;
			}
		});
}

function normalizeCoffeesLabel(input: string) {
	const match = input.match(/te compr[oó]\s+(\d+)\s+cafecito(?:s)?/i);
	if (!match) {
		return '';
	}

	const count = Number.parseInt(match[1], 10);
	if (!Number.isFinite(count) || count <= 0) {
		return '';
	}

	return `${count} cafecito${count === 1 ? '' : 's'}`;
}

function normalizeRelativeTime(input: string) {
	return input || 'reciente';
}

function normalizeHostname(input: string) {
	return input.trim().toLowerCase().replace(/\.$/, '');
}

function escapeRegExp(input: string) {
	return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
