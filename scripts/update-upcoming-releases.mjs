import { access, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT_PATH = path.join(ROOT_DIR, 'src/data/upcomingReleases.generated.ts');
const TMDB_LANGUAGE = 'es-AR';
const TMDB_REGION = 'AR';
const TMDB_ORIGIN = 'https://www.themoviedb.org';
const CINES_ARGENTINOS_UPCOMING_URL = 'https://www.cinesargentinos.com.ar/proximos/todos/1/';
const MAX_SOURCE_ITEMS = 24;
const MAX_RELEASES = 16;
const STRICT_MODE = process.env.UPCOMING_RELEASES_STRICT === '1';
const TODAY_TIMESTAMP = Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate());
const REQUEST_HEADERS = {
	'user-agent':
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
	'accept-language': 'es-AR,es;q=0.9,en;q=0.8',
};

// Las fichas de TMDB sin traducción suelen devolver el texto original en inglés,
// aun cuando se pide la página en español. Estas versiones se revisaron para los
// estrenos que ya están publicados; para el resto se usa sólo una sinopsis que
// TMDB entregue efectivamente en castellano.
const CURATED_SPANISH_SYNOPSES = new Map([
	[
		'deep-water',
		'Un grupo de pasajeros internacionales que viaja de Los Ángeles a Shanghái debe aterrizar de emergencia en aguas infestadas de tiburones. Para salir con vida del avión que se hunde, tendrán que dejar de lado sus diferencias y organizarse.',
	],
	[
		'spider-man-brand-new-day',
		'Peter Parker pelea contra el crimen como Spider-Man en un mundo que ya no lo recuerda. Ver a sus viejos amigos seguir adelante sin él lo empuja a un cambio que quizá no pueda controlar.',
	],
	[
		'the-invite',
		'El matrimonio de Joe y Angela atraviesa un momento frágil. Cuando invitan a cenar a sus enigmáticos vecinos de arriba, la noche toma un rumbo inesperado.',
	],
	[
		'pressure',
		'En las 72 horas previas al Día D, el general Dwight D. Eisenhower y el capitán James Stagg enfrentan una decisión imposible: lanzar la invasión marítima más peligrosa de la historia o arriesgar el destino del mundo libre.',
	],
	[
		'yon-lapsi',
		'En un bosque finlandés, Saga y su marido Jon empiezan una nueva etapa como padres. Pero una sospecha inquietante sobre su bebé recién nacido se instala en Saga y abre una grieta entre los dos.',
	],
]);

// TMDB puede devolver una carga regional del tráiler que queda bloqueada en
// Argentina. Estas excepciones conservan el tráiler oficial del distribuidor
// al regenerar el archivo de próximos estrenos.
const CURATED_TRAILER_IDS = new Map([
	['one-night-only', 'JRG244IfrRE'],
]);

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
		/<a class="flex w-full"[^>]*href="(?<href>\/movie\/[^\"]+)"[\s\S]*?<img alt="(?<alt>[^\"]+)" class="poster w-full block"[^>]*\bsrc="(?<img>[^\"]+)"[\s\S]*?<h2 class="font-semibold [^\"]*m-0 whitespace-normal">(?:<span>)?(?<title>[^<]+)(?:<\/span>)?<\/h2>/g;

	return [...html.matchAll(cardPattern)].map((match) => ({
		href: match.groups?.href ?? '',
		title: decodeHtml(match.groups?.title ?? match.groups?.alt ?? ''),
		posterUrl: normalizeTmdbImage(match.groups?.img ?? '', 'w500'),
	}));
}

function getCinesArgentinosReleaseDate(value) {
	const normalized = decodeHtml(value).replace(/\s+/g, ' ').trim();
	return parseDisplayReleaseDate(normalized.replace(/^(?:lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)\s+/i, ''));
}

function extractCinesArgentinosReleases(html) {
	const dateMarkers = [...html.matchAll(/<div class="subTitulo">\s*(?<date>[^<]+?)\s*<\/div>/g)]
		.map((match) => ({
			index: match.index ?? 0,
			releaseDate: getCinesArgentinosReleaseDate(match.groups?.date ?? ''),
		}))
		.filter((marker) => marker.releaseDate);
	const entryPattern =
		/<div class="(?:ultimo )?estrenoDelDia"[\s\S]*?(?=<div class="(?:ultimo )?estrenoDelDia"|<div class="subTitulo"|<div class="paginacion")/g;
	const releases = [];

	for (const entry of html.matchAll(entryPattern)) {
		const releaseDate = [...dateMarkers].reverse().find((marker) => marker.index <= (entry.index ?? 0))?.releaseDate;
		const titleMatch = entry[0].match(/<h2 class="lblTitulo"><a href="(?<href>[^"]+)"[^>]*>(?<title>[^<]+)<\/a><\/h2>/);
		const originalTitleMatch = entry[0].match(/T[ií]tulo original:\s*<\/span>\s*<span class="def">(?<title>[^<]+)<\/span>/);

		if (!releaseDate || !titleMatch?.groups?.href || !titleMatch.groups.title) {
			continue;
		}

		const title = decodeHtml(titleMatch.groups.title).trim();
		const originalTitle = decodeHtml(originalTitleMatch?.groups?.title ?? title).trim();
		releases.push({
			title,
			originalTitle,
			releaseDate,
			sourceUrl: new URL(titleMatch.groups.href, CINES_ARGENTINOS_UPCOMING_URL).toString(),
		});
	}

	return releases;
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

function looksLikeEnglishSynopsis(value) {
	const normalized = ` ${String(value ?? '').toLowerCase().replace(/[^a-z]+/g, ' ')} `;
	const englishMarkers = [
		' the ',
		' and ',
		' is ',
		' are ',
		' with ',
		' when ',
		' from ',
		' after ',
		' into ',
		' their ',
		' they ',
		' his ',
		' her ',
	];
	return englishMarkers.filter((marker) => normalized.includes(marker)).length >= 2;
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

async function findTmdbMovieForCinesArgentinosRelease(release) {
	const searchUrl = new URL('/search/movie', TMDB_ORIGIN);
	searchUrl.searchParams.set('query', release.originalTitle);
	searchUrl.searchParams.set('language', TMDB_LANGUAGE);
	searchUrl.searchParams.set('region', TMDB_REGION);
	const cards = extractUpcomingCards(await fetchHtml(searchUrl.toString()));
	const expectedTitle = slugify(release.originalTitle);
	return cards.find((card) => slugify(card.title) === expectedTitle) ?? cards[0] ?? null;
}

async function buildUpcomingReleases() {
	const cinesArgentinosHtml = await fetchHtml(CINES_ARGENTINOS_UPCOMING_URL);
	const cinesArgentinosReleases = extractCinesArgentinosReleases(cinesArgentinosHtml);
	if (cinesArgentinosReleases.length === 0) {
		throw new Error('No se pudieron leer los próximos estrenos de cine en Argentina.');
	}

	const releases = [];
	const seenSlugs = new Set();

	for (const cinesArgentinosRelease of cinesArgentinosReleases.slice(0, MAX_SOURCE_ITEMS)) {
		const releaseTimestamp = Date.parse(`${cinesArgentinosRelease.releaseDate}T00:00:00Z`);
		if (Number.isNaN(releaseTimestamp) || releaseTimestamp <= TODAY_TIMESTAMP) {
			continue;
		}

		const card = await findTmdbMovieForCinesArgentinosRelease(cinesArgentinosRelease);
		if (!card?.href || !card.title) {
			continue;
		}

		const detailUrl = new URL(card.href, TMDB_ORIGIN);
		detailUrl.searchParams.set('language', TMDB_LANGUAGE);
		detailUrl.searchParams.set('region', TMDB_REGION);
		const detailHtml = await fetchHtml(detailUrl);
		const slug = slugify(detailUrl.pathname.split('/').pop()?.replace(/^\d+-/, '') || card.title);
		if (!slug || seenSlugs.has(slug)) {
			continue;
		}

		const curatedTrailerId = CURATED_TRAILER_IDS.get(slug);
		const videoUrl = curatedTrailerId
			? `https://www.youtube.com/watch?v=${curatedTrailerId}`
			: extractYoutubeVideoUrl(detailHtml);
		const releaseDate = cinesArgentinosRelease.releaseDate;

		if (!videoUrl || !releaseDate) {
			continue;
		}

		seenSlugs.add(slug);
		const extractedSynopsis = extractOverview(detailHtml);
		const synopsis = CURATED_SPANISH_SYNOPSES.get(slug) ??
			(looksLikeEnglishSynopsis(extractedSynopsis) ? undefined : extractedSynopsis || undefined);

		releases.push({
			slug,
			title: cinesArgentinosRelease.title,
			releaseDate,
			videoUrl,
			thumbnailUrl: extractBackdropUrl(detailHtml, card.posterUrl),
			synopsis,
			sourceUrl: cinesArgentinosRelease.sourceUrl,
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

