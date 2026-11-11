import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { EditorialMetrics, EditorialValidationStages, buildArtifactDigest, validationInputDigest } from './lib/editorial-validation.mjs';

function fixture() {
  const work = mkdtempSync(resolve(tmpdir(), 'editorial-validation-'));
  execFileSync('git', ['init', '-q'], { cwd: work });
  writeFileSync(resolve(work, '.gitignore'), '.tmp/\ndist/\n.env\nnode_modules/\n');
  writeFileSync(resolve(work, 'source.txt'), 'original');
  execFileSync('git', ['-c', 'user.name=fixture', '-c', 'user.email=fixture@example.org', 'commit', '--allow-empty', '-qm', 'synthetic validation fixture'], { cwd: work });
  const directory = resolve(work, '.tmp');
  const metrics = new EditorialMetrics(directory, '2026-11-14');
  return { work, directory, metrics, stages: () => new EditorialValidationStages({ directory, date: '2026-11-14', worktree: work, metrics }), cleanup: () => rmSync(work, { recursive: true, force: true }) };
}

test('cache pins all source and build bytes, not timestamps; corruption never grants reuse', () => {
  const f = fixture();
  try {
    let count = 0;
    const artifact = resolve(f.work, 'dist');
    const build = () => { count++; mkdirSync(artifact, { recursive: true }); writeFileSync(resolve(artifact, 'index.html'), 'built'); };
    const input = validationInputDigest(f.work, '2026-11-14');
    f.stages().run('build', input, build, { artifact });
    const output = buildArtifactDigest(artifact);
    f.stages().run('build', input, build, { artifact });
    assert.equal(count, 1);
    writeFileSync(resolve(artifact, 'index.html'), 'other');
    f.stages().run('build', input, build, { artifact });
    assert.equal(count, 2);
    assert.equal(buildArtifactDigest(artifact), output);
    writeFileSync(resolve(f.work, 'source.txt'), 'modified');
    const changed = validationInputDigest(f.work, '2026-11-14');
    assert.notEqual(changed, input);
    f.stages().run('build', changed, build, { artifact });
    assert.equal(count, 3);
    writeFileSync(resolve(f.work, '.env'), 'PRIVATE_TEST_ONLY=not-a-real-secret');
    assert.notEqual(validationInputDigest(f.work, '2026-11-14'), changed, 'dotenv inputs also invalidate without being logged');
    writeFileSync(resolve(f.directory, '2026-11-14-validation-stages.json'), '{broken');
    f.stages().run('build', changed, build, { artifact });
    assert.equal(count, 4);
    assert.equal(f.metrics.summary().stages.build.reused, 1);
    assert.doesNotMatch(readFileSync(f.metrics.path, 'utf8'), /not-a-real-secret/);
  } finally { f.cleanup(); }
});

test('failed or incomplete stages cannot be reused; artifacts survive retries', () => {
  const f = fixture();
  try {
    let count = 0;
    assert.throws(() => f.stages().run('content', 'same', () => { count++; throw Error('actual failure'); }), /actual failure/);
    f.stages().run('content', 'same', () => count++);
    assert.equal(count, 2);
    mkdirSync(resolve(f.work, 'test-results'));
    writeFileSync(resolve(f.work, 'test-results/error.txt'), 'failure evidence');
    const saved = f.stages().preserveBrowserArtifacts();
    assert.equal(readFileSync(resolve(saved, 'test-results/error.txt'), 'utf8'), 'failure evidence');
    assert.equal(existsSync(resolve(f.work, 'test-results')), false);
  } finally { f.cleanup(); }
});

test('metrics distinguish measured wall time from unavailable provider token usage', async () => {
  const f = fixture();
  try {
    await f.metrics.measure('pages', async () => 'verified');
    await assert.rejects(f.metrics.measure('buffer', async () => { throw Error('send failed'); }));
    const execution = { agentId: 'synthetic-author', model: 'gpt-6-luna', effort: 'max', startedAt: '2026-11-14T13:00:00Z', completedAt: '2026-11-14T13:01:00Z' };
    f.metrics.native('author', execution); f.metrics.native('author', execution);
    const summary = f.metrics.summary();
    assert.equal(summary.native.length, 1);
    assert.equal(summary.native[0].elapsedMs, 60000);
    assert.equal(summary.native[0].usage.available, false);
    assert.equal(summary.stages.pages.passed, 1);
    assert.equal(summary.stages.buffer.failed, 1);
    assert.equal(summary.activeStage, null);
  } finally { f.cleanup(); }
});
