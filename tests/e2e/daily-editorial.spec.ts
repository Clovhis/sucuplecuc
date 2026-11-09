import { test, expect } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';

const draftPath = '.tmp/cineposta-daily/draft.json';
const draft = existsSync(draftPath) ? JSON.parse(readFileSync(draftPath, 'utf8')) : null;
const note = draft ? JSON.parse(readFileSync(`src/data/editorials/${draft.slug}.json`, 'utf8')) : null;

test('daily note: archive, SEO, sources, decoded images and 320 px layout', async ({ page }, testInfo) => {
  test.skip(!note, 'No daily preparation in this checkout; the publisher requires it before running this test.');
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/editorial/');
  const card = page.locator('.editorial-card').filter({ hasText: note.title });
  await expect(card).toHaveCount(1);
  await card.getByRole('link').click();
  await expect(page).toHaveURL(`/editorial/${note.slug}/`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(note.title);
  await expect(page.locator('time')).toHaveAttribute('datetime', note.date);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.cineposta.com.ar/editorial/${note.slug}/`);
  for (const source of note.sources) await expect(page.getByRole('link', { name: `${source.label} →`, exact: true })).toHaveAttribute('href', source.url);
  const images = page.locator('.editorial-body img');
  await expect(images).toHaveCount(note.content.filter((block: { type: string }) => block.type === 'image').length);
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
    await expect(image).toHaveAttribute('srcset', /640w/);
  }
  await page.screenshot({ path: testInfo.outputPath('daily-desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 320, height: 760 });
  await page.evaluate(() => window.scrollTo(0, 0));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('daily-320.png'), fullPage: true });
  await page.getByRole('link', { name: 'Volver a Editorial CinePosta →', exact: true }).click();
  await expect(page).toHaveURL('/editorial/');
  await page.goto('/');
  const radar = page.locator('a', { hasText: note.title });
  expect(await radar.count()).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});
