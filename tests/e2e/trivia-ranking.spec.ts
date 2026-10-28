import { expect, test } from '@playwright/test';
import { existsSync } from 'node:fs';
import { TRIVIA_COUNTRY_CODES } from '../../src/lib/trivia-player';
import { triviaLocalPreview } from './trivia-preview';

test.beforeEach(async ({ page, baseURL }) => { await triviaLocalPreview(page, baseURL); });

test('ranking de Trivia: banderas locales, edad y layout adaptable', async ({ page }) => {
	// Every nationality accepted by the form has an asset, including countries outside the simulator.
	for (const code of TRIVIA_COUNTRY_CODES) expect(existsSync(`public/images/flags/${code.toLowerCase()}.svg`), code).toBe(true);
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.route('**/rest/v1/rpc/list_trivia_high_scores', (route) => route.fulfill({
		json: [
			{ player_name: 'Zahiron', country_code: 'AR', age: 32, score: 19888, correct_count: 17 },
			{ player_name: 'UnaButacaConNombreLargo', country_code: 'AE', age: 120, score: 18784, correct_count: 16 },
			{ player_name: 'PequeCine', country_code: 'UY', age: 1, score: 16000, correct_count: 14 },
			{ player_name: 'SinEdad', country_code: 'BR', score: 15000, correct_count: 13 },
		],
	}));
	await page.goto('/juegos/trivia/');
	await expect(page.locator('#trivia-profile-privacy')).toContainText('Tu nickname, nacionalidad y edad aparecen en el ranking.');
	await page.locator('[data-ranking] > summary').click();
	const rows = page.locator('[data-ranking-list] > li');
	await expect(rows).toHaveCount(4);
	await expect(rows.nth(0)).toContainText('Argentina');
	await expect(rows.nth(0)).toContainText('32 años');
	await expect(rows.nth(0)).toContainText('17/20 aciertos');
	await expect(rows.nth(0)).toContainText('19.888');
	await expect(rows.nth(2)).toContainText('1 año ·');
	await expect(rows.nth(3)).not.toContainText(/undefined|NaN|años/);
	await expect(rows.nth(1).locator('img')).toHaveAttribute('src', /\/images\/flags\/ae\.svg$/);
	for (const image of await rows.locator('img').all()) {
		await expect(image).toHaveAttribute('alt', '');
		await expect.poll(() => image.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
	}
	await page.setViewportSize({ width: 320, height: 740 });
	await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
	for (const row of await rows.all()) {
		expect(await row.evaluate((node) => {
			const name = node.querySelector('.trivia-ranking-player')!.getBoundingClientRect();
			const score = node.querySelector('strong')!.getBoundingClientRect();
			return name.right <= score.left && node.scrollWidth <= node.clientWidth;
		})).toBe(true);
	}
	await page.locator('[data-ranking]').screenshot({ path: `test-results/trivia-ranking-${test.info().project.name}.png` });
	expect(errors).toEqual([]);
});
