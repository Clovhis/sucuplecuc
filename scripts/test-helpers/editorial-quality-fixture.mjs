import { editorialTextFields, reviewInput } from '../lib/editorial-quality.mjs';
import { SOCIAL_REVIEW_CHECKS } from '../lib/editorial-social.mjs';

// Synthetic evidence used only by tests; never a real source or license grant.
export const fixtureEvidence = (url, date) => ({ url, checkedOn: date, excerpt: 'Synthetic fixture evidence for an original film announcement.' });
export function addQualityFixture(note, draft, { social = true } = {}) {
  if (social) {
    const subject = note.title.split(/\s+/u).find(word => word.length >= 4 && !/^(cine|nota|noticia|película|nuevo|nueva|para|sobre|unas?|unos?|esta|este)$/iu.test(word)) || note.title;
    draft.social = { version: 1, subject };
    draft.tweet = `${subject}: una novedad para conversar. Te contamos qué cambia y por qué vale seguirla en la nota. https://www.cineposta.com.ar/editorial/${note.slug}/ #Cine`;
  }
  draft.claims = [{ id: 'headline-event', statement: note.title, corroboration: 'independent', evidence: note.sources.map(s => fixtureEvidence(s.url, note.date)) }];
  draft.access = { applicable: false, reason: 'Synthetic industry announcement without a viewing or event opportunity.' };
  for (const image of draft.imageChecks) image.rights = {
    status: 'cleared', basis: 'license', holder: 'Fixture Studio', termsUrl: 'https://fixture.example/license',
    excerpt: 'Synthetic fixture license permits web and social reproduction, resizing and format conversion.',
    conditions: 'Synthetic fixture, attribution not required.', checkedOn: note.date,
    allowedUses: ['web', 'social'], attributionRequired: false, requiredLinks: [],
    authorization: fixtureEvidence('https://fixture.example/license', note.date),
  };
}
export function approveQualityFixture(input) {
  const { note, draft } = input;
  return {
    reviewerExecution: { provider: 'codex-native', model: input.authorExecution.model, effort: 'max', status: 'completed', probe: 'passed', agentId: 'fixture-reviewer', forkTurns: 'none' },
    report: {
      version: 1, date: note.date, slug: note.slug, contentDigest: input.contentDigest, verdict: 'approved',
      coverage: Object.fromEntries(['names', 'quantities', 'units', 'dates', 'timezones', 'places', 'quotes', 'events', 'availability', 'visualRights', 'tweet', 'allMaterialClaims'].map(key => [key, true])),
      checkedPaths: Object.keys(editorialTextFields(note, draft.tweet)),
      sources: draft.sourceChecks.map((source, i) => ({ url: source.url, relationship: i === 0 ? 'primary' : 'independent', originUrl: source.url, basis: 'Synthetic original reporting from a distinct editorial origin.', evidence: [fixtureEvidence(source.url, note.date)] })),
      claims: draft.claims.map(claim => ({ id: claim.id, status: 'verified', basis: 'Synthetic verification against opened fixture sources.', evidence: claim.evidence })),
      access: [], accessReason: draft.access.reason,
      accessEvidence: [fixtureEvidence(note.sources[0].url, note.date)],
      images: [...new Set(draft.imageChecks.map(image => image.src))].map(src => ({ src, status: 'cleared', basis: 'Synthetic license inspected independently.', evidence: [fixtureEvidence('https://fixture.example/license', note.date)] })),
      findings: [],
      social: { ...Object.fromEntries(SOCIAL_REVIEW_CHECKS.map(key => [key, true])), basis: 'Synthetic independent review of the news, subject, invitation and conversational copy.' },
      ...(draft.candidate ? { candidateId: draft.candidate.id, dimensions: { factual: 'approved', editorial: 'approved', originality: 'approved' }, originality: approveOriginalityFixture(draft.originalityContext) } : {}),
    },
  };
}
export function approveOriginalityFixture({ history, preflight }) {
  return {
    verdict: 'approved', history: { digest: history.digest, recordCount: history.records.length, checkedRecordIds: history.records.map(r => r.id), checkedDiscardedIds: history.discarded.map(r => r.id) },
    coverage: { fullHistory: true, events: true, entities: true, guideContributions: true },
    comparisons: preflight.matches.filter(m => m.requiresEditorialComparison).map(match => ({ recordId: match.recordId, relation: 'distinct_event', priorAngle: 'Synthetic prior article about a different film event.', candidateContribution: 'Synthetic new event with a genuinely different announcement.', difference: 'Synthetic distinct facts and event independently verified.', evidence: [{ recordId: match.recordId, sourcePath: history.records.find(r => r.id === match.recordId).sourcePath, excerpt: 'Synthetic historical comparison with a distinct original announcement.' }] })),
    guideComparisons: history.records.filter(r => r.isGuide).map(record => ({ recordId: record.id, relation: 'no_same_event', basis: 'Synthetic guide only mentions another event and does not develop this announcement.', evidence: [{ recordId: record.id, sourcePath: record.sourcePaths[0], excerpt: 'Synthetic programme guide with a different event and useful context.' }] })),
  };
}
export function qualityFixture(note, draft, assets = {}, options = {}) {
  addQualityFixture(note, draft, { social: false, ...options });
  const author = { provider: 'codex-native', model: 'gpt-6-luna', effort: 'max', status: 'completed', probe: 'passed', agentId: 'fixture-author', forkTurns: 'none' };
  const input = reviewInput(note, draft, assets, author);
  return { input, ...approveQualityFixture(input) };
}
