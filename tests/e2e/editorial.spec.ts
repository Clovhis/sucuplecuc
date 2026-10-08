import { test, expect, type Page } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import residentEvil from '../../src/data/editorials/resident-evil-noche-cero-la-veria-99-veces.json' with { type: 'json' };
import miasma from '../../src/data/editorials/campamento-miasma-si-venis-por-jason-preparate-para-el-delirio.json' with { type: 'json' };
import colony from '../../src/data/editorials/colony-zona-cero-me-gusto-pero-no-me-volo-la-peluca.json' with { type: 'json' };
import cancelados from '../../src/data/editorials/cancelados-por-hollywood-estrellas-cima-exilio.json' with { type: 'json' };
import insaciable from '../../src/data/editorials/insaciable-body-horror-en-modo-facil.json' with { type: 'json' };
import offni from '../../src/data/editorials/offni-cine-fest-2026-cine-fantastico-gratis-en-caba.json' with { type: 'json' };
import estrella from '../../src/data/editorials/la-estrella-que-perdi-premios-antares-2026-mirta-busnelli.json' with { type: 'json' };
import calm from '../../src/data/editorials/calm-horacio-quiroga-animacion-sitges-2026.json' with { type: 'json' };

const editorialDirectory = new URL('../../src/data/editorials/', import.meta.url);
const publications = readdirSync(editorialDirectory).filter(file => file.endsWith('.json')).map(file =>
  JSON.parse(readFileSync(new URL(file, editorialDirectory), 'utf8')) as { slug: string; date: string; title: string },
).sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));

async function openEditorialIndex(page: Page): Promise<void> {
  const link = page.getByRole('region', { name: 'Desde CinePosta' }).getByRole('link', { name: 'Todas las publicaciones' });
  await link.scrollIntoViewIfNeeded();
  // WebKit can hit-test the previous painted position immediately after a large
  // programmatic scroll. Let that scroll paint before pressing the actual link.
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await link.click();
  await expect(page).toHaveURL(/\/editorial\/$/);
}

for (const entry of [offni, estrella, calm]) {
  test(`${entry.slug}: news sources, SEO and responsive images remain available from home and archive`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    const path = `/editorial/${entry.slug}/`;
    const minutes = Math.ceil(entry.content.flatMap(block => block.type === 'paragraph' && block.text ? block.text.split(/\s+/u) : []).length / 220);
    await page.goto('/');
    const card = page.getByRole('region', { name: 'Desde CinePosta' }).locator('.editorial-card').filter({ hasText: entry.title });
    await expect(card).toBeVisible();
    await card.getByRole('link').click();
    await expect(page).toHaveURL(path);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(entry.title);
    await expect(page.locator('time')).toHaveAttribute('datetime', entry.date);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.cineposta.com.ar${path}`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', entry.excerpt);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', `https://www.cineposta.com.ar/${entry.cover.src}`);
    const schema = JSON.parse((await page.locator('script[type="application/ld+json"]').first().textContent())!);
    expect(schema).toMatchObject({ '@type': 'Article', headline: entry.title, datePublished: entry.date, articleSection: 'nota', timeRequired: `PT${minutes}M` });
    const sources = page.getByRole('complementary', { name: 'Fuentes consultadas' });
    await expect(sources.getByRole('link')).toHaveCount(entry.sources.length);
    for (const source of entry.sources) {
      await expect(sources.getByRole('link', { name: source.label })).toHaveAttribute('href', source.url);
    }
    for (const figure of await page.locator('.editorial-body figure').all()) {
      await figure.scrollIntoViewIfNeeded();
      const image = figure.locator('img');
      await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
      await expect(image).toHaveAttribute('srcset', /640w/);
      await expect(figure.getByRole('link', { name: 'Fuente de la imagen' })).toHaveAttribute('href', /^https:\/\//);
      expect(await image.evaluate((node: HTMLImageElement) => Math.abs(node.width / node.height - node.naturalWidth / node.naturalHeight))).toBeLessThan(.03);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: testInfo.outputPath('news-viewport.png'), scale: 'css' });
    await page.screenshot({ path: testInfo.outputPath('news-full.png'), fullPage: true, scale: 'css' });
    await page.setViewportSize({ width: 320, height: 760 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('news-320-viewport.png'), scale: 'css' });
    await page.screenshot({ path: testInfo.outputPath('news-320-full.png'), fullPage: true, scale: 'css' });
    await page.getByRole('link', { name: 'Volver a Editorial CinePosta' }).click();
    await expect(page).toHaveURL('/editorial/');
    const archived = page.locator('.editorial-card').filter({ hasText: entry.title });
    await expect(archived.getByText(`${minutes} min de lectura`)).toBeVisible();
    await archived.getByRole('link').click();
    await expect(page).toHaveURL(path);
    expect(errors).toEqual([]);
  });
}

test('story cards navigate by keyboard, fit narrow screens and link to the complete archive in date order', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  const home = page.getByRole('region', { name: 'Desde CinePosta' });
  const cards = home.locator('.editorial-card');
  await expect(cards).toHaveCount(Math.min(6, publications.length));
  const archiveLink = home.getByRole('link', { name: 'Todas las publicaciones' });
  await expect(archiveLink).toHaveAttribute('href', '/editorial/');
  for (const card of await cards.all()) {
    await card.scrollIntoViewIfNeeded();
    const image = card.locator('.editorial-card__cover');
    await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
    await expect(card.getByText('Leer nota')).toBeVisible();
  }
  await home.screenshot({ path: testInfo.outputPath('stories-home.png') });
  const firstLink = cards.first().getByRole('link');
  const firstHref = await firstLink.getAttribute('href');
  await firstLink.focus();
  await expect(firstLink).toBeFocused();
  expect(await firstLink.evaluate(node => getComputedStyle(node).outlineStyle)).toBe('solid');
  await firstLink.press('Enter');
  await expect(page).toHaveURL(firstHref!);

  await page.goto('/');
  await page.setViewportSize({ width: 320, height: 760 });
  await home.scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  for (const card of await cards.all()) {
    const box = await card.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(320);
  }
  await home.screenshot({ path: testInfo.outputPath('stories-home-320.png') });
  await openEditorialIndex(page);
  await expect(page.locator('.editorial-card')).toHaveCount(publications.length);
  expect(await page.locator('.editorial-card time').evaluateAll(nodes => nodes.map(node => node.getAttribute('datetime'))))
    .toEqual(publications.map(entry => entry.date));
  expect(await page.locator('.editorial-card > a').evaluateAll(nodes => nodes.map(node => node.getAttribute('href'))))
    .toEqual(publications.map(entry => `/editorial/${entry.slug}/`));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.locator('.editorial-index').screenshot({ path: testInfo.outputPath('stories-archive-320.png') });
  expect(errors).toEqual([]);
});

for (const { entry, movieTitle, featured, sourcePattern } of [
  { entry: residentEvil, movieTitle: 'Resident Evil: Noche Cero', featured: false, sourcePattern: /^https:\/\/residentevil\.movie\// },
  { entry: miasma, movieTitle: 'Adolescencia, sexo y muerte en Campamento Miasma', featured: true, sourcePattern: /^https:\/\/(trailers\.mubicdn\.net|www\.steinbrennermueller\.de)\// },
  { entry: colony, movieTitle: 'Colony: Zona Cero', featured: false, sourcePattern: /^https:\/\/wellgousa\.com\// },
  { entry: insaciable, movieTitle: 'Insaciable', featured: true, sourcePattern: /^https:\/\/www\.independentfilmco\.com\/films\/saccharine$/ },
]) {
  const path = `/editorial/${entry.slug}/`;

  test(`${entry.slug}: editorial connects home, index and movie without replacing its review`, async ({ page }) => {
    await page.goto('/');
    const home = page.getByRole('region', { name: 'Desde CinePosta' });
    await expect(home.locator('.editorial-card')).toHaveCount(Math.min(6, publications.length));
    if (featured) await expect(home.getByRole('heading', { name: entry.title })).toBeVisible();
    await openEditorialIndex(page);
    const indexedEntry = page.locator('.editorial-card').filter({ hasText: entry.title });
    await expect(indexedEntry.getByText('5 min de lectura')).toBeVisible();
    await page.getByRole('heading', { name: entry.title }).click();
    await expect(page).toHaveURL(path);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(entry.title);
    await expect(page.locator('time')).toHaveAttribute('datetime', entry.date);
    await page.getByRole('link', { name: `Ver ficha de ${movieTitle}` }).click();
    await expect(page).toHaveURL(`/peliculas/${entry.movieSlug}/`);
    await expect(page.getByRole('region', { name: 'Reseña honesta' })).toBeVisible();
    const linked = page.getByRole('complementary', { name: 'Editorial CinePosta' });
    await expect(linked.getByRole('heading')).toHaveText(entry.title);
    await linked.getByRole('link', { name: 'Leer editorial' }).click();
    await expect(page).toHaveURL(path);
  });

  test(`${entry.slug}: editorial images decode, remain interleaved and fit a narrow screen`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(path);
    const figures = page.locator('.editorial-body figure');
    const expectedBodyImageCount = entry.content.filter(block => block.type === 'image').length;
    await expect(figures).toHaveCount(expectedBodyImageCount);
    for (const figure of await figures.all()) {
      await figure.scrollIntoViewIfNeeded();
      const image = figure.locator('img');
      // naturalWidth is density-corrected for srcset, especially on mobile DPRs.
      await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
      await expect(image).toHaveAttribute('loading', 'lazy');
      await expect(image).toHaveAttribute('srcset', /640w/);
      expect(await image.evaluate((node: HTMLImageElement) => Math.abs(node.width / node.height - node.naturalWidth / node.naturalHeight))).toBeLessThan(.03);
      expect(await figure.evaluate(node => node.previousElementSibling?.tagName)).toBe('P');
      expect(await figure.evaluate(node => node.nextElementSibling?.tagName)).toBe('P');
      await expect(figure.getByRole('link', { name: 'Fuente de la imagen' })).toHaveAttribute('href', sourcePattern);
    }
    await page.screenshot({ path: testInfo.outputPath('editorial-full.png'), fullPage: true });
    await page.setViewportSize({ width: 320, height: 760 });
    await page.evaluate(() => window.scrollTo(0, 0));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('editorial-320.png'), fullPage: true });
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.cineposta.com.ar${path}`);
    const schema = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(JSON.parse(schema!).timeRequired).toBe('PT5M');
    expect(errors).toEqual([]);
  });
}

const canceladosPath = `/editorial/${cancelados.slug}/`;
const actorCases = [
  'Kevin Spacey', 'Johnny Depp', 'Amber Heard', 'Ezra Miller', 'Jonathan Majors', 'Armie Hammer',
  'Mel Gibson', 'Gina Carano', 'James Franco', 'Shia LaBeouf', 'Danny Masterson', 'Will Smith',
];
const expectedMinutes = Math.max(1, Math.ceil(
  cancelados.content.flatMap(block => block.type === 'paragraph' && typeof block.text === 'string' ? block.text.split(/\s+/u) : []).length / 220,
));
const expectedBios = ['kevin-spacey', 'johnny-depp', 'mel-gibson', 'james-franco', 'will-smith'];

test(`${cancelados.slug}: note, internal biographies, SEO and images render on desktop and mobile`, async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));

  await page.goto('/');
  const home = page.getByRole('region', { name: 'Desde CinePosta' });
  const homeCard = home.locator('.editorial-card').filter({ hasText: cancelados.title });
  await expect(homeCard).toBeVisible();
  await openEditorialIndex(page);
  const indexCard = page.locator('.editorial-card').filter({ hasText: cancelados.title });
  await expect(indexCard.getByText(`${expectedMinutes} min de lectura`)).toBeVisible();
  await indexCard.getByRole('heading', { name: cancelados.title }).click();
  await expect(page).toHaveURL(canceladosPath);

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(cancelados.title);
  await expect(page.locator('time')).toHaveAttribute('datetime', cancelados.date);
  await expect(page.locator('.editorial-body h2').first()).toHaveText(actorCases[0]);
  await expect(page.locator('.editorial-body h2').nth(11)).toHaveText(actorCases[11]);
  await expect(page.locator('.editorial-body h2')).toHaveCount(13);

  const bioLinks = page.locator('.editorial-body__bio a');
  await expect(bioLinks).toHaveCount(expectedBios.length);
  const hrefs = await bioLinks.evaluateAll(links => links.map(link => (link as HTMLAnchorElement).getAttribute('href')));
  expect(hrefs).toEqual(expectedBios.map(slug => expect.stringMatching(new RegExp(`/personas/${slug}/$`))));
  for (const href of hrefs) {
    const response = await page.request.get(new URL(href!, page.url()).toString());
    expect(response.ok()).toBe(true);
  }

  const figures = page.locator('.editorial-body figure');
  await expect(figures).toHaveCount(11);
  for (const figure of await figures.all()) {
    await figure.scrollIntoViewIfNeeded();
    const image = figure.locator('img');
    await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
    await expect(figure.getByRole('link', { name: 'Fuente de la imagen' })).toHaveAttribute('href', /^https:\/\//);
    expect(await image.evaluate((node: HTMLImageElement) => Math.abs(node.width / node.height - node.naturalWidth / node.naturalHeight))).toBeLessThan(.03);
  }
  await expect(page.locator('.editorial-body figure a', { hasText: 'Licencia de uso' })).toHaveCount(3);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.cineposta.com.ar${canceladosPath}`);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', new RegExp(cancelados.title));
  const schema = await page.locator('script[type="application/ld+json"]').first().textContent();
  expect(JSON.parse(schema!).timeRequired).toBe(`PT${expectedMinutes}M`);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath('cancelados-desktop-viewport.png') });
  await page.screenshot({ path: testInfo.outputPath('cancelados-desktop.png'), fullPage: true, scale: 'css' });

  await page.setViewportSize({ width: 320, height: 760 });
  await page.evaluate(() => window.scrollTo(0, 0));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('cancelados-mobile-320-viewport.png') });
  await page.screenshot({ path: testInfo.outputPath('cancelados-mobile-320.png'), fullPage: true, scale: 'css' });
  expect(errors).toEqual([]);
});
