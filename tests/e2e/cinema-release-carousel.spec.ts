import { expect, test } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

function getCurrentTheatricalMovieSlugs() {
	const now = new Date();
	const referenceTimestamp = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
	const movieDirectory = path.join(process.cwd(), 'src/data/movies');

	return readdirSync(movieDirectory)
		.filter((file) => file.endsWith('.json'))
		.map((file) => JSON.parse(readFileSync(path.join(movieDirectory, file), 'utf8')))
		.filter((movie) => {
			const platforms =
				Array.isArray(movie.releasePlatforms) && movie.releasePlatforms.length > 0
					? movie.releasePlatforms
					: [movie.releasePlatform];
			if (!platforms.includes('Cine')) return false;

			const releaseTimestamp = movie.releaseDate
				? new Date(`${movie.releaseDate}T00:00:00Z`).getTime()
				: Date.UTC(movie.year, 0, 1);
			return Number.isFinite(releaseTimestamp) && releaseTimestamp <= referenceTimestamp;
		})
		.map((movie) => movie.slug)
		.sort();
}

test('Cartelera renders every current catalog film marked Cine', async ({ page }) => {
	await page.goto('/', { waitUntil: 'domcontentloaded' });

	const carousel = page.locator('[data-cinema-release-carousel="cinema-release-carousel"]');
	const displayedSlugs = await carousel
		.locator('[data-cinema-release-slug]')
		.evaluateAll((elements) => elements.map((element) => element.getAttribute('data-cinema-release-slug') ?? '').sort());

	expect(displayedSlugs).toEqual(getCurrentTheatricalMovieSlugs());
	expect(displayedSlugs.length).toBeGreaterThan(12);
	for (const slug of [
		'resident-evil-noche-cero-2026',
		'el-final-de-la-calle-oak-2026',
		'hospital-britanico-2026',
		'los-calvos-2024',
		'avengers-endgame-2019',
		'toy-story-5-2026',
	]) {
		expect(displayedSlugs).toContain(slug);
	}
});

test('current cinema releases open their trailer in a dialog on demand', async ({ page }) => {
	await page.goto('/', { waitUntil: 'domcontentloaded' });

	const carousel = page.locator('[data-cinema-release-carousel="cinema-release-carousel"]');
	await expect(carousel).toBeVisible();
	await expect(carousel.locator('iframe')).toHaveCount(0);
	const firstVerdict = carousel.locator('.cinema-release-carousel__verdict.badge').first();
	await expect(firstVerdict).toBeVisible();
	const firstReviewLink = carousel.getByRole('link', { name: /leer la ficha y reseña de/i }).first();
	await expect(firstReviewLink).toBeVisible();
	await expect(firstReviewLink).toHaveAttribute('href', /\/peliculas\/[^/]+\//);
	const [verdictWidth, cardWidth] = await Promise.all([
		firstVerdict.evaluate((element) => element.getBoundingClientRect().width),
		carousel.locator('[data-cinema-release-open]').first().evaluate((element) => element.getBoundingClientRect().width),
	]);
	expect(verdictWidth).toBeLessThan(cardWidth * 0.9);

	const firstTrailer = carousel.getByRole('button', { name: /reproducir trailer de/i }).first();
	await firstTrailer.click();

	const dialog = carousel.getByRole('dialog');
	await expect(dialog).toBeVisible();
	await expect(dialog.locator('iframe')).toHaveAttribute('src', /youtube\.com\/embed\//);
	await expect(dialog.locator('iframe')).not.toHaveAttribute('src', /autoplay=1/);
	await dialog.getByRole('button', { name: /cerrar trailer/i }).click();
	await expect(dialog).not.toBeVisible();
});

test('current streaming releases retain their platform and open their own trailer dialog', async ({ page }) => {
	await page.goto('/', { waitUntil: 'domcontentloaded' });

	const carousel = page.locator('[data-cinema-release-carousel="streaming-release-carousel"]');
	await expect(carousel).toBeVisible();
	await expect(carousel.getByRole('heading', { name: 'Streaming' })).toBeVisible();
	await expect(carousel.getByText('Películas para ver ahora mismo en casa')).toBeVisible();
	await expect(carousel.locator('.cinema-release-carousel__platform.platform-chip').first()).toBeVisible();
	await expect(carousel.getByRole('link', { name: /leer la ficha y reseña de/i }).first()).toBeVisible();
	await expect(carousel.locator('iframe')).toHaveCount(0);

	await carousel.getByRole('button', { name: /reproducir trailer de/i }).first().click();
	const dialog = carousel.getByRole('dialog');
	await expect(dialog).toBeVisible();
	await expect(dialog.locator('iframe')).toHaveAttribute('src', /youtube\.com\/embed\//);
	await dialog.getByRole('button', { name: /cerrar trailer/i }).click();
	await expect(dialog).not.toBeVisible();
});

test('streaming keeps recent catalog uploads even when their original release is older', async ({ page }) => {
	await page.goto('/', { waitUntil: 'domcontentloaded' });

	const carousel = page.locator('[data-cinema-release-carousel="streaming-release-carousel"]');
	const cards = carousel.locator('[data-cinema-release-open]');
	const cardCount = await cards.count();
	expect(cardCount).toBeGreaterThanOrEqual(8);
	expect(cardCount).toBeLessThanOrEqual(12);
	const recentUploadCards = carousel.locator('.cinema-release-carousel__card').filter({ hasText: 'Recién agregada' });
	expect(await recentUploadCards.count()).toBeGreaterThan(0);
	await expect(recentUploadCards.first().locator('.cinema-release-carousel__review-link')).toBeVisible();
});
