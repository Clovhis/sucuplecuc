import { expect, test } from '@playwright/test';

test('movie recommendations show concrete affinities without franchise shortcuts', async ({ page }) => {
	const response = await page.goto('/peliculas/pepita-la-pistolera-2026/', { waitUntil: 'domcontentloaded' });
	expect(response?.ok()).toBeTruthy();

	const section = page.locator('[data-movie-related-recommendations]');
	await expect(section).toBeVisible();
	await expect(section.getByRole('heading', { name: /Si te quedó ganas de más/i })).toBeVisible();
	await expect(section).not.toContainText('En común');
	await expect(section).not.toContainText('Afinidad:');
	await expect(section).not.toContainText('Otra película argentina para seguir');

	const recommendations = section.locator('.movie-detail__related-link');
	await expect(recommendations).toHaveCount(4);
	await expect(recommendations.first()).toContainText('Plata quemada');
	await expect(section.locator('.movie-detail__related-affinity')).toHaveCount(0);
	await expect(recommendations.first().locator('.movie-detail__related-title')).toHaveCSS('text-overflow', 'clip');

	const recommendationUrls = await recommendations.evaluateAll((links) => links.map((link) => link.getAttribute('href')));
	expect(recommendationUrls.some((href) => href?.includes('pepita-la-pistolera'))).toBeFalsy();
});

test('movie recommendations remain legible without horizontal overflow on narrow screens', async ({ page }) => {
	await page.setViewportSize({ width: 320, height: 720 });
	await page.goto('/peliculas/pepita-la-pistolera-2026/', { waitUntil: 'domcontentloaded' });

	const section = page.locator('[data-movie-related-recommendations]');
	await section.scrollIntoViewIfNeeded();
	await expect(section.locator('.movie-detail__related-link')).toHaveCount(4);

	const layout = await section.evaluate((element) => {
		const links = Array.from(element.querySelectorAll<HTMLElement>('.movie-detail__related-link'));
		return {
			overflows: document.documentElement.scrollWidth > window.innerWidth + 1,
			allLinksReachTouchTarget: links.every((link) => {
				const box = link.getBoundingClientRect();
				return box.width >= 44 && box.height >= 44;
			}),
		};
	});

	expect(layout.overflows).toBeFalsy();
	expect(layout.allLinksReachTouchTarget).toBeTruthy();
});
