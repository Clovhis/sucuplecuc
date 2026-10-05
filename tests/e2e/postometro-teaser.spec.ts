import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test('el selector del home abre Qué vemos hoy con teclado', async ({ page }) => {
	await page.goto('/', { waitUntil: 'load' });
	const teaser = page.locator('#que-vemos-hoy');
	await expect(teaser.getByText('Selector de la noche')).toBeVisible();
	await expect(teaser.getByText('En 20 segundos')).toBeVisible();
	const link = teaser.getByRole('link', { name: 'Encontrá qué ver' });
	await link.focus();
	await link.press('Enter');
	await expect(page).toHaveURL(/\/que-miro-hoy\/$/);
	await expect(page.getByRole('heading', { level: 1, name: '¿Qué vemos hoy?' })).toBeVisible();
});

test('la columna de reseñas conserva los datos y abre la ficha correspondiente', async ({ page }) => {
	await page.goto('/', { waitUntil: 'load' });
	const reviews = page.getByRole('complementary', { name: 'Últimas reseñas' });
	const links = reviews.locator('.upcoming-release-list__card');
	await expect(links).toHaveCount(3);
	for (const link of await links.all()) {
		const href = await link.getAttribute('href');
		const slug = href?.match(/\/peliculas\/([^/]+)\//)?.[1];
		expect(slug).toBeTruthy();
		const movie = JSON.parse(await readFile(new URL(`../../src/data/movies/${slug}.json`, import.meta.url), 'utf8'));
		await expect(link.locator('.upcoming-release-list__title')).toHaveText(movie.title);
		await expect(link.locator('.upcoming-release-list__score')).toContainText(movie.cinepostaScore == null ? 'Sin valorar' : `${movie.cinepostaScore}/10`);
		await expect(link.locator('.upcoming-release-list__genres')).toContainText(movie.category);
		await expect(link.locator('time')).toHaveAttribute('datetime', movie.reviewPublishedAt ?? movie.releaseDate);
		const excerpt = await link.locator('.home-discovery__review-excerpt').innerText();
		expect(excerpt.length).toBeGreaterThan(0);
		expect(movie.review.replace(/\s+/g, ' ').startsWith(excerpt.replace(/…$/, ''))).toBeTruthy();
		if (await link.isVisible()) {
			await link.scrollIntoViewIfNeeded();
			await expect.poll(() => link.locator('img').evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
		}
	}
	const firstTitle = await links.first().getByRole('heading').innerText();
	await links.first().click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(firstTitle);
});

test('la galería conserva la identidad de los perfiles y el acceso al índice', async ({ page }, testInfo) => {
	await page.goto('/', { waitUntil: 'load' });
	const section = page.locator('.home-discovery');
	const gallery = section.locator('[data-home-people-grid]');
	const profiles = gallery.locator('.home-people-showcase__card:not(.home-people-showcase__card--cta)');
	await expect(profiles).toHaveCount(10);
	for (const profile of await profiles.all()) {
		const title = await profile.locator('.home-people-showcase__name').innerText();
		const entry = page.locator('[data-person-search-entry]').filter({ hasText: title }).first();
		await expect(profile).toHaveAttribute('href', (await entry.getAttribute('data-person-url'))!);
		await expect(profile.locator('img')).toHaveAttribute('src', (await entry.getAttribute('data-person-poster-url'))!);
	}
	await expect(gallery.getByRole('link', { name: 'Explorar la base de datos de actrices y actores' })).toHaveAttribute('href', '/personas/');
	const visibleCount = testInfo.project.name.startsWith('mobile-') ? 2 : 10;
	await expect(gallery.locator('.home-people-showcase__card:not(.home-people-showcase__card--cta):visible')).toHaveCount(visibleCount);
	await section.scrollIntoViewIfNeeded();
	expect(await section.evaluate(el => Array.from(el.querySelectorAll('a')).filter(a => a.getClientRects().length).every(a => {
		const rect = a.getBoundingClientRect();
		return rect.left >= 0 && rect.right <= innerWidth;
	}))).toBeTruthy();
	// A viewport capture keeps Android's device metrics intact. A capture of
	// this section is taller than the screen and can change responsive state.
	await profiles.first().scrollIntoViewIfNeeded();
	await page.screenshot({ path: testInfo.outputPath('home-discovery.png'), scale: 'css' });
	const firstTitle = await profiles.first().locator('.home-people-showcase__name').innerText();
	await profiles.first().click();
	await expect(page).toHaveURL(/\/personas\/[^/]+\/$/);
	await expect(page.getByRole('heading', { level: 1 })).toContainText(firstTitle);
});
