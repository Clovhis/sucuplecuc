import { expect, test } from '@playwright/test';

test('las escenas del videoclub conservan su composición y no se superponen al texto', async ({ page }) => {
	await page.goto('/que-miro-hoy/', { waitUntil: 'domcontentloaded' });
	for (const width of [320, 390, 600, 768, 900, 1024, 1280, 1440]) {
		await page.setViewportSize({ width, height: 1000 });
		await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
		for (const selector of ['.postometro-hero', '.postometro-empty--idle']) {
			const scene = page.locator(selector);
			await expect(scene.locator('img')).toBeVisible();
			await expect.poll(() => scene.locator('img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
			const composition = await scene.evaluate((element) => {
				const img = element.querySelector('img')!;
				const image = img.getBoundingClientRect();
				const frame = element.querySelector('figure')!.getBoundingClientRect();
				const sceneBox = element.getBoundingClientRect();
				const copy = element.querySelector('[class$="__copy"]')!.getBoundingClientRect();
				return {
					loaded: img.complete && img.naturalWidth > 0,
					ratioError: Math.abs(image.width / image.height - img.naturalWidth / img.naturalHeight),
					contained: image.left >= sceneBox.left - 1 && image.right <= sceneBox.right + 1 && image.top >= sceneBox.top - 1 && image.bottom <= sceneBox.bottom + 1,
					inFrame: image.left >= frame.left - 1 && image.right <= frame.right + 1 && image.top >= frame.top - 1 && image.bottom <= frame.bottom + 1,
					separate: copy.right <= image.left + 1 || copy.bottom <= image.top + 1,
				};
			});
			expect(composition, `${selector} at ${width}px`).toMatchObject({ loaded: true, contained: true, inFrame: true, separate: true });
			expect(composition.ratioError, `${selector} at ${width}px`).toBeLessThan(.01);
		}
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow at ${width}px`).toBe(true);
	}
});

test('cambiar el plan y reiniciar restauran la escena ilustrada', async ({ page }) => {
	await page.goto('/que-miro-hoy/', { waitUntil: 'domcontentloaded' });
	await page.getByRole('button', { name: 'Recomendame una película' }).click();
	await expect(page.locator('[data-postometro-primary]')).toBeVisible({ timeout: 6000 });
	await page.getByLabel('¿Dónde la querés ver?').selectOption({ label: 'Netflix' });
	await expect(page.locator('.postometro-empty__art img')).toBeVisible();
	await page.getByRole('button', { name: 'Arrancar de nuevo' }).click();
	await expect(page.locator('.postometro-empty__art img')).toBeVisible();
	await expect(page.locator('.postometro-empty__art img')).toHaveAttribute('src', '/images/postometro/cineposta-personajes-recomendacion.webp');
	await expect(page.locator('[data-postometro-diagnosis]')).toBeEmpty();
	await expect(page.locator('[data-postometro-subheadline]')).toBeEmpty();
});

test('la película recomendada permanece visible con movimiento reducido', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/que-miro-hoy/', { waitUntil: 'domcontentloaded' });
	await page.getByRole('button', { name: 'Recomendame una película' }).click();
	await expect(page.locator('[data-postometro-primary]')).toBeVisible({ timeout: 6000 });
	for (const element of await page.locator('.postometro-pick__body > *').all()) {
		await expect(element).toHaveCSS('opacity', '1');
	}
});

test('las opciones y la carga no usan emojis y el puntaje tiene una escala uniforme', async ({ page }) => {
	await page.goto('/que-miro-hoy/', { waitUntil: 'domcontentloaded' });
	for (const number of await page.locator('.postometro-hero__stats strong, .postometro-form__section-heading > span, .postometro-empty__number').all()) {
		await expect(number).toBeHidden();
	}
	await expect(page.locator('.postometro-label-icon, .postometro-choice-card__icon, .postometro-chip-option__icon')).toHaveCount(0);
	const form = await page.locator('[data-postometro-form]').innerText();
	expect(form).not.toMatch(/\p{Extended_Pictographic}/u);
	await page.getByRole('button', { name: 'Recomendame una película' }).click();
	await expect(page.locator('[data-postometro-loading]')).toBeVisible();
	expect(await page.locator('.postometro-loading__chips').innerText()).not.toMatch(/\p{Extended_Pictographic}/u);
	await expect(page.locator('[data-postometro-primary]')).toBeVisible({ timeout: 6000 });
	const type = await page.locator('.postometro-pick__fact--score').evaluate((element) => {
		const sizes = [...element.querySelectorAll('.postometro-pick__score-number, .postometro-pick__score-number span, .postometro-pick__score-verdict')]
			.map(node => getComputedStyle(node).fontSize);
		return [...new Set(sizes)];
	});
	expect(type).toHaveLength(1);
});
