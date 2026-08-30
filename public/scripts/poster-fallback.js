(() => {
	const currentScript = document.currentScript;
	const posterFallbackUrl =
		currentScript instanceof HTMLScriptElement
			? currentScript.dataset.posterFallbackUrl || '/posters/poster-fallback-cineposta.png'
			: '/posters/poster-fallback-cineposta.png';
	const posterSelector = 'img[data-cineposta-poster]';
	const posterFallbackStates = new WeakMap();
	const catalogPosterSearches = new Map();
	const posterSearchQuery = `
		query SearchTitles($searchQuery: String!, $country: Country!, $language: Language!) {
			popularTitles(
				country: $country
				first: 10
				filter: { searchQuery: $searchQuery, objectTypes: [MOVIE] }
			) {
				edges {
					node {
						... on Movie {
							content(country: $country, language: $language) {
								title
								originalTitle
								originalReleaseYear
								posterUrl
							}
						}
					}
				}
			}
		}
	`;

	const normalizePosterUrl = (value) => {
		if (!value) return '';

		try {
			return new URL(value, document.baseURI).href;
		} catch {
			return value;
		}
	};

	const normalizedFinalFallbackUrl = normalizePosterUrl(posterFallbackUrl);
	const uniquePosterUrls = (values) => Array.from(new Set(values.filter(Boolean)));
	const normalizeSearchText = (value) =>
		String(value ?? '')
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, ' ')
			.trim();

	const getDeclaredPosterFallbacks = (image) =>
		(image.dataset.posterFallbacks ?? '')
			.split('|')
			.map((value) => normalizePosterUrl(value.trim()))
			.filter(Boolean);

	const getPosterSearchTitle = (image) => {
		const declaredTitle = image.dataset.posterSearchTitle?.trim();
		if (declaredTitle) return declaredTitle;

		return image.alt.replace(/^(?:p[oó]ster|miniatura del trailer)\s+de\s+/i, '').trim();
	};

	const getPosterSearchYear = (image) => {
		const year = Number.parseInt(image.dataset.posterSearchYear ?? '', 10);
		return Number.isInteger(year) && year >= 1888 && year <= 2200 ? year : undefined;
	};

	const getProviderPosterFallbacks = (source) => {
		const normalizedSource = normalizePosterUrl(source);
		if (!/^https?:\/\//i.test(normalizedSource)) return [];

		let parsedSource;
		try {
			parsedSource = new URL(normalizedSource);
		} catch {
			return [];
		}

		const fallbacks = [];
		const hostname = parsedSource.hostname.toLowerCase();
		if (hostname === 'images.justwatch.com') {
			const match = parsedSource.pathname.match(/^\/poster\/(\d+)\/([^/]+)\/([^/.]+)\.([a-z0-9]+)$/i);
			if (match) {
				const [, posterId, currentProfile, basename, currentFormat] = match;
				const profiles = ['s718', 's592', 's400', 's166'];
				const formats = [currentFormat.toLowerCase(), 'webp', 'jpg'];

				for (const profile of profiles) {
					for (const format of formats) {
						if (profile === currentProfile && format === currentFormat.toLowerCase()) continue;
						fallbacks.push(`https://images.justwatch.com/poster/${posterId}/${profile}/${basename}.${format}`);
					}
				}
			}
		}

		if (hostname === 'media.themoviedb.org' || hostname === 'image.tmdb.org') {
			const match = parsedSource.pathname.match(/^\/t\/p\/([^/]+)\/(.+)$/i);
			if (match) {
				const [, currentSize, imagePath] = match;
				const sizes = ['w780', 'w500', 'w342'];
				const hosts = ['media.themoviedb.org', 'image.tmdb.org'];

				for (const host of hosts) {
					for (const size of sizes) {
						if (host === hostname && size === currentSize) continue;
						fallbacks.push(`https://${host}/t/p/${size}/${imagePath}`);
					}
				}
			}
		}

		return fallbacks;
	};

	const getProxyPosterFallback = (source) => {
		const normalizedSource = normalizePosterUrl(source);
		if (!/^https?:\/\//i.test(normalizedSource)) return [];

		try {
			const hostname = new URL(normalizedSource).hostname.toLowerCase();
			return hostname === 'images.weserv.nl'
				? []
				: [`https://images.weserv.nl/?url=${encodeURIComponent(normalizedSource)}`];
		} catch {
			return [];
		}
	};

	const normalizeCatalogPosterUrl = (value) => {
		if (!value) return '';

		try {
			// JustWatch's GraphQL API returns posterUrl as a profile/format
			// template. Resolve it before assigning it to <img>; otherwise the
			// browser requests the literal encoded placeholders.
			const concreteValue = String(value)
				.replaceAll('{profile}', 's718')
				.replaceAll('{format}', 'jpg');
			const url = new URL(concreteValue, 'https://images.justwatch.com');
			return url.hostname.toLowerCase() === 'images.justwatch.com' ? url.href : '';
		} catch {
			return '';
		}
	};

	const getCatalogCandidateScore = (candidate, title, year) => {
		const candidateTitles = [candidate.title, candidate.originalTitle]
			.map(normalizeSearchText)
			.filter(Boolean);
		const normalizedTitle = normalizeSearchText(title);
		const candidateYear = Number(candidate.originalReleaseYear);
		const exactTitle = candidateTitles.some((candidateTitle) => candidateTitle === normalizedTitle);
		const titleMatches = candidateTitles.some(
			(candidateTitle) =>
				candidateTitle === normalizedTitle ||
				candidateTitle.includes(normalizedTitle) ||
				normalizedTitle.includes(candidateTitle),
		);

		if (!normalizedTitle || !titleMatches) return Number.NEGATIVE_INFINITY;
		// JustWatch sometimes exposes the first market/festival year instead of
		// the localized catalog year. Permit that one-year drift only for an
		// exact title match; the year remains a hard disambiguator otherwise.
		if (year !== undefined && candidateYear !== year && (!exactTitle || Math.abs(candidateYear - year) > 1)) {
			return Number.NEGATIVE_INFINITY;
		}

		const yearScore = year === undefined ? 0 : candidateYear === year ? 20 : 5;
		return (exactTitle ? 100 : 50) + yearScore + (Number.isInteger(candidateYear) ? 1 : 0);
	};

	const fetchCatalogPosterFallbacks = async (image) => {
		const title = getPosterSearchTitle(image);
		if (!title) return [];

		const year = getPosterSearchYear(image);
		const searchKey = `${normalizeSearchText(title)}|${year ?? ''}`;
		if (!searchKey || searchKey === '|') return [];

		if (!catalogPosterSearches.has(searchKey)) {
			catalogPosterSearches.set(searchKey, requestCatalogPosterFallbacks(title, year));
		}

		try {
			return await catalogPosterSearches.get(searchKey);
		} catch {
			catalogPosterSearches.delete(searchKey);
			return [];
		}
	};

	const requestCatalogPosterFallbacks = async (title, year) => {
		const controller = new AbortController();
		const timeoutId = window.setTimeout(() => controller.abort(), 4500);

		try {
			const response = await fetch('https://apis.justwatch.com/graphql', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					query: posterSearchQuery,
					variables: { searchQuery: title, country: 'AR', language: 'es' },
				}),
				signal: controller.signal,
			});

			if (!response.ok) return [];
			const payload = await response.json();
			if (Array.isArray(payload.errors)) return [];

			const candidates = (payload.data?.popularTitles?.edges ?? [])
				.map((edge) => edge?.node?.content)
				.filter((candidate) => candidate?.posterUrl)
				.map((candidate) => ({
					...candidate,
					posterUrl: normalizeCatalogPosterUrl(candidate.posterUrl),
				}))
				.filter((candidate) => candidate.posterUrl)
				.map((candidate) => ({
					candidate,
					score: getCatalogCandidateScore(candidate, title, year),
				}))
				.filter(({ score }) => Number.isFinite(score))
				.sort((left, right) => right.score - left.score)
				.map(({ candidate }) => candidate);

			return uniquePosterUrls(
				candidates.flatMap((candidate) => [
					candidate.posterUrl,
					...getProviderPosterFallbacks(candidate.posterUrl),
					...getProxyPosterFallback(candidate.posterUrl),
				]),
			);
		} catch {
			return [];
		} finally {
			window.clearTimeout(timeoutId);
		}
	};

	const appendCandidates = (state, values) => {
		uniquePosterUrls(values).forEach((value) => {
			if (value !== normalizedFinalFallbackUrl && !state.attempted.has(value) && !state.candidates.includes(value)) {
				state.candidates.push(value);
			}
		});
	};

	const applyNextSource = (image, state) => {
		const nextSource = state.candidates[state.nextIndex];
		if (!nextSource) return false;

		state.nextIndex += 1;
		state.attempted.add(nextSource);
		image.removeAttribute('srcset');
		image.removeAttribute('sizes');
		image.dataset.posterFallbackAttempt = String(state.nextIndex);
		image.dataset.posterFallbackState = 'retrying';
		image.src = nextSource;
		return true;
	};

	const getPosterFallbackState = (image) => {
		const existingState = posterFallbackStates.get(image);
		if (existingState) return existingState;

		const originalSource = normalizePosterUrl(image.currentSrc || image.src);
		const candidates = uniquePosterUrls([
			...getDeclaredPosterFallbacks(image),
			...getProviderPosterFallbacks(originalSource),
		]).filter((value) => value !== originalSource && value !== normalizedFinalFallbackUrl);
		const state = {
			candidates,
			nextIndex: 0,
			attempted: new Set([originalSource]),
			catalogSearchAttempted: false,
			searching: false,
			proxyCandidates: getProxyPosterFallback(originalSource),
			proxyCandidatesAppended: false,
		};
		posterFallbackStates.set(image, state);
		return state;
	};

	const applyFinalFallback = (image) => {
		image.dataset.posterFallbackApplied = 'true';
		image.dataset.posterFallbackState = 'contingency';
		image.removeAttribute('srcset');
		image.removeAttribute('sizes');
		image.alt = image.alt.trim()
			? `${image.alt.trim()} (ilustración de contingencia: póster no disponible)`
			: 'Ilustración de contingencia: póster no disponible';
		image.src = posterFallbackUrl;
	};

	const handlePosterError = async (event) => {
		const image = event.target;
		if (!(image instanceof HTMLImageElement) || !image.matches(posterSelector) || image.dataset.posterFallbackApplied === 'true') {
			return;
		}

		const state = getPosterFallbackState(image);
		if (state.searching) return;
		if (applyNextSource(image, state)) {
			return;
		}

		if (!state.catalogSearchAttempted) {
			state.catalogSearchAttempted = true;
			state.searching = true;
			image.dataset.posterFallbackState = 'searching';
			const catalogCandidates = await fetchCatalogPosterFallbacks(image);
			state.searching = false;

			if (image.dataset.posterFallbackApplied === 'true') return;
			appendCandidates(state, catalogCandidates);
			if (applyNextSource(image, state)) return;
		}

		if (!state.proxyCandidatesAppended) {
			state.proxyCandidatesAppended = true;
			appendCandidates(state, state.proxyCandidates);
			if (applyNextSource(image, state)) return;
		}

		applyFinalFallback(image);
	};

	document.addEventListener('error', (event) => {
		void handlePosterError(event);
	}, true);
})();
