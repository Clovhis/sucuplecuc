import { readHomeSearchRecords } from './home-search-index';
import { expect, test, type Page } from '@playwright/test';
import type { HomeMovieRecord } from '../../src/types/home-catalog';
import { SEARCH_ACCEPTANCE_CASES, expectedRecords } from '../../scripts/search-acceptance-cases.mjs';

const field = '[data-movie-search-input]';
const cards = '[data-movie-search-grid] [data-movie-card]';

test('acceptance corpus resolves at least fifty independent real-catalog queries', async ({ page }) => {
	test.setTimeout(120_000);
	const records = await openHome(page);
	expect(SEARCH_ACCEPTANCE_CASES.length).toBeGreaterThanOrEqual(50);
	for (const row of SEARCH_ACCEPTANCE_CASES) {
		if ('where' in row) await expectResults(page, row.query, expectedRecords(records, row.where));
		else {
			await page.locator(field).fill(row.query);
			await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe(row.query);
			if ('top' in row) await expect(page.locator(cards).first()).toHaveAttribute('data-movie-url', `/peliculas/${row.top}/`);
			else await expect(page.locator(cards)).toHaveCount(0);
		}
	}
	await expect(page.locator('[data-home-movie-index]')).toHaveText('');
});

test('empty-state recovery preserves the query, and suggestions explain title aliases and tolerate person typos', async ({ page }) => {
	await openHome(page);
	await page.goto('/?q=El%20resplandor&genero=comedia', { waitUntil: 'load' });
	await expect(page.locator('[data-movie-search-root]')).toHaveAttribute('data-home-catalog-ready', 'true');
	await expect(page.locator('[data-movie-search-empty-copy]')).toContainText('filtros manuales');
	await page.getByRole('button', { name: 'Quitar filtros manuales', exact: true }).click();
	await expect(page.locator(field)).toHaveValue('El resplandor');
	await expect(page.locator(cards).first()).toHaveAttribute('data-movie-url', /the-shining-1980/);
	await page.locator(field).focus();
	await page.locator(field).fill('El resplandor ');
	await expect(page.locator('[data-movie-search-suggestions]')).toContainText('También conocida como: el resplandor');
	await page.locator(field).fill('Bradd Pitt');
	await expect(page.locator('[data-movie-search-suggestions]')).toContainText('Brad Pitt');
	await expect(page.locator('[data-movie-search-suggestions]')).toContainText('Persona');
	await page.locator(field).fill('zzzzdesconocidoxxxx');
	await expect(page.locator('[data-movie-search-empty-copy]')).toContainText('título original');
	await page.getByRole('button', { name: 'Editar búsqueda', exact: true }).click();
	await expect(page.locator(field)).toBeFocused();
	await expect(page.locator(field)).toBeInViewport();
});

test('shared queries are bounded and query text never becomes executable markup', async ({ page }) => {
	await openHome(page);
	await page.goto(`/?q=${'z'.repeat(1200)}`, { waitUntil: 'domcontentloaded' });
	await expect(page.locator('[data-movie-search-root]')).toHaveAttribute('data-home-catalog-ready', 'true');
	await expect(page.locator(field)).toHaveValue('z'.repeat(300));
	const payload = '<svg onload="window.searchInjected=true"></svg>';
	await page.locator(field).fill(payload);
	await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe(payload);
	await expect(page.locator('[data-home-active-filters]')).toContainText(payload);
	await expect(page.locator('[data-home-active-filters] svg[onload]')).toHaveCount(0);
	expect(await page.evaluate(() => 'searchInjected' in window)).toBe(false);
});

test('an empty result never exposes its recovery action beneath a pending loading row', async ({ page }) => {
	await page.addInitScript(() => {
		document.addEventListener('DOMContentLoaded', () => {
			const empty = document.querySelector<HTMLElement>('[data-movie-search-empty]');
			const status = document.querySelector<HTMLElement>('[data-movie-search-status]');
			if (!empty || !status) return;
			new MutationObserver(() => {
				if (!empty.hidden && !status.hidden) document.documentElement.dataset.unstableEmptyResult = 'true';
			}).observe(empty, { attributes: true, attributeFilter: ['hidden'] });
		});
	});
	await page.goto('/?q=El%20resplandor&genero=comedia', { waitUntil: 'domcontentloaded' });
	await expect(page.locator('[data-movie-search-root]')).toHaveAttribute('data-home-catalog-ready', 'true');
	await expect(page.getByRole('button', { name: 'Quitar filtros manuales', exact: true })).toBeVisible();
	expect(await page.locator('html').getAttribute('data-unstable-empty-result')).toBeNull();
	await page.getByRole('button', { name: 'Quitar filtros manuales', exact: true }).click();
	await expect(page.locator(cards).first()).toHaveAttribute('data-movie-url', /the-shining-1980/);
});

async function openHome(page: Page): Promise<HomeMovieRecord[]> {
	await page.route('https://www.youtube.com/embed/**', (route) => route.fulfill({ contentType: 'text/html', body: '' }));
	await page.goto('/', { waitUntil: 'load' });
	const dismiss = page.getByRole('button', { name: /Ahora no, entrar al sitio/i });
	if (await dismiss.isVisible()) await dismiss.click();
	await expect(page.locator('[data-movie-search-root]')).toHaveAttribute('data-home-catalog-ready', 'true');
	await expect(page.locator('#movie-search-capability')).toHaveText('Búsqueda inteligente');
	await expect(page.locator('#movie-search-capability')).toBeVisible();
	await expect(page.locator(field)).toHaveAttribute('aria-describedby', /movie-search-capability/);
	return readHomeSearchRecords(page);
}

async function expectResults(page: Page, query: string, expected: HomeMovieRecord[]): Promise<void> {
	await page.locator(field).fill(query);
	await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe(query);
	await expect(page.locator('[data-home-result-count]')).toHaveText(new Intl.NumberFormat('es-AR').format(expected.length));
	await expect(page.locator(cards)).toHaveCount(Math.min(36, expected.length));
	const urls = await page.locator(cards).evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-movie-url')));
	expect(urls.every((url) => expected.some((entry) => entry.url === url))).toBeTruthy();
	if (expected.length <= 36) expect(urls.sort()).toEqual(expected.map((entry) => entry.url).sort());
}

test('real catalog: natural language uses actual directors, decades, platforms and canonical scores', async ({ page }) => {
	const records = await openHome(page);
	const scenarios: Array<[string, (entry: HomeMovieRecord) => boolean]> = [
		['película vieja de Kubrick', (entry) => entry.searchDirector.includes('kubrick') && Number(entry.year) < 2000],
		['terror de los 80', (entry) => entry.primaryGenre === 'terror' && Number(entry.year) >= 1980 && Number(entry.year) <= 1989],
		['Brad Pitt en Netflix', (entry) => entry.searchCast.includes('brad pitt') && entry.platforms.includes('netflix')],
		['ciencia ficción con más de 8 puntos', (entry) => entry.primaryGenre === 'sci-fi' && entry.score !== null && entry.score > 8],
		['terror en Max', (entry) => entry.primaryGenre === 'terror' && entry.platforms.includes('hbo max')],
		['terror de culto', (entry) => entry.primaryGenre === 'terror' && entry.genres.includes('culto')],
	];
	for (const [query, predicate] of scenarios) {
		const expected = records.filter(predicate);
		expect(expected.length, query).toBeGreaterThan(0);
		await expectResults(page, query, expected);
		await expect(page.locator('[data-movie-search-interpretation]')).toBeVisible();
	}
});

test('real catalog: typos, original titles and aliases resolve to the same films', async ({ page }) => {
	const records = await openHome(page);
	await expectResults(page, 'Bradd Pitt en Netflx', records.filter((entry) => entry.searchCast.includes('brad pitt') && entry.platforms.includes('netflix')));
	await expectResults(page, 'película vieja de Kubrik', records.filter((entry) => entry.searchDirector.includes('kubrick') && Number(entry.year) < 2000));
	await expect(page.locator('[data-movie-search-interpretation]')).toContainText('escritura aproximada');
	for (const query of ['The Shining', 'shinnig', 'Paprika detective de los sueños']) {
		await page.locator(field).fill(query);
		await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe(query);
		await expect(page.locator(cards).first()).toHaveAttribute('data-movie-url', query.startsWith('Paprika') ? /paprika-2006/ : /shining/);
	}
	await page.locator(field).fill('2001: Odisea del espacio');
	await expect(page.locator(cards).first()).toHaveAttribute('data-movie-url', /2001/);
	await expect(page.locator('[data-movie-search-interpretation]')).toBeHidden();
});

test('query constraints intersect manual filters, survive reload, and clear without stale state', async ({ page }) => {
	const records = await openHome(page);
	await page.locator('[data-home-advanced-filters] summary').click();
	await page.getByRole('button', { name: /Filtrar por Netflix/i }).click();
	const query = 'terror de los 80';
	const expected = records.filter((entry) => entry.primaryGenre === 'terror' && Number(entry.year) >= 1980 && Number(entry.year) <= 1989 && entry.platforms.includes('netflix'));
	await expectResults(page, query, expected);
	await page.reload({ waitUntil: 'load' });
	await expect(page.locator(field)).toHaveValue(query);
	await expect(page.locator('[data-home-result-count]')).toHaveText(new Intl.NumberFormat('es-AR').format(expected.length));
	await page.getByRole('button', { name: `Quitar Búsqueda: “${query}”`, exact: true }).click();
	await expect(page.locator('[data-movie-search-interpretation]')).toBeHidden();
	await expect(page.locator('[data-home-result-count]')).toHaveText(new Intl.NumberFormat('es-AR').format(records.filter((entry) => entry.platforms.includes('netflix')).length));
	expect(new URL(page.url()).searchParams.get('plataforma')).toBe('netflix');
	await page.locator(field).fill('zzzzdesconocidoxxxx');
	await expect(page.locator('[data-movie-search-empty]')).toBeVisible();
	await expect(page.locator(cards)).toHaveCount(0);
});

test('mobile search stays usable at 320, 390 and 430px with bounded DOM and no horizontal overflow', async ({ page }, testInfo) => {
	test.skip(!testInfo.project.name.startsWith('mobile-'), 'Mobile layout assertion');
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await openHome(page);
	const metrics: unknown[] = [];
	for (const width of [320, 390, 430]) {
		await page.setViewportSize({ width, height: 844 });
		await page.locator(field).fill(`terror de los 80${width === 390 ? ' en Max' : ''}`);
		await page.locator(field).press('Escape');
		await expect(page.locator('[data-movie-search-interpretation]')).toBeVisible();
		const measurement = await page.evaluate(() => ({
			width: window.innerWidth,
			contentWidth: document.documentElement.scrollWidth,
			cards: document.querySelectorAll('[data-movie-search-grid] [data-movie-card]').length,
			cpuMs: performance.getEntriesByName('cineposta:search').at(-1)?.duration,
			inputHeight: document.querySelector('[data-movie-search-input]')!.getBoundingClientRect().height,
			capabilityRight: document.querySelector('#movie-search-capability')!.getBoundingClientRect().right,
		}));
		expect(measurement.contentWidth).toBeLessThanOrEqual(width);
		expect(measurement.cards).toBeLessThanOrEqual(36);
		expect(measurement.inputHeight).toBeGreaterThanOrEqual(44);
		expect(measurement.capabilityRight).toBeLessThanOrEqual(width);
		metrics.push(measurement);
		await page.locator(field).scrollIntoViewIfNeeded();
		await page.screenshot({ path: testInfo.outputPath(`intelligent-search-${width}.png`), scale: 'css' });
	}
	expect(errors).toEqual([]);
	await testInfo.attach('mobile-search-metrics', { body: JSON.stringify(metrics, null, 2), contentType: 'application/json' });
});


test('character searches reuse the catalog index and show the matching credit', async ({ page }) => {
 await page.route('**/search-index-v3.json*', async (route) => {
  const response = await route.fetch();
  const payload = await response.json();
  expect(payload.version).toBe(3);
  payload.movies[0][8] = [{ actor: 'Actor de prueba', character: 'Zorblax Personaje', variants: ['Zorblax'] }];
  await route.fulfill({ response, json: payload });
 });
 await page.goto('/');
 await expect(page.locator('[data-movie-search-root]')).toHaveAttribute('data-home-catalog-ready', 'true');
 await page.locator(field).fill('películas con Zorblax');
 await expect(page.locator(cards)).toHaveCount(1);
 await expect(page.locator('[data-movie-search-suggestions]')).toContainText('Zorblax Personaje · Actor de prueba');
 await page.locator(field).press('Escape');
 await expect(page.locator(`${cards} [data-character-match]`)).toHaveText('Zorblax Personaje · Actor de prueba');
 await page.locator(field).fill('Zorblax Personaje');
 await expect(page.locator(cards)).toHaveCount(1);
});

test('verified characters in the real catalog find their films and actors', async ({ page }) => {
 const records = await openHome(page);
 const scenarios = [
  { query: 'Legolas', slug: 'the-lord-of-the-rings-the-fellowship-of-the-ring-2001', actor: 'Orlando Bloom' },
  { query: 'Frodo Bolsón', slug: 'the-lord-of-the-rings-the-fellowship-of-the-ring-2001', actor: 'Elijah Wood' },
  { query: 'películas con Gandalf', slug: 'the-lord-of-the-rings-the-fellowship-of-the-ring-2001', actor: 'Ian McKellen' },
  { query: 'Jack Sparrow', slug: 'pirates-of-the-caribbean-the-curse-of-the-black-pearl-2003', actor: 'Johnny Depp' },
  { query: 'Tony Stark', slug: 'iron-man-2008', actor: 'Robert Downey Jr.' },
 ];
 for (const { slug } of scenarios) expect(records.find((record) => record.slug === slug)?.searchCharacters?.length, slug).toBeGreaterThan(0);
 for (const { query, slug, actor } of scenarios) {
  await page.locator(field).fill(query);
  const card = page.locator(cards).filter({ has: page.locator(`a[href="/peliculas/${slug}/"]`) });
  await expect(card).toBeVisible();
  await expect(card.locator('[data-character-match]')).toContainText(actor);
 }
});
