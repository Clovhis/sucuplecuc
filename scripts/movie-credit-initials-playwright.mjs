import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, rmdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createMovieCreditCoverageDraft, validateMovieCreditCoverage } from './movie-credit-coverage.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const slug = 'temporary-credit-initials-fixture-2026';
const moviePath = path.join(root, 'src/data/movies', `${slug}.json`);
const intakeDirectory = path.join(root, 'reports/movie-intake');
const reviewPath = path.join(intakeDirectory, `${slug}.json`);
const port = 43251;
const origin = `http://127.0.0.1:${port}`;
const astroCli = path.join(root, 'node_modules/astro/bin/astro.mjs');
const auditCli = path.join(root, 'scripts/audit-movie-people.mjs');

assert.equal(existsSync(moviePath), false, `Refusing to replace ${moviePath}`);
assert.equal(existsSync(reviewPath), false, `Refusing to replace ${reviewPath}`);

let server;
let browser;
try {
	const movie = JSON.parse(readFileSync(path.join(root, 'src/data/movies/digger-2026.json'), 'utf8'));
	movie.slug = slug;
	movie.title = 'Temporary Initials Fixture';
	movie.originalTitle = 'Temporary Initials Fixture';
	movie.year = 2026;
	movie.director = 'Steven Spielberg';
	movie.mainCast = ['Meryl Streep', 'John Goodman', 'Initials Guest'];
	delete movie.castCharacters;
	const today = '2026-11-10';
	const people = JSON.parse(readFileSync(path.join(root, 'src/data/people.json'), 'utf8'));
	const sources = [
		{ url: 'https://www.imdb.com/title/tt1234567/fullcredits/', kind: 'IMDb full credits', fullCredits: true, relevantCreditCount: 4, checkedOn: today },
		{ url: 'https://www.imdb.com/title/tt1234567/cast/', kind: 'IMDb cast cross-check', fullCredits: false, checkedOn: today },
	];
	const fullCreditsUrl = sources[0].url;
	const knownCredit = (name, role, prominence) => {
		const person = people[name];
		const identity = (person.referenceUrls ?? []).filter(url => /^https:\/\//u.test(url)).slice(0, 2);
		return {
			name, role, prominence, decision: 'include', creditSourceUrl: fullCreditsUrl,
			identitySources: identity.map((url, index) => ({ url, fact: `${name} coincide con el crédito y su identidad pública verificada (${index + 1}).` })),
			portrait: { sourceUrl: person.remoteImageUrl, visuallyVerified: true },
		};
	};
	const review = {
		...createMovieCreditCoverageDraft(movie, today),
		status: 'reviewed',
		reviewedOn: today,
		billingSources: sources,
		credits: [
			knownCredit('Steven Spielberg', 'director', 'lead'),
			knownCredit('Meryl Streep', 'performer', 'lead'),
			knownCredit('John Goodman', 'performer', 'co-lead'),
			{
				name: 'Initials Guest', role: 'performer', prominence: 'supporting', decision: 'include', creditSourceUrl: fullCreditsUrl,
				identitySources: [
					{ url: 'https://www.imdb.com/name/nm7654321/', fact: 'La ficha de créditos vincula la identidad con el papel secundario.' },
					{ url: 'https://www.imdb.com/name/nm7654321/bio/', fact: 'La biografía del mismo perfil confirma el nombre acreditado.' },
				],
				portraitException: {
					category: 'obscure-no-reliable-image', recognition: 'obscure',
					recognitionBasis: { sourceUrl: 'https://www.imdb.com/name/nm7654321/', fact: 'Sólo aparece una participación secundaria y no hay filmografía pública adicional atribuible.' },
					reason: 'Intérprete secundario con crédito confirmado; las fuentes consultadas no ofrecen foto individual atribuible.',
					sourcesSearched: [
						{ url: 'https://www.imdb.com/name/nm7654321/photos/', result: 'El perfil revisado no contiene una imagen individual verificable.' },
						{ url: 'https://www.imdb.com/name/nm7654321/bio/', result: 'La biografía y créditos no identifican retratos públicos de esta persona.' },
					],
				},
			},
		],
	};
	const coverage = validateMovieCreditCoverage(movie, review);
	assert.deepEqual(coverage.errors, []);
	mkdirSync(intakeDirectory, { recursive: true });
	writeFileSync(moviePath, `${JSON.stringify(movie, null, 2)}\n`);
	writeFileSync(reviewPath, `${JSON.stringify(review, null, 2)}\n`);
	const peopleAudit = spawnSync(process.execPath, [auditCli, '--file', moviePath, '--base-ref', 'origin/main'], { cwd: root, encoding: 'utf8' });
	assert.equal(peopleAudit.status, 0, peopleAudit.stderr || peopleAudit.stdout);

	server = spawn(process.execPath, [astroCli, 'dev', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
		cwd: root,
		stdio: 'ignore',
		env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=6144' },
	});
	let ready = false;
	const deadline = Date.now() + 60_000;
	while (Date.now() < deadline && !ready) {
		try { ready = (await fetch(origin)).ok; } catch {}
		if (!ready) await new Promise(resolve => setTimeout(resolve, 300));
	}
	assert.equal(ready, true, 'Astro dev server did not start');
	browser = await chromium.launch({ headless: true });
	const page = await browser.newPage();
	const response = await page.goto(`${origin}/peliculas/${slug}/`, { waitUntil: 'networkidle' });
	assert.equal(response?.status(), 200);
	assert.equal(await page.getByRole('heading', { level: 1 }).textContent(), 'Temporary Initials Fixture');
	const card = page.locator('.movie-detail__person-card').filter({ hasText: 'Initials Guest' });
	assert.equal(await card.count(), 1);
	assert.equal(await card.locator('.movie-detail__person-avatar img').count(), 0);
	assert.equal((await card.locator('.movie-detail__person-avatar span[aria-hidden="true"]').textContent())?.trim(), 'IG');
	console.log('Playwright verified initials fallback for a new, validated no-photo exception.');
} finally {
	if (browser) await browser.close();
	if (server && server.exitCode === null) {
		server.kill('SIGTERM');
		await Promise.race([
			new Promise(resolve => server.once('exit', resolve)),
			new Promise(resolve => setTimeout(() => { server.kill('SIGKILL'); resolve(); }, 5_000)),
		]);
	}
	if (existsSync(moviePath)) rmSync(moviePath);
	if (existsSync(reviewPath)) rmSync(reviewPath);
	try { rmdirSync(intakeDirectory); } catch {}
}
