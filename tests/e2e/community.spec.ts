import { expect, test } from '@playwright/test';

test('community page renders safely while FastComments is not configured', async ({ page }) => {
	const pageErrors: string[] = [];
	page.on('pageerror', (error) => pageErrors.push(error.message));

	const response = await page.goto('/comunidad/', { waitUntil: 'networkidle' });

	expect(response?.ok()).toBeTruthy();
	await expect(page).toHaveTitle(/La Sala.*Cine Posta/i);
	await expect(page.getByRole('heading', { name: 'La Sala' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Tema de la semana' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Reglas de convivencia' })).toBeVisible();
	await expect(page.getByRole('status')).toContainText(/La conversación está pausada/i);
	await expect(page.getByRole('link', { name: 'Comunidad' }).first()).toHaveAttribute('href', '/comunidad/');
	expect(pageErrors).toEqual([]);
});
