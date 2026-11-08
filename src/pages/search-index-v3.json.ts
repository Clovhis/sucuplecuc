import type { APIRoute } from 'astro';
import { getHomeSearchIndexJson } from '../lib/home-search-data';

export const GET: APIRoute = () => new Response(getHomeSearchIndexJson(), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
