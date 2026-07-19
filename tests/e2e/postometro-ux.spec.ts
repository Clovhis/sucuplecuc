import { expect, test } from '@playwright/test';

test('Qué vemos hoy presenta los filtros en un orden claro y sin desbordes', async ({ page }) => {
	await page.goto('/que-miro-hoy/', { waitUntil: 'domcontentloaded' });

	await expect(page.getByRole('heading', { level: 1, name: '¿Qué vemos hoy?' })).toBeVisible();
	await expect(page.locator('.postometro-hero__stats > span')).toHaveCount(3);
	await expect(page.locator('.postometro-hero__art img')).toHaveJSProperty('complete', true);
	await expect(page.getByRole('group', { name: /Qué buscás que te haga la peli/i })).toBeVisible();
	await expect(page.getByRole('group', { name: /Con quién la ves/i })).toBeVisible();
	await expect(page.getByLabel('¿De qué época?')).toBeVisible();
	await expect(page.getByLabel('¿Dónde la querés ver?')).toBeVisible();

	const layout = await page.evaluate(() => {
		const controls = [
			...document.querySelectorAll<HTMLElement>('.postometro-choice-card__body'),
			...document.querySelectorAll<HTMLElement>('.postometro-chip-option > span'),
			...document.querySelectorAll<HTMLElement>('.postometro-select-field select'),
			document.querySelector<HTMLElement>('[data-postometro-search]'),
		].filter((control): control is HTMLElement => control instanceof HTMLElement);

		const mood = document.querySelector<HTMLElement>('.postometro-choice-grid--mood');
		const refinements = document.querySelector<HTMLElement>('.postometro-form__refinements');

		return {
			contentFits: document.documentElement.scrollWidth <= window.innerWidth,
			minimumControlHeight: Math.min(...controls.map((control) => control.getBoundingClientRect().height)),
			maximumMoodCardHeight: Math.max(
				...Array.from(document.querySelectorAll<HTMLElement>('.postometro-choice-grid--mood .postometro-choice-card__body'))
					.map((control) => control.getBoundingClientRect().height),
			),
			refinementsFollowMood: Boolean(
				mood && refinements && refinements.getBoundingClientRect().top > mood.getBoundingClientRect().bottom,
			),
		};
	});

	expect(layout.contentFits).toBeTruthy();
	expect(layout.minimumControlHeight).toBeGreaterThanOrEqual(44);
	expect(layout.maximumMoodCardHeight).toBeLessThanOrEqual(96);
	expect(layout.refinementsFollowMood).toBeTruthy();
});

test('Qué vemos hoy mantiene el flujo de recomendación completo', async ({ page }) => {
	await page.goto('/que-miro-hoy/', { waitUntil: 'domcontentloaded' });

	const results = page.locator('[data-postometro-results]');
	await page.getByRole('button', { name: 'Recomendame una película' }).click();

	await expect(results).toHaveAttribute('aria-busy', 'true');
	await expect(results).toHaveAttribute('data-postometro-state', 'ready', { timeout: 6_000 });
	await expect(results.locator('[data-postometro-primary]')).toBeVisible();
	await expect(results.getByRole('link', { name: 'Ver ficha completa' })).toBeVisible();
});
