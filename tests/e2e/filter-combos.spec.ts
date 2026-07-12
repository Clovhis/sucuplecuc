import { expect, test, type Page } from '@playwright/test';

async function dismissDonationPrompt(page: Page): Promise<void> {
  const prompt = page.getByRole('dialog', { name: /Ayudanos a mantener Cine Posta online/i });
  if (await prompt.isVisible().catch(() => false)) {
    await prompt.getByRole('button', { name: /Ahora no, entrar al sitio/i }).click();
    await expect(prompt).not.toBeVisible();
  }
}

async function gotoHome(page: Page): Promise<void> {
  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(response?.ok()).toBeTruthy();
  await dismissDonationPrompt(page);
}

async function visibleMovieTitles(page: Page): Promise<string[]> {
  return page.locator('[data-movie-search-grid] [data-movie-card]').evaluateAll((cards) =>
    cards
      .map((card) => card.getAttribute('data-movie-title')?.trim() ?? '')
      .filter(Boolean),
  );
}

async function expectMovieTitles(page: Page, expectedTitles: string[]): Promise<void> {
  await expect
    .poll(() => visibleMovieTitles(page), {
      message: `Esperaba ${expectedTitles.join(', ')}`,
    })
    .toEqual(expectedTitles);
}

test.describe('home catalog filters', () => {
  test('editorial + subgenre + platform resolves to a single argentinian heist movie', async ({ page }) => {
    await gotoHome(page);

    await page.getByRole('button', { name: /^Cine nacional$/i }).click();
    await page.getByRole('button', { name: /^Heist$/i }).click();
    await page.getByRole('button', { name: /Filtrar por Disney\+/i }).click();

    await expectMovieTitles(page, ['Nueve reinas']);
    await expect(page.locator('[data-movie-search-summary]').first()).toHaveText(
      '1 resultado para filtro Cine nacional + subgénero Heist + plataforma Disney+.',
    );
  });

  test('road movie + platform narrows correctly', async ({ page }) => {
    await gotoHome(page);

    await page.getByRole('button', { name: /^Road Movie$/i }).click();
    await page.getByRole('button', { name: /Filtrar por Prime Video/i }).click();

    await expectMovieTitles(page, ['Green Book']);
  });

  test('mockumentary combines cleanly with text search', async ({ page }) => {
    await gotoHome(page);

    await page.getByRole('button', { name: /^Mockumentary$/i }).click();
    await page.locator('[data-movie-search-input]').fill('zelig');

    await expectMovieTitles(page, ['Zelig']);
  });

  test('incompatible combinations reach empty state without stale cards', async ({ page }) => {
    await gotoHome(page);

    await page.getByRole('button', { name: /^Documentales$/i }).click();
    await page.getByRole('button', { name: /^Rom-Com$/i }).click();

    const emptyState = page.locator('[data-movie-search-empty]');
    await expect(emptyState).toBeVisible();
    await expect
      .poll(() => visibleMovieTitles(page), {
        message: 'No deberían quedar cards visibles con filtros incompatibles',
      })
      .toEqual([]);
  });

  test('genre chips stay mutually exclusive across separated sections', async ({ page }) => {
    await gotoHome(page);

    const comediaChip = page.getByRole('button', { name: /^Comedia$/i });
    const cineNacionalChip = page.getByRole('button', { name: /^Cine nacional$/i });

    await comediaChip.click();
    await expect(comediaChip).toHaveAttribute('aria-pressed', 'true');

    await cineNacionalChip.click();
    await expect(cineNacionalChip).toHaveAttribute('aria-pressed', 'true');
    await expect(comediaChip).toHaveAttribute('aria-pressed', 'false');
  });
});
