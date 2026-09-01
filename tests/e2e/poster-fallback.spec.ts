import { resolve } from 'node:path';

import { expect, test } from '@playwright/test';

const repairedPosterRoutes = [
	'pulp-fiction-1994',
	'saltburn-2023',
	'gintama-la-pelicula-yoshiwara-en-llamas-2026',
	'atrapame-si-puedes-2002',
	'avatar-2009',
	'avengers-endgame-2019',
	'back-to-the-future-1985',
	'parasite-2019',
	'relatos-salvajes-2014',
	'always-1989',
	'el-hombre-del-norte-2022',
	'en-defensa-del-honor-2002',
	'las-ovejas-detectives-2026',
	'los-goonies-1985',
	'outcome-2026',
	'spider-man-homecoming-2017',
	'smile-2-2024',
	'el-gigante-de-hierro-1999',
];

test.describe('fallback global de posters', () => {
	test('usa la ilustración de contingencia cuando se agotan todas las fuentes', async ({ page }) => {
		const response = await page.goto('/peliculas/pulp-fiction-1994/', { waitUntil: 'domcontentloaded' });

		expect(response?.ok()).toBeTruthy();

		const poster = page.locator('img[data-cineposta-poster]').first();
		await expect(poster).toBeVisible();
		const originalSrc = await poster.getAttribute('src');
		await poster.evaluate((element) => {
			const image = element as HTMLImageElement;
			image.alt = '';
			image.dataset.posterSearchTitle = '';
			image.dataset.posterSearchYear = '';
			image.dispatchEvent(new Event('error'));
		});
		await expect(poster).not.toHaveAttribute('src', /\/posters\/poster-fallback-cineposta\.png$/);
		await expect(poster).not.toHaveAttribute('src', originalSrc ?? '');

		for (let attempt = 0; attempt < 20; attempt += 1) {
			if (await poster.getAttribute('data-poster-fallback-state') === 'contingency') break;
			await poster.evaluate((image) => image.dispatchEvent(new Event('error')));
		}

		await expect(poster).toHaveAttribute('data-poster-fallback-state', 'contingency');
		await expect(poster).toHaveAttribute('src', /\/posters\/poster-fallback-cineposta\.png$/);
		await expect
			.poll(async () =>
				poster.evaluate((element) => {
					const image = element as HTMLImageElement;
					return {
						complete: image.complete,
						naturalWidth: image.naturalWidth,
						naturalHeight: image.naturalHeight,
					};
				}),
			)
			.toEqual({ complete: true, naturalWidth: 1024, naturalHeight: 1536 });

		const dynamicPoster = page.locator('img[data-cineposta-poster][data-poster-fallback-test]');
		await page.evaluate(() => {
			const image = document.createElement('img');
			image.dataset.cinepostaPoster = 'true';
			image.dataset.posterFallbackTest = 'true';
			image.alt = '';
			document.body.append(image);
			image.dispatchEvent(new Event('error'));
		});

		await expect(dynamicPoster).toHaveAttribute('src', /\/posters\/poster-fallback-cineposta\.png$/);
		await expect(dynamicPoster).toHaveAttribute('data-poster-fallback-state', 'contingency');
		await expect
			.poll(async () =>
				dynamicPoster.evaluate((element) => {
					const image = element as HTMLImageElement;
					return { complete: image.complete, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight };
				}),
			)
			.toEqual({ complete: true, naturalWidth: 1024, naturalHeight: 1536 });
	});

	test('busca una ficha vigente por título y año antes de mostrar la contingencia', async ({ page }) => {
		const response = await page.goto('/peliculas/pulp-fiction-1994/', { waitUntil: 'domcontentloaded' });

		expect(response?.ok()).toBeTruthy();

		await page.route('https://images.justwatch.com/**', async (route) => {
			const url = new URL(route.request().url());
			if (url.pathname.startsWith('/poster/321103806/')) {
				await route.fulfill({ path: resolve('public/posters/poster-fallback-cineposta.png') });
				return;
			}

			await route.fulfill({ status: 404, contentType: 'text/plain', body: 'poster not found' });
		});
		await page.route('https://images.weserv.nl/**', (route) =>
			route.fulfill({ status: 404, contentType: 'text/plain', body: 'proxy not found' }),
		);
		await page.route('https://apis.justwatch.com/graphql', async (route) => {
			const requestBody = route.request().postDataJSON() as {
				variables?: { searchQuery?: string; country?: string; language?: string };
			};
			expect(requestBody.variables).toMatchObject({
				searchQuery: 'Always (Para Siempre)',
				country: 'AR',
				language: 'es',
			});

			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				headers: { 'access-control-allow-origin': '*' },
				body: JSON.stringify({
					data: {
						popularTitles: {
							edges: [
								{
									node: {
									content: {
										title: 'Always (Para Siempre)',
										originalTitle: 'Always',
										originalReleaseYear: 1989,
										posterUrl: 'https://images.justwatch.com/poster/321103806/{profile}/always-para-siempre.{format}',
									},
								},
								},
							],
						},
					},
				}),
			});
		});

		const dynamicPoster = page.locator('img[data-cineposta-poster][data-poster-fallback-search-test]');
		await page.evaluate(() => {
			const image = document.createElement('img');
			image.dataset.cinepostaPoster = 'true';
			image.dataset.posterFallbackSearchTest = 'true';
			image.dataset.posterSearchTitle = 'Always (Para Siempre)';
			image.dataset.posterSearchYear = '1989';
			image.alt = 'Póster de Always (Para Siempre)';
			image.src = 'https://images.justwatch.com/poster/999999999/s718/always-para-siempre.jpg';
			document.body.append(image);
		});

		await expect(dynamicPoster).toHaveAttribute('src', /\/poster\/321103806\/s718\/always-para-siempre\.jpg$/);
		await expect(dynamicPoster).not.toHaveAttribute('data-poster-fallback-state', 'contingency');
		await expect.poll(async () => dynamicPoster.evaluate((element) => {
			const image = element as HTMLImageElement;
			return { complete: image.complete, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight };
		})).toMatchObject({ complete: true, naturalWidth: 1024, naturalHeight: 1536 });
	});

	test('renderiza el lote reparado en desktop y mobile sin activar la contingencia', async ({ page }, testInfo) => {
		test.skip(!['desktop-chromium', 'mobile-chromium'].includes(testInfo.project.name), 'La matriz completa ya cubre el script; este lote visual corre en Chromium desktop/mobile.');
		test.setTimeout(180_000);
		// The live URL audit owns provider availability. Keep this browser/layout
		// check deterministic by supplying a valid portrait response locally.
		await page.route('https://images.justwatch.com/**', (route) =>
			route.fulfill({ path: resolve('public/posters/poster-fallback-cineposta.png') }),
		);

		for (const slug of repairedPosterRoutes) {
			const response = await page.goto(`/peliculas/${slug}/`, { waitUntil: 'domcontentloaded' });
			expect(response?.ok(), slug).toBeTruthy();

			const poster = page.locator('.movie-detail__poster img[data-cineposta-poster]').first();
			await expect(poster, slug).toBeVisible();
			await expect
				.poll(async () => poster.evaluate((element) => {
					const image = element as HTMLImageElement;
					return image.complete && image.naturalWidth > 0;
				}), { timeout: 10000 })
				.toBe(true);

			const metrics = await poster.evaluate((element) => {
				const image = element as HTMLImageElement;
				return {
					naturalWidth: image.naturalWidth,
					naturalHeight: image.naturalHeight,
					state: image.dataset.posterFallbackState ?? '',
				};
			});
			expect(metrics.naturalWidth, slug).toBeGreaterThan(0);
			expect(metrics.naturalHeight, slug).toBeGreaterThan(metrics.naturalWidth);
			expect(metrics.state, slug).not.toBe('contingency');
		}
	});
});
