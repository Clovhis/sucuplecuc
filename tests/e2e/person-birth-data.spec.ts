import { expect, test } from '@playwright/test';

test('omite la línea de nacimiento cuando una persona no tiene ese dato', async ({ page }) => {
	const response = await page.goto('/peliculas/la-asistente-de-la-morgue-2026/', { waitUntil: 'load' });

	expect(response?.ok()).toBeTruthy();
	const directorCard = page.locator('.movie-detail__person-card').filter({ hasText: 'Jeremiah Kipp' });

	await expect(directorCard).toBeVisible();
	await expect(directorCard.locator('.movie-detail__person-role')).toHaveCount(0);
	await expect(directorCard).not.toContainText('Dirección');

	const markSteger = page.locator('.movie-detail__person-card').filter({ hasText: 'Mark Steger' });

	await expect(markSteger).toBeVisible();
	await expect(markSteger.locator('.movie-detail__person-meta')).toHaveCount(0);
	await expect(markSteger.locator('.movie-detail__person-origin')).toHaveText('Estadounidense');
	await expect(markSteger).not.toContainText(/nacimiento\s+no\s+cargado|No confirmada|Edad no disponible/i);

	const nameToOriginGap = await markSteger.locator('.movie-detail__person-origin').evaluate((origin) => {
		const name = origin.parentElement?.querySelector<HTMLElement>('.movie-detail__person-name');
		if (!name) {
			return Number.POSITIVE_INFINITY;
		}

		return origin.getBoundingClientRect().top - name.getBoundingClientRect().bottom;
	});

	expect(nameToOriginGap).toBeLessThan(8);

	const willaHolland = page.locator('.movie-detail__person-card').filter({ hasText: 'Willa Holland' });
	await expect(willaHolland).toBeVisible();

	const nationalityBeforeBirth = await willaHolland.locator('.movie-detail__person-origin').evaluate((origin) => {
		const birth = origin.parentElement?.querySelector<HTMLElement>('.movie-detail__person-meta');
		if (!birth) {
			return false;
		}

		return origin.getBoundingClientRect().top < birth.getBoundingClientRect().top;
	});

	expect(nationalityBeforeBirth).toBe(true);
});

test('omite los datos de nacimiento ausentes en el directorio y la ficha individual', async ({ page }) => {
	await page.goto('/personas/', { waitUntil: 'load' });

	const catherineRow = page.locator('[data-person-row]').filter({ hasText: 'Catherine Deneuve' });
	await expect(catherineRow).toBeVisible();
	await expect(catherineRow.locator('.people-index__fact').filter({ hasText: 'Edad' })).toHaveCount(0);
	await expect(catherineRow).not.toContainText('Edad no disponible');

	await page.goto('/personas/catherine-deneuve/', { waitUntil: 'load' });

	const facts = page.locator('.person-page__facts');
	await expect(facts.locator('.person-page__fact').filter({ hasText: 'Nacimiento' })).toHaveCount(0);
	await expect(facts.locator('.person-page__fact').filter({ hasText: 'Edad' })).toHaveCount(0);
	await expect(facts).not.toContainText(/No cargado|No confirmada/);
});

test('no serializa un fallback de edad faltante en el buscador de la home', async ({ page }) => {
	await page.goto('/', { waitUntil: 'load' });

	const catherineEntry = page.locator('[data-person-search-entry][data-person-title="Catherine Deneuve"]');
	await expect(catherineEntry).toHaveAttribute('data-person-age', '');

	const personShowcaseCard = page.locator('.home-people-showcase__card:not(.home-people-showcase__card--cta)').first();
	await expect(personShowcaseCard).toBeVisible();

	const showcaseOrder = await personShowcaseCard.locator('.home-people-showcase__body').evaluate((body) =>
		Array.from(body.children).map((child) => child.className),
	);

	expect(showcaseOrder[0]).toBe('home-people-showcase__name');
	expect(showcaseOrder[1]).toBe('home-people-showcase__nationality');
	expect(showcaseOrder.length).toBeLessThanOrEqual(3);
	expect(showcaseOrder.slice(2).every((className) => className === 'home-people-showcase__meta')).toBe(true);
});
