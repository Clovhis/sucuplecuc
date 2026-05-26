type UpcomingSuggestion = {
	title: string;
	releaseDate: string;
	synopsis: string;
	embedUrl: string;
};

const root = document.querySelector<HTMLElement>('[data-upcoming-suggestion-root]');
const dataScript = document.getElementById('upcoming-suggestion-data');

if (root && dataScript) {
	const suggestions = parseSuggestions(dataScript.textContent);
	const frame = root.querySelector<HTMLIFrameElement>('[data-upcoming-suggestion-frame]');
	const title = root.querySelector<HTMLElement>('[data-upcoming-suggestion-name]');
	const date = root.querySelector<HTMLTimeElement>('[data-upcoming-suggestion-date]');
	const synopsis = root.querySelector<HTMLElement>('[data-upcoming-suggestion-synopsis]');
	const counter = root.querySelector<HTMLElement>('[data-upcoming-suggestion-count]');
	const nextButton = root.querySelector<HTMLButtonElement>('[data-upcoming-suggestion-next]');
	const queueItems = root.querySelectorAll<HTMLElement>('[data-upcoming-suggestion-queue-item]');

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
		if (title) {
			title.textContent = suggestion.title;
		}
		if (date) {
			date.dateTime = suggestion.releaseDate;
			date.textContent = formatReleaseDate(suggestion.releaseDate);
		}
		if (synopsis) {
			synopsis.textContent = suggestion.synopsis;
		}
		if (counter) {
			counter.textContent = `${index + 1} de ${suggestions.length}`;
		}

		root.dataset.upcomingActiveIndex = String(index);
		queueItems.forEach((item) => {
			const isActive = item.dataset.upcomingSuggestionQueueIndex === String(index);
			item.classList.toggle('weekly-suggestion__queue-item--active', isActive);
			if (isActive) {
				item.setAttribute('aria-current', 'true');
			} else {
				item.removeAttribute('aria-current');
			}
		});
	};

	nextButton?.addEventListener('click', () => {
		if (suggestions.length < 2) return;

		activeIndex = (activeIndex + 1) % suggestions.length;
		renderSuggestion(activeIndex);
	});
}

function parseSuggestions(raw: string | null): UpcomingSuggestion[] {
	if (!raw) return [];

	try {
		const parsed = JSON.parse(raw) as UpcomingSuggestion[];
		if (!Array.isArray(parsed)) return [];

		return parsed.filter(
			(suggestion) =>
				typeof suggestion.title === 'string' &&
				typeof suggestion.releaseDate === 'string' &&
				typeof suggestion.synopsis === 'string' &&
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
