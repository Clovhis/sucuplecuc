import type { APIRoute } from 'astro';
import { getMoviePath, getMovies } from '../lib/movies';
import { ABOUT_PATH, SITE_URL } from '../lib/seo';

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
	const urls = ['/', ABOUT_PATH, ...getMovies().map((movie) => getMoviePath(movie.slug))];
	const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
		.map((pathname) => `  <url><loc>${escapeXml(toAbsoluteUrl(pathname))}</loc></url>`)
		.join('\n')}\n</urlset>\n`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
		},
	});
};
