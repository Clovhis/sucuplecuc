import { expect, test } from '@playwright/test';

for (const person of [
	{ movie: 'hangar-rojo-2026', name: 'Juan Pablo Sallato', year: 1978 },
	{ movie: 'una-quinta-en-portugal-2025', name: 'Avelina Prat', year: 1972 },
	{ movie: 'will-y-harper-2024', name: 'Harper Steele', year: 1961 },
]) {
	test(`conserva el año sin mostrar una edad vacía para ${person.name}`, async ({ page }) => {
		await page.goto(`/peliculas/${person.movie}/`);
		const card = page.locator('.movie-detail__person-card').filter({ hasText: person.name });
		await expect(card).toBeVisible();
		await expect(card.locator('.movie-detail__person-meta')).toHaveText(`Nació en ${person.year}`);
		await expect(card.locator('.movie-detail__person-age')).toHaveCount(0);
	});
}

test('muestra la edad al fallecer en lugar de una edad actual', async ({ page }) => {
	await page.goto('/peliculas/una-quinta-en-portugal-2025/');
	const card = page.locator('.movie-detail__person-card').filter({ hasText: 'Manolo Solo' });
	await expect(card.locator('.movie-detail__person-death')).toHaveText(/^Falleció el .*2026 a los 62 años$/);
	await expect(card.locator('.movie-detail__person-age')).toHaveCount(0);
});

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

test('muestra los datos de nacimiento verificados en el directorio y la ficha individual', async ({ page }) => {
	const today = new Date();
	const expectedAge =
		today.getUTCFullYear() - 1943 -
		(today.getUTCMonth() + 1 < 10 || (today.getUTCMonth() + 1 === 10 && today.getUTCDate() < 22) ? 1 : 0);

	await page.goto('/personas/', { waitUntil: 'load' });

	const catherineRow = page.locator('[data-person-row]').filter({ hasText: 'Catherine Deneuve' });
	await expect(catherineRow).toBeVisible();
	await expect(catherineRow.locator('.people-index__fact').filter({ hasText: 'Edad' })).toContainText(`${expectedAge} años`);

	await page.goto('/personas/catherine-deneuve/', { waitUntil: 'load' });

	const facts = page.locator('.person-page__facts');
	await expect(facts.locator('.person-page__fact').filter({ hasText: 'Nacimiento' })).toContainText('22 de octubre de 1943');
	await expect(facts.locator('.person-page__fact').filter({ hasText: 'Edad' })).toContainText(`${expectedAge} años`);
	await expect(facts).not.toContainText(/No cargado|No confirmada/);
});

test('serializa la edad verificada en el buscador de la home', async ({ page }) => {
	await page.goto('/', { waitUntil: 'load' });

	const catherineEntry = page.locator('[data-person-search-entry][data-person-title="Catherine Deneuve"]');
	await expect(catherineEntry).toHaveAttribute('data-person-age', /\d+/);

	const personShowcaseCard = page.locator('.home-people-showcase__card:not(.home-people-showcase__card--cta)').first();
	await expect(personShowcaseCard).toBeVisible();

	const showcaseOrder = await personShowcaseCard.locator('.home-people-showcase__body').evaluate((body) =>
		Array.from(body.children).map((child) => child.className),
	);

	expect(showcaseOrder[0]).toBe('home-people-showcase__name');
	const personName = await personShowcaseCard.locator('.home-people-showcase__name').textContent();
	const sourceNationality = await page.locator(`[data-person-search-entry][data-person-title="${personName}"]`)
		.getAttribute('data-person-nationality');
	expect(await personShowcaseCard.locator('.home-people-showcase__nationality').count()).toBe(sourceNationality ? 1 : 0);
	expect(showcaseOrder.length).toBeLessThanOrEqual(3);
	expect(showcaseOrder.slice(1).every((className) => ['home-people-showcase__nationality', 'home-people-showcase__meta'].includes(className))).toBe(true);
});
