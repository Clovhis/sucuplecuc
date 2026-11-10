import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import {
  buildHistoryIndex as buildRawHistoryIndex,
  loadEditorialDiversityPolicy,
  normalizeEditorialText,
  preflightCandidate,
  validateOriginalityReview,
} from './lib/editorial-diversity.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const policy = loadEditorialDiversityPolicy(root);
const buildHistoryIndex = input => buildRawHistoryIndex({ ...input, aliases: input.aliases ?? policy.entities });

function note({ date = '2026-11-09', slug = 'past-editorial', title = 'Godzilla Minus Zero y una nueva ventana', excerpt = 'Una cobertura previa con ángulo y evidencia propios.', tags = ['Godzilla Minus Zero'], contentText = 'La película Godzilla Minus Zero organiza su estreno internacional.', topicKey } = {}) {
  return {
    path: `src/data/editorials/${slug}.json`,
    data: {
      slug, date, title, excerpt, type: 'nota', tags,
      ...(topicKey ? { topicKey } : {}),
      sources: [{ label: 'Fuente histórica', url: 'https://example.test/history' }],
      content: [{ type: 'paragraph', text: contentText }],
    },
  };
}

function receipt({ date = '2026-11-09', slug = 'past-editorial', title = 'Godzilla Minus Zero y una nueva ventana', topicKey = 'prior-godzilla-announcement' } = {}) {
  return {
    path: `reports/daily-editorial/${date}.json`,
    data: { date, slug, title, topicKey, sourceChecks: [{ url: 'https://example.test/history', facts: 'A concrete checked fact from the prior event.' }] },
  };
}

function candidate({ date = '2026-11-10', eventDate = date, topicKey = 'godzilla-minus-zero-new-japanese-release-date', eventKey = topicKey, title = 'La distribución japonesa anuncia una fecha nueva' } = {}) {
  return {
    id: 'candidate-godzilla-date',
    topicKey,
    title,
    summary: 'Una fecha nueva permite explicar cómo se organiza el lanzamiento local.',
    event: { key: eventKey, type: 'release-announcement', date: eventDate, entities: ['godzilla-minus-zero-2026'], description: 'Anuncio confirmado de una fecha nueva de lanzamiento en Japón.' },
    entities: [{ id: 'godzilla-minus-zero-2026', kind: 'film', aliases: ['Godzilla Minus Zero', 'Gojira Minus Zero'] }],
    category: 'distribución',
    novelty: 'El ángulo se concentra en la decisión local de distribución y su calendario.',
    evidence: [{ url: 'https://example.test/new-event', checkedOn: date, claim: 'La fecha de estreno local cambió.' }],
  };
}

test('history index keeps every editorial and joins receipts without a 60-record cap', () => {
  const notes = Array.from({ length: 73 }, (_, index) => note({
    date: `2026-08-${String((index % 28) + 1).padStart(2, '0')}`,
    slug: `legacy-${index}`,
    title: `Legacy film event ${index}`,
    tags: [],
    contentText: `Historical editorial text ${index}.`,
  }));
  const receipts = [receipt({ date: notes[0].data.date, slug: notes[0].data.slug, title: notes[0].data.title, topicKey: 'legacy-receipt-key' })];
  const history = buildHistoryIndex({ notes, receipts, discarded: ['never-repeat-this-event'] });
  assert.equal(history.records.length, 73);
  assert.equal(history.recordCount, 73);
  assert.ok(history.records[0].sourcePaths.length >= 2);
  assert.ok(history.records[0].canonicalTopicKeys.includes('legacy-receipt-key'));
  assert.equal(history.discarded.length, 1);
  assert.match(history.digest, /^[a-f0-9]{64}$/u);
});

test('canonical topic keys and legacy report field aliases detect exact event duplicates', () => {
  const history = buildHistoryIndex({
    notes: [note({ slug: 'old-event', title: 'A different headline', tags: [], contentText: 'A prior item.' })],
    receipts: [{ path: 'reports/daily-editorial/2026-11-09.json', data: { date: '2026-11-09', slug: 'old-event', topic_key: 'same-event-key', event_key: 'legacy-event-alias' } }],
  });
  const exact = candidate({ topicKey: 'same-event-key', eventKey: 'same-event-key' });
  const blocked = preflightCandidate(exact, history, policy, '2026-11-10');
  assert.equal(blocked.decision, 'blocked');
  assert.equal(blocked.flags.duplicate_topic, true);
  assert.ok(blocked.matches.some(item => item.kind === 'duplicate_topic' && item.matchedKeys.includes('same-event-key')));

  const alias = candidate({ topicKey: 'legacy-event-alias', eventKey: 'legacy-event-alias' });
  assert.equal(preflightCandidate(alias, history, policy, '2026-11-10').flags.duplicate_topic, true);
});

test('Godzilla Minus Zero and Gojira Minus Zero resolve to a recent Godzilla franchise review', () => {
  const history = buildHistoryIndex({
    notes: [note({ slug: 'gojira-coverage', title: 'Gojira vuelve a ocupar la cartelera', tags: ['Gojira'], contentText: 'El estreno de Gojira movió el calendario local.' })],
    receipts: [receipt({ slug: 'gojira-coverage', topicKey: 'prior-japan-release' })],
  });
  const result = preflightCandidate(candidate(), history, policy, '2026-11-10');
  assert.equal(result.decision, 'review_required');
  assert.equal(result.flags.editorial_saturation, true);
  assert.ok(result.matches.some(item => item.kind === 'film_franchise_recency' && item.matchedEntities.some(entity => entity.groupIds.includes('franchise:godzilla'))));
  assert.ok(result.matches.every(item => item.recordId));
});

test('weekly guide entity mentions do not count as daily saturation; matching event keys require an audit', () => {
  const guide = note({
    slug: 'streaming-weekly-guide',
    title: 'Streaming de la semana: títulos nuevos y regresos',
    tags: ['Streaming de la semana', 'Godzilla Minus Zero'],
    contentText: 'La guía incluye Godzilla Minus Zero entre varios estrenos de la semana.',
  });
  const history = buildHistoryIndex({ notes: [guide] });
  const simpleMention = preflightCandidate(candidate(), history, policy, '2026-11-10');
  assert.equal(simpleMention.decision, 'eligible');
  assert.equal(simpleMention.flags.editorial_saturation, false);

  guide.data.topicKey = 'godzilla-minus-zero-new-japanese-release-date';
  const eventHistory = buildHistoryIndex({ notes: [guide] });
  const sameEvent = preflightCandidate(candidate(), eventHistory, policy, '2026-11-10');
  assert.equal(sameEvent.decision, 'review_required');
  assert.equal(sameEvent.flags.duplicate_topic, false);
  assert.ok(sameEvent.matches.some(item => item.kind === 'guide_same_event_key' && item.requiresEditorialComparison));

  const currentCandidate = candidate();
  const input = { date: '2026-11-10', contentDigest: 'guide-contribution-digest', candidate: currentCandidate };
  const context = { history: eventHistory, policy, candidate: currentCandidate, preflight: sameEvent };
  const report = approvedCandidateReport(eventHistory, currentCandidate, sameEvent, input.contentDigest);
  const guideRecord = eventHistory.records[0];
  report.originality.guideComparisons = [{
    recordId: guideRecord.id,
    relation: 'substantial_contribution',
    basis: 'The weekly listing names the title but does not develop this distribution event or its local consequence.',
    evidence: [{ recordId: guideRecord.id, sourcePath: guideRecord.sourcePath, excerpt: guideRecord.title }],
    candidateContribution: 'The daily report explains a distinct local distribution consequence and adds verified context.',
    difference: 'The guide only lists the film, while the daily item explains a sourced release announcement for Argentina.',
    contributionEvidence: [{ url: currentCandidate.evidence[0].url, checkedOn: input.date, excerpt: currentCandidate.evidence[0].claim }],
  }];
  assert.doesNotThrow(() => validateOriginalityReview(input, report, context));
  const falseNoOverlap = structuredClone(report);
  falseNoOverlap.originality.guideComparisons[0].relation = 'no_same_event';
  assert.throws(() => validateOriginalityReview(input, falseNoOverlap, context), /comparte la clave exacta/u);
});

test('a single-film streaming editorial is not classified as a weekly guide by generic tags', () => {
  const history = buildHistoryIndex({ notes: [note({
    slug: 'moana-llega-a-disney-plus-otra-cara-del-mismo-viaje',
    title: 'Moana llega a Disney+: otra cara del mismo viaje',
    tags: ['Estrenos de streaming', 'Disney Plus'],
    contentText: 'Una nota dedicada a una película específica.',
  })] });
  assert.equal(history.records[0].isGuide, false);

  const dailyReceipt = { path: 'reports/daily-editorial/2026-11-10.json', data: { date: '2026-11-10', slug: 'estrenos-cines-5-noviembre-2026', title: 'Estrenos de la semana', execution: { status: 'completed' } } };
  const daily = buildHistoryIndex({
    notes: [note({ date: '2026-11-10', slug: 'estrenos-cines-5-noviembre-2026', title: 'Estrenos de la semana', tags: ['Estrenos de la semana'] })],
    receipts: [dailyReceipt],
  });
  assert.equal(daily.records[0].isGuide, false);
});

test('Japanese original-title aliases remain searchable after normalization', () => {
  const history = buildHistoryIndex({ notes: [note({
    slug: 'japanese-title-legacy', title: 'ゴジラ-1.0、新作の発表', excerpt: '東京で新作映画が紹介された。', tags: ['日本映画'],
  })] });
  assert.equal(normalizeEditorialText('ゴジラ-1.0'), 'ゴジラ 1 0');
  const currentCandidate = candidate({ topicKey: 'new-japanese-godzilla-announcement', eventKey: 'new-japanese-godzilla-announcement' });
  currentCandidate.entities = [{ id: 'godzilla-one-point-zero', kind: 'film', aliases: ['ゴジラ-1.0'] }];
  currentCandidate.event.entities = ['godzilla-one-point-zero'];
  const result = preflightCandidate(currentCandidate, history, policy, '2026-11-10');
  assert.equal(result.decision, 'review_required');
  assert.ok(result.matches.some(match => match.matchedEntities.some(entity => entity.matchedAlias === 'ゴジラ-1.0')));
});

test('metadata-free exact event-key phrases ask for review without claiming semantic equivalence', () => {
  const history = buildHistoryIndex({ notes: [note({
    slug: 'legacy-event-text',
    title: 'Godzilla Minus Zero record north american opening 2026',
    excerpt: 'Una noticia sobre un lanzamiento internacional.',
    tags: [],
    contentText: 'A note about the wider release window.',
  })] });
  const result = preflightCandidate(candidate({
    topicKey: 'godzilla-minus-zero-record-north-american-opening-2026',
    eventKey: 'godzilla-minus-zero-record-north-american-opening-2026',
  }), history, policy, '2026-11-10');
  assert.equal(result.flags.duplicate_topic, false);
  assert.equal(result.decision, 'review_required');
  assert.ok(result.matches.some(item => item.kind === 'legacy_possible_same_event' && item.basis.includes('Exact event-key phrase')));
});

function approvedCandidateReport(history, currentCandidate, result, contentDigest) {
  const reviewMatches = result.matches.filter(item => item.requiresEditorialComparison && !item.kind.startsWith('guide_') && item.kind !== 'discarded_reconsideration');
  const grouped = new Map();
  for (const match of reviewMatches) grouped.set(match.recordId, [...(grouped.get(match.recordId) || []), match]);
  const comparisons = [...grouped.entries()].map(([recordId, matches]) => {
    const record = history.records.find(item => item.id === recordId);
    const comparison = {
      recordId,
      relation: 'distinct_event',
      priorAngle: 'The earlier publication focused on its own confirmed release and market context.',
      candidateContribution: 'This candidate examines a separate announcement with a different concrete distribution fact.',
      difference: 'The new reporting adds a local release date and does not repeat the prior box office angle.',
      eventDifference: undefined,
      newEventEvidence: undefined,
      evidence: [{ recordId: record.id, sourcePath: record.sourcePath, excerpt: record.summary || record.title }],
    };
    if (matches.some(match => match.kind === 'structured_event_overlap' || match.kind === 'legacy_possible_same_event')) {
      comparison.eventDifference = 'The source confirms a separate distribution decision with a different release fact and consequence.';
      comparison.newEventEvidence = [{ url: currentCandidate.evidence[0].url, checkedOn: result.date, excerpt: currentCandidate.evidence[0].claim }];
    }
    return comparison;
  });
  const recent = reviewMatches.filter(match => match.requiresFourteenDayException);
  return {
    version: 1,
    date: result.date,
    candidateId: currentCandidate.id,
    contentDigest,
    verdict: 'approved',
    originality: {
      verdict: 'approved',
      history: { digest: history.digest, recordCount: history.records.length, checkedRecordIds: history.records.map(record => record.id), checkedDiscardedIds: history.discarded.map(record => record.id) },
      coverage: { fullHistory: true, events: true, entities: true, guideContributions: true },
      comparisons,
      guideComparisons: [],
      ...(recent.length ? {
        exception14d: {
          verdict: 'approved',
          extraordinary: true,
          rationale: 'The verified new timing has immediate audience relevance and cannot be delayed without losing its narrow publication window.',
          distinctContribution: 'The candidate explains a confirmed local release date, while the previous item covered a separate theatrical launch and its box office record.',
          evidence: recent.map(match => {
            const record = history.records.find(item => item.id === match.recordId);
            return { recordId: record.id, sourcePath: record.sourcePath, excerpt: record.summary };
          }),
        },
      } : {}),
    },
  };
}

test('originality approval binds full history, explicit comparisons, and a separately validated 14-day exception', () => {
  const history = buildHistoryIndex({ notes: [note()], receipts: [receipt()] });
  const currentCandidate = candidate();
  const result = preflightCandidate(currentCandidate, history, policy, '2026-11-10');
  const input = { date: '2026-11-10', contentDigest: 'frozen-candidate-digest', candidate: currentCandidate };
  const context = { history, policy, candidate: currentCandidate, preflight: result };
  const report = approvedCandidateReport(history, currentCandidate, result, input.contentDigest);
  assert.equal(validateOriginalityReview(input, report, context).phase, 'candidate');

  const incomplete = structuredClone(report);
  incomplete.originality.history.checkedRecordIds = [];
  assert.throws(() => validateOriginalityReview(input, incomplete, context), /cubrir los .* registros históricos completos/u);

  const missingException = structuredClone(report);
  delete missingException.originality.exception14d;
  assert.throws(() => validateOriginalityReview(input, missingException, context), /excepción extraordinaria aprobada/u);

  const alteredPreflight = { ...result, flags: { ...result.flags, eligible: true } };
  assert.throws(() => validateOriginalityReview(input, report, { ...context, preflight: alteredPreflight }), /no coincide con el recálculo/u);
});

test('final approval requires factual, editorial, and originality dimensions', () => {
  const history = buildHistoryIndex({ notes: [] });
  const currentCandidate = candidate({ topicKey: 'fresh-event', eventKey: 'fresh-event' });
  const result = preflightCandidate(currentCandidate, history, policy, '2026-11-10');
  const input = { date: '2026-11-10', contentDigest: 'frozen-note-digest', candidate: currentCandidate, note: { title: 'A finished note' } };
  const context = { history, policy, candidate: currentCandidate, preflight: result };
  const report = {
    version: 1, date: input.date, candidateId: currentCandidate.id, contentDigest: input.contentDigest, verdict: 'approved',
    dimensions: { factual: 'approved', editorial: 'approved', originality: 'approved' },
    originality: {
      verdict: 'approved', history: { digest: history.digest, recordCount: 0, checkedRecordIds: [], checkedDiscardedIds: [] },
      coverage: { fullHistory: true, events: true, entities: true, guideContributions: true }, comparisons: [],
      guideComparisons: [],
    },
  };
  assert.equal(validateOriginalityReview(input, report, context).phase, 'final');
  delete report.dimensions.editorial;
  assert.throws(() => validateOriginalityReview(input, report, context), /veredicto editorial/u);
});

test('structured event overlap asks for a sourced distinct event and rejects a same-event verdict', () => {
  const priorCandidate = candidate({
    date: '2026-09-21', eventDate: '2026-09-20', topicKey: 'older-event-key', eventKey: 'older-event-key',
    title: 'Un anuncio anterior de distribución',
  });
  const history = buildHistoryIndex({ receipts: [{
    path: 'reports/daily-editorial/2026-09-21.json',
    data: {
      date: '2026-09-21', slug: 'older-release', title: priorCandidate.title, topicKey: 'older-event-key',
      sourceChecks: [{ url: 'https://example.test/history-event', facts: 'The source described an earlier release announcement.' }],
      editorialReview: { draft: { candidate: priorCandidate } },
    },
  }] });
  const currentCandidate = candidate({ eventDate: '2026-09-20' });
  const result = preflightCandidate(currentCandidate, history, policy, '2026-11-10');
  assert.equal(result.decision, 'review_required');
  assert.equal(result.flags.editorial_saturation, false);
  assert.ok(result.matches.some(item => item.kind === 'structured_event_overlap'));

  const input = { date: '2026-11-10', contentDigest: 'structured-event-digest', candidate: currentCandidate };
  const context = { history, policy, candidate: currentCandidate, preflight: result };
  const report = approvedCandidateReport(history, currentCandidate, result, input.contentDigest);
  assert.doesNotThrow(() => validateOriginalityReview(input, report, context));
  const sameEvent = structuredClone(report);
  sameEvent.originality.comparisons[0].relation = 'same_event';
  assert.throws(() => validateOriginalityReview(input, sameEvent, context), /identifica el mismo evento/u);
  const missingEvidence = structuredClone(report);
  delete missingEvidence.originality.comparisons[0].newEventEvidence;
  assert.throws(() => validateOriginalityReview(input, missingEvidence, context), /evidencia del evento nuevo/u);
});

test('film recency is scoped to film/franchise kinds and nested discarded candidates are indexed once', () => {
  const festivalNote = note({
    slug: 'festival-mention', title: 'Festival de ejemplo con nuevas fechas', tags: ['Festival de ejemplo'],
    contentText: 'El Festival de ejemplo anuncia su edición anual.',
  });
  const festivalCandidate = candidate({ topicKey: 'festival-new-programme', eventKey: 'festival-new-programme' });
  festivalCandidate.entities = [{ id: 'example-festival', kind: 'festival', aliases: ['Festival de ejemplo'] }];
  festivalCandidate.event.entities = ['example-festival'];
  const festivalHistory = buildHistoryIndex({ notes: [festivalNote] });
  const festivalResult = preflightCandidate(festivalCandidate, festivalHistory, policy, '2026-11-10');
  assert.equal(festivalResult.flags.editorial_saturation, false);
  assert.equal(festivalResult.matches[0].requiresFourteenDayException, false);

  const receiptWithDiscard = {
    path: 'reports/daily-editorial/2026-11-09.json',
    data: { date: '2026-11-09', slug: 'today', editorialJourney: { discarded: [{ reason: 'No distinct angle', candidate: { id: 'archived', topicKey: 'discarded-godzilla-event', title: 'Discarded topic', event: { key: 'discarded-godzilla-event' } } }] } },
  };
  const history = buildHistoryIndex({ receipts: [receiptWithDiscard], discarded: [{ reason: 'No distinct angle', candidate: { id: 'archived', topicKey: 'discarded-godzilla-event', title: 'Discarded topic', event: { key: 'discarded-godzilla-event' } } }] });
  assert.equal(history.discarded.length, 1);
  const result = preflightCandidate(candidate({ topicKey: 'discarded-godzilla-event', eventKey: 'discarded-godzilla-event' }), history, policy, '2026-11-10');
  assert.equal(result.flags.duplicate_topic, true);
});

test('discarded candidate IDs and event metadata block by default; new checked evidence requires auditor reconsideration', () => {
  const oldCandidate = candidate({ date: '2026-10-21', eventDate: '2026-10-20', topicKey: 'discarded-event', eventKey: 'discarded-event' });
  oldCandidate.evidence = [{ url: 'https://example.test/old-event', checkedOn: '2026-10-21', claim: 'The old source described an earlier distribution decision.' }];
  const publishedCandidate = candidate({ date: '2026-10-21', eventDate: '2026-10-19', topicKey: 'published-event', eventKey: 'published-event', title: 'An earlier film update' });
  const history = buildHistoryIndex({ receipts: [{
    path: 'reports/daily-editorial/2026-10-21.json',
    data: {
      date: '2026-10-21', slug: 'previous-attempt',
      editorialJourney: { discarded: [{ attemptId: 'attempt-godzilla-1', reason: 'The original source did not establish an independent angle.', candidate: oldCandidate }] },
      editorialReview: { draft: { candidate: publishedCandidate } },
    },
  }] });
  assert.equal(history.discarded.length, 1);
  assert.equal(history.discarded[0].candidateId, oldCandidate.id);
  assert.ok(history.records[0].canonicalTopicKeys.includes('published-event'));
  assert.ok(!history.records[0].canonicalTopicKeys.includes('discarded-event'));

  const repeated = candidate({ date: '2026-11-10', eventDate: '2026-10-20', topicKey: 'discarded-event', eventKey: 'discarded-event' });
  const blocked = preflightCandidate(repeated, history, policy, '2026-11-10');
  assert.equal(blocked.decision, 'blocked');
  assert.ok(blocked.matches.some(match => match.kind === 'discarded_topic'));

  const reconsidered = structuredClone(repeated);
  reconsidered.evidence.push({ url: 'https://example.test/reconsidered-source', checkedOn: '2026-11-10', claim: 'A new official update now confirms a separate distribution decision.' });
  reconsidered.reconsideration = {
    discardedId: 'attempt-godzilla-1',
    reason: 'A new official update confirms a development that was absent from the earlier material.',
    newEvidence: [{ url: 'https://example.test/reconsidered-source', checkedOn: '2026-11-10', excerpt: 'A new official update now confirms a separate distribution decision.' }],
  };
  const result = preflightCandidate(reconsidered, history, policy, '2026-11-10');
  assert.equal(result.decision, 'review_required');
  assert.equal(result.flags.duplicate_topic, false);
  assert.ok(result.matches.some(match => match.kind === 'discarded_reconsideration'));

  const input = { date: '2026-11-10', contentDigest: 'reconsideration-digest', candidate: reconsidered };
  const context = { history, policy, candidate: reconsidered, preflight: result };
  const report = approvedCandidateReport(history, reconsidered, result, input.contentDigest);
  report.originality.reconsiderations = [{
    discardedId: 'attempt-godzilla-1',
    basis: 'The new official source independently establishes a further distribution update and changes the available facts.',
    verdict: 'approved',
    newEvidence: structuredClone(reconsidered.reconsideration.newEvidence),
  }];
  assert.doesNotThrow(() => validateOriginalityReview(input, report, context));

  const missingAudit = structuredClone(report);
  delete missingAudit.originality.reconsiderations;
  assert.throws(() => validateOriginalityReview(input, missingAudit, context), /auditar cada descarte reconsiderado/u);
});

test('30-day film concentration requires an explicit rationale and a considered alternative', () => {
  const history = buildHistoryIndex({ notes: [
    note({ date: '2026-10-20', slug: 'godzilla-october-20', title: 'Godzilla Minus Zero en Japón', tags: ['Godzilla Minus Zero'] }),
    note({ date: '2026-10-25', slug: 'godzilla-october-25', title: 'Godzilla Minus Zero y su ventana internacional', tags: ['Godzilla Minus Zero'] }),
  ] });
  const currentCandidate = candidate({ topicKey: 'new-godzilla-local-update', eventKey: 'new-godzilla-local-update' });
  const result = preflightCandidate(currentCandidate, history, policy, '2026-11-10');
  assert.equal(result.flags.editorial_saturation, true);
  assert.ok(result.matches.some(match => match.kind === 'entity_concentration'));
  assert.ok(result.matches.every(match => match.requiresFourteenDayException === false));
  const input = { date: '2026-11-10', contentDigest: 'concentration-digest', candidate: currentCandidate };
  const context = { history, policy, candidate: currentCandidate, preflight: result };
  const report = approvedCandidateReport(history, currentCandidate, result, input.contentDigest);
  report.originality.concentrationReview = {
    rationale: 'The confirmed local update has a short public window and adds a practical fact absent from the earlier pieces.',
    alternativesConsidered: [{ topicKey: 'separate-festival-announcement', title: 'A new festival programme', reason: 'It had fewer confirmed details available for this date.' }],
  };
  assert.doesNotThrow(() => validateOriginalityReview(input, report, context));
  delete report.originality.concentrationReview;
  assert.throws(() => validateOriginalityReview(input, report, context), /justificación y al menos una alternativa/u);
});

test('a concentrated five-item film run still requires 30-day review when every prior item is inside the 14-day window', () => {
  const history = buildHistoryIndex({ notes: Array.from({ length: 5 }, (_, index) => note({
    date: `2026-11-0${index + 3}`,
    slug: `recent-godzilla-${index + 1}`,
    title: `Godzilla Minus Zero: actualización ${index + 1}`,
    tags: ['Godzilla Minus Zero'],
  })) });
  const currentCandidate = candidate({ topicKey: 'new-godzilla-local-update', eventKey: 'new-godzilla-local-update' });
  const result = preflightCandidate(currentCandidate, history, policy, '2026-11-10');
  const recencyMatches = result.matches.filter(match => match.requiresFourteenDayException);
  assert.equal(recencyMatches.length, 5);
  assert.ok(recencyMatches.every(match => match.requiresConcentrationReview === true));

  const input = { date: '2026-11-10', contentDigest: 'recent-concentration-digest', candidate: currentCandidate };
  const context = { history, policy, candidate: currentCandidate, preflight: result };
  const report = approvedCandidateReport(history, currentCandidate, result, input.contentDigest);
  assert.ok(report.originality.exception14d);
  assert.throws(() => validateOriginalityReview(input, report, context), /concentración de 30 días/u);

  report.originality.concentrationReview = {
    rationale: 'El dato confirmado tiene una ventana temporal breve y requiere priorizar esta publicación pese a la frecuencia reciente.',
    alternativesConsidered: [{ topicKey: 'independent-festival-update', title: 'Un anuncio de festival independiente', reason: 'El anuncio cuenta con menos detalles confirmados para esta fecha.' }],
  };
  assert.doesNotThrow(() => validateOriginalityReview(input, report, context));
});

test('a box-office comparison in another films source facts is not centered coverage', () => {
  const previous = note({ slug: 'godzilla-opening', title: 'Godzilla abre en Norteamérica', excerpt: 'La distribución de Godzilla organiza su estreno internacional.' });
  const previousReceipt = receipt({ slug: 'godzilla-opening', title: previous.data.title });
  previousReceipt.data.sourceChecks[0].facts = 'El reporte de Godzilla compara su apertura con Hero, la película de Zhang Yimou.';
  const history = buildHistoryIndex({ notes: [previous], receipts: [previousReceipt] });
  const current = candidate({ topicKey: 'hero-restauracion-anuncio', title: 'Hero vuelve restaurada' });
  current.entities = [{ id: 'hero-2002', kind: 'film', aliases: ['Hero'] }];
  current.event.entities = ['hero-2002'];
  const result = preflightCandidate(current, history, policy, '2026-11-10');
  assert.equal(result.flags.editorial_saturation, false);
  assert.ok(result.matches.some(match => match.kind === 'entity_overlap'));
  assert.ok(result.matches.every(match => !match.requiresFourteenDayException && !match.requiresConcentrationReview));
  current.entities.push({ id: 'godzilla-minus-zero-2026', kind: 'film', aliases: ['Godzilla Minus Zero'] });
  const contextual = preflightCandidate(current, history, policy, '2026-11-10');
  assert.equal(contextual.flags.editorial_saturation, false, 'a contextual entity in the new candidate does not become its central subject');
});
