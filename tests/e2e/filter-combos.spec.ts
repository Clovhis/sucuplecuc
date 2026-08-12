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

    await expectMovieTitles(page, ['Green Book', 'París, Texas', 'Ladrón de bicicletas']);
  });

  test('every subgenre chip intersects correctly with Netflix', async ({ page }) => {
    await gotoHome(page);

    const allCatalogCards = await page.locator('[data-movie-search-grid] [data-movie-card]').evaluateAll((cards) => {
      const templateCards = Array.from(document.querySelectorAll<HTMLTemplateElement>('[data-movie-card-template]'))
        .flatMap((template) => Array.from(template.content.querySelectorAll<HTMLElement>('[data-movie-card]')));

      return [...cards, ...templateCards].map((card) => ({
        title: card.getAttribute('data-movie-title')?.trim() ?? '',
        platforms: card.getAttribute('data-movie-platforms')?.split(',').map((value) => value.trim()) ?? [],
        subgenres: card.getAttribute('data-movie-subgenres')?.split(',').map((value) => value.trim()) ?? [],
      }));
    });
    const subgenreIds = await page.locator('[data-home-subgenre-chip]').evaluateAll((chips) =>
      chips
        .map((chip) => chip.getAttribute('data-home-subgenre-id')?.trim() ?? '')
        .filter(Boolean),
    );

    await page.getByRole('button', { name: /Filtrar por Netflix/i }).click();

    for (const subgenreId of subgenreIds) {
      const expectedTitles = allCatalogCards
        .filter((card) => card.platforms.includes('netflix') && card.subgenres.includes(subgenreId))
        .map((card) => card.title);
      const chip = page.locator(`[data-home-subgenre-chip][data-home-subgenre-id="${subgenreId}"]`);

      await chip.click();
      await expect(chip).toHaveAttribute('aria-pressed', 'true');
      await expectMovieTitles(page, expectedTitles);
      await chip.click();
      await expect(chip).toHaveAttribute('aria-pressed', 'false');
    }
  });

  test('mockumentary combines cleanly with text search', async ({ page }) => {
    await gotoHome(page);

    await page.getByRole('button', { name: /^Mockumentary$/i }).click();
    await page.locator('[data-movie-search-input]').fill('zelig');

    await expect(page.getByRole('button', { name: /^Mockumentary$/i })).toHaveAttribute('aria-pressed', 'true');
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

  test('editorial and primary genre filters stay selected and combine across groups', async ({ page }) => {
    await gotoHome(page);

    const dramaChip = page.getByRole('button', { name: /^Drama$/i });
    const oscarChip = page.getByRole('button', { name: /^Ganadoras del Oscar$/i });

    await oscarChip.click();
    await dramaChip.click();

    await expect(oscarChip).toHaveAttribute('aria-pressed', 'true');
    await expect(dramaChip).toHaveAttribute('aria-pressed', 'true');
    await expect
      .poll(() => visibleMovieTitles(page), {
        message: 'La combinación Oscar + Drama debería devolver películas',
      })
      .not.toEqual([]);

    const movieGenres = await page.locator('[data-movie-search-grid] [data-movie-card]').evaluateAll((cards) =>
      cards.map((card) => card.getAttribute('data-movie-genres')?.split(',') ?? []),
    );
    expect(movieGenres.every((genres) => genres.includes('oscar-mejor-pelicula') && genres.includes('drama'))).toBeTruthy();
    await expect(page.locator('[data-movie-search-summary]').first()).toContainText(
      'género Drama + filtro Ganadoras del Oscar',
    );
  });

  test('multiple selections expose removable pills and survive a shared URL', async ({ page }) => {
    await gotoHome(page);

    const comediaChip = page.getByRole('button', { name: /^Comedia$/i });
    const dramaChip = page.getByRole('button', { name: /^Drama$/i });
    const disneyChip = page.getByRole('button', { name: /Filtrar por Disney\+/i });
    const primeChip = page.getByRole('button', { name: /Filtrar por Prime Video/i });

    await comediaChip.click();
    await dramaChip.click();
    await disneyChip.click();
    await primeChip.click();

    await expect(comediaChip).toHaveAttribute('aria-pressed', 'true');
    await expect(dramaChip).toHaveAttribute('aria-pressed', 'true');
    await expect(disneyChip).toHaveAttribute('aria-pressed', 'true');
    await expect(primeChip).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-home-active-filters]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Quitar Género: Comedia/i })).toBeVisible();

    const url = new URL(page.url());
    expect(url.searchParams.get('genero')).toBe('comedia,drama');
    expect(url.searchParams.get('plataforma')).toBe('disney plus,prime video');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await dismissDonationPrompt(page);

    await expect(comediaChip).toHaveAttribute('aria-pressed', 'true');
    await expect(dramaChip).toHaveAttribute('aria-pressed', 'true');
    await expect(disneyChip).toHaveAttribute('aria-pressed', 'true');
    await expect(primeChip).toHaveAttribute('aria-pressed', 'true');
  });

  test('individual removal and clear-all reset every filter without stale URL state', async ({ page }) => {
    await gotoHome(page);

    await page.getByRole('button', { name: /^Ganadoras del Oscar$/i }).click();
    await page.getByRole('button', { name: /^Drama$/i }).click();
    await page.getByRole('button', { name: /^Heist$/i }).click();
    await page.getByRole('button', { name: /Filtrar por Disney\+/i }).click();
    await page.locator('[data-movie-search-input]').fill('godfather');

    await page.getByRole('button', { name: /Quitar Filtro: Ganadoras del Oscar/i }).click();
    await expect(page.getByRole('button', { name: /^Ganadoras del Oscar$/i })).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByRole('button', { name: /^Drama$/i })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: /^Heist$/i })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: /Filtrar por Disney\+/i })).toHaveAttribute('aria-pressed', 'true');

    await page.getByRole('button', { name: /^Limpiar todo$/i }).click();
    await expect(page.locator('[data-home-active-filters]')).toBeHidden();
    await expect(page.locator('[data-movie-search-input]')).toHaveValue('');
    await expect(page.getByRole('button', { name: /^Drama$/i })).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByRole('button', { name: /^Heist$/i })).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByRole('button', { name: /Filtrar por Disney\+/i })).toHaveAttribute('aria-pressed', 'false');

    const url = new URL(page.url());
    expect(url.search).toBe('');
  });

  test('all filter groups expose independent controls and URL facets', async ({ page }) => {
    await gotoHome(page);

    const groups = [
      { selector: '[data-home-genre-chip]', idAttribute: 'data-home-genre-id' },
      { selector: '[data-home-subgenre-chip]', idAttribute: 'data-home-subgenre-id', param: 'subgenero' },
      { selector: '[data-home-platform-chip]', idAttribute: 'data-home-platform-id', param: 'plataforma' },
    ] as const;

    for (const group of groups) {
      const chips = page.locator(group.selector);
      const metadata = await chips.evaluateAll((nodes, idAttribute) =>
        nodes.map((node) => ({
          id: node.getAttribute(idAttribute),
          pressed: node.getAttribute('aria-pressed'),
          type: node.getAttribute('type'),
        })),
        group.idAttribute,
      );

      expect(metadata.length).toBeGreaterThan(0);
      expect(metadata.every((chip) => chip.id && chip.pressed === 'false' && chip.type === 'button')).toBeTruthy();
      expect(new Set(metadata.map((chip) => chip.id)).size).toBe(metadata.length);
    }

    const representatives = [
      {
        chip: page.locator('[data-home-genre-chip][data-home-genre-kind="genre"]').first(),
        idAttribute: 'data-home-genre-id',
        param: 'genero',
      },
      {
        chip: page.locator('[data-home-genre-chip][data-home-genre-kind="editorial"]').first(),
        idAttribute: 'data-home-genre-id',
        param: 'filtro',
      },
      {
        chip: page.locator('[data-home-subgenre-chip]').first(),
        idAttribute: 'data-home-subgenre-id',
        param: 'subgenero',
      },
      {
        chip: page.locator('[data-home-platform-chip]').first(),
        idAttribute: 'data-home-platform-id',
        param: 'plataforma',
      },
    ] as const;

    for (const representative of representatives) {
      const chipId = await representative.chip.getAttribute(representative.idAttribute);
      expect(chipId).toBeTruthy();

      await representative.chip.click();
      await expect(representative.chip).toHaveAttribute('aria-pressed', 'true');
      expect(new URL(page.url()).searchParams.get(representative.param)?.split(',')).toContain(chipId);

      await representative.chip.click();
      await expect(representative.chip).toHaveAttribute('aria-pressed', 'false');
      expect(new URL(page.url()).searchParams.has(representative.param)).toBeFalsy();
    }
  });

  test('back and forward restore filter state instead of losing selections', async ({ page }) => {
    await gotoHome(page);

    const oscarChip = page.getByRole('button', { name: /^Ganadoras del Oscar$/i });
    const dramaChip = page.getByRole('button', { name: /^Drama$/i });

    await oscarChip.click();
    await dramaChip.click();
    await expect(dramaChip).toHaveAttribute('aria-pressed', 'true');

    await page.goBack();
    await expect(oscarChip).toHaveAttribute('aria-pressed', 'true');
    await expect(dramaChip).toHaveAttribute('aria-pressed', 'false');

    await page.goForward();
    await expect(oscarChip).toHaveAttribute('aria-pressed', 'true');
    await expect(dramaChip).toHaveAttribute('aria-pressed', 'true');
  });

  test('movie detail return preserves the selected platform and genre filters', async ({ page }) => {
    await gotoHome(page);

    const netflixChip = page.getByRole('button', { name: /Filtrar por Netflix/i });
    const actionChip = page.locator('[data-home-genre-chip][data-home-genre-id="accion"]');

    await netflixChip.click();
    await actionChip.click();

    const movieCard = page.locator('[data-movie-card][data-movie-title="Los mejores de Manila"]');
    await expect(movieCard).toBeVisible();
    await movieCard.getByRole('link', { name: /Ver detalle de Los mejores de Manila/i }).click();
    await expect(page).toHaveURL(/\/peliculas\/los-mejores-de-manila-2025\/$/);
    await expect(page.getByRole('heading', { name: /^Los mejores de Manila$/i })).toBeVisible();

    await page.getByRole('link', { name: 'Volver', exact: true }).click();
    await expect(page).toHaveURL(/\/\?genero=accion&plataforma=netflix$/);
    await expect(netflixChip).toHaveAttribute('aria-pressed', 'true');
    await expect(actionChip).toHaveAttribute('aria-pressed', 'true');
  });
});
