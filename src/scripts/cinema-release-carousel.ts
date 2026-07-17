document.querySelectorAll<HTMLElement>('[data-cinema-release-carousel]').forEach((carousel) => {
	const viewport = carousel.querySelector<HTMLElement>('[data-cinema-release-viewport]');
	const previousButton = carousel.querySelector<HTMLButtonElement>('[data-cinema-release-previous]');
	const nextButton = carousel.querySelector<HTMLButtonElement>('[data-cinema-release-next]');
	const dialog = carousel.querySelector<HTMLDialogElement>('[data-cinema-release-dialog]');
	const closeButton = carousel.querySelector<HTMLButtonElement>('[data-cinema-release-close]');
	const player = carousel.querySelector<HTMLElement>('[data-cinema-release-player]');
	const dialogTitle = carousel.querySelector<HTMLElement>('[data-cinema-release-dialog-title]');
	const dialogDate = carousel.querySelector<HTMLElement>('[data-cinema-release-dialog-date]');
	const youtubeLink = carousel.querySelector<HTMLAnchorElement>('[data-cinema-release-youtube]');

	const scrollCards = (direction: 1 | -1): void => {
		if (!viewport) return;

		const firstCard = viewport.querySelector<HTMLElement>('.cinema-release-carousel__item');
		const distance = firstCard ? firstCard.getBoundingClientRect().width + 16 : viewport.clientWidth * 0.8;
		viewport.scrollBy({ left: direction * distance * 2, behavior: 'smooth' });
	};

	previousButton?.addEventListener('click', () => scrollCards(-1));
	nextButton?.addEventListener('click', () => scrollCards(1));

	const clearPlayer = (): void => player?.replaceChildren();

	const closeDialog = (): void => {
		if (dialog?.open) dialog.close();
	};

	closeButton?.addEventListener('click', closeDialog);
	dialog?.addEventListener('click', (event) => {
		if (event.target === dialog) closeDialog();
	});
	dialog?.addEventListener('close', clearPlayer);

	carousel.addEventListener('click', (event) => {
		const trigger = (event.target as Element).closest<HTMLButtonElement>('[data-cinema-release-open]');
		const embedUrl = trigger?.dataset.cinemaReleaseEmbedUrl;
		if (!(trigger && embedUrl && dialog && player)) return;

		const title = trigger.dataset.cinemaReleaseTitle ?? 'Trailer oficial';
		const releaseDate = trigger.dataset.cinemaReleaseDate ?? '';
		const watchUrl = trigger.dataset.cinemaReleaseWatchUrl ?? 'https://www.youtube.com/';
		const frame = document.createElement('iframe');

		frame.src = embedUrl;
		frame.title = `Trailer oficial de ${title}`;
		frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
		frame.referrerPolicy = 'strict-origin-when-cross-origin';
		frame.allowFullscreen = true;

		if (dialogTitle) dialogTitle.textContent = title;
		if (dialogDate) dialogDate.textContent = formatReleaseDate(releaseDate);
		if (youtubeLink) youtubeLink.href = watchUrl;
		player.replaceChildren(frame);
		dialog.showModal();
	});
});

function formatReleaseDate(value: string): string {
	const date = new Date(`${value}T00:00:00Z`);
	if (Number.isNaN(date.getTime())) return 'Trailer oficial';

	return `Estreno ${new Intl.DateTimeFormat('es-AR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC',
	}).format(date)}`;
}
