import type { APIRoute } from 'astro';

export const prerender = true;

export const GET: APIRoute = () =>
	new Response('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n</urlset>\n', {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
		},
	});
