import { expect, test } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';

test.beforeEach(async ({ page }) => {
	await page.goto('/', { waitUntil: 'load' });
	const dismiss = page.getByRole('button', { name: /Ahora no, entrar al sitio/i });
	if (await dismiss.isVisible()) await dismiss.click();
	await expect(page.locator('catalog-marquee')).toHaveAttribute('data-ready', '');
	await page.mouse.move(0, 0);
});

test('muestra incorporaciones reales sobre el buscador con enlaces únicos accesibles', async ({ page }, testInfo) => {
	const marquee = page.getByRole('region', { name: 'Recién agregadas al catálogo' });
	const links = marquee.getByRole('link');
	await expect(links).toHaveCount(12);
	const hrefs = await links.evaluateAll((els) => els.map((el) => el.getAttribute('href')));
	expect(new Set(hrefs).size).toBe(12);
	const additions = readdirSync('src/data/movies').map((name) => JSON.parse(readFileSync(`src/data/movies/${name}`, 'utf8'))).filter((movie) => movie.catalogAddedAt);
	const visibleDates = hrefs.map((href) => additions.find((movie) => href === `/peliculas/${movie.slug}/`)?.catalogAddedAt);
	expect(visibleDates.every(Boolean)).toBeTruthy();
	expect(visibleDates).toEqual([...visibleDates].sort().reverse());
	for (const link of await links.all()) await expect(link.locator('.catalog-marquee__platform')).not.toHaveCount(0);
	await expect.poll(() => marquee.locator('.catalog-marquee__list:not([aria-hidden]) img').evaluateAll((images) => images.every((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBeTruthy();
	const copies = marquee.locator('[aria-hidden="true"] a');
	await expect(copies).toHaveCount(12);
	for (const copy of await copies.all()) await expect(copy).toHaveAttribute('tabindex', '-1');
	const bounds = await marquee.boundingBox();
	const search = await page.locator('[data-movie-search-input]').boundingBox();
	expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(search!.y);
	expect(bounds!.height).toBeLessThanOrEqual(38);
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
	await page.screenshot({ path: testInfo.outputPath('catalog-marquee.png'), scale: 'css' });
	await links.first().focus();
	await links.first().press('Enter');
	await expect(page).toHaveURL(hrefs[0]!);
});

test('se desplaza, permite pausar y reanudar y se detiene al pasar el mouse', async ({ page }, testInfo) => {
	const marquee = page.locator('catalog-marquee');
	const track = marquee.locator('.catalog-marquee__track');
	const position = () => track.evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41);
	const initial = await position();
	await expect.poll(position).toBeLessThan(initial - 10);
	// Freeze through the control and move away (touch devices can retain hover).
	await marquee.getByRole('button', { name: 'Pausar novedades' }).click();
	await page.mouse.move(0, 0);
	await expect(marquee.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
	await page.waitForTimeout(80);
	const paused = await position();
	await page.waitForTimeout(200);
	expect(await position()).toBeCloseTo(paused, 0);
	await marquee.getByRole('button', { name: 'Reanudar novedades' }).click();
	await page.mouse.move(0, 0);
	await expect.poll(position).toBeLessThan(paused - 10);
	if (!testInfo.project.name.startsWith('mobile-')) {
		await marquee.hover();
		await page.waitForTimeout(80);
		const hovered = await position();
		await page.waitForTimeout(200);
		expect(await position()).toBeCloseTo(hovered, 0);
	}
	// The two equal groups make the animation loop without an empty interval.
	const widths = await marquee.locator('ul').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().width));
	expect(widths[0]).toBeCloseTo(widths[1], 0);
});

test('el teclado revela cada título completo y la búsqueda conserva su funcionamiento', async ({ page, browserName }) => {
	const marquee = page.locator('catalog-marquee');
	const links = marquee.getByRole('link');
	await links.first().focus();
	for (let index = 0; index < await links.count(); index++) {
		if (index > 0) {
			if (browserName === 'webkit') await links.nth(index).focus();
			else await page.keyboard.press('Tab');
		}
		await expect(links.nth(index)).toBeFocused();
		await expect.poll(() => links.nth(index).evaluate((el) => {
			const bounds = el.getBoundingClientRect();
			const viewport = el.closest('.catalog-marquee__viewport')!.getBoundingClientRect();
			// Long titles retain their full text and can be scrolled horizontally.
			return bounds.left >= viewport.left - 1 && bounds.left < viewport.right &&
				(bounds.width > viewport.width || bounds.right <= viewport.right + 1);
		})).toBeTruthy();
	}
	await expect(marquee.locator('ul[aria-hidden]')).toBeHidden();
	const input = page.locator('[data-movie-search-input]');
	await expect(input).toBeEnabled();
	await input.fill('Batman');
	await expect(page.locator('[data-movie-search-grid] [data-movie-card]').first()).toHaveAttribute('data-movie-title', 'Batman');
});

test('movimiento reducido conserva la lista estática y permite recorrerla', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	const marquee = page.locator('catalog-marquee');
	await expect(marquee.getByRole('button')).toBeHidden();
	await expect(marquee.locator('ul[aria-hidden]')).toBeHidden();
	await expect(marquee.locator('.catalog-marquee__track')).toHaveCSS('animation-name', 'none');
	await marquee.getByRole('link').last().focus();
	await expect.poll(() => marquee.locator('.catalog-marquee__viewport').evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
	await expect(marquee.getByRole('link').last()).toBeInViewport();
});
