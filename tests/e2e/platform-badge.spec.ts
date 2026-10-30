import { expect, test, type Page } from '@playwright/test';

test('two platform badges wrap inside technical credits on a narrow screen', async ({ page }) => {
	await page.setViewportSize({ width: 320, height: 760 });
	await page.goto('/peliculas/rebirth-home-sweet-home-2025/');
	const value = page.locator('.movie-detail__technical .movie-detail__platform-value');
	const badges = value.locator('.platform-badge-group__item');
	await expect(badges).toHaveCount(2);
	for (const badge of await badges.all()) {
		await expect(badge).toBeVisible();
		const bounds = await badge.boundingBox();
		expect(bounds!.x).toBeGreaterThanOrEqual(0);
		expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
	}
});

// Availability changes: exercise a currently rendered card instead of pinning a title.
async function getOtherPlatformsCard(page: Page) {
	await page.goto('/?plataforma=otras%20plataformas', { waitUntil: 'load' });
	await page.evaluate(() => document.fonts.ready);
	const card = page.locator('[data-movie-card]').filter({ has: page.locator('.platform-chip--other-platforms') }).first();
	await expect(card).toBeVisible();
	return card;
}

test('Otras plataformas se apila y no invade las etiquetas de la tarjeta', async ({ page }) => {
	const card = await getOtherPlatformsCard(page);

	const badge = card.locator('.movie-card__platform-mark .platform-chip--other-platforms');
	await expect(badge).toBeVisible();
	await expect(badge.locator('.platform-label--stacked > span')).toHaveText(['Otras', 'plataformas']);

	const cardLayout = await badge.evaluate((element) => {
		const card = element.closest('[data-movie-card]');
		const category = card?.querySelector('.movie-card__genres');
		const badgeRect = element.getBoundingClientRect();
		const categoryRect = category?.getBoundingClientRect();

		return {
			badgeWidth: badgeRect.width,
			overlapsGenres: Boolean(categoryRect && categoryRect.right > badgeRect.left && categoryRect.left < badgeRect.right && categoryRect.bottom > badgeRect.top && categoryRect.top < badgeRect.bottom),
			cardScrollWidth: card?.scrollWidth ?? 0,
			cardClientWidth: card?.clientWidth ?? 0,
		};
	});

	expect(cardLayout.badgeWidth).toBeLessThanOrEqual(84);
	expect(cardLayout.overlapsGenres).toBeFalsy();
	expect(cardLayout.cardScrollWidth).toBeLessThanOrEqual(cardLayout.cardClientWidth + 1);
});

test('Otras plataformas conserva el apilado en la ficha de película', async ({ page }) => {
	const card = await getOtherPlatformsCard(page);
	const movieTitle = await card.getAttribute('data-movie-title');
	const moviePath = await card.locator('.movie-card__link').getAttribute('href');
	expect(movieTitle).toBeTruthy();
	expect(moviePath).toBeTruthy();
	await page.goto(moviePath!, { waitUntil: 'domcontentloaded' });

	const meta = page.locator('.movie-detail__watch');
	const badge = meta.locator('.platform-chip--other-platforms');

	await expect(page.getByRole('heading', { name: movieTitle!, exact: true })).toBeVisible();
	await expect(badge).toBeVisible();
	await expect(badge.locator('.platform-label--stacked > span')).toHaveText(['Otras', 'plataformas']);

	const metaLayout = await meta.evaluate((element) => ({
		scrollWidth: element.scrollWidth,
		clientWidth: element.clientWidth,
	}));

	expect(metaLayout.scrollWidth).toBeLessThanOrEqual(metaLayout.clientWidth + 1);
});
