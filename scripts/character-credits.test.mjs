import test from 'node:test';
import assert from 'node:assert/strict';
import { isRealCharacterDate } from '../src/lib/character-credits.ts';

test('la fecha de procedencia valida el formato sin límite de antigüedad', () => {
	assert.equal(isRealCharacterDate('2024-02-29'), true);
	assert.equal(isRealCharacterDate('2023-02-29'), false);
	assert.equal(isRealCharacterDate('2026-2-01'), false);
	assert.equal(isRealCharacterDate('1900-01-01'), true);
	assert.equal(isRealCharacterDate('2100-01-01'), true);
});
