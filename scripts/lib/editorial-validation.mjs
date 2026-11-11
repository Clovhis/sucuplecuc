import { createHash, randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { appendFileSync, closeSync, existsSync, lstatSync, mkdirSync, openSync, readFileSync, readSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';

const hash = value => createHash('sha256').update(value).digest('hex');
const readJson = path => JSON.parse(readFileSync(path, 'utf8'));
const atomic = (path, value) => {
  const temporary = path + '.' + randomUUID() + '.tmp';
  writeFileSync(temporary, JSON.stringify(value, null, 2) + '\n');
  renameSync(temporary, path);
};

function fileHash(path) {
  if (!lstatSync(path).isFile()) throw new Error('Validation cache requires regular files: ' + path);
  const fd = openSync(path, 'r'), buffer = Buffer.allocUnsafe(128 * 1024), digest = createHash('sha256');
  try { let length; while ((length = readSync(fd, buffer, 0, buffer.length, null)) > 0) digest.update(buffer.subarray(0, length)); }
  finally { closeSync(fd); }
  return digest.digest('hex');
}

export function validationInputDigest(directory, date) {
  const paths = execFileSync('git', ['ls-files', '-c', '-o', '--exclude-standard', '-z'], { cwd: directory, maxBuffer: 20 * 1024 * 1024 }).toString().split('\0').filter(Boolean);
  // The generated receipt is an output, not an input. All other source/test/
  // configuration/report bytes, including untracked files, remain in the key.
  const files = [...new Set(paths.filter(path => path !== 'reports/daily-editorial/' + date + '.json'))];
  for (const path of ['.env', '.env.local', '.env.production', '.env.production.local', 'node_modules/.package-lock.json', '.tmp/cineposta-daily/draft.json']) if (existsSync(resolve(directory, path))) files.push(path);
  const digests = [...new Set(files)].sort().map(path => [path, fileHash(resolve(directory, path))]);
  const publicEnvironment = Object.fromEntries(Object.entries(process.env).filter(([name]) => name.startsWith('PUBLIC_') || ['NODE_ENV', 'NODE_OPTIONS', 'CI', 'TZ'].includes(name)).sort());
  // Only the aggregate digest is persisted; environment and .env values are
  // never logged or serialized into a public receipt.
  const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: directory, encoding: 'utf8' }).trim();
  return hash(JSON.stringify({ version: 1, date, head, node: process.version, platform: process.platform, arch: process.arch, publicEnvironment, files: digests }));
}

export function buildArtifactDigest(directory) {
  if (!existsSync(directory)) return null;
  const files = [];
  const walk = (path, relative = '') => {
    for (const entry of readdirSync(path, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const name = relative ? relative + '/' + entry.name : entry.name, absolute = resolve(path, entry.name);
      if (entry.isDirectory()) walk(absolute, name);
      else files.push([name, fileHash(absolute)]);
    }
  };
  walk(directory);
  return files.some(([name]) => name === 'index.html') ? hash(JSON.stringify(files)) : null;
}

export function readEditorialMetrics(path) {
  if (!existsSync(path)) return { stages: {}, native: [], activeStage: null };
  const events = readFileSync(path, 'utf8').split('\n').filter(Boolean).flatMap(line => { try { return [JSON.parse(line)]; } catch { return []; } });
  const stages = {}, active = new Map(), native = new Map();
  for (const event of events) {
    if (event.kind === 'native') { native.set(event.key, event); continue; }
    if (event.kind !== 'stage') continue;
    if (event.status === 'started') { active.set(event.id, event); continue; }
    active.delete(event.id);
    const summary = stages[event.stage] ||= { attempts: 0, passed: 0, failed: 0, reused: 0, elapsedMs: 0 };
    summary[event.status] = (summary[event.status] || 0) + 1;
    if (event.status !== 'reused') summary.attempts++;
    summary.elapsedMs += event.elapsedMs || 0;
  }
  return { stages, native: [...native.values()], activeStage: [...active.values()].at(-1) || null };
}

export class EditorialMetrics {
  constructor(directory, date) { mkdirSync(directory, { recursive: true }); this.path = resolve(directory, date + '-metrics.jsonl'); }
  event(event) { appendFileSync(this.path, JSON.stringify({ at: new Date().toISOString(), ...event }) + '\n'); }
  start(stage) { const id = randomUUID(), started = performance.now(); this.event({ kind: 'stage', id, stage, status: 'started' }); return status => this.event({ kind: 'stage', id, stage, status, elapsedMs: Math.round(performance.now() - started) }); }
  async measure(stage, task) { const end = this.start(stage); try { const result = await task(); end('passed'); return result; } catch (error) { end('failed'); throw error; } }
  native(role, execution) {
    const key = hash(JSON.stringify({ role, execution }));
    if (readEditorialMetrics(this.path).native.some(event => event.key === key)) return;
    const elapsed = Date.parse(execution.completedAt) - Date.parse(execution.startedAt);
    this.event({ kind: 'native', key, role, status: execution.status, agentId: execution.agentId || null, model: execution.model, effort: execution.effort,
      startedAt: execution.startedAt || null, completedAt: execution.completedAt || null, durationKind: 'wall-clock',
      elapsedMs: Number.isFinite(elapsed) && elapsed >= 0 ? elapsed : null,
      usage: execution.usage || { available: false, reason: 'Native runtime did not expose per-call token usage.' } });
  }
  summary() { return readEditorialMetrics(this.path); }
}

export class EditorialValidationStages {
  constructor({ directory, date, worktree, metrics }) {
    this.path = resolve(directory, date + '-validation-stages.json'); this.directory = directory; this.worktree = worktree; this.metrics = metrics;
    this.value = { version: 1, date, stages: {} };
    if (existsSync(this.path)) {
      try {
        const saved = readJson(this.path);
        if (saved.digest !== hash(JSON.stringify(saved.value)) || saved.value?.version !== 1 || saved.value.date !== date || !saved.value.stages) throw Error('Invalid validation cache envelope.');
        this.value = saved.value;
      }
      catch { renameSync(this.path, this.path + '.invalid-' + randomUUID()); }
    }
  }
  save() { atomic(this.path, { value: this.value, digest: hash(JSON.stringify(this.value)) }); }
  run(stage, inputDigest, task, { artifact = null } = {}) {
    const previous = this.value.stages[stage];
    const output = artifact ? buildArtifactDigest(artifact) : undefined;
    if (previous?.status === 'passed' && previous.inputDigest === inputDigest && (!artifact || (output && previous.outputDigest === output))) {
      this.metrics.event({ kind: 'stage', id: randomUUID(), stage, status: 'reused', elapsedMs: 0 });
      return;
    }
    const end = this.metrics.start(stage);
    this.value.stages[stage] = { inputDigest, status: 'running' }; this.save();
    try {
      task();
      const outputDigest = artifact ? buildArtifactDigest(artifact) : undefined;
      if (artifact && !outputDigest) throw new Error('The successful build did not leave a complete dist artifact.');
      this.value.stages[stage] = { inputDigest, status: 'passed', ...(artifact ? { outputDigest } : {}) }; this.save(); end('passed');
    } catch (error) { this.value.stages[stage].status = 'failed'; this.save(); end('failed'); throw error; }
  }
  preserveBrowserArtifacts() {
    const destination = resolve(this.directory, this.value.date + '-browser-artifacts-' + randomUUID());
    for (const name of ['test-results', 'playwright-report']) {
      const source = resolve(this.worktree, name);
      if (existsSync(source)) { mkdirSync(destination, { recursive: true }); renameSync(source, resolve(destination, name)); }
    }
    return existsSync(destination) ? destination : null;
  }
}
