import { expect, test } from '@playwright/test';

test('la clasificación verificada usa la ficha canónica aunque existan alias', async ({ page }) => {
	await page.goto('/personas/?sexo=femenino&q=Salma+Hayek');
	const visible = page.locator('[data-person-row]:not([hidden])');
	await expect(visible).toHaveCount(1);
	await expect(visible).toHaveAttribute('data-name', 'Salma Hayek');
	await expect(visible).toHaveAttribute('data-sex', 'femenino');
	await expect(visible.locator('a')).toHaveAttribute('href', '/personas/salma-hayek/');
});

test('sexo y nacionalidad se combinan, persisten y se limpian por separado', async ({ page }) => {
	await page.goto('/personas/');
	await expect(page.getByLabel('Sexo', { exact: true })).toBeVisible();
	await expect(page.getByLabel('Nacionalidad', { exact: true })).toBeVisible();
	const nationality = page.getByLabel('Nacionalidad', { exact: true });
	const labels = await nationality.locator('option').allTextContents();
	for (const duplicate of ['Argentino', 'Francés', 'Español', 'Brasileño']) expect(labels).not.toContain(duplicate);
	for (const correct of ['Argentina', 'Francesa', 'Española', 'Brasileña']) expect(labels).toContain(correct);
	await nationality.selectOption('argentino');
	await page.getByLabel('Sexo', { exact: true }).selectOption('femenino');
	const visible = page.locator('[data-person-row]:not([hidden])');
	await expect(visible.first()).toBeVisible();
	const names = await visible.evaluateAll(rows => rows.map(row => row.getAttribute('data-name')));
	expect(names).toContain('Norma Aleandro');
	expect(names).not.toContain('Ricardo Darín');
	expect(await visible.evaluateAll(rows => rows.every(row => row.getAttribute('data-sex') === 'femenino' && row.getAttribute('data-nationality')?.split('|').includes('argentino')))).toBe(true);
	await page.reload();
	await expect(page.getByLabel('Sexo', { exact: true })).toHaveValue('femenino');
	await expect(nationality).toHaveValue('argentino');
	await page.getByLabel('Nombre, película, rol o país').fill('Norma Aleandro');
	await expect(visible).toHaveCount(1);
	await page.getByRole('button', { name: 'Quitar filtro de sexo: Femenino', exact: true }).click();
	await expect(page.getByLabel('Sexo', { exact: true })).toHaveValue('');
	await expect(nationality).toHaveValue('argentino');
	await page.getByRole('button', { name: 'Limpiar búsqueda y filtros' }).click();
	await expect(page).toHaveURL(/\/personas\/$/);
	await expect(page.getByLabel('Sexo', { exact: true })).toHaveValue('');
	await expect(nationality).toHaveValue('');
});

test('URLs anteriores, nacionalidad doble y datos no clasificados', async ({ page }) => {
	await page.goto('/personas/?nacionalidad=argentina&sexo=femenino');
	await expect(page.getByLabel('Nacionalidad', { exact: true })).toHaveValue('argentino');
	await expect(page.getByLabel('Sexo', { exact: true })).toHaveValue('femenino');
	await expect(page.locator('[data-person-row]:not([hidden])[data-sex=""]')).toHaveCount(0);
	await page.goto('/personas/?nacionalidad=espanol');
	const dual = page.locator('[data-person-row][data-nationality="argentino|espanol"]');
	expect(await dual.count()).toBeGreaterThan(0);
	await expect(dual.first()).toBeVisible();
	await page.goto('/personas/?sexo=invalid');
	await expect(page.getByLabel('Sexo', { exact: true })).toHaveValue('');
	await expect(page.locator('[data-person-row][data-sex=""]').first()).toBeVisible();
	await page.goto('/personas/?sexo=femenino&nacionalidad=brasilena');
	await expect(page.getByLabel('Nacionalidad', { exact: true })).toHaveValue('brasileno');
	await expect(page.getByLabel('Nacionalidad', { exact: true })).toContainText('Brasileña');
	await expect(page.locator('[data-person-row]:not([hidden])').first()).toBeVisible();
});

test('fichas oscuras legibles y escena completa de 320 a 1440 px', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/personas/');
	for (const width of [320, 390, 600, 768, 900, 1024, 1280, 1440]) {
		await page.setViewportSize({ width, height: 900 });
		const metrics = await page.evaluate(() => {
			const art = document.querySelector('.people-index__hero-art')!;
			const card = document.querySelector('.people-index__row-link')!;
			const frame = art.getBoundingClientRect();
			return {
				overflow: document.documentElement.scrollWidth > innerWidth,
				artVisible: frame.width > 0 && frame.height > 0,
				artRatio: frame.width / frame.height,
				background: getComputedStyle(card).backgroundColor,
				color: getComputedStyle(card.querySelector('h2')!).color,
				opacity: getComputedStyle(card.closest('[data-person-row]')!).opacity,
				fields: [...document.querySelectorAll<HTMLElement>('.people-index__primary-controls input, .people-index__primary-controls select')].map(field => ({ height: field.getBoundingClientRect().height, fontSize: parseFloat(getComputedStyle(field).fontSize) })),
			};
		});
		expect(metrics.overflow, `${width}px`).toBe(false);
		expect(metrics.artVisible).toBe(true);
		expect(metrics.artRatio).toBeCloseTo(1.5, 1);
		expect(metrics.background).toBe('rgb(28, 33, 41)');
		expect(metrics.color).toBe('rgb(240, 238, 232)');
		expect(metrics.opacity).toBe('1');
		expect(metrics.fields.every(field => field.height >= 44 && field.fontSize >= 16)).toBe(true);
	}
	await page.locator('[data-person-row]').first().locator('a').focus();
	await expect(page.locator('[data-person-row]').first().locator('a')).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL(/\/personas\/aaron-eckhart\/$/);
});
