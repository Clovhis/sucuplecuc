import { chromium, webkit, devices } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Run against a production build served by scripts/preview-e2e.mjs.
// Instrumentation is confined to this browser session, never shipped to users.
const argument = (key, fallback) => {
  const index = process.argv.indexOf(key);
  return index < 0 ? fallback : process.argv[index + 1] ?? fallback;
};
const baseURL = argument('--url', 'http://127.0.0.1:43210');
const output = argument('--output', 'reports/search-performance.json');
const sizes = argument('--sizes', '2253,5000,10000').split(',').map(Number);
const engines = argument('--engines', 'chromium,webkit').split(',');
const snapshot = argument('--snapshot', '');
const throttle = Number(argument('--throttle', '1'));
const report = { date: '2026-10-04', baseURL, scenarios: [] };

for (const engine of engines) {
  const browser = await (engine === 'webkit' ? webkit : chromium).launch();
  for (const mobile of [false, true]) {
    for (const size of sizes) {
      const context = await browser.newContext(mobile ? devices[engine === 'webkit' ? 'iPhone 13' : 'Pixel 5'] : {});
      await context.route('**/*', async (route) => {
        const url = new URL(route.request().url());
        if (url.origin !== new URL(baseURL).origin) return route.abort();
        if (snapshot && url.pathname.startsWith('/_astro/')) {
          const filename = path.join(snapshot, '_astro', path.basename(url.pathname));
          return route.fulfill({ body: await readFile(filename), contentType: filename.endsWith('.css') ? 'text/css' : 'text/javascript' });
        }
        if (url.pathname !== '/') return route.continue();
        const response = await route.fetch();
        let html = snapshot ? await readFile(path.join(snapshot, 'index.html'), 'utf8') : await response.text();
        html = html.replace('; upgrade-insecure-requests', '');
        // Repeat actual records (same searchable fields) for controlled growth.
        const jsonPattern = /(<script[^>]*data-home-movie-index[^>]*>)([\s\S]*?)(<\/script>)/;
        const jsonMatch = html.match(jsonPattern);
        if (jsonMatch) {
          const source = JSON.parse(jsonMatch[2]);
          const entries = Array.from({ length: size }, (_, i) => ({ ...source[i % source.length], slug: i < source.length ? source[i].slug : `${source[i % source.length].slug}-${i}` }));
          html = html.replace(jsonPattern, (_, start, _json, end) => start + JSON.stringify(entries).replace(/</g, '\\u003c') + end);
        } else {
          const templates = [...html.matchAll(/<template data-movie-card-template[^>]*>[\s\S]*?<\/template>/g)].map((m) => m[0]);
          if (templates.length && size > templates.length + 12) {
            const extra = Array.from({ length: size - templates.length - 12 }, (_, i) => templates[i % templates.length]).join('');
            html = html.replace(templates.at(-1), templates.at(-1) + extra);
          }
        }
        return route.fulfill({ response, status: 200, contentType: 'text/html; charset=utf-8', body: html });
      });
      await context.addInitScript(() => {
        localStorage.setItem('cineposta:donation-dismissed', 'true');
        const stats = window.__searchProfile = { normalize: 0, clones: 0, sorts: [], grids: [], tasks: [], frames: [] };
        const originalNormalize = String.prototype.normalize;
        String.prototype.normalize = function (...args) { stats.normalize++; return originalNormalize.apply(this, args); };
        const originalClone = Node.prototype.cloneNode;
        Node.prototype.cloneNode = function (...args) { stats.clones++; return originalClone.apply(this, args); };
        const originalSort = Array.prototype.sort;
        Array.prototype.sort = function (...args) {
          const start = performance.now();
          const result = originalSort.apply(this, args);
          if (this.length > 6) stats.sorts.push({ size: this.length, ms: performance.now() - start });
          return result;
        };
        const originalReplace = Element.prototype.replaceChildren;
        Element.prototype.replaceChildren = function (...args) {
          const start = performance.now();
          const result = originalReplace.apply(this, args);
          if (this.hasAttribute('data-movie-search-grid')) stats.grids.push({ cards: args.length, ms: performance.now() - start, at: performance.now() });
          return result;
        };
        const originalFrame = window.requestAnimationFrame;
        window.requestAnimationFrame = function (callback) {
          return originalFrame.call(window, (timestamp) => {
            const start = performance.now();
            callback(timestamp);
            const ms = performance.now() - start;
            if (ms > 0.5) stats.frames.push(ms);
          });
        };
        if (PerformanceObserver.supportedEntryTypes.includes('longtask')) {
          new PerformanceObserver((list) => stats.tasks.push(...list.getEntries().map((e) => ({ at: e.startTime, ms: e.duration })))).observe({ type: 'longtask' });
        }
      });
      const page = await context.newPage();
      await page.goto(baseURL, { waitUntil: 'load' });
      const prompt = page.getByRole('button', { name: /Ahora no, entrar al sitio/i });
      if (await prompt.isVisible()) await prompt.click();
      await page.waitForTimeout(1500);
      const initial = await page.evaluate(() => ({
        nodes: document.querySelectorAll('*').length,
        templateNodes: [...document.querySelectorAll('template')].reduce((n, t) => n + t.content.querySelectorAll('*').length, 0),
        cards: document.querySelectorAll('[data-movie-search-grid] [data-movie-card]').length,
      }));
      const scenario = { engine, browserVersion: browser.version(), mobile, size, throttle, initial, queries: [] };
      const cdp = engine === 'chromium' ? await context.newCDPSession(page) : null;
      if (cdp) await cdp.send('Performance.enable');
      if (cdp && throttle !== 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle });
      for (const query of ['a', 'al', 'ali', 'alien', 'bat', 'batman', 'the', 'star', 'res', 'resident evil', '']) {
        const before = cdp ? Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value])) : {};
        await page.evaluate((value) => {
          const stats = window.__searchProfile;
          stats.normalize = 0; stats.clones = 0; stats.sorts = []; stats.grids = []; stats.tasks = []; stats.frames = [];
          stats.started = performance.now();
          const input = document.querySelector('[data-movie-search-input]');
          input.value = value;
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }, query);
        // Wait for the actual query commit before starting another measurement.
        await page.waitForFunction((value) => (new URL(location.href).searchParams.get('q') ?? '') === value, query, { timeout: 30000 });
        await page.waitForTimeout(750);
        const row = await page.evaluate(() => {
          const s = window.__searchProfile;
          return {
            normalize: s.normalize, clones: s.clones, sorts: s.sorts, grids: s.grids.map((g) => ({ cards: g.cards, ms: g.ms, inputToCommitMs: g.at - s.started })),
            longTasks: s.tasks.filter((t) => t.at >= s.started).map((t) => t.ms), filterFramesMs: s.frames,
            nodes: document.querySelectorAll('*').length,
            cards: document.querySelectorAll('[data-movie-search-grid] [data-movie-card]').length,
            searchMeasures: performance.getEntriesByName('cineposta:search').map((m) => m.duration).slice(-1),
          };
        });
        const after = cdp ? Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value])) : {};
        row.cpu = Object.fromEntries(['ScriptDuration', 'LayoutDuration', 'RecalcStyleDuration', 'TaskDuration'].map((key) => [key, cdp ? (after[key] - before[key]) * 1000 : null]));
        scenario.queries.push({ query, ...row });
      }
      report.scenarios.push(scenario);
      await mkdir(new URL('../reports/', import.meta.url), { recursive: true });
      await writeFile(output, JSON.stringify(report, null, 2) + '\n');
      console.log(JSON.stringify({ engine, mobile, size, initial, worstFrameMs: Math.max(...scenario.queries.flatMap((q) => q.filterFramesMs)), longTasks: scenario.queries.flatMap((q) => q.longTasks), maxCards: Math.max(...scenario.queries.map((q) => q.cards)) }));
      await context.close();
    }
  }
  await browser.close();
}
await mkdir(new URL('../reports/', import.meta.url), { recursive: true });
await writeFile(output, JSON.stringify(report, null, 2) + '\n');
