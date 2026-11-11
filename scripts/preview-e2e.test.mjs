import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { createPreviewServer } from './preview-e2e.mjs';

test('preview caches immutable assets, revalidates changed bytes and never caches or edits HTML', async () => {
  const directory = mkdtempSync(resolve(tmpdir(), 'cineposta-preview-'));
  mkdirSync(resolve(directory, 'assets'));
  const html = '<meta content="default-src self; upgrade-insecure-requests"><h1>Test page</h1>';
  writeFileSync(resolve(directory, 'index.html'), html);
  writeFileSync(resolve(directory, 'assets/font.woff2'), 'original font bytes');
  const server = createPreviewServer({ directory });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = 'http://127.0.0.1:' + server.address().port;
  try {
    const document = await fetch(base + '/');
    assert.equal(document.status, 200);
    assert.equal(document.headers.get('cache-control'), 'no-store');
    assert.doesNotMatch(await document.text(), /upgrade-insecure-requests/);
    assert.equal(readFileSync(resolve(directory, 'index.html'), 'utf8'), html);
    const first = await fetch(base + '/assets/font.woff2');
    const etag = first.headers.get('etag');
    assert.equal(first.headers.get('content-type'), 'font/woff2');
    assert.match(first.headers.get('cache-control'), /max-age=600/);
    assert.equal(await first.text(), 'original font bytes');
    const cached = await fetch(base + '/assets/font.woff2', { headers: { 'if-none-match': etag } });
    assert.equal(cached.status, 304);
    assert.equal(await cached.text(), '');
    writeFileSync(resolve(directory, 'assets/font.woff2'), 'different font bytes');
    const changed = await fetch(base + '/assets/font.woff2', { headers: { 'if-none-match': etag } });
    assert.equal(changed.status, 200);
    assert.notEqual(changed.headers.get('etag'), etag);
    assert.equal(await changed.text(), 'different font bytes');
    const head = await fetch(base + '/assets/font.woff2', { method: 'HEAD' });
    assert.equal(await head.text(), '');
    assert.equal(head.headers.get('content-length'), String(Buffer.byteLength('different font bytes')));
    assert.equal((await fetch(base + '/..%2f..%2foutside')).status, 400);
    assert.equal((await fetch(base + '/%E0%A4%A')).status, 400);
  } finally { await new Promise(resolve => server.close(resolve)); rmSync(directory, { recursive: true, force: true }); }
});
