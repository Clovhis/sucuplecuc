import type { APIRoute } from 'astro';
import { getV2HomeSearchIndexJson } from '../lib/home-search-data';

export const prerender = true;
export const GET: APIRoute = () => new Response(getV2HomeSearchIndexJson(), {
	headers: { 'Content-Type': 'application/json; charset=utf-8' },
});
