import { expect, test, type Page } from '@playwright/test';

async function dismissDonationPrompt(page: Page): Promise<void> {
	const prompt = page.getByRole('dialog', { name: /Ayudanos a mantener Cine Posta online/i });
	if (await prompt.isVisible().catch(() => false)) {
		await prompt.getByRole('button', { name: /Ahora no, entrar al sitio/i }).click();
	}
}

async function waitForSiteStyles(page: Page): Promise<void> {
	await page.waitForFunction(() =>
		Array.from(document.styleSheets).some((sheet) => {
			try {
				return sheet.cssRules.length > 0;
			} catch {
				return false;
			}
		}),
	);
}

test.describe('sticker De culto', () => {
	test('se ubica a la derecha, recto y 10% por encima de Absolute cinema', async ({ page }) => {
		await page.goto('/peliculas/pulp-fiction-1994/', { waitUntil: 'domcontentloaded' });
		await waitForSiteStyles(page);
		await dismissDonationPrompt(page);

		const host = page.locator('.movie-detail__poster, .movie-detail__gallery').first();
		const cultSticker = host.locator('.movie-detail__cult-movie-sticker');
		const absoluteSticker = host.locator('.movie-detail__absolute-cinema-sticker');

		await expect(cultSticker).toBeVisible();
		await expect(absoluteSticker).toBeVisible();
		await expect(cultSticker).toHaveAttribute('src', /\/DeCulto\.png$/);
		await expect(cultSticker).toHaveAttribute('alt', 'De culto');

		const layout = await host.evaluate((element) => {
			const cult = element.querySelector<HTMLElement>('.movie-detail__cult-movie-sticker');
			const absolute = element.querySelector<HTMLElement>('.movie-detail__absolute-cinema-sticker');
			if (!cult || !absolute) throw new Error('No se encontraron los dos stickers');

			const hostRect = element.getBoundingClientRect();
			const cultRect = cult.getBoundingClientRect();
			const absoluteRect = absolute.getBoundingClientRect();
			const cultStyle = getComputedStyle(cult);
			const absoluteStyle = getComputedStyle(absolute);
			const cultBottom = Number.parseFloat(cultStyle.bottom);
			const absoluteBottom = Number.parseFloat(absoluteStyle.bottom);

			return {
				hostHeight: hostRect.height,
				cultRight: cultRect.right,
				hostRight: hostRect.right,
				cultLeft: cultRect.left,
				hostLeft: hostRect.left,
				cultBottom,
				absoluteBottom,
				transform: cultStyle.transform,
				overlaps: Boolean(
					cultRect.left < absoluteRect.right &&
					cultRect.right > absoluteRect.left &&
					cultRect.top < absoluteRect.bottom &&
					cultRect.bottom > absoluteRect.top,
				),
			};
		});

		expect(layout.cultRight).toBeLessThanOrEqual(layout.hostRight + 1);
		expect(layout.cultLeft).toBeGreaterThan(layout.hostLeft);
		expect(layout.transform).toBe('none');
		expect(layout.cultBottom - layout.absoluteBottom).toBeCloseTo(layout.hostHeight * 0.1, 0);
		expect(layout.overlaps).toBeFalsy();
	});

	test('el filtro De culto muestra el sticker en todas sus tarjetas visibles', async ({ page }) => {
		await page.goto('/', { waitUntil: 'domcontentloaded' });
		await waitForSiteStyles(page);
		await dismissDonationPrompt(page);

		await page.getByRole('button', { name: /^De culto$/i }).click();
		const cards = page.locator('[data-movie-search-grid] [data-movie-card]:visible');
		await expect(cards.first()).toBeVisible();

		const stickerCount = await cards.locator('.movie-card__cult-movie-sticker').count();
		const missingStickerCount = await cards.evaluateAll((movieCards) =>
			movieCards.filter((card) => !card.querySelector('.movie-card__cult-movie-sticker')).length,
		);

		expect(stickerCount).toBe(await cards.count());
		expect(missingStickerCount).toBe(0);
	});

	test('una película fuera del filtro De culto no recibe el sticker', async ({ page }) => {
		await page.goto('/peliculas/venom-2018/', { waitUntil: 'domcontentloaded' });
		await waitForSiteStyles(page);
		await dismissDonationPrompt(page);

		await expect(page.locator('.movie-detail__cult-movie-sticker')).toHaveCount(0);
	});
});

