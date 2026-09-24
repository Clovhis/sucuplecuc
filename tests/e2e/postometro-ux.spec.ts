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

	const primary = results.locator('[data-postometro-primary]');
	const slug = await primary.getAttribute('data-postometro-primary-slug');
	const catalogEntry = await page.locator('#postometro-data').evaluate((element, resultSlug) => {
		const payload = JSON.parse(element.textContent ?? '{}');
		return payload.catalog.find((entry: { slug: string }) => entry.slug === resultSlug);
	}, slug);
	const score = primary.locator('.postometro-pick__fact--score');
	const platforms = primary.locator('.postometro-pick__platform');

	await expect(primary.getByText('Disponibilidad en Argentina')).toBeVisible();
	await expect(platforms).toHaveCount(catalogEntry.platforms.length || 1);
	await expect(score).toContainText(catalogEntry.displayScore === null ? 'Sin puntaje' : `${catalogEntry.displayScore}/10`);
	await expect(score).toHaveAttribute('aria-label', /Puntaje Cine Posta:/);
	await expect(primary.locator('.postometro-badge-list li')).toHaveCount(2);
	const layout = await primary.evaluate((element) => {
		const facts = element.querySelector<HTMLElement>('.postometro-pick__at-a-glance');
		const review = element.querySelector<HTMLElement>('.postometro-pick__review');
		return {
			factsBeforeReview: Boolean(facts && review && facts.getBoundingClientRect().top < review.getBoundingClientRect().top),
			fitsViewport: document.documentElement.scrollWidth <= window.innerWidth,
		};
	});
	expect(layout.factsBeforeReview).toBeTruthy();
	expect(layout.fitsViewport).toBeTruthy();
});

test('Qué vemos hoy muestra la marca de una plataforma elegida', async ({ page }) => {
	await page.goto('/que-miro-hoy/', { waitUntil: 'domcontentloaded' });
	await page.getByLabel('¿Dónde la querés ver?').selectOption({ label: 'Netflix' });
	await page.getByRole('button', { name: 'Recomendame una película' }).click();
	await expect(page.locator('[data-postometro-results]')).toHaveAttribute('data-postometro-state', 'ready', { timeout: 6_000 });
	const platform = page.locator('[data-postometro-primary] .postometro-pick__platform');
	await expect(platform).toHaveAttribute('aria-label', 'Netflix');
	await expect(platform.locator('img')).toHaveAttribute('src', '/brand/platforms/netflix.svg');
	await expect(platform.locator('span')).toHaveText('Netflix');
});

test('El logo de Apple TV+ cabe sin superponerse al nombre', async ({ page }) => {
	await page.goto('/que-miro-hoy/', { waitUntil: 'domcontentloaded' });
	await page.getByLabel('¿Dónde la querés ver?').selectOption({ label: 'Apple TV+' });
	await page.getByRole('button', { name: 'Recomendame una película' }).click();
	await expect(page.locator('[data-postometro-results]')).toHaveAttribute('data-postometro-state', 'ready', { timeout: 6_000 });
	const platform = page.locator('[data-postometro-primary] .postometro-pick__platform[aria-label="Apple TV+"]');
	await expect(platform.locator('img')).toHaveAttribute('src', '/brand/platforms/apple-tv.svg');
	await expect(platform.locator('span')).toHaveText('Apple TV+');
	const layout = await platform.evaluate((element) => {
		const logo = element.querySelector('img');
		const label = element.querySelector('span');
		const container = element.getBoundingClientRect();
		const logoBox = logo?.getBoundingClientRect();
		const labelBox = label?.getBoundingClientRect();
		return {
			loaded: Boolean(logo?.complete && logo.naturalWidth > 0),
			separateRows: Boolean(logoBox && labelBox && logoBox.bottom <= labelBox.top),
			fits: Boolean(logoBox && labelBox && logoBox.right <= container.right + 1 && labelBox.right <= container.right + 1),
		};
	});
	expect(layout).toEqual({ loaded: true, separateRows: true, fits: true });
});
