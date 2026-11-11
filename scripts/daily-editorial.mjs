import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, lstatSync, renameSync, cpSync, readdirSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { hostname } from 'node:os';
import { editorialPostPlan } from './publish-buffer-editorial-x.mjs';
import { selectNativeLuna, validateNativeExecution } from './lib/cineposta-luna.mjs';
import { argentinaDate, digest, validateDraft, assertPublicationScope } from './lib/daily-editorial-policy.mjs';
import { reviewInput, validateEditorialQuality, snapshotEditorialAssets, validateStoredEditorialReview, requireReviewedForSocial, findingTarget } from './lib/editorial-quality.mjs';
import { EditorialDay, REVIEW_VERDICTS, REPLACEMENT_VERDICTS, candidateField, validateCandidateCorrections } from './lib/editorial-day.mjs';
import { buildEditorialHistory, preflightCandidate, validateOriginalityReview } from './lib/editorial-diversity.mjs';
import { EditorialMetrics, EditorialValidationStages, buildArtifactDigest, readEditorialMetrics, validationInputDigest } from './lib/editorial-validation.mjs';
import { compactEditorialHistory, makeReviewPacket, reviewContractIssues } from './lib/editorial-review-tools.mjs';
import { validateDailySocial } from './lib/editorial-social.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(readFileSync(resolve(root, 'config/daily-editorial.json'), 'utf8'));
const mode = process.argv[2];
if (!['--prepare', '--status', '--candidate', '--record-review', '--revise', '--assess-viability', '--switch-topic', '--review', '--dry-run', '--revalidate', '--publish', '--verify', '--tweet'].includes(mode) || process.argv.length !== 3) throw new Error('Usá --prepare, --status, --candidate, --record-review, --revise, --assess-viability, --switch-topic, --review, --dry-run, --revalidate, --publish, --verify o --tweet.');
const date = argentinaDate();
const state = resolve(root, '.tmp/cineposta-daily');
const work = resolve(state, `work-${date}`);
const proofPath = resolve(state, `${date}-proof.json`);
const contextPath = resolve(state, `${date}-context.json`);
const processStart = pid => { try { return readFileSync(`/proc/${pid}/stat`, 'utf8').split(') ').at(-1).split(' ')[19]; } catch { return null; } };
let metrics;
const run = (command, args, cwd = work, capture = false) => {
  if (capture) return execFileSync(command, args, { cwd, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 }).trim();
  const env = command === 'npm' && args[0] === 'run'
    ? { ...process.env, NODE_OPTIONS: `${process.env.NODE_OPTIONS || ''} --max-old-space-size=6144`.trim() }
    : process.env;
  const result = spawnSync(command, args, { cwd, env, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} falló (${result.status ?? result.error?.message}).`);
};
const git = (...args) => run('git', args, work, true);
const json = path => JSON.parse(readFileSync(path, 'utf8'));
const changes = base => [
  ...git('diff', '--name-status', '--no-renames', base).split('\n').filter(Boolean).map(line => { const [status, path] = line.split('\t'); return { status, path }; }),
  ...git('ls-files', '--others', '--exclude-standard').split('\n').filter(Boolean).map(path => ({ status: '??', path })),
];
const fingerprint = files => Object.fromEntries(files.sort().map(file => [file, digest(readFileSync(resolve(work, file)))]));
const log = message => console.log(`[cineposta ${date}] ${message}`);
const httpsArgs = ['--fail', '--silent', '--show-error', '--location', '--max-time', '30', '--proto', '=https', '--proto-redir', '=https'];
const reviewDirectory = resolve(work, '.tmp/cineposta-daily');
const reviewFile = resolve(reviewDirectory, 'factual-review.json');
const reviewExecutionFile = resolve(reviewDirectory, 'native-review-execution.json');
const reviewInputFile = resolve(reviewDirectory, 'review-input.json');
const reviewHistoryFile = resolve(reviewDirectory, 'review-history.json');
let day;
let mainHead;
const reviewJournalPath = () => resolve(day.attemptDirectory, 'review-journal.json');
const policy = () => json(resolve(work, 'config/daily-editorial-diversity.json'));

function historyAt(base) {
  const records = folder => git('ls-tree', '-r', '--name-only', base, '--', folder).split('\n').filter(path => path.endsWith('.json')).map(path => JSON.parse(git('show', `${base}:${path}`)));
  return buildEditorialHistory(work, { notes: records('src/data/editorials'), receipts: records('reports/daily-editorial'), discarded: day.value.discarded, policy: policy() });
}

function persistContext() {
  const context = json(contextPath);
  Object.assign(context, { attemptId: day.attempt.id, checkpoint: day.file, status: day.value.status });
  writeFileSync(contextPath, `${JSON.stringify(context, null, 2)}\n`);
  return context;
}

function printStatus() {
  const pendingReport = day.value.status === 'reviewing' && [reviewFile, reviewExecutionFile].every(existsSync);
  log(JSON.stringify({ ...persistContext(), ...day.summary(), ...(pendingReport ? { nextAction: 'record_review' } : {}), validationCommand: existsSync(proofPath) ? '--revalidate' : '--dry-run', metrics: metrics?.summary() }));
}

function readReviewJournal() {
  const reviewJournalFile = reviewJournalPath();
  const pendingPath = `${reviewJournalFile}.pending`;
  if (existsSync(pendingPath)) {
    const pending = json(pendingPath), current = existsSync(reviewJournalFile) ? json(reviewJournalFile).digest : null;
    const mirror = existsSync(reviewHistoryFile) ? digest(JSON.stringify(json(reviewHistoryFile))) : null;
    if (pending.digest !== digest(JSON.stringify(pending.entries)) || ![pending.previousDigest, pending.digest].includes(current) || ![pending.previousDigest, pending.digest].includes(mirror)) throw new Error('Transacción de journal alterada; conservar y diagnosticar.');
    writeFileSync(reviewHistoryFile, `${JSON.stringify(pending.entries, null, 2)}\n`);
    const temporary = `${reviewJournalFile}.${randomUUID()}.tmp`;
    writeFileSync(temporary, `${JSON.stringify({ entries: pending.entries, digest: pending.digest }, null, 2)}\n`);
    renameSync(temporary, reviewJournalFile);
    rmSync(pendingPath);
  }
  if (!existsSync(reviewJournalFile)) {
    if (existsSync(reviewInputFile) || existsSync(reviewHistoryFile)) throw new Error('Falta el journal del orquestador; no se reinicia desde el worktree.');
    return [];
  }
  const journal = json(reviewJournalFile);
  if (digest(JSON.stringify(journal.entries)) !== journal.digest) throw new Error('Journal del orquestador alterado.');
  if (!existsSync(reviewHistoryFile) || digest(JSON.stringify(json(reviewHistoryFile))) !== journal.digest) throw new Error('El espejo de revisión del worktree fue alterado o eliminado.');
  return journal.entries;
}

function writeReviewJournal(entries) {
  const reviewJournalFile = reviewJournalPath();
  const envelope = { entries, digest: digest(JSON.stringify(entries)) };
  const pendingPath = `${reviewJournalFile}.pending`;
  const pendingTemporary = `${pendingPath}.${randomUUID()}.tmp`;
  writeFileSync(pendingTemporary, `${JSON.stringify({ ...envelope, previousDigest: existsSync(reviewJournalFile) ? json(reviewJournalFile).digest : null }, null, 2)}\n`);
  renameSync(pendingTemporary, pendingPath);
  writeFileSync(reviewHistoryFile, `${JSON.stringify(entries, null, 2)}\n`);
  const temporary = `${reviewJournalFile}.${randomUUID()}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(envelope, null, 2)}\n`);
  renameSync(temporary, reviewJournalFile);
  rmSync(pendingPath);
}

function writeReviewHelpers(round) {
  const article = round.phase === 'article';
  const history = article ? readReviewJournal() : [];
  const previous = article ? history.findLast(entry => entry.report?.contentDigest === entry.input?.contentDigest)
    : day.attempt.rounds.slice(0, -1).findLast(previous => previous.phase === 'candidate' && previous.report);
  const candidateApproval = day.attempt.candidateApproved;
  const approvedCandidateInput = day.attempt.rounds.find(item => item.phase === 'candidate' && item.input.contentDigest === candidateApproval?.report?.contentDigest)?.input;
  const packet = makeReviewPacket(round.input, { previous, history, candidateApproval: candidateApproval ? { ...candidateApproval, input: approvedCandidateInput } : null, reviewerAgentId: day.value.agents.reviewer?.agentId });
  const fullHistory = article ? round.input.draft.originalityContext.history : round.input.history;
  writeFileSync(resolve(reviewDirectory, 'review-template.json'), `${JSON.stringify(packet.template, null, 2)}\n`);
  writeFileSync(resolve(reviewDirectory, 'review-diff.json'), `${JSON.stringify(packet.delta, null, 2)}\n`);
  writeFileSync(resolve(reviewDirectory, 'published-brief.json'), `${JSON.stringify(compactEditorialHistory(fullHistory))}\n`);
  writeFileSync(resolve(reviewDirectory, 'review-packet.json'), `${JSON.stringify({ version: 1, phase: round.phase, contentDigest: round.input.contentDigest, input: article ? 'review-input.json' : 'candidate-input.json', template: 'review-template.json', delta: 'review-diff.json', history: 'published-brief.json' }, null, 2)}\n`);
}

function installReviewPacket(round) {
  if (round.artifactsReady) {
    if (!existsSync(resolve(reviewDirectory, 'review-packet.json'))) writeReviewHelpers(round);
    return; // Repeated freeze never erases a completed, unprocessed review.
  }
  if (existsSync(reviewFile)) {
    round.preservedArtifacts ||= [];
    round.preservedArtifacts.push({ report: json(reviewFile), execution: existsSync(reviewExecutionFile) ? json(reviewExecutionFile) : null });
    day.save();
  }
  if (round.phase === 'article') writeReviewJournal(readReviewJournal());
  for (const file of [reviewFile, reviewExecutionFile]) rmSync(file, { force: true });
  const path = round.phase === 'candidate' ? resolve(reviewDirectory, 'candidate-input.json') : reviewInputFile;
  writeFileSync(path, `${JSON.stringify(round.input, null, 2)}\n`);
  writeReviewHelpers(round);
  round.artifactsReady = true;
  day.save();
}

function candidateReview(viabilityOnly = false) {
  const context = json(contextPath);
  const author = validateNativeExecution(json(context.executionFile), context.selection);
  metrics.native('author', author);
  if (author.forkTurns !== 'none') throw new Error('El autor debe usar fork_turns none.');
  const candidate = json(resolve(reviewDirectory, 'candidate.json'));
  const history = historyAt(mainHead);
  const configuredPolicy = policy();
  const preflight = preflightCandidate(candidate, history, configuredPolicy, date);
  const payload = { version: 1, date, candidate, history, historyRef: mainHead, policy: configuredPolicy, preflight, authorExecution: author };
  const input = { ...payload, contentDigest: digest(JSON.stringify(payload)) };
  const previous = day.attempt.rounds.at(-1);
  if (!viabilityOnly && day.attempt.status === 'drafting' && previous?.phase === 'candidate' && previous.report?.verdict === 'approved'
    && day.attempt.candidateApproved?.report?.contentDigest === input.contentDigest && previous.input.contentDigest === input.contentDigest
    && [reviewFile, reviewExecutionFile].every(existsSync) && previous.reportDigest === digest(JSON.stringify({ report: json(reviewFile), execution: json(reviewExecutionFile) }))) {
    validateOriginalityReview(input, previous.report, { history, policy: configuredPolicy, candidate, preflight });
    log(JSON.stringify({ ...day.summary(), reusedReview: true, selection: context.selection }));
    return;
  }
  if (viabilityOnly) {
    if (digest(JSON.stringify(candidate)) !== digest(JSON.stringify(day.attempt.candidate))) throw new Error('La evaluación de viabilidad no cambia de candidato.');
  } else day.select(candidate, preflight, history.digest);
  const round = day.freeze(input, 'candidate', { viabilityOnly });
  installReviewPacket(round);
  writeFileSync(resolve(reviewDirectory, 'published.json'), `${JSON.stringify(history, null, 2)}\n`);
  log(JSON.stringify({ ...day.summary(), reviewInputFile: resolve(reviewDirectory, 'candidate-input.json'), reviewFile, reviewExecutionFile, selection: context.selection, viabilityOnly }));
}

function validateAdverseReport(input, report) {
  if (!REVIEW_VERDICTS.includes(report.verdict) || report.verdict === 'approved') throw new Error('Veredicto adverso inválido.');
  if (typeof report.reason !== 'string' || report.reason.trim().length < 20) throw new Error('El rechazo necesita un motivo concreto y accionable.');
  const evidence = items => {
    if (!Array.isArray(items) || !items.length) throw new Error('El rechazo necesita evidencia verificable, no una clasificación sola.');
    for (const item of items) {
      const url = new URL(item.url);
      if (url.protocol !== 'https:' || url.username || url.password || item.checkedOn !== date || typeof item.excerpt !== 'string' || item.excerpt.trim().length < 8) throw new Error('Evidencia adversa inválida.');
    }
  };
  if (report.verdict === 'changes_required') {
    if (!report.findings?.some(f => f.status === 'open')) throw new Error('changes_required debe devolver hallazgos abiertos.');
    for (const finding of report.findings.filter(f => f.status === 'open')) {
      if (!finding.id || !finding.targetId || !['claim', 'access', 'image', 'text', 'social'].includes(finding.kind) || !['material', 'minor'].includes(finding.severity) || !finding.description || typeof finding.action !== 'string' || finding.action.length < 12) throw new Error('El hallazgo debe identificar objeto, problema y corrección concreta.');
      if (input.candidate) {
        if (finding.kind !== 'text') throw new Error('En preflight el hallazgo debe ser text y señalar candidate/campo.');
        candidateField(input.candidate, finding.targetId);
      } else if (!findingTarget(input, finding).exists) throw new Error('El hallazgo debe apuntar a un objeto real del snapshot.');
      evidence(finding.evidence);
    }
  } else {
    evidence(report.evidence);
    if (report.verdict === 'topic_unviable' && (!report.searches?.length || typeof report.unresolvable !== 'string' || report.unresolvable.length < 20)) throw new Error('topic_unviable requiere búsquedas razonables y explicar por qué corregir o sustituir recursos no resuelve el problema.');
    for (const search of report.searches || []) evidence([search]);
    if (['duplicate_topic', 'editorial_saturation'].includes(report.verdict) && !report.relatedPublications?.length && !day.attempt.preflight?.matches?.length) throw new Error('El rechazo por originalidad debe señalar publicaciones relacionadas.');
  }
}

function processReview() {
  if (![reviewFile, reviewExecutionFile].every(existsSync)) throw new Error('Falta revisión factual independiente y su completion real.');
  const context = json(contextPath), round = day.attempt.rounds.at(-1);
  if (!round) throw new Error('Primero congelar con --candidate o --review.');
  const input = round.phase === 'candidate' ? json(resolve(reviewDirectory, 'candidate-input.json')) : currentReviewInput();
  if (digest(JSON.stringify(input)) !== digest(JSON.stringify(round.input))) throw new Error('El snapshot del candidato o de la nota cambió después de congelarse; no coincide con el digest persistido.');
  const report = json(reviewFile), execution = validateNativeExecution(json(reviewExecutionFile), context.selection);
  metrics.native('reviewer', execution);
  if (execution.forkTurns !== 'none' || report.contentDigest !== input.contentDigest || round.input.contentDigest !== input.contentDigest || report.date !== date || (round.phase === 'candidate' ? report.candidateId !== input.candidate.id : report.slug !== input.note.slug)) throw new Error('Informe/ejecutor no correspondiente al snapshot vigente.');
  day.pinAgents(input.authorExecution, execution);
  if (round.phase === 'article') rememberReview(readReviewJournal());
  const contractIssues = reviewContractIssues(input, report, round.phase === 'article' ? readReviewJournal() : []);
  if (contractIssues.length) throw new Error(`Contrato de revisión incompleto:\n${contractIssues.join('\n')}`);
  if (round.viabilityOnly && report.verdict === 'approved') throw new Error('Una evaluación viabilityOnly sin avances no permite aprobar; corregir y volver a --review.');
  if (report.verdict === 'approved') {
    if (round.phase === 'candidate') {
      validateCandidateCorrections(input, report, day.attempt.rounds);
      validateOriginalityReview(input, report, { history: input.history, policy: input.policy, candidate: input.candidate, preflight: input.preflight });
    }
    else validateEditorialQuality(input, report, execution, readReviewJournal());
  } else validateAdverseReport(input, report);
  day.record(report, execution);
  printStatus();
}

function archiveAttempt() {
  if (!REPLACEMENT_VERDICTS.includes(day.value.status)) throw new Error('Primero obtener un rechazo de candidato; changes_required exige correcciones.');
  const destination = resolve(day.attemptDirectory, 'archive');
  mkdirSync(destination, { recursive: true });
  // Only uncommitted files of this new candidate may be withdrawn. Never reset
  // a worktree, historical note or remotely published commit to choose Plan B.
  const draftPath = resolve(reviewDirectory, 'draft.json');
  const draft = existsSync(draftPath) ? json(draftPath) : null;
  if (draft) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug || '')) throw new Error('Slug de intento inválido.');
    const notePath = `src/data/editorials/${draft.slug}.json`;
    if (spawnSync('git', ['cat-file', '-e', `origin/main:${notePath}`], { cwd: work, stdio: 'ignore' }).status === 0 || spawnSync('git', ['cat-file', '-e', `origin/main:reports/daily-editorial/${date}.json`], { cwd: work, stdio: 'ignore' }).status === 0) throw new Error('No se archiva ni retira una nota ya publicada en main.');
    if (spawnSync('git', ['cat-file', '-e', `HEAD:${notePath}`], { cwd: work, stdio: 'ignore' }).status === 0) {
      // A failed fast-forward push/revalidation can leave our own unpublished
      // commits. Preserve their exact history, then make only this preparation
      // untracked again; mixed reset retains every working file.
      const common = git('merge-base', 'HEAD', 'origin/main');
      assertPublicationScope(changes(common), draft.slug, date);
      const bookmark = `refs/cineposta-daily/${date}/${day.attempt.id}`;
      const sha = git('rev-parse', 'HEAD');
      git('update-ref', bookmark, sha);
      day.attempt.localHistory = { bookmark, sha, base: common }; day.save();
      git('reset', '--mixed', common);
      const context = json(contextPath); context.base = common; writeFileSync(contextPath, JSON.stringify(context, null, 2));
    }
    assertPublicationScope(changes(json(contextPath).base), draft.slug, date);
    cpSync(resolve(work, notePath), resolve(destination, 'note.json'));
    if (existsSync(resolve(work, `public/assets/editorial/${draft.slug}`))) cpSync(resolve(work, `public/assets/editorial/${draft.slug}`), resolve(destination, 'assets'), { recursive: true });
  }
  cpSync(reviewDirectory, resolve(destination, 'research'), { recursive: true });
  if (existsSync(proofPath)) cpSync(proofPath, resolve(destination, 'technical-proof.json'));
  const preparedReceipt = resolve(work, `reports/daily-editorial/${date}.json`);
  if (existsSync(preparedReceipt)) {
    cpSync(preparedReceipt, resolve(destination, 'prepared-receipt.json'));
    const { editorialJourney: previousJourney, ...ownReceipt } = json(preparedReceipt);
    writeFileSync(resolve(destination, 'prepared-validation.json'), JSON.stringify({ ...ownReceipt, journeyDigest: digest(JSON.stringify(previousJourney)) }));
  }
  const manifest = [], documents = {};
  const walk = (directory, prefix = '') => {
    for (const name of readdirSync(directory).sort()) {
      const path = resolve(directory, name), relative = `${prefix}${name}`, stat = lstatSync(path);
      if (stat.isSymbolicLink()) throw new Error('No archivar enlaces simbólicos en la investigación.');
      if (stat.isDirectory()) walk(path, `${relative}/`);
      else {
        const bytes = readFileSync(path);
        manifest.push({ path: relative, sha256: digest(bytes), bytes: bytes.length });
        // The complete receipt bytes stay archived locally; avoid embedding
        // previous journeys recursively inside the next versioned receipt.
        if (/\.(?:json|md|txt)$/.test(name) && relative !== 'prepared-receipt.json') documents[relative] = bytes.toString('utf8');
      }
    }
  };
  walk(destination);
  day.replace({ directory: destination, manifest, documents, slug: draft?.slug ?? null });
  finishSwitch();
}

function finishSwitch() {
  if (day.value.status !== 'switching_topic' || !day.attempt.archive?.manifest?.length) throw new Error('No hay cambio de tema archivado para recuperar.');
  const { slug } = day.attempt.archive;
  const archive = day.attempt.archive;
  if (archive.directory !== resolve(day.attemptDirectory, 'archive')) throw new Error('Archivo fuera del intento activo; conservar originales.');
  for (const item of archive.manifest) {
    const target = resolve(archive.directory, item.path);
    if (!target.startsWith(`${archive.directory}${sep}`)) throw new Error('Ruta de archivo inválida; conservar originales.');
    const matches = path => existsSync(path) && lstatSync(path).isFile() && !lstatSync(path).isSymbolicLink() && readFileSync(path).length === item.bytes && digest(readFileSync(path)) === item.sha256;
    if (!matches(target)) {
      const source = item.path.startsWith('research/') ? resolve(reviewDirectory, item.path.slice(9))
        : item.path.startsWith('assets/') && slug ? resolve(work, `public/assets/editorial/${slug}`, item.path.slice(7))
          : item.path === 'note.json' && slug ? resolve(work, `src/data/editorials/${slug}.json`)
            : item.path === 'technical-proof.json' ? proofPath
              : item.path === 'prepared-receipt.json' ? resolve(work, `reports/daily-editorial/${date}.json`) : null;
      if (!source || !matches(source)) throw new Error(`Archivo incompleto/alterado ${item.path}; originales conservados, recuperar antes de reemplazar.`);
      mkdirSync(dirname(target), { recursive: true }); cpSync(source, target);
    }
  }
  const receipt = `reports/daily-editorial/${date}.json`;
  if (spawnSync('git', ['cat-file', '-e', `HEAD:${receipt}`], { cwd: work, stdio: 'ignore' }).status === 0) throw new Error('No se reemplaza una jornada ya incluida en un commit.');
  if (slug) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || spawnSync('git', ['cat-file', '-e', `HEAD:src/data/editorials/${slug}.json`], { cwd: work, stdio: 'ignore' }).status === 0) throw new Error('No se retira una nota histórica o comprometida.');
    rmSync(resolve(work, `src/data/editorials/${slug}.json`), { force: true });
    rmSync(resolve(work, `public/assets/editorial/${slug}`), { recursive: true, force: true });
  }
  rmSync(resolve(work, receipt), { force: true });
  rmSync(reviewDirectory, { recursive: true, force: true });
  mkdirSync(reviewDirectory, { recursive: true });
  rmSync(proofPath, { force: true });
  git('merge', '--ff-only', 'origin/main');
  const context = json(contextPath); context.base = git('rev-parse', 'origin/main'); writeFileSync(contextPath, JSON.stringify(context, null, 2));
  day.newAttempt();
  const history = historyAt(mainHead);
  writeFileSync(resolve(reviewDirectory, 'published.json'), `${JSON.stringify(history, null, 2)}\n`);
  printStatus();
}

function rememberReview(history) {
  if (!existsSync(reviewFile)) return history;
  if (!json(reviewFile).slug && json(reviewFile).candidateId) return history; // Candidate rounds never mix with article findings.
  const entry = { input: json(reviewInputFile), report: json(reviewFile), execution: existsSync(reviewExecutionFile) ? json(reviewExecutionFile) : null };
  if (!history.some(previous => digest(JSON.stringify(previous)) === digest(JSON.stringify(entry)))) {
    history.push(entry);
    writeReviewJournal(history);
  }
  return history;
}

function currentReviewInput() {
  const context = json(contextPath);
  const author = validateNativeExecution(json(context.executionFile), context.selection);
  metrics.native('author', author);
  const pinned = day.value.agents.author;
  if (author.forkTurns !== 'none' || (pinned && (pinned.agentId !== author.agentId || pinned.model !== author.model || pinned.effort !== author.effort))) throw new Error('Reutilizar el mismo agente author y selección real, fork_turns none, durante la jornada.');
  const draft = json(resolve(reviewDirectory, 'draft.json'));
  if (!day.attempt.candidateApproved || digest(JSON.stringify(draft.candidate)) !== digest(JSON.stringify(day.attempt.candidate))) throw new Error('El borrador debe conservar el candidato comprobado y aprobado; no cambiar de noticia al corregir.');
  const history = historyAt(mainHead);
  if (draft.originalityContext?.history?.digest !== history.digest || digest(JSON.stringify(draft.originalityContext?.policy)) !== digest(JSON.stringify(policy()))) throw new Error('El historial o política cambió o falta el preflight completo: ejecutar --review y nueva auditoría.');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug || '')) throw new Error('Slug de revisión inválido.');
  const note = json(resolve(work, `src/data/editorials/${draft.slug}.json`));
  validateDraft(note, draft, [], [], date); // Basic contract before freezing; never editorial approval.
  const assets = snapshotEditorialAssets(note, path => {
    if (!lstatSync(resolve(work, 'public', path)).isFile()) throw new Error('Asset de revisión no regular.');
    return readFileSync(resolve(work, 'public', path));
  });
  return reviewInput(note, draft, assets, author);
}

function requireEditorialReview() {
  if (![reviewInputFile, reviewFile, reviewExecutionFile, reviewHistoryFile].every(existsSync)) throw new Error('Falta revisión factual independiente: ejecutar --review y el segundo Luna Max antes de validar/publicar.');
  const history = rememberReview(readReviewJournal());
  const input = currentReviewInput();
  if (json(reviewInputFile).contentDigest !== input.contentDigest) throw new Error('La preparación cambió: necesita --review y una nueva revisión independiente.');
  // Record observed negative findings before checking verdict; overwriting an
  // adverse report with an older approval cannot erase a material contradiction.
  const report = json(reviewFile);
  if (report.date !== input.note.date || report.slug !== input.note.slug) throw new Error('Revisión correspondiente a otra publicación.');
  const execution = validateNativeExecution(json(reviewExecutionFile), json(contextPath).selection);
  day.pinAgents(input.authorExecution, execution);
  if (day.attempt.rounds.at(-1)?.viabilityOnly && report.verdict === 'approved') throw new Error('Una evaluación viabilityOnly no habilita publicación; corregir y volver a --review.');
  if (report.verdict !== 'approved') {
    validateAdverseReport(input, report);
    day.record(report, execution);
    throw new Error(`Revisión ${report.verdict}: continuar con ${day.summary().nextAction}; no cancelar la jornada.`);
  }
  const quality = validateEditorialQuality(input, report, execution, history);
  day.record(report, execution);
  if (day.value.status !== 'approved') throw new Error('Falta estado aprobado de la preparación final.');
  return quality;
}

function prepareEditorialReview(viabilityOnly = false) {
  rememberReview(readReviewJournal());
  const draftPath = resolve(reviewDirectory, 'draft.json');
  const draft = json(draftPath), fullHistory = historyAt(mainHead), configuredPolicy = policy();
  const candidate = day.attempt.candidate;
  if (!candidate) throw new Error('Primero --candidate y auditoría independiente de originalidad.');
  draft.originalityContext = { history: fullHistory, historyRef: mainHead, policy: configuredPolicy, candidate, preflight: preflightCandidate(candidate, fullHistory, configuredPolicy, date) };
  writeFileSync(draftPath, `${JSON.stringify(draft, null, 2)}\n`);
  const input = currentReviewInput();
  validateDailySocial(input.note, input.draft);
  if (!viabilityOnly && day.attempt.status === 'approved' && day.attempt.rounds.at(-1)?.input.contentDigest === input.contentDigest) {
    requireEditorialReview(); // Recheck both executions, history and all findings.
    printStatus();
    return;
  }
  const round = day.freeze(input, 'article', { viabilityOnly });
  installReviewPacket(round);
  log(JSON.stringify({ contentDigest: input.contentDigest, reviewInputFile, reviewFile, reviewExecutionFile, selection: json(contextPath).selection, viabilityOnly }));
}

async function inspectDraft(base) {
  const draft = json(resolve(work, '.tmp/cineposta-daily/draft.json'));
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug || '')) throw new Error('Slug de preparación inválido.');
  const notePath = `src/data/editorials/${draft.slug}.json`;
  const note = json(resolve(work, notePath));
  validateDailySocial(note, draft);
  const oldFiles = git('ls-tree', '-r', '--name-only', base, '--', 'src/data/editorials').split('\n').filter(file => file.endsWith('.json'));
  const previous = oldFiles.map(file => JSON.parse(git('show', `${base}:${file}`)));
  const receipts = git('ls-tree', '-r', '--name-only', base, '--', 'reports/daily-editorial').split('\n').filter(file => file.endsWith('.json')).map(file => JSON.parse(git('show', `${base}:${file}`)));
  const counts = validateDraft(note, draft, previous, receipts, date);
  editorialPostPlan(note, draft.tweet); // Reuse Buffer's copy/URL/hashtag/X validation.
  const sharp = createRequire(resolve(work, 'package.json'))('sharp');
  let bytes = 0;
  const referenced = new Set();
  for (const image of new Map([note.cover, ...note.content.filter(block => block.type === 'image')].map(image => [image.src, image])).values()) {
    for (const [path, width, height] of [[image.src, image.width, image.height], [image.srcSmall]]) {
      if (!new RegExp(`^assets/editorial/${note.slug}/[a-z0-9-]+\\.webp$`).test(path)) throw new Error('Ruta de imagen fuera de la nota.');
      if (!lstatSync(resolve(work, 'public', path)).isFile()) throw new Error('No se permiten symlinks ni archivos especiales como imágenes.');
      referenced.add(`public/${path}`);
      const buffer = readFileSync(resolve(work, 'public', path));
      bytes += buffer.length;
      const metadata = await sharp(buffer).metadata();
      await sharp(buffer).stats();
      if (metadata.format !== 'webp' || (width && (metadata.width !== width || metadata.height !== height || width <= 640 || width > 1280)) || (!width && metadata.width !== 640) || buffer.length > 400_000) throw new Error(`Imagen inválida o demasiado pesada: ${path}`);
      if (!width && Math.abs(metadata.width / metadata.height - image.width / image.height) > 0.01) throw new Error(`La variante responsive cambió la proporción: ${path}`);
    }
  }
  if (changes(base).some(item => item.path.startsWith('public/') && !referenced.has(item.path))) throw new Error('Hay assets nuevos que no usa la nota.');
  if (bytes > 2_500_000) throw new Error('Las imágenes de la nota superan 2,5 MB.');
  // Sources were read by Luna, and must still be reachable before publishing.
  for (const source of note.sources) {
    run('curl', [...httpsArgs, '--output', '/dev/null', source.url]);
  }
  return { draft, note, counts };
}

async function validate(base) {
  // A failed revalidation invalidates older evidence even when bytes did not change.
  writeFileSync(proofPath, `${JSON.stringify({ date, base, valid: false }, null, 2)}\n`);
  const quality = requireEditorialReview();
  const execution = quality.record.authorExecution;
  const { draft, note, counts } = await inspectDraft(base);
  for (const url of quality.evidenceUrls.filter(url => !note.sources.some(source => source.url === url))) run('curl', [...httpsArgs, '--output', '/dev/null', url]);
  assertPublicationScope(changes(base), note.slug, date);
  const inputDigest = validationInputDigest(work, date);
  const stages = new EditorialValidationStages({ directory: state, date, worktree: work, metrics });
  stages.run('content-astro', digest(JSON.stringify({ inputDigest, base })), () => {
    run('npm', ['run', 'validate:content', '--', '--base', base, '--astro-check', '--skip-build']);
  });
  // Preserve every check in validate-content's build branch. A failed browser
  // run does not erase an approved, byte-identical build and its output audits.
  stages.run('build', inputDigest, () => {
    run('npm', ['run', 'build']);
    run('npm', ['run', 'audit:profile-originality', '--', '--require-dist']);
    run('npm', ['run', 'validate:public-output']);
    run('npm', ['run', 'validate:sitemap-indexability']);
  }, { artifact: resolve(work, 'dist') });
  const endBrowsers = metrics.start('playwright');
  try {
    // Same mandatory suite, timeouts and workers; use the project's existing
    // CI retry/trace policy from the first attempt, not after losing a build.
    const result = spawnSync('npx', ['playwright', 'test', 'tests/e2e/editorial.spec.ts', 'tests/e2e/daily-editorial.spec.ts', '--project=desktop-chromium', '--project=mobile-chromium', '--workers=2'], { cwd: work, env: { ...process.env, CI: 'true' }, stdio: 'inherit' });
    if (result.status !== 0) throw new Error('Playwright falló; conservar diagnóstico y corregir o revalidar, sin repetir builds intactos.');
    endBrowsers('passed');
  } catch (error) { endBrowsers('failed'); throw error; }
  finally { const directory = stages.preserveBrowserArtifacts(); if (directory) log(`Artefactos de navegador conservados: ${directory}`); }
  if (validationInputDigest(work, date) !== inputDigest || buildArtifactDigest(resolve(work, 'dist')) !== stages.value.stages.build.outputDigest) throw new Error('Las entradas o el build cambiaron durante los tests; no se reutiliza esa evidencia.');
  if (argentinaDate() !== date) throw new Error('Cambió la fecha argentina; no se publica una nota fechada ayer.');
  const receiptPath = `reports/daily-editorial/${date}.json`;
  mkdirSync(resolve(work, 'reports/daily-editorial'), { recursive: true });
  writeFileSync(resolve(work, receiptPath), `${JSON.stringify({
    date, slug: note.slug, topicKey: draft.topicKey, title: note.title,
    execution, tweet: draft.tweet, decision: draft.decision, sourceChecks: draft.sourceChecks, imageChecks: draft.imageChecks,
    editorialReview: quality.record,
    editorialJourney: day.value,
    validation: { ...counts, content: 'passed', astroCheck: 'passed', build: 'passed', desktopAndMobile: 'passed' },
    validationMetrics: { stages: metrics.summary().stages, native: metrics.summary().native },
    url: `https://www.cineposta.com.ar/editorial/${note.slug}/`,
  }, null, 2)}\n`);
  assertPublicationScope(changes(base), note.slug, date);
  if (requireEditorialReview().reviewProof !== quality.reviewProof) throw new Error('La revisión o la preparación cambió durante los tests; revalidar.');
  const proof = { date, base, slug: note.slug, execution, reviewProof: quality.reviewProof, valid: true, files: fingerprint(changes(base).map(item => item.path)) };
  writeFileSync(proofPath, `${JSON.stringify(proof, null, 2)}\n`);
  return proof;
}

async function verify(sha, receipt) {
  // Bounded checks run in the foreground; repeat --verify after deployment errors.
  const deadline = Date.now() + config.deployTimeoutMinutes * 60_000;
  let runUrl;
  while (Date.now() < deadline) {
    const runs = JSON.parse(run('gh', ['api', `repos/${config.repository}/actions/workflows/deploy.yml/runs?head_sha=${sha}&per_page=10`], root, true)).workflow_runs;
    const current = runs.find(item => item.head_sha === sha && ['push', 'workflow_dispatch'].includes(item.event));
    if (current) {
      runUrl = current.html_url;
      if (current.status === 'completed') {
        if (current.conclusion !== 'success') throw new Error(`Pages ${current.conclusion}: ${runUrl}. Reejecutar deploy, no generar otra nota.`);
        let html = '';
        try { html = run('curl', [...httpsArgs, '--header', 'Cache-Control: no-cache', receipt.url], root, true); } catch { /* CDN may still be propagating; bounded retry below. */ }
        if (html.includes(receipt.slug) && html.includes(`datetime="${receipt.date}"`)) {
          log(`Pages verificado: ${receipt.url} | ${runUrl}`);
          return;
        }
      }
    }
    log(`Pages pendiente${runUrl ? `: ${runUrl}` : ''}. La nota ya está en main; no se vuelve a generar.`);
    await new Promise(resolve => setTimeout(resolve, 20_000));
  }
  throw new Error(`No se confirmó Pages en ${config.deployTimeoutMinutes} minutos. Nota conservada en main. Revisar ${runUrl || 'Actions'} y usar --verify.`);
}

async function publishTweet(slug, reviewStatus) {
  requireReviewedForSocial(reviewStatus);
  const requestId = randomUUID();
  run('gh', ['workflow', 'run', 'publish-buffer-editorial-x.yml', '--repo', config.repository, '--ref', 'main', '-f', `slug=${slug}`, '-f', 'mode=publish-now', '-f', `request_id=${requestId}`], root);
  const deadline = Date.now() + 8 * 60_000;
  while (Date.now() < deadline) {
    const runs = JSON.parse(run('gh', ['api', `repos/${config.repository}/actions/workflows/publish-buffer-editorial-x.yml/runs?event=workflow_dispatch&per_page=20`], root, true)).workflow_runs;
    const current = runs.find(item => item.display_title.includes(requestId));
    if (current) {
      log(`Buffer: ${current.status} | ${current.html_url}`);
      if (current.status === 'completed') {
        if (current.conclusion !== 'success') throw new Error(`La nota sigue publicada; Buffer ${current.conclusion}: ${current.html_url}. Reintentar sólo --tweet.`);
        log(`Tweet verificado por Buffer: ${current.html_url}. Comprobante persistido en reports/buffer-editorial/${slug}.json.`);
        return;
      }
    }
    await new Promise(resolve => setTimeout(resolve, 10_000));
  }
  throw new Error('La nota sigue publicada. Buffer no confirmó el envío dentro de 8 minutos; consultar el run antes de reintentar sólo --tweet.');
}

const lock = resolve(state, 'lock');
// Status is a read-only diagnostic, including while a live validation owns the
// mutation lock. Never fetch, recover journals, create a day or rewrite context.
if (mode === '--status') {
  if (!existsSync(resolve(state, `${date}-session.json`))) throw new Error('No hay checkpoint local de hoy; --status no crea una jornada.');
  day = new EditorialDay(state, date);
  const ownerPath = resolve(lock, 'owner.json'), owner = existsSync(ownerPath) ? json(ownerPath) : null;
  const pendingReport = day.value.status === 'reviewing' && [reviewFile, reviewExecutionFile].every(existsSync);
  log(JSON.stringify({ ...(existsSync(contextPath) ? json(contextPath) : {}), ...day.summary(), ...(pendingReport ? { nextAction: 'record_review' } : {}),
    validationCommand: existsSync(proofPath) ? '--revalidate' : '--dry-run',
    phaseSince: day.value.events.at(-1)?.at, phaseElapsedMs: Math.max(0, Date.now() - Date.parse(day.value.events.at(-1)?.at)),
    activeExecution: owner ? { ...owner, running: owner.host === hostname() ? processStart(owner.pid) === owner.processStart : null } : null,
    metrics: readEditorialMetrics(resolve(state, `${date}-metrics.jsonl`)) }));
  process.exit(0);
}
mkdirSync(state, { recursive: true });
metrics = new EditorialMetrics(state, date);
const endInvocation = metrics.start(mode.slice(2));
process.on('exit', code => endInvocation(code === 0 ? 'passed' : 'failed'));
try { mkdirSync(lock); } catch {
  const ownerPath = resolve(lock, 'owner.json'), owner = existsSync(ownerPath) ? json(ownerPath) : null;
  if (!owner || owner.host !== hostname() || processStart(owner.pid) === owner.processStart) throw new Error(`Otra ejecución usa ${lock}, o no se puede acreditar que su lock esté huérfano.`);
  renameSync(lock, `${lock}.interrupted-${randomUUID()}`);
  mkdirSync(lock);
}
writeFileSync(resolve(lock, 'owner.json'), JSON.stringify({ pid: process.pid, host: hostname(), processStart: processStart(process.pid), startedAt: new Date().toISOString() }));
try {
  {
    run('git', ['fetch', 'origin', 'main'], root);
    const head = run('git', ['rev-parse', 'origin/main'], root, true);
    mainHead = head;
    const publishedRaw = spawnSync('git', ['show', `${head}:reports/daily-editorial/${date}.json`], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    if (publishedRaw.status === 0) {
      const published = JSON.parse(publishedRaw.stdout);
      let publishedReviewStatus;
      if (['--publish', '--verify', '--tweet'].includes(mode)) {
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(published.slug || '')) throw new Error('Slug publicado inválido.');
        const fromGit = path => execFileSync('git', ['show', `${head}:${path}`], { cwd: root, maxBuffer: 20 * 1024 * 1024 });
        const note = JSON.parse(fromGit(`src/data/editorials/${published.slug}.json`).toString('utf8'));
        const assets = published.editorialReview ? snapshotEditorialAssets(note, path => fromGit(`public/${path}`)) : {};
        const legacyPath = resolve(root, 'config/editorial-review-legacy.json');
        publishedReviewStatus = validateStoredEditorialReview(published, note, assets, existsSync(legacyPath) ? json(legacyPath) : {});
      }
      log(`Ya existe la nota de hoy: ${published.url}. No se consume otro turno editorial.`);
      if (existsSync(resolve(state, `${date}-session.json`))) {
        const previousDay = new EditorialDay(state, date);
        if (previousDay.value.status === 'approved') previousDay.published(published, run('git', ['log', '-1', '--format=%H', head, '--', `reports/daily-editorial/${date}.json`], root, true));
      }
      if (mode === '--publish' || mode === '--verify') {
        const commit = run('git', ['log', '-1', '--format=%H', head, '--', `reports/daily-editorial/${date}.json`], root, true);
        await metrics.measure('pages', () => verify(commit, published));
      }
      if (mode === '--publish' || mode === '--tweet') await metrics.measure('buffer', () => publishTweet(published.slug, publishedReviewStatus));
    } else if (mode === '--verify') {
      throw new Error('No existe una publicación diaria de hoy en main.');
    } else if (mode === '--tweet') {
      throw new Error('No existe una nota diaria publicada hoy para enviar a X.');
    } else {
      if (mode !== '--prepare' && (!existsSync(work) || !existsSync(contextPath))) throw new Error('Primero ejecutar --prepare y el ejecutor editorial nativo.');
      day = new EditorialDay(state, date);
      if (mode === '--prepare') {
        const catalog = json(resolve(state, 'native-catalog.json'));
        if (argentinaDate(new Date(catalog.observedAt)) !== date) throw new Error('Actualizar el catálogo desde la herramienta nativa de este run.');
        const selection = selectNativeLuna(catalog.models);
        if (!existsSync(work)) {
          if (existsSync(contextPath) || day.attempt.candidate || day.value.attempts.length > 1) throw new Error('Falta el worktree de una jornada previa; conservar el checkpoint y recuperar el entorno, no reiniciar la redacción.');
          run('git', ['worktree', 'add', '--detach', work, head], root);
        }
        mkdirSync(reviewDirectory, { recursive: true });
        if (!existsSync(contextPath)) {
          if (git('status', '--porcelain')) throw new Error('Worktree previo sin contexto y con cambios: conservar y diagnosticar, no sobrescribir.');
          const context = { date, base: git('rev-parse', 'HEAD'), worktree: work, selection, availableModels: catalog.models, executionFile: resolve(reviewDirectory, 'native-execution.json') };
          writeFileSync(contextPath, JSON.stringify(context, null, 2));
        } else if (JSON.stringify(json(contextPath).selection) !== JSON.stringify(selection)) throw new Error('La selección Luna anunciada cambió durante la jornada; preservar los agentes y el checkpoint para resolver compatibilidad sin cambiar silenciosamente.');
        const ready = resolve(state, `${date}-dependencies-ready`);
        if (!existsSync(ready)) {
          run('npm', ['ci']); run('npx', ['playwright', 'install', 'chromium']);
          writeFileSync(ready, 'ready\n');
        }
        if (day.value.status === 'switching_topic') finishSwitch();
        if (day.value.status === 'reviewing') installReviewPacket(day.attempt.rounds.at(-1));
        const fullHistory = historyAt(head);
        writeFileSync(resolve(reviewDirectory, 'published.json'), `${JSON.stringify(fullHistory, null, 2)}\n`);
        writeFileSync(resolve(reviewDirectory, 'published-brief.json'), `${JSON.stringify(compactEditorialHistory(fullHistory))}\n`);
        printStatus();
        process.exitCode = 0;
      } else if (mode === '--status') {
        printStatus();
      } else if (mode === '--candidate') {
        candidateReview();
      } else if (mode === '--record-review') {
        processReview();
      } else if (mode === '--revise') {
        const plan = resolve(reviewDirectory, 'correction-plan.json');
        day.revise(existsSync(plan) ? json(plan) : null); printStatus();
      } else if (mode === '--switch-topic') {
        if (day.value.status === 'switching_topic') finishSwitch(); else archiveAttempt();
      } else if (mode === '--review') {
        prepareEditorialReview();
      } else if (mode === '--assess-viability') {
        if (day.attempt.rounds.at(-1)?.phase === 'candidate') candidateReview(true); else prepareEditorialReview(true);
      } else {
      let proof;
      if (existsSync(proofPath)) {
        proof = json(proofPath);
        if (mode === '--revalidate') {
          const correctedSlug = json(resolve(work, '.tmp/cineposta-daily/draft.json')).slug;
          if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(correctedSlug || '')) throw new Error('Slug de preparación inválido.');
          assertPublicationScope(changes(proof.base), correctedSlug, date);
          if (head !== proof.base) {
            requireEditorialReview(); // No integration commit before factual clearance.
            git('add', '--', ...changes(proof.base).map(item => item.path));
            if (spawnSync('git', ['diff', '--cached', '--quiet'], { cwd: work }).status !== 0) git('-c', 'user.name=CinePosta editorial', '-c', 'user.email=cineposta-editorial@users.noreply.github.com', 'commit', '-m', `chore(editorial): preparar integración ${date}`);
            git('rebase', 'origin/main');
          }
          proof = await validate(head);
        } else {
          if (!proof.valid) throw new Error('La última validación falló o quedó incompleta. Corregir y usar --revalidate.');
          if (proof.date !== date || JSON.stringify(fingerprint(Object.keys(proof.files))) !== JSON.stringify(proof.files)) throw new Error('La preparación cambió después de validarse. Inspeccionar y usar --revalidate.');
          if (head !== proof.base) throw new Error('main cambió después del dry-run. Usar --revalidate para integrar main y comprobar la misma nota.');
        }
      } else {
        if (!existsSync(contextPath) || !existsSync(work)) throw new Error('Primero ejecutar --prepare y el ejecutor editorial nativo.');
        const context = json(contextPath);
        if (context.base !== head) {
          git('merge', '--ff-only', 'origin/main');
          context.base = head;
          writeFileSync(contextPath, JSON.stringify(context, null, 2));
        }
        proof = await validate(head);
      }
      if (requireEditorialReview().reviewProof !== proof.reviewProof) throw new Error('La revisión editorial cambió después del gate; revalidar antes del commit.');
      // Also enforce on an unpublished preparation with an older saved proof.
      // Published receipts keep their original audit and idempotent recovery.
      const socialInput = currentReviewInput();
      validateDailySocial(socialInput.note, socialInput.draft, json(reviewFile));
      if (mode === '--dry-run' || mode === '--revalidate') {
        log(`Simulación real completa aprobada. No hubo push. Publicar la misma preparación con --publish. Worktree: ${work}`);
      } else {
        assertPublicationScope(changes(proof.base), proof.slug, date);
        git('add', '--', ...Object.keys(proof.files));
        if (spawnSync('git', ['diff', '--cached', '--quiet'], { cwd: work }).status !== 0) git('-c', 'user.name=CinePosta editorial', '-c', 'user.email=cineposta-editorial@users.noreply.github.com', 'commit', '-m', `feat(editorial): nota diaria ${date}`);
        git('fetch', 'origin', 'main');
        // A concurrent daily publisher must not create a second publication.
        if (spawnSync('git', ['cat-file', '-e', `origin/main:reports/daily-editorial/${date}.json`], { cwd: work, stdio: 'ignore' }).status === 0) throw new Error('Otra ejecución publicó este día. Se conserva la preparación, sin segundo push.');
        const remote = git('rev-parse', 'origin/main');
        mainHead = remote;
        if (remote !== proof.base) {
          requireEditorialReview(); // Newly fetched editorials require a fresh independent review before integration.
          git('rebase', 'origin/main');
          // Revalidate merged inputs; a previous build does not prove the new tree.
          const { draft, note } = await inspectDraft(remote);
          if (requireEditorialReview().reviewProof !== proof.reviewProof) throw new Error('El rebase cambió la preparación revisada; no se publica.');
          if (draft.slug !== proof.slug || note.date !== date) throw new Error('La preparación cambió al integrar main.');
          run('npm', ['run', 'validate:content', '--', '--base', remote, '--astro-check']);
          run('npx', ['playwright', 'test', 'tests/e2e/editorial.spec.ts', 'tests/e2e/daily-editorial.spec.ts', '--project=desktop-chromium', '--project=mobile-chromium', '--workers=2']);
        }
        if (argentinaDate() !== date) throw new Error('Cambió la fecha argentina antes del push.');
        if (git('status', '--porcelain')) throw new Error('El worktree cambió durante las validaciones.');
        if (requireEditorialReview().reviewProof !== proof.reviewProof) throw new Error('Revisión factual obsoleta antes del push.');
        // Normal fast-forward push is the cross-machine compare-and-swap. Never force.
        git('push', 'origin', 'HEAD:main');
        const sha = git('rev-parse', 'HEAD');
        if (run('git', ['ls-remote', 'origin', 'refs/heads/main'], root, true).split(/\s/)[0] !== sha) throw new Error('No se confirmó el SHA publicado en main; revisar concurrencia.');
        log(`Push confirmado: ${sha}`);
        day.published(json(resolve(work, `reports/daily-editorial/${date}.json`)), sha);
        // GITHUB_TOKEN pushes do not trigger a push workflow. Dispatch is explicit.
        if (process.env.GITHUB_ACTIONS === 'true') run('gh', ['api', `repos/${config.repository}/actions/workflows/deploy.yml/dispatches`, '--method', 'POST', '--field', 'ref=main'], root);
        await metrics.measure('pages', () => verify(sha, json(resolve(work, `reports/daily-editorial/${date}.json`))));
        const evidenceDirectory = resolve(state, `${date}-publication-evidence-${sha.slice(0, 12)}`);
        if (!existsSync(evidenceDirectory)) cpSync(reviewDirectory, evidenceDirectory, { recursive: true, errorOnExist: true, force: false });
        run('git', ['worktree', 'remove', work], root);
        rmSync(proofPath);
        await metrics.measure('buffer', () => publishTweet(proof.slug, 'reviewed'));
      }
    }
    }
  }
} finally { rmSync(lock, { recursive: true, force: true }); }
