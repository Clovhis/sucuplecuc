import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';

const INDEX_VERSION = 1;
const REVIEW_VERSION = 1;
const text = value => typeof value === 'string' ? value : '';
const strings = value => (Array.isArray(value) ? value : value == null ? [] : [value])
  .filter(item => typeof item === 'string' && item.trim());

export const normalizeEditorialText = value => text(value)
  .normalize('NFD')
  .replace(/(\p{Script=Latin})\p{M}+/gu, '$1')
  .toLowerCase()
  .normalize('NFC')
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .trim();

const normalizeKey = value => normalizeEditorialText(value).replace(/\s+/g, '-');
const hash = value => createHash('sha256').update(value).digest('hex');
const sortObject = value => {
  if (Array.isArray(value)) return value.map(sortObject);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map(key => [key, sortObject(value[key])]));
};
const stableStringify = value => JSON.stringify(sortObject(value));

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function readJsonDirectory(directory, root) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory)
    .filter(name => name.endsWith('.json'))
    .sort()
    .map(name => {
      const path = join(directory, name);
      const bytes = readFileSync(path);
      return { path: path.slice(root.length + 1).split(sep).join('/'), data: JSON.parse(bytes.toString('utf8')), rawHash: hash(bytes) };
    });
}

function unwrapInput(item, fallbackPath) {
  if (item && typeof item === 'object' && !Array.isArray(item) && Object.hasOwn(item, 'data')) {
    return { data: item.data, path: text(item.path || item.sourcePath || fallbackPath), rawHash: text(item.rawHash || item.sha256 || item.contentHash) };
  }
  return { data: item, path: text(item?.sourcePath || item?.path || fallbackPath), rawHash: text(item?.rawHash || item?.sha256 || item?.contentHash) };
}

function sourcePathFor(kind, item, index) {
  const wrapped = unwrapInput(item, '');
  if (wrapped.path) return wrapped.path;
  const data = wrapped.data || {};
  if (kind === 'note') return `src/data/editorials/${text(data.slug) || `legacy-${index + 1}`}.json`;
  if (kind === 'receipt') return `reports/daily-editorial/${text(data.date) || `legacy-${index + 1}`}.json`;
  return `${kind}/${index + 1}`;
}

function embeddedCandidates(source) {
  if (!source || typeof source !== 'object') return [];
  const candidates = [];
  const add = value => { if (value && typeof value === 'object' && !Array.isArray(value)) candidates.push(value); };
  add(source.candidate);
  add(source.draft?.candidate);
  add(source.editorialReview?.candidate);
  add(source.editorialReview?.draft?.candidate);
  const journey = source.editorialJourney || source.journey;
  if (!candidates.length) {
    const attempts = Array.isArray(journey?.attempts) ? journey.attempts : [];
    const current = [...attempts].reverse().find(attempt => {
      const status = normalizeEditorialText(attempt?.status || attempt?.decision || attempt?.state);
      return !/\b(discarded|rejected|abandoned|switch|switched|archived|superseded)\b/u.test(status);
    });
    add(current?.candidate);
    add(current?.draft?.candidate);
  }
  return candidates;
}

function recordText(note, receipt) {
  const parts = [];
  const add = value => { if (typeof value === 'string' && value.trim()) parts.push(value); };
  for (const source of [note, receipt]) {
    if (!source || typeof source !== 'object') continue;
    for (const field of ['title', 'headline', 'excerpt', 'summary', 'decision', 'topicKey', 'topic_key', 'eventKey', 'event_key']) add(source[field]);
    for (const tag of strings(source.tags)) add(tag);
    for (const item of Array.isArray(source.sourceChecks) ? source.sourceChecks : []) add(item.facts);
    for (const candidate of embeddedCandidates(source)) {
      add(candidate.topicKey); add(candidate.title); add(candidate.summary); add(candidate.novelty);
      add(candidate.event?.key); add(candidate.event?.description);
      for (const entity of Array.isArray(candidate.entities) ? candidate.entities : []) {
        if (typeof entity === 'string') add(entity);
        else { add(entity?.id); for (const alias of strings(entity?.aliases)) add(alias); }
      }
    }
  }
  return parts.join('\n');
}

function detectGuide(note, receipt, title, slug) {
  const dailyReceipt = Boolean(receipt?.execution || receipt?.editorialReview?.draft?.candidate || receipt?.editorialJourney || receipt?.journey);
  if (dailyReceipt) return false;
  const explicit = note?.isGuide === true || note?.kind === 'guide' || receipt?.isGuide === true || receipt?.kind === 'guide';
  if (explicit) return true;
  const normalizedSlug = normalizeKey(slug);
  const normalizedTitle = normalizeEditorialText(title);
  if (/^estrenos-(cines|streaming)-[a-z0-9-]+$/u.test(normalizedSlug)) return true;
  return /^(estrenos de la semana|estrenos de cine de la semana|streaming de la semana|que llego al streaming esta semana|estrenos de streaming de la semana|cartelera de la semana|guia semanal|guia de estrenos)\b/u.test(normalizedTitle);
}

function unique(values) { return [...new Set(values.filter(Boolean))]; }

function topicKeyValues(source) {
  if (!source || typeof source !== 'object') return [];
  const values = [];
  for (const field of ['topicKey', 'topic_key', 'topic', 'canonicalTopicKey', 'canonicalEventKey', 'eventKey', 'event_key', 'key']) {
    values.push(...strings(source[field]));
  }
  for (const field of ['topicKeys', 'canonicalTopicKeys', 'topicKeyAliases', 'topicAliases', 'eventKeyAliases', 'eventAliases', 'legacyKeys', 'keys']) {
    values.push(...strings(source[field]));
  }
  if (source.event && typeof source.event === 'object') {
    values.push(...strings(source.event.key), ...strings(source.event.aliases), ...strings(source.event.legacyKeys));
  }
  for (const candidate of embeddedCandidates(source)) values.push(...topicKeyValues(candidate));
  return unique(values.map(value => value.trim()).filter(Boolean));
}

function sourceUrls(note, receipt) {
  const urls = [];
  for (const source of [...(Array.isArray(note?.sources) ? note.sources : []), ...(Array.isArray(receipt?.sourceChecks) ? receipt.sourceChecks : [])]) {
    if (typeof source === 'string') urls.push(source);
    else if (source && typeof source.url === 'string') urls.push(source.url);
  }
  for (const candidate of [note, receipt].filter(Boolean).flatMap(embeddedCandidates)) {
    for (const evidence of Array.isArray(candidate.evidence) ? candidate.evidence : []) {
      if (typeof evidence?.url === 'string') urls.push(evidence.url);
    }
  }
  return unique(urls);
}

function structuredEntityIds(note, receipt) {
  const result = [];
  for (const source of [note, receipt]) {
    if (!source || typeof source !== 'object') continue;
    for (const candidate of [source, ...embeddedCandidates(source)]) {
      result.push(...strings(candidate.movieSlug), ...strings(candidate.movieSlugs), ...strings(candidate.entityId), ...strings(candidate.entityIds));
      for (const field of ['entities', 'eventEntities']) {
        for (const item of Array.isArray(candidate[field]) ? candidate[field] : []) {
          if (typeof item === 'string') result.push(item);
          else if (item && typeof item === 'object') result.push(...strings(item.id), ...strings(item.slug), ...strings(item.canonicalId));
        }
      }
    }
  }
  return unique(result.map(normalizeKey));
}

function eventMetadata(note, receipt) {
  const events = [];
  for (const source of [note, receipt].filter(Boolean)) {
    if (source?.event && typeof source.event === 'object') events.push(source.event);
    for (const candidate of embeddedCandidates(source)) if (candidate.event && typeof candidate.event === 'object') events.push(candidate.event);
  }
  return [...new Map(events.map(event => {
    const entityValues = [
      ...strings(event.entities),
      ...(Array.isArray(event.entities) ? event.entities.flatMap(item => typeof item === 'object' ? [...strings(item.id), ...strings(item.canonicalId), ...strings(item.slug)] : []) : []),
    ];
    const metadata = {
      key: text(event.key),
      type: normalizeKey(event.type),
      date: text(event.originalDate || event.date || event.eventDate).slice(0, 10),
      entityIds: unique(entityValues.map(normalizeKey)),
      description: text(event.description || event.summary),
    };
    return [stableStringify(metadata), metadata];
  })).values()];
}

function makeRecord(group, index) {
  const note = group.note?.data ?? null;
  const receipt = group.receipt?.data ?? null;
  const nestedCandidates = [...embeddedCandidates(note), ...embeddedCandidates(receipt)];
  const slug = text(note?.slug || receipt?.slug || receipt?.editorialSlug || note?.id || receipt?.id);
  const date = text(note?.date || receipt?.date || receipt?.publishedAt || receipt?.createdAt).slice(0, 10);
  const title = text(note?.title || receipt?.title || receipt?.headline || receipt?.editorial?.title || nestedCandidates[0]?.title);
  const excerpt = text(note?.excerpt || note?.summary || receipt?.excerpt || receipt?.summary || receipt?.decision || nestedCandidates[0]?.summary || nestedCandidates[0]?.novelty);
  const tags = unique([...strings(note?.tags), ...strings(receipt?.tags)]);
  const type = text(note?.type || receipt?.type || receipt?.editorialType);
  const topicKeys = unique([...topicKeyValues(note), ...topicKeyValues(receipt)]);
  const sourcePaths = unique([group.note?.path, group.receipt?.path].filter(Boolean)).sort();
  const sourceContentHashes = [group.note, group.receipt].filter(Boolean).map(source => ({ path: source.path, sha256: source.contentHash })).sort((a, b) => a.path.localeCompare(b.path));
  const idBase = slug ? `${slug}@${date || 'undated'}` : `${normalizeKey(title) || 'history-record'}@${date || index + 1}`;
  return {
    id: idBase,
    slug,
    date,
    title,
    summary: excerpt,
    type,
    category: text(note?.category || receipt?.category),
    tags,
    topicKeys,
    canonicalTopicKeys: topicKeys.map(normalizeKey),
    structuredEntityIds: structuredEntityIds(note, receipt),
    centeredEntityIds: unique([
      ...strings(note?.movieSlug), ...strings(note?.centeredEntityIds), ...strings(receipt?.centeredEntityIds),
      ...nestedCandidates.flatMap(candidate => (candidate.event?.entities || []).flatMap(entity => typeof entity === 'string' ? [entity] : strings(entity?.id))),
    ].map(normalizeKey)),
    eventMetadata: eventMetadata(note, receipt),
    sources: sourceUrls(note, receipt),
    sourcePaths,
    sourcePath: sourcePaths[0] || '',
    sourceContentHashes,
    isGuide: detectGuide(note, receipt, title, slug),
    searchText: recordText(note, receipt),
  };
}

function recordGroupKey(value, kind, index) {
  const data = value?.data && typeof value.data === 'object' ? value.data : value;
  const slug = text(data?.slug || data?.editorialSlug || data?.id);
  const date = text(data?.date || data?.publishedAt || data?.createdAt).slice(0, 10);
  if (slug) return `${slug}\u0000${date}`;
  const title = text(data?.title || data?.headline);
  if (title) return `${normalizeKey(title)}\u0000${date}`;
  return `${kind}\u0000${index}`;
}

function normalizeDiscarded(item, index) {
  const value = typeof item === 'string' ? { topicKey: item, reason: 'Legacy discarded key' } : (item || {});
  const nested = embeddedCandidates(value);
  const keyValues = unique([...topicKeyValues(value), ...nested.flatMap(topicKeyValues)]);
  const candidate = nested[0] || {};
  const candidateId = normalizeKey(value.candidateId || candidate.id || '');
  const title = text(value.title || candidate.title || value.topic || value.event || value.key || value.topicKey || value.id);
  const evidence = [...(Array.isArray(value.evidence) ? value.evidence : []), ...(Array.isArray(candidate.evidence) ? candidate.evidence : [])]
    .map(item => ({ url: text(item?.url), checkedOn: text(item?.checkedOn || item?.date), excerpt: text(item?.excerpt || item?.claim || item?.facts || item?.statement).slice(0, 500) }))
    .filter(item => item.url || item.excerpt);
  return {
    id: text(value.attemptId || value.id || value.slug || candidate.id || value.topicKey || value.key) || `discarded-${index + 1}`,
    candidateId,
    date: text(value.date || value.discardedAt).slice(0, 10),
    title,
    reason: text(value.reason || value.decision || value.status),
    topicKeys: unique(keyValues),
    canonicalTopicKeys: unique(keyValues.map(normalizeKey)),
    entityIds: unique([...structuredEntityIds(value, value), ...strings(value.entityIds), ...strings(value.entities)].map(normalizeKey)),
    eventMetadata: eventMetadata(value, null),
    evidence,
    sourcePaths: unique([text(value.sourcePath || value.path)].filter(Boolean)),
  };
}

function collectEmbeddedDiscards(receipts) {
  const result = [];
  const add = (value, path) => {
    if (value && typeof value === 'object') result.push({ ...value, sourcePath: value.sourcePath || path });
    else if (typeof value === 'string') result.push({ topicKey: value, sourcePath: path, reason: 'Recorded discarded topic' });
  };
  for (const item of receipts) {
    const wrapped = unwrapInput(item, '');
    const receipt = wrapped.data || {};
    const journey = receipt.editorialJourney || receipt.journey || {};
    for (const field of ['discarded', 'discards', 'discardedCandidates']) {
      for (const value of Array.isArray(journey[field]) ? journey[field] : []) add(value, wrapped.path);
    }
    for (const attempt of Array.isArray(journey.attempts) ? journey.attempts : []) {
      const status = normalizeEditorialText(attempt?.status || attempt?.decision || attempt?.state);
      if (/\b(discarded|rejected|abandoned|switch|switched|archived|superseded)\b/u.test(status)) {
        add({ ...attempt, candidate: attempt.candidate || attempt.draft?.candidate, sourcePath: wrapped.path }, wrapped.path);
      }
      for (const field of ['discarded', 'discards']) {
        for (const value of Array.isArray(attempt?.[field]) ? attempt[field] : []) add(value, wrapped.path);
      }
    }
  }
  return result;
}

function historyPayload(history) {
  return {
    version: history.version,
    records: history.records,
    discarded: history.discarded,
    sourceFiles: history.sourceFiles || [],
    aliases: history.aliases || [],
  };
}

export function calculateHistoryDigest(history) {
  return hash(stableStringify(historyPayload(history)));
}

export function buildHistoryIndex({ notes = [], receipts = [], discarded = [], extraRecords = [], sourceFiles = [], aliases, policy } = {}) {
  if (policy) assertPolicy(policy);
  const aliasDefinitions = aliases ?? policy?.entities ?? [];
  if (policy && stableStringify(aliasDefinitions) !== stableStringify(policy.entities)) throw new Error('El índice y la política deben usar el mismo mapa de aliases canónicos.');
  const groups = new Map();
  const add = (items, kind) => {
    items.forEach((item, index) => {
      const wrapped = unwrapInput(item, sourcePathFor(kind, item, index));
      if (!wrapped.data || typeof wrapped.data !== 'object' || Array.isArray(wrapped.data)) return;
      const key = recordGroupKey({ data: wrapped.data }, kind, index);
      let group = groups.get(key);
      if (!group) { group = {}; groups.set(key, group); }
      const entry = { data: wrapped.data, path: wrapped.path, contentHash: wrapped.rawHash || hash(stableStringify(wrapped.data)) };
      if (kind === 'note') group.note = entry;
      else group.receipt = entry;
    });
  };
  add(notes, 'note');
  add(receipts, 'receipt');
  add(extraRecords.filter(item => item?.type !== 'discarded' && item?.kind !== 'discarded'), 'note');
  const records = [...groups.values()].map(makeRecord).sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  const allDiscarded = [
    ...discarded,
    ...collectEmbeddedDiscards(receipts),
    ...extraRecords.filter(item => item?.type === 'discarded' || item?.kind === 'discarded').map(item => item.data || item),
  ].map(normalizeDiscarded);
  const discardKey = item => `${item.id}|${item.candidateId}|${item.canonicalTopicKeys.slice().sort().join('|') || `legacy:${item.date}:${normalizeKey(item.title)}`}`;
  const normalizedDiscarded = [...new Map(allDiscarded.map(item => [discardKey(item), item])).values()].sort((a, b) => a.id.localeCompare(b.id));
  const index = { version: INDEX_VERSION, records, discarded: normalizedDiscarded, sourceFiles: unique(sourceFiles).sort(), aliases: aliasDefinitions };
  index.recordCount = records.length;
  index.discardedCount = normalizedDiscarded.length;
  index.digest = calculateHistoryDigest(index);
  return index;
}

export function loadEditorialDiversityPolicy(root) {
  const path = resolve(root, 'config/daily-editorial-diversity.json');
  if (!existsSync(path)) throw new Error(`Falta la política obligatoria de diversidad editorial: ${path}`);
  const policy = readJson(path);
  assertPolicy(policy);
  return policy;
}

function extraInputRecords(root, entries) {
  const records = [];
  const discarded = [];
  const sourceFiles = [];
  for (const item of entries) {
    if (Array.isArray(item)) { records.push(...item); continue; }
    if (item && typeof item === 'object' && !('path' in item) && !('file' in item)) {
      if (Array.isArray(item.records)) records.push(...item.records);
      if (Array.isArray(item.discarded)) discarded.push(...item.discarded);
      if (!item.records && !item.discarded) records.push(item);
      continue;
    }
    const relative = typeof item === 'string' ? item : text(item?.path || item?.file);
    if (!relative) continue;
    const path = resolve(root, relative);
    if (!existsSync(path)) continue;
    const parsed = readJson(path);
    sourceFiles.push(relative.split(sep).join('/'));
    if (Array.isArray(parsed)) records.push(...parsed);
    else if (parsed && typeof parsed === 'object') {
      records.push(...(Array.isArray(parsed.records) ? parsed.records : []));
      discarded.push(...(Array.isArray(parsed.discarded) ? parsed.discarded : []));
      discarded.push(...(Array.isArray(parsed.discards) ? parsed.discards : []));
      if (!parsed.records && !parsed.discarded && !parsed.discards) {
        if (parsed.type === 'discarded' || parsed.kind === 'discarded') discarded.push(parsed);
        else records.push(parsed);
      }
    }
  }
  return { records, discarded, sourceFiles };
}

export function buildEditorialHistory(root, options = {}) {
  if (root && typeof root === 'object' && !Array.isArray(root)) return buildHistoryIndex(root);
  const repository = resolve(root);
  const policy = options.policy || loadEditorialDiversityPolicy(repository);
  assertPolicy(policy);
  const suppliedNotes = Array.isArray(options.notes);
  const suppliedReceipts = Array.isArray(options.receipts);
  const notes = suppliedNotes ? options.notes : readJsonDirectory(join(repository, 'src/data/editorials'), repository);
  const receipts = suppliedReceipts ? options.receipts : readJsonDirectory(join(repository, 'reports/daily-editorial'), repository);
  const extras = options.extraInputs || options.inputExtra || policy.extraHistoryInputs || [];
  const extra = extraInputRecords(repository, extras);
  return buildHistoryIndex({
    notes,
    receipts,
    discarded: [...(options.discarded || []), ...extra.discarded],
    extraRecords: extra.records,
    sourceFiles: [...notes.map(item => unwrapInput(item, '').path), ...receipts.map(item => unwrapInput(item, '').path), ...extra.sourceFiles].filter(Boolean),
    aliases: policy.entities,
  });
}

function assertPolicy(policy) {
  if (!policy || typeof policy !== 'object' || policy.version !== 1) throw new Error('Se requiere una política de diversidad editorial versionada (version: 1).');
  const windows = policy.windows || {};
  const limits = policy.limits || {};
  for (const [name, value] of Object.entries({
    filmFranchiseCooldownDays: windows.filmFranchiseCooldownDays,
    concentrationDays: windows.concentrationDays,
    maxEntityPublicationsInConcentrationWindow: limits.maxEntityPublicationsInConcentrationWindow,
  })) {
    if (!Number.isInteger(value) || value < 1) throw new Error(`La política de diversidad debe definir ${name} como entero positivo.`);
  }
  if (!Array.isArray(policy.entities) || policy.entities.some(entity => !entity || !text(entity.id) || !text(entity.kind) || !Array.isArray(entity.aliases) || !entity.aliases.length)) throw new Error('La política de diversidad debe definir aliases canónicos en entities.');
  if (!Array.isArray(policy.topicKeyAliases) || !Array.isArray(policy.extraHistoryInputs)) throw new Error('La política debe declarar topicKeyAliases y extraHistoryInputs, aunque alguna lista esté vacía.');
  return policy;
}

function canonicalTopicKey(value, policy) {
  const normalized = normalizeKey(value);
  if (!normalized) return '';
  for (const entry of policy.topicKeyAliases || []) {
    const canonical = normalizeKey(entry.id || entry.canonical || '');
    if (!canonical) continue;
    if ([canonical, ...strings(entry.aliases).map(normalizeKey)].includes(normalized)) return canonical;
  }
  return normalized;
}

function policyEntities(policy) { return policy.entities || []; }

function candidateEntities(candidate, policy) {
  const input = Array.isArray(candidate.entities) ? candidate.entities : [];
  return input.map((raw, index) => {
    const entity = typeof raw === 'string' ? { id: raw, kind: 'entity', aliases: [raw] } : (raw || {});
    const initialAliases = unique([...strings(entity.aliases), ...strings(entity.title), ...strings(entity.originalTitle), ...strings(entity.name), ...strings(entity.id)].map(value => value.trim()).filter(Boolean));
    const initialIds = new Set([normalizeKey(entity.id), ...initialAliases.map(normalizeKey)].filter(Boolean));
    const matchedConfigs = policyEntities(policy).filter(config => {
      const canonical = normalizeKey(config.id || config.canonicalId || '');
      const aliases = strings(config.aliases).map(normalizeKey);
      return (canonical && initialIds.has(canonical)) || aliases.some(alias => initialIds.has(alias));
    });
    const aliases = [...initialAliases];
    const groupIds = [];
    const canonicalIds = [normalizeKey(entity.id)];
    for (const config of matchedConfigs) {
      aliases.push(...strings(config.aliases));
      canonicalIds.push(normalizeKey(config.id || config.canonicalId));
      if (config.franchise) groupIds.push(`franchise:${normalizeKey(config.franchise)}`);
      else if (config.kind === 'franchise') groupIds.push(`franchise:${normalizeKey(config.id || config.canonicalId)}`);
    }
    const familyNames = unique(matchedConfigs.map(config => text(config.franchise)).filter(Boolean));
    for (const family of familyNames) {
      const familyConfig = policyEntities(policy).find(item => normalizeKey(item.id || item.canonicalId) === normalizeKey(family));
      if (familyConfig) aliases.push(...strings(familyConfig.aliases));
      groupIds.push(`franchise:${normalizeKey(family)}`);
    }
    const groups = unique(groupIds.length ? groupIds : [`entity:${normalizeKey(entity.id || initialAliases[0] || `candidate-${index + 1}`)}`]);
    const kindNames = [text(entity.kind), ...matchedConfigs.map(config => text(config.kind))].map(normalizeEditorialText);
    const eventSubjects = new Set((Array.isArray(candidate.event?.entities) ? candidate.event.entities : []).flatMap(subject => typeof subject === 'string' ? [subject] : strings(subject?.id)).map(id => canonicalEntityId(id, policy)));
    const central = canonicalIds.some(id => eventSubjects.has(canonicalEntityId(id, policy)));
    const diversityEligible = central && kindNames.some(kind => ['film', 'movie', 'franchise'].includes(kind));
    return {
      id: text(entity.id) || `candidate-entity-${index + 1}`,
      kind: text(entity.kind) || 'entity',
      aliases: unique(aliases.map(value => value.trim()).filter(Boolean)),
      normalizedAliases: unique(aliases.map(normalizeEditorialText).filter(Boolean)),
      canonicalIds: unique(canonicalIds.filter(Boolean)),
      groups,
      diversityGroups: diversityEligible ? groups : [],
    };
  });
}

function candidateEventKeys(candidate, policy) {
  return unique([
    ...strings(candidate.topicKey), ...strings(candidate.event?.key),
    ...strings(candidate.event?.aliases), ...strings(candidate.event?.legacyKeys),
  ].map(value => canonicalTopicKey(value, policy)).filter(Boolean));
}

function canonicalEntityId(value, policy) {
  const normalized = normalizeKey(value);
  if (!normalized) return '';
  const config = policy.entities.find(entity => {
    const id = normalizeKey(entity.id || entity.canonicalId || '');
    return id === normalized || strings(entity.aliases).some(alias => normalizeKey(alias) === normalized);
  });
  return normalizeKey(config?.id || config?.canonicalId || normalized);
}

function structuredEventOverlaps(candidate, record, entities, policy) {
  const event = candidate.event || {};
  const candidateType = normalizeKey(event.type);
  const candidateDate = text(event.originalDate || event.date || event.eventDate).slice(0, 10);
  if (!candidateType || !validDate(candidateDate)) return [];
  const candidateEntityIds = new Set([
    ...entities.flatMap(entity => entity.canonicalIds),
    ...strings(event.entities),
    ...(Array.isArray(event.entities) ? event.entities.flatMap(entity => typeof entity === 'object' ? [...strings(entity.id), ...strings(entity.canonicalId), ...strings(entity.slug)] : []) : []),
  ].map(value => canonicalEntityId(value, policy)).filter(Boolean));
  if (!candidateEntityIds.size) return [];
  return (record.eventMetadata || []).filter(previous => {
    if (previous.type !== candidateType || previous.date !== candidateDate) return false;
    return previous.entityIds.some(id => candidateEntityIds.has(canonicalEntityId(id, policy)));
  });
}

function validateReconsideration(candidate, discardedRecord, candidateDate) {
  const reconsideration = candidate.reconsideration;
  if (!reconsideration || text(reconsideration.discardedId) !== discardedRecord.id) return null;
  if (text(reconsideration.reason).trim().length < 20) throw new Error('La reconsideración de un descarte necesita un motivo concreto de al menos 20 caracteres.');
  const newEvidence = Array.isArray(reconsideration.newEvidence) ? reconsideration.newEvidence : [];
  if (!newEvidence.length) throw new Error('Un descarte sólo se puede reconsiderar con evidencia nueva.');
  const checkedEvidence = newEvidence.map(item => {
    const url = text(item?.url);
    let parsed;
    try { parsed = new URL(url); } catch { /* validated below */ }
    const excerpt = text(item?.excerpt || item?.claim || item?.facts || item?.statement);
    const checkedOn = text(item?.checkedOn || item?.date);
    const candidateReference = (candidate.evidence || []).find(reference => {
      const referenceText = text(reference?.excerpt || reference?.claim || reference?.facts || reference?.statement);
      return text(reference?.url) === url && normalizeEditorialText(referenceText).includes(normalizeEditorialText(excerpt));
    });
    if (!parsed || parsed.protocol !== 'https:' || parsed.username || parsed.password || checkedOn !== candidateDate || excerpt.trim().length < 8 || !candidateReference) {
      throw new Error('La evidencia nueva debe ser HTTPS, citar un extracto, estar comprobada en la fecha actual y figurar entre las referencias del candidato.');
    }
    const priorExists = discardedRecord.evidence.some(old => old.url === url && normalizeEditorialText(old.excerpt) === normalizeEditorialText(excerpt));
    if (priorExists) throw new Error('La reconsideración repite la misma URL y el mismo extracto ya guardados en el descarte.');
    return { url, checkedOn, excerpt };
  });
  return { discardedId: discardedRecord.id, reason: reconsideration.reason, newEvidence: checkedEvidence };
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(text(value))) return false;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value;
}

function dayDifference(from, to) {
  if (!validDate(from) || !validDate(to)) return null;
  return Math.floor((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000);
}

function phraseOccurs(phrase, haystack) {
  const normalizedPhrase = normalizeEditorialText(phrase);
  if (!normalizedPhrase || normalizedPhrase.split(' ').length < 3 || normalizedPhrase.length < 12) return false;
  const normalizedHaystack = normalizeEditorialText(haystack);
  if (!normalizedHaystack) return false;
  return ` ${normalizedHaystack} `.includes(` ${normalizedPhrase} `);
}

function recordCandidateEntityMatches(record, entities) {
  const searchable = normalizeEditorialText(record.searchText);
  const recordIds = new Set(record.structuredEntityIds || []);
  const focusText = ` ${normalizeEditorialText(`${record.title}\n${record.summary}`)} `;
  const focusedIds = new Set(record.centeredEntityIds || []);
  const result = [];
  for (const entity of entities) {
    const matchedAlias = entity.aliases.find(alias => {
      const normalized = normalizeEditorialText(alias);
      return normalized && ` ${searchable} `.includes(` ${normalized} `);
    });
    const matchedId = entity.canonicalIds.find(id => recordIds.has(id));
    const matchedGroup = entity.groups.find(group => {
      const id = group.slice(group.indexOf(':') + 1);
      return recordIds.has(id) || recordIds.has(`franchise:${id}`);
    });
    if (matchedAlias || matchedId || matchedGroup) {
      // A comparison or a source's box-office aside is not another article
      // centered on that film. Keep semantic review, without a false cooldown.
      const centered = entity.aliases.some(alias => focusText.includes(` ${normalizeEditorialText(alias)} `)) || entity.canonicalIds.some(id => focusedIds.has(id)) || entity.groups.some(group => focusedIds.has(group.slice(group.indexOf(':') + 1)));
      result.push({ entityId: entity.id, matchedAlias: matchedAlias || null, matchedId: matchedId || null, groupIds: entity.groups, diversityGroupIds: centered ? entity.diversityGroups : [] });
    }
  }
  return result;
}

function assertCandidateShape(candidate, candidateDate, policy, entities) {
  if (!text(candidate.id) || !text(candidate.topicKey) || !text(candidate.title) || !text(candidate.summary)) {
    throw new Error('El candidato requiere id, topicKey, title y summary.');
  }
  if (!candidate.event || !text(candidate.event.key) || !text(candidate.event.type) || !text(candidate.event.description) || !validDate(text(candidate.event.originalDate || candidate.event.date || candidate.event.eventDate))) {
    throw new Error('El candidato requiere event.key, type, date original válida y description.');
  }
  if (canonicalTopicKey(candidate.topicKey, policy) !== canonicalTopicKey(candidate.event.key, policy)) throw new Error('topicKey y event.key deben representar el mismo acontecimiento canónico.');
  if (!Array.isArray(candidate.event.entities) || !candidate.event.entities.length) throw new Error('El evento requiere al menos una entity canónica estructurada.');
  if (!Array.isArray(candidate.entities) || !candidate.entities.length || candidate.entities.some(entity => !entity || !text(entity.id) || !text(entity.kind) || !strings(entity.aliases).length)) {
    throw new Error('Cada entity del candidato requiere id, kind y aliases.');
  }
  if (!text(candidate.category) || !text(candidate.novelty)) throw new Error('El candidato requiere category y novelty explícitas.');
  if (!Array.isArray(candidate.evidence) || !candidate.evidence.length) throw new Error('El candidato requiere referencias de evidencia.');
  for (const item of candidate.evidence) {
    const url = text(item?.url);
    let parsed;
    try { parsed = new URL(url); } catch { /* validated below */ }
    if (!parsed || parsed.protocol !== 'https:' || parsed.username || parsed.password || text(item.checkedOn || item.date) !== candidateDate || text(item.claim || item.excerpt || item.facts || item.statement).trim().length < 8) {
      throw new Error('Cada evidencia debe incluir URL HTTPS, extracto factual y checkedOn igual a la fecha del preflight.');
    }
  }
  const candidateEntityIds = new Set(entities.flatMap(entity => entity.canonicalIds.map(id => canonicalEntityId(id, policy))));
  const eventEntityIds = candidate.event.entities.flatMap(entity => typeof entity === 'string' ? [entity] : [...strings(entity?.id), ...strings(entity?.canonicalId), ...strings(entity?.slug)]);
  if (!eventEntityIds.length || eventEntityIds.some(id => !candidateEntityIds.has(canonicalEntityId(id, policy)))) {
    throw new Error('event.entities debe referir a entities canónicas declaradas en el candidato.');
  }
  if (!validDate(candidateDate)) throw new Error('La fecha del preflight debe ser YYYY-MM-DD válida.');
}

function citationData(record) {
  return {
    sourcePaths: record.sourcePaths || [],
    sourcePath: record.sourcePath || (record.sourcePaths || [])[0] || '',
    urls: record.sources || [],
    excerpt: [record.title, record.summary].filter(Boolean).join(' — ').slice(0, 500),
  };
}

function makeMatch(record, kind, basis, values = {}) {
  return {
    id: `${record.id}:${kind}`,
    recordId: record.id,
    kind,
    basis,
    date: record.date,
    title: record.title,
    slug: record.slug,
    sourcePaths: record.sourcePaths,
    sources: record.sources,
    excerpt: citationData(record).excerpt,
    sourcePath: record.sourcePath || '',
    historicalEvent: values.historicalEvent || null,
    requiresEditorialComparison: values.requiresEditorialComparison === true,
    requiresFourteenDayException: values.requiresFourteenDayException === true,
    requiresConcentrationReview: values.requiresConcentrationReview === true,
    matchedKeys: values.matchedKeys || [],
    matchedEntities: values.matchedEntities || [],
    ageDays: values.ageDays ?? null,
  };
}

function validateHistory(history) {
  if (!history || history.version !== INDEX_VERSION || !Array.isArray(history.records) || !Array.isArray(history.discarded) || typeof history.digest !== 'string') {
    throw new Error('Se requiere el índice completo de historial editorial de versión 1.');
  }
  if (history.recordCount !== history.records.length || (history.discardedCount !== undefined && history.discardedCount !== history.discarded.length) || calculateHistoryDigest(history) !== history.digest) {
    throw new Error('El índice de historial fue alterado o su digest no corresponde al contenido completo.');
  }
  return history;
}

export function preflightCandidate(candidate, history, policy, date, discarded = []) {
  assertPolicy(policy);
  validateHistory(history);
  if (stableStringify(history.aliases) !== stableStringify(policy.entities)) throw new Error('El índice histórico debe quedar ligado al mapa de aliases canónicos de la política.');
  if (!candidate || typeof candidate !== 'object') throw new Error('Falta el candidato estructurado de diversidad editorial.');
  const candidateDate = text(date || candidate.date);
  const entities = candidateEntities(candidate, policy);
  assertCandidateShape(candidate, candidateDate, policy, entities);
  const eventKeys = candidateEventKeys(candidate, policy);
  const matches = [];
  const reasons = [];
  const reasonCodes = [];
  let duplicateTopic = false;
  let editorialSaturation = false;
  let needsReview = false;

  for (const record of history.records) {
    const matchingKeys = record.canonicalTopicKeys.filter(key => eventKeys.includes(canonicalTopicKey(key, policy)));
    const exactTitle = normalizeEditorialText(record.title) && normalizeEditorialText(record.title) === normalizeEditorialText(candidate.title);
    if (matchingKeys.length || exactTitle) {
      if (record.isGuide) {
        matches.push(makeMatch(record, 'guide_same_event_key', matchingKeys.length ? 'Exact canonical event/topic key is recorded in a weekly guide.' : 'Exact normalized title matches a weekly guide.', { matchedKeys: matchingKeys, requiresEditorialComparison: true }));
        needsReview = true;
      } else {
        matches.push(makeMatch(record, 'duplicate_topic', matchingKeys.length ? 'Exact canonical event/topic key matches a prior editorial record.' : 'Exact normalized title matches a prior editorial record.', { matchedKeys: matchingKeys }));
        duplicateTopic = true;
      }
      continue;
    }

    // This is an exact, multiword event-key phrase probe for metadata-free legacies, not semantic equivalence.
    const legacyPhrase = !record.topicKeys.length && eventKeys.find(key => phraseOccurs(key.replace(/-/g, ' '), record.searchText));
    if (legacyPhrase) {
      const kind = record.isGuide ? 'guide_possible_same_event' : 'legacy_possible_same_event';
      matches.push(makeMatch(record, kind, `Exact event-key phrase appears in legacy text: “${legacyPhrase}”.`, { matchedKeys: [legacyPhrase], requiresEditorialComparison: true }));
      needsReview = true;
    }

    for (const historicalEvent of structuredEventOverlaps(candidate, record, entities, policy)) {
      matches.push(makeMatch(record, record.isGuide ? 'guide_structured_event_overlap' : 'structured_event_overlap', 'Exact structured fields match: event type, original event date, and at least one canonical entity. This is a review signal, not an automatic semantic-equivalence decision.', {
        requiresEditorialComparison: true,
        historicalEvent,
      }));
      needsReview = true;
    }
  }

  const discardedRecords = [...new Map([...history.discarded, ...(Array.isArray(discarded) ? discarded.map(normalizeDiscarded) : [])].map(item => [stableStringify(item), item])).values()];
  const reconsiderationMatches = [];
  for (const item of discardedRecords) {
    const matchingKeys = item.canonicalTopicKeys.filter(key => eventKeys.includes(canonicalTopicKey(key, policy)));
    const sameCandidateId = item.candidateId && item.candidateId === normalizeKey(candidate.id);
    const matchingEvents = structuredEventOverlaps(candidate, item, entities, policy);
    if (!matchingKeys.length && !sameCandidateId && !matchingEvents.length) continue;
    const reconsidered = validateReconsideration(candidate, item, candidateDate);
    if (reconsidered) {
      const match = {
        id: `${item.id}:discarded_reconsideration`, recordId: item.id, kind: 'discarded_reconsideration', basis: 'Candidate explicitly refers to a prior discarded attempt and supplies newly checked evidence.',
        date: item.date, title: item.title, slug: '', sourcePaths: item.sourcePaths, sources: item.evidence.map(evidence => evidence.url).filter(Boolean), excerpt: item.reason,
        sourcePath: item.sourcePaths[0] || '', requiresEditorialComparison: true, requiresFourteenDayException: false,
        matchedKeys: matchingKeys, matchedEntities: [], historicalEvent: matchingEvents[0] || null, ageDays: dayDifference(item.date, candidateDate),
        newEvidence: reconsidered.newEvidence,
      };
      matches.push(match);
      reconsiderationMatches.push({ ...reconsidered, matchId: match.id });
      needsReview = true;
    } else {
      matches.push({
        id: `${item.id}:discarded_topic`, recordId: item.id, kind: 'discarded_topic', basis: sameCandidateId ? 'The candidate ID matches a prior discarded attempt.' : matchingEvents.length ? 'Exact structured event type/date/canonical entity matches a prior discarded attempt.' : 'Exact canonical event/topic key was recorded as discarded.',
        date: item.date, title: item.title, slug: '', sourcePaths: item.sourcePaths, sources: item.evidence.map(evidence => evidence.url).filter(Boolean), excerpt: item.reason,
        sourcePath: item.sourcePaths[0] || '', requiresEditorialComparison: false, requiresFourteenDayException: false,
        matchedKeys: matchingKeys, matchedEntities: [], historicalEvent: matchingEvents[0] || null, ageDays: dayDifference(item.date, candidateDate),
      });
      duplicateTopic = true;
    }
  }

  if (candidate.reconsideration && !reconsiderationMatches.some(match => match.discardedId === candidate.reconsideration.discardedId)) {
    throw new Error('candidate.reconsideration debe apuntar a un descarte que coincida por ID, clave o evento estructurado.');
  }

  const entityGroups = unique(entities.flatMap(entity => entity.groups));
  const groupEntries = new Map(entityGroups.map(group => [group, []]));
  const entriesByRecord = new Map();
  for (const record of history.records) {
    if (record.isGuide) continue;
    const ageDays = dayDifference(record.date, candidateDate);
    if (ageDays !== null && ageDays < 0) continue;
    const entityMatches = recordCandidateEntityMatches(record, entities);
    if (!entityMatches.length) continue;
    const entry = { record, entityMatches, ageDays };
    entriesByRecord.set(record.id, entry);
    for (const group of unique(entityMatches.flatMap(item => item.diversityGroupIds))) {
      if (!groupEntries.has(group)) groupEntries.set(group, []);
      groupEntries.get(group).push(entry);
    }
  }
  const saturatedGroups = new Set();
  for (const [group, entries] of groupEntries) {
    const recentCount = entries.filter(entry => entry.ageDays !== null && entry.ageDays <= policy.windows.concentrationDays).length;
    if (recentCount + 1 >= policy.limits.maxEntityPublicationsInConcentrationWindow) saturatedGroups.add(group);
  }
  for (const entry of entriesByRecord.values()) {
    const matchedGroups = unique(entry.entityMatches.flatMap(item => item.diversityGroupIds));
    const recent = matchedGroups.length > 0 && entry.ageDays !== null && entry.ageDays <= policy.windows.filmFranchiseCooldownDays;
    const concentrated = matchedGroups.length > 0 && entry.ageDays !== null && entry.ageDays <= policy.windows.concentrationDays && matchedGroups.some(group => saturatedGroups.has(group));
    const kind = recent ? 'film_franchise_recency' : concentrated ? 'entity_concentration' : 'entity_overlap';
    matches.push(makeMatch(entry.record, kind, `Exact entity alias/canonical ID overlap in complete history${entry.ageDays === null ? ' with unknown legacy date' : ` (${entry.ageDays} days ago)`}.`, {
      matchedEntities: entry.entityMatches,
      requiresEditorialComparison: true,
      requiresFourteenDayException: recent,
      requiresConcentrationReview: concentrated,
      ageDays: entry.ageDays,
    }));
    needsReview = true;
    if (recent || concentrated) editorialSaturation = true;
  }

  if (duplicateTopic) {
    reasonCodes.push('duplicate_topic');
    reasons.push('El topicKey/eventKey coincide exactamente con una publicación o descarte previo; no se infiere equivalencia por similitud textual.');
  }
  if (editorialSaturation) {
    reasonCodes.push('editorial_saturation');
    reasons.push(`Hay una mención exacta de película/franquicia dentro de ${policy.windows.filmFranchiseCooldownDays} días o se alcanza el límite de concentración de ${policy.windows.concentrationDays} días.`);
  }
  if (matches.some(match => match.kind.startsWith('guide_'))) {
    reasonCodes.push('guide_event_comparison');
    reasons.push('Una guía semanal comparte la clave o frase exacta del evento; el auditor debe justificar el aporte distinto. Las menciones simples de entidades en guías no activan este control.');
    needsReview = true;
  }
  if (matches.some(match => match.kind === 'legacy_possible_same_event')) {
    reasonCodes.push('legacy_event_phrase_review');
    reasons.push('Una frase exacta de la clave aparece en historia legacy sin metadatos; requiere comparación humana y no se trata como equivalencia semántica.');
    needsReview = true;
  }
  if (matches.some(match => match.kind === 'entity_overlap')) {
    reasonCodes.push('entity_overlap_review');
    reasons.push('La misma película/franquicia aparece en una editorial histórica; el auditor debe contrastar el acontecimiento y el aporte específico, sin inferir duplicación por entidad.');
  }
  if (matches.some(match => match.kind === 'structured_event_overlap' || match.kind === 'guide_structured_event_overlap')) {
    reasonCodes.push('structured_event_overlap');
    reasons.push('Coinciden tipo, fecha original y entidad canónica del evento en metadatos estructurados; se exige juicio editorial documentado y evidencia de evento nuevo.');
  }

  const decision = duplicateTopic ? 'blocked' : needsReview ? 'review_required' : 'eligible';
  return {
    version: 1,
    date: candidateDate,
    candidateId: text(candidate.id || candidate.topicKey),
    candidateDigest: hash(stableStringify(candidate)),
    historyDigest: history.digest,
    historyRecordCount: history.records.length,
    policyVersion: policy.version,
    decision,
    flags: { duplicate_topic: duplicateTopic, editorial_saturation: editorialSaturation, eligible: decision === 'eligible', review_required: decision === 'review_required' },
    reasonCodes,
    reasons,
    matches,
    checkedHistoryRecordIds: history.records.map(record => record.id),
    guideRecordIds: history.records.filter(record => record.isGuide).map(record => record.id),
    checkedDiscardedIds: history.discarded.map(record => record.id),
  };
}

function resolveContext(input, context) {
  return context || input?.draft?.originalityContext || input?.originalityContext || input || {};
}

function requiredComparisons(preflight) {
  return (preflight?.matches || []).filter(match => match.requiresEditorialComparison === true && !match.kind.startsWith('guide_') && match.kind !== 'discarded_reconsideration');
}

function getComparisonEvidence(comparison) {
  return Array.isArray(comparison?.evidence) ? comparison.evidence : [];
}

function comparisonForMatch(comparisons, match) {
  return comparisons.find(item => item.recordId === match.recordId || item.historyId === match.recordId || item.matchId === match.id);
}

function recordById(history, id) { return history.records.find(record => record.id === id); }

function assertComparisonEvidence(comparison, match, history, candidate, date) {
  if (!text(comparison.relation) || text(comparison.priorAngle).trim().length < 20 || text(comparison.candidateContribution).trim().length < 20 || text(comparison.difference).trim().length < 20) {
    throw new Error(`La comparación con ${match.recordId} debe explicar relación, ángulo previo, aporte actual y diferencia.`);
  }
  if (normalizeEditorialText(comparison.relation) === 'same event') throw new Error(`La comparación con ${match.recordId} identifica el mismo evento y no puede aprobar originalidad.`);
  if (normalizeEditorialText(comparison.relation) !== 'distinct event') throw new Error(`La comparación con ${match.recordId} debe clasificar el tema como distinct_event y aportar evidencia del hecho nuevo.`);
  const evidence = getComparisonEvidence(comparison);
  if (!evidence.length) throw new Error(`La comparación con ${match.recordId} necesita evidencia histórica citada.`);
  const record = recordById(history, match.recordId);
  for (const item of evidence) {
    if (text(item.recordId) !== match.recordId) throw new Error(`Cada evidencia de comparación debe declarar el recordId histórico ${match.recordId}.`);
    const path = text(item.sourcePath || item.path);
    const url = text(item.url || item.sourceUrl);
    const excerpt = text(item.excerpt || item.quote);
    const knownPath = path && (record?.sourcePaths || []).includes(path);
    const knownUrl = url && (record?.sources || []).includes(url);
    if ((!knownPath && !knownUrl) || excerpt.trim().length < 8) {
      throw new Error(`La evidencia de comparación para ${match.recordId} debe citar una ruta/URL de ese registro y un extracto concreto.`);
    }
  }
  if (match.kind === 'structured_event_overlap' || match.kind === 'legacy_possible_same_event') {
    if (text(comparison.eventDifference).trim().length < 20) throw new Error(`La coincidencia estructurada con ${match.recordId} requiere explicar la diferencia factual del evento.`);
    const newEvidence = Array.isArray(comparison.newEventEvidence) ? comparison.newEventEvidence : [];
    if (!newEvidence.length) throw new Error(`La coincidencia estructurada con ${match.recordId} necesita evidencia del evento nuevo.`);
    for (const item of newEvidence) {
      const referenced = (candidate.evidence || []).find(reference => text(reference?.url) === text(item?.url));
      const excerpt = text(item?.excerpt || item?.claim || item?.facts);
      const referenceText = text(referenced?.excerpt || referenced?.claim || referenced?.facts || referenced?.statement);
      if (!referenced || text(item?.checkedOn || item?.date) !== date || excerpt.trim().length < 8 || !referenceText || !normalizeEditorialText(referenceText).includes(normalizeEditorialText(excerpt))) {
        throw new Error(`La evidencia del evento nuevo para ${match.recordId} debe citar una referencia HTTPS del candidato, su extracto y checkedOn de la fecha revisada.`);
      }
    }
  }
}

function assertCandidateEvidenceLink(items, candidate, date, label) {
  const evidence = Array.isArray(items) ? items : [];
  if (!evidence.length) throw new Error(`${label} necesita evidencia factual nueva del candidato.`);
  for (const item of evidence) {
    const excerpt = text(item?.excerpt || item?.claim || item?.facts || item?.statement);
    const reference = (candidate.evidence || []).find(value => {
      const referenceText = text(value?.excerpt || value?.claim || value?.facts || value?.statement);
      return text(value?.url) === text(item?.url) && normalizeEditorialText(referenceText).includes(normalizeEditorialText(excerpt));
    });
    if (!reference || text(item?.checkedOn || item?.date) !== date || excerpt.trim().length < 8) {
      throw new Error(`${label} debe citar una URL/extracto ya declarado en candidate.evidence y checkedOn de la fecha revisada.`);
    }
  }
}

function validateGuideComparisons(originality, history, preflight, candidate, date) {
  const guides = history.records.filter(record => record.isGuide);
  const comparisons = Array.isArray(originality.guideComparisons) ? originality.guideComparisons : [];
  if (comparisons.length !== guides.length || new Set(comparisons.map(item => item.recordId)).size !== guides.length || guides.some(record => !comparisons.some(item => item.recordId === record.id))) {
    throw new Error(`La revisión debe declarar una comparación por cada una de las ${guides.length} guías del historial completo.`);
  }
  for (const comparison of comparisons) {
    const record = recordById(history, comparison.recordId);
    const relation = normalizeEditorialText(comparison.relation).replace(/ /g, '_');
    if (!record?.isGuide || !['no_same_event', 'substantial_contribution'].includes(relation) || text(comparison.basis).trim().length < 20) {
      throw new Error(`La comparación de guía ${comparison.recordId} requiere relation y basis concretos.`);
    }
    const citesGuide = (Array.isArray(comparison.evidence) ? comparison.evidence : []).some(item => {
      const path = text(item.sourcePath || item.path);
      const url = text(item.url || item.sourceUrl);
      return text(item.recordId) === record.id && text(item.excerpt || item.quote).trim().length >= 8 && ((path && record.sourcePaths.includes(path)) || (url && record.sources.includes(url)));
    });
    if (!citesGuide) throw new Error(`La comparación de guía ${record.id} debe citar su ruta histórica o fuente visible con extracto.`);
    const guideMatches = (preflight.matches || []).filter(match => match.recordId === record.id && match.kind.startsWith('guide_'));
    const exactEventKeyMatch = guideMatches.some(match => match.kind === 'guide_same_event_key');
    if (relation === 'no_same_event' && exactEventKeyMatch) throw new Error(`La guía ${record.id} comparte la clave exacta del evento; la revisión debe evaluar el aporte diario.`);
    if (relation === 'no_same_event' && guideMatches.length) {
      if (text(comparison.eventDifference).trim().length < 20) throw new Error(`La posible coincidencia con la guía ${record.id} necesita explicar el dato estructurado que diferencia el evento.`);
      assertCandidateEvidenceLink(comparison.eventEvidence || comparison.contributionEvidence || comparison.newEventEvidence, candidate, date, `La comparación de evento con la guía ${record.id}`);
    }
    if (relation === 'substantial_contribution') {
      if (text(comparison.candidateContribution).trim().length < 20 || text(comparison.difference).trim().length < 20) throw new Error(`El aporte diario frente a la guía ${record.id} necesita una diferencia concreta.`);
      assertCandidateEvidenceLink(comparison.contributionEvidence || comparison.newEventEvidence, candidate, date, `El aporte frente a la guía ${record.id}`);
    }
  }
}

function validateConcentrationReview(originality, preflight) {
  const concentrated = (preflight.matches || []).some(match => match.requiresConcentrationReview === true);
  if (!concentrated) {
    if (originality.concentrationReview) throw new Error('Se incluyó una revisión de concentración cuando la política no la solicitó.');
    return;
  }
  const review = originality.concentrationReview;
  const alternatives = Array.isArray(review?.alternativesConsidered) ? review.alternativesConsidered : [];
  if (text(review?.rationale).trim().length < 20 || !alternatives.length || alternatives.some(item => !text(item.topicKey) || !text(item.title) || text(item.reason).trim().length < 12)) {
    throw new Error('La concentración de 30 días necesita una justificación y al menos una alternativa concreta con motivo de priorización.');
  }
}

function validateDiscardReconsiderations(originality, preflight) {
  const required = (preflight.matches || []).filter(match => match.kind === 'discarded_reconsideration');
  const supplied = Array.isArray(originality.reconsiderations) ? originality.reconsiderations : [];
  if (supplied.length !== required.length || new Set(supplied.map(item => item.discardedId)).size !== required.length) {
    throw new Error(`La revisión debe auditar cada descarte reconsiderado (${required.length}).`);
  }
  for (const match of required) {
    const item = supplied.find(value => value.discardedId === match.recordId);
    if (!item || !approvedVerdict(item.verdict) || text(item.basis).trim().length < 20) throw new Error(`La reconsideración del descarte ${match.recordId} necesita basis y veredicto aprobado del auditor.`);
    const evidence = Array.isArray(item.newEvidence) ? item.newEvidence : [];
    const expected = match.newEvidence || [];
    if (evidence.length !== expected.length || expected.some(source => !evidence.some(value => text(value.url) === source.url && text(value.checkedOn || value.date) === source.checkedOn && normalizeEditorialText(text(value.excerpt || value.claim || value.facts)) === normalizeEditorialText(source.excerpt)))) {
      throw new Error(`La revisión del descarte ${match.recordId} debe auditar exactamente la evidencia nueva congelada.`);
    }
  }
}

export function validateFourteenDayException(input, report, context) {
  const resolved = resolveContext(input, context);
  const preflight = resolved.preflight || input?.preflight;
  const history = validateHistory(resolved.history || input?.history);
  const policy = resolved.policy || input?.policy;
  const candidate = resolved.candidate || input?.candidate || input?.draft?.candidate;
  assertPolicy(policy);
  if (!candidate || !preflight || stableStringify(preflightCandidate(candidate, history, policy, text(preflight.date))) !== stableStringify(preflight)) {
    throw new Error('La excepción de 14 días requiere un preflight recalculado sobre el candidato y el historial íntegros.');
  }
  if (preflight.flags?.duplicate_topic) throw new Error('Un duplicado exacto no admite excepción de 14 días.');
  if (!approvedVerdict(report?.verdict) || !approvedVerdict(report?.originality?.verdict)) throw new Error('La excepción necesita una revisión de originalidad aprobada.');
  const recentMatches = (preflight?.matches || []).filter(match => match.requiresFourteenDayException === true);
  const originality = report?.originality || {};
  const exception = originality.exception14d || report?.exception14d;
  if (!recentMatches.length) {
    if (exception) throw new Error('Se incluyó una excepción de 14 días sin coincidencias que la requieran.');
    return { required: false, approved: true };
  }
  if (!exception || exception.verdict !== 'approved' || exception.extraordinary !== true) {
    throw new Error('La coincidencia de película/franquicia dentro de 14 días requiere una excepción extraordinaria aprobada explícitamente.');
  }
  if (text(exception.rationale).trim().length < 30 || text(exception.distinctContribution).trim().length < 30) {
    throw new Error('La excepción de 14 días debe documentar por qué el caso es extraordinario y cuál es su aporte sustancialmente distinto.');
  }
  const evidence = Array.isArray(exception.evidence) ? exception.evidence : [];
  for (const match of recentMatches) {
    const record = recordById(history, match.recordId);
    const supported = evidence.some(item => {
      const path = text(item.sourcePath || item.path);
      const url = text(item.url || item.sourceUrl);
      const excerpt = text(item.excerpt || item.quote);
      return text(item.recordId) === match.recordId && excerpt.trim().length >= 8 && ((path && record?.sourcePaths.includes(path)) || (url && record?.sources.includes(url)));
    });
    if (!supported) throw new Error(`La excepción de 14 días necesita evidencia citada para ${match.recordId}.`);
  }
  return { required: true, approved: true, rationale: exception.rationale, distinctContribution: exception.distinctContribution };
}

function approvedVerdict(value) { return ['approved', 'pass', 'passed'].includes(text(value).toLowerCase()); }

function requireDimension(report, name) {
  const direct = report?.dimensions?.[name] ?? report?.verdicts?.[name] ?? report?.[`${name}Verdict`];
  if (!approvedVerdict(direct)) throw new Error(`La revisión final requiere veredicto ${name}: approved.`);
}

export function validateOriginalityReview(input, report, context) {
  const resolved = resolveContext(input, context);
  const history = validateHistory(resolved.history || input?.history);
  const policy = resolved.policy || input?.policy;
  assertPolicy(policy);
  const candidate = resolved.candidate || input?.candidate || input?.draft?.candidate;
  const preflight = resolved.preflight || input?.preflight;
  if (!candidate || !preflight) throw new Error('La validación de originalidad requiere candidate y resultado de preflight congelados.');

  const date = text(input?.date || input?.draft?.date || resolved.date || candidate.date || preflight.date);
  const candidateId = text(candidate.id || candidate.topicKey);
  const contentDigest = text(input?.contentDigest || input?.digest || resolved.contentDigest);
  const freshPreflight = preflightCandidate(candidate, history, policy, date);
  if (stableStringify(freshPreflight) !== stableStringify(preflight)) throw new Error('El preflight no coincide con el recálculo sobre el digest y todos los registros del historial.');
  if (!contentDigest || text(report?.contentDigest) !== contentDigest) throw new Error('El informe de originalidad debe coincidir con el contentDigest congelado.');
  if (text(report?.date) !== date) throw new Error('La fecha del informe de originalidad no coincide con la preparación.');
  if (text(report?.candidateId) !== candidateId) throw new Error('El ID del informe de originalidad no coincide con el candidato.');

  const original = report?.originality;
  if (!original || !approvedVerdict(original.verdict)) throw new Error('Se requiere veredicto aprobado de originalidad.');
  if (!approvedVerdict(report?.verdict)) throw new Error('El veredicto general del revisor debe estar aprobado.');
  const reviewedHistory = original.history || {};
  if (text(reviewedHistory.digest) !== history.digest || reviewedHistory.recordCount !== history.records.length) throw new Error('El revisor debe declarar el digest y la cantidad del historial completo.');
  const checkedIds = Array.isArray(reviewedHistory.checkedRecordIds) ? reviewedHistory.checkedRecordIds : [];
  const expectedIds = history.records.map(record => record.id);
  if (checkedIds.length !== expectedIds.length || new Set(checkedIds).size !== checkedIds.length || expectedIds.some(id => !checkedIds.includes(id))) {
    throw new Error(`La revisión de originalidad debe cubrir los ${expectedIds.length} registros históricos completos, sin truncar ni omitir IDs.`);
  }
  const checkedDiscardedIds = Array.isArray(reviewedHistory.checkedDiscardedIds) ? reviewedHistory.checkedDiscardedIds : [];
  const expectedDiscardedIds = history.discarded.map(item => item.id);
  if (checkedDiscardedIds.length !== expectedDiscardedIds.length || new Set(checkedDiscardedIds).size !== checkedDiscardedIds.length || expectedDiscardedIds.some(id => !checkedDiscardedIds.includes(id))) {
    throw new Error(`La revisión de originalidad debe cubrir los ${expectedDiscardedIds.length} descartes completos, sin truncar ni omitir IDs.`);
  }
  const coverage = original.coverage || {};
  for (const dimension of ['fullHistory', 'events', 'entities', 'guideContributions']) {
    if (coverage[dimension] !== true) throw new Error(`Falta cobertura de originalidad: ${dimension}.`);
  }

  if (preflight.flags?.duplicate_topic) throw new Error('Un duplicado exacto de topicKey/eventKey no se aprueba mediante revisión de originalidad.');
  const comparisons = Array.isArray(original.comparisons) ? original.comparisons : [];
  for (const match of requiredComparisons(preflight)) {
    const comparison = comparisonForMatch(comparisons, match);
    if (!comparison) throw new Error(`Falta comparación editorial explícita para ${match.recordId} (${match.kind}).`);
    assertComparisonEvidence(comparison, match, history, candidate, date);
  }
  validateGuideComparisons(original, history, preflight, candidate, date);
  validateConcentrationReview(original, preflight);
  validateDiscardReconsiderations(original, preflight);
  const exceptionProof = validateFourteenDayException(input, report, resolved);

  const finalReview = Boolean(input?.note || (input?.draft && input?.note !== undefined));
  if (finalReview) {
    if (!approvedVerdict(report?.verdict)) throw new Error('El veredicto factual general debe estar aprobado.');
    requireDimension(report, 'factual');
    requireDimension(report, 'editorial');
    requireDimension(report, 'originality');
  }
  return {
    version: REVIEW_VERSION,
    approved: true,
    phase: finalReview ? 'final' : 'candidate',
    date,
    candidateId,
    contentDigest,
    historyDigest: history.digest,
    historyRecordCount: history.records.length,
    checkedRecordIds: checkedIds,
    checkedDiscardedIds,
    guideComparisonCount: history.records.filter(record => record.isGuide).length,
    comparisonCount: requiredComparisons(preflight).length,
    exception14d: exceptionProof,
  };
}

export const validOriginalityReview = validateOriginalityReview;
