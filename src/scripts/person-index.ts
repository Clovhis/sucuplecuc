const peopleList = document.querySelector<HTMLOListElement>('.people-index__ladder');

if (peopleList) {
	const rows = Array.from(peopleList.querySelectorAll<HTMLElement>('[data-person-row]'));
	const controls = document.querySelector<HTMLFormElement>('[data-people-controls]');
	const statusNote = document.querySelector<HTMLElement>('[data-people-status]');
	const emptyState = document.querySelector<HTMLElement>('[data-people-empty]');
	const activeFiltersShell = document.querySelector<HTMLElement>('[data-people-active-filters]');
	const activeFiltersList = document.querySelector<HTMLElement>('[data-people-active-filter-list]');
	const resetShell = document.querySelector<HTMLElement>('[data-people-reset-shell]');
	const filterToggle = document.querySelector<HTMLButtonElement>('[data-people-filter-toggle]');
	const filterToggleLabel = document.querySelector<HTMLElement>('[data-people-filter-toggle-label]');
	const filterCount = document.querySelector<HTMLElement>('[data-people-filter-count]');
	const filterPanel = document.querySelector<HTMLElement>('[data-people-filter-panel]');
	const sortButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-people-sort-key]'));
	const chipButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-people-chip-group]'));
	const directionButton = document.querySelector<HTMLButtonElement>('[data-people-sort-direction]');
	const directionIcon = document.querySelector<HTMLElement>('[data-people-sort-direction-icon]');
	const directionLabel = document.querySelector<HTMLElement>('[data-people-sort-direction-label]');
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
	type SortKey = 'alpha' | 'age' | 'catalog' | 'awards';
	type SortDirection = 'asc' | 'desc';
	type AgeFilter = '' | 'under-40' | '40-54' | '55-69' | '70-plus';
	type CatalogFilter = '' | '1-2' | '3-5' | '6-9' | '10-plus';
	type AwardsFilter = '' | 'with-awards' | '1' | '2-3' | '4-plus';

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

	type FilterKey = keyof Pick<FilterState, 'query' | 'role' | 'nationality' | 'age' | 'catalog' | 'awards'>;

	const DEFAULT_STATE: FilterState = {
		query: '',
		sort: 'alpha-asc',
		role: '',
		nationality: '',
		age: '',
		catalog: '',
		awards: '',
	};

	const SORT_CONFIG: Record<
		SortMode,
		{
			key: SortKey;
			direction: SortDirection;
			statusLabel: string;
			directionLabel: string;
			directionIcon: string;
		}
	> = {
		'alpha-asc': {
			key: 'alpha',
			direction: 'asc',
			statusLabel: 'A-Z',
			directionLabel: 'A-Z',
			directionIcon: '↑',
		},
		'alpha-desc': {
			key: 'alpha',
			direction: 'desc',
			statusLabel: 'Z-A',
			directionLabel: 'Z-A',
			directionIcon: '↓',
		},
		'age-asc': {
			key: 'age',
			direction: 'asc',
			statusLabel: 'edad, menor primero',
			directionLabel: 'Menor primero',
			directionIcon: '↑',
		},
		'age-desc': {
			key: 'age',
			direction: 'desc',
			statusLabel: 'edad, mayor primero',
			directionLabel: 'Mayor primero',
			directionIcon: '↓',
		},
		'catalog-asc': {
			key: 'catalog',
			direction: 'asc',
			statusLabel: 'catálogo, menos pelis primero',
			directionLabel: 'Menos pelis',
			directionIcon: '↑',
		},
		'catalog-desc': {
			key: 'catalog',
			direction: 'desc',
			statusLabel: 'catálogo, más pelis primero',
			directionLabel: 'Más pelis',
			directionIcon: '↓',
		},
		'awards-asc': {
			key: 'awards',
			direction: 'asc',
			statusLabel: 'premios, menos primero',
			directionLabel: 'Menos premios',
			directionIcon: '↑',
		},
		'awards-desc': {
			key: 'awards',
			direction: 'desc',
			statusLabel: 'premios, más primero',
			directionLabel: 'Más premios',
			directionIcon: '↓',
		},
	};

	const SORT_BY_KEY: Record<SortKey, Record<SortDirection, SortMode>> = {
		alpha: { asc: 'alpha-asc', desc: 'alpha-desc' },
		age: { asc: 'age-asc', desc: 'age-desc' },
		catalog: { asc: 'catalog-asc', desc: 'catalog-desc' },
		awards: { asc: 'awards-asc', desc: 'awards-desc' },
	};

	const DEFAULT_SORT_BY_KEY: Record<SortKey, SortMode> = {
		alpha: 'alpha-asc',
		age: 'age-desc',
		catalog: 'catalog-desc',
		awards: 'awards-desc',
	};

	const FILTER_LABELS = {
		age: {
			'': 'Todas',
			'under-40': 'Menos de 40',
			'40-54': '40 a 54',
			'55-69': '55 a 69',
			'70-plus': '70 o más',
		},
		catalog: {
			'': 'Todos',
			'1-2': '1 a 2 pelis',
			'3-5': '3 a 5 pelis',
			'6-9': '6 a 9 pelis',
			'10-plus': '10 o más',
		},
		awards: {
			'': 'Todos',
			'with-awards': 'Con premios',
			'1': '1 premio',
			'2-3': '2 a 3 premios',
			'4-plus': '4 o más',
		},
	} as const;

	const SORT_VALUES = new Set<SortMode>(Object.keys(SORT_CONFIG) as SortMode[]);
	const AGE_VALUES = new Set<AgeFilter>(['', 'under-40', '40-54', '55-69', '70-plus']);
	const CATALOG_VALUES = new Set<CatalogFilter>(['', '1-2', '3-5', '6-9', '10-plus']);
	const AWARDS_VALUES = new Set<AwardsFilter>(['', 'with-awards', '1', '2-3', '4-plus']);

	const normalizeText = (value: string): string =>
		value
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase()
			.replace(/\s+/g, ' ')
			.trim();

	const normalizeAgeFilter = (value: string): AgeFilter => {
		if (value === '40-59') return '40-54';
		if (value === '60-79' || value === '80-plus') return '70-plus';
		return AGE_VALUES.has(value as AgeFilter) ? (value as AgeFilter) : '';
	};

	const normalizeCatalogFilter = (value: string): CatalogFilter => {
		if (value === '6-plus') return '6-9';
		return CATALOG_VALUES.has(value as CatalogFilter) ? (value as CatalogFilter) : '';
	};

	const normalizeAwardsFilter = (value: string): AwardsFilter =>
		AWARDS_VALUES.has(value as AwardsFilter) ? (value as AwardsFilter) : '';

	const personRows: PersonRow[] = rows.map((row) => {
		const parsedAge = Number(row.dataset.age ?? '');
		const hasKnownAge = row.dataset.ageKnown === 'true';
		return {
			row,
			name: row.dataset.name ?? '',
			search: row.dataset.search ?? '',
			roles: (row.dataset.roles ?? '').split('|').filter(Boolean),
			nationality: row.dataset.nationality ?? '',
			age: hasKnownAge && Number.isFinite(parsedAge) ? parsedAge : null,
			filmCount: Number(row.dataset.filmCount ?? '0') || 0,
			awardCount: Number(row.dataset.awardCount ?? '0') || 0,
		};
	});

	const compareByName = (left: PersonRow, right: PersonRow): number => collator.compare(left.name, right.name);

	const compareByAge = (left: PersonRow, right: PersonRow, direction: SortDirection): number => {
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
		direction: SortDirection,
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

	const getField = (key: string): HTMLInputElement | HTMLSelectElement | null =>
		controls?.querySelector<HTMLInputElement | HTMLSelectElement>(`[data-people-filter="${key}"]`) ?? null;

	const setFieldValue = (key: string, value: string): void => {
		const field = getField(key);
		if (field) {
			field.value = value;
		}
	};

	const readStateFromControls = (): FilterState => {
		if (!controls) {
			return { ...DEFAULT_STATE };
		}

		const getValue = (key: string): string => getField(key)?.value ?? '';
		const sortValue = getValue('sort');

		return {
			query: getValue('query').trim(),
			sort: SORT_VALUES.has(sortValue as SortMode) ? (sortValue as SortMode) : DEFAULT_STATE.sort,
			role: normalizeText(getValue('role')),
			nationality: normalizeText(getValue('nationality')),
			age: normalizeAgeFilter(getValue('age')),
			catalog: normalizeCatalogFilter(getValue('catalog')),
			awards: normalizeAwardsFilter(getValue('awards')),
		};
	};

	const hydrateControls = (state: FilterState): void => {
		if (!controls) {
			return;
		}

		setFieldValue('query', state.query);
		setFieldValue('sort', state.sort);
		setFieldValue('role', state.role);
		setFieldValue('nationality', state.nationality);
		setFieldValue('age', state.age);
		setFieldValue('catalog', state.catalog);
		setFieldValue('awards', state.awards);
	};

	const getSelectLabel = (key: 'role' | 'nationality'): string => {
		const field = getField(key);
		return field instanceof HTMLSelectElement ? (field.selectedOptions[0]?.textContent?.trim() ?? '') : '';
	};

	const getFilterLabel = (key: FilterKey, value: string): string => {
		if (!value) {
			return '';
		}

		if (key === 'query') {
			return `búsqueda: “${value}”`;
		}

		if (key === 'role') {
			return `rol: ${getSelectLabel('role')}`;
		}

		if (key === 'nationality') {
			return `nacionalidad: ${getSelectLabel('nationality')}`;
		}

		const labels = FILTER_LABELS[key as keyof typeof FILTER_LABELS] as Record<string, string> | undefined;
		const label = labels?.[value];
		if (!label) {
			return '';
		}

		const prefixMap: Record<'age' | 'catalog' | 'awards', string> = {
			age: 'edad',
			catalog: 'catálogo',
			awards: 'premios',
		};

		return `${prefixMap[key as 'age' | 'catalog' | 'awards']}: ${label}`;
	};

	const updateStatus = (visibleCount: number, totalCount: number, state: FilterState): void => {
		if (!statusNote) {
			return;
		}

		const detailParts = (
			[
				['query', state.query],
				['role', state.role],
				['nationality', state.nationality],
				['age', state.age],
				['catalog', state.catalog],
				['awards', state.awards],
			] as Array<[FilterKey, string]>
		)
			.map(([key, value]) => getFilterLabel(key, value))
			.filter(Boolean);
		const detailText = detailParts.length > 0 ? ` Filtros activos: ${detailParts.join(' · ')}.` : '';

		statusNote.textContent = `Mostrando ${visibleCount} de ${totalCount} perfiles. Orden actual: ${SORT_CONFIG[state.sort].statusLabel}.${detailText}`;
	};

	const readStateFromUrl = (): FilterState => {
		const params = new URLSearchParams(window.location.search);
		const sortParam = params.get('orden') ?? '';

		return {
			query: (params.get('q') ?? '').trim(),
			sort: SORT_VALUES.has(sortParam as SortMode) ? (sortParam as SortMode) : DEFAULT_STATE.sort,
			role: normalizeText(params.get('rol') ?? ''),
			nationality: normalizeText(params.get('nacionalidad') ?? ''),
			age: normalizeAgeFilter(params.get('edad') ?? ''),
			catalog: normalizeCatalogFilter(params.get('catalogo') ?? ''),
			awards: normalizeAwardsFilter(params.get('premios') ?? ''),
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
		if (entry.age === null) return false;
		if (filter === 'under-40') return entry.age < 40;
		if (filter === '40-54') return entry.age >= 40 && entry.age <= 54;
		if (filter === '55-69') return entry.age >= 55 && entry.age <= 69;
		return entry.age >= 70;
	};

	const matchesCatalogFilter = (entry: PersonRow, filter: CatalogFilter): boolean => {
		if (!filter) return true;
		if (filter === '1-2') return entry.filmCount >= 1 && entry.filmCount <= 2;
		if (filter === '3-5') return entry.filmCount >= 3 && entry.filmCount <= 5;
		if (filter === '6-9') return entry.filmCount >= 6 && entry.filmCount <= 9;
		return entry.filmCount >= 10;
	};

	const matchesAwardsFilter = (entry: PersonRow, filter: AwardsFilter): boolean => {
		if (!filter) return true;
		if (filter === 'with-awards') return entry.awardCount > 0;
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

	const updateSortUi = (state: FilterState): void => {
		const currentSort = SORT_CONFIG[state.sort];
		const nextDirection: SortDirection = currentSort.direction === 'asc' ? 'desc' : 'asc';
		const nextLabel = SORT_CONFIG[SORT_BY_KEY[currentSort.key][nextDirection]].directionLabel;

		sortButtons.forEach((button) => {
			const isActive = button.dataset.peopleSortKey === currentSort.key;
			button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
		});

		if (directionButton) {
			directionButton.setAttribute('aria-label', `Cambiar orden a ${nextLabel}`);
		}

		if (directionIcon) {
			directionIcon.textContent = currentSort.directionIcon;
		}

		if (directionLabel) {
			directionLabel.textContent = currentSort.directionLabel;
		}
	};

	const updateChipUi = (state: FilterState): void => {
		chipButtons.forEach((button) => {
			const key = button.dataset.peopleChipGroup as 'age' | 'catalog' | 'awards' | undefined;
			if (!key) {
				return;
			}

			const buttonValue = button.dataset.peopleChipValue ?? '';
			const currentValue = state[key];
			const isActive = currentValue === buttonValue;

			button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
		});
	};

	const updateActiveFilters = (state: FilterState): void => {
		if (!activeFiltersShell || !activeFiltersList) {
			return;
		}

		activeFiltersList.replaceChildren();

		const activeFilters = (
			[
				['query', state.query],
				['role', state.role],
				['nationality', state.nationality],
				['age', state.age],
				['catalog', state.catalog],
				['awards', state.awards],
			] as Array<[FilterKey, string]>
		)
			.map(([key, value]) => ({
				key,
				value,
				label: getFilterLabel(key, value),
			}))
			.filter((entry) => entry.value && entry.label);

		activeFiltersShell.hidden = activeFilters.length === 0;
		if (resetShell) {
			resetShell.hidden = activeFilters.length === 0 && state.sort === DEFAULT_STATE.sort;
		}

		for (const entry of activeFilters) {
			const button = document.createElement('button');
			const label = document.createElement('span');
			const close = document.createElement('span');

			button.type = 'button';
			button.className = 'people-index__active-pill';
			button.dataset.peopleRemoveFilter = entry.key;
			button.setAttribute('aria-label', `Quitar filtro de ${entry.label}`);
			label.textContent = entry.label;
			close.textContent = '×';
			close.setAttribute('aria-hidden', 'true');
			button.append(label, close);
			activeFiltersList.appendChild(button);
		}
	};

	const setFilterPanel = (expanded: boolean): void => {
		if (!filterToggle || !filterPanel) {
			return;
		}

		filterToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
		filterPanel.hidden = !expanded;
		if (filterToggleLabel) {
			filterToggleLabel.textContent = expanded ? 'Ocultar filtros' : 'Más filtros';
		}
	};

	const updateFilterSummary = (state: FilterState): void => {
		const count = [state.role, state.nationality, state.age, state.catalog, state.awards].filter(Boolean).length;
		if (filterCount) {
			filterCount.textContent = String(count);
			filterCount.hidden = count === 0;
		}
	};

	const syncUiState = (state: FilterState): void => {
		updateSortUi(state);
		updateChipUi(state);
		updateActiveFilters(state);
		updateFilterSummary(state);
	};

	const applyState = (state: FilterState, syncUrl = true): void => {
		hydrateControls(state);
		syncUiState(state);

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
			if (!(target instanceof HTMLInputElement) || target.dataset.peopleFilter !== 'query') {
				return;
			}

			applyState(readStateFromControls());
		});

		controls.addEventListener('change', () => {
			applyState(readStateFromControls());
		});

		controls.addEventListener('click', (event) => {
			const target = event.target;
			const toggleButton = target instanceof Element
				? target.closest<HTMLButtonElement>('[data-people-filter-toggle]')
				: null;
			if (toggleButton) {
				setFilterPanel(toggleButton.getAttribute('aria-expanded') !== 'true');
				return;
			}

			const sortButton = target instanceof Element ? target.closest<HTMLButtonElement>('[data-people-sort-key]') : null;
			if (sortButton) {
				const state = readStateFromControls();
				const sortKey = sortButton.dataset.peopleSortKey as SortKey | undefined;
				if (!sortKey) {
					return;
				}

				const currentSort = SORT_CONFIG[state.sort];
				const nextSort = currentSort.key === sortKey ? state.sort : DEFAULT_SORT_BY_KEY[sortKey];
				setFieldValue('sort', nextSort);
				applyState(readStateFromControls());
				return;
			}

			const chipButton = target instanceof Element
				? target.closest<HTMLButtonElement>('[data-people-chip-group][data-people-chip-value]')
				: null;
			if (chipButton) {
				const state = readStateFromControls();
				const filterKey = chipButton.dataset.peopleChipGroup as 'age' | 'catalog' | 'awards' | undefined;
				if (!filterKey) {
					return;
				}

				const chipValue = chipButton.dataset.peopleChipValue ?? '';
				const nextValue = state[filterKey] === chipValue ? '' : chipValue;
				setFieldValue(filterKey, nextValue);
				applyState(readStateFromControls());
			}
		});

		controls.addEventListener('reset', () => {
			window.requestAnimationFrame(() => {
				applyState({ ...DEFAULT_STATE });
			});
		});
	}

	if (directionButton) {
		directionButton.addEventListener('click', () => {
			const state = readStateFromControls();
			const currentSort = SORT_CONFIG[state.sort];
			const nextDirection: SortDirection = currentSort.direction === 'asc' ? 'desc' : 'asc';
			setFieldValue('sort', SORT_BY_KEY[currentSort.key][nextDirection]);
			applyState(readStateFromControls());
		});
	}

	if (activeFiltersList) {
		activeFiltersList.addEventListener('click', (event) => {
			const target = event.target;
			const removeButton = target instanceof Element
				? target.closest<HTMLButtonElement>('[data-people-remove-filter]')
				: null;
			if (!removeButton) {
				return;
			}

			const key = removeButton.dataset.peopleRemoveFilter as FilterKey | undefined;
			if (!key) {
				return;
			}

			setFieldValue(key, '');
			applyState(readStateFromControls());
		});
	}

	const initialState = readStateFromUrl();
	setFilterPanel(
		Boolean(
			initialState.role ||
			initialState.nationality ||
			initialState.age ||
			initialState.catalog ||
			initialState.awards,
		),
	);
	applyState(initialState, false);

	window.addEventListener('popstate', () => {
		const nextState = readStateFromUrl();
		applyState(nextState, false);
	});
}
