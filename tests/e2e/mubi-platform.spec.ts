import { expect, test, type Page } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';

const movies = readdirSync('src/data/movies').filter((file) => file.endsWith('.json'))
 .map((file) => JSON.parse(readFileSync(`src/data/movies/${file}`, 'utf8')))
 .filter((movie) => (movie.releasePlatforms ?? [movie.releasePlatform]).includes('MUBI'));

async function ready(page: Page, url: string) {
 await page.goto(url);
 await expect(page.locator('[data-movie-search-root]')).toHaveAttribute('data-home-catalog-ready', 'true');
 const prompt = page.getByRole('dialog', { name: /Ayudanos a mantener Cine Posta online/i });
 if (await prompt.isVisible()) await prompt.getByRole('button', { name: /Ahora no, entrar al sitio/i }).click();
}

test.beforeEach(async ({ page }) => {
 await page.route('https://www.youtube.com/embed/**', (route) => route.fulfill({ contentType: 'text/html', body: '<html></html>' }));
});

test('MUBI filters the shared catalog by keyboard and combines with genre and score', async ({ page }, testInfo) => {
 await ready(page, '/');
 if (await page.locator('[data-home-advanced-filters]').getAttribute('open') === null) {
  await page.locator('[data-home-advanced-filters] summary').click();
 }
 const mubi = page.getByRole('button', { name: /Filtrar por MUBI/i });
 await mubi.focus();
 await page.keyboard.press('Enter');
 await expect(mubi).toHaveAttribute('aria-pressed', 'true');
 expect(new URL(page.url()).searchParams.get('plataforma')).toBe('mubi');
 const cards = page.locator('[data-movie-search-grid] [data-movie-card]');
 await expect(cards).toHaveCount(movies.length);
 expect(await cards.evaluateAll((nodes) => nodes.every((node) => node.getAttribute('data-movie-platforms')?.split(',').includes('mubi')))).toBe(true);
 const logo = mubi.locator('img');
 await logo.scrollIntoViewIfNeeded();
 await expect(logo).toHaveAttribute('src', '/brand/platforms/mubi.svg');
 await expect.poll(() => logo.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
 await page.locator('[data-home-filter-panel="platform"]').screenshot({ path: testInfo.outputPath('mubi-filter.png') });
 await page.getByRole('button', { name: /^Terror$/i }).click();
 await page.getByRole('button', { name: /8\+ Excelentes/i }).click();
 await expect(cards).toHaveCount(2);
 expect(await cards.evaluateAll((nodes) => nodes.every((node) => Number(node.getAttribute('data-movie-score')) >= 8))).toBe(true);
 await page.reload();
 await expect(page.locator('[data-movie-search-root]')).toHaveAttribute('data-home-catalog-ready', 'true');
 if (await page.locator('[data-home-advanced-filters]').getAttribute('open') === null) {
  await page.locator('[data-home-advanced-filters] summary').click();
 }
 await expect(mubi).toHaveAttribute('aria-pressed', 'true');
 await expect(cards).toHaveCount(2);
 expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test('MUBI deep link and every detail load the shared badges and local artwork', async ({ page }) => {
 test.setTimeout(90_000);
 await ready(page, '/?plataforma=mubi');
 const cards = page.locator('[data-movie-search-grid] [data-movie-card]');
 await expect(cards).toHaveCount(movies.length);
 for (const movie of movies) {
  await page.goto(`/peliculas/${movie.slug}/`);
  await expect(page.getByRole('heading', { name: movie.title, exact: true })).toBeVisible();
  const logo = page.locator('.movie-detail__watch .platform-chip--mubi img');
  await logo.scrollIntoViewIfNeeded();
  await expect.poll(() => logo.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  await expect(page.locator('.movie-detail__technical .platform-badge-group__item')).toHaveCount(movie.releasePlatforms?.length ?? 1);
  const poster = page.locator(`img[src="/${movie.poster}"]`).first();
  await poster.scrollIntoViewIfNeeded();
  await expect.poll(() => poster.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0 && image.naturalHeight > image.naturalWidth)).toBe(true);
  expect(new URL(await poster.evaluate((image: HTMLImageElement) => image.currentSrc)).pathname).toBe(`/${movie.poster}`);
 }
 console.log(`MUBI posters: total=${movies.length}, loaded=${movies.length}, bad=0`);
});
