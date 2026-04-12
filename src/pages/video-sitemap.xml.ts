import type { APIRoute } from 'astro';
import { stat } from 'node:fs/promises';
import {
	getMovieTrailerPath,
	getMovies,
	getYoutubeEmbedUrl,
	getYoutubeThumbnailUrl,
} from '../lib/movies';
import { SITE_URL } from '../lib/seo';

export const prerender = true;

function toAbsoluteUrl(pathname: string): string {
	return new URL(pathname, SITE_URL).toString();
}

function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

function toLastMod(value: Date): string {
	return value.toISOString();
}

async function getFileLastMod(pathname: string): Promise<string | undefined> {
	try {
		const fileStats = await stat(pathname);
		return toLastMod(fileStats.mtime);
	} catch {
		return undefined;
	}
}

export const GET: APIRoute = async () => {
	const trailerEntries = await Promise.all(
		getMovies()
			.filter((movie) => String(movie.trailerYoutubeId ?? '').trim().length > 0)
			.map(async (movie) => ({
				loc: toAbsoluteUrl(getMovieTrailerPath(movie.slug)),
				lastmod: await getFileLastMod(`src/data/movies/${movie.slug}.json`),
				thumbnailUrl: getYoutubeThumbnailUrl(movie.trailerYoutubeId),
				playerUrl: getYoutubeEmbedUrl(movie.trailerYoutubeId),
				title: `Trailer oficial de ${movie.title}`,
				description: `Mirá el trailer oficial de ${movie.title} (${movie.year}) en la watch page de Cine Posta.`,
			})),
	);

	const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n${trailerEntries
		.map((entry) => {
			const lastmod = entry.lastmod ? `\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : '';
			return `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>${lastmod}\n    <video:video>\n      <video:thumbnail_loc>${escapeXml(entry.thumbnailUrl)}</video:thumbnail_loc>\n      <video:title>${escapeXml(entry.title)}</video:title>\n      <video:description>${escapeXml(entry.description)}</video:description>\n      <video:player_loc allow_embed="yes">${escapeXml(entry.playerUrl)}</video:player_loc>\n    </video:video>\n  </url>`;
		})
		.join('\n')}\n</urlset>\n`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
		},
	});
};
