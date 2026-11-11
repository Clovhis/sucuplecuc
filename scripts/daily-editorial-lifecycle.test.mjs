import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { hostname } from 'node:os';
import { resolve } from 'node:path';
import { argentinaDate, digest } from './lib/daily-editorial-policy.mjs';
import {
	createDailyOrchestratorFixture, fixtureCandidate, fixtureEvidence,
	writeFixtureArticle, replaceFixtureImage, approvedCandidateReport, approvedArticleReview, adverseReview,
} from './test-helpers/daily-orchestrator-fixture.mjs';

const stateOf = fixture => {
	const envelope = JSON.parse(readFileSync(fixture.sessionFile, 'utf8'));
	assert.equal(envelope.digest, digest(JSON.stringify(envelope.day)), 'persisted session digest must match its full state');
	return envelope.day;
};
const outputOf = result => `${result.stdout || ''}\n${result.stderr || ''}`;
const succeeds = (result, detail = 'CLI command should complete') => assert.equal(result.status, 0, `${detail}\n${outputOf(result)}`);
const rejects = (result, pattern, detail = 'CLI command should be rejected') => {
	assert.notEqual(result.status, 0, `${detail}\n${outputOf(result)}`);
	assert.match(outputOf(result), pattern, `${detail}; expected diagnostic ${pattern}`);
};
const asJson = value => JSON.parse(JSON.stringify(value));
const historyNote = ({ slug, date, title, excerpt = 'Historical CinePosta coverage kept for full-history tests.', topicKey, kind = 'nota', entityIds = [] }) => ({
	slug, date, title, excerpt, type: 'nota', kind, sources: [{ label: 'Archivo histórico sintético', url: `https://history.example/${slug}` }],
	...(topicKey ? { topicKey } : {}), ...(entityIds.length ? { entityIds } : {}), content: [],
});
const daysAgo = (date, amount) => {
	const value = new Date(`${date}T12:00:00Z`);
	value.setUTCDate(value.getUTCDate() - amount);
	return value.toISOString().slice(0, 10);
};

async function withFixture(run, options) {
	const fixture = await createDailyOrchestratorFixture(options);
	try { await run(fixture); } finally { fixture.cleanup(); }
}

function writeNativePair(fixture) {
	fixture.writeJson('.tmp/cineposta-daily/native-execution.json', fixture.authorExecution());
}

function submitReview(fixture, report, execution = fixture.reviewerExecution()) {
	fixture.writeJson('.tmp/cineposta-daily/factual-review.json', report);
	fixture.writeJson('.tmp/cineposta-daily/native-review-execution.json', execution);
	return fixture.execute('--record-review');
}

function startCandidate(fixture, candidate = fixtureCandidate(fixture.today)) {
	const prepared = fixture.execute('--prepare');
	succeeds(prepared, 'prepare the isolated daily worktree');
	writeNativePair(fixture);
	fixture.writeJson('.tmp/cineposta-daily/candidate.json', candidate);
	const frozen = fixture.execute('--candidate');
	succeeds(frozen, 'freeze candidate and complete-history preflight');
	return fixture.readJson('.tmp/cineposta-daily/candidate-input.json');
}

function approveCandidate(fixture, input, report = approvedCandidateReport(input), execution = fixture.reviewerExecution()) {
	const result = submitReview(fixture, report, execution);
	succeeds(result, 'record independent candidate/originality review');
	return result;
}

test('status reads a live locked day without fetch, mutation or stealing its lock', async () => {
  await withFixture(async fixture => {
    succeeds(fixture.execute('--prepare'));
    const lock = resolve(fixture.repository, '.tmp/cineposta-daily/lock');
    mkdirSync(lock);
    const processStart = readFileSync('/proc/' + process.pid + '/stat', 'utf8').split(') ').at(-1).split(' ')[19];
    const owner = { pid: process.pid, host: hostname(), processStart, startedAt: new Date().toISOString() };
    writeFileSync(resolve(lock, 'owner.json'), JSON.stringify(owner));
    const before = readFileSync(fixture.sessionFile, 'utf8');
    const context = resolve(fixture.repository, '.tmp/cineposta-daily/' + fixture.today + '-context.json');
    const contextBefore = readFileSync(context, 'utf8');
    const result = fixture.execute('--status');
    succeeds(result);
    assert.match(result.stdout, /"running":true/);
    assert.equal(readFileSync(fixture.sessionFile, 'utf8'), before);
    assert.equal(readFileSync(context, 'utf8'), contextBefore);
    assert.deepEqual(JSON.parse(readFileSync(resolve(lock, 'owner.json'), 'utf8')), owner);
    rejects(fixture.execute('--prepare'), /Otra ejecución/);
    rmSync(lock, { recursive: true });
  });
});

test('unchanged approved preflight/article freezes are idempotent, while new bytes require a new review', async () => {
  await withFixture(async fixture => {
    const candidate = fixtureCandidate(fixture.today);
    approveCandidate(fixture, startCandidate(fixture, candidate));
    const candidateReport = readFileSync(fixture.pathInWorktree('.tmp/cineposta-daily/factual-review.json'), 'utf8');
    succeeds(fixture.execute('--candidate'));
    assert.equal(stateOf(fixture).status, 'drafting');
    assert.equal(stateOf(fixture).attempts[0].rounds.length, 1);
    assert.equal(readFileSync(fixture.pathInWorktree('.tmp/cineposta-daily/factual-review.json'), 'utf8'), candidateReport);
    const article = await startArticle(fixture, candidate);
    approveArticle(fixture, article.input);
    succeeds(fixture.execute('--review'));
    assert.equal(stateOf(fixture).status, 'approved');
    assert.equal(stateOf(fixture).attempts[0].rounds.length, 2);
    const path = fixture.pathInWorktree('src/data/editorials/' + article.input.note.slug + '.json');
    const note = JSON.parse(readFileSync(path, 'utf8')); note.title += ' con otra precisión';
    writeFileSync(path, JSON.stringify(note));
    succeeds(fixture.execute('--review'));
    assert.equal(stateOf(fixture).status, 'reviewing');
    assert.equal(stateOf(fixture).attempts[0].rounds.length, 3);
  });
});

test('browser failure retains approval and exact build; source or dist changes require rebuilding', async () => {
  await withFixture(async fixture => {
    const candidate = fixtureCandidate(fixture.today);
    const input = startCandidate(fixture, candidate);
    approveCandidate(fixture, input);
    const article = await startArticle(fixture, candidate);
    approveArticle(fixture, article.input);
    const remote = fixture.remoteHead();
    fixture.env.TEST_FAIL_BROWSERS = '1';
    rejects(fixture.execute('--dry-run'), /Playwright falló/);
    assert.equal(stateOf(fixture).status, 'approved');
    fixture.env.TEST_FAIL_BROWSERS = '';
    succeeds(fixture.execute('--revalidate'));
    const builds = () => (readFileSync(fixture.commandLog, 'utf8').match(/^npm run build$/gm) || []).length;
    assert.equal(builds(), 1, 'a browser retry must not rebuild identical approved source/artifacts');
    assert.equal(fixture.remoteHead(), remote, 'validation does not publish');
    writeFileSync(fixture.pathInWorktree('dist/index.html'), 'tampered artifact');
    succeeds(fixture.execute('--revalidate'));
    assert.equal(builds(), 2, 'changed dist must never be trusted');
    writeFileSync(fixture.pathInWorktree('source-change.txt'), 'new untracked input');
    rejects(fixture.execute('--revalidate'), /alcance|fuera|scope/i, 'publication scope still blocks unrelated untracked inputs');
  });
});

test('a metadata-only correction completes the real review cycle without rewriting the approved public statement', async () => {
  await withFixture(async fixture => {
    const candidate = fixtureCandidate(fixture.today);
    approveCandidate(fixture, startCandidate(fixture, candidate));
    const article = await startArticle(fixture, candidate);
    const finding = { id: 'claim-evidence-caveat', kind: 'claim', field: 'limitation', targetId: 'headline-event', severity: 'minor', status: 'open',
      description: 'Add the independently checked scope of evidence to the private claim metadata.', action: 'Document the scope limitation without changing the correct public statement.', evidence: [fixtureEvidence(article.input.note.sources[0].url, fixture.today)] };
    succeeds(submitReview(fixture, { date: fixture.today, slug: article.input.note.slug, contentDigest: article.input.contentDigest, verdict: 'changes_required', reason: 'The factual statement is correct but its evidence scope should be recorded explicitly.', findings: [finding] }));
    succeeds(fixture.execute('--revise'));
    const publicBefore = readFileSync(fixture.pathInWorktree('src/data/editorials/' + article.input.note.slug + '.json'), 'utf8');
    const draft = fixture.readJson('.tmp/cineposta-daily/draft.json');
    draft.claims[0].limitation = 'The announcement confirms selection, not later distribution in Argentina.';
    fixture.writeJson('.tmp/cineposta-daily/draft.json', draft);
    writeNativePair(fixture);
    succeeds(fixture.execute('--review'));
    const input = fixture.readJson('.tmp/cineposta-daily/review-input.json');
    const packet = fixture.readJson('.tmp/cineposta-daily/review-template.json');
    assert.equal(packet.verdict, 'pending');
    assert.equal(packet.findings[0].field, 'limitation');
    const report = approvedArticleReview(input).report;
    report.findings = [{ ...finding, status: 'resolved', before: null, after: draft.claims[0].limitation, resolution: 'Recorded the actual evidentiary scope in the same claim metadata; public copy is unchanged.' }];
    succeeds(submitReview(fixture, report));
    assert.equal(stateOf(fixture).status, 'approved');
    assert.equal(readFileSync(fixture.pathInWorktree('src/data/editorials/' + article.input.note.slug + '.json'), 'utf8'), publicBefore);
  });
});

async function startArticle(fixture, candidate, options) {
	const article = await writeFixtureArticle(fixture, candidate, options);
	writeNativePair(fixture);
	const frozen = fixture.execute('--review');
	succeeds(frozen, 'freeze the article only after candidate approval');
	return { ...article, input: fixture.readJson('.tmp/cineposta-daily/review-input.json') };
}

function approveArticle(fixture, input, approval = approvedArticleReview(input), execution = approval.reviewerExecution) {
	const result = submitReview(fixture, approval.report, execution);
	succeeds(result, 'record independent factual, editorial and originality approval');
	return result;
}

test('the native-model Plan B stops when Luna Max is absent instead of changing family', async () => {
	await withFixture(async fixture => {
		fixture.writeJson('.tmp/cineposta-daily/native-catalog.json', {
			observedAt: `${fixture.today}T12:00:00-03:00`, models: [{ model: 'gpt-6-sol', reasoningEfforts: ['max'] }],
		}, false);
		const result = fixture.execute('--prepare');
		rejects(result, /no anuncia|Luna|Max/i, 'missing Luna Max must block the run');
		assert.equal(existsSync(fixture.worktree()), false, 'no article worktree should be created without the required native model');
		const log = existsSync(fixture.commandLog) ? readFileSync(fixture.commandLog, 'utf8') : '';
		assert.doesNotMatch(log, /validate:content|playwright|publish-buffer/);
	});
});

test('prepare and status resume the same persisted attempt across real CLI processes', async () => {
	await withFixture(async fixture => {
		succeeds(fixture.execute('--prepare'));
		const first = stateOf(fixture);
		assert.equal(first.status, 'drafting');
		assert.equal(first.attempts.length, 1);
		assert.equal(first.attempts[0].status, 'drafting');
		assert.equal(fixture.execute('--status').status, 0);
		succeeds(fixture.execute('--prepare'), 'a repeated prepare should report the saved checkpoint');
		const resumed = stateOf(fixture);
		assert.equal(resumed.attempts.length, 1, 'resume must not create another attempt');
		assert.equal(resumed.attempts[0].id, first.attempts[0].id);
		assert.equal(resumed.status, 'drafting');
	});
});

test('prepare repairs an interrupted frozen candidate packet under an orphaned local lock', async () => {
	await withFixture(async fixture => {
		succeeds(fixture.execute('--prepare'));
		writeNativePair(fixture);
		fixture.writeJson('.tmp/cineposta-daily/candidate.json', fixtureCandidate(fixture.today));
		succeeds(fixture.execute('--candidate'));
		const frozenInput = fixture.readJson('.tmp/cineposta-daily/candidate-input.json');
		const before = stateOf(fixture);
		const attemptId = before.attempts.at(-1).id;
		const roundId = before.attempts.at(-1).rounds.at(-1).id;

		const envelope = JSON.parse(readFileSync(fixture.sessionFile, 'utf8'));
		envelope.day.attempts.at(-1).rounds.at(-1).artifactsReady = false;
		writeFileSync(fixture.sessionFile, `${JSON.stringify({
			day: envelope.day, digest: digest(JSON.stringify(envelope.day)),
		}, null, 2)}\n`);
		rmSync(fixture.pathInWorktree('.tmp/cineposta-daily/candidate-input.json'), { force: true });
		rmSync(fixture.pathInWorktree('.tmp/cineposta-daily/published.json'), { force: true });

		const lock = resolve(fixture.repository, '.tmp/cineposta-daily/lock');
		mkdirSync(lock, { recursive: true });
		writeFileSync(resolve(lock, 'owner.json'), JSON.stringify({ pid: 999_999_999, host: hostname(), processStart: 'impossible-process-start' }));

		succeeds(fixture.execute('--prepare'), 'prepare should recover the frozen packet and archive the dead local lock');
		const recovered = stateOf(fixture);
		assert.equal(recovered.attempts.length, 1);
		assert.equal(recovered.attempts.at(-1).id, attemptId);
		assert.equal(recovered.attempts.at(-1).rounds.length, 1);
		assert.equal(recovered.attempts.at(-1).rounds.at(-1).id, roundId);
		assert.equal(recovered.attempts.at(-1).rounds.at(-1).input.contentDigest, frozenInput.contentDigest);
		assert.equal(recovered.attempts.at(-1).rounds.at(-1).artifactsReady, true);
		assert.deepEqual(fixture.readJson('.tmp/cineposta-daily/candidate-input.json'), frozenInput);

		fixture.writeJson('.tmp/cineposta-daily/factual-review.json', approvedCandidateReport(frozenInput));
		fixture.writeJson('.tmp/cineposta-daily/native-review-execution.json', fixture.reviewerExecution());
		const pending = fixture.execute('--status');
		succeeds(pending, 'the recovered review can complete without another author turn');
		assert.match(outputOf(pending), /"nextAction":"record_review"/);
		succeeds(fixture.execute('--record-review'), 'the original frozen snapshot can use the recovered native review completion');
		const recorded = stateOf(fixture);
		assert.equal(recorded.attempts.length, 1);
		assert.equal(recorded.attempts.at(-1).rounds.length, 1);
		assert.equal(recorded.attempts.at(-1).candidateApproved.report.contentDigest, frozenInput.contentDigest);
		assert.deepEqual(recorded.agents, {
			author: { agentId: 'fixture-author', model: 'gpt-6-luna', effort: 'max' },
			reviewer: { agentId: 'fixture-reviewer', model: 'gpt-6-luna', effort: 'max' },
		});
		assert.equal(existsSync(lock), false, 'the process-owned lock is released after recovery');
	}, {});
});

test('candidate preflight freezes the entire history and rejects a changed candidate snapshot', async () => {
	await withFixture(async fixture => {
		const input = startCandidate(fixture);
		assert.equal(input.history.recordCount, 0);
		assert.equal(input.history.records.length, 0);
		assert.equal(input.preflight.historyDigest, input.history.digest);
		const tampered = asJson(input);
		tampered.candidate.summary = 'Altered after the independent reviewer received the snapshot.';
		fixture.writeJson('.tmp/cineposta-daily/candidate-input.json', tampered);
		const report = approvedCandidateReport(tampered);
		rejects(submitReview(fixture, report), /preflight|candidato|digest/i, 'candidate fields must stay bound to the frozen preflight');
		assert.equal(stateOf(fixture).status, 'reviewing', 'a failed report cannot advance the durable state');
	});
});

test('a correctable preflight finding can update the same event before deep research', async () => {
	await withFixture(async fixture => {
		const candidate = fixtureCandidate(fixture.today);
		const input = startCandidate(fixture, candidate);
		const previousSummary = candidate.summary;
		const adverse = adverseReview({ input, findingId: 'candidate-source-gap' });
		succeeds(submitReview(fixture, adverse), 'record a concrete preflight correction request');
		assert.equal(stateOf(fixture).status, 'changes_required');
		rejects(fixture.execute('--switch-topic'), /changes_required|correcciones/i, 'a correctable source gap should not discard the story');
		succeeds(fixture.execute('--revise'));
		candidate.summary += ' La secundaria aporta una comprobación propia de la programación.';
		fixture.writeJson('.tmp/cineposta-daily/candidate.json', candidate);
		const refrozen = fixture.execute('--candidate');
		succeeds(refrozen, 'retry the same candidate after applying the requested correction');
		const revised = fixture.readJson('.tmp/cineposta-daily/candidate-input.json');
		assert.equal(revised.candidate.id, input.candidate.id);
		assert.equal(revised.candidate.topicKey, input.candidate.topicKey);
		assert.equal(revised.candidate.event.key, input.candidate.event.key);
		const approval = approvedCandidateReport(revised);
		approval.findings = [{
			id: 'candidate-source-gap', kind: 'text', targetId: 'candidate/summary', severity: 'material', status: 'resolved',
			description: adverse.findings[0].description, before: previousSummary, after: candidate.summary,
			resolution: 'The candidate summary now separates the official announcement from the independent confirmation.',
			evidence: [fixtureEvidence(candidate.evidence[1].url, fixture.today)],
		}];
		approveCandidate(fixture, revised, approval);
		const day = stateOf(fixture);
		assert.equal(day.status, 'drafting');
		assert.ok(day.attempts[0].candidateApproved, 'only the second independent approval unlocks article research');
	});
});

test('deep article review requires an approved candidate embedded unchanged in the draft', async () => {
	await withFixture(async fixture => {
		const candidate = fixtureCandidate(fixture.today);
		const candidateInput = startCandidate(fixture, candidate);
		await writeFixtureArticle(fixture, candidate);
		writeNativePair(fixture);
		rejects(fixture.execute('--review'), /approved|preflight|candidato/i, 'no deep review before candidate approval');
		approveCandidate(fixture, candidateInput);
		const draft = fixture.readJson('.tmp/cineposta-daily/draft.json');
		draft.candidate.event.description += ' A changed event cannot inherit the old candidate approval.';
		fixture.writeJson('.tmp/cineposta-daily/draft.json', draft);
		rejects(fixture.execute('--review'), /candidato|preflight|cambió/i, 'the public draft must preserve the independently approved candidate');
		assert.equal(existsSync(fixture.pathInWorktree('.tmp/cineposta-daily/review-input.json')), false);
	});
});

test('candidate approval requires a completed, distinct native Luna Max reviewer', async () => {
	await withFixture(async fixture => {
		const input = startCandidate(fixture);
		const report = approvedCandidateReport(input);
		rejects(submitReview(fixture, report, fixture.reviewerExecution('fixture-author')), /dos agentes|independientes/i, 'author cannot approve their own candidate');
		const wrongModel = fixture.reviewerExecution('fixture-reviewer');
		wrongModel.model = 'gpt-6-sol';
		rejects(submitReview(fixture, report, wrongModel), /evidencia|modelo|Max/i, 'the reviewer must use the selected Luna Max model');
		approveCandidate(fixture, input, report, fixture.reviewerExecution());
		assert.equal(stateOf(fixture).agents.author.agentId, 'fixture-author');
		assert.equal(stateOf(fixture).agents.reviewer.agentId, 'fixture-reviewer');
		const candidate = fixtureCandidate(fixture.today);
		const article = await startArticle(fixture, candidate);
		const approval = approvedArticleReview(article.input);
		const replacementReviewer = fixture.reviewerExecution('fixture-reviewer-replacement');
		rejects(submitReview(fixture, approval.report, replacementReviewer), /mismo agente reviewer|reutilizar/i, 'the factual reviewer identity is pinned for the day');
		approveArticle(fixture, article.input, approval);
		const otherAuthor = fixture.authorExecution('fixture-author-replacement');
		fixture.writeJson('.tmp/cineposta-daily/native-execution.json', otherAuthor);
		rejects(fixture.execute('--review'), /mismo agente author|reutilizar/i, 'the author identity is pinned before another review snapshot can start');
		assert.equal(stateOf(fixture).status, 'approved', 'an identity change cannot invalidate the existing approval or start another review');
	});
});

test('a material factual finding blocks publishing until a documented correction earns fresh approval', async () => {
	await withFixture(async fixture => {
		const candidate = fixtureCandidate(fixture.today);
		const candidateInput = startCandidate(fixture, candidate);
		approveCandidate(fixture, candidateInput);
		const article = await startArticle(fixture, candidate);
		const originalTitle = article.note.title;
		const oldImageRights = asJson(article.input.draft.imageChecks.find(check => check.src === article.note.cover.src).rights);
		const oldImageSource = article.note.cover.src;
		const adverse = adverseReview({ input: article.input, findingId: 'correct-headline-event' });
		adverse.findings.push({
			id: 'replace-unlicensed-cover', kind: 'image', targetId: oldImageSource, severity: 'material', status: 'open',
			description: 'Synthetic image audit could not establish reuse rights for the selected cover.',
			action: 'Replace the cover with an identified resource whose web and social terms are explicitly cleared.',
			evidence: [fixtureEvidence('https://fixture.example/review/rights-check', fixture.today)],
		});
		succeeds(submitReview(fixture, adverse), 'record the independent material finding');
		assert.equal(stateOf(fixture).status, 'changes_required');
		const baseHead = fixture.remoteHead();
		rejects(fixture.execute('--publish'), /revisión|correcciones|changes_required|review/i, 'an adverse review must block publication');
		assert.equal(fixture.remoteHead(), baseHead);
		assert.equal(existsSync(fixture.bufferRequest), false, 'no Buffer post before factual approval');
		succeeds(fixture.execute('--revise'));
		const note = fixture.readJson(`src/data/editorials/${article.slug}.json`);
		const draft = fixture.readJson('.tmp/cineposta-daily/draft.json');
		const correctedTitle = 'El festival confirma una selección que define su apertura';
		note.title = correctedTitle;
		draft.claims[0].statement = correctedTitle;
		await replaceFixtureImage(fixture, note, draft, oldImageSource);
		fixture.writeJson(`src/data/editorials/${article.slug}.json`, note);
		fixture.writeJson('.tmp/cineposta-daily/draft.json', draft);
		writeNativePair(fixture);
		succeeds(fixture.execute('--review'), 'freeze the corrected article and replacement image');
		const next = { input: fixture.readJson('.tmp/cineposta-daily/review-input.json') };
		const approval = approvedArticleReview(next.input);
		approval.report.findings = [
			{
				id: 'correct-headline-event', kind: 'claim', targetId: 'headline-event', severity: 'material', status: 'resolved',
				description: adverse.findings[0].description, before: originalTitle, after: correctedTitle,
				resolution: 'The headline was rewritten to match the independently checked festival announcement.',
				evidence: [fixtureEvidence(note.sources[0].url, fixture.today)],
			},
			{
				id: 'replace-unlicensed-cover', kind: 'image', targetId: oldImageSource, severity: 'material', status: 'resolved',
				description: adverse.findings[1].description, before: oldImageRights, after: null,
				resolution: 'Removed the uncertain cover and replaced it with a resource whose web and social rights were independently cleared.',
				evidence: [fixtureEvidence('https://fixture.example/approved/license', fixture.today)],
			},
		];
		approveArticle(fixture, next.input, approval);
		assert.equal(stateOf(fixture).status, 'approved');
		assert.deepEqual(stateOf(fixture).agents, {
			author: { agentId: 'fixture-author', model: 'gpt-6-luna', effort: 'max' },
			reviewer: { agentId: 'fixture-reviewer', model: 'gpt-6-luna', effort: 'max' },
		});
		succeeds(fixture.execute('--revalidate'), 'validated correction must rerun the full factual and rights gates after the adverse proof was invalidated');
		assert.equal(fixture.remoteHead(), baseHead, 'dry-run verifies the corrected preparation without a push');
	});
});

test('repeated unchanged findings require a new strategy, evidence and visible progress', async () => {
	await withFixture(async fixture => {
		const candidate = fixtureCandidate(fixture.today);
		const candidateInput = startCandidate(fixture, candidate);
		approveCandidate(fixture, candidateInput);
		const article = await startArticle(fixture, candidate);
		const first = adverseReview({ input: article.input, findingId: 'same-factual-gap' });
		succeeds(submitReview(fixture, first));
		succeeds(fixture.execute('--revise'));
		const secondArticle = fixture.execute('--review');
		succeeds(secondArticle, 'retry the unchanged copy once so the auditor can identify a stalled cycle');
		const secondInput = fixture.readJson('.tmp/cineposta-daily/review-input.json');
		assert.equal(secondInput.contentDigest, article.input.contentDigest);
		succeeds(submitReview(fixture, adverseReview({ input: secondInput, findingId: 'same-factual-gap' })));
		assert.equal(stateOf(fixture).attempts[0].stalled, true);
		rejects(fixture.execute('--revise'), /estrategia|evidencia|avance/i, 'a stalled audit cannot repeat without a concrete Plan B');
		const plan = { strategy: 'Open a new primary source and replace the unsupported sentence.', evidence: [fixtureEvidence(candidate.evidence[0].url, fixture.today)] };
		fixture.writeJson('.tmp/cineposta-daily/correction-plan.json', plan);
		succeeds(fixture.execute('--revise'), 'a changed strategy must include evidence');
		rejects(fixture.execute('--review'), /sin avances|estrategia|inviabilidad/i, 'a plan alone is not public progress');
		const draft = fixture.readJson('.tmp/cineposta-daily/draft.json');
		draft.decision += ' La segunda pasada abrió la fuente primaria y contrastó la fecha en forma independiente.';
		fixture.writeJson('.tmp/cineposta-daily/draft.json', draft);
		rejects(fixture.execute('--review'), /avance|estancad|evidencia/i, 'changing only a private decision string is not factual progress');
		const note = fixture.readJson(`src/data/editorials/${article.slug}.json`);
		const newUrl = 'https://festival.example/2026/independent-date-confirmation';
		note.sources.push({ label: 'Confirmación independiente de la fecha', url: newUrl });
		draft.sourceChecks.push({ url: newUrl, role: 'secondary', checkedOn: fixture.today, facts: 'Una comprobación independiente confirma la fecha publicada por el festival.' });
		draft.claims[0].evidence.push(fixtureEvidence(newUrl, fixture.today));
		fixture.writeJson(`src/data/editorials/${article.slug}.json`, note);
		fixture.writeJson('.tmp/cineposta-daily/draft.json', draft);
		succeeds(fixture.execute('--review'), 'new evidence and a changed preparation reopen review');
		assert.equal(stateOf(fixture).status, 'reviewing');
	});
});

test('an exact duplicate topic can only move to a clean Plan B after archiving its review', async () => {
	const duplicate = historyNote({ slug: 'prior-apertura', date: '2026-10-25', title: 'La apertura del festival ya fue anunciada', topicKey: 'festival-2026-film-opening-announcement' });
	await withFixture(async fixture => {
		const candidate = fixtureCandidate(fixture.today, {
			topicKey: 'festival-2026-apertura-de-la-pelicula',
			title: 'El festival confirma otra vez una película para abrir la edición',
			event: { key: 'festival-2026-opening-film-announcement', type: 'announcement', date: fixture.today, entities: ['film:fixture-opening-film', 'festival:fixture-film-festival'], description: 'El festival anuncia la película que abrirá la edición 2026.' },
		});
		assert.notEqual(candidate.title, duplicate.title, 'different headlines can still describe the same historical event');
		assert.notEqual(candidate.topicKey, duplicate.topicKey, 'the source uses different event-key aliases for one event');
		assert.notEqual(candidate.event.key, duplicate.topicKey);
		const input = startCandidate(fixture, candidate);
		assert.equal(input.preflight.flags.duplicate_topic, true);
		succeeds(submitReview(fixture, adverseReview({ input, verdict: 'duplicate_topic' })));
		assert.equal(stateOf(fixture).status, 'duplicate_topic');
		const rejected = fixture.execute('--switch-topic');
		succeeds(rejected, 'switch-topic archives the fully reviewed rejected attempt');
		const day = stateOf(fixture);
		assert.equal(day.attempts.length, 2);
		assert.equal(day.attempts[0].status, 'switching_topic');
		assert.ok(day.attempts[0].archive.manifest.length >= 4);
		assert.equal(day.discarded[0].verdict, 'duplicate_topic');
		assert.equal(day.status, 'drafting');
		assert.equal(day.attempts.at(-1).candidate, undefined);
		const archivedCandidate = resolve(day.attempts[0].archive.directory, 'research/candidate.json');
		assert.ok(existsSync(archivedCandidate), 'candidate artifact remains available inside the immutable attempt archive');
		const planBEntities = [{ id: 'film:fixture-plan-b-feature', kind: 'film', aliases: ['Fixture Plan B Feature', 'La película de Plan B'] }];
		const planB = fixtureCandidate(fixture.today, {
			id: 'film-plan-b-release', topicKey: 'fixture-plan-b-feature-2026-release',
			title: 'La película de Plan B confirma su estreno argentino',
			summary: 'Una película distinta anuncia una fecha de estreno en Argentina.',
			event: { key: 'fixture-plan-b-feature-2026-release', type: 'release-announcement', date: fixture.today, entities: planBEntities.map(entity => entity.id), description: 'La distribuidora confirma una fecha argentina nueva para otra película.' },
			entities: planBEntities, category: 'estrenos', novelty: 'La noticia concreta confirma una ventana argentina y abre una conversación sobre la distribución local.',
			evidence: [
				{ url: 'https://planb-film.example/argentina/estreno', excerpt: 'La distribuidora confirma la fecha argentina de estreno de la película.', checkedOn: fixture.today },
				{ url: 'https://cine-post.example/plan-b-estreno', excerpt: 'Una entrevista propia confirma el calendario argentino comunicado.', checkedOn: fixture.today },
			],
		});
		fixture.writeJson('.tmp/cineposta-daily/native-execution.json', fixture.authorExecution());
		fixture.writeJson('.tmp/cineposta-daily/candidate.json', planB);
		succeeds(fixture.execute('--candidate'), 'a clean candidate can begin on the next attempt');
		const secondInput = fixture.readJson('.tmp/cineposta-daily/candidate-input.json');
		assert.equal(secondInput.candidate.id, planB.id);
		assert.equal(stateOf(fixture).attempts[1].candidateApproved, undefined);
		approveCandidate(fixture, secondInput);
		const article = await startArticle(fixture, planB);
		approveArticle(fixture, article.input);
		succeeds(fixture.execute('--dry-run'), 'a distinct plan B can complete with its own independent reviews');
		const baseHead = fixture.remoteHead();
		succeeds(fixture.execute('--publish'), 'the approved Plan B publishes through the real local Git push and fake Pages/Buffer services');
		assert.notEqual(fixture.remoteHead(), baseHead);
		assert.ok(existsSync(fixture.bufferRequest));
		fixture.shell('git', ['fetch', 'origin', 'main']);
		const pushedReceipt = JSON.parse(fixture.shell('git', ['show', `origin/main:reports/daily-editorial/${fixture.today}.json`]));
		assert.equal(pushedReceipt.slug, 'festival-anuncia-apertura');
		assert.equal(pushedReceipt.editorialJourney.attempts.length, 2);
		assert.equal(pushedReceipt.editorialJourney.attempts[0].rounds.at(-1).report.verdict, 'duplicate_topic');
		assert.equal(pushedReceipt.editorialJourney.attempts[1].candidate.id, planB.id);
		assert.equal(pushedReceipt.editorialJourney.attempts[1].rounds.some(round => round.report?.findings?.length), false, 'the rejected candidate findings do not transfer to the new topic');
		const remoteEditorials = fixture.shell('git', ['ls-tree', '-r', '--name-only', 'origin/main', '--', 'src/data/editorials']).split('\n').filter(path => path.endsWith('.json'));
		assert.deepEqual(remoteEditorials.sort(), ['src/data/editorials/festival-anuncia-apertura.json', 'src/data/editorials/prior-apertura.json']);
	}, { historyNotes: [duplicate] });
});

test('a stalled review may assess viability once, cannot approve unchanged copy and archives full Plan B evidence', async () => {
	await withFixture(async fixture => {
		const candidate = fixtureCandidate(fixture.today);
		const candidateInput = startCandidate(fixture, candidate);
		approveCandidate(fixture, candidateInput);
		const article = await startArticle(fixture, candidate);
		const first = adverseReview({ input: article.input, findingId: 'stalled-source-check' });
		succeeds(submitReview(fixture, first));
		succeeds(fixture.execute('--revise'));
		succeeds(fixture.execute('--review'), 'one unchanged correction cycle is retained for the stall check');
		const secondInput = fixture.readJson('.tmp/cineposta-daily/review-input.json');
		succeeds(submitReview(fixture, adverseReview({ input: secondInput, findingId: 'stalled-source-check' })));
		assert.equal(stateOf(fixture).attempts[0].stalled, true);
		succeeds(fixture.execute('--assess-viability'), 'a stalled case can be routed to one independent viability decision');
		const viabilityInput = fixture.readJson('.tmp/cineposta-daily/review-input.json');
		const approved = approvedArticleReview(viabilityInput);
		rejects(submitReview(fixture, approved.report), /hallazgos|evaluación de viabilidad|sin avances|no aprueba/i, 'viability review cannot approve unchanged copy');
		succeeds(submitReview(fixture, adverseReview({ input: viabilityInput, verdict: 'topic_unviable' })), 'the second native agent may document why no correction can make the story viable');
		const blockedHead = fixture.remoteHead();
		rejects(fixture.execute('--publish'), /revisión|candidate|aprobación|review/i);
		assert.equal(fixture.remoteHead(), blockedHead);
		rejects(fixture.execute('--assess-viability'), /estancamiento|viabilidad|transición|revisión/i, 'the same viability packet cannot be assessed twice');
		succeeds(fixture.execute('--switch-topic'));
		const day = stateOf(fixture);
		const archive = day.attempts[0].archive;
		assert.ok(archive.manifest.some(entry => entry.path === 'note.json'));
		assert.ok(archive.manifest.some(entry => entry.path.startsWith('assets/')));
		assert.ok(archive.manifest.some(entry => entry.path === 'research/review-input.json'));
		assert.ok(archive.manifest.some(entry => entry.path === 'research/factual-review.json'));
		for (const entry of archive.manifest) {
			const bytes = readFileSync(resolve(archive.directory, entry.path));
			assert.equal(bytes.length, entry.bytes);
			assert.equal(digest(bytes), entry.sha256);
		}
		assert.equal(day.discarded[0].verdict, 'topic_unviable');
		assert.equal(day.attempts.at(-1).status, 'drafting');
		assert.equal(day.attempts.at(-1).rounds.length, 0, 'the clean Plan B attempt does not inherit old findings');
		assert.equal(day.attempts.at(-1).feedback, undefined);
		assert.equal(existsSync(fixture.pathInWorktree('.tmp/cineposta-daily/candidate.json')), false);
		assert.equal(existsSync(fixture.bufferRequest), false);
	});
});

test('full history permits a distinct weekly-guide contribution but flags Godzilla franchise recency and 14-day exception', async () => {
	const today = argentinaDate();
	const candidate = fixtureCandidate(today, {
		id: 'godzilla-minus-zero-release-date',
		topicKey: 'godzilla-minus-zero-global-date-announcement',
		title: 'Godzilla Minus Zero confirma su fecha de estreno mundial',
		event: { key: 'godzilla-minus-zero-worldwide-release-date-revealed', type: 'release-date-announcement', date: today, entities: ['godzilla-minus-zero-2026', 'godzilla'], description: 'La distribuidora confirma la fecha mundial de estreno de Godzilla Minus Zero.' },
		entities: [
			{ id: 'godzilla-minus-zero-2026', kind: 'film', aliases: ['Godzilla Minus Zero', 'Gojira Minus Zero'] },
			{ id: 'godzilla', kind: 'franchise', aliases: ['Godzilla', 'Gojira'] },
		],
		category: 'estrenos',
		novelty: 'The announced worldwide release date clarifies a new milestone in the film franchise rollout.',
		evidence: [
			{ url: 'https://godzilla.example/official/release', excerpt: 'The distributor announced the worldwide release date for Godzilla Minus Zero.', checkedOn: today },
			{ url: 'https://cinema-news.example/godzilla-release-date', excerpt: 'An independent report checked the announced release date.', checkedOn: today },
		],
	});
	const historyNotes = Array.from({ length: 61 }, (_, index) => historyNote({
		slug: `old-cinema-note-${String(index + 1).padStart(2, '0')}`,
		date: daysAgo(today, 80 + index), title: `An archived cinema subject ${index + 1}`,
	}));
	historyNotes.push(
		historyNote({ slug: 'legacy-godzilla-release-announcement', date: daysAgo(today, 120), title: 'Godzilla Minus Zero worldwide release announcement in legacy coverage' }),
		historyNote({ slug: 'weekly-godzilla-guide', date: daysAgo(today, 70), title: 'Guía de estrenos de la semana: Godzilla Minus Zero', topicKey: 'godzilla-minus-zero-worldwide-release-announcement', kind: 'guide' }),
		...Array.from({ length: 5 }, (_, index) => historyNote({
			slug: `godzilla-franchise-story-${index + 1}`, date: daysAgo(today, 7), title: `Godzilla franchise report ${index + 1}`, entityIds: ['godzilla'],
		})),
		...Array.from({ length: 2 }, (_, index) => historyNote({
			slug: `godzilla-concentration-story-${index + 1}`, date: daysAgo(today, 20), title: `Godzilla franchise analysis ${index + 1}`, entityIds: ['godzilla'],
		})),
		historyNote({ slug: 'recent-other-film', date: daysAgo(today, 5), title: 'Another science fiction film opens in Japan', entityIds: ['other-film-franchise'] }),
	);
	await withFixture(async fixture => {
		const input = startCandidate(fixture, candidate);
		assert.equal(input.history.recordCount, 71, 'the preflight includes records outside a recent-60 summary');
		assert.equal(input.preflight.checkedHistoryRecordIds.length, 71);
		assert.equal(input.preflight.flags.duplicate_topic, false, 'the weekly guide is not treated as a confirmed duplicate');
		assert.ok(input.preflight.matches.some(match => match.kind === 'legacy_possible_same_event'));
		assert.ok(input.preflight.matches.some(match => match.kind === 'guide_same_event_key'));
		assert.equal(input.preflight.matches.filter(match => match.kind === 'film_franchise_recency').length, 5, 'all five Godzilla stories from seven days ago are visible');
		assert.equal(input.preflight.matches.filter(match => match.kind === 'film_franchise_recency' && match.requiresConcentrationReview).length, 5, 'the seven-day matches also retain the independent 30-day concentration review signal');
		assert.equal(input.preflight.matches.filter(match => match.kind === 'entity_concentration').length, 2, 'concentration beyond the 14-day recency window remains an explicit signal');
		assert.equal(input.preflight.matches.some(match => match.slug === 'recent-other-film'), false, 'another film does not trigger the Godzilla franchise cooldown');
		assert.equal(input.preflight.matches.filter(match => match.requiresFourteenDayException).length, 5, 'each recent Godzilla record needs cited extraordinary review');
		const approved = approvedCandidateReport(input);
		const missingComparison = asJson(approved);
		missingComparison.originality.guideComparisons = missingComparison.originality.guideComparisons.filter(item => item.recordId !== input.preflight.matches.find(match => match.kind === 'guide_same_event_key').recordId);
		rejects(submitReview(fixture, missingComparison), /comparación/i, 'a weekly guide event requires a documented distinct contribution');
		const missingException = asJson(approved);
		delete missingException.originality.exception14d;
		rejects(submitReview(fixture, missingException), /14 días|excepción extraordinaria/i, 'a seven-day Godzilla match needs a cited extraordinary exception');
		const missingConcentration = asJson(approved);
		delete missingConcentration.originality.concentrationReview;
		rejects(submitReview(fixture, missingConcentration), /concentración|alternativa/i, 'dense 30-day franchise coverage needs an explicit alternatives assessment');
		approveCandidate(fixture, input, approved);
		assert.equal(stateOf(fixture).status, 'drafting');
		assert.equal(stateOf(fixture).attempts.at(-1).candidateApproved.report.originality.history.checkedRecordIds.length, 71);
	}, { historyNotes });
});

test('approved publication preserves the two-agent journey and recovers Pages before Buffer', async () => {
	await withFixture(async fixture => {
		const candidate = fixtureCandidate(fixture.today);
		const candidateInput = startCandidate(fixture, candidate);
		approveCandidate(fixture, candidateInput);
		const article = await startArticle(fixture, candidate);
		approveArticle(fixture, article.input);
		const baseHead = fixture.remoteHead();
		succeeds(fixture.execute('--dry-run'), 'the complete factual, rights, content and browser gate should pass');
		assert.equal(fixture.remoteHead(), baseHead, 'dry-run performs no remote write');
		fixture.env.TEST_FAIL_PAGES = '1';
		rejects(fixture.execute('--publish'), /Pages failure/i, 'a Pages failure after push must preserve the published note');
		const publishedHead = fixture.remoteHead();
		assert.notEqual(publishedHead, baseHead);
		assert.equal(existsSync(fixture.bufferRequest), false, 'Buffer waits until Pages and the public URL are confirmed');
		fixture.env.TEST_FAIL_PAGES = '';
		succeeds(fixture.execute('--publish'), 'retry the same published note, verify Pages, then resume Buffer');
		assert.equal(fixture.remoteHead(), publishedHead, 'recovery must not create another article commit');
		assert.ok(existsSync(fixture.bufferRequest), 'Buffer receives the single post-publication request');
		const commands = readFileSync(fixture.commandLog, 'utf8');
		const failedPages = commands.indexOf('pages-failure');
		const passedPages = commands.indexOf('pages-success');
		const bufferDispatch = commands.indexOf('publish-buffer-editorial-x.yml');
		assert.ok(failedPages >= 0 && passedPages > failedPages && bufferDispatch > passedPages, 'Buffer dispatch follows recovered Pages verification');
		assert.equal((commands.match(/workflow run publish-buffer-editorial-x\.yml/g) || []).length, 1, 'Buffer is dispatched once');
		fixture.shell('git', ['fetch', 'origin', 'main']);
		const receiptText = fixture.shell('git', ['show', `origin/main:reports/daily-editorial/${fixture.today}.json`]);
		const receipt = JSON.parse(receiptText);
		assert.equal(receipt.editorialJourney.status, 'approved', 'receipt stores the reviewed state immediately before publication');
		assert.equal(receipt.editorialJourney.attempts.length, 1);
		assert.equal(receipt.editorialJourney.agents.author.agentId, 'fixture-author');
		assert.equal(receipt.editorialJourney.agents.reviewer.agentId, 'fixture-reviewer');
		assert.ok(receipt.editorialJourney.attempts[0].candidateApproved);
		assert.equal(receipt.editorialReview.reviewerExecution.agentId, 'fixture-reviewer');
		assert.equal(stateOf(fixture).status, 'published', 'the local checkpoint advances only after the actual push');
	});
});

test('a same-topic publication racing the second fetch blocks the local publish before rebase or push', async () => {
	await withFixture(async fixture => {
		const candidate = fixtureCandidate(fixture.today);
		const candidateInput = startCandidate(fixture, candidate);
		approveCandidate(fixture, candidateInput);
		const article = await startArticle(fixture, candidate);
		approveArticle(fixture, article.input);
		const baseHead = fixture.remoteHead();
		succeeds(fixture.execute('--dry-run'), 'the prepared article must be valid against its original history');

		const foreignSlug = 'concurrent-same-topic-editorial';
		const foreignNote = historyNote({
			slug: foreignSlug, date: daysAgo(fixture.today, 1),
			title: 'La apertura del festival ya tuvo una cobertura concurrente', topicKey: candidate.topicKey,
		});
		fixture.env.TEST_RACE_NOTE = JSON.stringify(foreignNote);
		fixture.env.TEST_RACE_NOTE_PATH = `src/data/editorials/${foreignSlug}.json`;
		fixture.env.TEST_INJECT_RACE = '1';
		const publish = fixture.execute('--publish');
		rejects(publish, /historial|preflight|auditoría/i, 'a newly fetched same-topic note requires fresh review before integration');
		assert.notEqual(fixture.remoteHead(), baseHead, 'the concurrent publisher, not this attempt, moved origin/main');
		fixture.shell('git', ['fetch', 'origin', 'main']);
		const remotePaths = fixture.shell('git', ['ls-tree', '-r', '--name-only', 'origin/main']).split('\n');
		assert.ok(remotePaths.includes(`src/data/editorials/${foreignSlug}.json`));
		assert.equal(remotePaths.includes(`src/data/editorials/${article.slug}.json`), false, 'the locally prepared note stays unpublished after the history change');
		assert.equal(remotePaths.includes(`reports/daily-editorial/${fixture.today}.json`), false, 'the failed race does not write a same-day receipt');
		assert.equal(existsSync(fixture.bufferRequest), false, 'Buffer is never dispatched for the blocked local publication');

		const localCommit = fixture.shell('git', ['rev-parse', 'HEAD'], fixture.worktree());
		succeeds(fixture.execute('--review'), 'the same author can receive a fresh review packet after the newly published history is visible');
		const refreshedInput = fixture.readJson('.tmp/cineposta-daily/review-input.json');
		assert.notEqual(refreshedInput.contentDigest, article.input.contentDigest, 'the new public note changes the frozen review context');
		const duplicateReview = adverseReview({
			input: refreshedInput, verdict: 'duplicate_topic',
			relatedPublications: [{ recordId: `${foreignSlug}@${foreignNote.date}`, reason: 'A concurrent publication already covers this exact canonical topic key.', evidence: [fixtureEvidence(`https://history.example/${foreignSlug}`, fixture.today)] }],
		});
		succeeds(submitReview(fixture, duplicateReview), 'the same pinned reviewer can reject the stale candidate against the updated history');
		assert.equal(stateOf(fixture).status, 'duplicate_topic');
		succeeds(fixture.execute('--switch-topic'), 'the rejected local commit can be archived while keeping the competing publisher intact');
		const switched = stateOf(fixture);
		assert.equal(switched.attempts.length, 2);
		assert.equal(switched.attempts[0].localHistory.sha, localCommit);
		assert.equal(fixture.shell('git', ['show-ref', '--verify', '--hash', switched.attempts[0].localHistory.bookmark]), localCommit);
		assert.ok(switched.attempts[0].archive.manifest.some(item => item.path === 'note.json'));
		assert.ok(switched.attempts[0].archive.manifest.some(item => item.path === 'prepared-receipt.json'));
		assert.equal(fixture.remoteHead(), fixture.shell('git', ['rev-parse', 'origin/main']));
		assert.equal(fixture.shell('git', ['rev-parse', 'HEAD'], fixture.worktree()), fixture.remoteHead(), 'the new attempt starts from the concurrent main head');
		assert.equal(existsSync(fixture.pathInWorktree(`src/data/editorials/${article.slug}.json`)), false);
		assert.equal(existsSync(fixture.pathInWorktree(`reports/daily-editorial/${fixture.today}.json`)), false);
	}, {});
});

test('topic-switch recovery repairs a tampered archive from originals and preserves originals when both copies fail', async () => {
	const duplicate = historyNote({
		slug: 'prior-switch-topic', date: '2026-10-25', title: 'La apertura del festival ya fue anunciada',
		topicKey: 'festival-2026-film-opening-announcement',
	});
	const rejectAndInterruptSwitch = fixture => {
		const input = startCandidate(fixture);
		succeeds(submitReview(fixture, adverseReview({ input, verdict: 'duplicate_topic' })));
		const attempt = stateOf(fixture).attempts.at(-1);
		const archiveCandidate = resolve(fixture.repository, '.tmp/cineposta-daily', fixture.today, attempt.id, 'archive/research/candidate-input.json');
		const sourceCandidate = fixture.pathInWorktree('.tmp/cineposta-daily/candidate-input.json');
		fixture.env.TEST_BREAK_SWITCH = 'archive-only';
		fixture.env.TEST_SWITCH_ARCHIVE_FILE = archiveCandidate;
		fixture.env.TEST_SWITCH_SOURCE_FILE = sourceCandidate;
		const interrupted = fixture.execute('--switch-topic');
		rejects(interrupted, /No se reemplaza una jornada/i, 'the fixture stops after checkpointing switching_topic but before removing originals');
		assert.equal(stateOf(fixture).status, 'switching_topic');
		return { archiveCandidate, sourceCandidate, attemptId: attempt.id };
	};

	await withFixture(async fixture => {
		const { archiveCandidate, sourceCandidate, attemptId } = rejectAndInterruptSwitch(fixture);
		const originalSource = readFileSync(sourceCandidate);
		assert.notEqual(digest(readFileSync(archiveCandidate)), stateOf(fixture).attempts[0].archive.manifest.find(entry => entry.path === 'research/candidate-input.json').sha256);
		fixture.env.TEST_BREAK_SWITCH = '';
		succeeds(fixture.execute('--prepare'), 'prepare should restore only the archive copy whose source matches the saved manifest');
		const day = stateOf(fixture);
		assert.equal(day.attempts[0].id, attemptId);
		assert.equal(day.attempts[0].status, 'switching_topic');
		assert.equal(day.attempts.length, 2);
		const manifestEntry = day.attempts[0].archive.manifest.find(entry => entry.path === 'research/candidate-input.json');
		assert.equal(digest(readFileSync(archiveCandidate)), manifestEntry.sha256);
		assert.equal(readFileSync(archiveCandidate).length, manifestEntry.bytes);
		assert.equal(existsSync(sourceCandidate), false, 'original research is cleaned only after archive verification succeeds');
		assert.ok(originalSource.length > 0);
		assert.equal(day.attempts.at(-1).rounds.length, 0);
	}, { historyNotes: [duplicate] });

	await withFixture(async fixture => {
		const { archiveCandidate, sourceCandidate } = rejectAndInterruptSwitch(fixture);
		fixture.env.TEST_BREAK_SWITCH = 'both';
		const secondCrash = fixture.execute('--switch-topic');
		rejects(secondCrash, /No se reemplaza una jornada/i);
		fixture.env.TEST_BREAK_SWITCH = '';
		const badRecovery = fixture.execute('--prepare');
		rejects(badRecovery, /Archivo incompleto|alterado|originales conservados/i, 'if both copies fail their manifest hashes, recovery must stop before cleanup');
		assert.equal(stateOf(fixture).status, 'switching_topic');
		assert.equal(stateOf(fixture).attempts.length, 1);
		assert.ok(existsSync(sourceCandidate), 'a failed recovery keeps the original worktree research for manual recovery');
		assert.ok(existsSync(archiveCandidate), 'the corrupt archive remains in place for diagnosis');
		assert.ok(existsSync(fixture.pathInWorktree('.tmp/cineposta-daily/candidate.json')));
	}, { historyNotes: [duplicate] });
});
