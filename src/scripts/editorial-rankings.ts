type EditorialRankingMovie = {
	title: string;
	year: number;
	url: string;
	verdictLabel: string;
};

type EditorialRankingPool = {
	id: string;
	movies: EditorialRankingMovie[];
};

type EditorialRankingSelection = {
	id: string;
	movies: EditorialRankingMovie[];
};

const rankingDataElement = document.getElementById('editorial-ranking-data');

if (rankingDataElement?.textContent) {
	initEditorialRankings(rankingDataElement.textContent);
}

function initEditorialRankings(serializedRankings: string): void {
	let rankings: unknown;

	try {
		rankings = JSON.parse(serializedRankings);
	} catch {
		return;
	}

	if (!isRankingPoolList(rankings)) {
		return;
	}

	let selectedRankings = pickRankings(rankings);
	const storageKey = 'cineposta:editorial-rankings:last-selection';
	let lastSignature = '';

	try {
		lastSignature = window.sessionStorage.getItem(storageKey) ?? '';
	} catch {
		lastSignature = '';
	}

	for (let attempt = 0; attempt < 8 && getSignature(selectedRankings) === lastSignature; attempt += 1) {
		selectedRankings = pickRankings(rankings);
	}

	try {
		window.sessionStorage.setItem(storageKey, getSignature(selectedRankings));
	} catch {
		// Some browsers block sessionStorage; randomizing still works without the repeat guard.
	}

	renderRankings(selectedRankings);
}

function isRankingPoolList(value: unknown): value is EditorialRankingPool[] {
	return (
		Array.isArray(value) &&
		value.every(
			(ranking) =>
				isRecord(ranking) &&
				typeof ranking.id === 'string' &&
				Array.isArray(ranking.movies) &&
				ranking.movies.every(isRankingMovie),
		)
	);
}

function isRankingMovie(value: unknown): value is EditorialRankingMovie {
	return (
		isRecord(value) &&
		typeof value.title === 'string' &&
		typeof value.year === 'number' &&
		typeof value.url === 'string' &&
		typeof value.verdictLabel === 'string'
	);
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function pickRankings(rankings: EditorialRankingPool[]): EditorialRankingSelection[] {
	const usedUrls = new Set<string>();

	return rankings.map((ranking) => {
		const picked: EditorialRankingMovie[] = [];

		for (const movie of shuffle(ranking.movies)) {
			if (usedUrls.has(movie.url)) {
				continue;
			}

			picked.push(movie);
			usedUrls.add(movie.url);

			if (picked.length === 3) {
				break;
			}
		}

		return {
			id: ranking.id,
			movies: picked,
		};
	});
}

function shuffle<T>(items: T[]): T[] {
	const shuffled = [...items];

	for (let index = shuffled.length - 1; index > 0; index -= 1) {
		const swapIndex = getRandomInt(index + 1);
		[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
	}

	return shuffled;
}

function getRandomInt(max: number): number {
	if (max <= 1) {
		return 0;
	}

	const values = new Uint32Array(1);

	if (window.crypto?.getRandomValues) {
		window.crypto.getRandomValues(values);
		return values[0] % max;
	}

	return Math.floor(Math.random() * max);
}

function getSignature(selection: EditorialRankingSelection[]): string {
	return selection.map((ranking) => `${ranking.id}:${ranking.movies.map((movie) => movie.url).join(',')}`).join('|');
}

function renderRankings(rankings: EditorialRankingSelection[]): void {
	for (const ranking of rankings) {
		if (ranking.movies.length < 2) {
			continue;
		}

		const list = document.querySelector<HTMLOListElement>(`[data-editorial-ranking-list="${ranking.id}"]`);
		const card = document.querySelector<HTMLElement>(`[data-editorial-ranking-card="${ranking.id}"]`);

		if (!list) {
			continue;
		}

		list.replaceChildren();

		for (const [entryIndex, entry] of ranking.movies.entries()) {
			list.append(createRankingItem(entry, entryIndex));
		}

		const badge = card?.querySelector<HTMLElement>('[data-editorial-ranking-count]');

		if (badge) {
			badge.textContent = `${ranking.movies.length} opciones`;
		}
	}
}

function createRankingItem(entry: EditorialRankingMovie, entryIndex: number): HTMLLIElement {
	const item = document.createElement('li');
	const link = document.createElement('a');
	const position = document.createElement('span');
	const movie = document.createElement('span');
	const title = document.createElement('span');
	const meta = document.createElement('small');

	link.href = entry.url;
	position.className = 'editorial-rankings__position';
	position.setAttribute('aria-hidden', 'true');
	position.textContent = String(entryIndex + 1).padStart(2, '0');
	movie.className = 'editorial-rankings__movie';
	title.textContent = entry.title;
	meta.textContent = `${entry.year} · ${entry.verdictLabel}`;

	movie.append(title, meta);
	link.append(position, movie);
	item.append(link);

	return item;
}
