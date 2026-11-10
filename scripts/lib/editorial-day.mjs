import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { digest } from './daily-editorial-policy.mjs';

export const REVIEW_VERDICTS = ['changes_required', 'topic_unviable', 'duplicate_topic', 'editorial_saturation', 'approved'];
export const REPLACEMENT_VERDICTS = REVIEW_VERDICTS.slice(1, 4);
const edges = {
  drafting: ['reviewing'], reviewing: ['drafting', ...REVIEW_VERDICTS],
  changes_required: ['revising', 'reviewing', ...REPLACEMENT_VERDICTS], revising: ['reviewing'],
  approved: ['reviewing', 'changes_required', 'published'],
  topic_unviable: ['switching_topic'], duplicate_topic: ['switching_topic'], editorial_saturation: ['switching_topic'],
  switching_topic: ['drafting'], published: [],
};
const timestamp = () => new Date().toISOString();
const fail = message => { throw new Error(`Jornada editorial: ${message}`); };
export function candidateField(candidate, targetId) {
  let value = candidate;
  for (const part of String(targetId).replace(/^candidate\//, '').split('/')) {
    if (!value || !Object.hasOwn(value, part)) fail('el hallazgo preliminar debe apuntar a un campo real de candidate.json.');
    value = value[part];
  }
  return value;
}
export function validateCandidateCorrections(input, report, rounds) {
  for (const round of rounds.filter(r => r.phase === 'candidate')) {
    for (const observation of round.observations || []) {
      for (const old of (observation.report.findings || []).filter(f => f.severity === 'material' && f.status === 'open')) {
        const fixed = report.findings?.find(f => f.id === old.id && f.kind === old.kind && f.targetId === old.targetId && f.status === 'resolved');
        const before = candidateField(round.input.candidate, old.targetId), after = candidateField(input.candidate, old.targetId);
        if (!fixed || !Object.hasOwn(fixed, 'before') || !Object.hasOwn(fixed, 'after') || digest(JSON.stringify(before)) === digest(JSON.stringify(after)) || digest(JSON.stringify(fixed.before)) !== digest(JSON.stringify(before)) || digest(JSON.stringify(fixed.after)) !== digest(JSON.stringify(after)) || typeof fixed.resolution !== 'string' || fixed.resolution.length < 12 || !fixed.evidence?.length) fail('falta resolver y documentar antes/después el hallazgo material del candidato; no se borra al aprobar el preflight.');
        for (const item of fixed.evidence) {
          let parsed; try { parsed = new URL(item.url); } catch { fail('falta evidencia abierta de la corrección preliminar.'); }
          if (parsed.protocol !== 'https:' || parsed.username || parsed.password || item.checkedOn !== input.date || typeof item.excerpt !== 'string' || item.excerpt.length < 8) fail('evidencia inválida de la corrección preliminar.');
        }
      }
    }
  }
}
const meaningfulInput = input => input.note ? { note: input.note, tweet: input.draft.tweet, claims: input.draft.claims, access: input.draft.access, sourceChecks: input.draft.sourceChecks, imageChecks: input.draft.imageChecks, assets: input.assets } : input.candidate;
function issueProgress(input, report) {
  const fields = (report.findings || []).filter(f => f.status === 'open').map(finding => {
    if (input.candidate) {
      const path = finding.targetId.replace(/^candidate\//, '').split('/');
      return [finding.id, path.reduce((value, key) => value?.[key], input.candidate) ?? null, input.candidate.evidence];
    }
    const draft = input.draft;
    const value = finding.kind === 'claim' ? draft.claims?.find(item => item.id === finding.targetId)
      : finding.kind === 'access' ? draft.access?.items?.find(item => item.id === finding.targetId)
        : finding.kind === 'image' ? { image: draft.imageChecks?.find(item => item.src === finding.targetId), bytes: input.assets[finding.targetId] }
          : { text: input.textFields?.[finding.targetId], evidence: draft.claims };
    return [finding.id, value ?? null, draft.sourceChecks];
  });
  return digest(JSON.stringify(fields.sort((a, b) => a[0].localeCompare(b[0]))));
}

// This is a durable workflow journal, not a cryptographic runtime attestation.
// Only the outer orchestrator writes it. Native roles write their own artifacts.
export class EditorialDay {
  constructor(directory, date) {
    this.directory = directory;
    this.file = resolve(directory, `${date}-session.json`);
    if (existsSync(this.file)) {
      const envelope = JSON.parse(readFileSync(this.file, 'utf8'));
      if (envelope.digest !== digest(JSON.stringify(envelope.day)) || envelope.day.date !== date) fail('checkpoint alterado o de otra fecha.');
      this.value = envelope.day;
    } else {
      this.value = { version: 1, date, status: 'drafting', agents: {}, attempts: [], discarded: [], events: [] };
      this.newAttempt();
    }
  }
  get attempt() { return this.value.attempts.at(-1); }
  get attemptDirectory() { return resolve(this.directory, this.value.date, this.attempt.id); }
  save() {
    mkdirSync(this.attemptDirectory, { recursive: true });
    const temporary = `${this.file}.${randomUUID()}.tmp`;
    writeFileSync(temporary, `${JSON.stringify({ day: this.value, digest: digest(JSON.stringify(this.value)) }, null, 2)}\n`);
    renameSync(temporary, this.file);
  }
  event(type, details = {}) { this.value.events.push({ at: timestamp(), attemptId: this.attempt.id, type, ...details }); }
  transition(next, details = {}) {
    const from = this.attempt.status;
    if (from === next) return;
    if (!edges[from]?.includes(next)) fail(`transición inválida ${from} → ${next}.`);
    this.attempt.status = this.value.status = next;
    this.event('transition', { from, to: next, ...details });
    this.save();
  }
  newAttempt() {
    const id = `${this.value.date}-${String(this.value.attempts.length + 1).padStart(3, '0')}`;
    this.value.attempts.push({ id, status: 'drafting', rounds: [], correctionPlans: [], createdAt: timestamp() });
    this.value.status = 'drafting';
    this.event('attempt_created');
    this.save();
  }
  pinAgents(author, reviewer) {
    if (!author?.agentId || !reviewer?.agentId || author.agentId === reviewer.agentId) fail('se necesitan dos agentes nativos independientes.');
    for (const [role, execution] of [['author', author], ['reviewer', reviewer]]) {
      const pinned = this.value.agents[role];
      if (pinned && (pinned.agentId !== execution.agentId || pinned.model !== execution.model || pinned.effort !== execution.effort)) fail(`reutilizar el mismo agente ${role} y su selección real durante la jornada.`);
      this.value.agents[role] = { agentId: execution.agentId, model: execution.model, effort: execution.effort };
    }
    this.save();
  }
  select(candidate, preflight, historyDigest) {
    if (!['drafting', 'revising'].includes(this.attempt.status)) fail('seleccionar candidato solamente en drafting o revising.');
    if (this.attempt.candidate && digest(JSON.stringify(candidate)) !== digest(JSON.stringify(this.attempt.candidate))) {
      const old = this.attempt.candidate;
      if (this.attempt.status !== 'revising' || candidate.id !== old.id) fail('no se puede cambiar de candidato sin un rechazo explícito y --switch-topic.');
      const requested = path => (this.attempt.rounds.at(-1)?.report?.findings || []).some(f => f.status === 'open' && f.kind === 'text' && (f.targetId === `candidate/${path}` || f.targetId === `candidate/${path.split('/')[0]}`));
      for (const [path, before, after] of [
        ['topicKey', old.topicKey, candidate.topicKey], ['event/key', old.event.key, candidate.event.key], ['event/type', old.event.type, candidate.event.type],
        ['event/entities', old.event.entities.map(e => typeof e === 'string' ? e : e.id).sort(), candidate.event.entities.map(e => typeof e === 'string' ? e : e.id).sort()],
        ['entities', old.entities.map(e => [e.id, e.kind]).sort(), candidate.entities.map(e => [e.id, e.kind]).sort()],
      ]) if (JSON.stringify(before) !== JSON.stringify(after) && !requested(path)) fail('la identidad no se cambia arbitrariamente: hace falta un hallazgo explícito del auditor sobre ese campo o --switch-topic.');
      this.attempt.candidateApproved = null;
    }
    this.attempt.candidate = candidate;
    this.attempt.preflight = preflight;
    this.attempt.historyDigest = historyDigest;
    this.event('candidate_checked', { candidateId: candidate.id, historyDigest, decision: preflight.decision });
    this.save();
  }
  freeze(input, phase = 'article', { viabilityOnly = false } = {}) {
    if (!this.attempt.candidate) fail('primero seleccionar y comprobar el candidato con --candidate.');
    if (phase === 'article' && !this.attempt.candidateApproved) fail('falta revisión independiente del candidato antes de investigar en profundidad.');
    const progressDigest = digest(JSON.stringify(meaningfulInput(input)));
    const previous = this.attempt.rounds.at(-1);
    if (viabilityOnly && (!this.attempt.stalled || this.attempt.rounds.some(r => r.viabilityOnly && r.progressDigest === progressDigest))) fail('la evaluación de viabilidad requiere estancamiento y no puede repetirse sobre el mismo paquete.');
    if (!viabilityOnly && this.attempt.stalled && (previous?.progressDigest === progressDigest || (previous?.report && issueProgress(previous.input, previous.report) === issueProgress(input, previous.report)))) fail('sin avances verificables sobre los hallazgos: cambiar la estrategia con evidencia o --assess-viability; no repetir la misma auditoría.');
    if (this.attempt.status === 'reviewing' && previous?.input.contentDigest === input.contentDigest && !previous.report) return previous;
    if (!['drafting', 'revising', 'approved', ...(viabilityOnly ? ['changes_required'] : [])].includes(this.attempt.status)) fail('ejecutar --revise antes de congelar correcciones.');
    const round = { id: `${this.attempt.id}-r${this.attempt.rounds.length + 1}`, phase, progressDigest, input, frozenAt: timestamp(), artifactsReady: false, ...(viabilityOnly ? { viabilityOnly: true } : {}) };
    this.attempt.rounds.push(round);
    this.transition('reviewing', { roundId: round.id, phase });
    return round;
  }
  record(report, execution) {
    if (!REVIEW_VERDICTS.includes(report.verdict)) fail('veredicto editorial desconocido.');
    const round = this.attempt.rounds.at(-1);
    if (!round || round.input.contentDigest !== report.contentDigest) fail('informe ajeno al snapshot vigente.');
    if (round.viabilityOnly && report.verdict === 'approved') fail('una evaluación sin avances no aprueba contenido; corregir primero y volver a la revisión completa.');
    const reportDigest = digest(JSON.stringify({ report, execution }));
    if (round.reportDigest === reportDigest) return;
    if (!['reviewing', 'approved', 'changes_required'].includes(this.attempt.status)) fail('el intento no admite otro informe sin nueva preparación.');
    // Retain every observation, even an adverse amendment after an approval.
    round.observations ||= [];
    round.observations.push({ report, execution, observedAt: timestamp() });
    round.report = report; round.execution = execution; round.reportDigest = reportDigest;
    if (report.verdict === 'changes_required') {
      const signature = r => digest(JSON.stringify((r.findings || []).filter(f => f.status === 'open').map(f => [f.id, f.kind, f.targetId]).sort()));
      const prior = this.attempt.rounds.slice(0, -1).findLast(r => r.report?.verdict === 'changes_required');
      this.attempt.stalled = !!prior && signature(prior.report) === signature(report) && issueProgress(prior.input, report) === issueProgress(round.input, report);
      this.attempt.feedback = { findings: report.findings, nextAction: this.attempt.stalled ? 'change_strategy_or_assess_viability' : 'revise', reason: report.reason };
    }
    if (report.verdict === 'approved') {
      this.attempt.stalled = false;
      delete this.attempt.feedback;
    }
    if (round.phase === 'candidate' && report.verdict === 'approved') {
      this.attempt.candidateApproved = { report, execution, historyDigest: this.attempt.historyDigest };
      this.transition('drafting', { phase: 'candidate' });
    } else this.transition(report.verdict, { roundId: round.id });
    this.save();
  }
  revise(plan) {
    if (this.attempt.status !== 'changes_required') fail('sólo changes_required permite --revise.');
    if (this.attempt.stalled) {
      if (!plan?.strategy || !plan?.evidence?.length) fail('rechazo sin avances: hace falta una estrategia diferente y evidencia nueva, o evaluación de inviabilidad.');
      const hash = digest(JSON.stringify(plan));
      if (this.attempt.correctionPlans.some(p => p.digest === hash)) fail('la estrategia ya fue intentada sin avances; evaluar inviabilidad.');
      this.attempt.correctionPlans.push({ ...plan, digest: hash, at: timestamp() });
    } else if (plan) this.attempt.correctionPlans.push({ ...plan, at: timestamp() });
    this.transition('revising');
  }
  replace(archive) {
    if (!REPLACEMENT_VERDICTS.includes(this.attempt.status)) fail('sólo un rechazo de candidato permite cambiar de tema; los errores corregibles requieren --revise.');
    if (!archive?.manifest?.length) fail('archivar íntegramente el intento antes de reemplazarlo.');
    this.attempt.archive = archive;
    this.value.discarded.push({ candidate: this.attempt.candidate, verdict: this.attempt.status, attemptId: this.attempt.id, evidence: this.attempt.rounds.at(-1)?.report });
    this.transition('switching_topic');
  }
  published(receipt, sha) {
    if (this.value.status === 'published') return;
    if (this.value.status !== 'approved') fail('publicación sin aprobación.');
    this.attempt.publication = { slug: receipt.slug, url: receipt.url, sha };
    this.transition('published');
  }
  summary() {
    const status = this.value.status;
    return { date: this.value.date, attemptId: this.attempt.id, status, agents: this.value.agents,
      nextAction: status === 'drafting' ? (this.attempt.candidateApproved ? 'author_draft' : 'candidate') : status === 'changes_required' ? this.attempt.feedback.nextAction : status === 'reviewing' ? 'reviewer' : status === 'revising' ? 'author_correct' : status === 'approved' ? 'validate_publish' : status === 'switching_topic' ? 'recover_switch' : REPLACEMENT_VERDICTS.includes(status) ? 'switch_topic' : 'recover_publication',
      candidate: this.attempt.candidate, feedback: this.attempt.feedback, discarded: this.value.discarded.map(d => ({ attemptId: d.attemptId, verdict: d.verdict, candidate: d.candidate })), checkpoint: this.file };
  }
}
