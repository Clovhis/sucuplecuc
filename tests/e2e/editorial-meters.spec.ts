import { expect, test } from '@playwright/test';

const meterCases = [
	{
		path: '/peliculas/gladiator-2000/',
		meterClass: 'lagrimometro',
		score: '52%',
		label: 'No llega a emocionarte',
	},
	{
		path: '/peliculas/the-monkey-2025/',
		meterClass: 'cagazometro',
		score: '58%',
		label: 'Algún sustito y nada más',
	},
	{
		path: '/peliculas/forrest-gump-1994/',
		meterClass: 'jajametro',
		score: '42%',
		label: 'Algún jaja te saca',
	},
	{
		path: '/peliculas/saw-2004/',
		meterClass: 'sangrometro',
		score: '62%',
		label: 'Hay sangre, pero se controla',
	},
	{
		path: '/peliculas/john-wick-chapter-4-2023/',
		meterClass: 'explosiometro',
		score: '99%',
		label: 'Revienta todo: agarrate del sillón',
	},
] as const;

test('rendered meter labels match their score bands', async ({ page }) => {
	for (const meterCase of meterCases) {
		await page.goto(meterCase.path, { waitUntil: 'domcontentloaded' });

		const meter = page.locator(`.${meterCase.meterClass}`);
		await expect(meter).toBeVisible();
		await expect(meter.locator(`.${meterCase.meterClass}__score`)).toHaveText(meterCase.score);
		await expect(meter.locator(`.${meterCase.meterClass}__label`)).toHaveText(meterCase.label);
		await expect(meter.getByRole('progressbar')).toHaveAttribute('aria-valuenow', meterCase.score.replace('%', ''));
	}
});

test('meter cards do not create horizontal overflow on a narrow phone', async ({ page }, testInfo) => {
	test.skip(!testInfo.project.name.startsWith('mobile-'), 'This layout check is intentionally mobile-only.');
	await page.setViewportSize({ width: 320, height: 568 });
	await page.goto('/peliculas/gladiator-2000/', { waitUntil: 'domcontentloaded' });

	const dimensions = await page.evaluate(() => ({
		documentWidth: document.documentElement.scrollWidth,
		viewportWidth: window.innerWidth,
		labelWidth: document.querySelector('.lagrimometro__label')?.getBoundingClientRect().width ?? 0,
	}));

	expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth + 1);
	expect(dimensions.labelWidth).toBeGreaterThan(0);
});
