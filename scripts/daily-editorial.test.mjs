import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, chmodSync, mkdirSync, cpSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { selectNativeLuna, validateNativeExecution } from './lib/cineposta-luna.mjs';
import { argentinaDate, canonicalSource, validateDraft, assertPublicationScope } from './lib/daily-editorial-policy.mjs';
import { addQualityFixture, approveQualityFixture, approveOriginalityFixture } from './test-helpers/editorial-quality-fixture.mjs';

const model = (name, reasoningEfforts = ['medium', 'max']) => ({ model: name, reasoningEfforts });

test('native catalog fixtures: latest numeric Luna is selected and other families are excluded', () => {
  assert.deepEqual(selectNativeLuna([model('gpt-6-luna'), model('gpt-6.9-luna'), model('gpt-6.10-luna'), model('gpt-99-sol')]), { model: 'gpt-6.10-luna', effort: 'max' });
  assert.throws(() => selectNativeLuna([model('gpt-6-sol')]), /no anuncia/);
  assert.throws(() => selectNativeLuna([model('gpt-6-luna'), model('gpt-6.1-luna', ['medium'])]), /no admite Max/);
  assert.throws(() => selectNativeLuna([model('gpt-6-luna-preview')]), /no anuncia/);
});
test('native execution evidence: requested model/effort and completed probe/author are mandatory', () => {
  const selection = { model: 'gpt-6-luna', effort: 'max' };
  const evidence = { ...selection, provider: 'codex-native', status: 'completed', probe: 'passed', agentId: 'fixture-agent' };
  assert.deepEqual(validateNativeExecution(evidence, selection), evidence);
  for (const changed of [{ model: 'gpt-6-sol' }, { effort: 'medium' }, { status: 'failed' }, { probe: 'failed' }, { provider: 'external' }, { agentId: '' }]) assert.throws(() => validateNativeExecution({ ...evidence, ...changed }, selection), /Falta evidencia/);
});
test('Argentina calendar boundary and source canonicalization', () => {
  assert.equal(argentinaDate(new Date('2026-11-10T02:59:59Z')), '2026-11-09');
  assert.equal(argentinaDate(new Date('2026-11-10T03:00:00Z')), '2026-11-10');
  assert.equal(canonicalSource('https://www.example.org/story/?utm_source=feed#top'), 'example.org/story');
  assert.throws(() => canonicalSource('http://example.org/story'), /HTTPS/);
});

function fixture() {
  const date = '2026-11-09', slug = 'festival-hecho-nuevo';
  const image = i => ({ type: 'image', src: `assets/editorial/${slug}/imagen-${i}.webp`, srcSmall: `assets/editorial/${slug}/imagen-${i}-640.webp`, source: `https://festival.example/image-${i}`, width: 1280, height: 720, alt: 'Imagen comprobada del festival de cine' });
  const note = { date, slug, title: 'Un hecho nuevo del festival', excerpt: 'Un anuncio cinematográfico original del festival.', author: 'CinePosta', type: 'nota', spoilers: false, cover: image(0), sources: [{ label: 'Festival', url: 'https://festival.example/news' }, { label: 'Medio', url: 'https://news.example/cinema' }], content: [{ type: 'paragraph', text: Array(950).fill('cine').join(' ') }, ...[0, 1, 2, 3].map(image)] };
  const draft = { date, slug, topicKey: 'festival-edicion-anuncio', decision: 'Un anuncio nuevo con valor cinematográfico.', sourceChecks: note.sources.map((source, i) => ({ url: source.url, role: i === 0 ? 'primary' : 'secondary', checkedOn: date, facts: 'Hecho comprobado en la fuente abierta con información independiente.' })), imageChecks: [0, 1, 2, 3].map(i => ({ src: image(i).src, sourceUrl: image(i).source, checkedOn: date, description: 'Inspección visual del original y relación con el texto.' })) };
  draft.tweet = `La distribución también cuenta: este estreno invita a mirar cómo se organiza el encuentro con el público. https://www.cineposta.com.ar/editorial/${slug}/ #Cine`;
  return { date, slug, note, draft };
}
test('draft gate: complete evidence is accepted and invalid dates, sources, images and extent are blocked', () => {
  const { note, draft, date } = fixture();
  const check = (n = note, d = draft) => validateDraft(n, d, [], [], date);
  assert.deepEqual(check(), { words: 950, images: 4 });
  assert.throws(() => check({ ...note, date: '2026-11-10' }), /fecha real/);
  assert.throws(() => check({ ...note, author: 'Leo' }), /informativa/);
  assert.throws(() => check({ ...note, sources: [] }), /primaria abierta/);
  assert.throws(() => check(note, { ...draft, sourceChecks: draft.sourceChecks.slice(1) }), /primaria/);
  assert.throws(() => check(note, { ...draft, imageChecks: [] }), /inspección visual/);
  assert.throws(() => check({ ...note, content: [{ type: 'paragraph', text: 'Texto insuficiente.' }] }), /Extensión/);
});
test('duplicate gate: same day, event, title, slug and reused source pair all block publication', () => {
  const { note, draft, date } = fixture();
  assert.throws(() => validateDraft(note, draft, [], [{ date, topicKey: 'otro' }], date), /ya publicado/);
  assert.throws(() => validateDraft(note, draft, [], [{ date: '2026-11-08', topicKey: draft.topicKey }], date), /ya publicado/);
  assert.throws(() => validateDraft(note, draft, [{ ...note }], [], date), /duplicada/);
  assert.throws(() => validateDraft(note, draft, [{ ...note, slug: 'otro', title: 'Otra cosa' }], [], date), /repetido/);
  assert.throws(() => validateDraft(note, draft, [{ slug: 'otro', title: note.title.toUpperCase(), sources: [] }], [], date), /duplicada/);
});
test('publication gate: only one new note, its own images and same-day receipt may change', () => {
  const { slug, date } = fixture();
  const allowed = [{ status: 'A', path: `src/data/editorials/${slug}.json` }, { status: '??', path: `public/assets/editorial/${slug}/foto.webp` }, { status: 'A', path: `reports/daily-editorial/${date}.json` }];
  assert.doesNotThrow(() => assertPublicationScope(allowed, slug, date));
  for (const invalid of [
    { status: 'M', path: allowed[0].path },
    { status: 'D', path: allowed[1].path },
    { status: 'A', path: 'src/data/editorials/segunda-nota.json' },
    { status: 'M', path: 'src/data/upcomingReleases.generated.ts' },
    { status: '??', path: `public/assets/editorial/${slug}/../foto.webp` },
    { status: 'A', path: 'AGENTS.md' },
  ]) assert.throws(() => assertPublicationScope([...allowed, invalid], slug, date), /fuera del alcance/);
  assert.throws(() => assertPublicationScope(allowed.slice(1), slug, date), /exactamente una/);
});

test('publisher integration with simulated research/builds: dry-run, tamper block, rebase, single atomic push, idempotent recovery', { timeout: 90_000 }, async () => {
  // Everything here is a fixture: no model inference, GitHub call or real article.
  const directory = mkdtempSync(resolve(tmpdir(), 'cineposta-publisher-test-'));
  const repository = resolve(directory, 'repo');
  const candidate = resolve(directory, 'candidate');
  const bin = resolve(directory, 'bin');
  const project = resolve(import.meta.dirname, '..');
  const shell = (command, args, cwd = repository) => execFileSync(command, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  try {
    mkdirSync(repository); mkdirSync(bin); mkdirSync(candidate);
    shell('git', ['init', '--bare', resolve(directory, 'remote.git')]);
    shell('git', ['init', '-b', 'main']);
    shell('git', ['config', 'user.name', 'fixture']); shell('git', ['config', 'user.email', 'fixture@example.org']);
    cpSync(resolve(project, 'scripts/daily-editorial.mjs'), resolve(repository, 'scripts/daily-editorial.mjs'), { recursive: true });
    cpSync(resolve(project, 'scripts/lib'), resolve(repository, 'scripts/lib'), { recursive: true });
    for (const file of ['publish-buffer-editorial-x.mjs', 'publish-buffer-x.mjs', 'buffer-x-availability.mjs']) cpSync(resolve(project, 'scripts', file), resolve(repository, 'scripts', file));
    mkdirSync(resolve(repository, 'config'));
    writeFileSync(resolve(repository, 'config/daily-editorial.json'), JSON.stringify({ repository: 'fixture/test', deployTimeoutMinutes: 0.1 }));
    cpSync(resolve(project, 'config/daily-editorial-diversity.json'), resolve(repository, 'config/daily-editorial-diversity.json'));
    writeFileSync(resolve(repository, 'package.json'), '{"type":"module"}');
    writeFileSync(resolve(repository, '.gitignore'), '.tmp/\nnode_modules/\ndist/\ntest-results/\nplaywright-report/\n');
    mkdirSync(resolve(repository, 'src/data/editorials'), { recursive: true });
    writeFileSync(resolve(repository, 'src/data/editorials/.gitkeep'), '');
    shell('git', ['add', '.']); shell('git', ['commit', '-m', 'fixture base']);
    shell('git', ['remote', 'add', 'origin', resolve(directory, 'remote.git')]); shell('git', ['push', '-u', 'origin', 'main']);
    let base = shell('git', ['rev-parse', 'HEAD']);
    const { note, draft, slug } = fixture();
    note.date = draft.date = argentinaDate();
    for (const check of [...draft.sourceChecks, ...draft.imageChecks]) check.checkedOn = draft.date;
    addQualityFixture(note, draft);
    mkdirSync(resolve(candidate, 'src/data/editorials'), { recursive: true });
    mkdirSync(resolve(candidate, 'public/assets/editorial', slug), { recursive: true });
    mkdirSync(resolve(candidate, '.tmp/cineposta-daily'), { recursive: true });
    writeFileSync(resolve(candidate, `src/data/editorials/${slug}.json`), JSON.stringify(note));
    writeFileSync(resolve(candidate, '.tmp/cineposta-daily/draft.json'), JSON.stringify(draft));
    const sharp = (await import('sharp')).default;
    for (let i = 0; i < 4; i++) {
      const image = sharp({ create: { width: 1280, height: 720, channels: 3, background: { r: i * 40, g: 40, b: 80 } } });
      await image.clone().webp().toFile(resolve(candidate, `public/assets/editorial/${slug}/imagen-${i}.webp`));
      await image.clone().resize(640).webp().toFile(resolve(candidate, `public/assets/editorial/${slug}/imagen-${i}-640.webp`));
    }
    const tool = (name, body) => { const path = resolve(bin, name); writeFileSync(path, `#!/usr/bin/env node\n${body}`); chmodSync(path, 0o755); };
    writeFileSync(resolve(directory, 'package.json'), '{"type":"module"}');
    tool('codex', `throw Error('Nested CLI inference is forbidden');`);
    const commandLog = resolve(directory, 'commands.log');
    const fakeTools = `import { appendFileSync, existsSync, symlinkSync, mkdirSync, writeFileSync } from 'node:fs';
      if(process.argv[2]==='run'&&process.argv[3]==='build'){mkdirSync('dist',{recursive:true});writeFileSync('dist/index.html','Synthetic fixture build output.');}
      appendFileSync(process.env.TEST_COMMAND_LOG, process.argv[1].split('/').at(-1)+' '+process.argv.slice(2).join(' ')+'\\n');
      // Browsers always run, even when an identical validated build is reused.
      if(process.env.TEST_FAIL_VALIDATION==='1'&&process.argv[2]==='playwright') process.exit(1);
      if(process.argv[2]==='ci'&&!existsSync('node_modules')) { mkdirSync('node_modules'); symlinkSync(process.env.TEST_DEPENDENCIES+'/sharp', 'node_modules/sharp', 'dir'); }`;
    tool('npm', fakeTools); tool('npx', fakeTools);
    tool('gh', `import {writeFileSync,readFileSync} from 'node:fs';
      if(process.argv[2]==='workflow') { writeFileSync(process.env.TEST_BUFFER_REQUEST,process.argv.find(arg=>arg.startsWith('request_id=')).split('=')[1]); }
      else if(process.argv.at(-1).includes('publish-buffer-editorial-x')) console.log(JSON.stringify({workflow_runs:[{display_title:readFileSync(process.env.TEST_BUFFER_REQUEST,'utf8'),status:'completed',conclusion:'success',html_url:'https://example.org/fixture-buffer'}]}));
      else { const sha=process.argv.at(-1).match(/head_sha=([^&]+)/)[1]; console.log(JSON.stringify({workflow_runs:[{head_sha:sha,event:'push',status:'completed',conclusion:'success',html_url:'https://example.org/fixture-run'}]})); }`);
    tool('curl', `console.log('${slug} datetime="${note.date}"');`);
    const env = { ...process.env, GITHUB_ACTIONS: '', PATH: `${bin}:${process.env.PATH}`, TEST_BUFFER_REQUEST: resolve(directory, 'buffer-request.txt'), TEST_COMMAND_LOG: commandLog, TEST_DEPENDENCIES: resolve(project, 'node_modules') };
    const execute = flag => spawnSync(process.execPath, ['scripts/daily-editorial.mjs', flag], { cwd: repository, env, encoding: 'utf8', timeout: 20_000 });
    mkdirSync(resolve(repository, '.tmp/cineposta-daily'), { recursive: true });
    writeFileSync(resolve(repository, '.tmp/cineposta-daily/native-catalog.json'), JSON.stringify({ observedAt: new Date().toISOString(), models: [model('gpt-6-luna')] }));
    let result = execute('--prepare');
    assert.equal(result.status, 0, result.stdout + result.stderr);
    const work = resolve(repository, `.tmp/cineposta-daily/work-${note.date}`);
    cpSync(candidate, work, { recursive: true });
    writeFileSync(resolve(work, '.tmp/cineposta-daily/native-execution.json'), JSON.stringify({ model: 'gpt-6-luna', effort: 'max', agentId: 'fixture-native-agent', provider: 'codex-native', status: 'completed', probe: 'passed', forkTurns: 'none' }));
    result = execute('--dry-run');
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Falta revisión factual independiente/);
    const topic = { id: 'fixture-festival', topicKey: draft.topicKey, title: note.title, summary: 'Synthetic original announcement from a film festival edition.', event: { key: draft.topicKey, type: 'announcement', date: note.date, entities: ['festival-fixture'], description: 'Synthetic original film festival announcement.' }, entities: [{ id: 'festival-fixture', kind: 'festival', aliases: ['Fixture Festival'] }], category: 'festivals', novelty: 'Synthetic substantial new film festival announcement.', evidence: [{ url: note.sources[0].url, checkedOn: note.date, excerpt: 'Synthetic original announcement from the official film festival.' }] };
    draft.candidate = topic;
    writeFileSync(resolve(work, '.tmp/cineposta-daily/draft.json'), JSON.stringify(draft));
    writeFileSync(resolve(work, '.tmp/cineposta-daily/candidate.json'), JSON.stringify(topic));
    result = execute('--candidate');
    assert.equal(result.status, 0, result.stdout + result.stderr);
    const candidateInput = JSON.parse(readFileSync(resolve(work, '.tmp/cineposta-daily/candidate-input.json'), 'utf8'));
    writeFileSync(resolve(work, '.tmp/cineposta-daily/factual-review.json'), JSON.stringify({ version: 1, date: note.date, candidateId: topic.id, contentDigest: candidateInput.contentDigest, verdict: 'approved', originality: approveOriginalityFixture(candidateInput) }));
    writeFileSync(resolve(work, '.tmp/cineposta-daily/native-review-execution.json'), JSON.stringify({ provider: 'codex-native', model: 'gpt-6-luna', effort: 'max', status: 'completed', probe: 'passed', agentId: 'fixture-reviewer', forkTurns: 'none' }));
    result = execute('--record-review');
    assert.equal(result.status, 0, result.stdout + result.stderr);
    result = execute('--review');
    assert.equal(result.status, 0, result.stdout + result.stderr);
    const reviewPath = resolve(work, '.tmp/cineposta-daily/factual-review.json');
    const reviewInputPath = resolve(work, '.tmp/cineposta-daily/review-input.json');
    let approval = approveQualityFixture(JSON.parse(readFileSync(reviewInputPath, 'utf8')));
    writeFileSync(reviewPath, JSON.stringify(approval.report));
    writeFileSync(resolve(work, '.tmp/cineposta-daily/native-review-execution.json'), JSON.stringify(approval.reviewerExecution));
    writeFileSync(resolve(repository, 'early-bot.txt'), 'update before first validation');
    shell('git', ['add', 'early-bot.txt']); shell('git', ['commit', '-m', 'fixture early bot']); shell('git', ['push']);
    base = shell('git', ['rev-parse', 'HEAD']);
    result = execute('--revalidate');
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.equal(shell('git', ['ls-remote', 'origin', 'refs/heads/main']).split(/\s/)[0], base, 'dry-run must not push');
    const mirrorPath = resolve(work, '.tmp/cineposta-daily/review-history.json');
    const mirror = readFileSync(mirrorPath, 'utf8');
    writeFileSync(mirrorPath, '[]');
    result = execute('--publish');
    assert.notEqual(result.status, 0); assert.match(result.stderr, /espejo de revisión/);
    rmSync(mirrorPath);
    result = execute('--review');
    assert.notEqual(result.status, 0); assert.match(result.stderr, /espejo de revisión/);
    writeFileSync(mirrorPath, mirror);
    const beforeBlockedCommit = shell('git', ['rev-parse', 'HEAD'], work);
    const adverse = structuredClone(approval.report);
    adverse.findings = [{ id: 'material-fixture', kind: 'claim', targetId: 'headline-event', severity: 'material', status: 'open', description: 'Synthetic material contradiction detected independently.' }];
    writeFileSync(reviewPath, JSON.stringify(adverse));
    result = execute('--publish');
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /contradicción material/);
    assert.equal(shell('git', ['rev-parse', 'HEAD'], work), beforeBlockedCommit, 'material contradiction must block even a local commit');
    assert.equal(shell('git', ['ls-remote', 'origin', 'refs/heads/main']).split(/\s/)[0], base);
    writeFileSync(reviewPath, JSON.stringify(approval.report));
    result = execute('--publish');
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /borrar hallazgos materiales/);
    const correctedExecution = { ...JSON.parse(readFileSync(resolve(work, '.tmp/cineposta-daily/native-execution.json'), 'utf8')), completedAt: new Date().toISOString() };
    writeFileSync(resolve(work, '.tmp/cineposta-daily/native-execution.json'), JSON.stringify(correctedExecution));
    const correctedNotePath = resolve(work, `src/data/editorials/${slug}.json`);
    const correctedNote = JSON.parse(readFileSync(correctedNotePath, 'utf8'));
    correctedNote.title = 'El festival anuncia el dato corregido';
    writeFileSync(correctedNotePath, JSON.stringify(correctedNote));
    const correctedDraft = JSON.parse(readFileSync(resolve(work, '.tmp/cineposta-daily/draft.json'), 'utf8'));
    correctedDraft.claims[0].statement = correctedNote.title;
    writeFileSync(resolve(work, '.tmp/cineposta-daily/draft.json'), JSON.stringify(correctedDraft));
    // An adverse amended approval was preserved by the factual journal. Enter
    // the explicit correction state before asking for its replacement review.
    const correctionReport = { ...adverse, verdict: 'changes_required', reason: 'The synthetic headline claim requires the documented factual correction.', findings: adverse.findings.map(f => ({ ...f, action: 'Correct the public headline and its claim using the fixture source.', evidence: [{ url: note.sources[0].url, checkedOn: note.date, excerpt: 'Synthetic source records the factual correction to the public title.' }] })) };
    // Bind the corrective request to the original snapshot, before freezing
    // the author's replacement bytes; --record-review normally precedes edits.
    const correctedBytes = readFileSync(correctedNotePath, 'utf8');
    const correctedDraftBytes = readFileSync(resolve(work, '.tmp/cineposta-daily/draft.json'), 'utf8');
    const oldInput = JSON.parse(readFileSync(reviewInputPath, 'utf8'));
    writeFileSync(correctedNotePath, JSON.stringify(oldInput.note));
    writeFileSync(resolve(work, '.tmp/cineposta-daily/draft.json'), JSON.stringify(oldInput.draft));
    writeFileSync(resolve(work, '.tmp/cineposta-daily/native-execution.json'), JSON.stringify(oldInput.authorExecution));
    writeFileSync(reviewPath, JSON.stringify(correctionReport));
    result = execute('--record-review');
    assert.equal(result.status, 0, result.stdout + result.stderr);
    result = execute('--revise'); assert.equal(result.status, 0, result.stdout + result.stderr);
    writeFileSync(correctedNotePath, correctedBytes);
    writeFileSync(resolve(work, '.tmp/cineposta-daily/draft.json'), correctedDraftBytes);
    writeFileSync(resolve(work, '.tmp/cineposta-daily/native-execution.json'), JSON.stringify(correctedExecution));
    result = execute('--review');
    assert.equal(result.status, 0, result.stdout + result.stderr);
    approval = approveQualityFixture(JSON.parse(readFileSync(reviewInputPath, 'utf8')));
    approval.report.findings = [{ ...adverse.findings[0], status: 'resolved', before: note.title, after: correctedNote.title, resolution: 'Fixture correction verified independently against its sources.', evidence: [ { url: note.sources[0].url, checkedOn: note.date, excerpt: 'Synthetic evidence supporting the corrected public title.' } ] }];
    writeFileSync(reviewPath, JSON.stringify(approval.report));
    writeFileSync(resolve(work, '.tmp/cineposta-daily/native-review-execution.json'), JSON.stringify(approval.reviewerExecution));
    result = execute('--revalidate');
    assert.equal(result.status, 0, result.stdout + result.stderr);
    env.TEST_FAIL_VALIDATION = '1';
    result = execute('--revalidate');
    assert.notEqual(result.status, 0);
    delete env.TEST_FAIL_VALIDATION;
    result = execute('--publish');
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /última validación falló/);
    result = execute('--revalidate');
    assert.equal(result.status, 0, result.stdout + result.stderr);
    const notePath = resolve(work, `src/data/editorials/${slug}.json`);
    const approvedNote = readFileSync(notePath, 'utf8');
    writeFileSync(notePath, `${approvedNote}\n`);
    result = execute('--publish');
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /preparación cambió/);
    writeFileSync(notePath, approvedNote);
    writeFileSync(resolve(repository, 'bot-edition.txt'), 'concurrent bot update');
    shell('git', ['add', 'bot-edition.txt']); shell('git', ['commit', '-m', 'fixture concurrent update']); shell('git', ['push']);
    result = execute('--publish');
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /main cambió/);
    result = execute('--revalidate');
    assert.equal(result.status, 0, result.stdout + result.stderr);
    result = execute('--publish');
    assert.equal(result.status, 0, result.stdout + result.stderr);
    shell('git', ['fetch', 'origin', 'main']);
    const receipt = JSON.parse(shell('git', ['show', `origin/main:reports/daily-editorial/${note.date}.json`]));
    assert.equal(receipt.execution.model, 'gpt-6-luna');
    assert.equal(receipt.execution.effort, 'max');
    assert.equal(receipt.editorialReview.reviewerExecution.agentId, 'fixture-reviewer');
    assert.deepEqual(receipt.execution, correctedExecution, 'receipt must use the latest completed author execution after correction, never the old technical proof');
    assert.deepEqual(receipt.editorialReview.authorExecution, correctedExecution);
    assert.ok(receipt.editorialReview.history.some(entry => entry.report.findings.some(f => f.id === 'material-fixture' && f.status === 'open')));
    assert.equal(shell('git', ['show', 'origin/main:bot-edition.txt']), 'concurrent bot update');
    assert.equal(shell('git', ['show', 'origin/main:early-bot.txt']), 'update before first validation');
    const finalSha = shell('git', ['rev-parse', 'origin/main']);
    result = execute('--publish');
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.equal(shell('git', ['ls-remote', 'origin', 'refs/heads/main']).split(/\s/)[0], finalSha, 'retry must not push');
    const commands = readFileSync(commandLog, 'utf8');
    assert.match(commands, /validate:content/);
    assert.match(commands, /editorial.spec.ts/);
    assert.match(commands, /daily-editorial.spec.ts/);
    // Even an explicitly grandfathered receipt is not clearance for a new X
    // delivery. Exercise the real CLI branch without any real Buffer request.
    shell('git', ['pull', '--ff-only', 'origin', 'main']);
    const legacyReceipt = { ...receipt }; delete legacyReceipt.editorialReview;
    writeFileSync(resolve(repository, `reports/daily-editorial/${note.date}.json`), JSON.stringify(legacyReceipt));
    const { digest } = await import('./lib/daily-editorial-policy.mjs');
    writeFileSync(resolve(repository, 'config/editorial-review-legacy.json'), JSON.stringify({ [note.date]: digest(JSON.stringify(legacyReceipt)) }));
    shell('git', ['add', `reports/daily-editorial/${note.date}.json`, 'config/editorial-review-legacy.json']);
    shell('git', ['commit', '-m', 'fixture grandfathered receipt']); shell('git', ['push']);
    const previousBufferRequest = readFileSync(env.TEST_BUFFER_REQUEST, 'utf8');
    result = execute('--tweet');
    assert.notEqual(result.status, 0); assert.match(result.stderr, /histórica sin revisión/);
    assert.equal(readFileSync(env.TEST_BUFFER_REQUEST, 'utf8'), previousBufferRequest, 'no Buffer workflow dispatch for an unreviewed legacy receipt');
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
