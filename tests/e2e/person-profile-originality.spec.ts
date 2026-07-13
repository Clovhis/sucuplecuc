import { expect, test } from '@playwright/test';

test('a pending person profile keeps factual links but not the legacy biography', async ({ page }) => {
	const response = await page.goto('/personas/brad-pitt/', { waitUntil: 'domcontentloaded' });

	expect(response?.ok()).toBeTruthy();
	await expect(page.locator('[data-person-editorial-status="pending"]')).toHaveCount(1);
	await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex, follow/);
	await expect(page.getByRole('heading', { name: 'Fuentes consultables' })).toBeVisible();
	await expect(page.locator('script[src*="adsbygoogle"]')).toHaveCount(0);
	expect(await page.locator('main').innerText()).not.toContain('William Bradley Pitt nació el 18 de diciembre de 1963');
});

test('the sitemap excludes pending person profiles', async ({ page }) => {
	const response = await page.goto('/sitemap.xml');

	expect(response?.ok()).toBeTruthy();
	expect(await response?.text()).not.toContain('/personas/brad-pitt/');
});
