import { expect, test } from '@playwright/test';
import movie from '../../src/data/movies/el-abogado-del-diablo-1997.json' with { type: 'json' };

test('El abogado del diablo publishes its verified score, people, poster and ten-point voting', async ({ page }) => {
	await page.goto(`/peliculas/${movie.slug}/`, { waitUntil: 'load' });
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(movie.title);
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.cineposta.com.ar/peliculas/${movie.slug}/`);
	await expect(page.locator('.movie-detail__meta .badge')).toContainText('8 · Excelente');
	await expect(page.locator('.movie-detail__review')).toContainText('Taylor Hackford');
	for (const name of movie.mainCast) await expect(page.locator('.movie-detail__person-name-link').filter({ hasText: name }).first()).toBeVisible();
	const poster = page.locator('.movie-detail__poster img[data-cineposta-poster]');
	await poster.scrollIntoViewIfNeeded();
	const expectedSrc = new URL(`/${movie.poster}`, page.url()).href;
	await expect.poll(() => poster.evaluate((img: HTMLImageElement, src) => img.complete && img.naturalWidth > 0 && img.naturalHeight > img.naturalWidth && img.currentSrc === src, expectedSrc)).toBe(true);
	const widget = page.locator('[data-rating-widget]');
	await expect(widget.getByRole('group', { name: 'Puntuar película del 1 al 10' }).getByRole('button')).toHaveCount(10);
	await expect(page.locator('.movie-detail')).toContainText('HBO Max');
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test('the new movie has an indexable discussion and one search result', async ({ page, request }) => {
	const sitemap = await (await request.get('/sitemap.xml')).text();
	expect(sitemap).toContain(`/peliculas/${movie.slug}/`);
	expect(sitemap).toContain(`/comunidad/peliculas/${movie.slug}/`);
	await page.goto(`/?q=${encodeURIComponent(movie.title)}`);
	await expect(page.locator('[data-movie-search-root]')).toHaveAttribute('data-home-catalog-ready', 'true');
	const cards = page.locator('[data-movie-search-grid] .movie-card');
	await expect(cards).toHaveCount(1);
	await expect(cards.locator('.movie-card__link')).toHaveAttribute('href', `/peliculas/${movie.slug}/`);
	await page.goto(`/comunidad/peliculas/${movie.slug}/`, { waitUntil: 'load' });
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(movie.title);
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.cineposta.com.ar/comunidad/peliculas/${movie.slug}/`);
	await expect(page.locator('[data-rating-widget] button')).toHaveCount(10);
});
