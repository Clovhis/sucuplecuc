import { mkdtempSync, writeFileSync, readFileSync, rmSync, chmodSync, mkdirSync, cpSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { argentinaDate } from '../lib/daily-editorial-policy.mjs';
import { addQualityFixture, approveQualityFixture, fixtureEvidence } from './editorial-quality-fixture.mjs';

export { fixtureEvidence };

const project = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const nativeModel = 'gpt-6-luna';

export function fixtureCandidate(date = argentinaDate(), overrides = {}) {
	const entities = [
		{ id: 'film:fixture-opening-film', kind: 'film', aliases: ['Fixture Opening Film', 'Película de apertura'] },
		{ id: 'festival:fixture-film-festival', kind: 'festival', aliases: ['Festival de cine', 'Fixture Film Festival'] },
	];
	return {
		id: 'festival-edicion-anuncio',
		topicKey: 'festival-2026-film-opening-announcement',
		title: 'El festival anuncia una película para su apertura',
		summary: 'El festival confirmó la película que abrirá su próxima edición.',
		event: {
			key: 'festival-2026-film-opening-announcement', type: 'announcement', date,
			entities: entities.map(entity => entity.id), description: 'Anuncio oficial de la película de apertura de la edición 2026.',
		},
		novelty: 'Qué revela la elección sobre la identidad cinematográfica de la edición.',
		category: 'festivales',
		entities,
		evidence: [
			{ url: 'https://festival.example/2026/apertura', excerpt: 'El festival anuncia su película de apertura para la edición 2026.', checkedOn: date },
			{ url: 'https://cine-noticias.example/festival-apertura-2026', excerpt: 'Un medio confirma la selección mediante reporting propio.', checkedOn: date },
		],
		...overrides,
	};
}

export function fixtureNote(date = argentinaDate(), candidate = fixtureCandidate(date), overrides = {}) {
	const slug = overrides.slug || 'festival-anuncia-apertura';
	const candidateSources = candidate.evidence || candidate.sources || [];
	const image = index => ({
		type: 'image', src: `assets/editorial/${slug}/imagen-${index}.webp`, srcSmall: `assets/editorial/${slug}/imagen-${index}-640.webp`,
		source: `https://festival.example/images/apertura-${index}`, width: 1280, height: 720,
		alt: `Imagen ${index + 1} de la edición del festival de cine`, caption: `Una imagen vinculada con la edición del festival ${index + 1}.`,
	});
	const note = {
		date, slug, title: candidate.title, excerpt: 'El anuncio de apertura ofrece una pista concreta sobre el perfil de la nueva edición.',
		author: 'CinePosta', type: 'nota', spoilers: false, cover: image(0),
		sources: [
			{ label: 'Anuncio oficial del festival', url: candidateSources[0].url },
			{ label: 'Cobertura con reporting propio', url: candidateSources[1].url },
		],
		content: [
			{ type: 'paragraph', text: Array(950).fill('cine').join(' ') },
			...[0, 1, 2, 3].map(image),
		],
		...overrides,
	};
	return note;
}

export function fixtureDraft(date = argentinaDate(), candidate = fixtureCandidate(date), note = fixtureNote(date, candidate)) {
	const slug = note.slug;
	return {
		date, slug, candidate: structuredClone(candidate), topicKey: candidate.topicKey,
		decision: 'El anuncio aporta una novedad verificable y permite leer la identidad de esta edición desde una elección concreta.',
		tweet: `La apertura ya tiene película: el festival confirma una elección que adelanta el perfil de su edición. https://www.cineposta.com.ar/editorial/${slug}/ #Cine`,
		sourceChecks: note.sources.map((source, index) => ({
			url: source.url, role: index === 0 ? 'primary' : 'secondary', checkedOn: date,
			facts: 'Hechos comprobados al abrir la fuente pública y cotejar su relación con el anuncio.',
		})),
		imageChecks: [note.cover, ...note.content.filter(block => block.type === 'image')].map(image => ({
			src: image.src, sourceUrl: image.source, checkedOn: date,
			description: 'Inspección visual del original; la imagen acompaña la elección de apertura y la edición del festival.',
		})),
	};
}

function makeTool(bin, name, body) {
	const path = resolve(bin, name);
	writeFileSync(path, `#!/usr/bin/env node\n${body}`);
	chmodSync(path, 0o755);
}

export async function createDailyOrchestratorFixture({ historyNotes = [], historyReceipts = [] } = {}) {
	const directory = mkdtempSync(resolve(tmpdir(), 'cineposta-daily-lifecycle-'));
	const repository = resolve(directory, 'repo');
	const bin = resolve(directory, 'bin');
	const remote = resolve(directory, 'remote.git');
	const commandLog = resolve(directory, 'commands.log');
	const bufferRequest = resolve(directory, 'buffer-request.txt');
	const shell = (command, args, cwd = repository) => execFileSync(command, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
	mkdirSync(repository);
	mkdirSync(bin);
	shell('git', ['init', '--bare', remote]);
	shell('git', ['init', '-b', 'main']);
	shell('git', ['config', 'user.name', 'fixture']);
	shell('git', ['config', 'user.email', 'fixture@example.org']);
	cpSync(resolve(project, 'scripts/daily-editorial.mjs'), resolve(repository, 'scripts/daily-editorial.mjs'), { recursive: true });
	cpSync(resolve(project, 'scripts/lib'), resolve(repository, 'scripts/lib'), { recursive: true });
	for (const file of ['publish-buffer-editorial-x.mjs', 'publish-buffer-x.mjs', 'buffer-x-availability.mjs']) {
		cpSync(resolve(project, 'scripts', file), resolve(repository, 'scripts', file));
	}
	mkdirSync(resolve(repository, 'config'));
	writeFileSync(resolve(repository, 'config/daily-editorial.json'), JSON.stringify({ repository: 'fixture/test', deployTimeoutMinutes: 0.1 }));
	writeFileSync(resolve(repository, 'config/daily-editorial-diversity.json'), JSON.stringify({
		version: 1,
		windows: { filmFranchiseCooldownDays: 14, concentrationDays: 30 },
		limits: { maxEntityPublicationsInConcentrationWindow: 3 },
		entities: [
			{ id: 'godzilla-minus-zero-2026', kind: 'film', canonicalTitle: 'Godzilla Minus Zero', aliases: ['Godzilla Minus Zero', 'Gojira Minus Zero'], franchise: 'godzilla' },
			{ id: 'godzilla', kind: 'franchise', canonicalTitle: 'Godzilla', aliases: ['Godzilla', 'Gojira'] },
		],
		topicKeyAliases: [
			{ id: 'festival-2026-film-opening-announcement', aliases: ['festival-2026-apertura-de-la-pelicula', 'festival-2026-opening-film-announcement'] },
			{ id: 'godzilla-minus-zero-worldwide-release-announcement', aliases: ['godzilla-minus-zero-global-date-announcement', 'godzilla-minus-zero-worldwide-release-date-revealed'] },
		],
		extraHistoryInputs: [],
	}));
	writeFileSync(resolve(repository, 'package.json'), '{"type":"module"}');
	writeFileSync(resolve(repository, '.gitignore'), '.tmp/\nnode_modules/\n');
	mkdirSync(resolve(repository, 'src/data/editorials'), { recursive: true });
	writeFileSync(resolve(repository, 'src/data/editorials/.gitkeep'), '');
	for (const note of historyNotes) writeFileSync(resolve(repository, `src/data/editorials/${note.slug}.json`), `${JSON.stringify(note, null, 2)}\n`);
	for (const receipt of historyReceipts) {
		mkdirSync(resolve(repository, 'reports/daily-editorial'), { recursive: true });
		writeFileSync(resolve(repository, `reports/daily-editorial/${receipt.date}.json`), `${JSON.stringify(receipt, null, 2)}\n`);
	}
	shell('git', ['add', '.']);
	shell('git', ['commit', '-m', 'fixture base']);
	shell('git', ['remote', 'add', 'origin', remote]);
	shell('git', ['push', '-u', 'origin', 'main']);
	const base = shell('git', ['rev-parse', 'HEAD']);
	const today = argentinaDate();
	mkdirSync(resolve(repository, '.tmp/cineposta-daily'), { recursive: true });
	writeFileSync(resolve(repository, '.tmp/cineposta-daily/native-catalog.json'), JSON.stringify({
		observedAt: `${today}T12:00:00-03:00`, models: [{ model: nativeModel, reasoningEfforts: ['medium', 'max'] }],
	}));

	makeTool(bin, 'codex', `throw Error('Nested CLI inference is forbidden');`);
	const fakeTools = `import { appendFileSync, existsSync, symlinkSync, mkdirSync } from 'node:fs';
appendFileSync(process.env.TEST_COMMAND_LOG, process.argv[1].split('/').at(-1)+' '+process.argv.slice(2).join(' ')+'\\n');
if(process.env.TEST_FAIL_VALIDATION==='1'&&process.argv[2]==='run') process.exit(1);
if(process.argv[2]==='ci'&&!existsSync('node_modules')) { mkdirSync('node_modules'); symlinkSync(process.env.TEST_DEPENDENCIES+'/sharp','node_modules/sharp','dir'); }`;
	makeTool(bin, 'npm', fakeTools);
	makeTool(bin, 'npx', fakeTools);
	makeTool(bin, 'gh', `import {writeFileSync,appendFileSync,readFileSync} from 'node:fs';
const args=process.argv.slice(2).join(' ');
appendFileSync(process.env.TEST_COMMAND_LOG,'gh '+args+'\\n');
if(args.includes('workflow run publish-buffer-editorial-x.yml')) {
 const request=args.match(/request_id=([^ ]+)/)?.[1]||'fixture-request';
 writeFileSync(process.env.TEST_BUFFER_REQUEST,request);
} else if(args.includes('publish-buffer-editorial-x.yml/runs')) {
 console.log(JSON.stringify({workflow_runs:[{display_title:'fixture '+readFileSync(process.env.TEST_BUFFER_REQUEST,'utf8'),status:'completed',conclusion:'success',html_url:'https://example.org/fixture-buffer'}]}));
} else {
 const sha=args.match(/head_sha=([^& ]+)/)?.[1]||'fixture-sha';
 const conclusion=process.env.TEST_FAIL_PAGES==='1'?'failure':'success';
 appendFileSync(process.env.TEST_COMMAND_LOG,'pages-'+conclusion+'\\n');
 console.log(JSON.stringify({workflow_runs:[{head_sha:sha,event:'push',status:'completed',conclusion,html_url:'https://example.org/fixture-pages'}]}));
}`);
	makeTool(bin, 'curl', `import {appendFileSync} from 'node:fs';
const args=process.argv.slice(2); const url=args.at(-1)||'';
appendFileSync(process.env.TEST_COMMAND_LOG,'curl '+url+'\\n');
if(url.includes('/editorial/')) console.log((process.env.TEST_PUBLISHED_SLUG||'festival-anuncia-apertura')+' datetime="${today}"');`);
	makeTool(bin, 'git', `import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
const real=process.env.TEST_REAL_GIT, args=process.argv.slice(2), cwd=process.cwd();
const run=(argv, directory=cwd) => execFileSync(real, argv, { cwd: directory, stdio: ['ignore','pipe','pipe'] });
const interrupt=process.env.TEST_BREAK_SWITCH;
if(interrupt&&cwd===process.env.TEST_WORKTREE&&args.join(' ')==='cat-file -e HEAD:reports/daily-editorial/${today}.json') {
 const targets=[process.env.TEST_SWITCH_ARCHIVE_FILE]; if(interrupt==='both') targets.push(process.env.TEST_SWITCH_SOURCE_FILE);
 for(const target of targets.filter(Boolean)){mkdirSync(dirname(target),{recursive:true});writeFileSync(target,'intentionally corrupted during the crash fixture\\n');}
 // Returning success simulates a transient committed-receipt check: the CLI
 // throws after checkpointing switching_topic, before it can delete sources.
 process.exit(0);
}
const race=process.env.TEST_INJECT_RACE==='1'&&cwd===process.env.TEST_WORKTREE&&args.join(' ')==='fetch origin main'&&!existsSync(process.env.TEST_RACE_MARKER);
if(race) {
 const repository=process.env.TEST_FIXTURE_REPOSITORY, relative=process.env.TEST_RACE_NOTE_PATH;
 const target=resolve(repository,relative); mkdirSync(dirname(target),{recursive:true}); writeFileSync(target,process.env.TEST_RACE_NOTE);
 run(['-C',repository,'add','--',relative],repository);
 run(['-C',repository,'-c','user.name=Concurrent fixture','-c','user.email=concurrent@example.org','commit','-m','fixture concurrent same-topic editorial'],repository);
 run(['-C',repository,'push','origin','main'],repository);
 writeFileSync(process.env.TEST_RACE_MARKER,'injected\\n');
}
try { const output=run(args); if(output)process.stdout.write(output); }
catch(error) { if(error.stdout)process.stdout.write(error.stdout); if(error.stderr)process.stderr.write(error.stderr); process.exit(error.status??1); }`);
	const env = {
		...process.env, GITHUB_ACTIONS: '', PATH: `${bin}:${process.env.PATH}`,
		TEST_BUFFER_REQUEST: bufferRequest, TEST_COMMAND_LOG: commandLog,
		TEST_REAL_GIT: execFileSync('which', ['git'], { encoding: 'utf8' }).trim(),
		TEST_FIXTURE_REPOSITORY: repository,
		TEST_WORKTREE: resolve(repository, `.tmp/cineposta-daily/work-${today}`),
		TEST_RACE_MARKER: resolve(directory, 'race-injected.txt'),
		TEST_DEPENDENCIES: resolve(project, 'node_modules'),
	};

	const execute = flag => spawnSync(process.execPath, ['scripts/daily-editorial.mjs', flag], {
		cwd: repository, env, encoding: 'utf8', timeout: 20_000,
	});
	const worktree = () => resolve(repository, `.tmp/cineposta-daily/work-${today}`);
	const sessionFile = resolve(repository, `.tmp/cineposta-daily/${today}-session.json`);
	const pathInWorktree = path => resolve(worktree(), path);
	const readJson = (path, inWorktree = true) => JSON.parse(readFileSync(inWorktree ? pathInWorktree(path) : resolve(repository, path), 'utf8'));
	const writeJson = (path, value, inWorktree = true) => {
		const absolute = inWorktree ? pathInWorktree(path) : resolve(repository, path);
		mkdirSync(resolve(absolute, '..'), { recursive: true });
		writeFileSync(absolute, `${JSON.stringify(value, null, 2)}\n`);
	};
	const authorExecution = (agentId = 'fixture-author') => ({
		model: nativeModel, effort: 'max', provider: 'codex-native', status: 'completed', probe: 'passed', forkTurns: 'none', agentId,
	});
	const reviewerExecution = (agentId = 'fixture-reviewer') => ({ ...authorExecution(agentId), forkTurns: 'none' });
	const remoteHead = () => shell('git', ['ls-remote', 'origin', 'refs/heads/main']).split(/\s/)[0];

	return {
		directory, repository, remote, base, today, env, commandLog, bufferRequest, execute, sessionFile,
		worktree, pathInWorktree, readJson, writeJson, shell, authorExecution, reviewerExecution, remoteHead,
		cleanup: () => rmSync(directory, { recursive: true, force: true }),
	};
}

export async function writeFixtureArticle(fixture, candidate, { slug = 'festival-anuncia-apertura', title = candidate.title } = {}) {
	const { today } = fixture;
	const article = fixtureNote(today, candidate, { slug, title });
	fixture.env.TEST_PUBLISHED_SLUG = slug;
	const preparation = fixtureDraft(today, candidate, article);
	preparation.slug = slug;
	preparation.candidate = structuredClone(candidate);
	preparation.topicKey = candidate.topicKey;
	preparation.tweet = `La apertura ya tiene película: el festival confirma una elección que adelanta el perfil de su edición. https://www.cineposta.com.ar/editorial/${slug}/ #Cine`;
	addQualityFixture(article, preparation);
	fixture.writeJson(`src/data/editorials/${slug}.json`, article);
	fixture.writeJson('.tmp/cineposta-daily/draft.json', preparation);
	const sharp = (await import('sharp')).default;
	mkdirSync(fixture.pathInWorktree(`public/assets/editorial/${slug}`), { recursive: true });
	for (let i = 0; i < 4; i++) {
		const image = sharp({ create: { width: 1280, height: 720, channels: 3, background: { r: i * 40, g: 40, b: 80 } } });
		await image.clone().webp().toFile(fixture.pathInWorktree(`public/assets/editorial/${slug}/imagen-${i}.webp`));
		await image.clone().resize(640).webp().toFile(fixture.pathInWorktree(`public/assets/editorial/${slug}/imagen-${i}-640.webp`));
	}
	return { note: article, draft: preparation, slug };
}

export async function replaceFixtureImage(fixture, note, draft, oldSrc = note.cover.src) {
	const slug = note.slug;
	const oldImage = note.cover.src === oldSrc ? note.cover : note.content.find(block => block.type === 'image' && block.src === oldSrc);
	if (!oldImage) throw new Error(`Fixture image not found: ${oldSrc}`);
	const replacement = {
		...oldImage, src: `assets/editorial/${slug}/approved-cover.webp`, srcSmall: `assets/editorial/${slug}/approved-cover-640.webp`,
		source: 'https://fixture.example/approved/cover', alt: 'Autorizada imagen oficial de la película para la portada',
		caption: 'La imagen oficial autorizada acompaña la noticia del festival.',
	};
	if (note.cover.src === oldSrc) note.cover = replacement;
	note.content = note.content.map(block => block.type === 'image' && block.src === oldSrc ? replacement : block);
	draft.imageChecks = (draft.imageChecks || []).filter(check => check.src !== oldSrc);
	draft.imageChecks.push({ src: replacement.src, sourceUrl: replacement.source, checkedOn: note.date, description: 'Inspección visual de una imagen oficial autorizada, incorporada tras reemplazar el recurso anterior.' });
	addQualityFixture(note, draft);
	fixture.writeJson(`src/data/editorials/${slug}.json`, note);
	fixture.writeJson('.tmp/cineposta-daily/draft.json', draft);
	const directory = fixture.pathInWorktree(`public/${oldSrc}`);
	rmSync(directory, { force: true });
	rmSync(directory.replace(/\.webp$/u, '-640.webp'), { force: true });
	const sharp = (await import('sharp')).default;
	const image = sharp({ create: { width: 1280, height: 720, channels: 3, background: { r: 120, g: 60, b: 35 } } });
	await image.clone().webp().toFile(fixture.pathInWorktree(`public/${replacement.src}`));
	await image.clone().resize(640).webp().toFile(fixture.pathInWorktree(`public/${replacement.srcSmall}`));
	return { oldSrc, replacement };
}

function originalityProof(context) {
	const history = context.history;
	const candidate = context.candidate || context.draft?.candidate;
	const preflight = context.preflight;
	const comparisons = (preflight?.matches || []).filter(match => match.requiresEditorialComparison).map(match => {
		const record = history.records.find(item => item.id === match.recordId);
		const sourcePath = record?.sourcePaths?.[0];
		const url = record?.sources?.[0];
		const candidateEvidence = candidate?.evidence?.[0];
		const evidence = sourcePath
			? { recordId: match.recordId, sourcePath, excerpt: match.excerpt || record.title }
			: { recordId: match.recordId, url, excerpt: match.excerpt || record?.title || 'Historical editorial record.' };
		return {
			recordId: match.recordId, relation: 'distinct event',
			priorAngle: record?.note?.angle || record?.receipt?.decision || record?.title || 'Previous editorial coverage.',
			candidateContribution: candidate?.novelty || candidate?.angle || 'A new, independently verified contribution to the current event.',
			difference: 'The current candidate adds a distinct, date-specific contribution beyond the prior record.', evidence: [evidence],
			...(match.kind === 'legacy_possible_same_event' || match.kind === 'structured_event_overlap' ? {
				eventDifference: 'The earlier report did not include this newly announced milestone or its independently checked date.',
				newEventEvidence: candidateEvidence ? [{ url: candidateEvidence.url, checkedOn: candidateEvidence.checkedOn, excerpt: candidateEvidence.excerpt }] : [],
			} : {}),
		};
	});
	const guideComparisons = (history.records || []).filter(record => record.isGuide).map(record => {
		const guideMatches = (preflight?.matches || []).filter(match => match.recordId === record.id && match.kind.startsWith('guide_'));
		const exactEventKeyMatch = guideMatches.some(match => match.kind === 'guide_same_event_key');
		const candidateEvidence = candidate?.evidence?.[0];
		const evidence = record.sourcePaths?.[0]
			? { recordId: record.id, sourcePath: record.sourcePaths[0], excerpt: record.title || 'Weekly guide record.' }
			: { recordId: record.id, url: record.sources?.[0], excerpt: record.title || 'Weekly guide record.' };
		return exactEventKeyMatch
			? {
				recordId: record.id, relation: 'substantial_contribution',
				basis: 'The daily report covers a newly confirmed, date-specific announcement beyond the guide summary.',
				candidateContribution: candidate?.novelty || 'The daily report adds a newly verified, date-specific event contribution.',
				difference: 'A standalone report supplies the newly confirmed milestone and its direct source evidence.',
				contributionEvidence: candidateEvidence ? [{ url: candidateEvidence.url, checkedOn: candidateEvidence.checkedOn, excerpt: candidateEvidence.excerpt }] : [],
				evidence: [evidence],
			}
			: {
				recordId: record.id, relation: 'no_same_event',
				basis: 'The guide covers a separate weekly selection and not the event under review.',
				...(guideMatches.length ? {
					eventDifference: 'The guide does not contain this newly announced milestone or its independently checked date.',
					eventEvidence: candidateEvidence ? [{ url: candidateEvidence.url, checkedOn: candidateEvidence.checkedOn, excerpt: candidateEvidence.excerpt }] : [],
				} : {}),
				evidence: [evidence],
			};
	});
	const proof = {
		verdict: 'approved',
		history: { digest: history.digest, recordCount: history.records.length, checkedRecordIds: history.records.map(item => item.id), checkedDiscardedIds: history.discarded.map(item => item.id) },
		coverage: { fullHistory: true, events: true, entities: true, guideContributions: true },
		comparisons, guideComparisons,
	};
	if ((preflight?.matches || []).some(match => match.requiresConcentrationReview === true)) {
		proof.concentrationReview = {
			rationale: 'The recent publishing cadence is already dense for this franchise, so the current report needs a strong, timely new contribution.',
			alternativesConsidered: [{ topicKey: 'other-current-film-announcement', title: 'A different film announcement', reason: 'It has less confirmed evidence and lower reader relevance today.' }],
		};
	}
	const recent = (preflight?.matches || []).filter(match => match.requiresFourteenDayException);
	if (recent.length) {
		proof.exception14d = {
			verdict: 'approved', extraordinary: true,
			rationale: 'The current event has exceptional public relevance and cannot be deferred without losing its timely value.',
			distinctContribution: 'This article documents new verified information that the recent coverage did not contain.',
			evidence: recent.map(match => {
				const record = history.records.find(item => item.id === match.recordId);
				return record?.sourcePaths?.[0]
					? { recordId: match.recordId, sourcePath: record.sourcePaths[0], excerpt: match.excerpt || record.title }
					: { recordId: match.recordId, url: record?.sources?.[0], excerpt: match.excerpt || record?.title || 'Historical editorial record.' };
			}),
		};
	}
	return proof;
}

export function approvedCandidateReport(input) {
	return {
		date: input.date, candidateId: input.candidate.id, contentDigest: input.contentDigest,
		verdict: 'approved', reason: 'La novedad y su aporte superan el preflight de historial y diversidad.',
		originality: originalityProof(input),
	};
}

export function approvedArticleReview(input, reviewerId = 'fixture-reviewer') {
	const approval = approveQualityFixture(input);
	approval.reviewerExecution.agentId = reviewerId;
	approval.report.dimensions = { factual: 'approved', editorial: 'approved', originality: 'approved' };
	approval.report.originality = originalityProof(input.draft.originalityContext);
	return approval;
}

export function adverseReview({ input, verdict = 'changes_required', findingId = 'fixture-fact', relatedPublications = [] }) {
	const candidatePhase = Boolean(input.candidate && !input.note);
	const evidenceUrl = input.candidate?.evidence?.[0]?.url || input.candidate?.sources?.[0]?.url || input.note?.sources?.[0]?.url;
	const finding = {
		id: findingId, kind: candidatePhase ? 'text' : 'claim', targetId: candidatePhase ? 'candidate/summary' : 'headline-event', severity: 'material', status: 'open',
		description: candidatePhase ? 'Synthetic preflight evidence requires a concrete correction to the candidate summary.' : 'Synthetic evidence check found a material date claim that needs correction.',
		action: 'Correct the public date to the value shown by both opened sources before review resumes.',
		evidence: [fixtureEvidence(evidenceUrl, input.date || input.note?.date)],
	};
	return {
		date: input.date || input.note?.date,
		...(input.candidate ? { candidateId: input.candidate.id } : { slug: input.note.slug }),
		contentDigest: input.contentDigest, verdict,
		reason: 'The current evidence does not support one material point and identifies a concrete next step.',
		findings: verdict === 'changes_required' ? [finding] : [],
		evidence: verdict === 'changes_required' ? undefined : [fixtureEvidence(evidenceUrl, input.date || input.note?.date)],
		...(verdict === 'topic_unviable' ? { searches: [fixtureEvidence(evidenceUrl, input.date || input.note?.date)], unresolvable: 'The event cannot be verified after targeted primary and independent source checks.' } : {}),
		...(['duplicate_topic', 'editorial_saturation'].includes(verdict) ? { relatedPublications: relatedPublications.length ? relatedPublications : [{ recordId: 'fixture-prior@2026-10-01', reason: 'Synthetic prior coverage matches the reviewed event.', evidence: [fixtureEvidence(evidenceUrl, input.date || input.note?.date)] }] } : {}),
	};
}
