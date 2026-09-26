import { expect, test } from '@playwright/test';

test('Qué vemos hoy presenta un selector editorial y su ilustración grupal exclusiva', async ({ page }) => {
	await page.goto('/', { waitUntil: 'load' });

	const teaser = page.locator('#que-vemos-hoy');
	const art = teaser.locator('.postometro-teaser__art');
	const illustration = teaser.locator('.postometro-teaser__art img');

	await expect(illustration).toHaveAttribute('alt', '');
	await expect(illustration).toHaveAttribute('src', /cineposta-que-vemos-hoy-grupo\.webp$/);
	await expect(teaser.getByText('Selector de la noche')).toBeVisible();
	await expect(teaser.getByRole('link', { name: 'Encontrá qué ver' })).toBeVisible();

	if (!(await art.isVisible())) {
		await expect(art).toBeHidden();
		return;
	}

	await illustration.evaluate((image) => image.scrollIntoView({ block: 'center', behavior: 'instant' }));
	await expect
		.poll(() => illustration.evaluate((image) => (image as HTMLImageElement).naturalWidth), { timeout: 15_000 })
		.toBeGreaterThan(0);

	const details = await illustration.evaluate((image) => ({
		animationName: getComputedStyle(image).animationName,
		naturalWidth: (image as HTMLImageElement).naturalWidth,
		naturalHeight: (image as HTMLImageElement).naturalHeight,
	}));

	expect(details.animationName).toBe('none');
	expect(details.naturalWidth).toBeGreaterThan(0);
	expect(details.naturalHeight).toBeGreaterThan(0);
});
