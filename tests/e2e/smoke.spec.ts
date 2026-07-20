import { expect, test } from '@playwright/test';

test('donation invitation is visible without blocking navigation', async ({ page }) => {
  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });

  expect(response?.ok()).toBeTruthy();

	const prompt = page.getByRole('complementary', { name: /Apoyá a Cine Posta/i });
  await expect(prompt).toBeVisible();
  await expect(
		prompt.getByRole('link', { name: /Apoyá con un cafecito/i }),
	).toHaveAttribute('href', 'https://cafecito.app/cineposta');
	await expect(page.getByRole('dialog')).toHaveCount(0);
	await expect(page.getByRole('link', { name: /^Ver detalle de/i }).first()).toBeVisible();
});

test('home page renders the catalog shell', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });

  expect(response?.ok()).toBeTruthy();
  await expect(page).toHaveTitle(/Cine|Posta/i);
  await expect(page.locator('body')).toBeVisible();
	await expect(page.getByRole('heading', { name: '¿Qué somos?' })).toBeVisible();
	await expect(page.locator('.home-welcome__copy')).toContainText('No alojamos películas, torrents, descargas ni enlaces piratas');
	await expect(page.getByRole('link', { name: /Conocé cómo funciona/i })).toHaveAttribute('href', '/sobre-cine-posta/');
  await expect(page.getByRole('link', { name: /^Ver detalle de/i }).first()).toBeVisible();

  const bodyText = await page.locator('body').innerText();
  expect(bodyText.length).toBeGreaterThan(1000);
	expect(pageErrors).toEqual([]);
});

test('home reserves the final four initial cards for the latest catalog loads', async ({ page }) => {
	await page.goto('/', { waitUntil: 'domcontentloaded' });

	const initialTitles = await page.locator('[data-movie-search-grid] [data-movie-card]').evaluateAll((cards) =>
		cards.map((card) => card.getAttribute('data-movie-title')),
	);

	expect(initialTitles).toHaveLength(12);
	expect(initialTitles.slice(-4)).toEqual([
		'Undertone Frecuencia Maldita',
		'Christy (El combate de su vida)',
		'Boulevard',
		'In the Hand of Dante',
	]);
	expect(new Set(initialTitles).size).toBe(initialTitles.length);
});

test('movie detail page renders a known title', async ({ page }) => {
  const response = await page.goto('/peliculas/akira-1988/', { waitUntil: 'domcontentloaded' });

  expect(response?.ok()).toBeTruthy();
  await expect(page.getByRole('heading', { name: /akira/i }).first()).toBeVisible();
  await expect(page.locator('body')).toContainText(/Akira/i);
});

test('movie detail reaction follows the editorial verdict', async ({ page }) => {
	const cases = [
		{ path: '/peliculas/akira-1988/', label: 'Mirala', art: /recomendada-/ },
		{ path: '/peliculas/1941-1979/', label: 'Zafa', art: /zafa-/ },
		{ path: '/peliculas/a-minecraft-movie-2025/', label: 'Mejor pasá', art: /no-recomendada-/ },
	];

	for (const reaction of cases) {
		const response = await page.goto(reaction.path, { waitUntil: 'domcontentloaded' });
		expect(response?.ok()).toBeTruthy();

		const card = page.locator('.movie-reaction');
		await expect(card.getByRole('heading', { name: reaction.label })).toBeVisible();
		await expect(card.locator('img')).toHaveAttribute('src', reaction.art);
	}
});

test('movie reaction follows the review and the featured cast', async ({ page }) => {
	await page.goto('/peliculas/la-odisea-2026/', { waitUntil: 'domcontentloaded' });

	const readingOrder = await page.locator('.movie-detail__panel').evaluate((panel) =>
		Array.from(panel.querySelectorAll('.movie-detail__review-card, .movie-detail__people-panel, .movie-reaction')).map((element) =>
			element.className,
		),
	);

	expect(readingOrder).toEqual([
		'movie-detail__review-card',
		'movie-detail__people-panel',
		'movie-reaction movie-reaction--up',
	]);
});

test('trailers play in the canonical movie page only after interaction', async ({ page }) => {
  await page.goto('/peliculas/akira-1988/', { waitUntil: 'domcontentloaded' });

  const player = page.locator('[data-trailer-player]');
  await expect(player).toBeVisible();
  await expect(player.locator('iframe')).toHaveCount(0);
	const structuredData = await page.locator('script[type="application/ld+json"]').allTextContents();
	expect(structuredData.join('\n')).not.toContain('VideoObject');

  await player.getByRole('button', { name: /reproducir trailer de akira/i }).click();
  await expect(player.locator('iframe')).toHaveAttribute('src', /youtube\.com\/embed\//);
});

test('legacy trailer routes are noindex recovery pages', async ({ page }) => {
  await page.goto('/trailers/akira-1988/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex, follow/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://www.cineposta.com.ar/peliculas/akira-1988/',
  );
  await expect(page.locator('script[src*="adsbygoogle"]')).toHaveCount(0);
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /ir a la ficha de akira/i })).toHaveAttribute(
    'href',
    '/peliculas/akira-1988/',
  );
});
