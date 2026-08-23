document.querySelectorAll<HTMLElement>('[data-weekly-recommendations-carousel]').forEach((carousel) => {
	const viewport = carousel.querySelector<HTMLElement>('[data-weekly-recommendations-viewport]');
	const previousButton = carousel.querySelector<HTMLButtonElement>('[data-weekly-recommendations-previous]');
	const nextButton = carousel.querySelector<HTMLButtonElement>('[data-weekly-recommendations-next]');

	if (!viewport) {
		return;
	}

	const updateControls = (): void => {
		const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
		const atStart = viewport.scrollLeft <= 4;
		const atEnd = viewport.scrollLeft >= maxScrollLeft - 4;

		if (previousButton) {
			previousButton.disabled = atStart;
		}
		if (nextButton) {
			nextButton.disabled = atEnd;
		}
	};

	const scrollCards = (direction: 1 | -1): void => {
		const firstCard = viewport.querySelector<HTMLElement>('.weekly-recommendations__item');
		const distance = firstCard ? firstCard.getBoundingClientRect().width + 16 : viewport.clientWidth * 0.75;
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		viewport.scrollBy({
			left: direction * distance * 2,
			behavior: prefersReducedMotion ? 'auto' : 'smooth',
		});
	};

	previousButton?.addEventListener('click', () => scrollCards(-1));
	nextButton?.addEventListener('click', () => scrollCards(1));
	viewport.addEventListener('scroll', updateControls, { passive: true });
	window.addEventListener('resize', updateControls);
	updateControls();
});
