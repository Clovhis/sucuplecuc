import { expect, test } from '@playwright/test';

test('omite nacionalidades desconocidas y conserva la de Gabriel Musco', async ({ page }) => {
	await page.goto('/peliculas/recuerdos-del-mal-2022/');
	const people = page.locator('.movie-detail__people-panel');
	await expect(page.locator('.movie-reaction')).toHaveClass(/movie-reaction--pass/);
	await expect(page.locator('.movie-reaction h2')).toHaveText('6 · Buena');
	await expect(people.locator('.movie-detail__person-origin')).toHaveCount(1);
	await expect(people.locator('.movie-detail__person-card').filter({ hasText: 'Gabriel Musco' })
		.locator('.movie-detail__person-origin')).toHaveText('Argentino');
	for (const name of ['Marta Quarleri', 'Lucas Martínez Foresi']) {
		const card = people.locator('.movie-detail__person-card').filter({ hasText: name });
		await expect(card).toBeVisible();
		await expect(card.locator('.movie-detail__person-origin')).toHaveCount(0);
		await expect(card.locator('.movie-detail__person-meta')).toHaveCount(0);
	}
	await expect(people).not.toContainText(/Nacionalidad no disponible|No cargado/);
});

test('el directorio omite el origen desconocido sin perder personas ni nacionalidades verificadas', async ({ page }) => {
	await page.goto('/personas/');
	const bong = page.locator('[data-person-row]').filter({ hasText: 'Bong Joon-ho' });
	await expect(bong).toBeVisible();
	await expect(bong).toHaveAttribute('data-nationality', 'surcoreano');
	await expect(bong.locator('.people-index__fact').filter({ hasText: 'Origen' })).toContainText('Surcoreano');
	const unknown = page.locator('[data-person-row][data-nationality=""]');
	await expect(unknown.locator('.people-index__fact').filter({ hasText: 'Origen' })).toHaveCount(0);
	const catherine = page.locator('[data-person-row]').filter({ hasText: 'Catherine Deneuve' });
	await expect(catherine.locator('.people-index__fact').filter({ hasText: 'Origen' })).toContainText('Francesa');
	await expect(page.locator('.people-index__ladder')).not.toContainText(/Nacionalidad no disponible|No disponible/);
	await page.goto('/personas/bong-joon-ho/');
	await expect(page.locator('.person-page__fact').filter({ hasText: 'Origen' })).toContainText('Daegu');
	await expect(page.locator('.person-page__facts')).not.toContainText(/Nacionalidad no disponible|No cargado|No disponible/);
});

test('la home omite la fila sin nacionalidad al construir tarjetas de personas', async ({ page }) => {
	// Este caso fuerza datos ausentes en la vitrina aleatoria sin alterar el catálogo.
	await page.route('**/', async (route) => {
		if (new URL(route.request().url()).pathname !== '/') return route.continue();
		const response = await route.fetch();
		const html = (await response.text()).replace(/data-person-nationality="[^"]*"/g, 'data-person-nationality=""');
		await route.fulfill({ response, body: html });
	});
	await page.goto('/');
	const cards = page.locator('.home-people-showcase__card:not(.home-people-showcase__card--cta)');
	await expect(cards).toHaveCount(10);
	await expect(cards.locator('.home-people-showcase__name')).toHaveCount(10);
	await expect(cards.locator('.home-people-showcase__nationality')).toHaveCount(0);
	await expect(page.locator('.home-people-showcase')).not.toContainText('Nacionalidad no disponible');
});
