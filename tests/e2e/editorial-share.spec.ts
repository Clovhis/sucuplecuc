import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import note from '../../src/data/editorials/lo-dejamos-aca-darin-peretti-entre-la-risa-y-el-bajon.json' with { type: 'json' };

const directory = new URL('../../src/data/editorials/', import.meta.url);
const publications: { slug: string; title: string }[] = readdirSync(directory)
  .filter(file => file.endsWith('.json'))
  .map(file => JSON.parse(readFileSync(new URL(file, directory), 'utf8')));
const path = `/editorial/${note.slug}/`;
const canonical = `https://www.cineposta.com.ar${path}`;

test('every publication shares its own canonical URL and copies it at 320px', async ({ page }) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 320, height: 760 });
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: async (value: string) => { (window as any).copiedUrl = value; } },
  }));
  for (const entry of publications) {
    await page.goto(`/editorial/${entry.slug}/`);
    const url = `https://www.cineposta.com.ar/editorial/${entry.slug}/`;
    const text = `Leé «${entry.title}» en CinePosta`;
    const share = page.getByRole('region', { name: 'Compartir esta nota', exact: true });
    await expect(share).toHaveAttribute('data-share-url', url);
    const whatsapp = share.getByRole('link', { name: `Compartir ${entry.title} por WhatsApp`, exact: true });
    const x = share.getByRole('link', { name: `Compartir ${entry.title} en X`, exact: true });
    expect(new URL((await whatsapp.getAttribute('href'))!).searchParams.get('text')).toBe(`${text} ${url}`);
    const tweet = new URL((await x.getAttribute('href'))!);
    expect(tweet.searchParams.get('text')).toBe(text);
    expect(tweet.searchParams.get('url')).toBe(url);
    await expect(whatsapp).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(x).toHaveAttribute('target', '_blank');
    const copy = share.getByRole('button', { name: 'Copiar URL' });
    await copy.scrollIntoViewIfNeeded();
    for (const icon of await share.locator('img').all()) {
      await expect.poll(() => icon.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    }
    await copy.focus();
    await expect(copy).toBeFocused();
    await copy.press('Enter');
    await expect(share.getByRole('status')).toHaveText('Link copiado.');
    expect(await page.evaluate(() => (window as any).copiedUrl)).toBe(url);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const control of [copy, whatsapp, x]) {
      const box = (await control.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(320);
    }
  }
  expect(errors).toEqual([]);
});

test('native sharing sends the article and handles cancellation and failure', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (data: ShareData) => {
        const mode = (window as any).shareMode;
        if (mode === 'cancel') throw new DOMException('Cancelled', 'AbortError');
        if (mode === 'error') throw new Error('Unavailable');
        (window as any).sharedArticle = data;
      },
    });
  });
  await page.goto(path);
  const share = page.getByRole('region', { name: 'Compartir esta nota', exact: true });
  const native = share.getByRole('button', { name: 'Compartir', exact: true });
  await expect(native).toBeVisible();
  await native.click();
  expect(await page.evaluate(() => (window as any).sharedArticle)).toEqual({
    title: note.title, text: `Leé «${note.title}» en CinePosta`, url: canonical,
  });
  await page.evaluate(() => { (window as any).shareMode = 'cancel'; });
  await native.click();
  await expect(share.locator('[data-share-status]')).toBeEmpty();
  for (const icon of await share.locator('img').all()) {
    await expect.poll(() => icon.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  }
  await share.screenshot({ path: testInfo.outputPath('share.png'), scale: 'css' });
  await page.setViewportSize({ width: 320, height: 760 });
  await share.screenshot({ path: testInfo.outputPath('share-320.png'), scale: 'css' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => { (window as any).shareMode = 'error'; });
  await native.click();
  await expect(share.getByRole('status')).toHaveText('No se pudo abrir el panel de compartir.');
});

test('unavailable clipboard reports failure while social links stay usable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
  });
  await page.goto(path);
  const share = page.getByRole('region', { name: 'Compartir esta nota', exact: true });
  await expect(share.locator('[data-native-share]')).toBeHidden();
  await share.getByRole('button', { name: 'Copiar URL' }).click();
  await expect(share.getByRole('status')).toHaveText('No se pudo copiar el link.');
  await expect(share.getByRole('link')).toHaveCount(2);
});

test('social sharing links work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(test.info().project.use.baseURL + path);
  const share = page.getByRole('region', { name: 'Compartir esta nota', exact: true });
  await expect(share.getByRole('link')).toHaveCount(2);
  await expect(share.locator('[data-native-share]')).toBeHidden();
  expect(new URL((await share.getByRole('link').first().getAttribute('href'))!).searchParams.get('text')).toContain(canonical);
  await context.close();
});
