import type { APIRoute } from 'astro';
import { getAdsTxtContents } from '../lib/adsense';

export const prerender = true;

export const GET: APIRoute = () =>
	new Response(getAdsTxtContents(), {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
		},
	});
