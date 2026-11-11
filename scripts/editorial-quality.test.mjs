import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkConversion, checkTime, reviewInput, validateEditorialQuality, validateStoredEditorialReview, requireReviewedForSocial } from './lib/editorial-quality.mjs';
import { digest } from './lib/daily-editorial-policy.mjs';
import { qualityFixture, approveQualityFixture, fixtureEvidence } from './test-helpers/editorial-quality-fixture.mjs';

function fixture() {
  const date = '2026-11-10', slug = 'fixture-film-event';
  const image = { type: 'image', src: `assets/editorial/${slug}/still.webp`, srcSmall: `assets/editorial/${slug}/still-640.webp`, source: 'https://festival.example/still.jpg', alt: 'Synthetic film still', caption: 'Synthetic film frame.' };
  const note = { date, slug, title: 'El festival anuncia una película nueva', excerpt: 'Una noticia de cine contrastada con fuentes abiertas.', cover: image, content: [{ type: 'paragraph', text: 'Según el festival, se anuncia una nueva película.' }, image], sources: [{ label: 'Organizador oficial', url: 'https://festival.example/watch' }, { label: 'Entrevista independiente', url: 'https://news.example/interview' }] };
  const draft = { date, slug, tweet: `Una película para conversar después de la sala. https://www.cineposta.com.ar/editorial/${slug}/ #Cine`, sourceChecks: note.sources.map(s => ({ url: s.url })), imageChecks: [{ src: image.src, sourceUrl: image.source }] };
  return qualityFixture(note, draft, { [image.src]: 'fixture-original-bytes', [image.srcSmall]: 'fixture-small-bytes' });
}
const check = ({ input, report, reviewerExecution }, history = []) => validateEditorialQuality(input, report, reviewerExecution, history);
const refresh = value => {
  value.input = reviewInput(value.input.note, value.input.draft, value.input.assets, value.input.authorExecution);
  Object.assign(value, approveQualityFixture(value.input));
  return value;
};

test('claim metadata corrections bind actual fields without erasing correct public text', () => {
  const f = fixture();
  f.input.note.content[0].text += ' El festival informó la selección.';
  const claim = f.input.draft.claims[0];
  claim.corroboration = 'primary-only';
  claim.attribution = 'informó';
  claim.limitation = 'Solo el festival confirma esta selección cinematográfica.';
  refresh(f);
  const opening = { id: 'attribution-specific-source', kind: 'claim', field: 'attribution', targetId: claim.id, severity: 'minor', status: 'open', description: 'The metadata attribution names only a verb rather than its actual source.' };
  const prior = { input: structuredClone(f.input), report: { ...structuredClone(f.report), verdict: 'changes_required', findings: [opening] }, execution: f.reviewerExecution };
  f.input.draft.claims[0].attribution = 'El festival informó';
  refresh(f);
  f.report.claims[0].status = 'attributed';
  f.report.findings = [{ ...opening, status: 'resolved', before: 'informó', after: 'El festival informó', resolution: 'Only the actual attribution field was expanded to identify the source already named publicly.', evidence: [fixtureEvidence(f.input.note.sources[0].url, f.input.note.date)] }];
  assert.doesNotThrow(() => check(f, [prior]));
  assert.equal(f.input.draft.claims[0].statement, prior.input.draft.claims[0].statement);
  const forged = structuredClone(f);
  forged.report.findings[0].field = 'statement';
  assert.throws(() => check(forged, [prior]), /hallazgo original|mismo objeto/);
  const oldMaterial = structuredClone(prior);
  oldMaterial.report.findings[0].field = 'statement';
  oldMaterial.report.findings[0].severity = 'material';
  f.report.findings[0].severity = 'material';
  assert.throws(() => check(f, [oldMaterial]), /hallazgo original|objeto/);
});

test('approval requires another completed native Luna Max, full coverage and matching immutable input', () => {
  const f = fixture();
  assert.ok(check(f).reviewProof);
  assert.throws(() => check({ ...f, input: { ...f.input, authorExecution: { ...f.input.authorExecution, forkTurns: 'all' } } }), /autor debe iniciar/);
  for (const change of [{ agentId: f.input.authorExecution.agentId }, { effort: 'medium' }, { status: 'failed' }, { provider: 'external' }, { model: 'gpt-6-sol' }, { forkTurns: 'all' }]) assert.throws(() => check({ ...f, reviewerExecution: { ...f.reviewerExecution, ...change } }));
  for (const report of [{ ...f.report, verdict: 'changes_required' }, { ...f.report, contentDigest: 'old-digest' }, { ...f.report, checkedPaths: [] }, { ...f.report, coverage: { ...f.report.coverage, units: false } }, { ...f.report, claims: [] }]) assert.throws(() => check({ ...f, report }));
});

test('changed title, tweet, evidence, caption or image bytes invalidates the independent approval', () => {
  const changes = [
    f => { f.input.note.title += ' y otra cifra'; },
    f => { f.input.draft.tweet += ' Otro dato.'; },
    f => { f.input.draft.claims[0].evidence[0].excerpt += ' changed'; },
    f => { f.input.note.content[1].caption += ' changed'; },
    f => { f.input.assets[Object.keys(f.input.assets)[0]] = 'other-bytes'; },
  ];
  for (const change of changes) {
    const f = fixture(); change(f);
    f.input = reviewInput(f.input.note, f.input.draft, f.input.assets, f.input.authorExecution);
    assert.throws(() => check(f), /antigua|otra preparación/);
  }
});

test('regression: 50 miles cannot become 50 km even with a nominal approval', () => {
  assert.throws(() => checkConversion({ fromValue: 50, fromUnit: 'mi', toValue: 50, toUnit: 'km', decimals: 0 }), /80.4672/);
  for (const [toValue, decimals] of [[80, 0], [80.5, 1], [80.467, 3]]) assert.doesNotThrow(() => checkConversion({ fromValue: 50, fromUnit: 'mi', toValue, toUnit: 'km', decimals }));
  assert.throws(() => checkConversion({ fromValue: 50, fromUnit: 'mi', toValue: 80.4, toUnit: 'km', decimals: 1 }));
  assert.throws(() => checkConversion({ fromValue: 50, fromUnit: 'mi', toValue: 50, toUnit: 'min', decimals: 0 }));
  const f = fixture();
  f.input.note.title = 'Ku Stevens recorre 50 kilómetros';
  f.input.draft.claims[0].statement = f.input.note.title;
  f.input.draft.claims[0].evidence.forEach(item => { item.excerpt = 'Retracing his great-grandfather’s 50-mile escape route.'; });
  refresh(f);
  assert.throws(() => check(f), /conversión incorrecta/);
  f.input.draft.claims[0].conversion = { fromValue: 50, fromUnit: 'mi', toValue: 50, toUnit: 'km', decimals: 0 };
  refresh(f);
  assert.throws(() => check(f), /conversión incorrecta/);
  f.input.note.title = 'Ku Stevens recorre 80 kilómetros';
  f.input.draft.claims[0].statement = f.input.note.title;
  f.input.draft.claims[0].conversion.toValue = 80;
  refresh(f); assert.doesNotThrow(() => check(f));
});

test('a syndicated press release never becomes independent corroboration by changing domains', () => {
  const f = fixture();
  f.report.sources[1].relationship = 'syndicated';
  f.report.sources[1].originUrl = f.report.sources[0].originUrl;
  assert.throws(() => check(f), /no independiente/);
  f.input.draft.claims[0].corroboration = 'primary-only';
  f.input.draft.claims[0].limitation = 'Only the organizer confirms this announcement; no independent confirmation found.';
  f.input.draft.claims[0].attribution = 'Según el festival';
  refresh(f);
  f.report.sources[1].relationship = 'syndicated';
  f.report.sources[1].originUrl = f.report.sources[0].originUrl;
  f.report.claims[0].status = 'attributed';
  f.report.claims[0].evidence = [fixtureEvidence(f.input.note.sources[0].url, f.input.note.date)];
  assert.doesNotThrow(() => check(f));
  f.input.note.sources.pop(); f.input.draft.sourceChecks.pop();
  f.input.draft.claims[0].evidence = [fixtureEvidence(f.input.note.sources[0].url, f.input.note.date)];
  refresh(f); f.report.claims[0].status = 'attributed';
  assert.doesNotThrow(() => check(f), 'an honestly attributed primary-only report does not invent a second source');
});

test('hidden corroborating sources and an unsupported no-access declaration are rejected', () => {
  const f = fixture();
  f.input.note.sources.pop();
  f.input = reviewInput(f.input.note, f.input.draft, f.input.assets, f.input.authorExecution); f.report.contentDigest = f.input.contentDigest;
  assert.throws(() => check(f), /fuentes de corroboración/);
  const g = fixture(); delete g.report.accessEvidence;
  assert.throws(() => check(g), /evidencia abierta/);
});

test('ART conversions check the source zone including DST and crossing midnight', () => {
  const winter = { instant: '2026-11-13T17:00:00-05:00', sourceZone: 'America/New_York', sourceLocal: '2026-11-13 17:00', art: '2026-11-13 19:00 ART' };
  assert.doesNotThrow(() => checkTime(winter));
  assert.throws(() => checkTime({ ...winter, art: '2026-11-13 18:00 ART' }), /ART incorrecta/);
  assert.throws(() => checkTime({ ...winter, instant: '2026-11-13T17:00:00-04:00' }), /DST/);
  assert.throws(() => checkTime({ ...winter, sourceZone: undefined }), /zona de origen/);
  assert.throws(() => checkTime({ ...winter, instant: '2026-02-30T17:00:00-05:00', sourceLocal: '2026-03-02 17:00', art: '2026-03-02 19:00 ART' }), /fecha inexistente/);
  assert.doesNotThrow(() => checkTime({ instant: '2026-07-13T17:00:00-04:00', sourceZone: 'America/New_York', sourceLocal: '2026-07-13 17:00', art: '2026-07-13 18:00 ART' }));
  assert.doesNotThrow(() => checkTime({ instant: '2026-12-31T23:00:00-05:00', sourceZone: 'America/New_York', sourceLocal: '2026-12-31 23:00', art: '2027-01-01 01:00 ART' }));
});

test('how to watch requires a public official link and explicit AR, time, cost, territory and subtitles information', () => {
  const f = fixture();
  const labels = { argentina: 'Disponibilidad desde Argentina sin confirmar.', timing: 'Horario ART no confirmado.', cost: 'Costo no confirmado.', territory: 'Territorio no informado.', subtitles: 'Subtítulos no informados.' };
  f.input.note.content[0].text += ` ${Object.values(labels).join(' ')}`;
  f.input.draft.access = { applicable: true, reason: 'There is an announced online film event.', items: [{ id: 'film-access', officialUrl: f.input.note.sources[0].url, ...Object.fromEntries(Object.entries(labels).map(([key, publishedText]) => [key, { status: 'unconfirmed', publishedText }])) }] };
  refresh(f);
  const checked = { id: 'film-access', status: 'qualified', basis: 'The source does not establish AR rights, price or subtitles yet.', evidence: [fixtureEvidence(f.input.note.sources[0].url, f.input.note.date)], destination: { url: f.input.note.sources[0].url, kind: 'official-programme', evidence: [fixtureEvidence(f.input.note.sources[0].url, f.input.note.date)] } };
  f.report.access = [checked];
  assert.doesNotThrow(() => check(f));
  f.report.access[0].destination.kind = 'press-release'; assert.throws(() => check(f), /destino oficial/);
  f.report.access[0].destination.kind = 'official-programme';
  f.report.access[0].status = 'verified'; assert.throws(() => check(f), /no confirmado/);
  f.report.access[0].status = 'qualified';
  f.input.draft.access.items[0].officialUrl = 'https://festival.example/unpublished-player';
  f.input = reviewInput(f.input.note, f.input.draft, f.input.assets, f.input.authorExecution); f.report.contentDigest = f.input.contentDigest;
  assert.throws(() => check(f), /enlace oficial directo/);
});

test('stored receipts bind publication, tweet, evidence and bytes; only exact legacy receipts are grandfathered', () => {
  const f = fixture();
  const q = check(f).record;
  const receipt = { date: f.input.note.date, slug: f.input.note.slug, title: f.input.note.title, execution: f.input.authorExecution, tweet: f.input.draft.tweet, sourceChecks: f.input.draft.sourceChecks, imageChecks: f.input.draft.imageChecks, editorialReview: q };
  const verify = value => validateStoredEditorialReview(value, f.input.note, f.input.assets);
  assert.equal(verify(receipt), 'reviewed');
  assert.throws(() => verify({ ...receipt, tweet: 'A replacement social message.' }), /recibo, tweet/);
  assert.throws(() => validateStoredEditorialReview(receipt, f.input.note, { ...f.input.assets, changed: 'hash' }), /no coinciden/);
  const legacy = { ...receipt }; delete legacy.editorialReview;
  assert.throws(() => verify(legacy), /nueva publicación/);
  const allow = { [legacy.date]: digest(JSON.stringify(legacy)) };
  assert.equal(validateStoredEditorialReview(legacy, f.input.note, {}, allow), 'legacy-unreviewed');
  assert.throws(() => requireReviewedForSocial('legacy-unreviewed'), /no habilita envíos/);
  assert.doesNotThrow(() => requireReviewedForSocial('reviewed'));
  assert.throws(() => validateStoredEditorialReview({ ...legacy, tweet: 'Changed unreviewed tweet' }, f.input.note, {}, allow), /nueva publicación/);
});

test('withdrawing an access item cannot leave its rejected statements in the public copy', () => {
  const f = fixture();
  const item = { id: 'access-event', officialUrl: f.input.note.sources[0].url };
  for (const field of ['argentina', 'timing', 'cost', 'territory', 'subtitles']) item[field] = { status: 'unconfirmed', publishedText: `Dato de acceso ${field} no confirmado.` };
  f.input.draft.access = { applicable: true, reason: 'Synthetic online film event.', items: [item] };
  f.input.note.content[0].text += ` ${item.argentina.publishedText}`;
  refresh(f);
  const finding = { id: 'withdraw-access', kind: 'access', targetId: item.id, severity: 'material', status: 'open', description: 'Synthetic access claim was not supported.' };
  f.report.findings = [finding];
  const history = [{ input: structuredClone(f.input), report: structuredClone(f.report), execution: f.reviewerExecution }];
  f.input.draft.access = { applicable: false, reason: 'There is no viewing event or viewing opportunity.' }; refresh(f);
  f.report.findings = [{ ...finding, status: 'resolved', before: item, after: null, resolution: 'Withdrawn unsupported viewing information.', evidence: [fixtureEvidence(f.input.note.sources[0].url, f.input.note.date)] }];
  assert.throws(() => check(f, history), /acceso retirado sigue/);
  f.input.note.content[0].text = 'Se publicó una noticia industrial, sin exhibición anunciada.';
  f.input = reviewInput(f.input.note, f.input.draft, f.input.assets, f.input.authorExecution); f.report.contentDigest = f.input.contentDigest;
  assert.doesNotThrow(() => check(f, history));
});

test('uncertain image rights, origin-as-license, missing social scope and invisible credits block publication', () => {
  for (const mutate of [
    r => { r.status = 'uncertain'; },
    r => { r.termsUrl = 'https://festival.example/still.jpg'; },
    r => { r.allowedUses = ['web']; },
    r => { r.conditions = ''; },
    r => { delete r.authorization; },
    r => { r.attributionRequired = true; r.credit = 'Foto de Fixture Studio'; },
  ]) {
    const f = fixture(); mutate(f.input.draft.imageChecks[0].rights); refresh(f); assert.throws(() => check(f));
  }
  const f = fixture();
  Object.assign(f.input.draft.imageChecks[0].rights, { attributionRequired: true, credit: 'Foto de Fixture Studio' });
  f.input.draft.tweet += ' Foto de Fixture Studio';
  f.input.note.cover.caption = 'Foto de Fixture Studio';
  // Body is an independent object: a cover-only caption is not rendered.
  f.input.note.content[1] = { ...f.input.note.content[1], caption: 'Another film still.' };
  refresh(f); assert.throws(() => check(f), /atribución visible/);
  f.input.note.content[1].caption = 'Foto de Fixture Studio'; refresh(f);
  assert.doesNotThrow(() => check(f));
});

test('material findings cannot be approved, erased or marked fixed without a real documented change', () => {
  const f = fixture();
  const distance = { ...structuredClone(f.input.draft.claims[0]), id: 'distance-stevens', statement: 'Ku Stevens recorre 50 kilómetros', conversion: { fromValue: 50, fromUnit: 'mi', toValue: 50, toUnit: 'km', decimals: 0 } };
  distance.evidence.forEach(item => { item.excerpt = 'Retracing the 50-mile escape route.'; });
  f.input.note.content[0].text += ` ${distance.statement}`;
  f.input.draft.claims.push(distance); refresh(f);
  const finding = { id: 'units-distance', kind: 'claim', targetId: 'distance-stevens', severity: 'material', status: 'open', description: 'Published kilometres contradict the primary source in miles.' };
  f.report.findings = [finding]; assert.throws(() => check(f), /material abierta|conversión incorrecta/);
  const history = [{ input: structuredClone(f.input), report: structuredClone(f.report), execution: f.reviewerExecution }];
  f.input.note.content[0].text = f.input.note.content[0].text.replace(distance.statement, 'Ku Stevens recorre 80 kilómetros');
  distance.statement = 'Ku Stevens recorre 80 kilómetros'; distance.conversion.toValue = 80;
  refresh(f);
  f.report.findings = []; assert.throws(() => check(f, history), /borrar hallazgos/);
  const resolved = { ...finding, status: 'resolved', before: 'Ku Stevens recorre 50 kilómetros', after: distance.statement, resolution: 'Corrected the statement and checked it against the original source.', evidence: [fixtureEvidence(f.input.note.sources[0].url, f.input.note.date)] };
  f.report.findings = [resolved]; assert.doesNotThrow(() => check(f, history));
  resolved.after = f.input.note.title; assert.throws(() => check(f, history), /mismo claim/);
  resolved.after = resolved.before; assert.throws(() => check(f, history), /antes, después/);
});

test('a material fact omitted from the original claim ledger can be corrected against its public text snapshot', () => {
  const f = fixture();
  const wrong = 'Ku Stevens recorre 50 kilómetros';
  f.input.note.content[0].text += ` ${wrong}`; refresh(f);
  const oldParagraph = f.input.note.content[0].text;
  const finding = { id: 'omitted-distance', kind: 'text', targetId: 'content/0/text', severity: 'material', status: 'open', description: 'Distance error omitted from the author claim ledger.' };
  f.report.findings = [finding];
  const history = [{ input: structuredClone(f.input), report: structuredClone(f.report), execution: f.reviewerExecution }];
  f.input.note.content[0].text = oldParagraph.replace(wrong, 'Ku Stevens recorre 80 kilómetros');
  const registered = { ...structuredClone(f.input.draft.claims[0]), id: 'new-distance-claim', statement: 'Ku Stevens recorre 80 kilómetros', conversion: { fromValue: 50, fromUnit: 'mi', toValue: 80, toUnit: 'km', decimals: 0 } };
  registered.evidence.forEach(item => { item.excerpt = 'Retracing the 50-mile escape route.'; });
  f.input.draft.claims.push(registered); refresh(f);
  f.report.findings = [{ ...finding, status: 'resolved', before: oldParagraph, after: f.input.note.content[0].text, objectedText: wrong, claimId: registered.id, resolution: 'Corrected the public distance against the original unit.', evidence: [fixtureEvidence(f.input.note.sources[0].url, f.input.note.date)] }];
  assert.doesNotThrow(() => check(f, history));
  f.report.findings[0].after = f.input.note.title;
  assert.throws(() => check(f, history), /mismo claim/);
  f.input.note.content.shift();
  f.input.draft.claims = f.input.draft.claims.filter(claim => claim.id !== registered.id);
  refresh(f);
  f.report.findings = [{ ...finding, status: 'resolved', before: oldParagraph, after: null, objectedText: wrong, resolution: 'Withdrawn the unsupported paragraph entirely.', evidence: [fixtureEvidence(f.input.note.sources[0].url, f.input.note.date)] }];
  assert.doesNotThrow(() => check(f, history));
});
