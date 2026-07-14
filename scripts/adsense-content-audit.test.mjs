import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const result = spawnSync(process.execPath, ['scripts/adsense-content-audit.mjs', '--self-test'], {
	encoding: 'utf8',
});

assert.equal(result.status, 0, result.stderr || result.stdout);
assert.match(result.stdout, /Synopsis audit self-tests passed\./);
