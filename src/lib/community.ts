export const COMMUNITY_PATH = '/comunidad/';
export const COMMUNITY_THREAD_ID = 'cineposta-la-sala-principal';
export const COMMUNITY_MESSAGE_LIMIT = 200;

/** Public switches only; credentials remain in Supabase and are never committed. */
export function getCommunityCommentsConfig() {
	return {
		enabled: String(import.meta.env.PUBLIC_COMMUNITY_ENABLED ?? '').trim().toLowerCase() === 'true',
		threadId: COMMUNITY_THREAD_ID,
		turnstileSiteKey: String(import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? '').trim(),
	};
}

/** Reserved for a future per-movie thread using a validated internal slug. */
export function getMovieCommunityThreadId(movieSlug: string): string {
	return `cineposta-pelicula-${movieSlug}`;
}

export function getMovieCommunityPath(movieSlug: string): string {
	return `/comunidad/peliculas/${encodeURIComponent(movieSlug)}/`;
}
