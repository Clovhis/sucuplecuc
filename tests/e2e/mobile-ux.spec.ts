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
      touchAction: getComputedStyle(node).touchAction,
      snapType: getComputedStyle(node).scrollSnapType,
    };
  });

  expect(initialLayout.scrollWidth).toBeGreaterThan(initialLayout.clientWidth);
  expect(initialLayout.touchAction).toBe('pan-x');
  expect(initialLayout.snapType).toMatch(/x|inline/);

  for (let index = 0; index < 4; index += 1) {
    await carousel.evaluate((element, panelIndex) => {
      const node = element as HTMLElement;
      const panel = node.querySelectorAll<HTMLElement>('[data-home-filter-panel]')[panelIndex];
      node.scrollTo({ left: panel?.offsetLeft ?? 0, behavior: 'auto' });
    }, index);

    await expect
      .poll(() => panels.nth(index).evaluate((element) => {
        const panel = element.getBoundingClientRect();
        const viewport = element.closest<HTMLElement>('[data-home-filter-carousel]')?.getBoundingClientRect();
        return Boolean(viewport && panel.left >= viewport.left - 1 && panel.right <= viewport.right + 1);
      }))
      .toBeTruthy();
  }

  const peopleCards = await page.locator('[data-home-people-grid] .home-people-showcase__card:not(.home-people-showcase__card--cta)').count();
  expect(peopleCards).toBeGreaterThan(0);
  await expect(page.locator('[data-home-people-grid] .home-people-showcase__card:visible')).toHaveCount(3);
  await expect(page.locator('.upcoming-release-list__item:visible')).toHaveCount(2);
  await expect(page.locator('.editorial-rankings__card:visible')).toHaveCount(2);
  await expect(page.locator('.home-people-showcase__card--cta:visible')).toContainText('perfiles conectados');
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
  await expect(page.locator('.editorial-rankings__card')).toHaveCount(5);
  await expect(page.locator('.home-mobile-nav')).toBeHidden();
});
