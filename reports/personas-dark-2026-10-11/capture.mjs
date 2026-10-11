import { chromium, webkit } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const phase = process.argv[2] ?? 'after';
const baseURL = process.argv[3] ?? 'http://127.0.0.1:43211';
const directory = new URL(`./${phase}/`, import.meta.url);
await mkdir(directory, { recursive: true });
const evidence = [];
for (const [engine, browserType] of Object.entries({ chromium, webkit })) {
  const browser = await browserType.launch();
  for (const [view, width] of Object.entries({ desktop: 1440, tablet: 768, mobile: 390, narrow: 320 })) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${baseURL}/personas/`);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: new URL(`hero-${engine}-${view}.png`, directory).pathname.replace(/^\/(\w:)/, '$1') });
    const card = page.locator('[data-person-row]').first();
    await card.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => {
      const image = document.querySelector('[data-person-row] img');
      return image.complete && image.naturalWidth > 0;
    });
    await page.screenshot({ path: new URL(`cards-${engine}-${view}.png`, directory).pathname.replace(/^\/(\w:)/, '$1') });
    await card.screenshot({ path: new URL(`aaron-${engine}-${view}.png`, directory).pathname.replace(/^\/(\w:)/, '$1') });
    await page.locator('[data-people-filter-toggle]').click();
    await page.locator('.people-index__toolbar').screenshot({ path: new URL(`filters-${engine}-${view}.png`, directory).pathname.replace(/^\/(\w:)/, '$1') });
    evidence.push({ engine, view, width, errors, ...await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      overflowing: [...document.querySelectorAll('*')].map(element => {
        const bounds = element.getBoundingClientRect();
        return { tag: element.tagName, class: element.className, left: bounds.left, right: bounds.right, width: bounds.width };
      }).filter(element => element.width > 0 && (element.left < -.1 || element.right > innerWidth + .1)).slice(0, 20),
      profiles: document.querySelectorAll('[data-person-row]').length,
      background: getComputedStyle(document.body).backgroundColor,
      cardBackground: getComputedStyle(document.querySelector('.people-index__row-link')).backgroundColor,
    })) });
    await page.close();
  }
  await browser.close();
}
await writeFile(new URL('evidence.json', directory), JSON.stringify(evidence, null, 2));
console.log(JSON.stringify(evidence));
