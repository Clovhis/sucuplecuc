import { editorialTextFields, reviewInput } from '../lib/editorial-quality.mjs';

// Synthetic evidence used only by tests; never a real source or license grant.
export const fixtureEvidence = (url, date) => ({ url, checkedOn: date, excerpt: 'Synthetic fixture evidence for an original film announcement.' });
export function addQualityFixture(note, draft) {
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
    },
  };
}
export function qualityFixture(note, draft, assets = {}) {
  addQualityFixture(note, draft);
  const author = { provider: 'codex-native', model: 'gpt-6-luna', effort: 'max', status: 'completed', probe: 'passed', agentId: 'fixture-author', forkTurns: 'none' };
  const input = reviewInput(note, draft, assets, author);
  return { input, ...approveQualityFixture(input) };
}
