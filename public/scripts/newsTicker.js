const marquees = Array.from(document.querySelectorAll('[data-news-marquee]'));
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const TICKER_SPEED = 44;

const bindMediaQueryChange = (query, listener) => {
	if (typeof query.addEventListener === 'function') {
		query.addEventListener('change', listener);
		return;
	}

	if (typeof query.addListener === 'function') {
		query.addListener(listener);
	}
};

for (const marquee of marquees) {
	if (!(marquee instanceof HTMLElement)) continue;

	const track = marquee.querySelector('[data-news-track]');
	const segment = marquee.querySelector('[data-news-segment]');
	if (!(track instanceof HTMLElement) || !(segment instanceof HTMLElement)) continue;

	let frameId = 0;
	let lastFrameTime = 0;
	let offset = 0;
	let paused = false;
	let segmentWidth = 0;

	const shouldAutoScroll = () => !reduceMotion.matches && window.innerWidth > 640;
	const syncTrackPosition = () => {
		track.style.transform = `translate3d(${-offset}px, 0, 0)`;
	};

	const measure = () => {
		segmentWidth = segment.getBoundingClientRect().width;
		if (!Number.isFinite(segmentWidth) || segmentWidth <= marquee.clientWidth || !shouldAutoScroll()) {
			offset = 0;
			syncTrackPosition();
		}
	};

	const step = (time) => {
		if (lastFrameTime === 0) {
			lastFrameTime = time;
		}

		const deltaSeconds = (time - lastFrameTime) / 1000;
		lastFrameTime = time;

		if (!paused && shouldAutoScroll() && segmentWidth > marquee.clientWidth) {
			offset += deltaSeconds * TICKER_SPEED;
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

	const pause = () => {
		paused = true;
	};

	const resume = () => {
		paused = false;
		lastFrameTime = 0;
	};

	const start = () => {
		if (frameId !== 0) return;
		lastFrameTime = 0;
		frameId = window.requestAnimationFrame(step);
	};

	const stop = () => {
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
	marquee.addEventListener('focusout', (event) => {
		if (!(event.target instanceof Node)) return;
		if (event.relatedTarget instanceof Node && marquee.contains(event.relatedTarget)) return;
		resume();
	});

	window.addEventListener('resize', measure);
	document.addEventListener('visibilitychange', () => {
		lastFrameTime = 0;
	});

	const syncEnvironment = () => {
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
