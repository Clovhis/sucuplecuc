import { expect, test } from '@playwright/test';

test('home page renders the catalog shell', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  const response = await page.goto('/', { waitUntil: 'networkidle' });

  expect(response?.ok()).toBeTruthy();
  await expect(page).toHaveTitle(/Cine|Posta/i);
  await expect(page.locator('body')).toBeVisible();
  await expect(page.getByRole('link', { name: /^Ver detalle de/i }).first()).toBeVisible();

  const bodyText = await page.locator('body').innerText();
  expect(bodyText.length).toBeGreaterThan(1000);
  expect(pageErrors).toEqual([]);
});

test('movie detail page renders a known title', async ({ page }) => {
  const response = await page.goto('/peliculas/akira-1988/', { waitUntil: 'networkidle' });

  expect(response?.ok()).toBeTruthy();
  await expect(page.getByRole('heading', { name: /akira/i }).first()).toBeVisible();
  await expect(page.locator('body')).toContainText(/Akira/i);
});
