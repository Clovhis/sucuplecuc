import { chromium, webkit } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';

const phase = process.argv[2] ?? 'after';
const base = 'http://127.0.0.1:43210';
const dir = process.argv[3] ?? 'reports/que-miro-hoy-visual-2026-10-10';
const evidence = [];
for (const [engine, browserType] of [['chromium', chromium], ...(phase === 'after' ? [['webkit', webkit]] : [])]) {
  const browser = await browserType.launch();
  for (const [name, width, height] of [['desktop', 1440, 1000], ['tablet', 768, 1024], ['mobile', 390, 844], ...(phase === 'after' ? [['narrow', 320, 800]] : [])]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${base}/que-miro-hoy/`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { level: 1, name: '¿Qué vemos hoy?' }).waitFor();
    if (phase === 'prototype') {
      await page.evaluate(() => document.body.classList.add('postometro-edition'));
      await page.addStyleTag({ content: readFileSync('src/styles/postometro.css', 'utf8') });
    }
    await Promise.race([page.evaluate(() => document.fonts.ready), page.waitForTimeout(4000)]);
    await page.locator('.postometro-empty__art img').waitFor();
    await page.waitForFunction(() => [...document.querySelectorAll('.postometro-hero__art img, .postometro-empty__art img')].every(img => img.complete && img.naturalWidth > 0));
    await page.evaluate(() => Promise.all([...document.querySelectorAll('.postometro-hero__art img, .postometro-empty__art img')].map(img => img.decode())));
    await page.screenshot({ path: `${dir}/${phase}-${engine}-${name}.png`, fullPage: true, timeout: 15000 });
    const measure = () => page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      illustrations: [...document.querySelectorAll('.postometro-hero__art img, .postometro-empty__art img')].map(img => {
        const box = img.getBoundingClientRect();
        const frame = img.closest('figure').getBoundingClientRect();
        const section = img.closest('section').getBoundingClientRect();
        return { src: img.getAttribute('src'), loaded: img.complete && img.naturalWidth > 0,
          visible: box.width > 0 && box.height > 0, ratio: box.width / box.height,
          naturalRatio: img.naturalWidth / img.naturalHeight,
          objectFit: getComputedStyle(img).objectFit,
          contained: box.left >= section.left - 1 && box.right <= section.right + 1 && box.top >= section.top - 1 && box.bottom <= section.bottom + 1,
          inFrame: box.left >= frame.left - 1 && box.right <= frame.right + 1 && box.top >= frame.top - 1 && box.bottom <= frame.bottom + 1,
        };
      }),
    }));
    const initial = await measure();
    if (phase === 'after') {
      if (initial.overflow || initial.illustrations.some(img => !img.loaded || !img.visible || !img.contained || !img.inFrame || Math.abs(img.ratio - img.naturalRatio) > .01)) throw new Error(`Illustration layout failed: ${engine} ${name} ${JSON.stringify(initial)}`);
      await page.locator('.postometro-hero').screenshot({ path: `${dir}/hero-${engine}-${name}.png` });
      await page.locator('[data-postometro-form]').screenshot({ path: `${dir}/form-${engine}-${name}.png` });
      await page.locator('.postometro-empty--idle').screenshot({ path: `${dir}/idle-${engine}-${name}.png` });
      await page.locator('input[name="mood"][value="tension"]').check({ force: true });
      await page.locator('input[name="company"][value="pareja"]').check({ force: true });
      await page.locator('input[name="time"][value="sin-reloj"]').check({ force: true });
      await page.locator('input[name="intensity"][value="intensa"]').check({ force: true });
      await page.getByLabel('¿De qué época?').selectOption('modernas');
      await page.getByLabel('¿Dónde la querés ver?').selectOption({ label: 'Netflix' });
      await page.getByRole('button', { name: 'Recomendame una película' }).click();
      await page.locator('[data-postometro-loading]').waitFor();
      await page.locator('[data-postometro-results]').screenshot({ path: `${dir}/loading-${engine}-${name}.png` });
      await page.locator('[data-postometro-primary]').waitFor({ timeout: 6000 });
      await page.waitForFunction(() => {
        const img = document.querySelector('.postometro-pick__poster');
        return img?.complete && img.naturalWidth > 0;
      });
      await page.screenshot({ path: `${dir}/result-${engine}-${name}.png`, fullPage: true });
      await page.locator('[data-postometro-results]').screenshot({ path: `${dir}/result-detail-${engine}-${name}.png` });
      const first = await page.locator('[data-postometro-primary]').getAttribute('data-postometro-primary-slug');
      await page.getByRole('button', { name: 'Tirame otra del mismo palo' }).click();
      await page.locator('[data-postometro-primary]').waitFor({ timeout: 6000 });
      const next = await page.locator('[data-postometro-primary]').getAttribute('data-postometro-primary-slug');
      if (first === next) throw new Error('Reroll did not change recommendation');
      await page.getByRole('button', { name: 'Ya la vi', exact: true }).click();
      await page.locator('[data-postometro-primary]').waitFor({ timeout: 6000 });
      const href = await page.getByRole('link', { name: 'Ver ficha completa' }).getAttribute('href');
      if ((await page.request.get(`${base}${href}`)).status() !== 200) throw new Error('Movie link failed');
      if ((await measure()).overflow) throw new Error('Result overflows viewport');
      await page.getByRole('button', { name: 'Arrancar de nuevo' }).click();
      await page.locator('.postometro-empty__art img').waitFor();
      const reset = await measure();
      if (reset.illustrations.some(img => !img.visible || !img.contained)) throw new Error('Reset illustration failed');
      if (errors.length) throw new Error(`Browser errors: ${errors.join('; ')}`);
      evidence.push({ engine, name, width, initial, reset, first, next, href, errors });
    }
    console.log(`${phase}: ${engine} ${name}`);
    if (phase === 'before' && name === 'desktop') {
      await page.goto(base, { waitUntil: 'domcontentloaded' });
      await page.locator('.home-discovery').waitFor();
      await page.screenshot({ path: `${dir}/home-reference.png`, fullPage: true });
    }
    await page.close();
  }
  await browser.close();
}
if (phase === 'after') writeFileSync(`${dir}/visual-flow-evidence.json`, JSON.stringify(evidence, null, 2));
