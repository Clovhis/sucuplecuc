import { existsSync, lstatSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJsonDirectory } from './lib/daily-editorial-policy.mjs';
import { snapshotEditorialAssets, validateStoredEditorialReview } from './lib/editorial-quality.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const legacy = JSON.parse(readFileSync(resolve(root, 'config/editorial-review-legacy.json'), 'utf8'));
const directory = resolve(root, 'reports/daily-editorial');
let reviewed = 0, historical = 0;
for (const receipt of existsSync(directory) ? readJsonDirectory(directory) : []) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(receipt.slug || '')) throw new Error('Slug de recibo diario inválido.');
  const note = JSON.parse(readFileSync(resolve(root, `src/data/editorials/${receipt.slug}.json`), 'utf8'));
  const assets = receipt.editorialReview ? snapshotEditorialAssets(note, path => {
    const file = resolve(root, 'public', path);
    if (!lstatSync(file).isFile()) throw new Error('Asset publicado no regular.');
    return readFileSync(file);
  }) : {};
  if (validateStoredEditorialReview(receipt, note, assets, legacy) === 'reviewed') reviewed++;
  else historical++;
}
console.log(`Editorial review receipts: ${reviewed} reviewed, ${historical} explicit historical exceptions (not retrospectively approved).`);
