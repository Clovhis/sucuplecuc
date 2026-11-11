import { isDeepStrictEqual } from 'node:util';
import { canonicalSource, validateDraft } from './daily-editorial-policy.mjs';
import { editorialTextFields, findingTarget, validateEditorialReviewContent } from './editorial-quality.mjs';
import { validateOriginalityReview } from './editorial-diversity.mjs';
import { SOCIAL_REVIEW_CHECKS, validateDailySocial } from './editorial-social.mjs';

const topics = ['names', 'quantities', 'units', 'dates', 'timezones', 'places', 'quotes', 'events', 'availability', 'visualRights', 'tweet', 'allMaterialClaims'];
const text = value => typeof value === 'string' && value.trim().length >= 8;
const copy = value => structuredClone(value);
function collector() {
  const issues = [];
  const test = (path, condition, message) => { if (!condition) issues.push(path + ': ' + message); };
  const attempt = (path, task) => { try { task(); } catch (error) { issues.push(path + ': ' + error.message); } };
  const evidence = (path, items, date) => {
    test(path, Array.isArray(items) && items.length > 0, 'evidencia abierta obligatoria');
    for (const [index, item] of (Array.isArray(items) ? items : []).entries()) {
      attempt(path + '/' + index + '/url', () => canonicalSource(item.url));
      test(path + '/' + index, item.checkedOn === date && text(item.excerpt), 'checkedOn de hoy y extracto literal de al menos 8 caracteres');
    }
  };
  return { issues, test, attempt, evidence };
}

export function draftContractIssues(note, draft) {
  const { issues, test, attempt, evidence } = collector(), date = note?.date;
  attempt('draft', () => validateDraft(note, draft, [], [], date));
  attempt('social', () => validateDailySocial(note, draft));
  if (!note?.cover || !Array.isArray(note.content)) return issues;
  const fields = editorialTextFields(note, draft.tweet), appears = value => typeof value === 'string' && Object.values(fields).some(field => field?.includes(value));
  test('claims', Array.isArray(draft.claims) && draft.claims.length > 0, 'registrar los hechos importantes');
  for (const claim of draft.claims || []) {
    const path = 'claims/' + claim.id;
    test(path + '/statement', text(claim.statement) && appears(claim.statement), 'fragmento público literal');
    evidence(path + '/evidence', claim.evidence, date);
    test(path + '/corroboration', ['independent', 'primary-only'].includes(claim.corroboration), 'independent o primary-only, sin inventar independencia');
    if (claim.corroboration === 'primary-only') {
      test(path + '/attribution', text(claim.attribution) && appears(claim.attribution), 'atribución específica literal de al menos 8 caracteres');
      test(path + '/limitation', text(claim.limitation), 'explicar la limitación de corroboración');
    }
  }
  test('access', typeof draft.access?.applicable === 'boolean', 'declarar si hay acceso pertinente');
  for (const item of draft.access?.items || []) for (const name of ['argentina', 'timing', 'cost', 'territory', 'subtitles']) {
    const field = item[name], path = 'access/' + item.id + '/' + name;
    test(path, ['confirmed', 'unconfirmed'].includes(field?.status) && text(field?.publishedText) && appears(field?.publishedText), 'dato o incertidumbre explícita en el texto');
    if (field?.status === 'confirmed') evidence(path + '/evidence', field.evidence, date);
  }
  for (const image of new Map([note.cover, ...note.content.filter(block => block.type === 'image')].map(image => [image.src, image])).values()) {
    const rights = draft.imageChecks?.find(item => item.src === image.src)?.rights, path = 'images/' + image.src + '/rights';
    test(path, rights?.status === 'cleared' && ['license', 'permission', 'public-domain', 'press-terms'].includes(rights?.basis), 'permiso del recurso, no solo procedencia');
    if (!rights) continue;
    for (const field of ['holder', 'excerpt', 'conditions']) test(path + '/' + field, field === 'holder' ? typeof rights[field] === 'string' && rights[field].trim().length >= 3 : text(rights[field]), 'documentar titular, autorización y condiciones');
    attempt(path + '/termsUrl', () => canonicalSource(rights.termsUrl));
    evidence(path + '/authorization', [rights.authorization || {}], date);
    test(path + '/allowedUses', rights.allowedUses?.includes('web') && (image.src !== note.cover.src || rights.allowedUses?.includes('social')), 'web y también social para portada');
  }
  return issues;
}

export function reviewContractIssues(input, report, history = []) {
  const { issues, test, attempt, evidence } = collector(), candidate = !!input.candidate, date = candidate ? input.date : input.note.date;
  const versionValid = report?.version === 1 || ((candidate || report?.verdict !== 'approved') && report?.version === undefined);
  test('binding', versionValid && report?.date === date && report?.contentDigest === input.contentDigest && (candidate ? report?.candidateId === input.candidate.id : report?.slug === input.note.slug), 'version/date/identidad/contentDigest deben ser los del snapshot actual');
  test('verdict', ['approved', 'changes_required', 'topic_unviable', 'duplicate_topic', 'editorial_saturation'].includes(report?.verdict), 'decisión explícita del auditor; pending no aprueba');
  if (!report) return issues;
  if (report.verdict !== 'approved') {
    test('reason', typeof report.reason === 'string' && report.reason.trim().length >= 20, 'motivo concreto');
    if (report.verdict === 'changes_required') {
      test('findings', report.findings?.some(finding => finding.status === 'open'), 'devolver hallazgos abiertos y accionables');
      for (const finding of report.findings?.filter(finding => finding.status === 'open') || []) {
        test('findings/' + finding.id, finding.targetId && text(finding.description) && typeof finding.action === 'string' && finding.action.length >= 12, 'objeto, problema y acción concreta');
        evidence('findings/' + finding.id + '/evidence', finding.evidence, date);
        if (!candidate) attempt('findings/' + finding.id + '/target', () => { if (!findingTarget(input, finding).exists) throw Error('objeto ausente'); });
      }
    }
    return issues;
  }
  if (candidate) {
    attempt('originality', () => validateOriginalityReview(input, report, { history: input.history, policy: input.policy, candidate: input.candidate, preflight: input.preflight }));
    return issues;
  }
  if (input.draft.social?.version === 1) attempt('social', () => validateDailySocial(input.note, input.draft, report));
  for (const claim of input.draft.claims || []) if (claim.corroboration === 'primary-only') test('draft/claims/' + claim.id + '/attribution', text(claim.attribution) && Object.values(input.textFields).some(field => field.includes(claim.attribution)), 'atribución literal específica de al menos 8 caracteres');
  for (const source of input.draft.sourceChecks || []) {
    const assessed = report.sources?.find(item => item.url === source.url), path = 'sources/' + source.url;
    test(path, assessed && ['primary', 'independent', 'syndicated', 'unestablished'].includes(assessed.relationship) && text(assessed.basis), 'clasificación y fundamento comprobados');
    if (!assessed) continue;
    if (assessed.relationship !== 'unestablished') attempt(path + '/originUrl', () => canonicalSource(assessed.originUrl));
    evidence(path + '/evidence', assessed.evidence, date);
  }
  for (const image of new Map((input.draft.imageChecks || []).map(image => [image.src, image])).values()) {
    const checked = report.images?.find(item => item.src === image.src), path = 'images/' + image.src;
    test(path + '/basis', checked?.status === 'cleared' && text(checked.basis), 'fundamento descriptivo de derechos, no el enum license');
    if (checked) evidence(path + '/evidence', checked.evidence, date);
  }
  if (!issues.length) attempt('review', () => validateEditorialReviewContent(input, report, history));
  return issues;
}

export function compactEditorialHistory(history) {
  return { version: history.version, digest: history.digest, recordCount: history.records.length,
    records: history.records.map(record => {
      const entry = Object.fromEntries(['id', 'date', 'slug', 'title', 'summary', 'type', 'category', 'tags', 'isGuide', 'centeredEntityIds', 'structuredEntityIds', 'eventMetadata', 'canonicalTopicKeys', 'topicKeys', 'sources', 'sourcePaths'].filter(key => record[key] !== undefined).map(key => [key, record[key]]));
      const displayed = new Set();
      const collect = value => { if (typeof value === 'string') displayed.add(value.trim()); else if (value && typeof value === 'object') Object.values(value).forEach(collect); };
      collect(entry);
      // Preserve aliases, source facts and candidate context that are only in
      // searchText. Remove duplicate lines, never semantic history evidence.
      const context = [...new Set((record.searchText || '').split('\n').map(line => line.trim()).filter(line => line && !displayed.has(line)))];
      return context.length ? { ...entry, context } : entry;
    }),
    discarded: history.discarded };
}

export function makeReviewPacket(input, { previous = null, history = [], candidateApproval = null, reviewerAgentId = null } = {}) {
  const candidate = !!input.candidate, date = candidate ? input.date : input.note.date;
  const currentHistory = candidate ? input.history : input.draft.originalityContext.history;
  const own = previous?.execution?.agentId === reviewerAgentId && previous.report.contentDigest === previous.input.contentDigest ? previous : null;
  const fields = candidate ? {} : input.textFields, priorFields = own?.input.textFields || {};
  const changes = (current, old, key) => [...new Set([...(current || []).map(item => item[key]), ...(old || []).map(item => item[key])])].flatMap(id => {
    const before = (old || []).find(item => item[key] === id) || null, after = (current || []).find(item => item[key] === id) || null;
    return isDeepStrictEqual(before, after) ? [] : [{ id, before, after }];
  });
  const oldHistory = own?.input.history || own?.input.draft?.originalityContext?.history;
  const priorInput = own?.input || (candidateApproval?.execution?.agentId === reviewerAgentId ? candidateApproval.input : null);
  const candidateChanged = !isDeepStrictEqual(input.candidate || input.draft?.candidate, priorInput?.candidate || priorInput?.draft?.candidate);
  const policyChanged = !isDeepStrictEqual(input.policy || input.draft?.originalityContext?.policy, priorInput?.policy || priorInput?.draft?.originalityContext?.policy);
  const delta = { previousContentDigest: own?.input.contentDigest || null, contentDigest: input.contentDigest,
    historyChanged: (oldHistory?.digest || candidateApproval?.report?.originality?.history?.digest) !== currentHistory.digest,
    candidateChanged, policyChanged,
    text: [...new Set([...Object.keys(fields), ...Object.keys(priorFields)])].filter(path => fields[path] !== priorFields[path]).map(path => ({ path, before: priorFields[path] ?? null, after: fields[path] ?? null })),
    claims: candidate ? [] : changes(input.draft.claims, own?.input.draft?.claims, 'id'),
    sources: candidate ? [] : changes(input.draft.sourceChecks, own?.input.draft?.sourceChecks, 'url'),
    images: candidate ? [] : changes(input.draft.imageChecks, own?.input.draft?.imageChecks, 'src'),
    assetsChanged: !isDeepStrictEqual(input.assets, own?.input.assets),
    accessChanged: !isDeepStrictEqual(input.draft?.access, own?.input.draft?.access) };
  const priorOriginality = own?.report.originality || (candidateApproval?.execution?.agentId === reviewerAgentId ? candidateApproval.report.originality : null);
  const originality = !candidateChanged && !policyChanged && priorOriginality?.history?.digest === currentHistory.digest ? copy(priorOriginality) : {
    verdict: 'pending', history: { digest: currentHistory.digest, recordCount: currentHistory.records.length, checkedRecordIds: [], checkedDiscardedIds: [] },
    coverage: { fullHistory: false, events: false, entities: false, guideContributions: false }, comparisons: [], guideComparisons: [], reconsiderations: [],
  };
  const template = { version: 1, date, contentDigest: input.contentDigest, candidateId: candidate ? input.candidate.id : input.draft.candidate.id,
    ...(candidate ? {} : { slug: input.note.slug }), verdict: 'pending', originality, findings: copy(own?.report.findings || []) };
  if (!candidate) {
    const sameSources = isDeepStrictEqual(input.draft.sourceChecks, own?.input.draft?.sourceChecks);
    Object.assign(template, { coverage: Object.fromEntries(topics.map(topic => [topic, false])),
      checkedPaths: (own?.report.checkedPaths || []).filter(path => fields[path] === priorFields[path]),
      dimensions: { factual: 'pending', editorial: 'pending', originality: 'pending' },
      sources: input.draft.sourceChecks.map(source => copy(own?.report.sources?.find(item => item.url === source.url && isDeepStrictEqual(source, own.input.draft.sourceChecks.find(old => old.url === source.url))) || { url: source.url, relationship: 'pending', originUrl: '', basis: '', evidence: [] })),
      claims: input.draft.claims.map(claim => copy(sameSources && own?.report.claims?.find(item => item.id === claim.id && isDeepStrictEqual(claim, own.input.draft.claims.find(old => old.id === claim.id))) || { id: claim.id, status: 'pending', basis: '', evidence: [] })),
      images: [...new Set([input.note.cover, ...input.note.content.filter(block => block.type === 'image')].map(image => image.src))].map(src => copy(!delta.assetsChanged && own?.report.images?.find(item => item.src === src && isDeepStrictEqual(input.draft.imageChecks.find(image => image.src === src), own.input.draft.imageChecks.find(image => image.src === src))) || { src, status: 'pending', basis: '', evidence: [] })),
      access: !delta.accessChanged && sameSources ? copy(own?.report.access || []) : [],
      ...(!delta.accessChanged && own?.report.accessReason ? { accessReason: own.report.accessReason, accessEvidence: copy(own.report.accessEvidence) } : {}),
    });
    if (input.draft.social?.version === 1) template.social = copy(
      input.draft.tweet === own?.input.draft?.tweet && isDeepStrictEqual(input.draft.social, own?.input.draft?.social)
      && isDeepStrictEqual(input.draft.imageChecks, own?.input.draft?.imageChecks) && !delta.assetsChanged && own?.report.social
        ? own.report.social : { ...Object.fromEntries(SOCIAL_REVIEW_CHECKS.map(key => [key, false])), basis: '' });
    for (const entry of history.filter(entry => entry.report?.contentDigest === entry.input?.contentDigest)) for (const finding of entry.report.findings || []) if ((finding.severity === 'material' || finding.kind === 'social') && !template.findings.some(item => item.id === finding.id)) template.findings.push(copy(finding));
    for (const finding of template.findings) {
      const original = history.find(entry => entry.report?.contentDigest === entry.input?.contentDigest && entry.report.findings?.some(old => old.id === finding.id && old.kind === finding.kind && old.targetId === finding.targetId && (old.field || 'statement') === (finding.field || 'statement') && old.status === 'open'));
      if (!original) continue;
      const before = findingTarget(original.input, finding).value, after = findingTarget(input, finding).value;
      if (finding.status !== 'resolved' || !isDeepStrictEqual(finding.after, after)) finding.status = 'open';
      finding.before = copy(before); finding.after = copy(after);
    }
  }
  return { template, delta };
}
