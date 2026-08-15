import { expect, test } from '@playwright/test';

test('mobile home keeps touch targets and content within the viewport', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('mobile-'), 'This layout check is intentionally mobile-only.');
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
    const platformBounds = [...document.querySelectorAll<HTMLElement>('.movie-card__platform-mark')]
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return { left: rect.left, right: rect.right, width: rect.width };
      })
      .filter((rect) => rect.width > 0 && (rect.left < -1 || rect.right > viewportWidth + 1));

    const cardCollisions = [...document.querySelectorAll<HTMLElement>('.movie-card')]
      .map((card) => {
        const category = card.querySelector<HTMLElement>('.movie-card__cta')?.getBoundingClientRect();
        const platform = card.querySelector<HTMLElement>('.movie-card__platform-mark')?.getBoundingClientRect();
        if (!category || !platform) return false;
        return category.right > platform.left && category.left < platform.right && category.bottom > platform.top && category.top < platform.bottom;
      })
      .filter(Boolean);

    return {
      contentFits: document.documentElement.scrollWidth <= window.innerWidth,
      controlHeights: controls.map((control) => control.getBoundingClientRect().height),
      platformBounds,
      cardCollisions,
    };
  });

  expect(measurements.contentFits).toBeTruthy();
  expect(measurements.controlHeights.length).toBeGreaterThan(0);
  expect(Math.min(...measurements.controlHeights)).toBeGreaterThanOrEqual(44);
  expect(measurements.platformBounds).toEqual([]);
  expect(measurements.cardCollisions).toEqual([]);
});

test('mobile home exposes the complete app flow and keeps cinema labels on one line', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('mobile-'), 'This flow is intentionally mobile-only.');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(350);

  const sectionState = await page.evaluate(() => {
    const selectors = [
      '[data-home-people-grid]',
      '.news-rail',
      '[data-cinema-release-carousel="cinema-release-carousel"]',
      '[data-cinema-release-carousel="streaming-release-carousel"]',
      '.editorial-rankings',
      '.weekly-suggestion',
      '[data-home-actor-game]',
      '#comunidad-home',
    ];

    return Object.fromEntries(
      selectors.map((selector) => {
        const element = document.querySelector<HTMLElement>(selector);
        if (!element) return [selector, false];
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return [selector, style.display !== 'none' && style.visibility !== 'hidden' && rect.height > 0];
      }),
    );
  });

  await expect(page.locator('.home-mobile-nav')).toBeVisible();
  expect(Object.values(sectionState).every(Boolean)).toBeTruthy();

  for (const target of ['#catalogo-filtros', '#cinema-release-carousel', '#que-vemos-hoy', '#comunidad-home']) {
    await page.locator(`.home-mobile-nav a[href="${target}"]`).click();
    await expect
      .poll(() => page.evaluate((selector) => {
        const targetElement = document.querySelector<HTMLElement>(selector);
        const navigation = document.querySelector<HTMLElement>('.home-mobile-nav');
        if (!targetElement || !navigation) return Number.NEGATIVE_INFINITY;
        return targetElement.getBoundingClientRect().top - navigation.getBoundingClientRect().bottom;
      }, target))
      .toBeGreaterThanOrEqual(-1);
  }

  const cinemaLabels = await page.locator('.movie-card__platform-mark .platform-mark--tile.platform-chip--cine .platform-chip__cine-label').evaluateAll((elements) =>
    elements.map((element) => ({
      whiteSpace: getComputedStyle(element).whiteSpace,
      height: Math.round(element.getBoundingClientRect().height),
      lineHeight: Number.parseFloat(getComputedStyle(element).lineHeight),
    })),
  );

  expect(cinemaLabels.length).toBeGreaterThan(0);
  expect(cinemaLabels.every((label) => label.whiteSpace === 'nowrap' && label.height <= label.lineHeight * 1.25)).toBeTruthy();
});

test('mobile home compacts filters and keeps every facet reachable in the carousel', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('mobile-'), 'This compact layout is intentionally mobile-only.');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const carousel = page.locator('[data-home-filter-carousel]');
  const panels = page.locator('[data-home-filter-panel]');
  await expect(carousel).toBeVisible();
  await expect(panels).toHaveCount(4);

  const initialLayout = await carousel.evaluate((element) => {
    const node = element as HTMLElement;
    return {
      clientWidth: node.clientWidth,
      scrollWidth: node.scrollWidth,
      display: getComputedStyle(node).display,
      overflowX: getComputedStyle(node).overflowX,
    };
  });

  expect(initialLayout.scrollWidth).toBeLessThanOrEqual(initialLayout.clientWidth + 1);
  expect(initialLayout.display).toBe('grid');
  expect(initialLayout.overflowX).toBe('visible');

  const rails = carousel.locator('.home-platform-filter__chips, .home-genre-filter__chips');
  await expect(rails).toHaveCount(4);
  const editorialRail = carousel.locator('[data-home-filter-panel="editorial"] .home-genre-filter__chips');
  await expect(editorialRail.locator('[data-home-genre-chip]')).toHaveCount(4);
  await expect(editorialRail.locator('[data-home-genre-chip]').last()).toHaveText('Guerra');
  const railLayouts = await rails.evaluateAll((elements) =>
    elements.map((element) => {
      const node = element as HTMLElement;
      const style = getComputedStyle(node);
      const chips = [...node.children].map((child) => (child as HTMLElement).getBoundingClientRect());
      return {
        clientWidth: node.clientWidth,
        scrollWidth: node.scrollWidth,
        clientHeight: node.clientHeight,
        scrollHeight: node.scrollHeight,
        touchAction: style.touchAction,
        snapType: style.scrollSnapType,
        oneLine: chips.length > 0 && Math.max(...chips.map((rect) => rect.bottom)) - Math.min(...chips.map((rect) => rect.top)) <= node.clientHeight + 1,
      };
    }),
  );

  expect(railLayouts.every((rail) => rail.scrollHeight <= rail.clientHeight + 1)).toBeTruthy();
  expect(railLayouts.every((rail) => rail.touchAction === 'pan-x' && /x|inline/.test(rail.snapType))).toBeTruthy();
  expect(railLayouts.every((rail) => rail.oneLine)).toBeTruthy();

  for (let index = 0; index < await rails.count(); index += 1) {
    const rail = rails.nth(index);
    await rail.evaluate((element) => {
      const node = element as HTMLElement;
      node.scrollTo({ left: node.scrollWidth, behavior: 'auto' });
    });
    await expect
      .poll(() => rail.evaluate((element) => {
        const node = element as HTMLElement;
        const lastChip = node.lastElementChild as HTMLElement | null;
        if (!lastChip) return false;
        const railBounds = node.getBoundingClientRect();
        const chipBounds = lastChip.getBoundingClientRect();
        return chipBounds.left >= railBounds.left - 1 && chipBounds.right <= railBounds.right + 1;
      }))
      .toBeTruthy();
  }

  const peopleCards = await page.locator('[data-home-people-grid] .home-people-showcase__card:not(.home-people-showcase__card--cta)').count();
  expect(peopleCards).toBeGreaterThan(0);
  await expect(page.locator('[data-home-people-grid] .home-people-showcase__card:visible')).toHaveCount(3);
  await expect(page.locator('.upcoming-release-list__item:visible')).toHaveCount(2);
  await expect(page.locator('.weekly-suggestion__queue-item:visible')).toHaveCount(4);
  await expect(page.locator('[data-upcoming-suggestion-count]')).toHaveText('1 de 4');
  const upcomingNext = page.locator('[data-upcoming-suggestion-next]');
  for (const expectedCount of ['2 de 4', '3 de 4', '4 de 4', '1 de 4']) {
    await upcomingNext.click();
    await expect(page.locator('[data-upcoming-suggestion-count]')).toHaveText(expectedCount);
  }
  await expect(page.locator('.editorial-rankings__card:visible')).toHaveCount(2);
  await expect(page.locator('.home-people-showcase__card--cta:visible')).toContainText('perfiles conectados');
  await expect(page.locator('.postometro-teaser__link').first()).toHaveJSProperty('offsetHeight', 48);

  const compactPromoHeights = await page.locator('[data-home-actor-game], .home-community-promo').evaluateAll((cards) =>
    cards.map((card) => Math.round(card.getBoundingClientRect().height)),
  );
  expect(compactPromoHeights.every((height) => height <= 112)).toBeTruthy();
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

test('touch landscape keeps the mobile app shell contained', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('mobile-'), 'This flow is intentionally touch-only.');
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(350);

  const measurements = await page.evaluate(() => ({
    contentFits: document.documentElement.scrollWidth <= window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
    navVisible: getComputedStyle(document.querySelector<HTMLElement>('.home-mobile-nav')!).display !== 'none',
    completeFlowVisible: ['.news-rail', '.editorial-rankings', '.weekly-suggestion'].every((selector) => {
      const element = document.querySelector<HTMLElement>(selector);
      return Boolean(element && getComputedStyle(element).display !== 'none');
    }),
  }));

  expect(measurements.contentFits).toBeTruthy();
  expect(measurements.documentWidth).toBeLessThanOrEqual(measurements.viewportWidth + 1);
  expect(measurements.navVisible).toBeTruthy();
  expect(measurements.completeFlowVisible).toBeTruthy();
});

test('desktop keeps the complete home while mobile-only reductions stay hidden', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('desktop-'), 'This regression is intentionally desktop-only.');
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-home-people-grid] .home-people-showcase__card')).toHaveCount(11);
  await expect(page.locator('.upcoming-release-list__item')).toHaveCount(3);
  await expect(page.locator('.weekly-suggestion__queue-item')).toHaveCount(5);
  await expect(page.locator('[data-upcoming-suggestion-count]')).toHaveText('1 de 5');
  await expect(page.locator('.editorial-rankings__card')).toHaveCount(5);
  await expect(page.locator('.home-mobile-nav')).toBeHidden();
});
