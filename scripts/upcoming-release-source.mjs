const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
export const UPCOMING_SOURCE_URL = 'https://www.cinesargentinos.com.ar/proximos/todos/1/';

export function decodeHtml(value = '') {
	return String(value).replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
		.replace(/&(?:amp|quot|apos|lt|gt|ntilde|aacute|eacute|iacute|oacute|uacute);/gi, (entity) => ({
			'&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>', '&ntilde;': 'ñ', '&aacute;': 'á', '&eacute;': 'é', '&iacute;': 'í', '&oacute;': 'ó', '&uacute;': 'ú',
		}[entity.toLowerCase()]));
}

export function extractArgentinaReleases(html) {
	const markers = [...html.matchAll(/<div class="subTitulo">\s*([^<]+)\s*<\/div>/g)].map((m) => {
		const date = decodeHtml(m[1]).match(/(\d{1,2}) de (\w+) de (\d{4})/i);
		const month = date && MONTHS.indexOf(date[2].toLowerCase().replace('setiembre', 'septiembre')) + 1;
		return { index: m.index, date: date && month ? `${date[3]}-${String(month).padStart(2, '0')}-${date[1].padStart(2, '0')}` : '' };
	});
	const entries = [...html.matchAll(/<div class="(?:ultimo )?estrenoDelDia"[\s\S]*?(?=<div class="(?:ultimo )?estrenoDelDia"|<div class="subTitulo"|<div class="paginacion"|$)/g)];
	return entries.flatMap((entry) => {
		const date = markers.filter((m) => m.index <= entry.index).at(-1)?.date;
		const title = entry[0].match(/<h2 class="lblTitulo"><a href="([^"]+)"[^>]*>([^<]+)<\/a><\/h2>/);
		if (!date || !title) return [];
		const sourceUrl = new URL(title[1], UPCOMING_SOURCE_URL);
		const id = sourceUrl.pathname.match(/^\/pelicula\/(\d+)-[^/]+\/?$/)?.[1];
		if (!id || sourceUrl.hostname !== 'www.cinesargentinos.com.ar') return [];
		return [{ title: decodeHtml(title[2]).trim(), releaseDate: date, sourceUrl: sourceUrl.toString(), sourceId: id }];
	});
}

/** The exact film's Videos tab supplies the identity; no global title search. */
export function extractYoutubeIds(html) {
	return [...new Set([...html.matchAll(/(?:youtube(?:-nocookie)?\.com\/(?:v\/|embed\/|watch\?v=)|youtu\.be\/)([\w-]{11})(?=[?&'"\s<>/]|$)/g)].map((m) => m[1]))];
}

export async function findEmbeddableTrailer(ids) {
	for (const id of ids) {
		const videoUrl = `https://www.youtube.com/watch?v=${id}`;
		let lastError;
		for (let attempt = 0; attempt < 2; attempt++) {
			try {
				const response = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(videoUrl)}`, { redirect: 'error', signal: AbortSignal.timeout(15_000) });
				if ([401, 403, 404].includes(response.status)) break;
				if (!response.ok) throw new Error(`YouTube oEmbed HTTP ${response.status}`);
				const metadata = await response.json();
				if (metadata.type === 'video' && metadata.title && metadata.author_name) return { id, videoUrl, title: metadata.title, channel: metadata.author_name };
				break;
			} catch (error) { lastError = error; }
		}
		if (lastError) console.warn(`[trailers] ${id}: ${lastError.message}`);
	}
	return null;
}

export async function fetchSource(url, options = {}) {
	const parsed = new URL(url);
	if (parsed.protocol !== 'https:' || parsed.hostname !== 'www.cinesargentinos.com.ar') throw new Error(`Untrusted release source: ${url}`);
	let lastError;
	for (let attempt = 0; attempt < 2; attempt++) {
		try {
			const response = await fetch(url, { ...options, redirect: 'error', signal: AbortSignal.timeout(20_000), headers: { 'user-agent': 'Mozilla/5.0 (compatible; CinePostaBot/1.0; +https://www.cineposta.com.ar)', ...options.headers } });
			if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
			return await response.text();
		} catch (error) { lastError = error; }
	}
	throw lastError;
}
