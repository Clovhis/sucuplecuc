import { expect, test } from '@playwright/test';

test('closing home artwork stays large, proportional and clear of copy and links', async ({ page }, testInfo) => {
	await page.goto('/', { waitUntil: 'domcontentloaded' });
	await expect(page.locator('.editorial-rankings, #editorial-ranking-data')).toHaveCount(0);
	await expect(page.getByRole('heading', { name: 'Sugerencias rápidas', exact: true })).toHaveCount(0);
	const widths = testInfo.project.name.startsWith('mobile-') ? [320, 390, 844] : [768, 1280];
	for (const width of widths) {
		await page.setViewportSize({ width, height: 900 });
		for (const selector of ['.home-actor-game', '.home-community-promo']) {
			const section = page.locator(selector);
			await section.scrollIntoViewIfNeeded();
			const artwork = section.locator('img');
			await expect(artwork).toBeVisible();
			await expect.poll(() => artwork.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBeTruthy();
			const metrics = await section.evaluate((node) => {
				const image = node.querySelector('img')!;
				const content = node.querySelector('[class$="__content"]')!;
				const link = node.querySelector('.home-actor-game__cta, .home-community-promo a')!;
				const art = image.getBoundingClientRect();
				const bounds = node.getBoundingClientRect();
				const copy = content.getBoundingClientRect();
				const cta = link.getBoundingClientRect();
				return {
					contained: art.left >= bounds.left - 1 && art.right <= bounds.right + 1 && art.top >= bounds.top - 1 && art.bottom <= bounds.bottom + 1,
					clear: art.left >= copy.right - 1 || art.top >= copy.bottom - 1,
					width: art.width,
					ratio: art.width / art.height,
					naturalRatio: image.naturalWidth / image.naturalHeight,
					linkHeight: cta.height,
				};
			});
			expect(metrics.contained, `${selector} at ${width}px`).toBeTruthy();
			expect(metrics.clear, `${selector} overlaps copy at ${width}px`).toBeTruthy();
			expect(metrics.width).toBeGreaterThanOrEqual(width <= 720 ? width - 34 : 260);
			expect(metrics.ratio).toBeCloseTo(metrics.naturalRatio, 2);
			expect(metrics.linkHeight).toBeGreaterThanOrEqual(44);
		}
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
	}
});

test('home game and community links still open their destinations', async ({ page }) => {
	await page.goto('/');
	await page.locator('.home-actor-game__link').click();
	await expect(page).toHaveURL(/\/juegos\/simulador-carrera-actor\/$/);
	await expect(page.getByRole('heading', { name: 'Construí tu carrera actoral', exact: true })).toBeVisible();
	await page.goto('/');
	await page.locator('.home-community-promo a').click();
	await expect(page).toHaveURL(/\/comunidad\/$/);
	await expect(page.getByRole('heading', { name: 'Foro Cineposta', exact: true })).toBeVisible();
});
