import test from 'node:test';
import assert from 'node:assert/strict';
import { chmodSync, cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

const script = resolve('scripts/cineposta-weekly-release.mjs');
const supervisorScript = resolve('scripts/cineposta-weekly-supervisor.mjs');
const supervisorLibrary = resolve('scripts/lib/weekly-deployment-supervisor.mjs');
const weeklyReleaseScript = resolve('scripts/cineposta-weekly-release.mjs');
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

function weeklyValidationFixture(directory, kind, date, { withPriorCinema = true } = {}) {
	const repo = repositoryWithOrigin(directory, {
		'.gitignore': '.tmp/\n',
		...(kind === 'cine' && withPriorCinema ? { 'src/data/movies/previa-cine-2020.json': JSON.stringify({ slug: 'previa-cine-2020', title: 'Película anterior', releasePlatform: 'Cine', cinepostaScore: 6 }) } : {}),
	});
	const guideSlug = kind === 'cine' ? 'estrenos-cines-12-noviembre-2026' : 'estrenos-streaming-13-noviembre-2026';
	const movieSlug = kind === 'cine' ? 'pelicula-prueba-cine-2026' : 'pelicula-prueba-streaming-2026';
	const missingSlug = kind === 'cine' ? 'pendiente-sin-ficha-cine-2026' : 'pendiente-sin-ficha-streaming-2026';
	const moviePath = `src/data/movies/${movieSlug}.json`;
	const intakePath = `reports/movie-intake/${movieSlug}.json`;
	const coverPath = `public/assets/editorial/${guideSlug}/portada.webp`;
	const sources = [
		{ label: 'Fuente uno', url: 'https://distribuidora.example/estreno' },
		{ label: kind === 'cine' ? 'Cinemark' : 'JustWatch AR', url: kind === 'cine' ? 'https://www.cinemark.com.ar/cartelera' : 'https://www.justwatch.com/ar/pelicula/pelicula-prueba' },
	];
	const title = kind === 'cine' ? 'La película de prueba' : 'La serie de prueba';
	const movie = { slug: movieSlug, title, releasePlatform: kind === 'cine' ? 'Cine' : 'Netflix', cinepostaScore: 7 };
	const periodStart = kind === 'cine' ? date : '2026-11-09';
	const execution = {
		provider: 'codex-native', model: 'gpt-6-luna', effort: 'max', status: 'completed', probe: 'passed', agentId: 'fixture-agent',
		parentCompletion: { attestedBy: 'native-task-root', agentId: 'fixture-agent', completedAt: `${date}T13:01:00.000Z` },
	};
	const tweet = `Esta semana llega ${title} con novedades verificadas para elegir qué ver. https://www.cineposta.com.ar/editorial/${guideSlug}/ #Estrenos #CinePosta`;
	const included = {
		slug: movieSlug, status: 'loaded', include: true, changedFile: moviePath,
		score: { source: 'IMDb', metric: 'audience', rawValue: 7, final: 7, sourceUrl: 'https://www.imdb.com/title/tt1234567/ratings/', retrievedOn: date },
		evidence: kind === 'cine'
			? { showings: [{ date, chain: 'Cinemark', venue: 'Cinemark Palermo', locality: 'CABA', jurisdiction: 'CABA', url: 'https://www.cinemark.com.ar/cartelera' }] }
			: { availability: { justwatchUrl: sources[1].url, reason: 'new-release', activeOn: periodStart, checkedOn: date, offers: [{ provider: 'Netflix', offerType: 'FLATRATE', country: 'AR', url: 'https://www.netflix.com/title/123456' }] } },
	};
	const priorCinema = kind === 'cine' && withPriorCinema ? {
		slug: 'previa-cine-2020', status: 'revalidated', include: false, reason: 'Sigue con una función elegible y queda fuera del foco editorial de novedades.',
		cinemaRevalidation: { decision: 'retained', checkedOn: date, showings: [{ date, chain: 'Cinemark', venue: 'Cinemark Palermo', locality: 'CABA', jurisdiction: 'CABA', url: 'https://www.cinemark.com.ar/cartelera' }] },
	} : null;
	const pending = { slug: missingSlug, status: 'pending', include: false, reason: 'La búsqueda completa no confirmó una ficha ni evidencia de disponibilidad.', scoreSearches: ['IMDb', 'Metacritic', 'Watchmode'] };
	const note = {
		slug: guideSlug,
		title: kind === 'cine' ? 'Estrenos de cine del 12 al 18 de noviembre' : 'Novedades de plataformas del 9 al 15 de noviembre',
		date, author: 'CinePosta', type: 'nota', spoilers: false, excerpt: 'Una guía semanal con novedades verificadas.', sources,
		cover: { src: `assets/editorial/${guideSlug}/portada.webp`, alt: 'Portada editorial de la guía semanal.' },
		content: [{ type: 'paragraph', text: `${title} aparece en la guía con disponibilidad comprobada para Argentina.` }],
	};
	const report = {
		kind, date, period: { kind, runDate: date, start: periodStart, end: kind === 'cine' ? '2026-11-18' : '2026-11-15', schedule: kind === 'cine' ? 'jueves-10-art' : 'viernes-10-art' },
		slug: guideSlug, execution, tweet, social: { tweet }, includedSlugs: [movieSlug], homeSlugs: [movieSlug], candidates: [included, ...(priorCinema ? [priorCinema] : []), pending], sources,
		imageChecks: [{ sourceUrl: 'https://distribuidora.example/arte', description: 'La portada se observó en la fuente oficial y corresponde con esta guía.' }],
	};
	const draft = { kind, date, slug: guideSlug, execution, modelCatalog: { observedAt: `${date}T13:00:00.000Z`, models: [{ model: 'gpt-6-luna', reasoningEfforts: ['medium', 'max'] }] }, report };
	const put = (file, content) => {
		const absolute = resolve(repo, file);
		mkdirSync(resolve(absolute, '..'), { recursive: true });
		writeFileSync(absolute, content);
	};
	put(moviePath, `${JSON.stringify(movie)}\n`);
	put(intakePath, `${JSON.stringify({ movieSlug, state: 'fixture-only' })}\n`);
	put(`src/data/editorials/${guideSlug}.json`, `${JSON.stringify(note)}\n`);
	put(coverPath, 'fixture cover bytes');
	const draftPath = resolve(repo, `.tmp/cineposta-weekly/${kind}-${date}/draft.json`);
	mkdirSync(resolve(draftPath, '..'), { recursive: true });
	writeFileSync(draftPath, `${JSON.stringify(draft, null, 2)}\n`);
	const bin = resolve(directory, 'bin');
	const logPath = resolve(directory, 'child-commands.log');
	mkdirSync(bin, { recursive: true });
	const shell = (name, body) => {
		const file = resolve(bin, name);
		writeFileSync(file, `#!/bin/sh\n${body}\n`);
		chmodSync(file, 0o755);
	};
	shell('npm', 'printf "npm %s\\n" "$*" >> "$WEEKLY_TEST_LOG"; exit 0');
	shell('npx', 'printf "npx %s\\n" "$*" >> "$WEEKLY_TEST_LOG"; exit 0');
	shell('node', 'case "$*" in *verify_posters.cjs*|*audit_recent_movies.cjs*) printf "%s\\n" "$*" >> "$WEEKLY_TEST_LOG"; exit 0;; esac\nexec "$WEEKLY_TEST_REAL_NODE" "$@"');
	const preloadPath = resolve(directory, 'fixed-date.mjs');
	const fixed = `${date}T15:00:00.000Z`;
	writeFileSync(preloadPath, `const RealDate = Date; const fixed = ${JSON.stringify(fixed)}; globalThis.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : [fixed])); } static now() { return new RealDate(fixed).valueOf(); } };\n`);
	const env = {
		...process.env,
		CINEPOSTA_WEEKLY_ROOT: repo,
		WEEKLY_TEST_LOG: logPath,
		WEEKLY_TEST_REAL_NODE: process.execPath,
		PATH: `${bin}:${process.env.PATH}`,
		NODE_OPTIONS: `--import=${preloadPath}`,
	};
	return { repo, kind, date, draftPath, moviePath: resolve(repo, moviePath), intakePath: resolve(repo, intakePath), missingSlug, movieSlug, guideSlug, env, logPath };
}

function runWeeklyValidation(fixture, commandName = 'validate') {
	return spawnSync(process.execPath, [weeklyReleaseScript, commandName, fixture.kind, fixture.date], { cwd: fixture.repo, env: fixture.env, encoding: 'utf8', maxBuffer: 8_000_000 });
}

test('weekly validate accepts a real included movie plus a missing pending candidate in both editions', () => {
	for (const [kind, date] of [['cine', '2026-11-12'], ['plataformas', '2026-11-13']]) {
		const directory = mkdtempSync(resolve(tmpdir(), `cineposta-weekly-pending-${kind}-`));
		try {
			const fixture = weeklyValidationFixture(directory, kind, date);
			const validated = runWeeklyValidation(fixture);
			assert.equal(validated.status, 0, validated.stderr || validated.stdout);
			assert.match(validated.stdout, /"action": "validated"/u);
			assert.match(validated.stdout, new RegExp(`"candidateCount": ${kind === 'cine' ? 3 : 2}`, 'u'));
			const proof = runWeeklyValidation(fixture, 'check-proof');
			assert.equal(proof.status, 0, proof.stderr || proof.stdout);
			const childCommands = readFileSync(fixture.logPath, 'utf8').split(/\r?\n/u).filter(Boolean);
			const movieAudits = childCommands.filter(command => command.includes('audit_recent_movies.cjs'));
			assert.equal(movieAudits.length, 2, childCommands.join('\n'));
			assert.ok(movieAudits.every(command => command.includes(fixture.movieSlug)));
			assert.equal(childCommands.filter(command => command.includes('verify_posters.cjs')).length, 1);
			assert.ok(childCommands.every(command => !command.includes(fixture.missingSlug)));
		} finally { rmSync(directory, { recursive: true, force: true }); }
	}
});

test('weekly validate rejects a changed intake ledger for a title absent from the declared movie changes', () => {
	const directory = mkdtempSync(resolve(tmpdir(), 'cineposta-weekly-foreign-intake-'));
	try {
		const fixture = weeklyValidationFixture(directory, 'plataformas', '2026-11-13');
		const foreignPath = resolve(fixture.repo, 'reports/movie-intake/foreign-title-2026.json');
		mkdirSync(resolve(foreignPath, '..'), { recursive: true });
		writeFileSync(foreignPath, '{"movieSlug":"foreign-title-2026"}\n');
		const result = runWeeklyValidation(fixture);
		assert.notEqual(result.status, 0);
		assert.match(result.stderr + result.stdout, /no corresponde a una película modificada y declarada en el manifiesto/u);
	} finally { rmSync(directory, { recursive: true, force: true }); }
});

test('Cine validate treats git grep exit 1 as an empty prior cinema inventory', () => {
	const directory = mkdtempSync(resolve(tmpdir(), 'cineposta-weekly-empty-cinema-inventory-'));
	try {
		const fixture = weeklyValidationFixture(directory, 'cine', '2026-11-12', { withPriorCinema: false });
		const validated = runWeeklyValidation(fixture);
		assert.equal(validated.status, 0, validated.stderr || validated.stdout);
		assert.match(validated.stdout, /"candidateCount": 2/u);
	} finally { rmSync(directory, { recursive: true, force: true }); }
});

test('weekly validate rejects an included candidate without a real movie file', () => {
	for (const [kind, date] of [['cine', '2026-11-12'], ['plataformas', '2026-11-13']]) {
		const directory = mkdtempSync(resolve(tmpdir(), `cineposta-weekly-included-missing-${kind}-`));
		try {
			const fixture = weeklyValidationFixture(directory, kind, date);
			unlinkSync(fixture.moviePath);
			unlinkSync(fixture.intakePath);
			const draft = JSON.parse(readFileSync(fixture.draftPath, 'utf8'));
			const missingTitle = 'Ficha ausente';
			draft.report.candidates = [{ slug: fixture.missingSlug, status: 'loaded', include: true }];
			draft.report.includedSlugs = [fixture.missingSlug];
			draft.report.homeSlugs = [fixture.missingSlug];
			writeFileSync(fixture.draftPath, `${JSON.stringify(draft, null, 2)}\n`);
			const notePath = resolve(fixture.repo, `src/data/editorials/${fixture.guideSlug}.json`);
			const note = JSON.parse(readFileSync(notePath, 'utf8'));
			note.content[0].text = `La guía incluye ${missingTitle} aunque no hay ficha publicada.`;
			writeFileSync(notePath, `${JSON.stringify(note)}\n`);
			const result = runWeeklyValidation(fixture);
			assert.notEqual(result.status, 0);
			assert.match(result.stderr, /candidato ausente .* sólo puede quedar pendiente o excluido/u);
		} finally { rmSync(directory, { recursive: true, force: true }); }
	}
});

test('weekly validate rejects a pending candidate that falsely declares a missing changedFile', () => {
	const directory = mkdtempSync(resolve(tmpdir(), 'cineposta-weekly-pending-file-mismatch-'));
	try {
		const fixture = weeklyValidationFixture(directory, 'plataformas', '2026-11-13');
		const draft = JSON.parse(readFileSync(fixture.draftPath, 'utf8'));
		draft.report.candidates[1].changedFile = `src/data/movies/${fixture.missingSlug}.json`;
		writeFileSync(fixture.draftPath, `${JSON.stringify(draft, null, 2)}\n`);
		const result = runWeeklyValidation(fixture);
		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /archivos de películas cambiados no coinciden/u);
	} finally { rmSync(directory, { recursive: true, force: true }); }
});

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
