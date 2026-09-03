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

  test('war editorial filter returns only movies tagged as war', async ({ page }) => {
    await gotoHome(page);

    const warChip = page.getByRole('button', { name: /^Guerra$/i });
    await expect(warChip).toHaveCount(1);
    await expect(warChip).toHaveAttribute('data-home-genre-kind', 'editorial');

    await warChip.click();
    await expect(warChip).toHaveAttribute('aria-pressed', 'true');
    await expect
      .poll(() => visibleMovieTitles(page), {
        message: 'El filtro Guerra debería devolver películas',
      })
      .not.toEqual([]);

    const cards = await page.locator('[data-movie-search-grid] [data-movie-card]').evaluateAll((movieCards) =>
      movieCards.map((card) => ({
        genres: card.getAttribute('data-movie-genres')?.split(',').filter(Boolean) ?? [],
      })),
    );

    expect(cards.length).toBeGreaterThan(0);
    expect(cards.every((card) => card.genres.includes('guerra'))).toBeTruthy();
    for (const title of ['El día D: Bajo presión', 'Inglourious Basterds', 'Saving Private Ryan']) {
      await expect(page.locator(`[data-movie-card][data-movie-title="${title}"]`)).toBeVisible();
    }
    for (const title of ['Casablanca', 'El puente de los espías', 'Dr. Insólito', 'El laberinto del fauno']) {
      await expect(page.locator(`[data-movie-card][data-movie-title="${title}"]`)).toBeHidden();
    }
    expect(new URL(page.url()).searchParams.get('filtro')).toBe('guerra');
    await expect(page.locator('[data-movie-search-summary]').first()).toContainText('filtro Guerra');
  });

  test('cult editorial filter returns only curated cult films', async ({ page }) => {
    await gotoHome(page);

    const cultChip = page.getByRole('button', { name: /^De culto$/i });
    await expect(cultChip).toHaveCount(1);
    await expect(cultChip).toHaveAttribute('data-home-genre-id', 'culto');
    await expect(cultChip).toHaveAttribute('data-home-genre-kind', 'editorial');

    await cultChip.click();
    await expect(cultChip).toHaveAttribute('aria-pressed', 'true');
    await expect
      .poll(() => visibleMovieTitles(page), {
        message: 'El filtro De culto debería devolver películas',
      })
      .not.toEqual([]);

    const cards = await page.locator('[data-movie-search-grid] [data-movie-card]').evaluateAll((movieCards) =>
      movieCards.map((card) => ({
        title: card.getAttribute('data-movie-title') ?? '',
        genres: card.getAttribute('data-movie-genres')?.split(',').filter(Boolean) ?? [],
      })),
    );

    expect(cards.length).toBeGreaterThan(0);
    expect(cards.every((card) => card.genres.includes('culto'))).toBeTruthy();
    for (const title of ['El espectáculo de imágenes de terror de Rocky', 'La habitación (The room)', 'Troll 2']) {
      await expect(page.locator(`[data-movie-card][data-movie-title="${title}"]`)).toBeVisible();
    }
    await expect(page.locator('[data-movie-card][data-movie-title="Battle Royale"]')).toBeVisible();
    await expect(page.locator('[data-movie-search-summary]').first()).toContainText('filtro De culto');
    expect(new URL(page.url()).searchParams.get('filtro')).toBe('culto');
  });

  test('editorial filters stay aligned in one desktop row without horizontal overflow', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.startsWith('mobile-'), 'Desktop layout assertion');
    await gotoHome(page);

    const layout = await page.locator('[data-home-filter-panel="editorial"]').evaluate((panel) => {
      const rail = panel.querySelector<HTMLElement>('.home-genre-filter__chips');
      const chips = Array.from(panel.querySelectorAll<HTMLElement>('[data-home-genre-chip]'));
      const heading = panel.querySelector<HTMLElement>('.home-genre-filter__heading');
      const subgenrePanel = document.querySelector<HTMLElement>('[data-home-filter-panel="subgenre"]');
      const panelRect = panel.getBoundingClientRect();
      const headingRect = heading?.getBoundingClientRect();
      const subgenreRect = subgenrePanel?.getBoundingClientRect();
      const chipRects = chips.map((chip) => chip.getBoundingClientRect());
      const rowTops = new Set(chipRects.map((rect) => Math.round(rect.top)));

      return {
        chipCount: chips.length,
        railOverflow: Boolean(rail && rail.scrollWidth > rail.clientWidth + 1),
        chipRows: rowTops.size,
        chipsInsidePanel: chipRects.every(
          (rect) => rect.left >= panelRect.left - 1 && rect.right <= panelRect.right + 1,
        ),
        editorialChipDecorations: chips.map((chip) => getComputedStyle(chip, '::after').display),
        editorialChipGap: headingRect && chipRects[0] ? chipRects[0].top - headingRect.bottom : Number.POSITIVE_INFINITY,
        editorialPanelHeight: panelRect.height,
        panelBottomDelta: subgenreRect ? Math.abs(panelRect.bottom - subgenreRect.bottom) : Number.POSITIVE_INFINITY,
        pageOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      };
    });

    expect(layout.chipCount).toBe(5);
    expect(layout.railOverflow).toBeFalsy();
    expect(layout.chipRows).toBe(1);
    expect(layout.chipsInsidePanel).toBeTruthy();
    expect(layout.editorialChipDecorations.every((display) => display === 'none')).toBeTruthy();
    expect(layout.editorialChipGap).toBeLessThanOrEqual(12);
    expect(layout.editorialPanelHeight).toBeCloseTo(128, 0);
    expect(layout.panelBottomDelta).toBeLessThanOrEqual(1);
    expect(layout.pageOverflow).toBeFalsy();
  });

  test('subgenre and editorial chips show their concise definition only with a desktop cursor', async ({ page }, testInfo) => {
    await gotoHome(page);

    const chips = [
      {
        selector: '[data-home-subgenre-id="heist"]',
        label: 'Heist',
        description: 'Un golpe planificado, con robo, equipo y estrategia.',
      },
      {
        selector: '[data-home-genre-kind="editorial"][data-home-genre-id="guerra"]',
        label: 'Guerra',
        description: 'Conflictos armados y sus efectos en quienes los atraviesan.',
      },
    ];

    for (const { selector, label, description } of chips) {
      const chip = page.locator(selector);
      await expect(chip).toHaveAccessibleName(label);
      await expect(chip).toHaveAttribute('data-filter-description', description);

      const tooltipState = async () => chip.evaluate((element) => {
        const styles = getComputedStyle(element, '::before');
        return { content: styles.content, opacity: styles.opacity, visibility: styles.visibility };
      });

      if (testInfo.project.name.startsWith('mobile-')) {
        await expect.poll(tooltipState).toEqual({ content: 'none', opacity: '1', visibility: 'visible' });
        continue;
      }

      await expect.poll(tooltipState).toMatchObject({ opacity: '0', visibility: 'hidden' });
      const box = await chip.boundingBox();
      expect(box).not.toBeNull();
      await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
      await expect.poll(tooltipState).toMatchObject({ opacity: '1', visibility: 'visible' });
    }
  });

  test('road movie + platform narrows correctly', async ({ page }) => {
    await gotoHome(page);

    await page.getByRole('button', { name: /^Road Movie$/i }).click();
    await page.getByRole('button', { name: /Filtrar por Prime Video/i }).click();

    await expectMovieTitles(page, [
      'La voluntad de Dios',
      'C’mon C’mon: Siempre adelante',
      'Green Book',
      'París, Texas',
      'Ladrón de bicicletas',
    ]);
  });

  test('primary genre + platform only returns cards in the selected category', async ({ page }) => {
    await gotoHome(page);

    await page.getByRole('button', { name: /Filtrar por Apple TV\+/i }).click();
    await page.getByRole('button', { name: /^Drama$/i }).click();

    const cards = await page.locator('[data-movie-search-grid] [data-movie-card]').evaluateAll((movieCards) =>
      movieCards.map((card) => ({
        title: card.getAttribute('data-movie-title') ?? '',
        primaryGenre: card.getAttribute('data-movie-primary-genre') ?? '',
        platforms: card.getAttribute('data-movie-platforms')?.split(',').filter(Boolean) ?? [],
        displayedCategory: card.querySelector('.movie-card__cta')?.textContent?.trim() ?? '',
      })),
    );

    expect(cards.length).toBeGreaterThan(0);
    expect(cards.every((card) => card.primaryGenre === 'drama')).toBeTruthy();
    expect(cards.every((card) => card.platforms.includes('apple tv'))).toBeTruthy();
    expect(cards.every((card) => card.displayedCategory.toLocaleLowerCase() === 'drama')).toBeTruthy();
  });

  test('multiple values stay OR within a facet and AND across facets', async ({ page }) => {
    await gotoHome(page);

    await page.getByRole('button', { name: /^Comedia$/i }).click();
    await page.getByRole('button', { name: /^Drama$/i }).click();
    await page.getByRole('button', { name: /Filtrar por Disney\+/i }).click();
    await page.getByRole('button', { name: /Filtrar por Prime Video/i }).click();

    const cards = await page.locator('[data-movie-search-grid] [data-movie-card]').evaluateAll((movieCards) =>
      movieCards.map((card) => ({
        primaryGenre: card.getAttribute('data-movie-primary-genre') ?? '',
        platforms: card.getAttribute('data-movie-platforms')?.split(',').filter(Boolean) ?? [],
      })),
    );

    expect(cards.length).toBeGreaterThan(0);
    expect(cards.every((card) => ['comedia', 'drama'].includes(card.primaryGenre))).toBeTruthy();
    expect(cards.every((card) => card.platforms.some((platform) => ['disney plus', 'prime video'].includes(platform)))).toBeTruthy();
  });

  test('every subgenre chip intersects correctly with Netflix', async ({ page }) => {
    test.setTimeout(60_000);
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

      await expect(chip).toBeVisible();
      await expect(chip).toBeEnabled();
      await chip.click({ force: true });
      await expect(chip).toHaveAttribute('aria-pressed', 'true');
      await expectMovieTitles(page, expectedTitles);
      await chip.click({ force: true });
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
    const primaryGenres = await page.locator('[data-movie-search-grid] [data-movie-card]').evaluateAll((cards) =>
      cards.map((card) => card.getAttribute('data-movie-primary-genre') ?? ''),
    );
    expect(movieGenres.every((genres) => genres.includes('oscar-mejor-pelicula') && genres.includes('drama'))).toBeTruthy();
    expect(primaryGenres.every((genre) => genre === 'drama')).toBeTruthy();
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
    const crimeChip = page.locator('[data-home-genre-chip][data-home-genre-id="crimen"]');

    await netflixChip.click();
    await crimeChip.click();

    const movieCard = page.locator('[data-movie-card][data-movie-title="Los mejores de Manila"]');
    await expect(movieCard).toBeVisible();
    await movieCard.getByRole('link', { name: /Ver detalle de Los mejores de Manila/i }).click();
    await expect(page).toHaveURL(/\/peliculas\/los-mejores-de-manila-2025\/$/);
    await expect(page.getByRole('heading', { name: /^Los mejores de Manila$/i })).toBeVisible();

    await page.getByRole('link', { name: 'Volver', exact: true }).click();
    await expect(page).toHaveURL(/\/\?genero=crimen&plataforma=netflix$/);
    await expect(netflixChip).toHaveAttribute('aria-pressed', 'true');
    await expect(crimeChip).toHaveAttribute('aria-pressed', 'true');
  });
});
