// Keep keyboard-focused stories fully visible in the manual news rail.
// The shared marquee script also serves supporters; leave its behavior intact.
for (const marquee of document.querySelectorAll<HTMLElement>('[data-news-marquee]')) {
	marquee.addEventListener('focusin', (event) => {
		const link = event.target instanceof Element ? event.target.closest('a') : null;
		if (!link) return;
		if (window.innerWidth > 640 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		// Run after the browser's default focus scroll, which can leave most of
		// a card outside the viewport on Android even without scroll snapping.
		window.requestAnimationFrame(() => {
			if (document.activeElement !== link) return;
			link.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
		});
	});
}
