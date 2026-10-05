import { expect, test, type Locator } from '@playwright/test';

async function waitForScrollFrame(viewport: Locator) {
	// Native scroll events and snapping update the controls on the next frame.
	await viewport.evaluate(() => new Promise<void>((resolve) => {
		requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
	}));
}

const rails = [
	{ id: 'cinema-release-carousel', viewport: '[data-cinema-release-viewport]', previous: '[data-cinema-release-previous]', next: '[data-cinema-release-next]' },
	{ id: 'streaming-release-carousel', viewport: '[data-cinema-release-viewport]', previous: '[data-cinema-release-previous]', next: '[data-cinema-release-next]' },
	{ id: 'weekly-recommendations', viewport: '[data-weekly-recommendations-viewport]', previous: '[data-weekly-recommendations-previous]', next: '[data-weekly-recommendations-next]' },
];

for (const rail of rails) {
	test(`${rail.id}: all films remain reachable and controls track both ends`, async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.goto('/', { waitUntil: 'domcontentloaded' });
		const section = page.locator(`#${rail.id}`);
		const viewport = section.locator(rail.viewport);
		const previous = section.locator(rail.previous);
		const next = section.locator(rail.next);
		await section.scrollIntoViewIfNeeded();
		await expect(previous).toBeDisabled();
		await expect(next).toBeEnabled();
		await next.click();
		await expect.poll(() => viewport.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
		await expect(previous).toBeEnabled();
		const count = await section.locator('ol > li').count();
		const firstCard = section.locator('ol > li').first();
		const lastCard = section.locator('ol > li').last();
		for (let step = 0; step < count && await next.isEnabled(); step++) {
			const before = await viewport.evaluate((element) => element.scrollLeft);
			await next.click();
			await expect.poll(() => viewport.evaluate((element) => element.scrollLeft)).toBeGreaterThan(before);
			await waitForScrollFrame(viewport);
		}
		await expect(next).toBeDisabled();
		await lastCard.scrollIntoViewIfNeeded();
		await expect(lastCard).toBeInViewport();
		for (let step = 0; step < count && await previous.isEnabled(); step++) {
			const before = await viewport.evaluate((element) => element.scrollLeft);
			await previous.click();
			await expect.poll(() => viewport.evaluate((element) => element.scrollLeft)).toBeLessThan(before);
			await waitForScrollFrame(viewport);
		}
		await expect(previous).toBeDisabled();
		await firstCard.scrollIntoViewIfNeeded();
		await expect(firstCard).toBeInViewport();
		await expect(next).toBeEnabled();
	});
}

test('trailer closes with Escape, clears the player, and restores keyboard focus', async ({ page }) => {
	await page.goto('/', { waitUntil: 'domcontentloaded' });
	const section = page.locator('#cinema-release-carousel');
	const trigger = section.locator('[data-cinema-release-open]').first();
	await trigger.focus();
	await page.keyboard.press('Enter');
	const dialog = section.getByRole('dialog');
	await expect(dialog).toBeVisible();
	await expect(dialog.locator('iframe')).toHaveCount(1);
	await page.keyboard.press('Escape');
	await expect(dialog).not.toBeVisible();
	await expect(section.locator('iframe')).toHaveCount(0);
	await expect(trigger).toBeFocused();
});

test('release titles offer a direct route to the film alongside their trailers', async ({ page }) => {
	await page.goto('/', { waitUntil: 'domcontentloaded' });
	const titleLink = page.locator('#streaming-release-carousel .cinema-release-carousel__title a').first();
	const target = await titleLink.getAttribute('href');
	await titleLink.click();
	await expect(page).toHaveURL(new RegExp(`${target}$`));
});

test('regular scrolling and keyboard focus reveal films beyond the visible strip', async ({ page }) => {
	await page.goto('/', { waitUntil: 'domcontentloaded' });
	for (const rail of rails) {
		const section = page.locator(`#${rail.id}`);
		const viewport = section.locator(rail.viewport);
		await section.locator(rail.next).click();
		await expect.poll(() => viewport.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
		const lastLink = section.locator('ol > li').last().locator('a').last();
		await lastLink.focus();
		await expect(lastLink).toBeFocused();
		await expect(lastLink).toBeInViewport();
	}
});

test('all rails fit narrow screens and update their controls after resizing', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.setViewportSize({ width: 320, height: 844 });
	await page.goto('/', { waitUntil: 'domcontentloaded' });
	for (const rail of rails) {
		const section = page.locator(`#${rail.id}`);
		const bounds = await section.evaluate((element) => ({ left: element.getBoundingClientRect().left, right: element.getBoundingClientRect().right }));
		expect(bounds.left).toBeGreaterThanOrEqual(0);
		expect(bounds.right).toBeLessThanOrEqual(320);
		await expect(section.locator(rail.previous)).toBeDisabled();
		await expect(section.locator(rail.next)).toBeEnabled();
	}
	const viewport = page.locator('#weekly-recommendations [data-weekly-recommendations-viewport]');
	await viewport.evaluate((element) => { element.scrollLeft = element.scrollWidth; });
	await expect(page.locator('[data-weekly-recommendations-next]')).toBeDisabled();
	await page.setViewportSize({ width: 1440, height: 1000 });
	await expect.poll(() => viewport.evaluate((element) => element.scrollWidth - element.clientWidth - element.scrollLeft)).toBeLessThanOrEqual(4);
	await expect(page.locator('[data-weekly-recommendations-next]')).toBeDisabled();
});

test('offscreen platform labels never expand the page at desktop and tablet widths', async ({ page }) => {
	for (const width of [1440, 1280, 1024, 768]) {
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/', { waitUntil: 'domcontentloaded' });
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
	}
});
