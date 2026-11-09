import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { createSupervisionState, checkPublishedEditorialHtml, checkPublishedHomeMovieLinks, checkPublishedMoviePage, superviseWeeklyPages, recordRecoveryCycle, FIRST_PAGES_CHECK_DELAY_MS, MAX_WEEKLY_RECOVERY_CYCLES } from './lib/weekly-deployment-supervisor.mjs';
import { assertWeeklyLockCanBeCreated } from './lib/weekly-deployment-supervisor.mjs';

const request = { kind: 'cine', date: '2026-11-12', sha: 'a'.repeat(40), slug: 'estrenos-cines-12-noviembre-2026', title: 'Estrenos de cine del 12 al 18 de noviembre', articleUrl: 'https://www.cineposta.com.ar/editorial/estrenos-cines-12-noviembre-2026/', coverPath: 'public/assets/editorial/estrenos-cines-12-noviembre-2026/portada.webp', movieSlugs: ['pelicula-a-2026'], requestedAt: '2026-11-12T13:00:00.000Z' };

test('production HTML must publish the canonical, date, guide cover and linked movie fichas', () => {
	const state = createSupervisionState(request);
	const html = `<head><link rel="canonical" href="${state.articleUrl}"></head><h1>${state.title}</h1><time datetime="${state.date}"></time><img src="/assets/editorial/${request.slug}/portada.webp">`;
	assert.deepEqual(checkPublishedEditorialHtml(state, html), { ok: true, articleUrl: state.articleUrl, coverUrl: state.coverUrl, canonical: state.articleUrl, title: state.title, date: state.date, movieSlugs: ['pelicula-a-2026'] });
	assert.equal(checkPublishedEditorialHtml(state, html.replace('/portada.webp', '/otra.webp')).hasCover, false);
	assert.deepEqual(checkPublishedHomeMovieLinks(['pelicula-a-2026'], '<a href="/peliculas/otra/">Peli</a>').missingMovieLinks, ['pelicula-a-2026']);
	assert.equal(checkPublishedMoviePage('pelicula-a-2026', 'Peli', '<link rel="canonical" href="https://www.cineposta.com.ar/peliculas/pelicula-a-2026/"><h1>Peli</h1>').ok, true);
	assert.equal(checkPublishedEditorialHtml(state, html.replace(`datetime="${state.date}"`, 'datetime="2026-11-11"')).hasDate, false);
});

test('the first GitHub lookup is blocked until a full ten-minute quiet wait', async () => {
	const state = createSupervisionState(request);
	let clock = Date.parse(request.requestedAt);
	const events = [];
	const result = await superviseWeeklyPages(state, {
		now: () => clock,
		wait: async ms => { events.push(`wait:${ms}`); clock += ms; },
		getRuns: async (_repo, sha) => { events.push('github-query'); return [{ id: 123, run_attempt: 1, head_sha: sha, created_at: new Date(clock).toISOString(), status: 'completed', conclusion: 'success', html_url: 'https://github.com/Clovhis/sucuplecuc/actions/runs/123' }]; },
		getJobs: async () => [{ name: 'build', conclusion: 'success' }, { name: 'deploy', conclusion: 'success' }],
		checkRemoteMain: async () => { throw new Error('no dispatch expected'); },
		dispatch: async () => { throw new Error('no dispatch expected'); },
		verifyProduction: async () => { events.push('production-check'); return { ok: true, articleUrl: state.articleUrl }; },
		writeState: () => events.push(`save:${state.status}`),
	});
	assert.equal(result.status, 'online');
	assert.ok(events.indexOf(`wait:${FIRST_PAGES_CHECK_DELAY_MS}`) > events.indexOf('save:waiting'));
	assert.ok(events.indexOf('github-query') > events.indexOf(`wait:${FIRST_PAGES_CHECK_DELAY_MS}`));
	assert.equal(state.run.id, 123);
});

test('missing push workflow dispatches the exact main SHA, then stays quiet for another ten minutes', async () => {
	const state = createSupervisionState(request);
	let clock = Date.parse(request.requestedAt);
	const events = [];
	const result = await superviseWeeklyPages(state, {
		now: () => clock,
		wait: async ms => { events.push(`wait:${ms}`); clock += ms; },
		getRuns: async (_repo, sha) => {
			events.push('github-query');
			if (events.filter(item => item === 'github-query').length === 1) return [];
			return [{ id: 124, run_attempt: 1, head_sha: sha, created_at: new Date(clock).toISOString(), status: 'completed', conclusion: 'success', html_url: 'https://github.com/Clovhis/sucuplecuc/actions/runs/124' }];
		},
		getJobs: async () => [{ name: 'build', conclusion: 'success' }, { name: 'deploy', conclusion: 'success' }],
		checkRemoteMain: async () => { events.push('check-main'); return state.sha; },
		dispatch: async (_repo, sha) => { assert.equal(sha, state.sha); events.push('dispatch'); },
		verifyProduction: async () => ({ ok: true }),
		writeState: () => {},
	});
	assert.equal(result.status, 'online');
	assert.deepEqual(events.filter(item => item.startsWith('wait:')), [`wait:${FIRST_PAGES_CHECK_DELAY_MS}`, `wait:${FIRST_PAGES_CHECK_DELAY_MS}`]);
	assert.ok(events.indexOf('dispatch') < events.lastIndexOf(`wait:${FIRST_PAGES_CHECK_DELAY_MS}`));
	assert.equal(state.infraDispatches, 1);
});

test('ongoing workflow resumes with latest same-SHA run and bounded recovery cycles', async () => {
	const state = createSupervisionState(request);
	state.firstCheckNotBefore = request.requestedAt;
	let clock = Date.parse(request.requestedAt) + FIRST_PAGES_CHECK_DELAY_MS;
	const runs = [
		{ id: 125, run_attempt: 1, head_sha: state.sha, created_at: '2026-11-11T13:00:00.000Z', status: 'completed', conclusion: 'failure', html_url: 'old' },
		{ id: 126, run_attempt: 1, head_sha: state.sha, created_at: new Date(clock).toISOString(), status: 'in_progress', conclusion: null, html_url: 'new' },
	];
	await assert.rejects(superviseWeeklyPages(state, {
		now: () => clock,
		wait: async ms => { clock += ms; },
		getRuns: async () => runs,
		getJobs: async () => [],
		checkRemoteMain: async () => state.sha,
		dispatch: async () => {},
		verifyProduction: async () => ({ ok: false }),
		writeState: () => {},
		timeoutMs: 15 * 60_000,
		pollIntervalMs: 10,
		firstDelayMs: 0,
	}), /15 minutos/u);
	assert.equal(state.run.id, 126);
	for (let i = 0; i < MAX_WEEKLY_RECOVERY_CYCLES; i++) recordRecoveryCycle(state, { kind: 'infrastructure', reason: `infra ${i + 1}`, sha: state.sha, changesPresent: false });
	assert.equal(state.recoveryCycles, 2);
	assert.throws(() => recordRecoveryCycle(state, { kind: 'infrastructure', reason: 'exceso', sha: state.sha, changesPresent: false }), /dos ciclos/u);
	assert.throws(() => recordRecoveryCycle(createSupervisionState(request), { kind: 'infrastructure', reason: 'contenido cambiado', sha: state.sha, changesPresent: true }), /mismo SHA/u);
});

test('a code/config repair needs a new validated SHA; infra recovery cannot change files', () => {
	const state = createSupervisionState(request);
	const codeFix = recordRecoveryCycle(state, { kind: 'configuration', reason: 'corregir script de build', sha: 'b'.repeat(40), changesPresent: true });
	assert.equal(codeFix.recoveryCycles, 1);
	assert.throws(() => recordRecoveryCycle(state, { kind: 'code', reason: 'sin cambio', sha: state.sha, changesPresent: false }), /nuevo SHA/u);
	assert.throws(() => recordRecoveryCycle(state, { kind: 'infrastructure', reason: 'cambiar archivo', sha: state.sha, changesPresent: true }), /mismo SHA/u);
});

test('a failed build returns the failed job and steps to the same caller for correction', async () => {
	const state = createSupervisionState(request);
	let clock = Date.parse(state.firstCheckNotBefore);
	await assert.rejects(superviseWeeklyPages(state, {
		now: () => clock,
		wait: async ms => { clock += ms; },
		getRuns: async (_repo, sha) => [{ id: 130, run_attempt: 1, head_sha: sha, created_at: new Date(clock).toISOString(), status: 'completed', conclusion: 'failure', html_url: 'https://github.com/Clovhis/sucuplecuc/actions/runs/130' }],
		getJobs: async () => [{ name: 'build', conclusion: 'failure', html_url: 'https://github.com/Clovhis/sucuplecuc/actions/runs/130/job/1', steps: [{ name: 'Install dependencies', conclusion: 'failure' }] }, { name: 'deploy', conclusion: 'skipped', steps: [] }],
		checkRemoteMain: async () => state.sha,
		dispatch: async () => {},
		verifyProduction: async () => ({ ok: false }),
		writeState: () => {},
	}), /Install dependencies/u);
	assert.equal(state.status, 'failed');
	assert.deepEqual(state.failure.failedJobs[0].failedSteps, ['Install dependencies']);
});

test('a run lock rejects concurrent weekly writers until the first lock is inspected and released', () => {
	const directory = mkdtempSync(resolve(tmpdir(), 'cineposta-weekly-lock-'));
	const lock = resolve(directory, 'run.lock');
	try {
		assert.equal(assertWeeklyLockCanBeCreated(lock), true);
		assert.throws(() => assertWeeklyLockCanBeCreated(lock), /Otra ejecución semanal/u);
	} finally { rmSync(directory, { recursive: true, force: true }); }
});
