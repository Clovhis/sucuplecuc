import { expect, test } from '@playwright/test';

test('retired forum URLs redirect directly to the catalog or canonical movie', async ({ page, request }) => {
  for (const [path, destination] of [
    ['/comunidad/', '/catalogo/'],
    ['/comunidad/peliculas/akira-1988/', '/peliculas/akira-1988/'],
    ['/comunidad/peliculas/seven-samurai-1954/', '/peliculas/los-siete-samurais-1954/'],
    ['/comunidad/peliculas/paprika-detective-de-los-suenos-2006/', '/peliculas/paprika-2006/'],
    ['/comunidad/peliculas/la-apuesta-mas-alta-2026/', '/peliculas/la-apuesta-mas-alta-2026/'],
  ]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    const html = await response.text();
    expect(html).toContain(`rel="canonical" href="https://www.cineposta.com.ar${destination}"`);
    expect(html).toContain(`http-equiv="refresh" content="0;url=${destination}"`);
    expect(html).not.toMatch(/<script|community-comments|communitySupabase/);
    await page.goto(path);
    await expect(page).toHaveURL(destination);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.cineposta.com.ar${destination}`);
  }
  expect((await request.get('/images/community/foro-cineposta-comunidad.png')).status()).toBe(404);
  expect((await request.get('/comunidad/peliculas/no-existe-0000/')).status()).toBe(404);
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).not.toContain('/comunidad/');
  expect(sitemap).toContain('/peliculas/akira-1988/');
  expect(sitemap).toContain('/juegos/trivia/');
  expect(sitemap).toContain('/juegos/cinecriptico/');
});

test('shared pages no longer offer forum links or initialize its anonymous session', async ({ page }) => {
  const forumRequests: string[] = [];
  page.on('request', request => {
    if (/community|comunidad/.test(request.url())) forumRequests.push(request.url());
  });
  for (const path of ['/', '/peliculas/akira-1988/', '/equipo/', '/politica-de-privacidad/', '/juegos/']) {
    await page.goto(path);
    await expect(page.locator('a[href*="/comunidad"], [data-community-comments], [data-community-discussions]')).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('cineposta-community-anon-auth'))).toBeNull();
  }
  expect(forumRequests).toEqual([]);
});

test('movie reading order ends with team verdict, quick take and audience votes', async ({ page }) => {
  // Colony has an editorial link; the other movies cover layouts without one.
  for (const slug of ['colony-zona-cero-2026', 'digger-2026', 'heartland-2026']) {
    await page.goto(`/peliculas/${slug}/`);
    const stack = page.locator('.movie-detail__hero-stack');
    const sections = ['.movie-detail__synopsis-card', '.movie-detail__review-card',
      '.movie-reaction', '.movie-detail__ten-second-card', '.movie-detail__reader'];
    const order = await stack.evaluate((element, selectors) => {
      const children = [...element.children];
      return selectors.map(selector => children.findIndex(child => child.matches(selector)));
    }, sections);
    expect(order.every(index => index >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(order[3]).toBe(order[2] + 1);
    expect(order[4]).toBe(order[3] + 1);
    for (let i = 1; i < sections.length; i++) {
      const previous = await stack.locator(sections[i - 1]).boundingBox();
      const current = await stack.locator(sections[i]).boundingBox();
      expect(current!.y).toBeGreaterThanOrEqual(previous!.y + previous!.height - 1);
    }
    await expect(stack.getByRole('heading', { name: '¿La miro?', exact: true })).toHaveCount(1);
    await expect(stack.locator('[data-rating-widget] button')).toHaveCount(10);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
});

test('every editorial meter follows La posta and precedes the team verdict', async ({ page }) => {
  for (const [slug, meter] of [
    ['john-wick-chapter-4-2023', 'explosiometro'],
    ['titanic-1997', 'lagrimometro'],
    ['esperando-la-carroza-1985', 'jajametro'],
    ['the-exorcist-1973', 'cagazometro'],
    ['terrifier-2-2022', 'sangrometro'],
  ]) {
    await page.goto(`/peliculas/${slug}/`);
    const signals = page.locator('.movie-detail__signals');
    await expect(signals.locator(`#${meter}`)).toBeVisible();
    expect(await signals.evaluate(element => element.previousElementSibling?.classList.contains('movie-detail__review-card'))).toBe(true);
    const bounds = await page.evaluate(() => {
      const rect = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
      return { review: rect('.movie-detail__review-card').bottom, meterTop: rect('.movie-detail__signals').top,
        meterBottom: rect('.movie-detail__signals').bottom, team: rect('.movie-reaction').top };
    });
    expect(bounds.meterTop).toBeGreaterThanOrEqual(bounds.review - 1);
    expect(bounds.team).toBeGreaterThanOrEqual(bounds.meterBottom - 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
  await page.goto('/peliculas/akira-1988/');
  await expect(page.locator('.movie-detail__signals')).toHaveCount(0);
});
