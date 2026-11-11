import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createValidatedBuildCatalog } from '../src/lib/validated-build-catalog.ts';

test('build catalog validates once per day/module and cannot be mutated by a caller', () => {
  let loads = 0, checks = 0;
  const load = () => { loads++; return [{ slug: 'film', cast: ['Actor'], nested: { checked: true } }]; };
  const validate = items => { checks++; assert.equal(items[0].slug, 'film'); };
  const catalog = createValidatedBuildCatalog(load, validate);
  const first = catalog('2026-11-14');
  first.pop();
  const second = catalog('2026-11-14');
  assert.equal(second.length, 1);
  assert.equal(loads, 1); assert.equal(checks, 1);
  assert.throws(() => second[0].cast.push('Unvalidated actor'), TypeError);
  assert.throws(() => { second[0].nested.checked = false; }, TypeError);
  catalog('2026-11-15');
  assert.equal(checks, 2, 'release-day changes require a fresh validation');
  createValidatedBuildCatalog(load, validate)('2026-11-15');
  assert.equal(checks, 3, 'another build never inherits the prior process result');
});

test('development remains uncached and validation failures are never reused', () => {
  let valid = false, checks = 0;
  const catalog = createValidatedBuildCatalog(() => [{ value: valid }], items => { checks++; if (!items[0].value) throw Error('Invalid catalog'); });
  assert.throws(() => catalog('today'), /Invalid catalog/);
  assert.throws(() => catalog('today'), /Invalid catalog/);
  valid = true;
  assert.equal(catalog('today')[0].value, true);
  catalog('today');
  assert.equal(checks, 3);
  const live = catalog(); live[0].value = false;
  assert.equal(catalog()[0].value, true);
  assert.equal(checks, 5);
});
