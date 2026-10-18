import { expect, test } from '@playwright/test';

test('unavailable rating API disables all ten choices', async ({ page }) => {
	await page.route('**/rest/v1/**', route => route.fulfill({ status: 503, json: { message: 'Unavailable' } }));
	await page.goto('/peliculas/akira-1988/');
	const widget = page.locator('[data-rating-widget]');
	await expect(widget.locator('[data-rating-status]')).toHaveText('No se pudo cargar el rating ahora.');
	await expect(widget.getByRole('button')).toHaveCount(10);
	for (const button of await widget.getByRole('button').all()) await expect(button).toBeDisabled();
});

test('failed submission preserves the previous vote and allows retrying', async ({ page }) => {
	await page.route('**/rest/v1/**', async route => {
		const url = route.request().url();
		if (url.includes('submit_movie_rating_v2')) await route.fulfill({ status: 503, json: { message: 'Unavailable' } });
		else if (url.includes('get_movie_rating_v2')) await route.fulfill({ json: { rating: 6 } });
		else if (url.includes('movie_rating_stats_v2')) await route.fulfill({ json: { avg_rating: 6, vote_count: 1 } });
		else await route.continue();
	});
	await page.goto('/peliculas/akira-1988/');
	const widget = page.locator('[data-rating-widget]');
	await expect(widget.locator('[data-rating-status]')).toHaveText('Tu voto: 6/10');
	await widget.getByRole('button', { name: '10 de 10', exact: true }).click();
	await expect(widget.locator('[data-rating-status]')).toHaveText('No se pudo guardar tu voto.');
	await expect(widget.getByRole('button', { pressed: true })).toHaveText('6');
	await expect(widget.getByRole('button', { name: '10 de 10', exact: true })).toBeEnabled();
});
