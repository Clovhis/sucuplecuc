import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, lstatSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { editorialPostPlan } from './publish-buffer-editorial-x.mjs';
import { selectNativeLuna, validateNativeExecution } from './lib/cineposta-luna.mjs';
import { argentinaDate, digest, readJsonDirectory, validateDraft, assertPublicationScope } from './lib/daily-editorial-policy.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(readFileSync(resolve(root, 'config/daily-editorial.json'), 'utf8'));
const mode = process.argv[2];
if (!['--prepare', '--dry-run', '--revalidate', '--publish', '--verify', '--tweet'].includes(mode) || process.argv.length !== 3) throw new Error('Usá --prepare, --dry-run, --revalidate, --publish, --verify o --tweet.');
const date = argentinaDate();
const state = resolve(root, '.tmp/cineposta-daily');
const work = resolve(state, `work-${date}`);
const proofPath = resolve(state, `${date}-proof.json`);
const contextPath = resolve(state, `${date}-context.json`);
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
const receiptsAt = cwd => existsSync(resolve(cwd, 'reports/daily-editorial')) ? readJsonDirectory(resolve(cwd, 'reports/daily-editorial')) : [];
const changes = base => [
  ...git('diff', '--name-status', '--no-renames', base).split('\n').filter(Boolean).map(line => { const [status, path] = line.split('\t'); return { status, path }; }),
  ...git('ls-files', '--others', '--exclude-standard').split('\n').filter(Boolean).map(path => ({ status: '??', path })),
];
const fingerprint = files => Object.fromEntries(files.sort().map(file => [file, digest(readFileSync(resolve(work, file)))]));
const log = message => console.log(`[cineposta ${date}] ${message}`);
const httpsArgs = ['--fail', '--silent', '--show-error', '--location', '--max-time', '30', '--proto', '=https', '--proto-redir', '=https'];

async function inspectDraft(base) {
  const draft = json(resolve(work, '.tmp/cineposta-daily/draft.json'));
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug || '')) throw new Error('Slug de preparación inválido.');
  const notePath = `src/data/editorials/${draft.slug}.json`;
  const note = json(resolve(work, notePath));
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

async function validate(base, execution) {
  // A failed revalidation invalidates older evidence even when bytes did not change.
  writeFileSync(proofPath, `${JSON.stringify({ date, base, execution, valid: false }, null, 2)}\n`);
  const { draft, note, counts } = await inspectDraft(base);
  assertPublicationScope(changes(base), note.slug, date);
  // Reuse the project's gate: it already runs check + one complete build.
  run('npm', ['run', 'validate:content', '--', '--base', base, '--astro-check']);
  run('npx', ['playwright', 'test', 'tests/e2e/editorial.spec.ts', 'tests/e2e/daily-editorial.spec.ts', '--project=desktop-chromium', '--project=mobile-chromium', '--workers=2'], work);
  if (argentinaDate() !== date) throw new Error('Cambió la fecha argentina; no se publica una nota fechada ayer.');
  const receiptPath = `reports/daily-editorial/${date}.json`;
  mkdirSync(resolve(work, 'reports/daily-editorial'), { recursive: true });
  writeFileSync(resolve(work, receiptPath), `${JSON.stringify({
    date, slug: note.slug, topicKey: draft.topicKey, title: note.title,
    execution, tweet: draft.tweet, decision: draft.decision, sourceChecks: draft.sourceChecks, imageChecks: draft.imageChecks,
    validation: { ...counts, content: 'passed', astroCheck: 'passed', build: 'passed', desktopAndMobile: 'passed' },
    url: `https://www.cineposta.com.ar/editorial/${note.slug}/`,
  }, null, 2)}\n`);
  assertPublicationScope(changes(base), note.slug, date);
  const proof = { date, base, slug: note.slug, execution, valid: true, files: fingerprint(changes(base).map(item => item.path)) };
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

async function publishTweet(slug) {
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

mkdirSync(state, { recursive: true });
const lock = resolve(state, 'lock');
try { mkdirSync(lock); } catch { throw new Error(`Otra ejecución usa ${lock}. Si quedó huérfana, inspeccionarla antes de retirar el lock.`); }
try {
  {
    run('git', ['fetch', 'origin', 'main'], root);
    const head = run('git', ['rev-parse', 'origin/main'], root, true);
    const publishedRaw = spawnSync('git', ['show', `${head}:reports/daily-editorial/${date}.json`], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    if (publishedRaw.status === 0) {
      const published = JSON.parse(publishedRaw.stdout);
      log(`Ya existe la nota de hoy: ${published.url}. No se consume otro turno editorial.`);
      if (mode === '--publish' || mode === '--verify') {
        const commit = run('git', ['log', '-1', '--format=%H', head, '--', `reports/daily-editorial/${date}.json`], root, true);
        await verify(commit, published);
      }
      if (mode === '--publish' || mode === '--tweet') await publishTweet(published.slug);
    } else if (mode === '--verify') {
      throw new Error('No existe una publicación diaria de hoy en main.');
    } else if (mode === '--tweet') {
      throw new Error('No existe una nota diaria publicada hoy para enviar a X.');
    } else {
      if (mode === '--prepare') {
        const catalog = json(resolve(state, 'native-catalog.json'));
        if (argentinaDate(new Date(catalog.observedAt)) !== date) throw new Error('Actualizar el catálogo desde la herramienta nativa de este run.');
        const selection = selectNativeLuna(catalog.models);
        if (existsSync(work)) throw new Error(`Hay una preparación previa en ${work}; inspeccionarla sin descartarla.`);
        run('git', ['worktree', 'add', '--detach', work, head], root);
        run('npm', ['ci']);
        run('npx', ['playwright', 'install', 'chromium']);
        mkdirSync(resolve(work, '.tmp/cineposta-daily'), { recursive: true });
        const publications = readJsonDirectory(resolve(work, 'src/data/editorials')).map(note => ({ slug: note.slug, title: note.title, date: note.date })).sort((a, b) => b.date.localeCompare(a.date));
        writeFileSync(resolve(work, '.tmp/cineposta-daily/published.json'), JSON.stringify({ totalPublications: publications.length, recentPublications: publications.slice(0, 60), recentDaily: receiptsAt(work).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 60).map((item, index) => ({ date: item.date, topicKey: item.topicKey, title: item.title, ...(index < 7 ? { tweet: item.tweet } : {}) })) }));
        const context = { date, base: head, worktree: work, selection, availableModels: catalog.models, executionFile: resolve(work, '.tmp/cineposta-daily/native-execution.json') };
        writeFileSync(contextPath, JSON.stringify(context, null, 2));
        log(JSON.stringify(context));
        process.exitCode = 0;
      } else {
      let proof;
      if (existsSync(proofPath)) {
        proof = json(proofPath);
        if (mode === '--revalidate') {
          const correctedSlug = json(resolve(work, '.tmp/cineposta-daily/draft.json')).slug;
          if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(correctedSlug || '')) throw new Error('Slug de preparación inválido.');
          assertPublicationScope(changes(proof.base), correctedSlug, date);
          if (head !== proof.base) {
            git('add', '--', ...changes(proof.base).map(item => item.path));
            if (spawnSync('git', ['diff', '--cached', '--quiet'], { cwd: work }).status !== 0) git('-c', 'user.name=CinePosta editorial', '-c', 'user.email=cineposta-editorial@users.noreply.github.com', 'commit', '-m', `chore(editorial): preparar integración ${date}`);
            git('rebase', 'origin/main');
          }
          proof = await validate(head, proof.execution);
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
        const execution = validateNativeExecution(json(context.executionFile), context.selection);
        proof = await validate(head, execution);
      }
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
        if (remote !== proof.base) {
          git('rebase', 'origin/main');
          // Revalidate merged inputs; a previous build does not prove the new tree.
          const { draft, note } = await inspectDraft(remote);
          if (draft.slug !== proof.slug || note.date !== date) throw new Error('La preparación cambió al integrar main.');
          run('npm', ['run', 'validate:content', '--', '--base', remote, '--astro-check']);
          run('npx', ['playwright', 'test', 'tests/e2e/editorial.spec.ts', 'tests/e2e/daily-editorial.spec.ts', '--project=desktop-chromium', '--project=mobile-chromium', '--workers=2']);
        }
        if (argentinaDate() !== date) throw new Error('Cambió la fecha argentina antes del push.');
        if (git('status', '--porcelain')) throw new Error('El worktree cambió durante las validaciones.');
        // Normal fast-forward push is the cross-machine compare-and-swap. Never force.
        git('push', 'origin', 'HEAD:main');
        const sha = git('rev-parse', 'HEAD');
        if (run('git', ['ls-remote', 'origin', 'refs/heads/main'], root, true).split(/\s/)[0] !== sha) throw new Error('No se confirmó el SHA publicado en main; revisar concurrencia.');
        log(`Push confirmado: ${sha}`);
        // GITHUB_TOKEN pushes do not trigger a push workflow. Dispatch is explicit.
        if (process.env.GITHUB_ACTIONS === 'true') run('gh', ['api', `repos/${config.repository}/actions/workflows/deploy.yml/dispatches`, '--method', 'POST', '--field', 'ref=main'], root);
        await verify(sha, json(resolve(work, `reports/daily-editorial/${date}.json`)));
        run('git', ['worktree', 'remove', work], root);
        rmSync(proofPath);
        await publishTweet(proof.slug);
      }
    }
    }
  }
} finally { rmSync(lock, { recursive: true, force: true }); }
