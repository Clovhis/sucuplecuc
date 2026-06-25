const peopleList = document.querySelector<HTMLOListElement>('.people-index__ladder');

if (peopleList) {
	const rows = Array.from(peopleList.querySelectorAll<HTMLElement>('[data-person-row]'));
	const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-people-sort]'));
	const sortNote = document.querySelector<HTMLElement>('[data-people-sort-note]');
	const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true });

	type SortMode = 'alpha' | 'age';

	const compareByName = (left: HTMLElement, right: HTMLElement): number =>
		collator.compare(left.dataset.name ?? '', right.dataset.name ?? '');

	const compareByAge = (left: HTMLElement, right: HTMLElement): number => {
		const leftKnown = left.dataset.ageKnown === 'true';
		const rightKnown = right.dataset.ageKnown === 'true';

		if (leftKnown !== rightKnown) {
			return leftKnown ? -1 : 1;
		}

		if (leftKnown && rightKnown) {
			const leftAge = Number(left.dataset.age ?? '');
			const rightAge = Number(right.dataset.age ?? '');

			if (leftAge !== rightAge) {
				return rightAge - leftAge;
			}
		}

		return compareByName(left, right);
	};

	const updateRanks = (): void => {
		rows.forEach((row, index) => {
			const rank = row.querySelector<HTMLElement>('[data-people-rank]');
			if (rank) {
				rank.textContent = String(index + 1).padStart(2, '0');
			}
		});
	};

	const updateButtons = (mode: SortMode): void => {
		buttons.forEach((button) => {
			const isActive = button.dataset.peopleSort === mode;
			button.classList.toggle('is-active', isActive);
			button.setAttribute('aria-pressed', String(isActive));
		});
	};

	const updateNote = (mode: SortMode): void => {
		if (!sortNote) {
			return;
		}

		sortNote.textContent =
			mode === 'age'
				? 'Orden actual: edad, de mayor a menor.'
				: 'Orden actual: alfabético.';
	};

	const updateUrl = (mode: SortMode): void => {
		const url = new URL(window.location.href);
		if (mode === 'age') {
			url.searchParams.set('orden', 'edad');
		} else {
			url.searchParams.delete('orden');
		}

		window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
	};

	const applySort = (mode: SortMode, syncUrl = true): void => {
		rows.sort(mode === 'age' ? compareByAge : compareByName).forEach((row) => peopleList.appendChild(row));
		updateRanks();
		updateButtons(mode);
		updateNote(mode);

		if (syncUrl) {
			updateUrl(mode);
		}
	};

	buttons.forEach((button) => {
		button.addEventListener('click', () => {
			const mode = button.dataset.peopleSort === 'age' ? 'age' : 'alpha';
			applySort(mode);
		});
	});

	const initialMode: SortMode = new URLSearchParams(window.location.search).get('orden') === 'edad' ? 'age' : 'alpha';
	applySort(initialMode, false);
}
