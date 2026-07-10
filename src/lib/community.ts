export const COMMUNITY_PATH = '/comunidad/';
export const COMMUNITY_THREAD_ID = 'cineposta-la-sala-principal';

/**
 * Public configuration for the embedded comment provider. A FastComments tenant
 * ID identifies the public site integration; it is not an API key or a secret.
 */
export function getCommunityCommentsConfig() {
	const tenantId = String(import.meta.env.PUBLIC_FASTCOMMENTS_TENANT_ID ?? '').trim();
	const requested = String(import.meta.env.PUBLIC_FASTCOMMENTS_ENABLED ?? '').trim().toLowerCase() === 'true';

	return { enabled: requested && tenantId.length > 0, tenantId, threadId: COMMUNITY_THREAD_ID };
}

/** Reserved for a future per-movie thread using a validated internal slug. */
export function getMovieCommunityThreadId(movieSlug: string): string {
	return `cineposta-pelicula-${movieSlug}`;
}
