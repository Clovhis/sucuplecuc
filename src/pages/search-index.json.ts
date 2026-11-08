import type { APIRoute } from 'astro';
import { getLegacyHomeSearchIndexJson } from '../lib/home-search-data';

export const prerender = true;
export const GET: APIRoute = () => new Response(getLegacyHomeSearchIndexJson(), {
	headers: { 'Content-Type': 'application/json; charset=utf-8' },
});
