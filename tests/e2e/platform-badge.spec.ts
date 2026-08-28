import { expect, test } from '@playwright/test';

const movieTitle = 'WHAM! 10 Days in China';
const moviePath = '/peliculas/wham-10-days-in-china-2026/';

test('Otras plataformas se apila y no invade las etiquetas de la tarjeta', async ({ page }) => {
	await page.goto('/?plataforma=otras%20plataformas', { waitUntil: 'domcontentloaded' });

	const card = page.locator(`[data-movie-card][data-movie-title="${movieTitle}"]`);
	await expect(card).toBeVisible();

	const badge = card.locator('.movie-card__platform-mark .platform-chip--other-platforms');
	await expect(badge).toBeVisible();
	await expect(badge.locator('.platform-label--stacked > span')).toHaveText(['Otras', 'plataformas']);

	const cardLayout = await badge.evaluate((element) => {
		const card = element.closest('[data-movie-card]');
		const category = card?.querySelector('.movie-card__cta');
		const badgeRect = element.getBoundingClientRect();
		const categoryRect = category?.getBoundingClientRect();

		return {
			badgeWidth: badgeRect.width,
			categoryRight: categoryRect?.right ?? 0,
			badgeLeft: badgeRect.left,
			cardScrollWidth: card?.scrollWidth ?? 0,
			cardClientWidth: card?.clientWidth ?? 0,
		};
	});

	expect(cardLayout.badgeWidth).toBeLessThanOrEqual(84);
	expect(cardLayout.categoryRight).toBeLessThanOrEqual(cardLayout.badgeLeft + 1);
	expect(cardLayout.cardScrollWidth).toBeLessThanOrEqual(cardLayout.cardClientWidth + 1);
});

test('Otras plataformas conserva el apilado en la ficha de película', async ({ page }) => {
	await page.goto(moviePath, { waitUntil: 'domcontentloaded' });

	const meta = page.locator('.movie-detail__meta');
	const badge = meta.locator('.platform-chip--other-platforms');

	await expect(page.getByRole('heading', { name: movieTitle, exact: true })).toBeVisible();
	await expect(badge).toBeVisible();
	await expect(badge.locator('.platform-label--stacked > span')).toHaveText(['Otras', 'plataformas']);

	const metaLayout = await meta.evaluate((element) => ({
		scrollWidth: element.scrollWidth,
		clientWidth: element.clientWidth,
	}));

	expect(metaLayout.scrollWidth).toBeLessThanOrEqual(metaLayout.clientWidth + 1);
});
