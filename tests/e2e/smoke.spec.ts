import { expect, test } from '@playwright/test';

test('donation prompt appears once per local day', async ({ page }) => {
  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });

  expect(response?.ok()).toBeTruthy();

  const prompt = page.getByRole('dialog', { name: /Ayudanos a mantener Cine Posta online/i });
  await expect(prompt).toBeVisible();
  await expect(
    prompt.getByRole('link', { name: /Donar un cafecito/i }),
  ).toHaveAttribute('href', 'https://cafecito.app/cineposta');

  await prompt.getByRole('button', { name: /Ahora no, entrar al sitio/i }).click();
  await expect(prompt).not.toBeVisible();

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(prompt).not.toBeVisible();
});

test('home page renders the catalog shell', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });

  expect(response?.ok()).toBeTruthy();
  await expect(page).toHaveTitle(/Cine|Posta/i);
  await expect(page.locator('body')).toBeVisible();
  await expect(page.getByRole('link', { name: /^Ver detalle de/i }).first()).toBeVisible();

  const bodyText = await page.locator('body').innerText();
  expect(bodyText.length).toBeGreaterThan(1000);
  expect(pageErrors).toEqual([]);
});

test('movie detail page renders a known title', async ({ page }) => {
  const response = await page.goto('/peliculas/akira-1988/', { waitUntil: 'domcontentloaded' });

  expect(response?.ok()).toBeTruthy();
  await expect(page.getByRole('heading', { name: /akira/i }).first()).toBeVisible();
  await expect(page.locator('body')).toContainText(/Akira/i);
});
