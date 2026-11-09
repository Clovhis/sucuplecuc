import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export const FIRST_PAGES_CHECK_DELAY_MS = 10 * 60 * 1000;
export const MAX_WEEKLY_RECOVERY_CYCLES = 2;
export const DEFAULT_PAGES_TIMEOUT_MS = 45 * 60 * 1000;
export const DEFAULT_POLL_INTERVAL_MS = 90 * 1000;

export function createSupervisionState({ kind, date, sha, slug, title, articleUrl, coverPath, movieSlugs = [], homeSlugs = [], repository, requestedAt = new Date().toISOString() }) {
	if (!['cine', 'plataformas'].includes(kind)) throw new Error('Tipo de guía inválido para supervisión.');
	if (!/^\d{4}-\d{2}-\d{2}$/u.test(date ?? '') || !/^[0-9a-f]{40}$/iu.test(sha ?? '')) throw new Error('Fecha o SHA inválido para supervisión.');
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(slug ?? '') || !title?.trim() || articleUrl !== `https://www.cineposta.com.ar/editorial/${slug}/`) throw new Error('Falta una nota de producción válida para verificar.');
	if (!/^public\/assets\/editorial\/[a-z0-9-]+\/[a-z0-9-]+\.webp$/u.test(coverPath ?? '') || !coverPath.includes(`/${slug}/`)) throw new Error('La portada esperada debe ser WebP local de esta nota.');
	if (movieSlugs.some(value => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(value)) || homeSlugs.some(value => !movieSlugs.includes(value))) throw new Error('Las fichas del home deben ser parte de la guía y usar slugs válidos.');
	return {
		version: 1, kind, date, sha: sha.toLowerCase(), slug, title, articleUrl,
		coverPath, coverUrl: `https://www.cineposta.com.ar/${coverPath.replace(/^public\//u, '')}`, movieSlugs: [...new Set(movieSlugs)], homeSlugs: [...new Set(homeSlugs)],
		repository: repository || 'Clovhis/sucuplecuc', requestedAt,
		firstCheckNotBefore: new Date(Date.parse(requestedAt) + FIRST_PAGES_CHECK_DELAY_MS).toISOString(),
		status: 'waiting', infraDispatches: 0, recoveryCycles: 0, corrections: [], observations: [],
	};
}

export function readSupervisionState(path) {
	return JSON.parse(readFileSync(path, 'utf8'));
}

export function writeSupervisionState(path, state) {
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, `${JSON.stringify(state, null, 2)}\n`);
}

function requireCurrentSha(state, sha) {
	if (sha !== state.sha) throw new Error('La respuesta de Pages pertenece a otro SHA.');
}

export function checkPublishedEditorialHtml(state, html) {
	const canonical = html.match(/<link\b(?=[^>]*\brel=["']canonical["'])(?=[^>]*\bhref=["']([^"']+)["'])[^>]*>/iu)?.[1];
	const hasDate = html.includes(`datetime="${state.date}"`);
	const hasTitle = html.includes(state.title);
	const imagePath = new URL(state.coverUrl).pathname;
	const hasCover = html.includes(imagePath) || html.includes(imagePath.replace(/^\//u, ''));
	if (canonical !== state.articleUrl || !hasDate || !hasTitle || !hasCover) {
		return { ok: false, error: 'La nota pública no coincide en canonical, título, fecha o portada.', canonical, hasDate, hasTitle, hasCover };
	}
	return { ok: true, articleUrl: state.articleUrl, coverUrl: state.coverUrl, canonical, title: state.title, date: state.date, movieSlugs: state.movieSlugs };
}

export function checkPublishedHomeMovieLinks(movieSlugs, html) {
	const missingMovieLinks = movieSlugs.filter(slug => !html.includes(`/peliculas/${slug}/`));
	return missingMovieLinks.length ? { ok: false, error: 'La portada de CinePosta todavía no enlaza todas las fichas semanales.', missingMovieLinks } : { ok: true, checkedMovieSlugs: [...movieSlugs] };
}

export function checkPublishedMoviePage(slug, title, html) {
	const expectedUrl = `https://www.cineposta.com.ar/peliculas/${slug}/`;
	const canonical = html.match(/<link\b(?=[^>]*\brel=["']canonical["'])(?=[^>]*\bhref=["']([^"']+)["'])[^>]*>/iu)?.[1];
	const hasTitle = html.includes(title);
	return canonical === expectedUrl && hasTitle ? { ok: true, slug, canonical } : { ok: false, slug, canonical, hasTitle, error: `La ficha pública de ${slug} todavía no coincide con canonical y título.` };
}

/**
 * Waits without GitHub reads for ten full minutes, then checks the exact SHA and
 * public article/cover. All time, GitHub, and production operations are injected
 * so simulations never publish fictional content or contact external services.
 */
export async function superviseWeeklyPages(state, {
	now = () => Date.now(),
	wait = ms => new Promise(resolveWait => setTimeout(resolveWait, ms)),
	getRuns,
	getJobs,
	checkRemoteMain,
	dispatch,
	verifyProduction,
	writeState = () => {},
	timeoutMs = DEFAULT_PAGES_TIMEOUT_MS,
	pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
	firstDelayMs = FIRST_PAGES_CHECK_DELAY_MS,
	} = {}) {
	if (!getRuns || !getJobs || !checkRemoteMain || !dispatch || !verifyProduction) throw new Error('El supervisor requiere sus conectores de estado y producción.');
	const requested = Date.parse(state.requestedAt);
	if (!Number.isFinite(requested)) throw new Error('El momento del push/disparo no es válido.');
	const firstCheck = Math.max(requested + firstDelayMs, Date.parse(state.firstCheckNotBefore) || 0);
	state.status = 'waiting';
	writeState(state);
	if (now() < firstCheck) await wait(firstCheck - now());
	if (now() < firstCheck) throw new Error('La espera mínima de diez minutos no se completó; se conserva el estado para reanudar.');
	const deadline = requested + timeoutMs;
	let dispatchedAt = null;
	while (now() < deadline) {
		let runs;
		try { runs = await getRuns(state.repository, state.sha); }
		catch {
			state.status = 'blocked';
			state.failure = { kind: 'github-access', message: 'No se pudo consultar Actions. Revisar gh auth status, permisos del repo y conectividad del entorno; no reintentar contenido.' };
			writeState(state);
			throw new Error(`${state.failure.message} SHA ${state.sha}.`);
		}
		const run = [...runs]
			.filter(item => item.head_sha === state.sha)
			.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at) || (b.run_attempt || 0) - (a.run_attempt || 0))[0];
		if (!run) {
			if (state.infraDispatches >= 1) {
				state.status = 'blocked';
				state.failure = 'GitHub no muestra el deploy del SHA tras la recuperación manual.';
				writeState(state);
				throw new Error(`${state.failure} Revisar credenciales/permisos y Actions; SHA ${state.sha}.`);
			}
			const remoteSha = await checkRemoteMain(state.repository);
			requireCurrentSha(state, remoteSha);
			await dispatch(state.repository, state.sha);
			state.infraDispatches += 1;
			dispatchedAt = now();
			state.firstCheckNotBefore = new Date(dispatchedAt + firstDelayMs).toISOString();
			state.observations.push({ at: new Date(dispatchedAt).toISOString(), kind: 'infra-dispatch', sha: state.sha });
			writeState(state);
			await wait(firstDelayMs);
			if (now() < dispatchedAt + firstDelayMs) throw new Error('La espera posterior a workflow_dispatch quedó incompleta; reanudar con el mismo estado.');
			continue;
		}
		state.run = { id: run.id, runAttempt: run.run_attempt || 1, url: run.html_url, status: run.status, conclusion: run.conclusion, createdAt: run.created_at };
		state.observations.push({ at: new Date(now()).toISOString(), kind: 'workflow-status', id: run.id, runAttempt: run.run_attempt || 1, status: run.status, conclusion: run.conclusion });
		writeState(state);
		if (run.status === 'completed') {
			if (run.conclusion !== 'success') {
				const jobs = await getJobs(state.repository, run.id);
				state.status = 'failed';
				state.failure = { conclusion: run.conclusion, failedJobs: jobs.filter(job => job.conclusion === 'failure').map(job => ({ name: job.name, url: job.html_url, failedSteps: (job.steps || []).filter(step => step.conclusion === 'failure').map(step => step.name) })), runUrl: run.html_url };
				writeState(state);
				throw new Error(`Pages ${run.conclusion} para ${state.sha}: ${JSON.stringify(state.failure)}`);
			}
			const jobs = await getJobs(state.repository, run.id);
			const buildJob = jobs.find(job => job.name === 'build');
			const deployJob = jobs.find(job => job.name === 'deploy');
			if (!buildJob || buildJob.conclusion !== 'success' || !deployJob || deployJob.conclusion !== 'success') {
				state.status = 'blocked';
				state.failure = { kind: 'pages-jobs', build: buildJob?.conclusion ?? 'missing', deploy: deployJob?.conclusion ?? 'missing', runUrl: run.html_url };
				writeState(state);
				throw new Error(`El run no confirmó los jobs build/deploy correctos para ${state.sha}: ${JSON.stringify(state.failure)}`);
			}
			const online = await verifyProduction(state);
			if (online?.ok) {
				state.status = 'online';
				state.production = online;
				state.completedAt = new Date(now()).toISOString();
				writeState(state);
				return state;
			}
			state.lastProductionCheck = { at: new Date(now()).toISOString(), ...online };
			writeState(state);
		}
		const remaining = deadline - now();
		if (remaining <= 0) break;
		await wait(Math.min(pollIntervalMs, remaining));
	}
	state.status = 'timeout';
	state.failure = `Pages no confirmó SHA ${state.sha} y nota ${state.articleUrl} en ${Math.round(timeoutMs / 60_000)} minutos.`;
	writeState(state);
	throw new Error(`${state.failure} Revisar ${state.run?.url || 'Actions'} y reanudar esta misma tarea.`);
}

export function recordRecoveryCycle(state, { kind, reason, sha, changesPresent, now = new Date().toISOString() }) {
	if (!['code', 'dependencies', 'configuration', 'infrastructure'].includes(kind)) throw new Error('Clasificación de recuperación inválida.');
	if (state.recoveryCycles >= MAX_WEEKLY_RECOVERY_CYCLES) throw new Error('Se agotaron los dos ciclos de recuperación permitidos.');
	if (kind === 'infrastructure' && (sha !== state.sha || changesPresent)) throw new Error('Un reintento de infraestructura conserva el mismo SHA y no cambia archivos.');
	if (kind !== 'infrastructure' && (sha === state.sha || !changesPresent)) throw new Error('Una corrección de código/dependencias/configuración debe validar y publicar un nuevo SHA.');
	state.recoveryCycles += 1;
	state.corrections.push({ cycle: state.recoveryCycles, kind, reason: String(reason || '').slice(0, 1000), fromSha: state.sha, toSha: kind === 'infrastructure' ? state.sha : sha, at: now });
	state.status = 'recovery-ready';
	return state;
}

export function assertWeeklyLockCanBeCreated(lockPath, { mkdir = mkdirSync } = {}) {
	try {
		mkdir(lockPath);
		return true;
	} catch (error) {
		if (error.code === 'EEXIST') throw new Error(`Otra ejecución semanal conserva el lock ${lockPath}; inspeccioná su estado antes de reanudar.`);
		throw error;
	}
}

export function fileDigest(path) {
	return createHash('sha256').update(readFileSync(path)).digest('hex');
}

export function hasUncommittedContentChanges(paths) {
	return paths.some(path => /^src\/data\/(?:movies|people\.json|editorials)\//u.test(path) || /^public\/(?:assets\/(?:editorial|posters)|people)\//u.test(path));
}
