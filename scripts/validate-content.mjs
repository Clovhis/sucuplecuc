import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function parseArgs(argv) {
	const args = {
		all: false,
		astroCheck: false,
		base: 'origin/main',
		build: true,
	};

	for (let index = 0; index < argv.length; index += 1) {
		const token = argv[index];
		if (token === '--all') {
			args.all = true;
		} else if (token === '--astro-check') {
			args.astroCheck = true;
		} else if (token === '--base') {
			args.base = argv[index + 1] || args.base;
			index += 1;
		} else if (token === '--skip-build') {
			args.build = false;
		} else if (token === '--help' || token === '-h') {
			printUsage();
			process.exit(0);
		} else {
			throw new Error(`Unknown argument: ${token}`);
		}
	}

	return args;
}

function printUsage() {
	console.log(
		[
			'Usage:',
			'  node scripts/validate-content.mjs',
			'  node scripts/validate-content.mjs --base origin/main',
			'  node scripts/validate-content.mjs --all --astro-check',
			'',
			'Options:',
			'  --base <ref>      Base ref for targeted branch diff. Default: origin/main',
			'  --all             Run full movie/profile audits instead of targeted audits',
			'  --astro-check     Run Astro type/content checks before build',
			'  --skip-build      Skip npm run build',
		].join('\n'),
	);
}

function resolveInvocation(command, args) {
	if (process.platform === 'win32' && command === 'npm') {
		return {
			command: 'cmd.exe',
			args: ['/d', '/s', '/c', 'npm', ...args],
		};
	}

	return { command, args };
}

function run(command, args, options = {}) {
	const label = [command, ...args].join(' ');
	console.log(`\n> ${label}`);
	const invocation = resolveInvocation(command, args);

	const result = spawnSync(invocation.command, invocation.args, {
		cwd: ROOT_DIR,
		stdio: options.capture ? 'pipe' : 'inherit',
		encoding: 'utf8',
	});

	if (result.status !== 0 && !options.allowFailure) {
		process.exit(result.status ?? 1);
	}

	return result;
}

function git(args, options = {}) {
	return run('git', args, { ...options, capture: true });
}

function refExists(ref) {
	const result = git(['rev-parse', '--verify', '--quiet', ref], { allowFailure: true });
	return result.status === 0;
}

function resolveBase(preferredBase) {
	if (preferredBase && refExists(preferredBase)) {
		return preferredBase;
	}
	if (refExists('main')) {
		return 'main';
	}
	return '';
}

function getChangedFiles(base) {
	if (!base) {
		return [];
	}

	const result = git(['diff', '--name-only', '--diff-filter=AM', `${base}...HEAD`], { allowFailure: true });
	if (result.status !== 0) {
		return [];
	}

	return result.stdout
		.split(/\r?\n/)
		.map((line) => line.trim().replace(/\\/g, '/'))
		.filter(Boolean);
}

function hasAny(files, predicate) {
	return files.some((file) => predicate(file));
}

function main() {
	let args;
	try {
		args = parseArgs(process.argv.slice(2));
	} catch (error) {
		console.error(error.message);
		printUsage();
		process.exit(1);
	}

	const base = resolveBase(args.base);
	const changedFiles = getChangedFiles(base);
	const movieContentChanged = hasAny(
		changedFiles,
		(file) =>
			file.startsWith('src/data/movies/') ||
			file === 'src/data/people.json' ||
			file.startsWith('public/people/') ||
			file === 'docs/movie-catalog-reference.md' ||
			file === 'docs/person-profile-catalog-reference.md',
	);
	const profileContentChanged = hasAny(
		changedFiles,
		(file) =>
			file === 'src/data/personProfiles.ts' ||
			file === 'src/data/people.json' ||
			file.startsWith('public/people/') ||
			file === 'docs/person-profile-catalog-reference.md',
	);

	console.log(`Validation mode: ${args.all ? 'full' : 'targeted'}`);
	console.log(`Base ref: ${base || '(none)'}`);
	console.log(`Changed files detected: ${changedFiles.length}`);

	run('npm', ['run', 'catalog:movies:check']);
	run('npm', ['run', 'catalog:people:check']);
	run('npm', ['run', 'catalog:people:reference:check']);
	run('npm', ['run', 'audit:content-quality:strict', '--', '--full']);
	run('npm', ['run', 'audit:editorial-low-value']);
	run('npm', ['run', 'audit:profile-originality']);

	if (args.all) {
		run('npm', ['run', 'audit:movies:all']);
		run('npm', ['run', 'audit:profiles']);
	} else {
		if (movieContentChanged) {
			run('node', [
				'./skills/la-posta-cine-auditor/scripts/audit_recent_movies.cjs',
				'--base-ref',
				base || 'main',
				'--recent',
				'--skip-youtube',
			]);
		} else {
			console.log('Movie content audit skipped: no movie content changes in branch diff.');
		}

		if (profileContentChanged) {
			run('npm', ['run', 'audit:profiles']);
		} else {
			console.log('Profile audit skipped: no profile content changes in branch diff.');
		}
	}

	if (args.astroCheck) {
		run('npm', ['run', 'check']);
	}

	if (args.build) {
		run('npm', ['run', 'build']);
		run('npm', ['run', 'audit:profile-originality', '--', '--require-dist']);
		run('npm', ['run', 'validate:public-output']);
		run('npm', ['run', 'validate:sitemap-indexability']);
	}
}

main();
