import { expect, test } from '@playwright/test';

const footerPaths = ['/', '/que-miro-hoy/', '/personas/', '/comunidad/', '/editorial/',
  '/como-funciona/', '/sobre-cine-posta/', '/equipo/', '/politica-editorial/',
  '/fuentes-y-datos/', '/copyright-y-uso-de-material/', '/contacto/', '/politica-de-privacidad/'];

test('shared footer keeps every destination usable across responsive widths', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('.site-footer');
  const about = footer.locator('details');
  for (const width of [320, 390, 600, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(about).toHaveJSProperty('open', width > 720);
    if (width <= 720) {
      await about.locator('summary').click();
    }
    expect(await footer.locator('.site-footer__nav a').evaluateAll(links =>
      links.map(link => link.getAttribute('href')))).toEqual(expect.arrayContaining(footerPaths));
    for (const link of await footer.locator('.site-footer__nav a').all()) {
      await expect(link).toBeVisible();
    }
    const layout = await footer.evaluate(element => {
      const rect = element.getBoundingClientRect();
      const controls = [...element.querySelectorAll<HTMLElement>('a, summary')]
        .filter(control => control.getClientRects().length > 0);
      return {
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        height: rect.height,
        contained: controls.every(control => {
          const r = control.getBoundingClientRect();
          return r.left >= -1 && r.right <= innerWidth + 1 && r.height >= 43.5;
        }),
        animation: getComputedStyle(element.querySelector('.site-footer__donate-logo')!).animationName,
        contactFont: getComputedStyle(element.querySelector('address')!).fontStyle,
      };
    });
    expect(layout.overflow).toBe(false);
    expect(layout.contained).toBe(true);
    expect(layout.animation).toBe('none');
    expect(layout.contactFont).toBe('normal');
    if (width <= 720) await about.locator('summary').click();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(about).not.toHaveAttribute('open');
  const support = footer.getByRole('link', { name: /Apoyá con un cafecito/ });
  await expect(support).toHaveAttribute('href', 'https://cafecito.app/cineposta');
  await expect(support).toHaveAttribute('rel', 'noopener noreferrer');
  await about.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(about).toHaveAttribute('open', '');
  await footer.getByRole('link', { name: 'Fuentes', exact: true }).click();
  await expect(page).toHaveURL('/fuentes-y-datos/');
});

test('mobile filter rails allow vertical page gestures and horizontal browsing', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'Native touch injection uses Chromium CDP.');
  await page.goto('/');
  await page.locator('[data-home-advanced-filters] summary').click();
  const rail = page.locator('.home-advanced-filters .home-platform-filter__chips');
  await rail.scrollIntoViewIfNeeded();
  await expect(rail).toHaveCSS('touch-action', 'auto');
  const box = await rail.boundingBox();
  const session = await context.newCDPSession(page);
  const x = box!.x + box!.width / 2;
  const y = box!.y + box!.height / 2;
  const startScroll = await page.evaluate(() => scrollY);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let step = 1; step <= 6; step++) {
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - step * 25 }] });
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(startScroll + 50);
  await rail.scrollIntoViewIfNeeded();
  const nextBox = await rail.boundingBox();
  const sx = nextBox!.x + nextBox!.width * .8;
  const sy = nextBox!.y + nextBox!.height / 2;
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: sx, y: sy }] });
  for (let step = 1; step <= 6; step++) {
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: sx - step * 25, y: sy }] });
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(() => rail.evaluate(element => element.scrollLeft)).toBeGreaterThan(30);
  await session.detach();
});
