import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

const script = resolve('scripts/cineposta-weekly-release.mjs');
const supervisorScript = resolve('scripts/cineposta-weekly-supervisor.mjs');
const supervisorLibrary = resolve('scripts/lib/weekly-deployment-supervisor.mjs');
function command(name, args, cwd, env = process.env) {
	const result = spawnSync(name, args, { cwd, env, encoding: 'utf8', maxBuffer: 5_000_000 });
	if (result.status !== 0) throw new Error(`${name} ${args.join(' ')} failed: ${result.stderr || result.stdout}`);
	return result.stdout.trim();
}
function git(cwd, ...args) { return command('git', args, cwd); }
function repositoryWithOrigin(root, files) {
	const local = resolve(root, 'repo');
	const remote = resolve(root, 'origin.git');
	command('git', ['init', '--initial-branch=main', local], root);
	command('git', ['init', '--bare', remote], root);
	command('git', ['config', 'user.name', 'CinePosta test'], local);
	command('git', ['config', 'user.email', 'test@example.invalid'], local);
	for (const [name, content] of Object.entries(files)) {
		const path = resolve(local, name);
		mkdirSync(resolve(path, '..'), { recursive: true });
		writeFileSync(path, content);
	}
	git(local, 'add', '.');
	git(local, 'commit', '-m', 'fixture');
	git(local, 'remote', 'add', 'origin', remote);
	git(local, 'push', '-u', 'origin', 'main');
	return local;
}
function runResume(repo) {
	const env = { ...process.env, CINEPOSTA_WEEKLY_ROOT: repo };
	return command(process.execPath, [script, 'resume', 'cine', '2026-11-12'], repo, env);
}

function supervisorRepository(directory, changedPath) {
	const repo = resolve(directory, 'repo');
	const taskScript = resolve(repo, 'scripts/cineposta-weekly-supervisor.mjs');
	const slug = 'estrenos-cines-12-noviembre-2026';
	const coverPath = `public/assets/editorial/${slug}/portada.webp`;
	mkdirSync(resolve(repo, 'scripts/lib'), { recursive: true });
	mkdirSync(resolve(repo, 'public/assets/editorial', slug), { recursive: true });
	writeFileSync(resolve(repo, '.gitignore'), '.tmp/\n');
	cpSync(supervisorScript, taskScript);
	cpSync(supervisorLibrary, resolve(repo, 'scripts/lib/weekly-deployment-supervisor.mjs'));
	writeFileSync(resolve(repo, coverPath), 'test-cover-bytes');
	mkdirSync(resolve(repo, changedPath, '..'), { recursive: true });
	writeFileSync(resolve(repo, changedPath), 'baseline\n');
	command('git', ['init', '--initial-branch=main', repo], directory);
	command('git', ['config', 'user.name', 'CinePosta test'], repo);
	command('git', ['config', 'user.email', 'test@example.invalid'], repo);
	git(repo, 'add', '.');
	git(repo, 'commit', '-m', 'baseline');
	const baseSha = git(repo, 'rev-parse', 'HEAD');
	const state = {
		version: 1, kind: 'cine', date: '2026-11-12', sha: baseSha, slug,
		title: 'Estrenos de cine', articleUrl: `https://www.cineposta.com.ar/editorial/${slug}/`,
		coverPath, coverUrl: `https://www.cineposta.com.ar/${coverPath.replace(/^public\//u, '')}`,
		movieSlugs: ['pelicula-a-2026'], homeSlugs: ['pelicula-a-2026'], repository: 'Clovhis/sucuplecuc',
		requestedAt: '2026-11-12T13:00:00.000Z', firstCheckNotBefore: '2026-11-12T13:10:00.000Z',
		status: 'failed', infraDispatches: 0, recoveryCycles: 0, corrections: [], observations: [],
	};
	const statePath = resolve(repo, '.tmp/cineposta-weekly/supervision/cine-2026-11-12.json');
	mkdirSync(resolve(statePath, '..'), { recursive: true });
	writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);
	writeFileSync(resolve(repo, changedPath), 'corrected\n');
	git(repo, 'add', changedPath);
	git(repo, 'commit', '-m', 'candidate correction');
	return { repo, taskScript, slug, coverPath, statePath, baseSha, nextSha: git(repo, 'rev-parse', 'HEAD') };
}

function runSupervisor(repo, taskScript, ...args) {
	return spawnSync(process.execPath, [taskScript, ...args], { cwd: repo, encoding: 'utf8', maxBuffer: 5_000_000 });
}

test('resume is idempotent when a real weekly receipt already exists on origin/main', () => {
	const directory = mkdtempSync(resolve(tmpdir(), 'cineposta-weekly-resume-published-'));
	try {
		const receipt = { kind: 'cine', date: '2026-11-12', slug: 'estrenos-cines-12-noviembre-2026', tweet: 'original' };
		const repo = repositoryWithOrigin(directory, { 'reports/weekly-releases/cine/2026-11-12.json': JSON.stringify(receipt) });
		const output = JSON.parse(runResume(repo));
		assert.equal(output.action, 'resume-existing');
		assert.equal(output.receipt.slug, receipt.slug);
		assert.match(output.instruction, /No redactar otra guía/u);
	} finally { rmSync(directory, { recursive: true, force: true }); }
});

test('resume reads porcelain paths with leading status spaces intact', () => {
	const directory = mkdtempSync(resolve(tmpdir(), 'cineposta-weekly-resume-draft-'));
	try {
		const repo = repositoryWithOrigin(directory, { 'src/data/editorials/old-note.json': '{"title":"Anterior"}\n' });
		writeFileSync(resolve(repo, 'src/data/editorials/old-note.json'), '{"title":"Corrección local"}\n');
		const runDirectory = resolve(repo, '.tmp/cineposta-weekly/cine-2026-11-12');
		mkdirSync(runDirectory, { recursive: true });
		writeFileSync(resolve(runDirectory, 'draft.json'), JSON.stringify({ kind: 'cine', date: '2026-11-12', base: 'main', slug: 'estrenos-cines-12-noviembre-2026' }));
		const output = JSON.parse(runResume(repo));
		assert.equal(output.action, 'resume-draft');
		assert.ok(output.changedFiles.includes('src/data/editorials/old-note.json'));
		assert.ok(output.changedFiles.includes('.tmp/cineposta-weekly/cine-2026-11-12/draft.json'));
	} finally { rmSync(directory, { recursive: true, force: true }); }
});

test('only the native task root can record the same agent’s observed completion', () => {
	const directory = mkdtempSync(resolve(tmpdir(), 'cineposta-weekly-native-completion-'));
	try {
		const runDirectory = resolve(directory, '.tmp/cineposta-weekly/cine-2026-11-12');
		mkdirSync(runDirectory, { recursive: true });
		const execution = { provider: 'codex-native', model: 'gpt-6-luna', effort: 'max', status: 'awaiting-parent-attestation', probe: 'passed', agentId: 'native-worker' };
		const draft = {
			kind: 'cine', date: '2026-11-12', execution,
			modelCatalog: { observedAt: '2026-11-12T13:00:00.000Z', models: [{ model: 'gpt-6-luna', reasoningEfforts: ['max'] }] },
			report: { execution: structuredClone(execution) },
		};
		writeFileSync(resolve(runDirectory, 'draft.json'), `${JSON.stringify(draft)}\n`);
		const env = { ...process.env, CINEPOSTA_WEEKLY_ROOT: directory };
		const result = spawnSync(process.execPath, [script, 'attest-completion', 'cine', '2026-11-12', '--agent-id', 'native-worker'], { cwd: directory, env, encoding: 'utf8' });
		assert.equal(result.status, 0, result.stderr);
		assert.equal(JSON.parse(result.stdout).action, 'completion-attested');
		const updated = JSON.parse(readFileSync(resolve(runDirectory, 'draft.json'), 'utf8'));
		assert.equal(updated.execution.status, 'completed');
		assert.equal(updated.execution.parentCompletion.attestedBy, 'native-task-root');
		assert.equal(updated.execution.parentCompletion.agentId, 'native-worker');
		assert.deepEqual(updated.report.execution, updated.execution);
	} finally { rmSync(directory, { recursive: true, force: true }); }
});

test('a committed code recovery is counted once when the same SHA starts supervision', () => {
	const directory = mkdtempSync(resolve(tmpdir(), 'cineposta-weekly-recovery-code-'));
	try {
		const fixture = supervisorRepository(directory, 'scripts/repair.mjs');
		let result = runSupervisor(fixture.repo, fixture.taskScript, 'record-recovery', '--kind', 'cine', '--date', '2026-11-12', '--type', 'code', '--sha', fixture.nextSha, '--reason', 'La revisión detectó y corrigió un fallo del verificador.');
		assert.equal(result.status, 0, result.stderr);
		result = runSupervisor(fixture.repo, fixture.taskScript, 'start', '--kind', 'cine', '--date', '2026-11-12', '--sha', fixture.nextSha, '--slug', fixture.slug, '--title', 'Estrenos de cine', '--cover-path', fixture.coverPath, '--movie-slugs', 'pelicula-a-2026', '--home-slugs', '');
		assert.equal(result.status, 0, result.stderr);
		const state = JSON.parse(readFileSync(fixture.statePath, 'utf8'));
		assert.equal(state.status, 'waiting');
		assert.equal(state.sha, fixture.nextSha);
		assert.equal(state.recoveryCycles, 1);
		assert.equal(state.corrections.length, 1);
		assert.equal(state.corrections[0].fromSha, fixture.baseSha);
		assert.equal(state.corrections[0].toSha, fixture.nextSha);
		assert.deepEqual(state.homeSlugs, []);
	} finally { rmSync(directory, { recursive: true, force: true }); }
});

test('a content-only change cannot be recorded as a Pages code recovery or restarted', () => {
	const directory = mkdtempSync(resolve(tmpdir(), 'cineposta-weekly-recovery-content-'));
	try {
		const fixture = supervisorRepository(directory, 'src/data/editorials/new-note.json');
		let result = runSupervisor(fixture.repo, fixture.taskScript, 'record-recovery', '--kind', 'cine', '--date', '2026-11-12', '--type', 'code', '--sha', fixture.nextSha, '--reason', 'No es una corrección de código.');
		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /sólo admite código, dependencias o configuración semanal/u);
		result = runSupervisor(fixture.repo, fixture.taskScript, 'start', '--kind', 'cine', '--date', '2026-11-12', '--sha', fixture.nextSha, '--slug', fixture.slug, '--title', 'Estrenos de cine', '--cover-path', fixture.coverPath, '--movie-slugs', 'pelicula-a-2026', '--home-slugs', 'pelicula-a-2026', '--recovery-type', 'code', '--reason', 'No es una corrección de código.');
		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /sólo admite código, dependencias o configuración semanal/u);
		const state = JSON.parse(readFileSync(fixture.statePath, 'utf8'));
		assert.equal(state.status, 'failed');
		assert.equal(state.sha, fixture.baseSha);
		assert.equal(state.recoveryCycles, 0);
	} finally { rmSync(directory, { recursive: true, force: true }); }
});
