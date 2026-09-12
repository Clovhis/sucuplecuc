import { expect, test } from '@playwright/test';

test('movie detail renders the verified production nationality with a flag', async ({ page }) => {
	const response = await page.goto('/peliculas/libang-libu-2026/', { waitUntil: 'domcontentloaded' });

	expect(response?.ok()).toBeTruthy();
	const sidebarNationality = page.locator('.movie-detail__taxonomy--nationality');
	await expect(sidebarNationality.getByText('Países productores', { exact: true })).toBeVisible();
	await expect(sidebarNationality.locator('[data-country-code="MY"]')).toContainText('Malasia');
	const malaysianFlag = sidebarNationality.locator('.movie-detail__taxonomy-nationality-flag');
	await expect(malaysianFlag).toHaveAttribute('src', '/images/flags/my.svg');
	await expect(malaysianFlag).toBeVisible();
	expect(await malaysianFlag.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);

	const technicalNationality = page.locator('.movie-detail__credit-item--nationality');
	await expect(technicalNationality.locator('[data-country-code="MY"]')).toContainText('Malasia');
});

test('co-productions retain each verified nationality', async ({ page }) => {
	const response = await page.goto('/peliculas/under-the-skin-2013/', { waitUntil: 'domcontentloaded' });

	expect(response?.ok()).toBeTruthy();
	const nationality = page.locator('.movie-detail__taxonomy--nationality');
	await expect(nationality.locator('[data-country-code="GB"]')).toContainText('Reino Unido');
	await expect(nationality.locator('[data-country-code="US"]')).toContainText('Estados Unidos');
	await expect(nationality.locator('[data-country-code="CH"]')).toContainText('Suiza');
	const britishFlag = nationality.locator('[data-country-code="GB"] .movie-detail__taxonomy-nationality-flag');
	await expect(britishFlag).toHaveAttribute('src', '/images/flags/gb.svg');
	expect(await britishFlag.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
});

