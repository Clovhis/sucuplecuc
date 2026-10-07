import { expect, test } from '@playwright/test';

for (const person of [
	{ slug: 'diego-cremonesi', name: 'Diego Cremonesi', count: 1 },
	{ slug: 'adria-arjona', name: 'Adria Arjona', count: 2 },
	{ slug: 'brad-pitt', name: 'Brad Pitt' },
	{ slug: 'steven-spielberg', name: 'Steven Spielberg' },
]) {
	test(`${person.name}: bounded posters and readable profile at every width`, async ({ page }) => {
		for (const width of [320, 390, 600, 768, 1024, 1440]) {
			await page.setViewportSize({ width, height: 900 });
			const response = await page.goto(`/personas/${person.slug}/`);
			expect(response?.ok()).toBeTruthy();
			await expect(page.getByRole('heading', { level: 1 })).toHaveText(person.name);
			const cards = page.locator('.person-page__film-card');
			if (person.count) await expect(cards).toHaveCount(person.count);
			else expect(await cards.count()).toBeGreaterThan(4);
			const layout = await page.evaluate(() => {
				const rect = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
				const reading = rect('#biografia');
				const side = rect('.person-page__side');
				const films = rect('#filmografia');
				const title = rect('.person-page__title');
				const portrait = rect('.person-page__portrait-shell');
				return {
					overflow: document.documentElement.scrollWidth > innerWidth + 1,
					readingWidth: reading.width,
					portraitWidth: portrait.width,
					portraitBeforeTitle: portrait.right <= title.left,
					readingBeforeSide: side.top >= reading.bottom - 1,
					readingBesideSide: side.left >= reading.right,
					filmGap: films.top - reading.bottom,
					filmsBeforeSide: films.bottom <= side.top,
					posters: Array.from(document.querySelectorAll('.person-page__film-poster')).map(element => {
						const box = element.getBoundingClientRect();
						return { width: box.width, height: box.height };
					}),
					targetHeights: Array.from(document.querySelectorAll('.person-page__jump-links a, .person-page__source-list a, .page-actions a'))
						.map(element => element.getBoundingClientRect().height),
				};
			});
			expect(layout.overflow, `${width}px overflow`).toBe(false);
			expect(layout.portraitBeforeTitle).toBe(true);
			expect(layout.portraitWidth).toBeLessThanOrEqual(200);
			expect(layout.readingWidth).toBeLessThanOrEqual(812);
			expect(width <= 760 ? layout.readingBeforeSide : layout.readingBesideSide).toBe(true);
			expect(layout.filmGap).toBeGreaterThanOrEqual(0);
			expect(layout.filmGap).toBeLessThanOrEqual(48);
			if (width <= 760) expect(layout.filmsBeforeSide).toBe(true);
			expect(Math.min(...layout.targetHeights)).toBeGreaterThanOrEqual(44);
			for (const poster of layout.posters) {
				expect(poster.width).toBeLessThanOrEqual(181);
				expect(poster.width).toBeGreaterThanOrEqual(128);
				expect(poster.height / poster.width).toBeCloseTo(1.5, 1);
			}
			if (width === 1440) expect(layout.posters[0].width).toBe(180);
		}
	});
}

test('a single film keeps a complete poster and omits an empty awards section', async ({ page }) => {
	await page.goto('/personas/diego-cremonesi/');
	await expect(page.locator('#premios')).toHaveCount(0);
	await expect(page.getByRole('navigation', { name: 'Secciones de la biografía' }).getByRole('link', { name: 'Premios' })).toHaveCount(0);
	const image = page.locator('.person-page__film-poster img');
	await image.scrollIntoViewIfNeeded();
	await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
	await expect(image).toHaveCSS('object-fit', 'contain');
	await expect(page.locator('.person-page__film-tag')).toHaveText('Actor');
	const destination = await page.locator('.person-page__film-card').getAttribute('href');
	await page.locator('.person-page__film-card').click();
	await expect(page).toHaveURL(new RegExp(`${destination}$`));
});

test('section links and return to the filtered directory preserve navigation and SEO', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', error => errors.push(error.message));
	await page.goto('/personas/brad-pitt/?backTo=%2Fpersonas%2F%3Fq%3DBrad');
	await expect(page).toHaveURL(/\/personas\/brad-pitt\/$/);
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.cineposta.com.ar/personas/brad-pitt/');
	const nav = page.getByRole('navigation', { name: 'Secciones de la biografía' });
	for (const [name, id] of [['Biografía', 'biografia'], ['Premios', 'premios'], ['Filmografía', 'filmografia']]) {
		await nav.getByRole('link', { name: new RegExp(name) }).click();
		await expect(page).toHaveURL(new RegExp(`#${id}$`));
		await expect.poll(() => page.locator(`#${id}`).evaluate(element => element.getBoundingClientRect().top)).toBeGreaterThanOrEqual(0);
	}
	await page.locator('[data-history-back]').click();
	await expect(page).toHaveURL(/\/personas\/\?q=Brad$/);
	expect(errors).toEqual([]);
});
