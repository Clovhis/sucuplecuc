import { expect, test } from '@playwright/test';

const illustratedAwardCases = [
	{ path: '/personas/brad-pitt/', key: 'oscar', asset: '/brand/awards/illustrated/oscar.webp' },
	{ path: '/personas/aaron-taylor-johnson/', key: 'golden-globe', asset: '/brand/awards/illustrated/golden-globe.webp' },
	{ path: '/personas/michelle-pfeiffer/', key: 'bafta', asset: '/brand/awards/illustrated/bafta.webp' },
	{ path: '/personas/danny-devito/', key: 'emmy', asset: '/brand/awards/illustrated/emmy.webp' },
	{ path: '/personas/martin-scorsese/', key: 'cannes', asset: '/brand/awards/illustrated/cannes.webp' },
	{ path: '/peliculas/barbie-2023/', key: 'grammy', asset: '/brand/awards/illustrated/grammy.webp' },
	{ path: '/personas/santiago-segura/', key: 'goya', asset: '/brand/awards/illustrated/goya.webp' },
	{ path: '/personas/josh-brolin/', key: 'sag', asset: '/brand/awards/illustrated/sag.webp' },
	{ path: '/personas/alejandra-flechner/', key: 'sur', asset: '/brand/awards/illustrated/sur.webp' },
	{ path: '/personas/cecilia-dopazo/', key: 'condor', asset: '/brand/awards/illustrated/condor.webp' },
	{ path: '/personas/dario-grandinetti/', key: 'platino', asset: '/brand/awards/illustrated/platino.webp' },
	{ path: '/personas/andy-serkis/', key: 'saturn', asset: '/brand/awards/illustrated/saturn.webp' },
	{ path: '/personas/chris-evans/', key: 'peoples-choice', asset: '/brand/awards/illustrated/peoples-choice.webp' },
	{ path: '/personas/emma-watson/', key: 'mtv', asset: '/brand/awards/illustrated/mtv.webp' },
	{ path: '/personas/adam-sandler/', key: 'independent-spirit', asset: '/brand/awards/illustrated/independent-spirit.webp' },
	{ path: '/personas/charlie-day/', key: 'critics-choice', asset: '/brand/awards/illustrated/critics-choice.webp' },
	{ path: '/personas/cailee-spaeny/', key: 'volpi', asset: '/brand/awards/illustrated/volpi.webp' },
	{ path: '/personas/donald-pleasence/', key: 'tony', asset: '/brand/awards/illustrated/tony.webp' },
	{ path: '/personas/tim-burton/', key: 'golden-lion', asset: '/brand/awards/illustrated/golden-lion.webp' },
	{ path: '/personas/luca-guadagnino/', key: 'silver-lion', asset: '/brand/awards/illustrated/silver-lion.webp' },
	{ path: '/personas/robert-pattinson/', key: 'gotham', asset: '/brand/awards/illustrated/gotham.webp' },
	{ path: '/personas/lucrecia-martel/', key: 'berlinale', asset: '/brand/awards/illustrated/berlinale.webp' },
	{ path: '/personas/nahuel-perez-biscayart/', key: 'cesar', asset: '/brand/awards/illustrated/cesar.webp' },
	{ path: '/personas/michael-b-jordan/', key: 'naacp', asset: '/brand/awards/illustrated/naacp.webp' },
	{ path: '/personas/eric-bana/', key: 'aacta', asset: '/brand/awards/illustrated/aacta.webp' },
	{ path: '/personas/carrie-fisher/', key: 'disney-legends', asset: '/brand/awards/illustrated/disney-legends.webp' },
	{ path: '/personas/melissa-barrera/', key: 'imagen', asset: '/brand/awards/illustrated/imagen.webp' },
	{ path: '/personas/jonathan-bailey/', key: 'olivier', asset: '/brand/awards/illustrated/olivier.webp' },
	{ path: '/personas/eric-bana/', key: 'logie', asset: '/brand/awards/illustrated/logie.webp' },
	{ path: '/personas/diego-peretti/', key: 'martin-fierro', asset: '/brand/awards/illustrated/martin-fierro.webp' },
	{ path: '/personas/adam-sandler/', key: 'walk-of-fame', asset: '/brand/awards/illustrated/walk-of-fame.webp' },
	{ path: '/personas/anthony-mackie/', key: 'black-reel', asset: '/brand/awards/illustrated/black-reel.webp' },
	{ path: '/personas/david-arquette/', key: 'teen-choice', asset: '/brand/awards/illustrated/teen-choice.webp' },
	{ path: '/personas/rupert-grint/', key: 'national-movie', asset: '/brand/awards/illustrated/national-movie.webp' },
	{ path: '/personas/sadie-sandler/', key: 'family-film', asset: '/brand/awards/illustrated/family-film.webp' },
	{ path: '/personas/kathryn-newton/', key: 'young-artist', asset: '/brand/awards/illustrated/young-artist.webp' },
	{ path: '/personas/adam-sandler/', key: 'mark-twain', asset: '/brand/awards/illustrated/mark-twain.webp' },
	{ path: '/personas/christopher-nolan/', key: 'bfi', asset: '/brand/awards/illustrated/bfi.webp' },
	{ path: '/personas/bryce-dallas-howard/', key: 'hasty-pudding', asset: '/brand/awards/illustrated/hasty-pudding.webp' },
] as const;

test('award illustrations load with the expected visual identity', async ({ page }) => {
	for (const awardCase of illustratedAwardCases) {
		const response = await page.goto(awardCase.path, { waitUntil: 'domcontentloaded' });

		expect(response?.ok(), awardCase.path).toBeTruthy();

		const mark = page.locator(`[data-award-visual="${awardCase.key}"]`).first();
		await expect(mark, awardCase.path).toBeVisible();
		const image = mark;
		await expect(image).toHaveAttribute('src', awardCase.asset);
		await image.scrollIntoViewIfNeeded();
		await expect
			.poll(async () =>
				image.evaluate((element) => {
					const imageElement = element as HTMLImageElement;
					return { complete: imageElement.complete, naturalWidth: imageElement.naturalWidth };
				}),
			)
			.toEqual({ complete: true, naturalWidth: 256 });

		const transparency = await image.evaluate((element) => {
			const imageElement = element as HTMLImageElement;
			const canvas = document.createElement('canvas');
			canvas.width = imageElement.naturalWidth;
			canvas.height = imageElement.naturalHeight;
			const context = canvas.getContext('2d');
			if (!context) return null;
			context.drawImage(imageElement, 0, 0);
			return {
				naturalHeight: imageElement.naturalHeight,
				naturalWidth: imageElement.naturalWidth,
				cornerAlpha: context.getImageData(0, 0, 1, 1).data[3],
			};
		});

		expect(transparency).toEqual({ naturalHeight: 256, naturalWidth: 256, cornerAlpha: 0 });
	}
});

test('generic award illustration loads as a transparent asset for the simulator', async ({ page }) => {
	const response = await page.goto('/brand/awards/illustrated/generic.webp', { waitUntil: 'load' });

	expect(response?.ok()).toBeTruthy();
	const image = page.locator('img').first();
	const metrics = await image.evaluate((element) => {
		const imageElement = element as HTMLImageElement;
		const canvas = document.createElement('canvas');
		canvas.width = imageElement.naturalWidth;
		canvas.height = imageElement.naturalHeight;
		const context = canvas.getContext('2d');
		if (!context) return null;
		context.drawImage(imageElement, 0, 0);
		return {
			complete: imageElement.complete,
			naturalHeight: imageElement.naturalHeight,
			naturalWidth: imageElement.naturalWidth,
			cornerAlpha: context.getImageData(0, 0, 1, 1).data[3],
		};
	});

	expect(metrics).toEqual({ complete: true, naturalHeight: 256, naturalWidth: 256, cornerAlpha: 0 });
});

test('less frequent awards use dedicated transparent illustrations', async ({ page }) => {
	const response = await page.goto('/personas/melissa-barrera/', { waitUntil: 'domcontentloaded' });

	expect(response?.ok()).toBeTruthy();
	const mark = page.locator('[data-award-visual="imagen"]').first();
	await expect(mark).toHaveJSProperty('tagName', 'IMG');
	await expect(mark).toHaveAttribute('src', '/brand/awards/illustrated/imagen.webp');
	await expect(page.locator('.award-mark--monogram')).toHaveCount(0);
});

test('BFI uses a transparent illustration instead of a flat placeholder tile', async ({ page }) => {
	await page.goto('/personas/christopher-nolan/', { waitUntil: 'domcontentloaded' });

	const image = page.locator('[data-award-visual="bfi"]').first();
	await expect(image).toHaveAttribute('src', '/brand/awards/illustrated/bfi.webp');
	await expect(image).toHaveAttribute('alt', '');
	await expect(image).toHaveAttribute('aria-hidden', 'true');
	await image.scrollIntoViewIfNeeded();
	await expect
		.poll(async () =>
			image.evaluate((element) => {
				const imageElement = element as HTMLImageElement;
				return { complete: imageElement.complete, naturalWidth: imageElement.naturalWidth };
			}),
		)
		.toEqual({ complete: true, naturalWidth: 256 });

	const pixels = await image.evaluate((element) => {
		const imageElement = element as HTMLImageElement;
		const canvas = document.createElement('canvas');
		canvas.width = imageElement.naturalWidth;
		canvas.height = imageElement.naturalHeight;
		const context = canvas.getContext('2d');
		if (!context) return null;
		context.drawImage(imageElement, 0, 0);
		return {
			naturalWidth: imageElement.naturalWidth,
			naturalHeight: imageElement.naturalHeight,
			cornerAlpha: context.getImageData(0, 0, 1, 1).data[3],
		};
	});

	expect(pixels).toEqual({ naturalWidth: 256, naturalHeight: 256, cornerAlpha: 0 });
});

test('award cards give the illustration visual priority', async ({ page }) => {
	await page.goto('/personas/brad-pitt/', { waitUntil: 'domcontentloaded' });

	const layout = await page.locator('.person-page__award-item').first().evaluate((item) => {
		const card = item.getBoundingClientRect();
		const mark = item.querySelector('.person-page__award-mark-shell')?.getBoundingClientRect();
		const copy = item.querySelector('.person-page__award-copy')?.getBoundingClientRect();

		return {
			cardHeight: card.height,
			mark: mark ? { left: mark.left, width: mark.width, height: mark.height } : null,
			copy: copy ? { left: copy.left, width: copy.width } : null,
		};
	});

	expect(layout.cardHeight).toBeGreaterThanOrEqual(138);
	expect(layout.mark?.width ?? 0).toBeGreaterThanOrEqual(96);
	expect(layout.mark?.height ?? 0).toBeGreaterThanOrEqual(96);
	expect(layout.mark && layout.copy ? layout.mark.left : 9999).toBeLessThan(layout.copy?.left ?? -1);
});

test('award cards do not overflow a narrow viewport', async ({ page }, testInfo) => {
	test.skip(!testInfo.project.name.startsWith('mobile'), 'Narrow layout is covered by the mobile projects.');

	await page.goto('/personas/brad-pitt/', { waitUntil: 'domcontentloaded' });
	const metrics = await page.evaluate(() => ({
		bodyWidth: document.body.scrollWidth,
		viewportWidth: window.innerWidth,
		awardItems: Array.from(document.querySelectorAll('.person-page__award-item')).map((item) => {
			const rect = item.getBoundingClientRect();
			return { left: rect.left, right: rect.right };
		}),
	}));

	expect(metrics.bodyWidth).toBeLessThanOrEqual(metrics.viewportWidth + 1);
	expect(metrics.awardItems.every(({ left, right }) => left >= -1 && right <= metrics.viewportWidth + 1)).toBeTruthy();
});
