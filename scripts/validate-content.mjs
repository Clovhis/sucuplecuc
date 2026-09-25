import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
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

	const result = git(['diff', '--name-only', '--diff-filter=AM', base], { allowFailure: true });
	if (result.status !== 0) {
		return [];
	}

	return result.stdout
		.split(/\r?\n/)
		.map((line) => line.trim().replace(/\\/g, '/'))
		.filter(Boolean);
}

function getMovieFilesNotInBase(base) {
	if (!base) {
		return [];
	}

	const result = git(['ls-tree', '-r', '--name-only', base, '--', 'src/data/movies'], { allowFailure: true });
	if (result.status !== 0) {
		return [];
	}

	const baseFiles = new Set(result.stdout
		.split(/\r?\n/)
		.map((line) => line.trim().replace(/\\/g, '/'))
		.filter(Boolean));
	return readdirSync(path.join(ROOT_DIR, 'src/data/movies'), { withFileTypes: true })
		.filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
		.map((entry) => `src/data/movies/${entry.name}`)
		.filter((file) => !baseFiles.has(file));
}

function getMoviesWithChangedPeopleCredits(base, files) {
	if (!base) return files.filter((file) => file.startsWith('src/data/movies/'));
	return files.filter((file) => {
		if (!file.startsWith('src/data/movies/') || !file.endsWith('.json')) return false;
		const previous = git(['show', `${base}:${file}`], { allowFailure: true });
		if (previous.status !== 0) return true;
		try {
			const before = JSON.parse(previous.stdout);
			const after = JSON.parse(readFileSync(path.join(ROOT_DIR, file), 'utf8'));
			return JSON.stringify([before.director ?? '', before.mainCast ?? []]) !==
				JSON.stringify([after.director ?? '', after.mainCast ?? []]);
		} catch {
			return true;
		}
	});
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
	const newlyAddedMovieFiles = getMovieFilesNotInBase(base);
	const changedFiles = [...new Set([...getChangedFiles(base), ...newlyAddedMovieFiles])];
	const peopleCreditChangedFiles = getMoviesWithChangedPeopleCredits(base, changedFiles);
	const moviePeopleAuditFiles = [...new Set([...newlyAddedMovieFiles, ...peopleCreditChangedFiles])];
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
	if (moviePeopleAuditFiles.length > 0) {
		console.log(`Checking portraits for ${moviePeopleAuditFiles.length} new or people-credit-changed movie file(s).`);
		run('node', [
			'./scripts/audit-movie-people.mjs',
			...moviePeopleAuditFiles.flatMap((file) => ['--file', file]),
		]);
	} else {
		console.log('Movie people portrait gate skipped: no new files or changed director/mainCast credits.');
	}
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
