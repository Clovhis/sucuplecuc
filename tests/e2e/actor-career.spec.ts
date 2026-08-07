import { expect, test } from '@playwright/test';

test.describe('simulador de carrera cinematográfica', () => {
	test.beforeEach(async ({ page }) => {
		// Keep E2E deterministic and avoid writing test runs into the public leaderboard.
		await page.route('**/rest/v1/rpc/list_actor_high_scores', (route) =>
			route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify([{ rank: 1, player_name: 'Ada Arcade', score: 54321, profession: 'actor', difficulty: 'normal', country_code: 'AR' }]),
			}),
		);
		await page.route('**/rest/v1/rpc/submit_actor_high_score', (route) =>
			route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify([{ score: 54321 }]),
			}),
		);
	});

	test('aparece después del catálogo principal en el home', async ({ page }) => {
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

		const readingOrder = await page.locator('main').evaluate((main) =>
			Array.from(main.querySelectorAll('[data-movie-search-grid], [data-home-actor-game], .home-community-promo')).map((element) =>
				element.matches('[data-movie-search-grid]') ? 'catalog' : element.matches('[data-home-actor-game]') ? 'game' : 'community',
			),
		);
		expect(readingOrder.indexOf('catalog')).toBeLessThan(readingOrder.indexOf('game'));
		expect(readingOrder.indexOf('game')).toBeLessThan(readingOrder.indexOf('community'));

		if ((page.viewportSize()?.width ?? 0) > 720) {
			const promoHeights = await page
				.locator('[data-home-actor-game], .home-community-promo')
				.evaluateAll((cards) => cards.map((card) => Math.round(card.getBoundingClientRect().height)));
			const heightRange = Math.max(...promoHeights) - Math.min(...promoHeights);

			expect(heightRange).toBeLessThanOrEqual(8);
		}
	});

	test('completa una carrera de directora con elecciones, suerte y resumen', async ({ page }) => {
		test.setTimeout(90_000);
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
		await expect(page.locator('[data-career-log-count]')).toHaveText('0 decisiones');
		const timelineDetails = page.locator('[data-timeline-details]');
		const shortViewport = await page.evaluate(() => window.innerHeight <= 768);
		if (!shortViewport) await expect(page.locator('[data-career-log-empty]')).toBeVisible();
		if ((page.viewportSize()?.width ?? 0) <= 1020 && !shortViewport) {
			await expect(timelineDetails).not.toHaveAttribute('open', '');
			await page.locator('[data-timeline-details] > summary').click();
		}
		if (!shortViewport) await expect(page.locator('.actor-timeline [data-career-log]')).toBeVisible();

		const selectedMovieSlugs = new Set<string>();
		let sawMixedTurn = false;
		for (let turn = 0; turn < 30; turn += 1) {
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
				}
			}

			const selectedChoice = choices.nth(turn % 2);
			if ((await selectedChoice.getAttribute('data-offer-kind')) === 'movie') {
				const selectedSlug = await selectedChoice.getAttribute('data-offer-slug');
				expect(selectedSlug).toBeTruthy();
				expect(selectedMovieSlugs.has(selectedSlug ?? '')).toBeFalsy();
				selectedMovieSlugs.add(selectedSlug ?? '');
			}
			await selectedChoice.click();
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
		await expect(page.locator('[data-summary-score]')).toHaveText('54.321');
		await expect(page.locator('.actor-summary [data-high-score-list]')).toContainText('Ada Arcade');
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

	test('muestra el top 10 Arcade en la pantalla de inicio', async ({ page }) => {
		const viewport = page.viewportSize();
		if (viewport) await page.setViewportSize({ width: viewport.width, height: Math.max(viewport.height, 844) });
		await page.goto('/juegos/simulador-carrera-actor/', { waitUntil: 'domcontentloaded' });

		const board = page.locator('[data-high-score-board]').first();
		await expect(board).toBeVisible();
		await expect(board.getByRole('heading', { name: 'Salón de la fama' })).toBeVisible();
		await board.locator('summary').click();
		await expect(board.locator('[data-high-score-list] [data-high-score-rank]')).toHaveCount(1);
		await expect(board.locator('[data-high-score-list]')).toContainText('Ada Arcade');
		await expect(board.locator('[data-high-score-list]')).toContainText('54.321');
		const dimensions = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
		expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport + 1);
	});

	test('mantiene la pantalla inicial contenida sin scroll vertical', async ({ page }) => {
		await page.goto('/juegos/simulador-carrera-actor/', { waitUntil: 'domcontentloaded' });
		await page.waitForFunction(() => {
			const game = document.querySelector('[data-actor-simulator]');
			const hasCareerStylesheet = Array.from(document.styleSheets).some((sheet) =>
				sheet.href?.includes('actor-career') || sheet.href?.includes('simulador-carrera-actor'),
			);
			return game?.getAttribute('data-active-view') === 'landing' && hasCareerStylesheet;
		});

		const dimensions = await page.evaluate(() => ({
			viewport: window.innerHeight,
			frame: document.querySelector('[data-actor-simulator]')?.getBoundingClientRect(),
			landing: document.querySelector('.actor-landing')?.getBoundingClientRect().bottom ?? 0,
		}));
		expect(dimensions.frame?.bottom ?? 0).toBeLessThanOrEqual(dimensions.viewport + 1);
		expect(dimensions.landing).toBeLessThanOrEqual(dimensions.viewport + 1);
	});

	test('mantiene el tablero jugable dentro del viewport', async ({ page }) => {
		await page.goto('/juegos/simulador-carrera-actor/', { waitUntil: 'domcontentloaded' });
		await page.getByRole('button', { name: /Empezar carrera/i }).click();
		await page.getByLabel(/Nombre que aparece en los créditos/i).fill('Tablero Compacto');
		await page.getByLabel(/Año de nacimiento/i).fill('1990');
		await page.getByRole('button', { name: /Confirmar identidad/i }).click();
		await expect(page.locator('[data-choice-index]')).toHaveCount(2);

		const dimensions = await page.evaluate(() => ({
			viewport: window.innerHeight,
			career: document.querySelector('.actor-career-layout')?.getBoundingClientRect(),
			frame: document.querySelector('[data-actor-simulator]')?.getBoundingClientRect(),
		}));
		expect(dimensions.career?.bottom ?? 0).toBeLessThanOrEqual(dimensions.viewport + 1);
		expect(dimensions.frame?.bottom ?? 0).toBeLessThanOrEqual(dimensions.viewport + 1);
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

	test('mantiene la duración de la carrera y limita el nacimiento a una edad adulta', async ({ page }) => {
		const currentYear = new Date().getUTCFullYear();
		const maxBirthYear = currentYear - 18;
		const birthYearInput = page.locator('#actor-birth-year');

		await page.goto('/juegos/simulador-carrera-actor/', { waitUntil: 'domcontentloaded' });
		await page.getByRole('button', { name: /Empezar carrera/i }).click();
		await expect(birthYearInput).toHaveAttribute('max', String(maxBirthYear));
		await birthYearInput.fill(String(maxBirthYear + 1));
		await page.getByRole('button', { name: /Confirmar identidad/i }).click();
		expect(await birthYearInput.evaluate((input) => !(input as HTMLInputElement).validity.valid)).toBeTruthy();
		await expect(page.getByRole('heading', { name: /Definí tu identidad/i })).toBeVisible();

		for (const birthYear of [1950, maxBirthYear]) {
			await page.goto('/juegos/simulador-carrera-actor/', { waitUntil: 'domcontentloaded' });
			await page.getByRole('button', { name: /Empezar carrera/i }).click();
			await expect(page.getByRole('heading', { name: /Definí tu identidad/i })).toBeVisible();
			const currentNameInput = page.locator('#actor-stage-name');
			await currentNameInput.fill(`Test ${birthYear}`);
			await expect(currentNameInput).toHaveValue(`Test ${birthYear}`);
			const currentBirthYearInput = page.locator('#actor-birth-year');
			await currentBirthYearInput.fill(String(birthYear));
			await expect(currentBirthYearInput).toHaveValue(String(birthYear));
			await page.getByRole('button', { name: /Confirmar identidad/i }).click();

			await expect(page.locator('[data-player-age]')).toHaveText('18');
			await expect(page.locator('[data-player-year]')).toHaveText(String(birthYear + 18));
			await expect(page.locator('.actor-timeline__row')).toHaveCount(22);
		}
	});

	test('mantiene películas recientes cuando la carrera supera el catálogo futuro', async ({ page }) => {
		await page.goto('/juegos/simulador-carrera-actor/', { waitUntil: 'domcontentloaded' });
		await page.getByRole('button', { name: /Empezar carrera/i }).click();
		await page.getByLabel(/Nombre que aparece en los créditos/i).fill('Nueva Generación');
		await page.getByLabel(/Año de nacimiento/i).fill('2007');
		await page.getByRole('button', { name: /Confirmar identidad/i }).click();

		let movieOfferCount = 0;
		const selectedMovieSlugs = new Set<string>();
		for (let turn = 0; turn < 8; turn += 1) {
			const choices = page.locator('[data-choice-index]:not([disabled])');
			await expect(choices).toHaveCount(2);
			const movieChoices = choices.filter({ has: page.locator('.actor-choice-card__poster:not(.actor-choice-card__poster--event)') });
			movieOfferCount += await movieChoices.count();
			const selectedChoice = (await movieChoices.count()) > 0 ? movieChoices.last() : choices.last();
			if (await selectedChoice.getAttribute('data-offer-kind') === 'movie') {
				const slug = await selectedChoice.getAttribute('data-offer-slug');
				expect(slug).toBeTruthy();
				expect(selectedMovieSlugs.has(slug ?? '')).toBeFalsy();
				selectedMovieSlugs.add(slug ?? '');
			}

			await selectedChoice.click();
			await expect(page.locator('[data-event-result]')).not.toContainText(/suerte está rodando/i, { timeout: 3_000 });
			await page.waitForTimeout(1_400);
		}

		expect(movieOfferCount).toBeGreaterThanOrEqual(4);
		expect(selectedMovieSlugs.size).toBeGreaterThanOrEqual(4);
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

	test('carga banderas locales visibles en desktop y móvil', async ({ page }) => {
		await page.goto('/juegos/simulador-carrera-actor/', { waitUntil: 'domcontentloaded' });
		await page.getByRole('button', { name: /Empezar carrera/i }).click();

		const flags = page.locator('.actor-country .actor-flag');
		await expect(flags).toHaveCount(8);
		await expect(flags.first()).toHaveAttribute('src', /images\/flags\/ar\.svg/);
		const loadedFlags = await flags.evaluateAll((images) => images.every((image) => (image as HTMLImageElement).naturalWidth > 0));
		expect(loadedFlags).toBeTruthy();

		await page.locator('[data-country="MX"]').click();
		await expect(page.locator('[data-preview-country] .actor-flag')).toHaveAttribute('src', /images\/flags\/mx\.svg/);
		await expect(page.locator('[data-preview-country] [data-country-code]')).toHaveText('MX');
	});

	test('mantiene el arte de las elecciones dentro de la tarjeta al tocar en móvil', async ({ page }, testInfo) => {
		test.skip(!testInfo.project.name.startsWith('mobile-'), 'La regresión sólo aplica al comportamiento táctil.');
		await page.goto('/juegos/simulador-carrera-actor/', { waitUntil: 'domcontentloaded' });
		await page.getByRole('button', { name: /Empezar carrera/i }).click();
		await page.getByLabel(/Nombre que aparece en los créditos/i).fill('Test táctil');
		await page.getByLabel(/Año de nacimiento/i).fill('1990');
		await page.getByRole('button', { name: /Confirmar identidad/i }).click();

		const choice = page.locator('[data-choice-index]').first();
		await expect(choice).toBeVisible();
		await choice.tap();
		await page.waitForTimeout(300);

		const dimensions = await choice.evaluate((card) => {
			const art = card.querySelector<HTMLElement>('.actor-choice-card__art');
			if (!art) throw new Error('No se encontró el arte de la elección.');
			return {
				cardWidth: card.getBoundingClientRect().width,
				artWidth: art.getBoundingClientRect().width,
				cardHeight: card.getBoundingClientRect().height,
				artHeight: art.getBoundingClientRect().height,
			};
		});

		expect(dimensions.artWidth).toBeLessThanOrEqual(dimensions.cardWidth + 1);
		expect(dimensions.artHeight).toBeLessThanOrEqual(dimensions.cardHeight + 1);
	});
});
