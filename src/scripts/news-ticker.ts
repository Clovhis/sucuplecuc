/**
 * Astro 6 client entrypoint.
 * The ticker now lives in `src/scripts` so Astro can bundle and typecheck it
 * instead of serving an opaque file from `public/`.
 */

const marquees = Array.from(
	document.querySelectorAll<HTMLElement>('[data-news-marquee], [data-marquee-root]'),
);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const TICKER_SPEED = 44;

const bindMediaQueryChange = (
	query: MediaQueryList,
	listener: (event: MediaQueryListEvent) => void,
): void => {
	if (typeof query.addEventListener === 'function') {
		query.addEventListener('change', listener);
		return;
	}

	const legacyAddListener = (
		query as MediaQueryList & {
			addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
		}
	).addListener;

	if (typeof legacyAddListener === 'function') {
		legacyAddListener.call(query, listener);
	}
};

for (const marquee of marquees) {
	const track = marquee.querySelector<HTMLElement>('[data-news-track], [data-marquee-track]');
	const segment = marquee.querySelector<HTMLElement>('[data-news-segment], [data-marquee-segment]');
	if (!(track && segment)) continue;

	const direction = marquee.dataset.marqueeDirection === 'ltr' ? 'ltr' : 'rtl';
	const speed = Number.parseFloat(marquee.dataset.marqueeSpeed ?? '') || TICKER_SPEED;
	const allowMobileAutoplay = marquee.dataset.marqueeMobileAutoplay === 'true';

	let frameId = 0;
	let lastFrameTime = 0;
	let offset = 0;
	let paused = false;
	let segmentWidth = 0;
	let trackWidth = 0;

	const shouldAutoScroll = (): boolean =>
		!reduceMotion.matches && (allowMobileAutoplay || window.innerWidth > 640);
	const canLoop = (): boolean => trackWidth > marquee.clientWidth && segmentWidth > 0;

	const syncTrackPosition = (): void => {
		if (!shouldAutoScroll() || !canLoop()) {
			track.style.transform = 'translate3d(0, 0, 0)';
			return;
		}

		const translateX = direction === 'ltr' ? offset - segmentWidth : -offset;
		track.style.transform = `translate3d(${translateX}px, 0, 0)`;
	};

	const measure = (): void => {
		segmentWidth = segment.getBoundingClientRect().width;
		trackWidth = track.scrollWidth;
		if (
			!Number.isFinite(segmentWidth) ||
			!Number.isFinite(trackWidth) ||
			trackWidth <= marquee.clientWidth ||
			!shouldAutoScroll()
		) {
			offset = 0;
			syncTrackPosition();
			return;
		}

		syncTrackPosition();
	};

	const step = (time: number): void => {
		if (lastFrameTime === 0) {
			lastFrameTime = time;
		}

		const deltaSeconds = (time - lastFrameTime) / 1000;
		lastFrameTime = time;

		if (!paused && shouldAutoScroll() && canLoop()) {
			offset += deltaSeconds * speed;
			if (offset >= segmentWidth) {
				offset -= segmentWidth;
			}

			syncTrackPosition();
		} else if (offset !== 0 && !shouldAutoScroll()) {
			offset = 0;
			syncTrackPosition();
		}

		frameId = window.requestAnimationFrame(step);
	};

	const pause = (): void => {
		paused = true;
	};

	const resume = (): void => {
		paused = false;
		lastFrameTime = 0;
	};

	const start = (): void => {
		if (frameId !== 0) return;
		lastFrameTime = 0;
		frameId = window.requestAnimationFrame(step);
	};

	const stop = (): void => {
		if (frameId === 0) return;
		window.cancelAnimationFrame(frameId);
		frameId = 0;
		lastFrameTime = 0;
	};

	measure();
	start();

	marquee.addEventListener('pointerenter', pause);
	marquee.addEventListener('pointerleave', resume);
	marquee.addEventListener('pointerdown', pause);
	marquee.addEventListener('pointerup', resume);
	marquee.addEventListener('pointercancel', resume);
	marquee.addEventListener('focusin', pause);
	marquee.addEventListener('focusout', (event: FocusEvent) => {
		if (event.relatedTarget instanceof Node && marquee.contains(event.relatedTarget)) return;
		resume();
	});

	window.addEventListener('resize', measure);
	document.addEventListener('visibilitychange', () => {
		lastFrameTime = 0;
	});

	const syncEnvironment = (): void => {
		lastFrameTime = 0;
		measure();
	};

	bindMediaQueryChange(reduceMotion, syncEnvironment);
	window.addEventListener('pagehide', () => {
		stop();
	});
	window.addEventListener('pageshow', () => {
		measure();
		resume();
		start();
	});
}
