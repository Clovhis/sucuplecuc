import { expect, test, type Locator } from '@playwright/test';

async function expectRetinaSafeImage(locator: Locator) {
	await locator.scrollIntoViewIfNeeded();
	await expect
		.poll(() => locator.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0))
		.toBe(true);
	const image = await locator.evaluate((element: HTMLImageElement) => ({
		complete: element.complete,
		currentSrc: element.currentSrc,
		naturalHeight: element.naturalHeight,
		naturalWidth: element.naturalWidth,
		renderedHeight: element.clientHeight,
		renderedWidth: element.clientWidth,
	}));
	expect(image.currentSrc).toContain('/people/');
	expect(image.naturalWidth).toBeGreaterThanOrEqual(Math.ceil(image.renderedWidth * 2));
	expect(image.naturalHeight).toBeGreaterThanOrEqual(Math.ceil(image.renderedHeight * 2));
}

test('the regular movie credit uses a loaded, Retina-safe local portrait', async ({ page }) => {
	await page.goto('/peliculas/12-years-a-slave-2013/', { waitUntil: 'load' });
	await expectRetinaSafeImage(page.getByAltText('Foto de Steve McQueen'));
});

test('the extended biography profile keeps its portrait sharp at its largest display size', async ({ page }) => {
	await page.goto('/personas/emily-blunt/', { waitUntil: 'load' });
	await expectRetinaSafeImage(page.locator('.person-page__portrait-shell img'));
});
