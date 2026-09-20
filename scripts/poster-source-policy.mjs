const BLOCKED_POSTER_HOSTS = Object.freeze([
	'cinesargentinos.com.ar',
]);

export const MIN_POSTER_SOURCE_WIDTH = 720;
export const MIN_POSTER_SOURCE_HEIGHT = 1000;

function normalizedHostname(value) {
	try {
		return new URL(value).hostname.toLowerCase().replace(/\.$/, '');
	} catch {
		return '';
	}
}

export function blockedPosterHost(value) {
	const hostname = normalizedHostname(value);
	return BLOCKED_POSTER_HOSTS.find((blocked) => hostname === blocked || hostname.endsWith(`.${blocked}`)) ?? null;
}

export function assertPosterSourceAllowed(value) {
	const blocked = blockedPosterHost(value);
	if (blocked) {
		throw new Error(`blocked-poster-source: ${blocked} adds low-quality Argentine flag overlays; use official/distributor key art or a reputable poster archive`);
	}
}

export function assertPosterSourceDimensions(metadata) {
	const width = Number(metadata?.width ?? 0);
	const height = Number(metadata?.height ?? 0);
	if (width < MIN_POSTER_SOURCE_WIDTH || height < MIN_POSTER_SOURCE_HEIGHT) {
		throw new Error(`low-resolution-poster-source: requires at least ${MIN_POSTER_SOURCE_WIDTH}x${MIN_POSTER_SOURCE_HEIGHT}, got ${width || '?'}x${height || '?'}`);
	}
}
