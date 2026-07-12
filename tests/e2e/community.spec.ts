import { expect, test } from '@playwright/test';

test('community forum renders safely while it is not configured', async ({ page }) => {
	const pageErrors: string[] = [];
	page.on('pageerror', (error) => pageErrors.push(error.message));

	const response = await page.goto('/comunidad/', { waitUntil: 'domcontentloaded' });

	expect(response?.ok()).toBeTruthy();
	await expect(page).toHaveTitle(/Foro Cineposta.*Cine Posta/i);
	await expect(page.getByRole('heading', { name: 'Foro Cineposta' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Discusiones recientes' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Código de la sala' })).toBeVisible();
	await expect(page.locator('.community-discussion-list a').first()).toBeVisible();
	await expect(page.getByRole('link', { name: 'Comunidad' }).first()).toHaveAttribute('href', '/comunidad/');
	expect(pageErrors).toEqual([]);
});

test('movie discussion is a static route with a safe community state', async ({ page }) => {
	const pageErrors: string[] = [];
	page.on('pageerror', (error) => pageErrors.push(error.message));
	const response = await page.goto('/comunidad/peliculas/akira-1988/', { waitUntil: 'domcontentloaded' });

	expect(response?.ok()).toBeTruthy();
	await expect(page.getByRole('heading', { name: 'Akira' })).toBeVisible();
	await expect(page.locator('[data-community-comments-status]')).toHaveCount(1);
	expect(pageErrors).toEqual([]);
});
