import { expect, test } from '@playwright/test';

test.describe('simulador de carrera cinematográfica', () => {
	test('aparece como acceso destacado debajo de Qué somos en el home', async ({ page }) => {
		const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
		expect(response?.ok()).toBeTruthy();

		const promo = page.locator('[data-home-actor-game]');
		await expect(promo).toBeVisible();
		await expect(promo.getByRole('heading', { name: /Construí tu carrera en el cine/i })).toBeVisible();
		await expect(promo.getByRole('link', { name: /Construí tu carrera en el cine.*Jugar al simulador/i })).toHaveAttribute(
			'href',
			'/juegos/simulador-carrera-actor/',
		);
		await expect(promo.locator('img')).toHaveAttribute('src', /cineposta-simulador-carrera-actor\.png/);

		if ((page.viewportSize()?.width ?? 0) > 720) {
			const promoHeights = await page
				.locator('.home-welcome, [data-home-actor-game], .home-community-promo')
				.evaluateAll((cards) => cards.map((card) => Math.round(card.getBoundingClientRect().height)));
			const heightRange = Math.max(...promoHeights) - Math.min(...promoHeights);

			expect(heightRange).toBeLessThanOrEqual(8);
		}
	});

	test('completa una carrera de directora con elecciones, suerte y resumen', async ({ page }) => {
		test.setTimeout(60_000);
		const pageErrors: string[] = [];
		page.on('pageerror', (error) => pageErrors.push(error.message));

		const response = await page.goto('/juegos/simulador-carrera-actor/', { waitUntil: 'domcontentloaded' });
		expect(response?.ok()).toBeTruthy();
		await expect(page.getByRole('heading', { name: /Construí tu carrera actoral/i })).toBeVisible();
		await expect(page.locator('.actor-landing__art img')).toHaveAttribute('src', /actor-career-landing\.png/);

		await page.getByRole('button', { name: /Empezar carrera/i }).click();
		await page.getByLabel(/Nombre que aparece en los créditos/i).fill('Lola Montaje');
		await page.getByLabel(/Año de nacimiento/i).fill('1990');
		await page.locator('label.actor-profile-option').filter({ hasText: 'Dirección' }).click();
		await page.locator('label.actor-profile-option').filter({ hasText: 'Drama' }).click();
		await page.locator('label.actor-profile-option').filter({ hasText: 'Femenino' }).click();
		await page.getByRole('button', { name: /Confirmar identidad/i }).click();

		await expect(page.locator('[data-player-name]')).toContainText('Lola Montaje');
		await expect(page.locator('[data-player-profile]')).toContainText('Directora');
		await expect(page.locator('[data-choice-index]')).toHaveCount(2);
		await expect(page.locator('.actor-choice-card__art')).toHaveCount(2);
		await expect(page.locator('.actor-choice-card__poster')).toHaveCount(2);
		await expect(page.locator('.actor-choice-card__outcome--negative')).toHaveCount(2);
		await expect(page.locator('[data-career-log-empty]')).toBeVisible();
		await expect(page.locator('[data-career-log-count]')).toHaveText('0 decisiones');
		await expect(page.locator('.actor-timeline [data-career-log]')).toBeVisible();

		const seenMovieSlugs = new Set<string>();
		let sawMixedTurn = false;
		for (let turn = 0; turn < 14; turn += 1) {
			const choices = page.locator('[data-choice-index]:not([disabled])');
			if ((await choices.count()) === 0) break;
			const careerYear = (await page.locator('[data-player-year]').textContent())?.trim();
			await expect(choices).toHaveCount(2);
			const eventOffers = page.locator('[data-choice-index][data-offer-kind="event"]');
			const movieOffers = page.locator('[data-choice-index][data-offer-kind="movie"]');
			if ((await eventOffers.count()) === 1 && (await movieOffers.count()) === 1) sawMixedTurn = true;
			for (let choiceIndex = 0; choiceIndex < 2; choiceIndex += 1) {
				const choice = choices.nth(choiceIndex);
				await expect(choice).toHaveAttribute('data-offer-year', careerYear ?? '');
				if ((await choice.getAttribute('data-offer-kind')) === 'movie') {
					const slug = await choice.getAttribute('data-offer-slug');
					expect(slug).toBeTruthy();
					expect(seenMovieSlugs.has(slug ?? '')).toBeFalsy();
					seenMovieSlugs.add(slug ?? '');
				}
			}

			await choices.nth(turn % 2).click();
			await expect(page.locator('[data-event-result]')).toContainText(/suerte está rodando/i);
			await expect(page.locator('[data-event-result]')).not.toContainText(/suerte está rodando/i, { timeout: 3_000 });
			await page.waitForTimeout(1_400);
			await expect(page.locator('[data-career-log-entry]')).toHaveCount(turn + 1);
			await expect(page.locator('[data-career-log-count]')).toHaveText(turn === 0 ? '1 decisión' : `${turn + 1} decisiones`);
		}

		expect(sawMixedTurn).toBeTruthy();
		await expect(page.getByRole('button', { name: /Ver resumen/i })).toBeVisible({ timeout: 6_000 });
		await page.getByRole('button', { name: /Ver resumen/i }).click();
		await expect(page.getByRole('heading', { name: 'Lola Montaje' })).toBeVisible();
		await expect(page.locator('.actor-summary__chapter-poster').first()).toBeVisible();
		const summaryArt = page.locator('.actor-summary__art');
		await expect(summaryArt).toHaveAttribute('data-summary-tier', /^(superstar|mediocre|ruin)$/);
		await expect(summaryArt).toContainText(/FAMA TOTAL|CARRERA MODESTA|EN LA RUINA/);
		const artMetrics = await summaryArt.locator('img').evaluate((imageElement) => {
			const image = imageElement as HTMLImageElement;
			const bounds = image.getBoundingClientRect();
			return {
				naturalRatio: image.naturalWidth / image.naturalHeight,
				renderedRatio: bounds.width / bounds.height,
			};
		});
		expect(Math.abs(artMetrics.naturalRatio - artMetrics.renderedRatio)).toBeLessThan(0.02);
		await expect(page.getByRole('button', { name: /Volver a jugar/i })).toBeVisible();
		expect(pageErrors).toEqual([]);
	});

	test('el modo normal tiene pico acotado y descenso antes del retiro', async ({ page }, testInfo) => {
		test.skip(testInfo.project.name !== 'desktop-chromium', 'La simulación larga de balance se ejecuta en Chromium de escritorio.');
		test.setTimeout(75_000);
		await page.goto('/juegos/simulador-carrera-actor/', { waitUntil: 'domcontentloaded' });
		await page.getByRole('button', { name: /Empezar carrera/i }).click();
		await page.getByLabel(/Nombre que aparece en los créditos/i).fill('Juan Balance');
		await page.getByLabel(/Año de nacimiento/i).fill(String(new Date().getUTCFullYear() - 60));
		await page.getByRole('button', { name: /Confirmar identidad/i }).click();

		const levels: number[] = [];
		for (let turn = 0; turn < 30; turn += 1) {
			const choices = page.locator('[data-choice-index]:not([disabled])');
			if ((await choices.count()) === 0) break;
			await expect(choices).toHaveCount(2);
			await choices.nth(turn % 2).click();
			await expect(page.locator('[data-event-result]')).not.toContainText(/suerte está rodando/i, { timeout: 3_000 });
			await page.waitForTimeout(1_400);
			levels.push(Number((await page.locator('[data-player-level]').textContent())?.trim()));
		}

		const peak = Math.max(...levels);
		const peakIndex = levels.indexOf(peak);
		expect(levels).toHaveLength(22);
		expect(peak).toBeLessThanOrEqual(87);
		expect(levels.at(-1)).toBeLessThanOrEqual(63);
		expect(levels.slice(peakIndex + 1).some((level) => level < peak)).toBeTruthy();
	});

	test('arranca la carrera actoral con créditos de reparto', async ({ page }) => {
		await page.goto('/juegos/simulador-carrera-actor/', { waitUntil: 'domcontentloaded' });
		await page.getByRole('button', { name: /Empezar carrera/i }).click();
		await expect(page.getByLabel(/Nombre que aparece en los créditos/i)).toHaveAttribute('placeholder', 'Ej. Juan');
		await page.getByLabel(/Nombre que aparece en los créditos/i).fill('Nico Escena');
		await page.getByLabel(/Año de nacimiento/i).fill('1990');
		await page.getByRole('button', { name: /Confirmar identidad/i }).click();

		await expect(page.locator('[data-offer-kind="movie"]')).toHaveCount(2);
		await expect(page.locator('.actor-choice-card').first()).toContainText(/extra|reparto|papel mínimo/i);
		await expect(page.locator('.actor-choice-card__outcome--negative')).toHaveCount(2);
		expect((await page.locator('.actor-choice-card').allTextContents()).join(' ')).not.toMatch(/Protagonizar/i);
	});

	test('se adapta al ancho móvil sin scroll horizontal en la identidad', async ({ page }) => {
		await page.goto('/juegos/simulador-carrera-actor/', { waitUntil: 'domcontentloaded' });
		await page.getByRole('button', { name: /Empezar carrera/i }).click();
		await expect(page.getByRole('heading', { name: /Definí tu identidad/i })).toBeVisible();

		const dimensions = await page.evaluate(() => ({
			viewport: window.innerWidth,
			document: document.documentElement.scrollWidth,
		}));
		expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport + 1);
	});
});
