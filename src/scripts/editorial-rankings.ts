type EditorialRankingMovie = {
	title: string;
	year: number;
	url: string;
	verdictLabel: string;
	meterKind: 'explosiometro' | 'cagazometro' | 'jajametro' | 'lagrimometro';
	meterLabel: string;
	meterScore: number;
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
		typeof value.verdictLabel === 'string' &&
		isMeterKind(value.meterKind) &&
		typeof value.meterLabel === 'string' &&
		typeof value.meterScore === 'number'
	);
}

function isMeterKind(value: unknown): value is EditorialRankingMovie['meterKind'] {
	return value === 'explosiometro' || value === 'cagazometro' || value === 'jajametro' || value === 'lagrimometro';
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

		for (const entry of ranking.movies) {
			list.append(createRankingItem(entry));
		}

		const badge = card?.querySelector<HTMLElement>('[data-editorial-ranking-count]');

		if (badge) {
			badge.textContent = `${ranking.movies.length} opciones`;
		}
	}
}

function createRankingItem(entry: EditorialRankingMovie): HTMLLIElement {
	const item = document.createElement('li');
	const link = document.createElement('a');
	const movie = document.createElement('span');
	const title = document.createElement('span');
	const meta = document.createElement('small');
	const meter = document.createElement('span');
	const meterCopy = document.createElement('span');
	const meterLabel = document.createElement('span');
	const meterScore = document.createElement('strong');
	const meterTrack = document.createElement('span');
	const meterFill = document.createElement('span');

	link.href = entry.url;
	movie.className = 'editorial-rankings__movie';
	title.className = 'editorial-rankings__movie-title';
	title.textContent = entry.title;
	meta.textContent = `${entry.year} · ${entry.verdictLabel}`;
	meter.className = `editorial-rankings__meter editorial-rankings__meter--${entry.meterKind}`;
	meter.setAttribute('aria-label', `${entry.meterLabel}: ${entry.meterScore}%`);
	meterCopy.className = 'editorial-rankings__meter-copy';
	meterLabel.textContent = entry.meterLabel;
	meterScore.textContent = `${entry.meterScore}%`;
	meterTrack.className = 'editorial-rankings__meter-track';
	meterTrack.setAttribute('aria-hidden', 'true');
	meterFill.className = 'editorial-rankings__meter-fill';
	meterFill.style.setProperty('--editorial-meter-level', `${entry.meterScore}%`);

	meterCopy.append(meterLabel, meterScore);
	meterTrack.append(meterFill);
	meter.append(meterCopy, meterTrack);
	movie.append(title, meta, meter);
	link.append(movie);
	item.append(link);

	return item;
}
