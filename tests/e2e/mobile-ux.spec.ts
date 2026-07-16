import { expect, test } from '@playwright/test';

test('mobile home keeps touch targets and content within the viewport', async ({ page }) => {
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

    return {
      contentFits: document.documentElement.scrollWidth <= window.innerWidth,
      controlHeights: controls.map((control) => control.getBoundingClientRect().height),
    };
  });

  expect(measurements.contentFits).toBeTruthy();
  expect(measurements.controlHeights.length).toBeGreaterThan(0);
  expect(Math.min(...measurements.controlHeights)).toBeGreaterThanOrEqual(44);
});
