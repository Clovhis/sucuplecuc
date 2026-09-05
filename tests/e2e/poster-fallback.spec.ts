import { expect, test } from '@playwright/test';

const representativeRoutes = ['pulp-fiction-1994', 'relatos-salvajes-2014', 'gintama-la-pelicula-yoshiwara-en-llamas-2026'];

test.describe('fallback global de posters locales', () => {
	test('usa el WebP local de contingencia para un recurso inválido', async ({ page }) => {
		const response = await page.goto('/peliculas/pulp-fiction-1994/', { waitUntil: 'domcontentloaded' });
		expect(response?.ok()).toBeTruthy();

		const poster = page.locator('img[data-cineposta-poster]').first();
		await expect(poster).toBeVisible();
		await poster.evaluate((element) => element.dispatchEvent(new Event('error')));
		await expect(poster).toHaveAttribute('data-poster-fallback-state', 'contingency');
		await expect(poster).toHaveAttribute('src', /\/assets\/posters\/poster-fallback\.webp$/);
		await expect.poll(async () => poster.evaluate((element) => {
			const image = element as HTMLImageElement;
			return { complete: image.complete, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight };
		})).toEqual({ complete: true, naturalWidth: 480, naturalHeight: 720 });
	});

	test('observa posters agregados luego de cargar la página', async ({ page }) => {
		await page.goto('/peliculas/pulp-fiction-1994/', { waitUntil: 'domcontentloaded' });
		await page.evaluate(() => {
			const image = document.createElement('img');
			image.dataset.cinepostaPoster = 'true';
			image.dataset.posterFallbackTest = 'true';
			image.src = '/assets/posters/inexistente.webp';
			document.body.append(image);
		});
		const poster = page.locator('img[data-poster-fallback-test]');
		await expect(poster).toHaveAttribute('src', /\/assets\/posters\/poster-fallback\.webp$/);
		await expect(poster).toHaveAttribute('data-poster-fallback-state', 'contingency');
	});

	test('renderiza posters locales reales sin activar la contingencia', async ({ page }, testInfo) => {
		test.skip(!['desktop-chromium', 'mobile-chromium'].includes(testInfo.project.name), 'La matriz completa cubre el helper; este lote visual corre en Chromium.');
		for (const slug of representativeRoutes) {
			const response = await page.goto(`/peliculas/${slug}/`, { waitUntil: 'domcontentloaded' });
			expect(response?.ok(), slug).toBeTruthy();
			const poster = page.locator('.movie-detail__poster img[data-cineposta-poster]').first();
			await expect(poster, slug).toHaveAttribute('src', /\/assets\/posters\/\d{4}\/.+\.webp$/);
			const metrics = await poster.evaluate((element) => {
				const image = element as HTMLImageElement;
				return { complete: image.complete, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight, state: image.dataset.posterFallbackState ?? '' };
			});
			expect(metrics.complete, slug).toBe(true);
			expect(metrics.naturalWidth, slug).toBeGreaterThan(0);
			expect(metrics.naturalHeight, slug).toBeGreaterThan(metrics.naturalWidth);
			expect(metrics.state, slug).not.toBe('contingency');
		}
	});
});
