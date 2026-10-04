import { expect, test, type Page } from '@playwright/test';

const grid = '[data-movie-search-grid]';
const input = '[data-movie-search-input]';
const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

async function openHome(page: Page): Promise<void> {
	await page.goto('/', { waitUntil: 'load' });
	const dismiss = page.getByRole('button', { name: /Ahora no, entrar al sitio/i });
	if (await dismiss.isVisible()) await dismiss.click();
	await expect(page.locator(`${grid} [data-movie-card]`)).toHaveCount(12);
}

test('search preserves matches and relevance while mounting only one small page', async ({ page }) => {
	await openHome(page);
	const records = await page.locator('[data-home-movie-index]').evaluate((script) => JSON.parse(script.textContent ?? '[]') as Array<{ searchable: string; title: string }>);
	for (const query of ['ali', 'alien', 'bat', 'batman', 'the', 'star', 'res', 'resident evil']) {
		await page.locator(input).fill(query);
		const matches = records.filter((entry) => entry.searchable.includes(query));
		await expect(page.locator('[data-home-result-count]')).toHaveText(new Intl.NumberFormat('es-AR').format(matches.length));
		await expect(page.locator(`${grid} [data-movie-card]`)).toHaveCount(Math.min(36, matches.length));
		const titles = await page.locator(`${grid} [data-movie-card]`).evaluateAll((cards) => cards.map((card) => card.getAttribute('data-movie-title')));
		expect(titles.every((title) => matches.some((entry) => entry.title === title))).toBeTruthy();
		const posters = await page.locator(`${grid} [data-movie-poster]`).evaluateAll((images) => images.every((img) => img.hasAttribute('width') && img.hasAttribute('height') && img.getAttribute('decoding') === 'async'));
		expect(posters).toBeTruthy();
	}
	await page.locator(input).fill('Batman');
	await expect(page.locator(`${grid} [data-movie-card]`).first()).toHaveAttribute('data-movie-title', 'Batman');
	await page.locator(input).fill('Amélie');
	await expect(page.locator('[data-home-result-count]')).toHaveText(String(records.filter((entry) => entry.searchable.includes(normalize('Amélie'))).length));
	await expect(page.locator('[data-movie-card-template]')).toHaveCount(0);
});

test('pagination reaches all matches without growing the mounted DOM', async ({ page }) => {
	await openHome(page);
	await page.locator(input).fill('ali');
	await expect(page.locator('[data-home-pagination]')).toBeVisible();
	await page.locator(input).press('Escape');
	const expected = await page.locator('[data-home-movie-index]').evaluate((script) => {
		const records = JSON.parse(script.textContent ?? '[]') as Array<{ searchable: string; url: string }>;
		return records.filter((entry) => entry.searchable.includes('ali')).map((entry) => entry.url).sort();
	});
	const seen: string[] = [];
	const next = page.locator('[data-home-page-next]');
	while (true) {
		const links = await page.locator(`${grid} .movie-card__link`).evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href') ?? ''));
		expect(links.length).toBeLessThanOrEqual(36);
		seen.push(...links);
		if (!await next.isEnabled()) break;
		const oldPage = await page.locator('[data-home-page-summary]').textContent();
		await next.click();
		await expect(page.locator('[data-home-page-summary]')).not.toHaveText(oldPage ?? '');
	}
	await expect(page.locator('[data-home-page-next]')).toBeDisabled();
	expect(seen.sort()).toEqual(expected);
	await page.locator(input).fill('alien');
	await expect(page.locator('[data-home-pagination]')).toBeHidden();
	await page.locator(input).fill('');
	await expect(page.locator(`${grid} [data-movie-card]`)).toHaveCount(12);
});

test('rapid typing, deleting and clearing cancel obsolete queries', async ({ page }) => {
	await openHome(page);
	await page.evaluate(async () => {
		const field = document.querySelector<HTMLInputElement>('[data-movie-search-input]')!;
		for (const value of ['a', 'al', 'ali', 'alie', 'alien', 'alie', 'ali', 'al', 'a', '', 'bat', 'batman']) {
			field.value = value;
			field.dispatchEvent(new Event('input', { bubbles: true }));
			await new Promise((resolve) => setTimeout(resolve, 20));
		}
	});
	await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe('batman');
	await expect(page.locator(`${grid} [data-movie-card]`).first()).toHaveAttribute('data-movie-title', 'Batman');
	await page.locator(input).fill('res');
	await page.locator('[data-movie-search-clear]').click();
	await expect(page.locator(input)).toHaveValue('');
	await expect(page.locator(`${grid} [data-movie-card]`)).toHaveCount(12);
	await page.waitForTimeout(300);
	expect(new URL(page.url()).searchParams.has('q')).toBeFalsy();
	await expect(page.locator('[data-movie-search-dropdown]')).toBeHidden();
});

test('returning from a movie restores its result page without changing URLs', async ({ page }) => {
	await openHome(page);
	await page.locator(input).fill('ali');
	await expect(page.locator('[data-home-pagination]')).toBeVisible();
	await page.locator(input).press('Escape');
	await page.locator('[data-home-page-next]').click();
	await expect(page.locator('[data-home-page-summary]')).toContainText('37–72');
	const summary = await page.locator('[data-home-page-summary]').textContent();
	const link = page.locator(`${grid} .movie-card__link`).first();
	const title = await link.getAttribute('aria-label');
	const url = page.url();
	await link.click();
	await page.getByRole('link', { name: 'Volver', exact: true }).click();
	await expect(page).toHaveURL(url);
	await expect(page.locator('[data-home-page-summary]')).toHaveText(summary ?? '');
	await expect(page.locator(`${grid} .movie-card__link`).first()).toHaveAttribute('aria-label', title ?? '');
});

for (const size of [5000, 10000]) {
	test(`search scales to ${size} records with bounded cards and preprocessed strings`, async ({ page }) => {
		await page.route('**/', async (route) => {
			if (new URL(route.request().url()).pathname !== '/') return route.continue();
			const response = await route.fetch();
			let html = await response.text();
			html = html.replace(/(<script[^>]*data-home-movie-index[^>]*>)([\s\S]*?)(<\/script>)/, (_, start, json, end) => {
				const source = JSON.parse(json);
				return start + JSON.stringify(Array.from({ length: size }, (_, i) => ({ ...source[i % source.length], slug: i < source.length ? source[i].slug : `scale-${i}` }))).replace(/</g, '\\u003c') + end;
			});
			await route.fulfill({ response, body: html });
		});
		await openHome(page);
		await page.evaluate(() => {
			const original = String.prototype.normalize;
			(window as any).__normalizations = 0;
			String.prototype.normalize = function (...args: Parameters<typeof original>) {
				(window as any).__normalizations++;
				return original.apply(this, args);
			};
		});
		await page.locator(input).fill('a');
		await expect(page.locator(`${grid} [data-movie-card]`)).toHaveCount(36);
		await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe('a');
		const metrics = await page.evaluate(() => ({
			normalizations: (window as any).__normalizations as number,
			nodes: document.querySelectorAll('*').length,
			cpu: performance.getEntriesByName('cineposta:search').at(-1)?.duration,
		}));
		// Per-card badge work is bounded; no normalization per record or sort comparison.
		expect(metrics.normalizations).toBeLessThan(500);
		expect(metrics.nodes).toBeLessThan(5000);
		expect(metrics.cpu).toBeDefined();
	});
}
