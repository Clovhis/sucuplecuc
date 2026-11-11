import { test } from 'node:test';
import assert from 'node:assert/strict';
import { qualityFixture } from './test-helpers/editorial-quality-fixture.mjs';
import { fixtureNote, fixtureDraft, fixtureCandidate } from './test-helpers/daily-orchestrator-fixture.mjs';
import { reviewInput, validateEditorialQuality } from './lib/editorial-quality.mjs';
import { compactEditorialHistory, draftContractIssues, makeReviewPacket, reviewContractIssues } from './lib/editorial-review-tools.mjs';

function fixture(withOriginality = false) {
  const date = '2026-11-14', candidate = fixtureCandidate(date), note = fixtureNote(date, candidate), draft = fixtureDraft(date, candidate, note);
  if (withOriginality) draft.originalityContext = { history: { version: 1, digest: 'complete-history-1', records: [], discarded: [] }, preflight: { matches: [] } };
  else delete draft.candidate;
  return qualityFixture(note, draft);
}

test('local preflight reports all Nov 11 contract omissions together without changing artifacts', () => {
  const f = fixture(), before = JSON.stringify(f.input);
  assert.deepEqual(draftContractIssues(f.input.note, f.input.draft), []);
  assert.deepEqual(reviewContractIssues(f.input, f.report), []);
  for (const source of f.report.sources) delete source.originUrl;
  for (const image of f.report.images) image.basis = 'license';
  f.input.draft.claims[0].corroboration = 'primary-only';
  f.input.draft.claims[0].attribution = 'informó';
  f.input.draft.claims[0].limitation = 'Only the producer supplies this total.';
  const issues = reviewContractIssues(f.input, f.report);
  assert.equal(issues.filter(issue => issue.includes('/originUrl')).length, 2);
  assert.equal(issues.filter(issue => issue.startsWith('images/')).length, 4);
  assert.ok(issues.some(issue => issue.includes('/attribution')));
  assert.notEqual(JSON.stringify(f.input), before, 'only the deliberate fixture mutations occurred');
  const mutated = JSON.stringify(f.input); reviewContractIssues(f.input, f.report);
  assert.equal(JSON.stringify(f.input), mutated, 'lint never repairs facts or grants approval');
});

test('review packet reuses only the same reviewer judgments and never approves a delta', () => {
  const f = fixture(true), old = structuredClone(f.input);
  f.report.findings = [{ id: 'headline-precision', kind: 'claim', targetId: f.input.draft.claims[0].id, severity: 'material', status: 'open', description: 'The original headline needs a factual precision.' }];
  f.report.verdict = 'changes_required';
  const previous = { input: old, report: structuredClone(f.report), execution: f.reviewerExecution };
  f.input.note.title += ' con fecha confirmada';
  f.input.draft.claims[0].statement = f.input.note.title;
  const input = reviewInput(f.input.note, f.input.draft, f.input.assets, f.input.authorExecution);
  const packet = makeReviewPacket(input, { previous, history: [previous], reviewerAgentId: f.reviewerExecution.agentId });
  assert.equal(packet.template.verdict, 'pending');
  assert.equal(packet.template.claims[0].status, 'pending');
  assert.equal(packet.template.images[0].status, 'cleared', 'same reviewer already inspected these unchanged bytes/permissions');
  assert.equal(packet.template.checkedPaths.includes('title'), false);
  assert.equal(packet.template.findings[0].status, 'open');
  assert.equal(packet.template.findings[0].before, old.draft.claims[0].statement);
  assert.equal(packet.template.findings[0].after, input.draft.claims[0].statement);
  assert.equal(packet.delta.text.some(change => change.path === 'title'), true);
  assert.throws(() => validateEditorialQuality(input, packet.template, f.reviewerExecution, [previous]), /exige correcciones/);
  const foreign = makeReviewPacket(input, { previous, history: [], reviewerAgentId: 'another-native-reviewer' });
  assert.equal(foreign.template.images[0].status, 'pending', 'never inherit another agent approval');
  const changedHistory = structuredClone(input);
  changedHistory.draft.originalityContext.history.digest = 'different-history';
  const refreshed = makeReviewPacket(changedHistory, { previous, reviewerAgentId: f.reviewerExecution.agentId });
  assert.equal(refreshed.template.originality.verdict, 'pending');
  assert.deepEqual(refreshed.template.originality.history.checkedRecordIds, []);
  const changedCandidate = structuredClone(input);
  changedCandidate.draft.candidate.event.identity = 'different-event';
  const switched = makeReviewPacket(changedCandidate, { previous, reviewerAgentId: f.reviewerExecution.agentId });
  assert.equal(switched.delta.candidateChanged, true);
  assert.equal(switched.template.originality.verdict, 'pending', 'an unchanged history cannot approve another event');
});

test('compact history retains every record and discard, including records beyond 60', () => {
  const history = { version: 1, digest: 'complete-index', records: Array.from({ length: 85 }, (_, i) => ({ id: 'note-' + i, title: 'Film ' + i, summary: 'A distinct original event ' + i, isGuide: i % 7 === 0, sourcePaths: ['src/data/editorials/note-' + i + '.json'], sourceContentHashes: [{ sha256: 'duplicate machine metadata' }], searchText: 'Duplicate title/summary' })), discarded: [{ id: 'discarded-A', candidate: { title: 'An earlier unsuitable topic' } }] };
  const compact = compactEditorialHistory(history);
  assert.equal(compact.recordCount, 85);
  assert.deepEqual(compact.records.map(record => record.id), history.records.map(record => record.id));
  assert.deepEqual(compact.discarded, history.discarded);
  assert.deepEqual(compact.records.filter(record => record.isGuide).map(record => record.id), history.records.filter(record => record.isGuide).map(record => record.id));
  assert.ok(JSON.stringify(compact).length < JSON.stringify(history).length);
  history.records[0].searchText = history.records[0].title + '\nOriginal Japanese Film Title\nSource confirms this event happened yesterday.\nOriginal Japanese Film Title';
  assert.deepEqual(compactEditorialHistory(history).records[0].context, ['Original Japanese Film Title', 'Source confirms this event happened yesterday.']);
});
