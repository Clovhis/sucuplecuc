import { expect, test } from '@playwright/test';

test('mobile home keeps touch targets and content within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const donationGate = page.getByRole('dialog', { name: /Ayudanos a mantener Cine Posta online/i });
  if (await donationGate.isVisible()) {
    await donationGate.getByRole('button', { name: /Ahora no, entrar al sitio/i }).click();
  }

  await expect(page.locator('.site-header__actions > a')).toHaveCount(2);

  const measurements = await page.evaluate(() => {
    const controls = [
      ...document.querySelectorAll<HTMLElement>('.site-header__actions > a'),
      ...document.querySelectorAll<HTMLElement>('.home-platform-filter__chip'),
      ...document.querySelectorAll<HTMLElement>('.home-genre-filter__chip'),
    ];

    const viewportWidth = window.innerWidth;
    const platformBounds = [...document.querySelectorAll<HTMLElement>('.home-platform-filter__chip, .movie-card__platform-mark')]
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return { left: rect.left, right: rect.right, width: rect.width };
      })
      .filter((rect) => rect.width > 0 && (rect.left < -1 || rect.right > viewportWidth + 1));

    return {
      contentFits: document.documentElement.scrollWidth <= window.innerWidth,
      controlHeights: controls.map((control) => control.getBoundingClientRect().height),
      platformBounds,
    };
  });

  expect(measurements.contentFits).toBeTruthy();
  expect(measurements.controlHeights.length).toBeGreaterThan(0);
  expect(Math.min(...measurements.controlHeights)).toBeGreaterThanOrEqual(44);
  expect(measurements.platformBounds).toEqual([]);
});

test('mobile layout stays contained when the browser reports a desktop viewport', async ({ page }) => {
  await page.setViewportSize({ width: 980, height: 640 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const measurements = await page.evaluate(() => {
    const top = (selector: string) => document.querySelector<HTMLElement>(selector)?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;
    return {
      contentFits: document.documentElement.scrollWidth <= window.innerWidth,
      catalogTop: top('[data-movie-search-grid]'),
      gameTop: top('[data-home-actor-game]'),
      communityTop: top('.home-community-promo'),
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
    };
  });

  expect(measurements.contentFits).toBeTruthy();
  expect(measurements.document).toBeLessThanOrEqual(measurements.viewport + 1);
  expect(measurements.catalogTop).toBeLessThan(measurements.gameTop);
  expect(measurements.gameTop).toBeLessThan(measurements.communityTop);
});
