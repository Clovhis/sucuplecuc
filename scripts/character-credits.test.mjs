import test from 'node:test';
import assert from 'node:assert/strict';
import { isRealCharacterDate } from '../src/lib/character-credits.ts';

test('valida fechas de procedencia sin aplicarles vencimiento', () => {
	assert.equal(isRealCharacterDate('2024-02-29'), true);
	assert.equal(isRealCharacterDate('2023-02-29'), false);
	assert.equal(isRealCharacterDate('2026-2-01'), false);
	assert.equal(isRealCharacterDate('1900-01-01'), true);
	assert.equal(isRealCharacterDate('2100-01-01'), true);
});
