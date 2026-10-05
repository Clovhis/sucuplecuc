import { expect, test } from '@playwright/test';

// The existing feed intentionally renders no section when every upstream is
// unavailable. That valid build must also remain valid in GitHub Actions.
test.beforeEach(async ({ request }) => {
	const response = await request.get('/');
	expect(response.ok()).toBeTruthy();
	test.skip(!(await response.text()).includes('id="radar-de-cine"'), 'Este build no recibió noticias de los medios.');
});

test('el Radar conserva noticias, fechas y enlaces externos sin duplicar el acceso por teclado', async ({ page }, testInfo) => {
	await page.goto('/', { waitUntil: 'load' });
	const radar = page.getByRole('region', { name: 'Radar de cine' });
	await expect(radar.getByRole('heading', { level: 2 })).toHaveText('Radar de cine');
	const links = radar.locator('[data-news-segment] a');
	const count = await links.count();
	expect(count).toBeGreaterThan(0);
	expect(count).toBeLessThanOrEqual(8);
	await expect(radar.getByRole('link')).toHaveCount(count);
	const originals = [];
	for (const link of await links.all()) {
		const href = await link.getAttribute('href');
		expect(href).toMatch(/^https:\/\//);
		expect(new URL(href!).hostname).toMatch(/(^|\.)(lanacion\.com\.ar|clarin\.com|infobae\.com|pagina12\.com\.ar|ambito\.com|cinesargentinos\.com\.ar)$/);
		await expect(link).toHaveAttribute('target', '_blank');
		await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
		const title = await link.getByRole('heading', { level: 3 }).innerText();
		expect(title.length).toBeGreaterThan(0);
		const date = await link.locator('time').getAttribute('datetime');
		expect(Number.isFinite(Date.parse(date!))).toBeTruthy();
		originals.push(href);
	}
	const copies = radar.locator('ul[aria-hidden="true"] a');
	expect(await copies.evaluateAll(els => els.map(el => el.getAttribute('href')))).toEqual(originals);
	for (const copy of await copies.all()) await expect(copy).toHaveAttribute('tabindex', '-1');
	await radar.scrollIntoViewIfNeeded();
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
	await page.screenshot({ path: testInfo.outputPath('radar.png'), scale: 'css' });
});

test('el ticker mantiene desplazamiento y pausa con mouse y teclado en desktop', async ({ page }, testInfo) => {
	test.skip(testInfo.project.name.startsWith('mobile-'), 'El autoplay existente es exclusivo de desktop.');
	await page.goto('/', { waitUntil: 'load' });
	const radar = page.getByRole('region', { name: 'Radar de cine' });
	await radar.scrollIntoViewIfNeeded();
	await page.mouse.move(0, 0);
	const track = radar.locator('[data-news-track]');
	const position = () => track.evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41);
	const initial = await position();
	await expect.poll(position).toBeLessThan(initial - 10);
	await radar.locator('[data-news-marquee]').hover();
	// Give any in-flight animation frame time to settle before checking pause.
	await page.waitForTimeout(80);
	const hovered = await position();
	await page.waitForTimeout(250);
	expect(await position()).toBeCloseTo(hovered, 0);
	await page.mouse.move(0, 0);
	await radar.locator('[data-news-segment] a').first().focus();
	await page.waitForTimeout(80);
	const focused = await position();
	await page.waitForTimeout(250);
	expect(await position()).toBeCloseTo(focused, 0);
});

test('con movimiento reducido todas las noticias pueden recibir foco sin quedar recortadas', async ({ page, browserName }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/', { waitUntil: 'load' });
	const radar = page.getByRole('region', { name: 'Radar de cine' });
	const marquee = radar.locator('[data-news-marquee]');
	const links = radar.locator('[data-news-segment] a');
	await links.first().focus();
	const count = await links.count();
	// Mobile WebKit skips native links in hardware Tab traversal. Verify each
	// link's focus visibility directly there; exercise real Tab in Chromium.
	for (let index = 1; index < count; index++) {
		if (browserName === 'webkit') await links.nth(index).focus();
		else await page.keyboard.press('Tab');
	}
	await expect(links.last()).toBeFocused();
	// Focus can initiate an asynchronous scroll-snap transition on touch browsers.
	await expect.poll(() => marquee.evaluate(el => {
		const last = el.querySelector('[data-news-segment] li:last-child a')!.getBoundingClientRect();
		const viewport = el.getBoundingClientRect();
		return el.scrollLeft > 0 && last.left >= viewport.left - 1 && last.right <= viewport.right + 1;
	})).toBeTruthy();
	await expect(radar.locator('ul[aria-hidden="true"]')).toBeHidden();
	await expect(radar.locator('[data-news-track]')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
});

test('en mobile las noticias se recorren sin autoplay y con títulos completos', async ({ page }, testInfo) => {
	test.skip(!testInfo.project.name.startsWith('mobile-'), 'Recorrido del carril en teléfono.');
	await page.goto('/', { waitUntil: 'load' });
	const radar = page.getByRole('region', { name: 'Radar de cine' });
	const marquee = radar.locator('[data-news-marquee]');
	await radar.scrollIntoViewIfNeeded();
	await expect(radar.locator('ul[aria-hidden="true"]')).toBeHidden();
	await expect(radar.locator('[data-news-track]')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
	const last = radar.locator('[data-news-segment] a').last();
	await last.focus();
	await expect.poll(() => marquee.evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
	await expect(last).toBeInViewport();
	for (const heading of await radar.locator('[data-news-segment] h3').all()) {
		expect(await heading.evaluate(el => el.scrollHeight <= el.clientHeight + 1)).toBeTruthy();
	}
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
});
