import { expect, test } from '@playwright/test';

test.describe('directorio de personas', () => {
	test('expone filtros claros y mantiene búsqueda, URL y resultados sincronizados', async ({ page }) => {
		await page.goto('/personas/');

		await expect(
			page.getByRole('heading', { level: 1, name: 'Encontrá quién está detrás de cada película' }),
		).toBeVisible();

		const filtersToggle = page.locator('[data-people-filter-toggle]');
		await expect(filtersToggle).toHaveAccessibleName('Más filtros');
		const filtersPanel = page.locator('[data-people-filter-panel]');
		await expect(filtersToggle).toHaveAttribute('aria-expanded', 'false');
		await expect(filtersPanel).toBeHidden();

		await filtersToggle.click();
		await expect(filtersToggle).toHaveAttribute('aria-expanded', 'true');
		await expect(filtersToggle).toHaveAccessibleName('Ocultar filtros');
		await expect(filtersPanel).toBeVisible();
		await expect(page.getByLabel('Rol', { exact: true })).toBeVisible();
		await expect(page.getByLabel('Nacionalidad', { exact: true })).toBeVisible();

		const search = page.getByLabel('Nombre, película, rol o país');
		await search.fill('Meryl Streep');
		await expect(page).toHaveURL(/\?q=Meryl\+Streep$/);
		await expect(page.locator('[data-person-row]:not([hidden])')).toHaveCount(1);
		await expect(page.getByRole('heading', { level: 2, name: 'Meryl Streep' })).toBeVisible();
		await expect(page.locator('[data-people-status]')).toContainText('Mostrando 1 de');

		await page.getByRole('button', { name: 'Limpiar búsqueda y filtros' }).click();
		await expect(search).toHaveValue('');
		await expect(page).toHaveURL(/\/personas\/$/);
		await expect(page.locator('[data-people-status]')).toContainText('Orden actual: A-Z');
	});

	test('no incluye fichas sin edad en el filtro de menores de 40', async ({ page }) => {
		await page.goto('/personas/?edad=under-40');

		const visibleRows = page.locator('[data-person-row]:not([hidden])');
		await expect(visibleRows.first()).toBeVisible();
		await expect(page.locator('[data-person-row]:not([hidden])[data-age-known="false"]')).toHaveCount(0);
	});
});
