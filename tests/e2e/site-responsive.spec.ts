import { expect, test } from '@playwright/test';

const routes = [
  '/', '/peliculas/akira-1988/', '/personas/brad-pitt/', '/personas/', '/que-miro-hoy/',
  '/comunidad/', '/comunidad/peliculas/12-angry-men-1957/', '/editorial/',
  '/editorial/resident-evil-noche-cero-la-veria-99-veces/', '/juegos/simulador-carrera-actor/',
  '/como-funciona/', '/sobre-cine-posta/', '/politica-editorial/', '/fuentes-y-datos/',
  '/contacto/', '/politica-de-privacidad/', '/equipo/', '/copyright-y-uso-de-material/',
];

for (const path of routes) {
  test(`shared responsive shell and readable fields: ${path}`, async ({ page }, testInfo) => {
    // Keep backend-dependent screens read-only and deterministic.
    await page.route('**/rest/v1/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    const response = await page.goto(path);
    expect(response?.ok()).toBe(true);
    await expect(page.locator('main#main-content')).toHaveCount(1);
    await expect(page.locator('.site-footer')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    for (const width of testInfo.project.name.startsWith('mobile-') ? [320, 390, 844] : [768, 1280]) {
      await page.setViewportSize({ width, height: width === 844 ? 390 : 844 });
      const metrics = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        fields: [...document.querySelectorAll<HTMLElement>('input:not([type="radio"]):not([type="checkbox"]):not([type="hidden"]), select, textarea')]
          .filter(element => element.getClientRects().length > 0)
          .map(element => ({ selector: element.className || element.id, size: parseFloat(getComputedStyle(element).fontSize) })),
        stickyPanels: [...document.querySelectorAll<HTMLElement>('.community-page__rules, .postometro-results')]
          .filter(element => element.getClientRects().length > 0)
          .map(element => getComputedStyle(element).position),
      }));
      expect(metrics.overflow, `${path} at ${width}px`).toBe(false);
      if (testInfo.project.name.startsWith('mobile-')) {
        expect(metrics.fields.filter(field => field.size < 16), `${path} fields at ${width}px`).toEqual([]);
        expect(metrics.stickyPanels).not.toContain('sticky');
      }
    }
    expect(errors).toEqual([]);
  });
}
