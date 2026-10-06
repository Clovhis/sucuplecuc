import { expect, test } from '@playwright/test';

test('movie edition has a readable layout at phone, tablet and desktop widths', async ({ page }) => {
	for (const width of [320, 390, 768, 1024, 1440]) {
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/peliculas/digger-2026/', { waitUntil: 'load' });
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Digger');
		await expect(page.getByRole('navigation', { name: 'Secciones de la ficha' })).toBeVisible();
		const layout = await page.evaluate(() => {
			const rect = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
			const reading = rect('.movie-detail__hero-stack');
			const side = rect('.movie-detail__side-stack');
			const poster = rect('.movie-detail__poster');
			const title = rect('.movie-detail__title');
			return {
				overflow: document.documentElement.scrollWidth > innerWidth + 1,
				sideBelow: side.top >= reading.bottom - 1,
				sideBeside: side.left >= reading.right,
				posterBeforeTitle: poster.right <= title.left,
				controls: Array.from(
					document.querySelectorAll(
						'.movie-detail__jump-links a, .rating-stars button, .movie-share__button:not([hidden])',
					),
				).map((element) => element.getBoundingClientRect().height),
				secondaryText: Array.from(document.querySelectorAll('.movie-detail__eyebrow, .movie-detail__editorial-byline, .movie-detail__person-meta, .movie-detail__person-origin, .movie-detail__person-flag'))
					.map(element => Number.parseFloat(getComputedStyle(element).fontSize)),
				portraitTargets: Array.from(document.querySelectorAll('.movie-detail__person-avatar--link'))
					.map(element => element.getBoundingClientRect().width),
			};
		});
		expect(layout.overflow, `${width}px overflow`).toBe(false);
		expect(layout.posterBeforeTitle).toBe(true);
		expect(width <= 760 ? layout.sideBelow : layout.sideBeside).toBe(true);
		expect(Math.min(...layout.controls)).toBeGreaterThanOrEqual(44);
		expect(Math.min(...layout.secondaryText)).toBeGreaterThanOrEqual(12);
		expect(Math.min(...layout.portraitTargets)).toBeGreaterThanOrEqual(48);
	}
});

test('reading links, canonical sharing and person navigation work after the redesign', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.addInitScript(() => {
		Object.defineProperty(navigator, 'clipboard', {
			value: {
				writeText: async (value: string) => {
					(window as Window & { copiedUrl?: string }).copiedUrl = value;
				},
			},
			configurable: true,
		});
	});
	await page.goto('/peliculas/digger-2026/', { waitUntil: 'load' });
	const navigation = page.getByRole('navigation', { name: 'Secciones de la ficha' });
	await navigation.getByRole('link', { name: /Leer reseña/ }).click();
	await expect(page).toHaveURL(/#resena$/);
	await expect
		.poll(() => page.locator('#resena').evaluate((element) => element.getBoundingClientRect().top))
		.toBeGreaterThanOrEqual(0);
	await page.getByRole('button', { name: 'Copiar URL' }).click();
	await expect(page.locator('[data-share-status]')).toHaveText('Link copiado.');
	expect(await page.evaluate(() => (window as Window & { copiedUrl?: string }).copiedUrl)).toBe(
		'https://www.cineposta.com.ar/peliculas/digger-2026/',
	);
	await expect(page.getByRole('link', { name: 'Compartir Digger por WhatsApp' })).toHaveAttribute(
		'href',
		/wa\.me\/\?text=/,
	);
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
		'href',
		'https://www.cineposta.com.ar/peliculas/digger-2026/',
	);
	await page.locator('.movie-detail__person-name-link').filter({ hasText: 'Tom Cruise' }).click();
	await expect(page).toHaveURL(/\/personas\/tom-cruise\//);
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Tom Cruise');
	expect(errors).toEqual([]);
});

test('rating can be submitted and restored using the existing widget contract', async ({ page }) => {
	let vote = 0;
	let submittedSlug = '';
	await page.route('**/rest/v1/**', async (route) => {
		const url = route.request().url();
		if (url.includes('submit_movie_rating')) {
			const payload = route.request().postDataJSON();
			vote = payload.p_rating;
			submittedSlug = payload.p_movie_slug;
			await route.fulfill({ json: null });
		} else if (url.includes('get_movie_rating')) {
			await route.fulfill({ json: { rating: vote || null } });
		} else if (url.includes('movie_rating_stats')) {
			await route.fulfill({ json: { avg_rating: vote || null, vote_count: vote ? 1 : 0 } });
		} else {
			await route.continue();
		}
	});
	await page.goto('/peliculas/akira-1988/', { waitUntil: 'load' });
	const rating = page.locator('[data-rating-widget]');
	await expect(rating.locator('[data-rating-status]')).toContainText('Meté el primer voto');
	await rating.getByRole('button', { name: '4 estrellas', exact: true }).click();
	await expect(rating.locator('[data-rating-status]')).toHaveText('Tu voto: 4/5');
	expect(submittedSlug).toBe('akira-1988');
	await expect(rating.locator('.is-active')).toHaveCount(4);
	await page.reload();
	await expect(rating.locator('[data-rating-status]')).toHaveText('Tu voto: 4/5');
});

test('long titles, post-credit information and reduced motion retain their content', async ({ page }) => {
	await page.setViewportSize({ width: 320, height: 760 });
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/peliculas/everything-you-always-wanted-to-know-about-sex-but-were-afraid-to-ask-1972/', { waitUntil: 'load' });
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Todo lo que usted siempre quiso saber');
	expect(await page.getByRole('heading', { level: 1 }).evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
	await page.goto('/peliculas/ant-man-2015/', { waitUntil: 'load' });
	await expect(page.getByRole('region', { name: 'Escenas post-créditos', exact: true })).toBeVisible();
	await expect(page.locator('.movie-detail__meta .badge')).toContainText('9');
	await page.locator('[data-trailer-player]').scrollIntoViewIfNeeded();
	await expect(page.locator('[data-trailer-player] iframe')).toHaveCount(0);
});
