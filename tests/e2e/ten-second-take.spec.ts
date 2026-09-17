import { expect, test } from '@playwright/test';

test('La Posta en 10 segundos shows only explicit, film-specific editorial copy', async ({ page }) => {
	await page.goto('/peliculas/un-cuento-chino-2011/', { waitUntil: 'domcontentloaded' });

	const take = page.locator('.movie-detail__ten-second-card');
	await expect(take).toBeVisible();
	await expect(take.getByRole('heading', { name: '¿La miro?' })).toBeVisible();
	await expect(take.locator('.movie-detail__ten-second-verdict')).toContainText('Sebastián Borensztein');
	await expect(take.locator('dt')).toHaveText(['Qué vas a ver', 'Ritmo', 'Intensidad', 'En la práctica']);
	await expect(take).toContainText('Te va a gustar si');
	await expect(take).toContainText('Quizás no es para vos si');
	await expect(take).not.toContainText('Cinco señales rápidas para ubicarte');

	const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
	expect(hasHorizontalOverflow).toBeFalsy();
});

test('backfilled entries render their explicit, film-specific copy', async ({ page }) => {
	await page.goto('/peliculas/akira-1988/', { waitUntil: 'domcontentloaded' });
	const take = page.locator('.movie-detail__ten-second-card');
	await expect(take).toBeVisible();
	await expect(take.locator('.movie-detail__ten-second-verdict')).toContainText('Katsuhiro Otomo');
	await expect(take).toContainText('Neo-Tokio');
	await expect(take).not.toContainText('Cinco señales rápidas para ubicarte');
});
