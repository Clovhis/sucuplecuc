#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const vm = require('vm');
const { spawnSync } = require('child_process');

const DEFAULT_REPO = process.cwd();
const MOVIES_DIR = path.join('src', 'data', 'movies');
const PERSON_PROFILES_PATH = path.join('src', 'data', 'personProfiles.ts');
const MOVIE_AUDITOR_PATH = path.join(
	'skills',
	'la-posta-cine-auditor',
	'scripts',
	'audit_recent_movies.cjs',
);
const PERSON_AUDITOR_PATH = path.join(
	'skills',
	'la-posta-cine-add-person-profile',
	'scripts',
	'person_profile_audit.cjs',
);
const TRUNCATED_ENDING_PATTERN =
	/\b(?:durante la|durante el|de la|de las|de los|del|con la|con el|en la|en el|hacia la|hacia el|para la|para el|por la|por el|tras la|tras el|padre del)\.$/i;
const REVIEWISH_SYNOPSIS_PATTERNS = [
	/\bla critica\b/i,
	/\blas resenas\b/i,
	/\brecepcion\b/i,
	/\brecepcion critica\b/i,
	/\bconsenso\b/i,
	/\brecomendada\b/i,
	/\bno recomendada\b/i,
	/\bzafa\b/i,
	/\bobra maestra\b/i,
];
const METADATA_SYNOPSIS_PATTERNS = [
	/^(protagonizada|dirigida) por\b/i,
	/^[^.]+ es una peli?cula\b/i,
	/^[^.]+ es un anime\b/i,
	/^[^.]+ is a\b/i,
];
const CRITIC_LED_REVIEW_PATTERNS = [
	/\blas resenas\b/i,
	/\ben resenas\b/i,
	/\bla critica\b/i,
	/\ben la critica\b/i,
	/\brecepcion critica\b/i,
	/\brecepcion generalmente favorable\b/i,
	/\bconsenso favorable\b/i,
	/\bla devolucion\b/i,
	/\bsaldo fue claramente positivo\b/i,
];
const BIO_WIKIPEDIA_PATTERNS = [
	/\bsegun wikipedia\b/i,
	/\bwikipedia\b/i,
	/\bla misma wikipedia\b/i,
];
const BIO_TEMPLATE_PATTERNS = [
	/\bSu carrera quedo muy ligada a\b/i,
	/\bDentro del catalogo del sitio\b/i,
	/\bmantiene una carrera muy visible\b/i,
	/\bfue ganando lugar dentro de la industria\b/i,
];

function parseArgs(argv) {
	const args = {
		repo: DEFAULT_REPO,
		format: 'text',
		skipExternal: false,
	};

	for (let index = 0; index < argv.length; index += 1) {
		const token = argv[index];
		if (token === '--repo') {
			args.repo = path.resolve(argv[index + 1]);
			index += 1;
		} else if (token === '--format') {
			args.format = argv[index + 1] || 'text';
			index += 1;
		} else if (token === '--skip-external') {
			args.skipExternal = true;
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
			'  node full_site_audit.cjs',
			'  node full_site_audit.cjs --format json',
			'  node full_site_audit.cjs --repo <path>',
			'  node full_site_audit.cjs --skip-external',
		].join('\n'),
	);
}

function normalizeWhitespace(value) {
	return String(value || '')
		.replace(/\s+/g, ' ')
		.trim();
}

function normalizeText(value) {
	return normalizeWhitespace(value)
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase();
}

function addFinding(findings, severity, source, scope, code, message) {
	findings.push({ severity, source, scope, code, message });
}

function countChar(value, char) {
	return [...String(value || '')].filter((entry) => entry === char).length;
}

function hasUnbalancedDelimiters(value) {
	const text = String(value || '');
	if (countChar(text, '(') !== countChar(text, ')')) {
		return true;
	}
	if (countChar(text, '"') % 2 !== 0) {
		return true;
	}
	return false;
}

function readJson(filePath) {
	return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadMovies(repoRoot) {
	const root = path.join(repoRoot, MOVIES_DIR);
	return fs
		.readdirSync(root)
		.filter((entry) => entry.endsWith('.json'))
		.sort((left, right) => left.localeCompare(right))
		.map((entry) => {
			const filePath = path.join(root, entry);
			return {
				filePath: path.relative(repoRoot, filePath).replace(/\\/g, '/'),
				movie: readJson(filePath),
			};
		});
}

function loadPersonProfiles(repoRoot) {
	const filePath = path.join(repoRoot, PERSON_PROFILES_PATH);
	const source = fs.readFileSync(filePath, 'utf8');
	const transformed = ts.transpileModule(source, {
		compilerOptions: {
			module: ts.ModuleKind.CommonJS,
			target: ts.ScriptTarget.ES2020,
		},
	}).outputText;

	const sandbox = {
		module: { exports: {} },
		exports: {},
		require,
		console,
	};
	sandbox.exports = sandbox.module.exports;

	vm.runInNewContext(transformed, sandbox, { filename: filePath });
	return sandbox.module.exports.personProfiles || sandbox.exports.personProfiles || {};
}

function runNodeScript(repoRoot, relativeScriptPath, extraArgs) {
	const scriptPath = path.join(repoRoot, relativeScriptPath);
	if (!fs.existsSync(scriptPath)) {
		return {
			ok: false,
			error: `Missing script: ${relativeScriptPath}`,
			stdout: '',
			stderr: '',
			status: 1,
		};
	}

	const result = spawnSync(process.execPath, [scriptPath, ...extraArgs], {
		cwd: repoRoot,
		encoding: 'utf8',
	});

	return {
		ok: result.status === 0,
		status: result.status,
		stdout: result.stdout || '',
		stderr: result.stderr || '',
		error: result.error ? String(result.error) : '',
	};
}

function parseMovieAuditor(repoRoot) {
	const result = runNodeScript(repoRoot, MOVIE_AUDITOR_PATH, ['--all', '--skip-youtube', '--format', 'json']);
	if (!result.stdout.trim()) {
		return {
			status: result.ok ? 'ok' : 'error',
			findings: result.ok
				? []
				: [
						{
							severity: 'error',
							source: 'movie-auditor',
							scope: 'batch',
							code: 'movie-auditor-empty-output',
							message: result.stderr.trim() || result.error || 'movie auditor produced no output',
						},
				  ],
		};
	}

	try {
		const payload = JSON.parse(result.stdout);
		const findings = Array.isArray(payload.findings)
			? payload.findings.map((finding) => ({
					severity: finding.severity === 'warn' ? 'warn' : 'error',
					source: 'movie-auditor',
					scope: finding.file || 'batch',
					code: finding.code || 'movie-auditor',
					message: finding.message || 'movie auditor finding',
			  }))
			: [];
		return {
			status: result.ok ? 'ok' : 'error',
			findings,
		};
	} catch (error) {
		return {
			status: 'error',
			findings: [
				{
					severity: 'error',
					source: 'movie-auditor',
					scope: 'batch',
					code: 'movie-auditor-parse-failed',
					message: `Could not parse movie auditor JSON output: ${error.message}`,
				},
			],
		};
	}
}

function parsePersonAuditor(repoRoot) {
	const result = runNodeScript(repoRoot, PERSON_AUDITOR_PATH, ['--all']);
	const combined = `${result.stdout}\n${result.stderr}`;
	const findings = [];

	for (const line of combined.split(/\r?\n/)) {
		const match = line.match(/^\[(ERROR|WARN)\]\s+([^:]+):\s+(.+)$/);
		if (!match) {
			continue;
		}

		findings.push({
			severity: match[1] === 'WARN' ? 'warn' : 'error',
			source: 'person-auditor',
			scope: match[2].trim(),
			code: 'person-profile-audit',
			message: match[3].trim(),
		});
	}

	if (!result.ok && findings.length === 0) {
		findings.push({
			severity: 'error',
			source: 'person-auditor',
			scope: 'batch',
			code: 'person-auditor-failed',
			message: result.stderr.trim() || result.stdout.trim() || result.error || 'person auditor failed',
		});
	}

	return {
		status: result.ok ? 'ok' : 'error',
		findings,
	};
}

function scanMovieEditorial(movieEntries) {
	const findings = [];

	for (const entry of movieEntries) {
		const synopsis = normalizeWhitespace(entry.movie.synopsis);
		const review = normalizeWhitespace(entry.movie.review);

		if (!synopsis) {
			addFinding(findings, 'error', 'movie-editorial', entry.filePath, 'missing-synopsis', 'Synopsis is empty.');
		} else {
			if (TRUNCATED_ENDING_PATTERN.test(synopsis)) {
				addFinding(
					findings,
					'error',
					'movie-editorial',
					entry.filePath,
					'truncated-synopsis',
					'Synopsis ends like a broken sentence and looks truncated.',
				);
			}

			if (METADATA_SYNOPSIS_PATTERNS.some((pattern) => pattern.test(synopsis))) {
				addFinding(
					findings,
					'warn',
					'movie-editorial',
					entry.filePath,
					'metadata-synopsis',
					'Synopsis reads like metadata or encyclopedia copy instead of a clean premise.',
				);
			}

			if (REVIEWISH_SYNOPSIS_PATTERNS.some((pattern) => pattern.test(synopsis))) {
				addFinding(
					findings,
					'warn',
					'movie-editorial',
					entry.filePath,
					'reviewish-synopsis',
					'Synopsis contains review-like wording and should stay plot-focused.',
				);
			}

			if (hasUnbalancedDelimiters(synopsis)) {
				addFinding(
					findings,
					'error',
					'movie-editorial',
					entry.filePath,
					'unbalanced-synopsis',
					'Synopsis has unbalanced quotes or parentheses.',
				);
			}
		}

		if (!review) {
			addFinding(findings, 'error', 'movie-editorial', entry.filePath, 'missing-review', 'Review is empty.');
			continue;
		}

		if (CRITIC_LED_REVIEW_PATTERNS.some((pattern) => pattern.test(review))) {
			addFinding(
				findings,
				'warn',
				'movie-editorial',
				entry.filePath,
				'critic-led-review',
				'Review leans on critics/reception wording instead of Cine Posta voice.',
			);
		}

		if (hasUnbalancedDelimiters(review)) {
			addFinding(
				findings,
				'error',
				'movie-editorial',
				entry.filePath,
				'unbalanced-review',
				'Review has unbalanced quotes or parentheses.',
			);
		}
	}

	return findings;
}

function scanPersonEditorial(profiles) {
	const findings = [];

	for (const [slug, profile] of Object.entries(profiles)) {
		const paragraphs = Array.isArray(profile.biography) ? profile.biography.map((entry) => normalizeWhitespace(entry)) : [];
		const seenParagraphs = new Set();

		for (const paragraph of paragraphs) {
			if (!paragraph) {
				addFinding(findings, 'error', 'person-editorial', slug, 'empty-biography-paragraph', 'Biography contains an empty paragraph.');
				continue;
			}

			if (BIO_WIKIPEDIA_PATTERNS.some((pattern) => pattern.test(paragraph))) {
				addFinding(
					findings,
					'error',
					'person-editorial',
					slug,
					'wikipedia-in-biography',
					'Biography mentions Wikipedia inside published copy.',
				);
			}

			if (BIO_TEMPLATE_PATTERNS.some((pattern) => pattern.test(paragraph))) {
				addFinding(
					findings,
					'warn',
					'person-editorial',
					slug,
					'template-biography',
					'Biography paragraph sounds templated and should be rewritten with concrete facts.',
				);
			}

			const normalizedParagraph = normalizeText(paragraph);
			if (seenParagraphs.has(normalizedParagraph)) {
				addFinding(
					findings,
					'error',
					'person-editorial',
					slug,
					'duplicate-biography-paragraph',
					'Biography repeats the same paragraph.',
				);
			}
			seenParagraphs.add(normalizedParagraph);
		}
	}

	return findings;
}

function buildReport(args) {
	const movies = loadMovies(args.repo);
	const profiles = loadPersonProfiles(args.repo);
	const report = {
		repo: args.repo,
		movieCount: movies.length,
		personProfileCount: Object.keys(profiles).length,
		externalAudits: {},
		findings: [],
	};

	if (!args.skipExternal) {
		const movieAudit = parseMovieAuditor(args.repo);
		const personAudit = parsePersonAuditor(args.repo);
		report.externalAudits.movies = {
			status: movieAudit.status,
			count: movieAudit.findings.length,
		};
		report.externalAudits.people = {
			status: personAudit.status,
			count: personAudit.findings.length,
		};
		report.findings.push(...movieAudit.findings, ...personAudit.findings);
	}

	report.findings.push(...scanMovieEditorial(movies));
	report.findings.push(...scanPersonEditorial(profiles));

	report.findings.sort((left, right) => {
		if (left.severity !== right.severity) {
			return left.severity === 'error' ? -1 : 1;
		}
		if (left.source !== right.source) {
			return left.source.localeCompare(right.source);
		}
		return left.scope.localeCompare(right.scope);
	});

	return report;
}

function printTextReport(report) {
	const errors = report.findings.filter((finding) => finding.severity === 'error');
	const warnings = report.findings.filter((finding) => finding.severity === 'warn');

	console.log(`Repo: ${report.repo}`);
	console.log(`Movies audited: ${report.movieCount}`);
	console.log(`Person profiles audited: ${report.personProfileCount}`);

	if (report.externalAudits.movies) {
		console.log(
			`External movie audit: ${report.externalAudits.movies.status.toUpperCase()} (${report.externalAudits.movies.count} findings)`,
		);
	}
	if (report.externalAudits.people) {
		console.log(
			`External person audit: ${report.externalAudits.people.status.toUpperCase()} (${report.externalAudits.people.count} findings)`,
		);
	}

	if (report.findings.length === 0) {
		console.log('Result: PASS');
		return;
	}

	console.log(`Result: ${errors.length > 0 ? 'FAIL' : 'PASS WITH WARNINGS'} (${errors.length} errors, ${warnings.length} warnings)`);
	for (const finding of report.findings) {
		console.log(
			`[${finding.severity.toUpperCase()}] ${finding.source} :: ${finding.scope} :: ${finding.code} :: ${finding.message}`,
		);
	}
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

	try {
		const report = buildReport(args);
		if (args.format === 'json') {
			console.log(JSON.stringify(report, null, 2));
		} else {
			printTextReport(report);
		}

		const hasErrors = report.findings.some((finding) => finding.severity === 'error');
		process.exit(hasErrors ? 1 : 0);
	} catch (error) {
		console.error(error.stack || error.message);
		process.exit(1);
	}
}

main();
