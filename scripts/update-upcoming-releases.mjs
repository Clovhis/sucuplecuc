import { access, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT_PATH = path.join(ROOT_DIR, 'src/data/upcomingReleases.generated.ts');
const UPCOMING_URL = 'https://www.themoviedb.org/movie/upcoming';
const MAX_SOURCE_ITEMS = 24;
const MAX_RELEASES = 16;
const STRICT_MODE = process.env.UPCOMING_RELEASES_STRICT === '1';
const TODAY_TIMESTAMP = Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate());
const REQUEST_HEADERS = {
	'user-agent':
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
	'accept-language': 'es-AR,es;q=0.9,en;q=0.8',
};

function decodeHtml(value = '') {
	return String(value)
		.replace(/&#(\d+);/g, (_, numeric) => String.fromCodePoint(Number.parseInt(numeric, 10)))
		.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
		.replace(/&amp;/g, '&')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>');
}

function slugify(value = '') {
	return String(value)
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function normalizeTmdbImage(url = '', preferredSize) {
	const value = String(url).trim();
	if (!value) {
		return '';
	}

	return value
		.replace(/https:\/\/image\.tmdb\.org\/t\/p\/[^/]+\//i, `https://media.themoviedb.org/t/p/${preferredSize}/`)
		.replace(/https:\/\/media\.themoviedb\.org\/t\/p\/[^/]+\//i, `https://media.themoviedb.org/t/p/${preferredSize}/`);
}

async function fetchHtml(url) {
	const response = await fetch(url, { headers: REQUEST_HEADERS });
	if (!response.ok) {
		throw new Error(`HTTP ${response.status} para ${url}`);
	}
	return response.text();
}

function extractUpcomingCards(html) {
	const cardPattern =
		/<div id=\"[^\"]+\" class=\"comp:poster-card[\s\S]*?<a class=\"flex w-full\"[^>]*href=\"(?<href>\/movie\/[^\"]+)\"[\s\S]*?<img alt=\"(?<alt>[^\"]+)\" class=\"poster w-full block\" loading=\"lazy\"[^>]*(?:srcset=\"(?<srcset>[^\"]+)\"[^>]*)?src=\"(?<img>[^\"]+)\"[\s\S]*?<h2 class=\"font-semibold [^\"]*m-0 whitespace-normal\"><span>(?<title>[^<]+)<\/span><\/h2>[\s\S]*?<span class=\"subheader font-light\">(?<date>[^<]+)<\/span>/g;

	return [...html.matchAll(cardPattern)].slice(0, MAX_SOURCE_ITEMS).map((match) => ({
		href: match.groups?.href ?? '',
		title: decodeHtml(match.groups?.title ?? match.groups?.alt ?? ''),
		posterUrl: normalizeTmdbImage(match.groups?.img ?? '', 'w500'),
		displayDate: decodeHtml(match.groups?.date ?? ''),
	}));
}

function extractIsoReleaseDate(detailHtml, fallbackDisplayDate) {
	const fallbackDate = parseDisplayReleaseDate(fallbackDisplayDate);
	if (fallbackDate) {
		return fallbackDate;
	}

	const ldJsonBlocks = [...detailHtml.matchAll(/<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/g)];
	for (const block of ldJsonBlocks) {
		const raw = block[1]?.replace(/\/\*[\s\S]*?\*\//g, '').trim();
		if (!raw || !raw.includes('"@type":"Movie"')) {
			continue;
		}

		try {
			const parsed = JSON.parse(raw);
			const startDate = parsed?.releasedEvent?.[0]?.startDate;
			if (typeof startDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
				return startDate;
			}
		} catch {
			// Ignore malformed blocks and keep looking.
		}
	}

	return '';
}

function parseDisplayReleaseDate(displayDate) {
	const fallbackDateMatch = String(displayDate ?? '').match(/(\d{1,2}) de ([A-Za-zÁÉÍÓÚáéíóú]+) de (\d{4})/);
	if (!fallbackDateMatch) {
		return '';
	}

	const [, dayRaw, monthRaw, yearRaw] = fallbackDateMatch;
	const months = new Map([
		['enero', '01'],
		['febrero', '02'],
		['marzo', '03'],
		['abril', '04'],
		['mayo', '05'],
		['junio', '06'],
		['julio', '07'],
		['agosto', '08'],
		['septiembre', '09'],
		['setiembre', '09'],
		['octubre', '10'],
		['noviembre', '11'],
		['diciembre', '12'],
	]);
	const month = months.get(monthRaw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase());
	if (!month) {
		return '';
	}

	return `${yearRaw}-${month}-${String(dayRaw).padStart(2, '0')}`;
}

function extractOverview(detailHtml) {
	const overviewMatch = detailHtml.match(/<div class=\"overview\"[^>]*>\s*<p>([\s\S]*?)<\/p>/i);
	if (!overviewMatch?.[1]) {
		const descriptionMatch = detailHtml.match(/<meta name=\"description\" content=\"([^\"]+)\"/i);
		return truncateSynopsis(decodeHtml(descriptionMatch?.[1] ?? ''));
	}

	return truncateSynopsis(
		decodeHtml(overviewMatch[1])
			.replace(/<[^>]+>/g, ' ')
			.replace(/\s+/g, ' ')
			.trim(),
	);
}

function truncateSynopsis(value) {
	const normalized = String(value ?? '').replace(/\s+/g, ' ').trim();
	if (normalized.length <= 260) {
		return normalized;
	}

	return `${normalized.slice(0, 257).replace(/\s+\S*$/, '')}...`;
}

function extractBackdropUrl(detailHtml, posterUrl) {
	const ogImages = [...detailHtml.matchAll(/<meta property=\"og:image\" content=\"([^\"]+)\"/g)].map((match) => match[1]);
	const wideOgImage = ogImages.find((value) => /\/w(?:780|1280|1920)/.test(value));
	if (wideOgImage) {
		return normalizeTmdbImage(wideOgImage, 'w780');
	}

	const backdropMatch = detailHtml.match(
		/background-image:\s*url\('(?<url>https:\/\/media\.themoviedb\.org\/t\/p\/w1920_and_h800_multi_faces\/[^']+)'\)/i,
	);
	if (backdropMatch?.groups?.url) {
		return normalizeTmdbImage(backdropMatch.groups.url, 'w780');
	}

	return posterUrl;
}

function extractYoutubeVideoUrl(detailHtml) {
	const trailerMatch = detailHtml.match(/class=\"no_click play_trailer\"[^>]*data-site=\"YouTube\"[^>]*data-id=\"([^\"]+)\"/i);
	if (!trailerMatch?.[1]) {
		return '';
	}

	return `https://www.youtube.com/watch?v=${trailerMatch[1]}`;
}

async function buildUpcomingReleases() {
	const listHtml = await fetchHtml(UPCOMING_URL);
	const cards = extractUpcomingCards(listHtml);
	const releases = [];
	const seenSlugs = new Set();

	for (const card of cards) {
		if (!card.href || !card.title) {
			continue;
		}

		const detailUrl = new URL(card.href, UPCOMING_URL).toString();
		const detailHtml = await fetchHtml(detailUrl);
		const videoUrl = extractYoutubeVideoUrl(detailHtml);
		const releaseDate = extractIsoReleaseDate(detailHtml, card.displayDate);

		if (!videoUrl || !releaseDate) {
			continue;
		}
		const releaseTimestamp = Date.parse(`${releaseDate}T00:00:00Z`);
		if (Number.isNaN(releaseTimestamp) || releaseTimestamp <= TODAY_TIMESTAMP) {
			continue;
		}

		const slug = slugify(card.href.split('/').pop()?.replace(/^\d+-/, '') || card.title);
		if (!slug || seenSlugs.has(slug)) {
			continue;
		}

		seenSlugs.add(slug);
		releases.push({
			slug,
			title: card.title,
			releaseDate,
			videoUrl,
			thumbnailUrl: extractBackdropUrl(detailHtml, card.posterUrl),
			synopsis: extractOverview(detailHtml),
			sourceUrl: detailUrl,
		});

		if (releases.length >= MAX_RELEASES) {
			break;
		}
	}

	return releases;
}

function renderModule(releases) {
	const payload = JSON.stringify(releases, null, '\t');
	const updatedAt = new Date().toISOString();

	return `export interface GeneratedUpcomingRelease {
\tslug: string;
\ttitle: string;
\treleaseDate: string;
\tvideoUrl: string;
\tthumbnailUrl: string;
\tsynopsis?: string;
\tsourceUrl: string;
}

export const GENERATED_UPCOMING_RELEASES_UPDATED_AT = ${JSON.stringify(updatedAt)};

export const GENERATED_UPCOMING_RELEASES: GeneratedUpcomingRelease[] = ${payload};
`;
}

async function main() {
	let releases = [];

	try {
		releases = await buildUpcomingReleases();
	} catch (error) {
		if (STRICT_MODE) {
			throw error;
		}

		console.warn(
			`[upcomingReleases] No se pudo consultar la fuente remota. Se conserva el archivo generado existente. ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
		await ensureOutputFile();
		return;
	}

	if (releases.length === 0) {
		if (STRICT_MODE) {
			throw new Error('No se pudieron generar próximos estrenos automáticos.');
		}

		console.warn(
			'[upcomingReleases] No se pudieron generar próximos estrenos automáticos. Se conserva el archivo generado existente.',
		);
		await ensureOutputFile();
		return;
	}

	await writeFile(OUTPUT_PATH, renderModule(releases), 'utf8');
	console.log(`[upcomingReleases] ${releases.length} estrenos guardados en ${path.relative(ROOT_DIR, OUTPUT_PATH)}`);
}

async function ensureOutputFile() {
	try {
		await access(OUTPUT_PATH);
	} catch {
		await writeFile(OUTPUT_PATH, renderModule([]), 'utf8');
		console.warn(`[upcomingReleases] Se creó ${path.relative(ROOT_DIR, OUTPUT_PATH)} vacío para permitir el build.`);
	}
}

main().catch((error) => {
	console.error('[upcomingReleases] Error:', error);
	process.exitCode = 1;
});
