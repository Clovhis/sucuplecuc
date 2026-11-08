// Only loaded by the offline integration test; no network access.
globalThis.fetch = async (input) => {
	const url = new URL(input);
	if (process.env.CHARACTER_FIXTURE_FAILURE === '1') return new Response('{}', { status: 503, headers: { 'Retry-After': '61' } });
	let data;
	if (url.pathname === '/3/search/movie') data = { total_pages: 1, results: [{ id: 42, title: 'Example', original_title: 'Example', release_date: '2001-01-01' }] };
	else if (url.pathname === '/3/movie/42/credits') data = { crew: [{ job: 'Director', name: 'A Director' }], cast: [{ id: 1, name: 'Actor One', character: 'Hero' }, { id: 2, name: 'Actor Two', character: 'Friend' }] };
	else if (url.pathname === '/3/person/1/external_ids') data = { imdb_id: 'nm1' };
	else if (url.pathname === '/3/person/2/external_ids') data = { imdb_id: 'nm2' };
	else throw new Error('Unexpected offline fixture request');
	return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
