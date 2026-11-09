export function normalize(value) {
	return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}

export function selectMovie(movie, results) {
	if (!Array.isArray(results)) return null;
	const titles = new Set([movie.originalTitle, movie.title].map(normalize).filter(Boolean));
	const matches = results.filter((result) =>
		result && typeof result === 'object' &&
		Number.isSafeInteger(result.id) && result.id > 0 &&
		Number(String(result.release_date || '').slice(0, 4)) === Number(movie.year) &&
		[result.original_title, result.title].some((title) => titles.has(normalize(title))),
	);
	return matches.length === 1 ? matches[0] : null;
}

export function matchCredits(movie, credits, people, externalIds, tmdbMovieId) {
	if (!Array.isArray(movie.mainCast) || !Number.isSafeInteger(tmdbMovieId) || tmdbMovieId <= 0) {
		return { status: 'pending', reason: 'ficha-o-identificador-invalido', credits: [] };
	}
	const directors = (credits.crew ?? []).filter((person) => person && person.job === 'Director');
	if (!directors.some((person) => normalize(person.name) === normalize(movie.director))) {
		return { status: 'pending', reason: 'director-no-coincide', credits: [] };
	}
	const matches = [];
	const imdbCounts = new Map();
	for (const actor of movie.mainCast) {
		const imdb = people[actor]?.imdbId;
		if (typeof imdb === 'string' && imdb) imdbCounts.set(imdb, (imdbCounts.get(imdb) ?? 0) + 1);
	}
	for (const actor of movie.mainCast) {
		const imdb = people[actor]?.imdbId;
		if (!normalize(actor) || !imdb || imdbCounts.get(imdb) !== 1) continue;
		const candidates = (credits.cast ?? []).filter((person) =>
			person && Number.isSafeInteger(person.id) && person.id > 0 &&
			normalize(person.name) === normalize(actor) &&
			externalIds[String(person.id)] === imdb &&
			typeof person.character === 'string' && person.character.trim(),
		);
		if (candidates.length !== 1) continue;
		const candidate = candidates[0];
		matches.push({ actor, character: candidate.character.trim(), tmdbMovieId, tmdbPersonId: candidate.id });
	}
	if (matches.length < 2 || new Set(matches.map((entry) => entry.actor)).size !== matches.length || new Set(matches.map((entry) => entry.tmdbPersonId)).size !== matches.length) {
		return { status: 'pending', reason: 'menos-de-dos-identidades-confirmadas', credits: [] };
	}
	return { status: 'verified', credits: matches };
}
