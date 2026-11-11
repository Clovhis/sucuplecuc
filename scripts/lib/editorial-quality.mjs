import { canonicalSource, digest } from './daily-editorial-policy.mjs';
import { validateNativeExecution } from './cineposta-luna.mjs';
import { isDeepStrictEqual } from 'node:util';
import { validateDailySocial } from './editorial-social.mjs';
import { validateOriginalityReview } from './editorial-diversity.mjs';
import { validateCandidateCorrections } from './editorial-day.mjs';

const requireThat = (condition, message) => { if (!condition) throw new Error(`Revisión editorial: ${message}`); };
const text = value => typeof value === 'string' && value.trim().length >= 8;
const unique = (items, key) => new Set(items.map(key)).size === items.length;
const url = value => { requireThat(typeof value === 'string', 'falta URL verificable.'); canonicalSource(value); return value; };
export const QUALITY_VERSION = 1;

export function requireReviewedForSocial(status) {
  requireThat(status === 'reviewed', 'una excepción histórica sin revisión no habilita envíos a X; usar --verify para lectura de Pages.');
}

export const CLAIM_REVIEW_FIELDS = ['statement', 'attribution', 'limitation', 'evidence', 'corroboration'];
const findingField = finding => finding.kind === 'claim' ? (finding.field || 'statement') : null;
export function findingTarget(input, finding) {
  if (finding.kind === 'social') {
    requireThat(finding.targetId === 'tweet' && finding.severity === 'minor', 'social sólo identifica presentación del tweet; hechos y derechos conservan sus tipos y severidad.');
    return { exists: typeof input.draft.tweet === 'string', value: input.draft.tweet ?? null };
  }
  if (finding.kind === 'text') {
    const fields = editorialTextFields(input.note, input.draft.tweet);
    return { exists: Object.hasOwn(fields, finding.targetId), value: fields[finding.targetId] ?? null };
  }
  if (finding.kind === 'claim') {
    requireThat(CLAIM_REVIEW_FIELDS.includes(findingField(finding)), 'campo de claim no verificable.');
    const claim = input.draft.claims?.find(item => item.id === finding.targetId);
    return { exists: !!claim, value: claim?.[findingField(finding)] ?? null };
  }
  if (finding.kind === 'access') {
    const item = input.draft.access?.items?.find(item => item.id === finding.targetId);
    return { exists: !!item, value: item ?? null };
  }
  if (finding.kind === 'image') {
    const image = input.draft.imageChecks?.find(item => item.src === finding.targetId);
    return { exists: !!image, value: image?.rights ?? null };
  }
  throw new Error('Revisión editorial: hallazgo sin tipo de objeto verificable.');
}

// These are public copy, including the social copy. Cover captions alone are not
// visible on this site's article template and cannot satisfy a credit requirement.
export function editorialTextFields(note, tweet) {
  const fields = { title: note.title, excerpt: note.excerpt, date: note.date, tweet, 'cover/alt': note.cover.alt };
  if (typeof note.author === 'string') fields.author = note.author;
  (note.tags || []).forEach((tag, i) => { fields[`tags/${i}`] = tag; });
  note.content.forEach((block, i) => {
    for (const key of ['text', 'alt', 'caption']) if (block[key]) fields[`content/${i}/${key}`] = block[key];
  });
  (note.sources || []).forEach((source, i) => { fields[`sources/${i}/label`] = source.label; });
  return fields;
}

export function reviewInput(note, draft, assets, authorExecution) {
  const payload = { version: QUALITY_VERSION, note, draft, assets, authorExecution };
  return { ...payload, contentDigest: digest(JSON.stringify(payload)), textFields: editorialTextFields(note, draft.tweet) };
}

export function snapshotEditorialAssets(note, readAsset) {
  const paths = new Set([note.cover, ...note.content.filter(b => b.type === 'image')].flatMap(image => [image.src, image.srcSmall]));
  return Object.fromEntries([...paths].sort().map(path => {
    requireThat(typeof path === 'string' && new RegExp(`^assets/editorial/${note.slug}/[a-z0-9-]+\\.webp$`).test(path), 'asset fuera del alcance de la nota.');
    return [path, digest(readAsset(path))];
  }));
}

export function validateStoredEditorialReview(receipt, note, assets, legacy = {}) {
  requireThat(receipt.slug === note.slug && receipt.date === note.date && receipt.title === note.title, 'recibo no correspondiente a la nota publicada.');
  if (!receipt.editorialReview) {
    requireThat(legacy[receipt.date] === digest(JSON.stringify(receipt)), 'una nueva publicación diaria necesita revisión independiente; no se aprueba como histórico.');
    return 'legacy-unreviewed';
  }
  const q = receipt.editorialReview;
  requireThat(q.version === QUALITY_VERSION && isDeepStrictEqual(q.claims, q.draft?.claims) && isDeepStrictEqual(q.access, q.draft?.access), 'versión o registro factual incoherente.');
  requireThat(isDeepStrictEqual(receipt.execution, q.authorExecution) && receipt.tweet === q.draft?.tweet && isDeepStrictEqual(receipt.sourceChecks, q.draft.sourceChecks) && isDeepStrictEqual(receipt.imageChecks, q.draft.imageChecks), 'recibo, tweet o evidencia distintos de la preparación revisada.');
  const input = reviewInput(note, q.draft, assets, q.authorExecution);
  requireThat(q.contentDigest === input.contentDigest && isDeepStrictEqual(q.assets, assets), 'la nota o las imágenes publicadas no coinciden con la revisión.');
  validateEditorialQuality(input, q.report, q.reviewerExecution, q.history);
  if (q.draft.candidate) {
    const journey = receipt.editorialJourney;
    requireThat(journey?.version === 1 && journey.date === note.date && journey.status === 'approved', 'falta checkpoint aprobado de la jornada.');
    const active = journey.attempts?.at(-1);
    requireThat(active?.status === 'approved' && isDeepStrictEqual(active.candidate, q.draft.candidate), 'intento aprobado distinto del contenido publicado.');
    for (const [role, execution] of [['author', q.authorExecution], ['reviewer', q.reviewerExecution]]) requireThat(journey.agents?.[role]?.agentId === execution.agentId && journey.agents[role].model === execution.model && journey.agents[role].effort === execution.effort, 'la jornada cambió de agente o selección durante el ciclo.');
    const last = active.rounds?.at(-1);
    requireThat(last?.phase === 'article' && last.input.contentDigest === input.contentDigest && isDeepStrictEqual(last.report, q.report) && isDeepStrictEqual(last.execution, q.reviewerExecution), 'aprobación no vinculada al último snapshot del intento.');
    for (const attempt of journey.attempts) {
      for (const [roundIndex, round] of (attempt.rounds || []).entries()) {
        const payload = round.phase === 'candidate'
          ? Object.fromEntries(Object.entries(round.input).filter(([key]) => key !== 'contentDigest'))
          : { version: round.input.version, note: round.input.note, draft: round.input.draft, assets: round.input.assets, authorExecution: round.input.authorExecution };
        requireThat(digest(JSON.stringify(payload)) === round.input.contentDigest, 'snapshot de intento archivado alterado.');
        if (round.report) {
          requireThat(round.report.contentDigest === round.input.contentDigest, 'informe archivado ajeno a su snapshot.');
          requireThat(round.input.authorExecution.agentId === journey.agents.author.agentId && round.execution?.agentId === journey.agents.reviewer.agentId, 'los intentos no reutilizaron los dos agentes independientes.');
          validateNativeExecution(round.input.authorExecution, journey.agents.author);
          validateNativeExecution(round.execution, journey.agents.reviewer);
          requireThat(round.input.authorExecution.forkTurns === 'none' && round.execution.forkTurns === 'none', 'los intentos heredaron contexto de otro rol.');
          if (round.phase === 'candidate' && round.report.verdict === 'approved') {
            validateCandidateCorrections(round.input, round.report, attempt.rounds.slice(0, roundIndex + 1));
            validateOriginalityReview(round.input, round.report, round.input);
          }
        }
      }
      if (attempt !== active) {
        requireThat(attempt.status === 'switching_topic' && attempt.archive?.manifest?.length && journey.discarded.some(item => item.attemptId === attempt.id), 'falta archivo o motivo del candidato descartado.');
        for (const [path, document] of Object.entries(attempt.archive.documents || {})) {
          const file = attempt.archive.manifest.find(item => item.path === path);
          requireThat(typeof document === 'string' && file && Buffer.byteLength(document) === file.bytes && digest(document) === file.sha256, 'documento archivado distinto de su manifiesto.');
        }
      }
    }
  }
  return 'reviewed';
}

function evidence(items, date) {
  requireThat(Array.isArray(items) && items.length > 0, 'falta evidencia abierta por afirmación o decisión.');
  for (const item of items) {
    url(item.url);
    requireThat(text(item.excerpt) && item.checkedOn === date, 'la evidencia necesita un extracto concreto y consulta de hoy.');
  }
}

const measures = {
  mi: ['distance', 1609.344], km: ['distance', 1000], m: ['distance', 1],
  h: ['duration', 3600], min: ['duration', 60], s: ['duration', 1],
};
export function checkConversion({ fromValue, fromUnit, toValue, toUnit, decimals }) {
  const from = measures[fromUnit], to = measures[toUnit];
  requireThat(from && to && from[0] === to[0], 'conversión de unidades no soportada; no inventar factores.');
  requireThat([fromValue, toValue].every(Number.isFinite) && Number.isInteger(decimals) && decimals >= 0 && decimals <= 6, 'conversión numérica incompleta.');
  const expected = fromValue * from[1] / to[1];
  requireThat(Math.abs(expected - toValue) <= 0.5 * 10 ** -decimals + 1e-9, `conversión incorrecta: ${fromValue} ${fromUnit} equivale a ${Number(expected.toPrecision(12))} ${toUnit}, no ${toValue}.`);
}

// Catch the audited miles/km error even if an author forgets the conversion
// field. This deliberately handles unambiguous digit-form distance claims;
// other quantities, words and mixed numeric conventions remain reviewer work.
function checkDistanceClaim(claim, checked) {
  const distances = value => {
    const normalized = value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
    const result = { mi: new Map(), km: new Map() };
    const pattern = /(?<![\d.,])(\d+(?:[.,]\d{1,2})?)(?![\d.,])[\s-]*(miles?|millas?|km|kilomet(?:er|re|ro)s?)\b/gu;
    for (const match of normalized.matchAll(pattern)) result[/^(mile|milla)/u.test(match[2]) ? 'mi' : 'km'].set(Number(match[1].replace(',', '.')), (match[1].split(/[.,]/u)[1] || '').length);
    return result;
  };
  const original = distances(checked.evidence.map(item => item.excerpt).join(' '));
  const published = distances(claim.statement);
  let needsConversion = false, declaredMatches = false;
  for (const [fromUnit, toUnit] of [['mi', 'km'], ['km', 'mi']]) {
    if (!original[fromUnit].size || !published[toUnit].size) continue;
    requireThat(original[fromUnit].size === 1 && published[toUnit].size === 1, 'separar afirmaciones/extractos con varias conversiones de distancia.');
    needsConversion = true;
    const fromValue = [...original[fromUnit].keys()][0], toValue = [...published[toUnit].keys()][0];
    checkConversion({ fromValue, fromUnit, toValue, toUnit, decimals: published[toUnit].get(toValue) });
    const conversion = claim.conversion;
    if (conversion?.fromUnit === fromUnit && conversion.toUnit === toUnit) {
      requireThat(original[fromUnit].has(conversion.fromValue) && published[toUnit].has(conversion.toValue) && conversion.decimals === published[toUnit].get(conversion.toValue), 'la conversión debe conservar los valores/unidades y precisión del texto publicado.');
      declaredMatches = true;
    }
  }
  requireThat(!needsConversion || declaredMatches, 'la conversión debe conservar los valores/unidades del extracto original y del texto publicado.');
}

const localMinute = (instant, zone) => new Intl.DateTimeFormat('sv-SE', {
  timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
}).format(new Date(instant));
export function checkTime({ instant, sourceZone, sourceLocal, art }) {
  requireThat(typeof sourceZone === 'string' && sourceZone.length > 0 && typeof sourceLocal === 'string', 'falta zona de origen y hora local comprobada.');
  requireThat(typeof instant === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d(?::\d\d)?(?:Z|[+-]\d\d:\d\d)$/.test(instant) && Number.isFinite(Date.parse(instant)), 'horario sin instante y offset explícitos.');
  requireThat(new Date(`${instant.slice(0, 10)}T00:00:00Z`).toISOString().slice(0, 10) === instant.slice(0, 10), 'fecha inexistente en el horario.');
  requireThat(localMinute(instant, sourceZone) === sourceLocal, 'offset incompatible con la fecha y zona de origen (incluye DST).');
  requireThat(`${localMinute(instant, 'America/Argentina/Buenos_Aires')} ART` === art, 'conversión a ART incorrecta.');
}

const topics = ['names', 'quantities', 'units', 'dates', 'timezones', 'places', 'quotes', 'events', 'availability', 'visualRights', 'tweet', 'allMaterialClaims'];
// Pure content/contract check for the native reviewer's local preflight. This
// returns no runtime attestation or publication proof. The publisher always
// calls validateEditorialQuality below with both actual completed executions.
export function validateEditorialReviewContent(input, report, history = []) {
  const { note, draft, contentDigest, assets } = input;
  const date = note.date;
  requireThat(report?.version === QUALITY_VERSION && report.date === date && report.slug === note.slug && report.contentDigest === contentDigest, 'revisión ausente, antigua o correspondiente a otra preparación.');
  requireThat(report.verdict === 'approved', 'el revisor exige correcciones; los tests técnicos no sustituyen su aprobación.');
  requireThat(topics.every(topic => report.coverage?.[topic] === true), 'falta revisar una categoría factual, disponibilidad, derechos o tweet.');
  const fields = editorialTextFields(note, draft.tweet);
  requireThat(Object.values(fields).every(value => typeof value === 'string'), 'texto público incompleto.');
  requireThat(Array.isArray(report.checkedPaths) && Object.keys(fields).every(path => report.checkedPaths.includes(path)), 'el revisor debe leer todo el texto público, captions y tweet.');
  const published = Object.values(fields);
  const appears = value => typeof value === 'string' && published.some(field => field.includes(value));
  const sources = draft.sourceChecks || [];
  requireThat(sources.length === note.sources.length && unique(sources, s => s.url) && sources.every(s => note.sources.some(visible => visible.url === s.url)), 'todas las fuentes de corroboración deben estar visibles en la nota, sin checks ocultos.');
  requireThat(Array.isArray(report.sources) && report.sources.length === sources.length && unique(report.sources, s => s.url), 'clasificación independiente incompleta de las fuentes.');
  const sourceMap = new Map();
  for (const source of sources) {
    const assessed = report.sources.find(item => item.url === source.url);
    requireThat(assessed && ['primary', 'independent', 'syndicated', 'unestablished'].includes(assessed.relationship) && text(assessed.basis), 'falta clasificar el origen editorial de una fuente.');
    evidence(assessed.evidence, date);
    if (assessed.relationship !== 'unestablished') url(assessed.originUrl);
    if (assessed.relationship === 'syndicated') requireThat(canonicalSource(assessed.originUrl) !== canonicalSource(assessed.url), 'una reproducción debe declarar el comunicado u origen que reproduce.');
    sourceMap.set(source.url, assessed);
  }
  requireThat([...sourceMap.values()].some(source => source.relationship === 'primary'), 'no hay fuente primaria comprobada por el revisor.');
  requireThat(Array.isArray(draft.claims) && draft.claims.length > 0 && unique(draft.claims, c => c.id), 'falta el registro de afirmaciones importantes.');
  requireThat(Array.isArray(report.claims) && report.claims.length === draft.claims.length && unique(report.claims, c => c.id), 'falta contraste independiente por afirmación.');
  for (const claim of draft.claims) {
    requireThat(typeof claim.id === 'string' && /^[a-z0-9-]+$/.test(claim.id) && text(claim.statement) && appears(claim.statement), 'la afirmación debe citar el texto público exacto.');
    evidence(claim.evidence, date);
    const checked = report.claims.find(item => item.id === claim.id);
    requireThat(checked && ['verified', 'attributed'].includes(checked.status) && text(checked.basis), `afirmación sin verificar o contradicha: ${claim.id}.`);
    evidence(checked.evidence, date);
    const corroborating = checked.evidence.map(item => sourceMap.get(item.url));
    requireThat(corroborating.every(Boolean), 'la evidencia factual debe identificar fuentes clasificadas.');
    const roots = new Set(corroborating.filter(item => item.relationship !== 'unestablished').map(item => canonicalSource(item.originUrl)));
    if (claim.corroboration === 'independent') {
      requireThat(roots.size >= 2 && corroborating.some(item => item.relationship === 'independent'), `corroboración no independiente: ${claim.id}; reproducir un comunicado no suma otra fuente.`);
    } else {
      requireThat(claim.corroboration === 'primary-only' && checked.status === 'attributed' && text(claim.limitation) && text(claim.attribution) && appears(claim.attribution), 'sin corroboración independiente se exige atribución y limitación explícitas, no una fuente inventada.');
      requireThat(corroborating.some(item => item.relationship === 'primary'), 'la atribución debe apoyarse en la fuente primaria.');
    }
    if (claim.conversion) checkConversion(claim.conversion);
    checkDistanceClaim(claim, checked);
  }
  const access = draft.access;
  requireThat(access && typeof access.applicable === 'boolean' && text(access.reason), 'falta evaluar utilidad y acceso desde Argentina.');
  if (access.applicable) {
    requireThat(Array.isArray(access.items) && access.items.length > 0 && unique(access.items, a => a.id), 'faltan instrucciones para ver películas/eventos.');
    requireThat(Array.isArray(report.access) && report.access.length === access.items.length, 'falta revisión independiente del acceso.');
    for (const item of access.items) {
      url(item.officialUrl);
      requireThat(note.sources.some(s => s.url === item.officialUrl), 'el enlace oficial directo para ver/acceder debe ser público en sources.');
      const checked = report.access.find(a => a.id === item.id);
      requireThat(checked && ['verified', 'qualified'].includes(checked.status) && text(checked.basis), 'acceso desde Argentina bloqueado o sin revisar.');
      evidence(checked.evidence, date);
      requireThat(checked.destination?.url === item.officialUrl && ['official-programme', 'official-player', 'official-ticket'].includes(checked.destination.kind), 'el revisor debe identificar el destino oficial de acceso, no una gacetilla.');
      evidence(checked.destination.evidence, date);
      requireThat(checked.destination.evidence.some(e => e.url === item.officialUrl), 'falta evidencia abierta del destino de acceso.');
      for (const name of ['argentina', 'timing', 'cost', 'territory', 'subtitles']) {
        const detail = item[name];
        requireThat(detail && ['confirmed', 'unconfirmed'].includes(detail.status) && text(detail.publishedText) && appears(detail.publishedText), `falta información pública o incertidumbre explícita: ${name}.`);
        if (detail.status === 'confirmed') evidence(detail.evidence, date);
        else requireThat(checked.status === 'qualified', 'un dato de acceso no confirmado debe declararse como tal, sin prometer disponibilidad.');
      }
      for (const time of item.timing.instants || []) { checkTime(time); requireThat(appears(time.art), 'el horario ART verificado debe figurar en la nota.'); }
      requireThat(item.timing.status !== 'confirmed' || item.timing.instants?.length > 0, 'un horario confirmado requiere instante, zona de origen y ART; no inferir medianoche de una fecha.');
    }
  } else {
    requireThat(report.access?.length === 0 && text(report.accessReason), 'la ausencia de disponibilidad aplicable necesita justificación independiente.');
    evidence(report.accessEvidence, date);
  }
  const images = new Map([note.cover, ...note.content.filter(b => b.type === 'image')].map(image => [image.src, image]));
  requireThat(Array.isArray(report.images) && report.images.length === images.size && unique(report.images, i => i.src), 'falta auditar derechos de todas las imágenes.');
  for (const image of images.values()) {
    const rights = draft.imageChecks.find(check => check.src === image.src)?.rights;
    requireThat(rights?.status === 'cleared' && ['license', 'permission', 'public-domain', 'press-terms'].includes(rights.basis), `derechos visuales no resueltos: ${image.src}.`);
    url(rights.termsUrl);
    requireThat(canonicalSource(rights.termsUrl) !== canonicalSource(image.source), 'la URL del archivo de origen no es una licencia.');
    evidence([rights.authorization || {}], date);
    requireThat(canonicalSource(rights.authorization.url) !== canonicalSource(image.source), 'falta una autorización aplicable a este recurso, no sólo su archivo.');
    requireThat(rights.checkedOn === date && typeof rights.holder === 'string' && rights.holder.trim().length >= 3 && text(rights.excerpt) && text(rights.conditions) && typeof rights.attributionRequired === 'boolean', 'faltan titular, condiciones y evidencia concreta de autorización.');
    requireThat(rights.allowedUses?.includes('web') && (image.src !== note.cover.src || rights.allowedUses.includes('social')), 'la autorización debe cubrir web y la portada también redes sociales.');
    if (rights.attributionRequired) {
      const webText = Object.entries(fields).filter(([path]) => path !== 'tweet' && !path.endsWith('/alt')).map(([, value]) => value);
      requireThat(text(rights.credit) && webText.some(value => value.includes(rights.credit)) && (image.src !== note.cover.src || draft.tweet.includes(rights.credit)), 'falta atribución visible obligatoria en web o tweet.');
    }
    for (const link of rights.requiredLinks || []) {
      url(link);
      requireThat(note.sources.some(s => s.url === link) && (image.src !== note.cover.src || draft.tweet.includes(link)), 'falta enlace obligatorio de licencia/atribución.');
    }
    const checked = report.images.find(item => item.src === image.src);
    requireThat(checked?.status === 'cleared' && text(checked.basis), 'el revisor no aprobó los derechos de un recurso visual.');
    evidence(checked.evidence, date);
    requireThat(checked.evidence.some(item => canonicalSource(item.url) === canonicalSource(rights.termsUrl)), 'el revisor debe abrir las condiciones de uso, no sólo la imagen.');
    requireThat(checked.evidence.some(item => canonicalSource(item.url) === canonicalSource(rights.authorization.url)), 'falta comprobar la asociación entre este recurso y la autorización.');
  }
  requireThat(Array.isArray(report.findings) && unique(report.findings, f => f.id), 'falta registro de hallazgos/correcciones.');
  const boundHistory = history.filter(entry => {
    requireThat(entry.input && entry.input.contentDigest === reviewInput(entry.input.note, entry.input.draft, entry.input.assets, entry.input.authorExecution).contentDigest, 'snapshot histórico alterado o ausente.');
    requireThat(entry.input.note.slug === note.slug && entry.input.note.date === date, 'historial de otra publicación.');
    return entry.report?.contentDigest === entry.input.contentDigest;
  });
  for (const finding of report.findings) {
    requireThat(['material', 'minor'].includes(finding.severity) && ['open', 'resolved'].includes(finding.status) && text(finding.description), 'hallazgo sin clasificación o explicación.');
    requireThat(finding.severity !== 'material' || finding.status === 'resolved', 'contradicción material abierta: push bloqueado aunque Astro/Playwright pasen.');
    if (finding.kind === 'social') {
      findingTarget(input, finding);
      requireThat(finding.status === 'resolved', 'presentación social pendiente: corregir el tweet antes de aprobar.');
    }
    if (finding.status === 'resolved') {
      requireThat(typeof finding.targetId === 'string' && text(finding.resolution) && !isDeepStrictEqual(finding.before, finding.after), 'la corrección debe documentar antes, después y fundamento.');
      evidence(finding.evidence, date);
      const original = boundHistory.find(entry => entry.report.findings?.some(old => old.id === finding.id && old.status === 'open' && old.kind === finding.kind && old.targetId === finding.targetId && findingField(old) === findingField(finding)));
      requireThat(original, 'falta el hallazgo original vinculado al mismo objeto; no se sustituye una distancia por un título ajeno.');
      const before = findingTarget(original.input, finding), after = findingTarget(input, finding);
      requireThat(before.exists && isDeepStrictEqual(finding.before, before.value) && isDeepStrictEqual(finding.after, after.value), 'antes/después no corresponden al mismo claim, acceso o imagen de sus snapshots.');
      if (finding.kind === 'claim' && findingField(finding) === 'statement') requireThat(!appears(before.value), 'la afirmación objetada sigue publicada, aunque se haya reasignado su ID.');
      if (finding.kind === 'claim' && findingField(finding) !== 'statement') requireThat(after.exists, 'una corrección de metadata no retira el claim ni oculta su afirmación pública.');
      if (finding.kind === 'text') {
        requireThat(text(finding.objectedText) && before.value.includes(finding.objectedText) && !appears(finding.objectedText), 'el fragmento factual objetado sigue publicado o no estaba en el texto original.');
        const registered = draft.claims.find(claim => claim.id === finding.claimId);
        requireThat(!after.exists || (registered && typeof after.value === 'string' && after.value.includes(registered.statement)), 'el hecho corregido debe incorporarse al ledger y al campo público corregido.');
      }
      if (!after.exists) {
        if (finding.kind === 'claim') requireThat(!appears(before.value), 'el claim retirado sigue publicado.');
        if (finding.kind === 'image') requireThat(!Object.keys(assets).includes(finding.targetId), 'la imagen retirada sigue publicada.');
        if (finding.kind === 'access') {
          for (const name of ['argentina', 'timing', 'cost', 'territory', 'subtitles']) requireThat(!appears(before.value[name]?.publishedText), 'el dato de acceso retirado sigue en el cuerpo o tweet.');
        }
      }
    }
  }
  const previousRequired = boundHistory.flatMap(entry => entry.report?.findings || []).filter(f => f.severity === 'material' || f.kind === 'social');
  for (const finding of previousRequired) requireThat(report.findings.some(f => f.id === finding.id && f.kind === finding.kind && f.targetId === finding.targetId && findingField(f) === findingField(finding) && f.severity === finding.severity && f.status === 'resolved'), 'no se pueden borrar hallazgos materiales o de presentación social ni cambiarlos de objeto en una revisión anterior.');
  if (draft.candidate) {
    requireThat(isDeepStrictEqual(draft.candidate, draft.originalityContext?.candidate), 'candidato distinto del preflight congelado.');
    validateOriginalityReview(input, report, draft.originalityContext);
  }
  const evidenceUrls = new Set();
  const walk = object => {
    if (!object || typeof object !== 'object') return;
    for (const [key, value] of Object.entries(object)) {
      if (['url', 'sourceUrl', 'termsUrl', 'officialUrl', 'originUrl'].includes(key) && typeof value === 'string') evidenceUrls.add(url(value));
      else if (typeof value === 'object') walk(value);
    }
  };
  walk({ claims: draft.claims, access, imageChecks: draft.imageChecks, report });
  if (draft.social?.version === 1) validateDailySocial(note, draft, report);
  return { evidenceUrls: [...evidenceUrls] };
}

export function validateEditorialQuality(input, report, reviewerExecution, history = []) {
  const { draft, authorExecution, contentDigest, assets } = input;
  requireThat(/^gpt-\d+(?:\.\d+)*-luna$/.test(authorExecution.model), 'el ejecutor debe pertenecer a la familia Luna anunciada.');
  validateNativeExecution(authorExecution, { model: authorExecution.model, effort: 'max' });
  requireThat(authorExecution.forkTurns === 'none', 'el autor debe iniciar sin historial heredado.');
  validateNativeExecution(reviewerExecution, { model: authorExecution.model, effort: 'max' });
  requireThat(reviewerExecution.agentId !== authorExecution.agentId, 'autor y revisor deben ser agentes nativos diferentes, sin contexto heredado.');
  requireThat(reviewerExecution.forkTurns === 'none', 'el revisor debe iniciar sin el historial del autor.');
  const content = validateEditorialReviewContent(input, report, history);
  const reviewProof = digest(JSON.stringify({ contentDigest, report, reviewerExecution, history }));
  const prior = history.filter(entry => !(isDeepStrictEqual(entry.report, report) && isDeepStrictEqual(entry.execution, reviewerExecution)));
  return { contentDigest, reviewProof, evidenceUrls: content.evidenceUrls, record: { version: QUALITY_VERSION, contentDigest, assets, authorExecution, draft, claims: draft.claims, access: draft.access, report, reviewerExecution, history: prior } };
}
