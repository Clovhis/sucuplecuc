import type { HomeMovieRecord } from '../types/home-catalog';

// Versioned transport only. The application still uses named records; repeated
// cards and field names do not need to cross the network for every movie.
const fields = ['slug', 'title', 'year', 'searchable', 'normalizedOriginalTitle', 'searchAliases', 'searchDirector', 'searchCast', 'releaseTimestamp', 'recentPremiere', 'score', 'url', 'posterUrl', 'meta', 'cast', 'platforms', 'genres', 'subgenres', 'primaryGenre'] as const;
type WireValue = string | string[] | number | boolean | null;
export interface HomeSearchPayload {
	version: 2;
	cards: HomeMovieRecord['card'][];
	movies: WireValue[][];
}
const normalize = (value: string): string => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export function encodeHomeSearchIndex(records: HomeMovieRecord[]): HomeSearchPayload {
	const cards: HomeMovieRecord['card'][] = [];
	const cardIds = new Map<string, number>();
	const movies = records.map((record) => {
		const key = JSON.stringify(record.card);
		let cardId = cardIds.get(key);
		if (cardId === undefined) { cardId = cards.length; cards.push(record.card); cardIds.set(key, cardId); }
		return [...fields.map((field) => record[field]), cardId];
	});
	return { version: 2, cards, movies };
}

export function decodeHomeSearchIndex(payload: unknown): HomeMovieRecord[] {
	// Read the first MVP format too: useful for saved snapshots and rolling caches.
	if (Array.isArray(payload)) return payload as HomeMovieRecord[];
	const data = payload as HomeSearchPayload;
	if (data?.version !== 2 || !Array.isArray(data.cards) || !Array.isArray(data.movies)) throw new Error('Unsupported search index');
	return data.movies.map((row) => {
		if (!Array.isArray(row) || row.length !== fields.length + 1) throw new Error('Invalid search index row');
		const record = Object.fromEntries(fields.map((field, i) => [field, row[i]])) as unknown as HomeMovieRecord;
		const cardId = row[fields.length];
		if (!Number.isInteger(cardId) || !data.cards[Number(cardId)] || typeof record.title !== 'string' || typeof record.meta !== 'string' || typeof record.cast !== 'string') throw new Error('Invalid search card');
		return { ...record, normalizedTitle: normalize(record.title), normalizedMeta: normalize(`${record.meta} ${record.cast}`), card: data.cards[Number(cardId)] };
	});
}
