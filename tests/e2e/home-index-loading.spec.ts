import { expect, test } from '@playwright/test';

test('a delayed index keeps the initial movies usable and restores URL filters when ready', async ({ page }) => {
	let release: () => void = () => {};
	const gate = new Promise<void>((resolve) => { release = resolve; });
	await page.route('**/search-index.json?*', async (route) => { await gate; await route.continue(); });
	await page.goto('/?q=alien', { waitUntil: 'domcontentloaded' });
	await expect(page.locator('[data-movie-search-input]')).toBeDisabled();
	await expect(page.locator('[data-movie-search-grid] [data-movie-card]')).toHaveCount(12);
	await expect(page.locator('[data-movie-search-grid] .movie-card__link').first()).toHaveAttribute('href', /\/peliculas\//);
	await expect(page.getByRole('link', { name: 'Ver el catálogo completo de películas' })).toHaveAttribute('href', '/catalogo/');
	release();
	await expect(page.locator('[data-movie-search-root]')).toHaveAttribute('data-home-catalog-ready', 'true');
	await expect(page.locator('[data-movie-search-input]')).toBeEnabled();
	await expect(page.locator('[data-movie-search-input]')).toHaveValue('alien');
	await expect(page.locator('[data-movie-search-grid] [data-movie-card]')).not.toHaveCount(0);
});

test('a failed index offers a working retry without binding duplicate handlers', async ({ page }) => {
	let requests = 0;
	await page.route('**/search-index.json?*', async (route) => {
		requests++;
		if (requests === 1) return route.fulfill({ status: 503, contentType: 'application/json', body: '{}' });
		await route.continue();
	});
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto('/', { waitUntil: 'domcontentloaded' });
	await expect(page.getByRole('button', { name: 'Reintentar', exact: true })).toBeVisible();
	await expect(page.locator('[data-movie-search-input]')).toBeDisabled();
	await page.getByRole('button', { name: 'Reintentar', exact: true }).click();
	await expect(page.locator('[data-movie-search-root]')).toHaveAttribute('data-home-catalog-ready', 'true');
	await expect(page.getByRole('button', { name: 'Reintentar', exact: true })).toHaveCount(0);
	await page.locator('[data-movie-search-input]').fill('batman');
	await expect(page.locator('[data-movie-search-grid] [data-movie-card]').first()).toHaveAttribute('data-movie-title', 'Batman');
	expect(requests).toBe(2);
	expect(errors).toEqual([]);
});

test('the HTML stays small and the complete index matches the canonical movie catalog', async ({ request }) => {
	const response = await request.get('/');
	const html = await response.text();
	expect(Buffer.byteLength(html)).toBeLessThan(900000);
	const indexUrl = html.match(/data-home-movie-index-url="([^"]+)"/)?.[1];
	expect(indexUrl).toMatch(/^\/search-index\.json\?v=[a-f0-9]{16}$/);
	const index = await request.get(indexUrl!);
	expect(index.ok()).toBeTruthy();
	const records = await index.json() as Array<{ url: string; slug: string }>;
	const xml = await (await request.get('/sitemap.xml')).text();
	const movies = [...xml.matchAll(/<loc>https:\/\/www\.cineposta\.com\.ar(\/peliculas\/[^<]+)<\/loc>/g)].map((match) => match[1]);
	expect(records.map((record) => record.url).sort()).toEqual(movies.sort());
	expect(new Set(records.map((record) => record.slug)).size).toBe(records.length);
});
