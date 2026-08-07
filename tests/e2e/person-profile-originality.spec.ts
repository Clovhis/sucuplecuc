import { expect, test } from '@playwright/test';

test('an approved person profile remains indexable and keeps its editorial biography', async ({ page }) => {
	const response = await page.goto('/personas/brad-pitt/', { waitUntil: 'domcontentloaded' });

	expect(response?.ok()).toBeTruthy();
	await expect(page.locator('[data-person-editorial-status="approved"]')).toHaveCount(1);
	await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /index, follow/);
	await expect(page.getByRole('heading', { name: 'Biografía de Brad Pitt' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Fuentes consultables' })).toBeVisible();
});

test('the sitemap includes approved person profiles', async ({ page }) => {
	const response = await page.goto('/sitemap.xml');

	expect(response?.ok()).toBeTruthy();
	expect(await response?.text()).toContain('/personas/brad-pitt/');
});
