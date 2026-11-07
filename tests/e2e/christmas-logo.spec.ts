import { expect, test } from '@playwright/test';

const garlandSelector = '[data-christmas-garland]';

test.use({ timezoneId: 'Asia/Tokyo' });

for (const [instant, active] of [
	['2026-12-01T02:59:59Z', false],
	['2026-12-01T03:00:00Z', true],
	['2026-12-25T15:00:00Z', true],
	['2027-01-07T02:59:59Z', true],
	['2027-01-07T03:00:00Z', false],
	['2027-07-01T15:00:00Z', false],
] as const) {
	test(`Argentine season at ${instant}: ${active}`, async ({ page }) => {
		await page.clock.setFixedTime(new Date(instant));
		await page.goto('/', { waitUntil: 'domcontentloaded' });
		const garland = page.locator(garlandSelector);
		if (active) await expect(garland).toBeVisible();
		else await expect(garland).toBeHidden();
	});
}

test('production ignores the DEV preview parameter outside the season', async ({ page }) => {
	test.skip(process.env.PLAYWRIGHT_DEV === '1', 'Production-only calendar enforcement');
	await page.clock.setFixedTime(new Date('2027-07-01T15:00:00Z'));
	await page.addInitScript(() => sessionStorage.setItem('cineposta:christmas-logo-preview', '1'));
	await page.goto('/?christmas=1', { waitUntil: 'domcontentloaded' });
	await expect(page.locator('[data-movie-search-input]')).toBeEnabled();
	await expect(page.locator(garlandSelector)).toBeHidden();
});

test('DEV preview survives visiting notes and returning with the home button', async ({ page, browserName, baseURL }) => {
	test.skip(process.env.PLAYWRIGHT_DEV !== '1', 'DEV-only seasonal preview');
	if (browserName === 'webkit') {
		// Match preview-e2e.mjs: local HTTP must not be upgraded to HTTPS by WebKit.
		await page.route('**/*', async (route) => {
			const request = route.request();
			if (request.resourceType() !== 'document' || new URL(request.url()).origin !== new URL(baseURL!).origin) return route.continue();
			const response = await route.fetch();
			await route.fulfill({ response, body: (await response.text()).replace('; upgrade-insecure-requests', '') });
		});
	}
	await page.clock.setFixedTime(new Date('2027-07-01T15:00:00Z'));
	await page.goto('/?christmas=1', { waitUntil: 'domcontentloaded' });
	await expect(page.locator(garlandSelector)).toBeVisible();
	await page.getByRole('link', { name: 'Noticias y notas', exact: true }).click();
	await expect(page).toHaveURL(/\/editorial\/$/);
	await page.getByRole('link', { name: 'Volver al inicio de Cine Posta', exact: true }).click();
	await expect(page).toHaveURL(/\/$/);
	await expect(page.locator(garlandSelector)).toBeVisible();
	await page.reload({ waitUntil: 'domcontentloaded' });
	await expect(page.locator(garlandSelector)).toBeVisible();
	await page.goto('/?christmas=0', { waitUntil: 'domcontentloaded' });
	await expect(page.locator('[data-movie-search-input]')).toBeEnabled();
	await expect(page.locator(garlandSelector)).toBeHidden();
	await page.goto('/', { waitUntil: 'domcontentloaded' });
	await expect(page.locator('[data-movie-search-input]')).toBeEnabled();
	await expect(page.locator(garlandSelector)).toBeHidden();
});

test('open tabs follow both seasonal boundaries without a new build', async ({ page }) => {
	await page.clock.install({ time: new Date('2026-12-01T02:59:30Z') });
	await page.goto('/', { waitUntil: 'domcontentloaded' });
	const garland = page.locator(garlandSelector);
	await expect(garland).toBeHidden();
	await page.clock.fastForward(60_000);
	await expect(garland).toBeVisible();
	await page.clock.setFixedTime(new Date('2027-01-07T03:00:00Z'));
	await page.clock.fastForward(60_000);
	await expect(garland).toBeHidden();
});

test('mobile garland preserves artwork, layout, text, and navigation', async ({ page }, testInfo) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.clock.setFixedTime(new Date('2026-12-25T15:00:00Z'));
	await page.goto('/', { waitUntil: 'domcontentloaded' });
	await expect(page.locator(garlandSelector)).toBeVisible();
	await expect(page.locator('[data-movie-search-input]')).toBeEnabled();
	await page.evaluate(() => document.fonts.ready);
	await page.emulateMedia({ reducedMotion: 'reduce' });
	const brand = page.getByRole('link', { name: 'Cine Posta: reiniciar filtros y volver al inicio', exact: true });
	await expect(brand.locator('img')).toHaveAttribute('src', '/brand/cineposta-logo-full.png');
	await expect(brand.locator('img')).toHaveAttribute('width', '520');
	await expect(brand.locator('img')).toHaveAttribute('height', '168');
	const measure = () => page.evaluate(() => {
		const selectors = ['.site-header__brand', '.site-header__brand img', '.movie-search--top', '.site-header__actions'];
		return selectors.map((selector) => document.querySelector(selector)!.getBoundingClientRect().toJSON());
	});
	for (const width of [320, 390, 768]) {
		await page.setViewportSize({ width, height: 844 });
		const active = await measure();
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
		// Map the original lettering area to screen coordinates and reject decoration overlaps.
		expect(await brand.evaluate((link) => {
			const img = link.querySelector('img')!.getBoundingClientRect();
			const text = { left: img.x + img.width * 300 / 520, right: img.x + img.width * 492 / 520, top: img.y + img.height * 31 / 168, bottom: img.y + img.height * 135 / 168 };
			return [...link.querySelectorAll('svg path, svg rect, svg ellipse')].every((element) => {
				const rect = element.getBoundingClientRect();
				return rect.right <= text.left || rect.left >= text.right || rect.bottom <= text.top || rect.top >= text.bottom;
			});
		})).toBeTruthy();
		await page.screenshot({ path: testInfo.outputPath(`christmas-${width}.png`), scale: 'css' });
		await page.clock.setFixedTime(new Date('2027-02-01T15:00:00Z'));
		await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
		await expect(page.locator(garlandSelector)).toBeHidden();
		expect(await measure()).toEqual(active);
		await page.clock.setFixedTime(new Date('2026-12-25T15:00:00Z'));
		await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
	}
	await page.locator('[data-movie-search-input]').fill('Alien');
	await brand.click();
	await expect(page.locator('[data-movie-search-input]')).toHaveValue('');
	await brand.focus();
	await expect(brand).toBeFocused();
	expect(errors).toEqual([]);
	await page.goto('/como-funciona/', { waitUntil: 'domcontentloaded' });
	await expect(page.locator(garlandSelector)).toHaveCount(0);
	await page.getByRole('link', { name: 'Volver al inicio de Cine Posta', exact: true }).click();
	await expect(page.locator(garlandSelector)).toBeVisible();
});

test('lights run independently and reduced motion keeps them steady', async ({ page }) => {
	await page.clock.setFixedTime(new Date('2026-12-25T15:00:00Z'));
	await page.goto('/', { waitUntil: 'domcontentloaded' });
	const garland = page.locator(garlandSelector);
	await expect(garland).toBeVisible();
	await expect(garland).toHaveAttribute('aria-hidden', 'true');
	await expect(garland).toHaveAttribute('focusable', 'false');
	await expect(garland).toHaveCSS('pointer-events', 'none');
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	const lights = garland.locator('.christmas-logo-garland__light');
	const animations = await lights.evaluateAll((elements) => elements.map((element) => {
		const style = getComputedStyle(element);
		return { duration: style.animationDuration, delay: style.animationDelay, color: style.color, name: style.animationName };
	}));
	expect(animations).toHaveLength(15);
	expect(new Set(animations.map((animation) => animation.delay)).size).toBe(15);
	expect(new Set(animations.map((animation) => animation.duration)).size).toBeGreaterThan(4);
	expect(new Set(animations.map((animation) => animation.color)).size).toBe(4);
	expect(animations.every((animation) => animation.name !== 'none')).toBeTruthy();
	const brightness = () => lights.evaluateAll((elements) => elements.map((element) => getComputedStyle(element).opacity));
	const before = await brightness();
	await expect.poll(brightness).not.toEqual(before);
	await page.emulateMedia({ reducedMotion: 'reduce' });
	for (const light of await lights.all()) {
		await expect(light).toHaveCSS('animation-name', 'none');
		await expect(light).toHaveCSS('opacity', '0.9');
	}
});
