type WeeklySuggestion = {
	title: string;
	year: number;
	releaseDate: string;
	synopsis: string;
	verdictLabel: string;
	movieUrl: string;
	watchUrl: string;
	embedUrl: string;
};

const root = document.querySelector<HTMLElement>('[data-weekly-suggestion-root]');
const dataScript = document.getElementById('weekly-suggestion-data');

if (root && dataScript) {
	const suggestions = parseSuggestions(dataScript.textContent);
	const frame = root.querySelector<HTMLIFrameElement>('[data-weekly-suggestion-frame]');
	const reviewLink = root.querySelector<HTMLAnchorElement>('[data-weekly-suggestion-review]');
	const youtubeLink = root.querySelector<HTMLAnchorElement>('[data-weekly-suggestion-youtube]');
	const title = root.querySelector<HTMLElement>('[data-weekly-suggestion-name]');
	const date = root.querySelector<HTMLTimeElement>('[data-weekly-suggestion-date]');
	const year = root.querySelector<HTMLElement>('[data-weekly-suggestion-year]');
	const verdict = root.querySelector<HTMLElement>('[data-weekly-suggestion-verdict]');
	const synopsis = root.querySelector<HTMLElement>('[data-weekly-suggestion-synopsis]');
	const counter = root.querySelector<HTMLElement>('[data-weekly-suggestion-count]');
	const nextButton = root.querySelector<HTMLButtonElement>('[data-weekly-suggestion-next]');

	let activeIndex = 0;

	if (suggestions.length < 2) {
		nextButton?.setAttribute('hidden', '');
	}

	const renderSuggestion = (index: number): void => {
		const suggestion = suggestions[index];
		if (!suggestion) return;

		if (frame) {
			frame.src = suggestion.embedUrl;
			frame.title = `Trailer oficial de ${suggestion.title}`;
		}
		if (reviewLink) {
			reviewLink.href = suggestion.movieUrl;
			reviewLink.setAttribute('aria-label', `Leer la reseña de ${suggestion.title}`);
		}
		if (youtubeLink) {
			youtubeLink.href = suggestion.watchUrl;
		}
		if (title) {
			title.textContent = suggestion.title;
		}
		if (date) {
			date.dateTime = suggestion.releaseDate;
			date.textContent = formatReleaseDate(suggestion.releaseDate);
		}
		if (year) {
			year.textContent = String(suggestion.year);
		}
		if (verdict) {
			verdict.textContent = suggestion.verdictLabel;
		}
		if (synopsis) {
			synopsis.textContent = suggestion.synopsis;
		}
		if (counter) {
			counter.textContent = `${index + 1} de ${suggestions.length}`;
		}
	};

	nextButton?.addEventListener('click', () => {
		if (suggestions.length < 2) return;

		activeIndex = (activeIndex + 1) % suggestions.length;
		renderSuggestion(activeIndex);
	});
}

function parseSuggestions(raw: string | null): WeeklySuggestion[] {
	if (!raw) return [];

	try {
		const parsed = JSON.parse(raw) as WeeklySuggestion[];
		if (!Array.isArray(parsed)) return [];

		return parsed.filter(
			(suggestion) =>
				typeof suggestion.title === 'string' &&
				typeof suggestion.year === 'number' &&
				typeof suggestion.releaseDate === 'string' &&
				typeof suggestion.synopsis === 'string' &&
				typeof suggestion.verdictLabel === 'string' &&
				typeof suggestion.movieUrl === 'string' &&
				typeof suggestion.watchUrl === 'string' &&
				typeof suggestion.embedUrl === 'string',
		);
	} catch {
		return [];
	}
}

function formatReleaseDate(value: string): string {
	const releaseDate = new Date(`${value}T00:00:00Z`);
	if (Number.isNaN(releaseDate.getTime())) {
		return value;
	}

	return new Intl.DateTimeFormat('es-AR', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		timeZone: 'UTC',
	}).format(releaseDate);
}
