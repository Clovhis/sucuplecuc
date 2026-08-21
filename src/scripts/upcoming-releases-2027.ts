function normalizeSearchValue(value: string) {
	return value
		.toLocaleLowerCase('es-AR')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.trim();
}

function initializeUpcomingReleases2027() {
	const root = document.querySelector<HTMLElement>('[data-upcoming-2027-root]');
	if (!root) return;

	const searchInput = root.querySelector<HTMLInputElement>('[data-upcoming-2027-search]');
	const periodSelect = root.querySelector<HTMLSelectElement>('[data-upcoming-2027-period]');
	const status = root.querySelector<HTMLElement>('[data-upcoming-2027-status]');
	const count = root.querySelector<HTMLElement>('[data-upcoming-2027-count]');
	const emptyState = root.querySelector<HTMLElement>('[data-upcoming-2027-empty]');
	const disclosure = root.querySelector<HTMLDetailsElement>('[data-upcoming-2027-disclosure]');
	const items = [...root.querySelectorAll<HTMLElement>('[data-upcoming-2027-item]')];

	if (!searchInput || !periodSelect || !status || !count || !emptyState || !disclosure) return;

	if (window.matchMedia('(max-width: 720px)').matches) {
		disclosure.open = false;
	}

	const updateResults = () => {
		const query = normalizeSearchValue(searchInput.value);
		const selectedPeriod = periodSelect.value;
		if (window.matchMedia('(max-width: 720px)').matches && (query || selectedPeriod !== 'all')) {
			disclosure.open = true;
		}
		let visibleCount = 0;

		for (const item of items) {
			const title = normalizeSearchValue(item.getAttribute('data-upcoming-2027-title') ?? '');
			const matchesQuery = !query || title.includes(query);
			const matchesPeriod = selectedPeriod === 'all' || item.getAttribute('data-upcoming-2027-half') === selectedPeriod;
			const isVisible = matchesQuery && matchesPeriod;

			item.hidden = !isVisible;
			if (isVisible) visibleCount += 1;
		}

		const resultLabel = `${visibleCount} de ${items.length} títulos`;
		count.textContent = query || selectedPeriod !== 'all' ? resultLabel : `${items.length} títulos`;
		status.textContent = query || selectedPeriod !== 'all'
			? `${resultLabel} visibles`
			: `${items.length} títulos destacados`;
		emptyState.hidden = visibleCount > 0;
	};

	searchInput.addEventListener('input', updateResults);
	periodSelect.addEventListener('change', updateResults);
}

initializeUpcomingReleases2027();
