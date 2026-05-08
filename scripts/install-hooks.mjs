import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOOKS_PATH = '.githooks';

function resolveCommand(command) {
	if (process.platform !== 'win32') {
		return command;
	}
	return command === 'npm' ? 'npm.cmd' : command;
}

function run(command, args) {
	const result = spawnSync(resolveCommand(command), args, {
		cwd: ROOT_DIR,
		stdio: 'inherit',
	});

	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}

run('git', ['config', 'core.hooksPath', HOOKS_PATH]);
console.log(`Git hooks path configured: ${HOOKS_PATH}`);
