import { test, expect } from '@playwright/test';
import entry from '../../src/data/editorials/resident-evil-noche-cero-la-veria-99-veces.json' with { type: 'json' };

const path = `/editorial/${entry.slug}/`;

test('editorial connects home, index and movie without replacing its review', async ({ page }) => {
  await page.goto('/');
  const home = page.getByRole('region', { name: 'Desde CinePosta' });
  await expect(home.getByRole('heading', { name: entry.title })).toBeVisible();
  await home.getByRole('link', { name: 'Todas las publicaciones' }).click();
  await expect(page).toHaveURL(/\/editorial\/$/);
  const indexedEntry = page.locator('.editorial-card').filter({ hasText: entry.title });
  await expect(indexedEntry.getByText('5 min de lectura')).toBeVisible();
  await page.getByRole('heading', { name: entry.title }).click();
  await expect(page).toHaveURL(path);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(entry.title);
  await expect(page.locator('time')).toHaveAttribute('datetime', '2026-09-27');
  await page.getByRole('link', { name: 'Ver ficha de Resident Evil: Noche Cero' }).click();
  await expect(page).toHaveURL(`/peliculas/${entry.movieSlug}/`);
  await expect(page.getByRole('region', { name: 'Reseña honesta' })).toBeVisible();
  const linked = page.getByRole('complementary', { name: 'Editorial CinePosta' });
  await expect(linked.getByRole('heading')).toHaveText(entry.title);
  await linked.getByRole('link', { name: 'Leer editorial' }).click();
  await expect(page).toHaveURL(path);
});

test('editorial images decode, remain interleaved and fit a narrow screen', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(path);
  const figures = page.locator('.editorial-body figure');
  await expect(figures).toHaveCount(5);
  for (const figure of await figures.all()) {
    await figure.scrollIntoViewIfNeeded();
    const image = figure.locator('img');
    // naturalWidth is density-corrected for srcset, especially on mobile DPRs.
    await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
    await expect(image).toHaveAttribute('loading', 'lazy');
    await expect(image).toHaveAttribute('srcset', /640w/);
    expect(await image.evaluate((node: HTMLImageElement) => Math.abs(node.width / node.height - node.naturalWidth / node.naturalHeight))).toBeLessThan(.03);
    expect(await figure.evaluate(node => node.previousElementSibling?.tagName)).toBe('P');
    expect(await figure.evaluate(node => node.nextElementSibling?.tagName)).toBe('P');
    await expect(figure.getByRole('link', { name: 'Fuente oficial' })).toHaveAttribute('href', /^https:\/\/residentevil\.movie\//);
  }
  await page.screenshot({ path: testInfo.outputPath('editorial-full.png'), fullPage: true });
  await page.setViewportSize({ width: 320, height: 760 });
  await page.evaluate(() => window.scrollTo(0, 0));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('editorial-320.png'), fullPage: true });
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.cineposta.com.ar${path}`);
  const schema = await page.locator('script[type="application/ld+json"]').first().textContent();
  expect(JSON.parse(schema!).timeRequired).toBe('PT5M');
  expect(errors).toEqual([]);
});
