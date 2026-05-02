import type { APIRoute } from 'astro';
import { getMovieTrailerPath, getMovies, getYoutubeEmbedUrl, getYoutubeThumbnailUrl } from '../lib/movies';
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

export const GET: APIRoute = () => {
	const trailerEntries = getMovies()
		.filter((movie) => String(movie.trailerYoutubeId ?? '').trim().length > 0)
		.map((movie) => {
			const watchPageUrl = toAbsoluteUrl(getMovieTrailerPath(movie.slug));
			const playerUrl = getYoutubeEmbedUrl(movie.trailerYoutubeId);
			const thumbnailUrl = getYoutubeThumbnailUrl(movie.trailerYoutubeId);
			const videoTitle = `Trailer oficial de ${movie.title} (${movie.year})`;
			const videoDescription = `Mirá el trailer oficial de ${movie.title} (${movie.year}) y volvés a la reseña completa en Cine Posta.`;

			if (!playerUrl || !thumbnailUrl) {
				return '';
			}

			return `  <url>\n    <loc>${escapeXml(watchPageUrl)}</loc>\n    <video:video>\n      <video:thumbnail_loc>${escapeXml(thumbnailUrl)}</video:thumbnail_loc>\n      <video:title>${escapeXml(videoTitle)}</video:title>\n      <video:description>${escapeXml(videoDescription)}</video:description>\n      <video:player_loc>${escapeXml(playerUrl)}</video:player_loc>\n      <video:requires_subscription>no</video:requires_subscription>\n    </video:video>\n  </url>`;
		})
		.filter(Boolean)
		.join('\n');

	const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n${trailerEntries}\n</urlset>\n`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
		},
	});
};
