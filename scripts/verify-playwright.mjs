import { chromium, firefox, webkit } from '@playwright/test';
import { existsSync } from 'node:fs';

const browserTypes = [
  ['chromium', chromium],
  ['firefox', firefox],
  ['webkit', webkit],
];

let hasFailure = false;

for (const [name, browserType] of browserTypes) {
  const executablePath = browserType.executablePath();

  if (!existsSync(executablePath)) {
    console.error(`[playwright] ${name}: missing browser executable at ${executablePath}`);
    hasFailure = true;
    continue;
  }

  let browser;

  try {
    browser = await browserType.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.setContent('<main><h1>Playwright ready</h1></main>');
    const text = await page.locator('h1').textContent();

    if (text !== 'Playwright ready') {
      throw new Error(`unexpected smoke page text: ${text}`);
    }

    console.log(`[playwright] ${name}: ready (${executablePath})`);
  } catch (error) {
    hasFailure = true;
    console.error(`[playwright] ${name}: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    await browser?.close();
  }
}

if (hasFailure) {
  console.error('[playwright] Run `npm run playwright:install` and retry `npm run playwright:verify`.');
  process.exit(1);
}
