import { expect, test } from '@playwright/test';

const label = 'Secciones de CinePosta';

test('shared section bar keeps all destinations usable from 320px to desktop', async ({ page }, testInfo) => {
  await page.goto('/', { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const nav = page.getByRole('navigation', { name: label });
  const sections = nav.locator('.site-navigation__sections');
  const more = nav.locator('.site-navigation__more');
  for (const width of [320, 390, 768, 1000, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(sections).toHaveJSProperty('open', width > 1000);
    if (width <= 1000) await sections.locator(':scope > summary').click();
    else await more.locator('summary').click();
    await expect(nav.getByRole('link')).toHaveCount(11);
    for (const link of await nav.getByRole('link').all()) await expect(link).toBeVisible();
    const bounds = await nav.evaluate(element => ({
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      fits: [...element.querySelectorAll('a')].every(link => {
        const rect = link.getBoundingClientRect();
        return rect.left >= 0 && rect.right <= innerWidth && rect.height >= 44;
      }),
    }));
    expect(bounds).toEqual({ overflow: false, fits: true });
    await page.screenshot({ path: testInfo.outputPath(`navigation-${width}.png`), fullPage: false });
    if (width <= 1000) await sections.locator(':scope > summary').click();
    else await more.locator('summary').click();
  }
  await expect(page.locator('.donation-invite')).toHaveCount(0);
});

test('news archive and section state remain available on inner pages', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const path of ['/editorial/', '/personas/', '/peliculas/12-angry-men-1957/', '/que-miro-hoy/']) {
    const response = await page.goto(path, { waitUntil: 'load' });
    expect(response?.ok()).toBeTruthy();
    const nav = page.getByRole('navigation', { name: label });
    await expect(nav.getByRole('link', { name: 'Noticias y notas' })).toBeVisible();
    if (path === '/editorial/') await expect(nav.getByRole('link', { name: 'Noticias y notas' })).toHaveAttribute('aria-current', 'true');
    await expect(page.locator('.donation-invite')).toHaveCount(0);
  }
  await page.getByRole('navigation', { name: label }).getByRole('link', { name: 'Noticias y notas' }).click();
  await expect(page).toHaveURL('/editorial/');
  await expect(page.getByRole('heading', { name: 'Editorial CinePosta', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('section anchors land on the content and preserve an active catalog search', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });
  const search = page.locator('[data-movie-search-input]');
  const initialCount = await page.locator('[data-home-result-count]').innerText();
  await search.fill('alien');
  await expect(page.locator('[data-home-result-count]')).not.toHaveText(initialCount);
  const nav = page.getByRole('navigation', { name: label });
  for (const [name, id] of [['Películas', 'catalogo-filtros'], ['En cines', 'cinema-release-carousel'], ['Streaming', 'streaming-release-carousel'], ['Recomendadas', 'weekly-recommendations']]) {
    await page.evaluate(() => scrollTo(0, 0));
    const sections = nav.locator('.site-navigation__sections');
    if (await sections.locator(':scope > summary').isVisible() && !await sections.evaluate((node: HTMLDetailsElement) => node.open)) {
      await sections.locator(':scope > summary').click();
    }
    await nav.getByRole('link', { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(page.locator(`#${id}`)).toBeInViewport();
    await expect(nav.locator(`a[href$="#${id}"]`)).toHaveAttribute('aria-current', 'location');
    await expect(search).toHaveValue('alien');
  }
});

test('disclosures work with the keyboard and Escape restores focus', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'load' });
  const nav = page.getByRole('navigation', { name: label });
  const sections = nav.locator('.site-navigation__sections');
  const summary = sections.locator(':scope > summary');
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(sections).toHaveAttribute('open');
  const cinemaLink = nav.getByRole('link', { name: 'En cines', exact: true });
  // This WebKit harness skips native links with Tab, following its keyboard
  // preference. Exercise Escape from a focused link in both engines and
  // verify the native Tab sequence in Chromium.
  if (testInfo.project.name.endsWith('webkit')) await cinemaLink.focus();
  else await page.keyboard.press('Tab');
  await expect(cinemaLink).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(sections).not.toHaveAttribute('open');
  await expect(summary).toBeFocused();
  await page.setViewportSize({ width: 1440, height: 900 });
  const more = nav.locator('.site-navigation__more');
  // Wait for the responsive media-change handler before opening desktop More.
  await expect(sections).toHaveJSProperty('open', true);
  await expect(more).toHaveJSProperty('open', false);
  await more.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(more).toHaveAttribute('open');
  await page.keyboard.press('Escape');
  await expect(more).not.toHaveAttribute('open');
  await expect(more.locator('summary')).toBeFocused();
});

test('desktop dropdown covers the home header with a solid surface', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'load' });
  const more = page.locator('.site-navigation__more');
  await more.locator('summary').click();
  const menu = more.locator('.site-navigation__extra');
  await expect(menu).toHaveCSS('background-color', 'rgb(16, 19, 24)');
  const covered = await menu.evaluate(element => {
    const rect = element.getBoundingClientRect();
    return [.2, .4, .7, .9].every(y => [.1, .5, .9].every(x => {
      const front = document.elementFromPoint(rect.left + rect.width * x, rect.top + rect.height * y);
      return front !== null && element.contains(front);
    }));
  });
  expect(covered).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('navigation-dropdown.png') });
});
