/**
 * Astro 6 client entrypoint.
 * This script is imported once from the rating component and initializes every
 * widget on the page. Astro deduplicates processed scripts, so the component
 * can be reused safely without duplicating the module.
 */

import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

const widgets = Array.from(document.querySelectorAll<HTMLElement>('[data-rating-widget]')).filter((element) => {
	if (element.dataset.ratingInitialized === 'true') return false;
	element.dataset.ratingInitialized = 'true';
	return true;
});

for (const widget of widgets) {
	void setupRatingWidget(widget);
}

function getVisitorToken(): string {
	const storageKey = 'la-posta-cine-visitor-token';
	const currentToken = localStorage.getItem(storageKey);
	if (currentToken) return currentToken;

	const nextToken = createVisitorToken();
	localStorage.setItem(storageKey, nextToken);
	return nextToken;
}

function createVisitorToken(): string {
	if (typeof crypto !== 'undefined') {
		if (typeof crypto.randomUUID === 'function') {
			return crypto.randomUUID();
		}

		if (typeof crypto.getRandomValues === 'function') {
			const bytes = crypto.getRandomValues(new Uint8Array(16));
			return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
		}
	}

	return `${Date.now()}-${Math.random().toString(36).slice(2, 18)}`;
}

function formatAverage(value: number): string {
	if (Number.isNaN(value)) return 'Sin promedio todavía';
	return `${value.toFixed(1)}/5`;
}

async function setupRatingWidget(widget: HTMLElement): Promise<void> {
	const movieSlug = widget.dataset.movieSlug ?? '';
	const averageNode = widget.querySelector<HTMLElement>('[data-rating-average]');
	const countNode = widget.querySelector<HTMLElement>('[data-rating-count]');
	const statusNode = widget.querySelector<HTMLElement>('[data-rating-status]');
	const stars = Array.from(widget.querySelectorAll<HTMLButtonElement>('[data-star-value]'));

	if (!movieSlug || !(averageNode && countNode && statusNode)) {
		return;
	}

	const averageEl = averageNode;
	const countEl = countNode;
	const statusEl = statusNode;
	const client = supabase;
	if (!isSupabaseConfigured || !client) {
		averageEl.textContent = 'Rating no disponible';
		countEl.textContent = 'Probá más tarde';
		statusEl.textContent = 'La tribuna no está disponible ahora.';
		return;
	}

	const ratingClient = client;

	const visitorToken = getVisitorToken();
	let currentVote = 0;
	let isSubmitting = false;

	function paintStars(activeValue: number): void {
		for (const star of stars) {
			const starValue = Number(star.getAttribute('data-star-value') ?? '0');
			star.classList.toggle('is-active', starValue <= activeValue);
		}
	}

	function setDisabled(nextState: boolean): void {
		for (const star of stars) {
			star.disabled = nextState;
		}
	}

	async function loadStatsAndVote(): Promise<void> {
		statusEl.textContent = 'Preparando la tribuna...';

		const [statsResponse, voteResponse] = await Promise.all([
			ratingClient
				.from('movie_rating_stats')
				.select('avg_rating,vote_count')
				.eq('movie_slug', movieSlug)
				.maybeSingle(),
			ratingClient
				.rpc('get_movie_rating', {
					p_movie_slug: movieSlug,
					p_visitor_token: visitorToken,
				})
				.maybeSingle(),
		]);

		if (statsResponse.error || voteResponse.error) {
			averageEl.textContent = 'Rating no disponible';
			countEl.textContent = 'Probá más tarde';
			statusEl.textContent = 'No se pudo cargar el rating ahora.';
			return;
		}

		const voteCount = statsResponse.data?.vote_count ?? 0;
		averageEl.textContent = voteCount > 0 ? formatAverage(statsResponse.data?.avg_rating ?? Number.NaN) : 'Sin promedio todavía';
		countEl.textContent = voteCount === 0 ? 'Todavía sin votos' : voteCount === 1 ? '1 voto' : `${voteCount} votos`;

		const voteData = voteResponse.data as { rating?: number | null } | null;
		currentVote = Number(voteData?.rating ?? 0);
		paintStars(currentVote);
		statusEl.textContent =
			currentVote > 0
				? `Tu voto: ${currentVote}/5`
				: voteCount === 0
					? 'Todavía sin votos. Sé el primero en puntuarla.'
					: 'Todavía no votaste esta peli.';
	}

	async function submitVote(nextVote: number): Promise<void> {
		if (isSubmitting) return;

		isSubmitting = true;
		setDisabled(true);
		statusEl.textContent = 'Guardando voto...';

		const { error } = await ratingClient.rpc('submit_movie_rating', {
			p_movie_slug: movieSlug,
			p_visitor_token: visitorToken,
			p_rating: nextVote,
		});

		if (error) {
			statusEl.textContent = 'No se pudo guardar tu voto.';
			setDisabled(false);
			isSubmitting = false;
			paintStars(currentVote);
			return;
		}

		currentVote = nextVote;
		paintStars(currentVote);
		statusEl.textContent = `Gracias por votar. Tu voto: ${currentVote}/5`;
		await loadStatsAndVote();
		setDisabled(false);
		isSubmitting = false;
	}

	for (const star of stars) {
		const value = Number(star.dataset.starValue ?? '0');

		star.addEventListener('mouseenter', () => {
			if (!isSubmitting) paintStars(value);
		});

		star.addEventListener('focus', () => {
			if (!isSubmitting) paintStars(value);
		});

		star.addEventListener('click', () => {
			if (value >= 1 && value <= 5) {
				void submitVote(value);
			}
		});
	}

	const starsWrap = widget.querySelector<HTMLElement>('.rating-stars');
	starsWrap?.addEventListener('mouseleave', () => {
		if (!isSubmitting) paintStars(currentVote);
	});

	await loadStatsAndVote();
}
