import { expect, test } from '@playwright/test';

const aliases = [
	['seven-samurai-1954', 'los-siete-samurais-1954', 'Seven Samurai'],
	['paprika-detective-de-los-suenos-2006', 'paprika-2006', 'Paprika'],
] as const;

for (const [legacyPath, destination, title] of [
	['/trailers/the-fly-1986/', '/peliculas/la-mosca-1986/', 'La mosca'],
	['/peliculas/the-odyssey-2026/', '/peliculas/la-odisea-2026/', 'La Odisea'],
] as const) {
	test(`Search Console legacy URL ${legacyPath} resolves to its current movie`, async ({ page, request }) => {
		const response = await request.get(legacyPath);
		expect(response.status()).toBe(200);
		const html = await response.text();
		expect(html).toContain(`rel="canonical" href="https://www.cineposta.com.ar${destination}"`);
		expect(html).toContain(`http-equiv="refresh" content="0;url=${destination}"`);
		expect(html).toContain(`href="${destination}"`);

		const sitemap = await (await request.get('/sitemap.xml')).text();
		expect(sitemap).not.toContain(`<loc>https://www.cineposta.com.ar${legacyPath}</loc>`);
		expect(sitemap).toContain(`<loc>https://www.cineposta.com.ar${destination}</loc>`);

		await page.goto(legacyPath, { waitUntil: 'domcontentloaded' });
		await expect(page).toHaveURL(destination);
		await expect(page.getByRole('heading', { level: 1 })).toContainText(title);
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.cineposta.com.ar${destination}`);
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /index, follow/);
	});
}

test('retired movie and forum URLs point to the canonical record and stay out of the sitemap', async ({ request }) => {
	const sitemap = await (await request.get('/sitemap.xml')).text();
	for (const [oldSlug, canonical] of aliases) {
		for (const section of ['peliculas', 'comunidad/peliculas']) {
			const html = await (await request.get(`/${section}/${oldSlug}/`)).text();
			expect(html).toContain(`rel="canonical" href="https://www.cineposta.com.ar/${section}/${canonical}/"`);
			expect(html).toContain('http-equiv="refresh"');
			expect(sitemap).not.toContain(`/${section}/${oldSlug}/`);
			expect(sitemap).toContain(`/${section}/${canonical}/`);
		}
		const legacyTrailer = await (await request.get(`/trailers/${oldSlug}/`)).text();
		expect(legacyTrailer).toContain(`rel="canonical" href="https://www.cineposta.com.ar/peliculas/${canonical}/"`);
	}
});

test('alternate titles find one canonical movie, with its local poster and cult badge', async ({ page }) => {
	for (const [, canonical, query] of aliases) {
		await page.goto(`/?q=${encodeURIComponent(query)}`);
		await expect(page.locator('[data-movie-search-root]')).toHaveAttribute('data-home-catalog-ready', 'true');
		const cards = page.locator('[data-movie-search-grid] .movie-card');
		await expect(cards).toHaveCount(1);
		await cards.locator(`a[href="/peliculas/${canonical}/"]`).first().click();
		await expect(page).toHaveURL(new RegExp(`/peliculas/${canonical}/$`));
		const poster = page.locator('.movie-detail__poster img[data-cineposta-poster]');
		await poster.scrollIntoViewIfNeeded();
		await expect.poll(() => poster.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0 && img.naturalHeight > img.naturalWidth && img.currentSrc.includes('/assets/posters/'))).toBe(true);
		await expect(page.locator('.movie-detail__poster').getByAltText('De culto')).toBeVisible();
	}
});
