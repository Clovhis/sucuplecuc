import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, chmodSync, mkdirSync, cpSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { selectNativeLuna, validateNativeExecution } from './lib/cineposta-luna.mjs';
import { argentinaDate, canonicalSource, validateDraft, assertPublicationScope } from './lib/daily-editorial-policy.mjs';

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
  const note = { date, slug, title: 'Un hecho nuevo del festival', author: 'CinePosta', type: 'nota', spoilers: false, cover: image(0), sources: [{ label: 'Festival', url: 'https://festival.example/news' }, { label: 'Medio', url: 'https://news.example/cinema' }], content: [{ type: 'paragraph', text: Array(950).fill('cine').join(' ') }, ...[0, 1, 2, 3].map(image)] };
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
  assert.throws(() => check({ ...note, sources: [note.sources[0]] }), /dominios/);
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

test('publisher integration with simulated research/builds: dry-run, tamper block, rebase, single atomic push, idempotent recovery', { timeout: 30_000 }, async () => {
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
    writeFileSync(resolve(repository, 'package.json'), '{"type":"module"}');
    writeFileSync(resolve(repository, '.gitignore'), '.tmp/\nnode_modules/\n');
    mkdirSync(resolve(repository, 'src/data/editorials'), { recursive: true });
    writeFileSync(resolve(repository, 'src/data/editorials/.gitkeep'), '');
    shell('git', ['add', '.']); shell('git', ['commit', '-m', 'fixture base']);
    shell('git', ['remote', 'add', 'origin', resolve(directory, 'remote.git')]); shell('git', ['push', '-u', 'origin', 'main']);
    let base = shell('git', ['rev-parse', 'HEAD']);
    const { note, draft, slug } = fixture();
    note.date = draft.date = argentinaDate();
    for (const check of [...draft.sourceChecks, ...draft.imageChecks]) check.checkedOn = draft.date;
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
    const fakeTools = `import { appendFileSync, existsSync, symlinkSync, mkdirSync } from 'node:fs';
      appendFileSync(process.env.TEST_COMMAND_LOG, process.argv[1].split('/').at(-1)+' '+process.argv.slice(2).join(' ')+'\\n');
      if(process.env.TEST_FAIL_VALIDATION==='1'&&process.argv[2]==='run') process.exit(1);
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
    writeFileSync(resolve(work, '.tmp/cineposta-daily/native-execution.json'), JSON.stringify({ model: 'gpt-6-luna', effort: 'max', agentId: 'fixture-native-agent', provider: 'codex-native', status: 'completed', probe: 'passed' }));
    writeFileSync(resolve(repository, 'early-bot.txt'), 'update before first validation');
    shell('git', ['add', 'early-bot.txt']); shell('git', ['commit', '-m', 'fixture early bot']); shell('git', ['push']);
    base = shell('git', ['rev-parse', 'HEAD']);
    result = execute('--dry-run');
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.equal(shell('git', ['ls-remote', 'origin', 'refs/heads/main']).split(/\s/)[0], base, 'dry-run must not push');
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
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
