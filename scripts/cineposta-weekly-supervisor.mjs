import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSupervisionState, readSupervisionState, writeSupervisionState, superviseWeeklyPages, recordRecoveryCycle, checkPublishedEditorialHtml, checkPublishedHomeMovieLinks, checkPublishedMoviePage, fileDigest } from './lib/weekly-deployment-supervisor.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const command = args.shift();
const option = name => {
	const index = args.indexOf(`--${name}`);
	return index < 0 ? undefined : args[index + 1];
};
const has = name => args.includes(`--${name}`);
const validDate = value => /^\d{4}-\d{2}-\d{2}$/u.test(value ?? '');
const stateFile = (kind, date) => resolve(root, '.tmp/cineposta-weekly/supervision', `${kind}-${date}.json`);
const run = (commandName, commandArgs, cwd = root, encoding = 'utf8') => execFileSync(commandName, commandArgs, { cwd, encoding, maxBuffer: 10 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const gh = (...commandArgs) => run('gh', commandArgs);
const repository = 'Clovhis/sucuplecuc';

function fail(message) { console.error(message); process.exitCode = 1; }

function recoveryPaths(fromSha, toSha) {
	return run('git', ['diff', '--name-only', `${fromSha}..${toSha}`]).split('\n').filter(Boolean);
}

function assertCodeRecoveryPaths(paths) {
	const allowed = /^(?:scripts\/|src\/(?:components|lib|pages|scripts|styles|types)\/|\.github\/workflows\/|skills\/cineposta-cloud-estrenos-(?:cine|plataformas)\/|plugins\/la-posta-cine\/skills\/cineposta-cloud-estrenos-(?:cine|plataformas)\/|config\/weekly-release-(?:cine|plataformas)(?:-prompt)?\.(?:json|md)$|docs\/weekly-release-automation\.md$|README\.md$|package(?:-lock)?\.json$|astro\.config\.mjs$|playwright\.config\.ts$|tsconfig\.json$)/u;
	if (!paths.length || paths.some(file => !allowed.test(file))) throw new Error('El ciclo de corrección sólo admite código, dependencias o configuración semanal; no cambies fichas, notas, assets ni recibos para corregir Pages.');
}

async function start() {
	const kind = option('kind');
	const date = option('date');
	const sha = option('sha');
	const slug = option('slug');
	const title = option('title');
	const coverPath = option('cover-path');
	const movieSlugs = (option('movie-slugs') || '').split(',').map(value => value.trim()).filter(Boolean);
	const homeSlugs = (option('home-slugs') || '').split(',').map(value => value.trim()).filter(Boolean);
	if (!['cine', 'plataformas'].includes(kind) || !validDate(date)) throw new Error('Uso: start --kind cine|plataformas --date YYYY-MM-DD --sha SHA --slug SLUG --title TÍTULO --cover-path public/assets/editorial/SLUG/COVER.webp');
	if (!movieSlugs.length) throw new Error('start requiere todos los movie-slugs incluidos; home-slugs puede quedar vacío si la validación confirma que el carrusel no muestra ninguno.');
	const articleUrl = `https://www.cineposta.com.ar/editorial/${slug}/`;
	const target = stateFile(kind, date);
	mkdirSync(dirname(target), { recursive: true });
	let recoveryCycles = 0;
	let corrections = [];
	if (existsSync(target)) {
		const previous = readSupervisionState(target);
		if (previous.sha === sha && previous.slug === slug) {
			console.log(JSON.stringify(previous, null, 2));
			return;
		}
		if (!['failed', 'blocked', 'timeout', 'recovery-ready'].includes(previous.status)) throw new Error(`La supervisión ${target} sigue activa; no inicio otro SHA mientras espera el resultado.`);
		if (previous.status === 'recovery-ready') {
			const last = previous.corrections?.at(-1);
			if (last?.toSha !== sha) throw new Error('El SHA de start no coincide con la corrección ya registrada; completá las validaciones y conservá ese SHA.');
			recoveryCycles = previous.recoveryCycles;
			corrections = previous.corrections;
		} else {
			const recoveryType = option('recovery-type');
			const reason = option('reason');
			if (!reason || !['code', 'dependencies', 'configuration'].includes(recoveryType)) throw new Error('Para sustituir un SHA fallido, informá --recovery-type code|dependencies|configuration y --reason.');
			const paths = recoveryPaths(previous.sha, sha);
			assertCodeRecoveryPaths(paths);
			const updated = recordRecoveryCycle(previous, { kind: recoveryType, reason, sha, changesPresent: true });
			recoveryCycles = updated.recoveryCycles;
			corrections = updated.corrections;
		}
	}
	const state = createSupervisionState({ kind, date, sha, slug, title, articleUrl, coverPath, movieSlugs, homeSlugs, repository });
	state.recoveryCycles = recoveryCycles;
	state.corrections = corrections;
	state.localCoverPath = coverPath;
	state.localCoverDigest = fileDigest(resolve(root, coverPath));
	state.localCoverBytes = readFileSync(resolve(root, coverPath)).length;
	writeSupervisionState(target, state);
	console.log(`Supervisión creada para ${state.sha}; primera consulta de GitHub no antes de ${state.firstCheckNotBefore}. Estado: ${target}`);
}

function runSummary(kind, date) {
	const target = stateFile(kind, date);
	if (!existsSync(target)) throw new Error(`No hay estado de supervisión en ${target}.`);
	return { target, state: readSupervisionState(target) };
}

async function supervise() {
	const kind = option('kind');
	const date = option('date');
	const { target, state } = runSummary(kind, date);
	const write = updated => writeSupervisionState(target, updated);
	const checkRemoteMain = async () => run('git', ['ls-remote', 'origin', 'refs/heads/main']).split(/\s/u)[0];
	const getRuns = async (repo, sha) => {
		const data = JSON.parse(gh('api', `repos/${repo}/actions/workflows/deploy.yml/runs?head_sha=${sha}&per_page=100`));
		return data.workflow_runs || [];
	};
	const getJobs = async (repo, runId) => JSON.parse(gh('api', `repos/${repo}/actions/runs/${runId}/jobs?per_page=100`)).jobs || [];
	const dispatch = async (repo, sha) => {
		if (await checkRemoteMain() !== sha) throw new Error('origin/main avanzó; no disparo Pages para otra revisión. Reintegrá y volvé a validar.');
		gh('api', `repos/${repo}/actions/workflows/deploy.yml/dispatches`, '--method', 'POST', '--field', 'ref=main');
	};
	const verifyProduction = async expected => {
		const directory = resolve(root, '.tmp/cineposta-weekly/production', `${expected.kind}-${expected.date}`);
		mkdirSync(directory, { recursive: true });
		const htmlPath = resolve(directory, 'editorial.html');
		const homePath = resolve(directory, 'home.html');
		const imagePath = resolve(directory, 'cover.webp');
		const curl = ['--fail', '--silent', '--show-error', '--location', '--max-time', '45', '--proto', '=https', '--proto-redir', '=https'];
		try {
			run('curl', [...curl, '--output', htmlPath, expected.articleUrl]);
			const html = readFileSync(htmlPath, 'utf8');
			const articleCheck = checkPublishedEditorialHtml(expected, html);
			if (!articleCheck.ok) return articleCheck;
			run('curl', [...curl, '--output', homePath, 'https://www.cineposta.com.ar/']);
			const homeCheck = checkPublishedHomeMovieLinks(expected.homeSlugs, readFileSync(homePath, 'utf8'));
			if (!homeCheck.ok) return homeCheck;
			const movieChecks = [];
			for (const movieSlug of expected.movieSlugs) {
				const moviePath = resolve(directory, `${movieSlug}.html`);
				const movieUrl = `https://www.cineposta.com.ar/peliculas/${movieSlug}/`;
				run('curl', [...curl, '--output', moviePath, movieUrl]);
				const movie = JSON.parse(readFileSync(resolve(root, 'src/data/movies', `${movieSlug}.json`), 'utf8'));
				const movieCheck = checkPublishedMoviePage(movieSlug, movie.title, readFileSync(moviePath, 'utf8'));
				if (!movieCheck.ok) return movieCheck;
				movieChecks.push(movieCheck);
			}
			run('curl', [...curl, '--output', imagePath, expected.coverUrl]);
			const remoteImage = readFileSync(imagePath);
			const remoteDigest = createHash('sha256').update(remoteImage).digest('hex');
			if (remoteDigest !== expected.localCoverDigest) return { ok: false, error: 'La portada pública no coincide byte a byte con el asset validado.', remoteDigest, expectedDigest: expected.localCoverDigest };
			const sharp = (await import('sharp')).default;
			const metadata = await sharp(remoteImage).metadata();
			if (!metadata.width || !metadata.height || !['webp', 'jpeg', 'png', 'avif'].includes(metadata.format)) return { ok: false, error: 'La portada pública no se decodifica como imagen.', metadata };
			return { ...articleCheck, home: homeCheck, movies: movieChecks, image: { format: metadata.format, width: metadata.width, height: metadata.height, bytes: remoteImage.length, sha256: remoteDigest } };
		} catch (error) {
			return { ok: false, error: String(error.message).slice(0, 500) };
		}
	};
	const result = await superviseWeeklyPages(state, { getRuns, getJobs, checkRemoteMain, dispatch, verifyProduction, writeState: write });
	console.log(JSON.stringify(result, null, 2));
}

function recover() {
	const kind = option('kind');
	const date = option('date');
	const type = option('type');
	const reason = option('reason');
	const { target, state } = runSummary(kind, date);
	if (!reason) throw new Error('Indicá --reason con la causa real y el cambio aplicado.');
	const head = run('git', ['rev-parse', 'HEAD']);
	const sha = option('sha') || head;
	if (sha !== head) throw new Error('--sha debe coincidir con el commit validado actualmente en HEAD.');
	if (!['failed', 'blocked', 'timeout'].includes(state.status)) throw new Error('record-recovery requiere una supervisión fallida, bloqueada o agotada.');
	if (run('git', ['status', '--porcelain=v1', '-z'])) throw new Error('Registrá la corrección después de validarla y commitearla; record-recovery no acepta cambios locales sin commit.');
	const paths = recoveryPaths(state.sha, sha);
	assertCodeRecoveryPaths(paths);
	const updated = recordRecoveryCycle(state, { kind: type, reason, sha, changesPresent: true });
	writeSupervisionState(target, updated);
	console.log(JSON.stringify(updated, null, 2));
}

async function retryInfrastructure() {
	const kind = option('kind');
	const date = option('date');
	const reason = option('reason');
	const { target, state } = runSummary(kind, date);
	if (!reason) throw new Error('Indicá --reason con el diagnóstico de infraestructura.');
	if (!['failed', 'blocked', 'timeout', 'recovery-ready'].includes(state.status)) throw new Error('El reintento de infraestructura requiere un run fallido o agotado.');
	const sha = run('git', ['rev-parse', 'HEAD']);
	if (sha !== state.sha) throw new Error('Hay un SHA nuevo; validá, publicá y usá start con el ciclo de corrección correspondiente.');
	const remoteSha = run('git', ['ls-remote', 'origin', 'refs/heads/main']).split(/\s/u)[0];
	if (remoteSha !== state.sha) throw new Error('origin/main ya no apunta al SHA validado; integrá el cambio y volvé a validar.');
	const dirty = run('git', ['status', '--porcelain']);
	if (dirty) throw new Error('El reintento de infraestructura no acepta archivos cambiados; conservar el mismo contenido y SHA.');
	const updated = recordRecoveryCycle(state, { kind: 'infrastructure', reason, sha, changesPresent: false });
	updated.status = 'recovery-ready';
	writeSupervisionState(target, updated);
	gh('api', `repos/${repository}/actions/workflows/deploy.yml/dispatches`, '--method', 'POST', '--field', 'ref=main');
	updated.requestedAt = new Date().toISOString();
	updated.firstCheckNotBefore = new Date(Date.parse(updated.requestedAt) + 10 * 60_000).toISOString();
	updated.run = null;
	updated.failure = undefined;
	updated.status = 'waiting';
	updated.infraDispatches = 0;
	updated.observations.push({ at: updated.requestedAt, kind: 'infra-retry-dispatch', sha: updated.sha, cycle: updated.recoveryCycles });
	writeSupervisionState(target, updated);
	console.log(`Reintento de Pages despachado sobre el mismo SHA ${updated.sha}; no se consultará GitHub durante diez minutos. Estado: ${target}`);
}

try {
	if (command === 'start') await start();
	else if (command === 'supervise') await supervise();
	else if (command === 'record-recovery') recover();
	else if (command === 'retry-infra') await retryInfrastructure();
	else throw new Error('Uso: node scripts/cineposta-weekly-supervisor.mjs start|supervise|record-recovery|retry-infra [opciones].');
} catch (error) { fail(error.message); }
