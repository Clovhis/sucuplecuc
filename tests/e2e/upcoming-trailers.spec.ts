import { expect, test } from '@playwright/test';

const rootSelector = '[data-upcoming-suggestion-root]';

test.beforeEach(async ({ page }) => {
	// Navigation tests exercise our player contract without depending on YouTube.
	await page.route('https://www.youtube.com/embed/**', (route) => route.fulfill({
		contentType: 'text/html', body: '<html><body>Trailer</body></html>',
	}));
	await page.goto('/', { waitUntil: 'load' });
	const dismiss = page.getByRole('button', { name: /Ahora no, entrar al sitio/i });
	if (await dismiss.isVisible()) await dismiss.click();
	await expect(page.locator(rootSelector)).toBeVisible();
});

test('agenda selection and next keep the autoplay player and release details in sync', async ({ page }) => {
	const root = page.locator(rootSelector);
	const frame = root.locator('iframe');
	const entries = root.locator('[data-upcoming-suggestion-queue-item]:visible');
	const count = await entries.count();
	expect(count).toBeGreaterThan(1);
	const data = JSON.parse(await page.locator('#upcoming-suggestion-data').textContent() ?? '[]');

	const assertRelease = async (index: number) => {
		await expect(frame).toHaveCount(1);
		await expect(frame).toHaveAttribute('src', data[index].embedUrl);
		await expect(frame).toHaveAttribute('title', `Trailer oficial de ${data[index].title}`);
		const url = new URL(await frame.getAttribute('src') ?? '');
		for (const [key, value] of [['autoplay', '1'], ['mute', '1'], ['playsinline', '1']]) {
			expect(url.searchParams.get(key)).toBe(value);
		}
		await expect(root.locator('[data-upcoming-suggestion-name]')).toHaveText(data[index].displayTitle);
		await expect(root.locator('[data-upcoming-suggestion-date]')).toHaveAttribute('datetime', data[index].releaseDate);
		await expect(root.locator('[data-upcoming-suggestion-synopsis]')).toHaveText(data[index].displaySynopsis);
		await expect(root.locator('[data-upcoming-suggestion-count]')).toHaveText(`${index + 1} de ${count}`);
		await expect(entries.filter({ has: page.locator('[data-upcoming-suggestion-select="' + index + '"]') })).toHaveAttribute('aria-current', 'true');
		await expect(root.locator('[aria-current="true"]')).toHaveCount(1);
	};
	await assertRelease(0);
	await entries.nth(count - 1).getByRole('button').click();
	await assertRelease(count - 1);
	await root.locator('[data-upcoming-suggestion-next]').click();
	await assertRelease(0);
	await entries.nth(1).getByRole('button').focus();
	await page.keyboard.press('Enter');
	await assertRelease(1);
	await root.locator('[data-upcoming-suggestion-next]').click();
	await assertRelease(2 % count);
});

test('video, caption and agenda fit narrow screens and use the magazine presentation', async ({ page }, testInfo) => {
	const root = page.locator(rootSelector);
	for (const width of testInfo.project.name.startsWith('mobile-') ? [320, 390, 844] : [760, 1024, 1440]) {
		await page.setViewportSize({ width, height: 900 });
		await page.evaluate(() => document.fonts.ready);
		const layout = await root.evaluate((element) => {
			const player = element.querySelector('.weekly-suggestion__player')!.getBoundingClientRect();
			const caption = element.querySelector('.home-trailers__caption')!.getBoundingClientRect();
			const controls = [...element.querySelectorAll<HTMLElement>('button')].filter(el => el.getClientRects().length);
			const style = getComputedStyle(element);
			return {
				ratio: player.width / player.height,
				captionBelow: caption.top >= player.bottom,
				background: style.backgroundImage, shadow: style.boxShadow,
				fits: element.getBoundingClientRect().right <= innerWidth && document.documentElement.scrollWidth <= innerWidth,
				controls: controls.map(el => ({ height: el.getBoundingClientRect().height, fits: el.getBoundingClientRect().right <= innerWidth })),
			};
		});
		expect(layout.ratio).toBeCloseTo(16 / 9, 2);
		expect(layout.captionBelow).toBeTruthy();
		expect(layout.fits).toBeTruthy();
		expect(layout.background).toBe('none');
		expect(layout.shadow).toBe('none');
		expect(layout.controls.every(control => control.height >= 44 && control.fits)).toBeTruthy();
	}
});
