import { expect, test } from '@playwright/test';

test('Qué vemos hoy presenta un selector editorial y su ilustración grupal exclusiva', async ({ page }) => {
	await page.goto('/', { waitUntil: 'domcontentloaded' });

	const teaser = page.locator('#que-vemos-hoy');
	const illustration = teaser.locator('.postometro-teaser__art img');

	await illustration.evaluate((image) => image.scrollIntoView({ block: 'center', behavior: 'auto' }));
	await expect(illustration).toHaveAttribute('alt', '');
	await expect(illustration).toHaveAttribute('src', /cineposta-que-vemos-hoy-grupo\.webp$/);
	await expect(illustration).toHaveJSProperty('complete', true);
	await expect(teaser.getByText('Selector de la noche')).toBeVisible();
	await expect(teaser.getByRole('link', { name: 'Encontrá qué ver' })).toBeVisible();

	const details = await illustration.evaluate((image) => {
		const styles = getComputedStyle(image);
		return {
			animationName: styles.animationName,
			naturalWidth: (image as HTMLImageElement).naturalWidth,
			naturalHeight: (image as HTMLImageElement).naturalHeight,
		};
	});

	expect(details.animationName).toBe('none');
	expect(details.naturalWidth).toBeGreaterThan(0);
	expect(details.naturalHeight).toBeGreaterThan(0);
});
