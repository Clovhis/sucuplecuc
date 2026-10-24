// Publish-time check: country is fixed to Argentina and identity requires title + year.
const QUERY = `query StreamingForX($searchQuery: String!) {
  popularTitles(country: AR, first: 10, filter: { searchQuery: $searchQuery, objectTypes: [MOVIE] }) {
    edges { node { ... on Movie {
      content(country: AR, language: es) { title originalReleaseYear fullPath }
      offers(country: AR, platform: WEB) { monetizationType package { clearName } }
    } } }
  }
}`;

const PROVIDERS = new Map([
	['netflix', 'Netflix'], ['amazon prime video', 'Prime Video'], ['amazon video', 'Prime Video'],
	['hbo max', 'HBO Max'], ['max', 'HBO Max'], ['disney plus', 'Disney Plus'],
	['paramount plus', 'Paramount Plus'], ['apple tv', 'Apple TV'], ['apple tv store', 'Apple TV'],
	['crunchyroll', 'Crunchyroll'], ['mercado play', 'Mercado Play'], ['cine ar', 'CINE.AR'],
	['flow', 'Flow'], ['dgo', 'DGO'],
]);

function normalize(value) {
	return String(value ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/\+/gu, ' plus ').replace(/[^\p{Letter}\p{Number}]+/gu, ' ').trim();
}

export function streamingAvailability(movie, nodes, checkedAt = new Date().toISOString()) {
	const names = [movie.title, movie.originalTitle].filter(Boolean).map(normalize);
	const matches = nodes.filter(({ content }) => content?.originalReleaseYear === movie.year && names.includes(normalize(content.title)) && content.fullPath?.startsWith('/ar/pelicula/'));
	if (matches.length !== 1) return null;
	const match = matches[0];
	const offers = (match.offers ?? []).map((offer) => ({ platform: PROVIDERS.get(normalize(offer.package?.clearName)), type: offer.monetizationType })).filter(({ platform }) => platform);
	// Exact package names deliberately exclude add-on channels and bundles.
	const subscription = offers.filter(({ type }) => ['FLATRATE', 'FLATRATE_AND_BUY', 'FREE', 'ADS', 'FAST'].includes(type));
	const transactional = offers.filter(({ type }) => ['RENT', 'BUY'].includes(type));
	const preferred = subscription.length ? subscription : transactional;
	if (!preferred.length) return null;
	return { country: 'AR', source: `https://www.justwatch.com${match.content.fullPath}`, checkedAt, kind: subscription.length ? 'subscription' : 'transactional', platforms: [...new Set(preferred.map(({ platform }) => platform))].slice(0, 2) };
}

export async function verifyStreamingAvailability(movie, request = fetch) {
	const response = await request('https://apis.justwatch.com/graphql', {
		method: 'POST', headers: { 'content-type': 'application/json' }, signal: AbortSignal.timeout(20_000),
		body: JSON.stringify({ query: QUERY, variables: { searchQuery: movie.originalTitle || movie.title } }),
	});
	if (!response.ok) throw new Error(`JustWatch AR respondió HTTP ${response.status}; no se publica con evidencia sin confirmar.`);
	const payload = await response.json();
	if (payload.errors?.length || !Array.isArray(payload.data?.popularTitles?.edges)) throw new Error('JustWatch AR devolvió una respuesta inválida; no se publica.');
	return streamingAvailability(movie, payload.data.popularTitles.edges.map(({ node }) => node));
}
