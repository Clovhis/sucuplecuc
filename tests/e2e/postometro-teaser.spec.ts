import { expect, test } from '@playwright/test';

const characterSources = [
	/cineposta-personaje-3d\.webp$/,
	/cineposta-personaje-3d-cinefila\.webp$/,
	/cineposta-personaje-3d-cineasta\.webp$/,
	/cineposta-personaje-3d-remotera\.webp$/,
	/cineposta-personaje-3d-cineclub\.webp$/,
	/cineposta-personaje-3d-inclusiva\.webp$/,
];

test('Qué vemos hoy muestra la serie de personajes con el vaivén original', async ({ page }) => {
	await page.goto('/', { waitUntil: 'domcontentloaded' });

	const teaser = page.locator('#que-vemos-hoy');
	const character = teaser.locator('[data-postometro-character]');

	await character.evaluate((image) => image.scrollIntoView({ block: 'center', behavior: 'auto' }));
	await expect(character).toHaveAttribute('alt', '');
	await expect(character).toHaveAttribute('data-postometro-character-index', /\d/);
	await expect(character).toHaveJSProperty('complete', true);

	const details = await character.evaluate((image) => {
		const styles = getComputedStyle(image);
		return {
			animationName: styles.animationName,
			naturalWidth: (image as HTMLImageElement).naturalWidth,
			naturalHeight: (image as HTMLImageElement).naturalHeight,
		};
	});

	expect(details.animationName).toBe('postometro-teaser-sway');
	expect(details.naturalWidth).toBeGreaterThan(0);
	expect(details.naturalHeight).toBeGreaterThan(0);

	const source = await character.getAttribute('src');
	expect(characterSources.some((pattern) => pattern.test(source ?? ''))).toBeTruthy();
});

test('Qué vemos hoy cambia de personaje al volver a entrar', async ({ page }) => {
	await page.goto('/', { waitUntil: 'domcontentloaded' });
	const character = page.locator('#que-vemos-hoy [data-postometro-character]');
	await expect(character).toHaveAttribute('data-postometro-character-index', /\d/);
	const firstSource = await character.getAttribute('src');

	await page.reload({ waitUntil: 'domcontentloaded' });
	await expect(character).toHaveAttribute('data-postometro-character-index', /\d/);
	const secondSource = await character.getAttribute('src');

	expect(firstSource).not.toBe(secondSource);
});

test('Qué vemos hoy respeta la reducción de movimiento', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/', { waitUntil: 'domcontentloaded' });

	const character = page.locator('#que-vemos-hoy [data-postometro-character]');
	await expect(character).toHaveCSS('animation-name', 'none');
});
