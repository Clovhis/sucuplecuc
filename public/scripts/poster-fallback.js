(() => {
	const currentScript = document.currentScript;
	const fallbackUrl = currentScript instanceof HTMLScriptElement
		? currentScript.dataset.posterFallbackUrl || '/assets/posters/poster-fallback.webp'
		: '/assets/posters/poster-fallback.webp';
	const selector = 'img[data-cineposta-poster]';

	function applyFallback(image) {
		if (!(image instanceof HTMLImageElement) || image.dataset.posterFallbackApplied === 'true') return;
		image.dataset.posterFallbackApplied = 'true';
		image.dataset.posterFallbackState = 'contingency';
		image.src = fallbackUrl;
	}

	function observe(image) {
		if (!(image instanceof HTMLImageElement) || image.dataset.posterFallbackObserved === 'true') return;
		image.dataset.posterFallbackObserved = 'true';
		image.addEventListener('error', () => applyFallback(image));
		if (image.complete && image.currentSrc && image.naturalWidth === 0) applyFallback(image);
	}

	function observeAll(root = document) {
		root.querySelectorAll?.(selector).forEach(observe);
	}

	observeAll();
	new MutationObserver((records) => {
		for (const record of records) {
			for (const node of record.addedNodes) {
				if (!(node instanceof Element)) continue;
				if (node.matches(selector)) observe(node);
				observeAll(node);
			}
		}
	}).observe(document.documentElement, { childList: true, subtree: true });
})();
