const peopleList = document.querySelector<HTMLOListElement>('.people-index__ladder');

if (peopleList) {
	const rows = Array.from(peopleList.querySelectorAll<HTMLElement>('[data-person-row]'));
	const controls = document.querySelector<HTMLFormElement>('[data-people-controls]');
	const statusNote = document.querySelector<HTMLElement>('[data-people-status]');
	const emptyState = document.querySelector<HTMLElement>('[data-people-empty]');
	const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true });

	type SortMode =
		| 'alpha-asc'
		| 'alpha-desc'
		| 'age-desc'
		| 'age-asc'
		| 'catalog-desc'
		| 'catalog-asc'
		| 'awards-desc'
		| 'awards-asc';

	type AgeFilter = '' | 'known' | 'unknown' | 'under-40' | '40-59' | '60-79' | '80-plus';
	type CatalogFilter = '' | 'with-filmography' | '1-2' | '3-5' | '6-plus';
	type AwardsFilter = '' | 'with-awards' | 'without-awards' | '1' | '2-3' | '4-plus';

	type FilterState = {
		query: string;
		sort: SortMode;
		role: string;
		nationality: string;
		age: AgeFilter;
		catalog: CatalogFilter;
		awards: AwardsFilter;
	};

	type PersonRow = {
		row: HTMLElement;
		name: string;
		search: string;
		roles: string[];
		nationality: string;
		age: number | null;
		filmCount: number;
		awardCount: number;
	};

	const DEFAULT_STATE: FilterState = {
		query: '',
		sort: 'alpha-asc',
		role: '',
		nationality: '',
		age: '',
		catalog: '',
		awards: '',
	};

	const SORT_LABELS: Record<SortMode, string> = {
		'alpha-asc': 'A-Z',
		'alpha-desc': 'Z-A',
		'age-desc': 'edad, de mayor a menor',
		'age-asc': 'edad, de menor a mayor',
		'catalog-desc': 'cantidad de pelis, de mayor a menor',
		'catalog-asc': 'cantidad de pelis, de menor a mayor',
		'awards-desc': 'premios destacados, de mayor a menor',
		'awards-asc': 'premios destacados, de menor a mayor',
	};

	const SORT_VALUES = new Set<SortMode>(Object.keys(SORT_LABELS) as SortMode[]);
	const normalizeText = (value: string): string =>
		value
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase()
			.replace(/\s+/g, ' ')
			.trim();

	const personRows: PersonRow[] = rows.map((row) => {
		const parsedAge = Number(row.dataset.age ?? '');
		return {
			row,
			name: row.dataset.name ?? '',
			search: row.dataset.search ?? '',
			roles: (row.dataset.roles ?? '').split('|').filter(Boolean),
			nationality: row.dataset.nationality ?? '',
			age: Number.isFinite(parsedAge) ? parsedAge : null,
			filmCount: Number(row.dataset.filmCount ?? '0') || 0,
			awardCount: Number(row.dataset.awardCount ?? '0') || 0,
		};
	});

	const compareByName = (left: PersonRow, right: PersonRow): number => collator.compare(left.name, right.name);

	const compareByAge = (left: PersonRow, right: PersonRow, direction: 'asc' | 'desc'): number => {
		const leftKnown = typeof left.age === 'number';
		const rightKnown = typeof right.age === 'number';

		if (leftKnown !== rightKnown) {
			return leftKnown ? -1 : 1;
		}

		if (leftKnown && rightKnown) {
			const delta = (left.age ?? 0) - (right.age ?? 0);
			if (delta !== 0) {
				return direction === 'asc' ? delta : -delta;
			}
		}

		return compareByName(left, right);
	};

	const compareByMetric = (
		left: PersonRow,
		right: PersonRow,
		metric: 'filmCount' | 'awardCount',
		direction: 'asc' | 'desc',
	): number => {
		const delta = left[metric] - right[metric];
		if (delta !== 0) {
			return direction === 'asc' ? delta : -delta;
		}

		return compareByName(left, right);
	};

	const compareRows = (left: PersonRow, right: PersonRow, mode: SortMode): number => {
		switch (mode) {
			case 'alpha-desc':
				return compareByName(right, left);
			case 'age-desc':
				return compareByAge(left, right, 'desc');
			case 'age-asc':
				return compareByAge(left, right, 'asc');
			case 'catalog-desc':
				return compareByMetric(left, right, 'filmCount', 'desc');
			case 'catalog-asc':
				return compareByMetric(left, right, 'filmCount', 'asc');
			case 'awards-desc':
				return compareByMetric(left, right, 'awardCount', 'desc');
			case 'awards-asc':
				return compareByMetric(left, right, 'awardCount', 'asc');
			case 'alpha-asc':
			default:
				return compareByName(left, right);
		}
	};

	const updateRanks = (visibleRows: PersonRow[]): void => {
		personRows.forEach((entry) => {
			const rank = entry.row.querySelector<HTMLElement>('[data-people-rank]');
			if (rank) {
				rank.textContent = '–';
			}
		});

		visibleRows.forEach((entry, index) => {
			const rank = entry.row.querySelector<HTMLElement>('[data-people-rank]');
			if (rank) {
				rank.textContent = String(index + 1).padStart(2, '0');
			}
		});
	};

	const readStateFromControls = (): FilterState => {
		if (!controls) {
			return { ...DEFAULT_STATE };
		}

		const getValue = (key: string): string =>
			controls.querySelector<HTMLInputElement | HTMLSelectElement>(`[data-people-filter="${key}"]`)?.value ?? '';

		const sortValue = getValue('sort');

		return {
			query: getValue('query').trim(),
			sort: SORT_VALUES.has(sortValue as SortMode) ? (sortValue as SortMode) : DEFAULT_STATE.sort,
			role: normalizeText(getValue('role')),
			nationality: normalizeText(getValue('nationality')),
			age: (getValue('age') as AgeFilter) || '',
			catalog: (getValue('catalog') as CatalogFilter) || '',
			awards: (getValue('awards') as AwardsFilter) || '',
		};
	};

	const hydrateControls = (state: FilterState): void => {
		if (!controls) {
			return;
		}

		const setValue = (key: string, value: string): void => {
			const field = controls.querySelector<HTMLInputElement | HTMLSelectElement>(`[data-people-filter="${key}"]`);
			if (field) {
				field.value = value;
			}
		};

		setValue('query', state.query);
		setValue('sort', state.sort);
		setValue('role', state.role);
		setValue('nationality', state.nationality);
		setValue('age', state.age);
		setValue('catalog', state.catalog);
		setValue('awards', state.awards);
	};

	const getControlSummaryLabel = (key: string): string => {
		if (!controls) {
			return '';
		}

		const field = controls.querySelector<HTMLInputElement | HTMLSelectElement>(`[data-people-filter="${key}"]`);
		if (!field) {
			return '';
		}

		if (field instanceof HTMLSelectElement) {
			return field.selectedOptions[0]?.textContent?.trim() ?? '';
		}

		return field.value.trim();
	};

	const updateStatus = (visibleCount: number, totalCount: number, state: FilterState): void => {
		if (!statusNote) {
			return;
		}

		const detailParts = [
			state.query ? `búsqueda: “${state.query}”` : '',
			state.role ? `rol: ${getControlSummaryLabel('role')}` : '',
			state.nationality ? `nacionalidad: ${getControlSummaryLabel('nationality')}` : '',
			state.age ? `edad: ${getControlSummaryLabel('age')}` : '',
			state.catalog ? `catálogo: ${getControlSummaryLabel('catalog')}` : '',
			state.awards ? `premios: ${getControlSummaryLabel('awards')}` : '',
		].filter(Boolean);
		const detailText = detailParts.length > 0 ? ` Filtros activos: ${detailParts.join(' · ')}.` : '';

		statusNote.textContent = `Mostrando ${visibleCount} de ${totalCount} perfiles. Orden actual: ${SORT_LABELS[state.sort]}.${detailText}`;
	};

	const readStateFromUrl = (): FilterState => {
		const params = new URLSearchParams(window.location.search);
		const sortParam = params.get('orden') ?? '';

		return {
			query: (params.get('q') ?? '').trim(),
			sort: SORT_VALUES.has(sortParam as SortMode) ? (sortParam as SortMode) : DEFAULT_STATE.sort,
			role: normalizeText(params.get('rol') ?? ''),
			nationality: normalizeText(params.get('nacionalidad') ?? ''),
			age: ((params.get('edad') ?? '') as AgeFilter) || '',
			catalog: ((params.get('catalogo') ?? '') as CatalogFilter) || '',
			awards: ((params.get('premios') ?? '') as AwardsFilter) || '',
		};
	};

	const updateUrl = (state: FilterState): void => {
		const url = new URL(window.location.href);
		const params = url.searchParams;

		params.delete('q');
		params.delete('orden');
		params.delete('rol');
		params.delete('nacionalidad');
		params.delete('edad');
		params.delete('catalogo');
		params.delete('premios');

		if (state.query) params.set('q', state.query);
		if (state.sort !== DEFAULT_STATE.sort) params.set('orden', state.sort);
		if (state.role) params.set('rol', state.role);
		if (state.nationality) params.set('nacionalidad', state.nationality);
		if (state.age) params.set('edad', state.age);
		if (state.catalog) params.set('catalogo', state.catalog);
		if (state.awards) params.set('premios', state.awards);

		window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
	};

	const matchesAgeFilter = (entry: PersonRow, filter: AgeFilter): boolean => {
		if (!filter) return true;
		if (filter === 'known') return typeof entry.age === 'number';
		if (filter === 'unknown') return entry.age === null;
		if (entry.age === null) return false;
		if (filter === 'under-40') return entry.age < 40;
		if (filter === '40-59') return entry.age >= 40 && entry.age <= 59;
		if (filter === '60-79') return entry.age >= 60 && entry.age <= 79;
		return entry.age >= 80;
	};

	const matchesCatalogFilter = (entry: PersonRow, filter: CatalogFilter): boolean => {
		if (!filter) return true;
		if (filter === 'with-filmography') return entry.filmCount > 0;
		if (filter === '1-2') return entry.filmCount >= 1 && entry.filmCount <= 2;
		if (filter === '3-5') return entry.filmCount >= 3 && entry.filmCount <= 5;
		return entry.filmCount >= 6;
	};

	const matchesAwardsFilter = (entry: PersonRow, filter: AwardsFilter): boolean => {
		if (!filter) return true;
		if (filter === 'with-awards') return entry.awardCount > 0;
		if (filter === 'without-awards') return entry.awardCount === 0;
		if (filter === '1') return entry.awardCount === 1;
		if (filter === '2-3') return entry.awardCount >= 2 && entry.awardCount <= 3;
		return entry.awardCount >= 4;
	};

	const matchesFilters = (entry: PersonRow, state: FilterState): boolean => {
		if (state.query && !entry.search.includes(normalizeText(state.query))) {
			return false;
		}

		if (state.role && !entry.roles.includes(state.role)) {
			return false;
		}

		if (state.nationality && entry.nationality !== state.nationality) {
			return false;
		}

		if (!matchesAgeFilter(entry, state.age)) {
			return false;
		}

		if (!matchesCatalogFilter(entry, state.catalog)) {
			return false;
		}

		return matchesAwardsFilter(entry, state.awards);
	};

	const applyState = (state: FilterState, syncUrl = true): void => {
		const sortedRows = [...personRows].sort((left, right) => compareRows(left, right, state.sort));
		const visibleRows: PersonRow[] = [];

		for (const entry of sortedRows) {
			const isVisible = matchesFilters(entry, state);
			entry.row.hidden = !isVisible;
			entry.row.toggleAttribute('aria-hidden', !isVisible);
			peopleList.appendChild(entry.row);
			if (isVisible) {
				visibleRows.push(entry);
			}
		}

		updateRanks(visibleRows);
		updateStatus(visibleRows.length, personRows.length, state);

		if (emptyState) {
			emptyState.hidden = visibleRows.length > 0;
		}

		if (syncUrl) {
			updateUrl(state);
		}
	};

	if (controls) {
		controls.addEventListener('input', (event) => {
			const target = event.target;
			if (!(target instanceof HTMLInputElement)) {
				return;
			}

			if (target.dataset.peopleFilter === 'query') {
				applyState(readStateFromControls());
			}
		});

		controls.addEventListener('change', () => {
			applyState(readStateFromControls());
		});

		controls.addEventListener('reset', () => {
			window.requestAnimationFrame(() => {
				applyState({ ...DEFAULT_STATE });
			});
		});
	}

	const initialState = readStateFromUrl();
	hydrateControls(initialState);
	applyState(initialState, false);

	window.addEventListener('popstate', () => {
		const nextState = readStateFromUrl();
		hydrateControls(nextState);
		applyState(nextState, false);
	});
}
