import { expect, test } from '@playwright/test';

test.use({ javaScriptEnabled: false });

test('the static catalog links every canonical movie exactly once', async ({ request }) => {
	const sitemapResponse = await request.get('/sitemap.xml');
	expect(sitemapResponse.ok()).toBeTruthy();
	const xml = await sitemapResponse.text();
	const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
	const movies = urls.filter((url) => new URL(url).pathname.startsWith('/peliculas/'));
	const catalog = urls.filter((url) => new URL(url).pathname.startsWith('/catalogo/'));
	expect(catalog.length).toBe(Math.ceil(movies.length / 48));
	const linkedMovies: string[] = [];
	for (const [index, url] of catalog.entries()) {
		const response = await request.get(new URL(url).pathname);
		expect(response.ok(), url).toBeTruthy();
		const html = await response.text();
		expect(html).toContain(`<link rel="canonical" href="${url}"`);
		expect(html).not.toMatch(/name="robots" content="[^"]*noindex/);
		const slugs = [...html.matchAll(/data-movie-slug="([^"]+)"/g)].map((match) => match[1]);
		expect(slugs.length).toBe(index === catalog.length - 1 ? movies.length - 48 * index : 48);
		linkedMovies.push(...slugs.map((slug) => `https://www.cineposta.com.ar/peliculas/${slug}/`));
		if (index < catalog.length - 1) expect(html).toContain(`href="${new URL(catalog[index + 1]).pathname}" rel="next"`);
		if (index > 0) expect(html).toContain(`href="${new URL(catalog[index - 1]).pathname}" rel="prev"`);
	}
	expect(new Set(linkedMovies).size).toBe(movies.length);
	expect(linkedMovies.sort()).toEqual(movies.sort());
});

test('catalog navigation works without JavaScript and fits narrow screens', async ({ page }) => {
	await page.goto('/catalogo/');
	await expect(page.getByRole('heading', { name: 'Catálogo de películas', exact: true })).toBeVisible();
	await expect(page.locator('[data-movie-card]')).toHaveCount(48);
	await expect(page.locator('[data-movie-card]').first()).toHaveCSS('content-visibility', 'visible');
	await expect(page.locator('[data-movie-card]').last()).toHaveCSS('content-visibility', 'visible');
	await expect(page.locator('.catalog-page__pagination [aria-current="page"]')).toHaveText('1');
	await page.getByRole('link', { name: 'Siguiente', exact: true }).click();
	await expect(page).toHaveURL(/\/catalogo\/2\/$/);
	await expect(page.locator('.catalog-page__pagination [aria-current="page"]')).toHaveText('2');
	await page.getByRole('link', { name: 'Anterior', exact: true }).click();
	await expect(page).toHaveURL(/\/catalogo\/$/);
	const originalViewport = page.viewportSize();
	for (const width of [320, 768, 1440]) {
		await page.setViewportSize({ width, height: 900 });
		expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
	}
	if (originalViewport) await page.setViewportSize(originalViewport);
});

test('movie and person snippets describe existing page content', async ({ page }) => {
	await page.goto('/peliculas/el-turno-del-papa-2026/');
	await expect(page).toHaveTitle('El turno del papá (2026): reseña y reparto | Cine Posta');
	const description = await page.locator('meta[name="description"]').getAttribute('content');
	expect(description).toContain('Carol Durão');
	expect(description).toContain('Rafael Infante, Dani Calabresa');
	const data = await page.locator('script[type="application/ld+json"]').allTextContents();
	expect(data.map((entry) => JSON.parse(entry)).find((entry) => entry['@type'] === 'WebPage').description).toBe(description);
	await page.goto('/personas/paul-dano/');
	await expect(page).toHaveTitle('Paul Dano: biografía, películas y premios | Cine Posta');
	const personDescription = await page.locator('meta[name="description"]').getAttribute('content');
	expect(personDescription).toBeTruthy();
	expect(personDescription).not.toContain('datos verificables');
	await page.goto('/');
	await expect(page.getByRole('link', { name: 'Ver el catálogo completo de películas' })).toHaveAttribute('href', '/catalogo/');
});
