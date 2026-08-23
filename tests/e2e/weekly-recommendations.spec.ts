import { expect, test } from '@playwright/test';

test('weekly recommendations link posters directly to movie details without trailers', async ({ page }) => {
	await page.goto('/', { waitUntil: 'domcontentloaded' });

	const carousel = page.locator('[data-weekly-recommendations-carousel]');
	await expect(carousel).toBeVisible();
	await expect(carousel.getByRole('heading', { name: 'Recomendadas de la semana' })).toBeVisible();

	const cards = carousel.locator('[data-weekly-recommendation-card]');
	expect(await cards.count()).toBeGreaterThanOrEqual(4);
	await expect(carousel.locator('iframe')).toHaveCount(0);
	await expect(carousel.locator('[data-cinema-release-open]')).toHaveCount(0);
	await expect(carousel.locator('button')).toHaveCount(2);

	const cardData = await cards.evaluateAll((elements) =>
		elements.map((element) => ({
			verdict: element.getAttribute('data-weekly-recommendation-verdict') ?? '',
			platform: element.getAttribute('data-weekly-recommendation-platform') ?? '',
			era: element.getAttribute('data-weekly-recommendation-era') ?? '',
		})),
	);

	expect(cardData.every(({ verdict }) => !/zafa|mas\s*o\s*menos/i.test(verdict))).toBeTruthy();
	expect(cardData.every(({ platform }) => platform !== 'Cine' && platform !== 'Otras plataformas')).toBeTruthy();
	expect(cardData.some(({ era }) => era === 'Novedad')).toBeTruthy();
	expect(cardData.some(({ era }) => era === 'Clásica')).toBeTruthy();

	const firstPoster = cards.first().locator('[data-weekly-recommendation-poster]');
	await expect(firstPoster).toHaveAttribute('href', /\/peliculas\/[^/]+\/$/);
	await firstPoster.click();
	await expect(page).toHaveURL(/\/peliculas\/[^/]+\/$/);
});

test('weekly recommendations stay aligned at a narrow mobile width', async ({ page }, testInfo) => {
	test.skip(!testInfo.project.name.startsWith('mobile'), 'Narrow alignment is covered by the mobile projects.');
	await page.setViewportSize({ width: 320, height: 844 });
	await page.goto('/', { waitUntil: 'domcontentloaded' });

	const carousel = page.locator('[data-weekly-recommendations-carousel]');
	await expect(carousel).toBeVisible();

	const metrics = await carousel.evaluate((element) => {
		const section = element.getBoundingClientRect();
		const heading = element.querySelector<HTMLElement>('.weekly-recommendations__heading')?.getBoundingClientRect();
		const controls = element.querySelector<HTMLElement>('.weekly-recommendations__controls')?.getBoundingClientRect();
		const viewport = element.querySelector<HTMLElement>('[data-weekly-recommendations-viewport]')?.getBoundingClientRect();

		return {
			documentWidth: document.documentElement.scrollWidth,
			innerWidth: window.innerWidth,
			sectionLeft: section.left,
			sectionRight: section.right,
			headingBottom: heading?.bottom ?? 0,
			controlsTop: controls?.top ?? 0,
			controlsRight: controls?.right ?? 0,
			viewportRight: viewport?.right ?? 0,
		};
	});

	expect(metrics.documentWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);
	expect(metrics.sectionLeft).toBeGreaterThanOrEqual(-1);
	expect(metrics.sectionRight).toBeLessThanOrEqual(metrics.innerWidth + 1);
	expect(metrics.controlsTop).toBeGreaterThanOrEqual(metrics.headingBottom);
	expect(metrics.controlsRight).toBeLessThanOrEqual(metrics.sectionRight + 1);
	expect(metrics.viewportRight).toBeLessThanOrEqual(metrics.sectionRight + 1);
});
