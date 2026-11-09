import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { editorialPostPlan } from './publish-buffer-editorial-x.mjs';
import { assertWeeklyReleaseScope, argentinaDate, getWeeklyReleasePeriod, validateWeeklyRelease } from './lib/weekly-release-policy.mjs';
import { assertWeeklyLockCanBeCreated } from './lib/weekly-deployment-supervisor.mjs';
import { selectNativeLuna } from './lib/cineposta-luna.mjs';

const root = path.resolve(process.env.CINEPOSTA_WEEKLY_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'));
const kind = process.argv[3];
const date = process.argv[4];
const command = process.argv[2];
const runDir = path.join(root, '.tmp/cineposta-weekly', `${kind}-${date}`);
const draftPath = path.join(runDir, 'draft.json');
const proofPath = path.join(runDir, 'proof.json');
const lockPath = path.join(root, '.tmp/cineposta-weekly/run.lock');
const receiptPath = `reports/weekly-releases/${kind}/${date}.json`;
const fileDigest = file => createHash('sha256').update(readFileSync(path.join(root, file))).digest('hex');
const run = (executable, args, { capture = false, allowFailure = false } = {}) => {
	const env = executable === 'npm' && args[0] === 'run'
		? { ...process.env, NODE_OPTIONS: `${process.env.NODE_OPTIONS || ''} --max-old-space-size=6144`.trim() }
		: process.env;
	const result = spawnSync(executable, args, { cwd: root, env, encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit', maxBuffer: 20 * 1024 * 1024 });
	if (result.status !== 0 && !allowFailure) throw new Error(`${executable} ${args.join(' ')} falló (${result.status ?? result.error?.message}).`);
	return capture ? result.stdout.trim() : result;
};
const git = (...args) => run('git', args, { capture: true });
const readJson = file => JSON.parse(readFileSync(file, 'utf8'));
const jsonDirectory = directory => existsSync(directory) ? readdirSync(directory).filter(file => file.endsWith('.json')).map(file => readJson(path.join(directory, file))) : [];

function getChanged() {
	const result = spawnSync('git', ['status', '--porcelain=v1', '-z', '--untracked-files=all'], { cwd: root, encoding: 'buffer' });
	if (result.status !== 0) throw new Error('No se pudo leer el árbol Git actual.');
	return result.stdout.toString('utf8').split('\0').filter(Boolean).map(record => {
		const rawStatus = record.slice(0, 2);
		const status = rawStatus === '??' ? '??' : rawStatus.includes('A') ? 'A' : rawStatus.includes('M') ? 'M' : rawStatus.trim();
		return { status, path: record.slice(3) };
	});
}

function resume() {
	const existing = spawnSync('git', ['cat-file', '-e', `origin/main:${receiptPath}`], { cwd: root, stdio: 'ignore' });
	if (existing.status === 0) {
		const published = JSON.parse(git('show', `origin/main:${receiptPath}`));
		console.log(JSON.stringify({ action: 'resume-existing', receipt: published, instruction: 'Reanudar Pages o Buffer desde el recibo existente. No redactar otra guía.' }, null, 2));
		return;
	}
	if (!existsSync(draftPath)) {
		console.log(JSON.stringify({ action: 'start-new', kind, date, period: getWeeklyReleasePeriod(kind, date), instruction: 'No hay borrador ni recibo en main; el autor nativo puede iniciar la ventana de esta semana.' }, null, 2));
		return;
	}
	const draft = readJson(draftPath);
	const changes = getChanged();
	console.log(JSON.stringify({ action: 'resume-draft', kind, date, base: draft.base, draft: draftPath, changedFiles: changes.map(change => change.path), instruction: 'Reusar esta misma preparación y su agente; validar/revalidar cambios pendientes antes del push.' }, null, 2));
}

function attestCompletion() {
	if (!['cine', 'plataformas'].includes(kind) || !/^\d{4}-\d{2}-\d{2}$/u.test(date ?? '')) throw new Error('Uso: node scripts/cineposta-weekly-release.mjs attest-completion cine|plataformas YYYY-MM-DD --agent-id <id>');
	const args = process.argv.slice(5);
	const agentFlag = args.indexOf('--agent-id');
	const agentId = agentFlag >= 0 ? args[agentFlag + 1] : undefined;
	const draft = readJson(draftPath);
	if (draft.kind !== kind || draft.date !== date || !agentId || agentId !== draft.execution?.agentId) throw new Error('El ID nativo de completion debe coincidir con el borrador y la semana activos.');
	const selection = selectNativeLuna(draft.modelCatalog?.models ?? []);
	if (!draft.modelCatalog?.observedAt || argentinaDate(new Date(draft.modelCatalog.observedAt)) !== date) throw new Error('El catálogo nativo de modelos debe ser el observado por el runtime en la fecha argentina de ejecución.');
	const execution = draft.execution;
	if (execution.provider !== 'codex-native' || execution.probe !== 'passed' || execution.model !== selection.model || execution.effort !== selection.effort) throw new Error('El borrador no coincide con el probe real de la última Luna Max seleccionada.');
	if (JSON.stringify(draft.report?.execution) !== JSON.stringify(execution)) throw new Error('El borrador y el recibo deben conservar la misma evidencia nativa antes de registrar completion.');
	if (execution.status === 'completed' && execution.parentCompletion?.attestedBy === 'native-task-root' && execution.parentCompletion.agentId === agentId) {
		console.log(JSON.stringify({ action: 'completion-already-attested', execution }, null, 2));
		return;
	}
	if (execution.status !== 'awaiting-parent-attestation') throw new Error('La tarea raíz sólo puede atestiguar el completion real después de que el mismo agente devuelva la preparación completa.');
	const completed = {
		...execution,
		status: 'completed',
		parentCompletion: { attestedBy: 'native-task-root', agentId, completedAt: new Date().toISOString() },
	};
	draft.execution = completed;
	draft.report.execution = completed;
	writeFileSync(draftPath, `${JSON.stringify(draft, null, 2)}\n`);
	console.log(JSON.stringify({ action: 'completion-attested', execution: completed }, null, 2));
}

function movieForSlug(slug) {
	const file = path.join(root, 'src/data/movies', `${slug}.json`);
	if (!existsSync(file)) return undefined;
	return readJson(file);
}

function getBaselineCinemaMovies(ref) {
	const candidates = git('grep', '-Il', '"Cine"', ref, '--', 'src/data/movies').split('\n').filter(Boolean);
	const result = {};
	for (const file of candidates) {
		const movie = JSON.parse(git('show', `${ref}:${file}`));
		const platforms = [movie.releasePlatform, ...(movie.releasePlatforms ?? [])].filter(Boolean).map(value => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase());
		if (platforms.includes('cine')) result[movie.slug] = movie;
	}
	return result;
}

function baselineMovieFromGit(ref, file) {
	const remotePath = file.replace(/^src\/data\/movies\//u, '');
	const exists = spawnSync('git', ['cat-file', '-e', `${ref}:src/data/movies/${remotePath}`], { cwd: root, stdio: 'ignore' });
	return exists.status === 0 ? JSON.parse(git('show', `${ref}:src/data/movies/${remotePath}`)) : null;
}

function changedMovieCharacterFields(file, ref) {
	const current = readJson(path.join(root, file));
	const baseline = baselineMovieFromGit(ref, file);
	if (!baseline) return true;
	const fields = movie => JSON.stringify({ director: movie.director, mainCast: movie.mainCast, castCharacters: movie.castCharacters ?? [] });
	return fields(current) !== fields(baseline);
}

async function validate() {
	if (!['cine', 'plataformas'].includes(kind) || !/^\d{4}-\d{2}-\d{2}$/u.test(date ?? '')) throw new Error('Uso: node scripts/cineposta-weekly-release.mjs validate cine|plataformas YYYY-MM-DD');
	assertWeeklyLockCanBeCreated(lockPath);
	try {
		const remoteReceipt = spawnSync('git', ['cat-file', '-e', `origin/main:${receiptPath}`], { cwd: root, stdio: 'ignore' });
		if (remoteReceipt.status === 0) throw new Error('Ya hay un recibo para esta semana en main; reanudarlo sin crear contenido.');
		const draft = readJson(draftPath);
		run('git', ['fetch', 'origin', 'main']);
		const baseline = git('rev-parse', 'origin/main');
		if (git('rev-parse', 'HEAD') !== baseline) throw new Error('El árbol debe partir del último origin/main. Integrá cambios sin descartarlos antes de revalidar.');
		const changes = getChanged();
		const period = getWeeklyReleasePeriod(kind, date);
		if (draft.kind !== kind || draft.date !== date) throw new Error('El borrador no coincide con el run semanal activo.');
		const notePath = `src/data/editorials/${draft.slug}.json`;
		const note = readJson(path.join(root, notePath));
		const moviesBySlug = Object.fromEntries(draft.report.candidates.map(entry => [entry.slug, movieForSlug(entry.slug)]));
		if (Object.values(moviesBySlug).some(movie => !movie)) throw new Error('Un candidato del manifiesto no existe como ficha real del catálogo.');
		const baselineMoviesBySlug = kind === 'cine' ? getBaselineCinemaMovies('origin/main') : {};
		const baselineCinemaSlugs = Object.keys(baselineMoviesBySlug).sort();
		const priorReports = jsonDirectory(path.join(root, 'reports/weekly-releases', kind)).filter(item => item.date !== date || item.slug !== draft.slug);
		const priorNotes = jsonDirectory(path.join(root, 'src/data/editorials')).filter(item => item.slug !== draft.slug);
		const checked = validateWeeklyRelease({ kind, runDate: date, period, execution: draft.execution, modelCatalog: draft.modelCatalog, report: draft.report, note, moviesBySlug, baselineCinemaSlugs, baselineMoviesBySlug, priorReports, priorNotes, now: new Date() });
		editorialPostPlan(note, draft.report.tweet);
		const changesWithReceipt = [...changes, { status: 'A', path: receiptPath }];
		assertWeeklyReleaseScope(changesWithReceipt, { kind, date, slug: draft.slug });
		const movieChanges = changes.filter(change => change.path.startsWith('src/data/movies/')).map(change => change.path).sort();
		const declaredMovieChanges = [...new Set(draft.report.candidates.filter(entry => entry.changedFile).map(entry => entry.changedFile))].sort();
		if (movieChanges.join('\n') !== declaredMovieChanges.join('\n')) throw new Error('Los archivos de películas cambiados no coinciden con el manifiesto explícito.');
		const affected = draft.report.candidates.filter(entry => entry.changedFile).map(entry => entry.changedFile);
		const characterFieldsChanged = affected.some(file => changedMovieCharacterFields(file, 'origin/main'));
		for (const file of affected) {
			run('node', ['skills/la-posta-cine-auditor/scripts/verify_posters.cjs', '--candidate', file]);
			run('node', ['skills/la-posta-cine-auditor/scripts/audit_recent_movies.cjs', '--base-ref', 'origin/main', '--candidate', file]);
		}
		if (changes.some(change => change.path.startsWith('public/people/') || change.path === 'src/data/people.json')) run('npm', ['run', 'images:people:check']);
		run('npm', ['run', 'test:poster-source-policy']);
		run('npm', ['run', 'validate:content', '--', '--base', 'origin/main', '--astro-check']);
		if (characterFieldsChanged) run('npm', ['run', 'test:characters']);
		for (const file of affected) run('node', ['skills/la-posta-cine-auditor/scripts/audit_recent_movies.cjs', '--base-ref', 'origin/main', '--skip-youtube', '--verify-community-build', '--verify-reaction-build', '--verify-cinema-carousel-build', '--verify-streaming-carousel-build', '--candidate', file]);
		if (characterFieldsChanged) run('npm', ['run', 'audit:character-build']);
		const e2e = ['tests/e2e/editorial.spec.ts', 'tests/e2e/home-carousels.spec.ts'];
		if (kind === 'cine') e2e.push('tests/e2e/cinema-release-carousel.spec.ts');
		run('npx', ['playwright', 'test', ...e2e, '--project=desktop-chromium', '--project=mobile-chromium', '--workers=2']);
		run('git', ['diff', '--check']);
		const updatedReceipt = {
			...checked,
			url: `https://www.cineposta.com.ar/editorial/${draft.slug}/`,
			movieUrls: draft.report.includedSlugs.map(slug => `https://www.cineposta.com.ar/peliculas/${slug}/`),
			validation: { content: 'passed', astroCheck: 'passed', build: 'passed', editorialAndHomeDesktopMobile: 'passed', posterSourcePolicy: 'passed' },
			base: baseline,
		};
		mkdirSync(path.dirname(path.join(root, receiptPath)), { recursive: true });
		writeFileSync(path.join(root, receiptPath), `${JSON.stringify(updatedReceipt, null, 2)}\n`);
		const paths = [...new Set([...changes.map(change => change.path), receiptPath])].sort();
		const files = Object.fromEntries(paths.map(file => [file, fileDigest(file)]));
		const proof = { kind, date, base: baseline, slug: draft.slug, receiptPath, paths, files, validatedAt: new Date().toISOString(), execution: draft.execution };
		writeFileSync(proofPath, `${JSON.stringify(proof, null, 2)}\n`);
		console.log(JSON.stringify({ action: 'validated', proof: proofPath, ...proof, candidateCount: checked.candidateCount, includedCount: checked.includedCount }, null, 2));
	} finally {
		rmSync(lockPath, { recursive: true, force: true });
	}
}

function checkProof() {
	const proof = readJson(proofPath);
	if (proof.kind !== kind || proof.date !== date) throw new Error('El proof corresponde a otra semana.');
	run('git', ['fetch', 'origin', 'main']);
	if (git('rev-parse', 'HEAD') !== proof.base) throw new Error('HEAD ya no es la base validada. Rebaseá sin descartar cambios y revalidá esta misma guía.');
	if (git('rev-parse', 'origin/main') !== proof.base) throw new Error('origin/main cambió después del build. Rebaseá sin descartar cambios y revalidá esta misma guía.');
	const actual = getChanged().map(change => change.path).sort();
	if (actual.join('\n') !== [...proof.paths].sort().join('\n')) throw new Error('El conjunto exacto de archivos cambió después del build. Revalidar antes de publicar.');
	for (const [file, digest] of Object.entries(proof.files)) if (fileDigest(file) !== digest) throw new Error(`Cambió ${file} después de la validación. Revalidar antes de publicar.`);
	console.log(JSON.stringify({ action: 'proof-valid', proof: proofPath, base: proof.base, paths: proof.paths, buildAndChecks: 'passed' }, null, 2));
}

try {
	if (command === 'window') console.log(JSON.stringify(getWeeklyReleasePeriod(kind, date), null, 2));
	else if (command === 'resume') resume();
	else if (command === 'attest-completion') attestCompletion();
	else if (command === 'validate') await validate();
	else if (command === 'check-proof') checkProof();
	else throw new Error('Uso: node scripts/cineposta-weekly-release.mjs window|resume|attest-completion|validate|check-proof cine|plataformas YYYY-MM-DD');
} catch (error) {
	console.error(error.message);
	process.exitCode = 1;
}
