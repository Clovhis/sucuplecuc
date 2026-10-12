import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { execFileSync, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = await mkdtemp(path.join(tmpdir(), 'cineposta-edition-test-'));
const script = fileURLToPath(new URL('./publish-home-edition.mjs', import.meta.url));
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const setup = (cwd) => { git(cwd, 'config', 'user.name', 'Edition test'); git(cwd, 'config', 'user.email', 'edition-test@example.invalid'); };
try {
	const remote = path.join(directory, 'origin.git');
	const first = path.join(directory, 'first');
	const updater = path.join(directory, 'updater');
	await mkdir(remote);
	git(remote, 'init', '--bare', '--initial-branch=main');
	git(directory, 'clone', remote, first);
	setup(first);
	await mkdir(path.join(first, 'src/data/movies'), { recursive: true });
	const file = 'src/data/cinemaNews.generated.json';
	await writeFile(path.join(first, file), 'first edition\n');
	git(first, 'add', '.'); git(first, 'commit', '-m', 'Initial edition'); git(first, 'push', 'origin', 'main');
	git(directory, 'clone', remote, updater);
	setup(updater);
	// A movie arrives after the updater checked out main.
	await writeFile(path.join(first, 'src/data/movies/incoming.json'), '{"title":"Incoming movie"}\n');
	git(first, 'add', '.'); git(first, 'commit', '-m', 'Movie load during refresh'); git(first, 'push', 'origin', 'main');
	await writeFile(path.join(updater, file), 'new edition\n');
	execFileSync(process.execPath, [script, file], { cwd: updater, stdio: ['ignore', 'pipe', 'pipe'] });
	git(first, 'fetch', 'origin', 'main');
	assert.equal(git(first, 'show', `origin/main:${file}`), 'new edition');
	assert.equal(git(first, 'show', 'origin/main:src/data/movies/incoming.json'), '{"title":"Incoming movie"}', 'Rebase must preserve incoming movie loads');
	const published = git(updater, 'rev-parse', 'HEAD');
	execFileSync(process.execPath, [script, file], { cwd: updater, stdio: ['ignore', 'pipe', 'pipe'] });
	assert.equal(git(updater, 'rev-parse', 'HEAD'), published, 'An unchanged edition must not create another commit');
	await mkdir(path.join(updater, 'src/data/movies'), { recursive: true });
	await writeFile(path.join(updater, 'src/data/movies/unauthorized.json'), '{}\n');
	const blocked = spawnSync(process.execPath, [script, file], { cwd: updater, encoding: 'utf8' });
	assert.notEqual(blocked.status, 0, 'Publisher must reject files outside the edition scope');
	assert.match(blocked.stderr, /outside its scope/);
	assert.equal(git(updater, 'rev-parse', 'HEAD'), published);
} finally {
	// Remove only the exact temporary directory created by this test.
	assert.equal(path.dirname(path.resolve(directory)), path.resolve(tmpdir()));
	assert.ok(path.basename(directory).startsWith('cineposta-edition-test-'));
	await rm(directory, { recursive: true, force: true });
}
console.log('Edition publisher: concurrent movie load preserved; scope and idempotence verified.');
