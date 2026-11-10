import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import sharp from 'sharp';
import { createMovieCreditCoverageDraft } from './movie-credit-coverage.mjs';

const auditScript = path.resolve('scripts/audit-movie-people.mjs');
const reviewDate = '2026-11-10';
const fullCreditsUrl = 'https://www.imdb.com/title/tt1234567/fullcredits/';

function run(root, ...args) {
	return spawnSync(process.execPath, [auditScript, ...args], { cwd: root, encoding: 'utf8', maxBuffer: 2_000_000 });
}

function auditBase(movie) {
	const personImage = name => `/people/${name.toLowerCase().replace(/\s+/gu, '-')}.webp`;
	const peopleNames = new Set(movie.mainCast.filter(name => name !== 'Voice Performer').concat(movie.director));
	const people = Object.fromEntries([...peopleNames].map((name, index) => [name, {
		name, birthYear: 1980, nationalityPrimary: 'Estadounidense', image: personImage(name),
		imdbId: `nm000000${index + 1}`, imdbUrl: `https://www.imdb.com/name/nm000000${index + 1}/`,
		referenceUrls: [`https://www.themoviedb.org/person/${index + 1}-fixture`],
	}]));
	return { people, personImage };
}

async function createFixture({ missingLeadPortrait = false, brokenExceptionImage = false, exceptionWithPortrait = false, additionalNativeCredit = false, withReview = true, committed = false } = {}) {
	const root = mkdtempSync(path.join(tmpdir(), 'cineposta-people-credit-audit-'));
	const mainCast = missingLeadPortrait ? ['Lead Actor One', 'Voice Performer'] : withReview ? ['Lead Actor One', 'Lead Actor Two', 'Voice Performer'] : ['Lead Actor One', 'Lead Actor Two'];
	if (additionalNativeCredit) mainCast.push('山田太郎');
	const movie = {
		slug: 'fixture-film-2026', title: 'Fixture Film', year: 2026,
		director: 'Director Person', mainCast,
	};
	const { people, personImage } = auditBase(movie);
	if (brokenExceptionImage) {
		people['Voice Performer'] = {
			name: 'Voice Performer', imdbUrl: 'https://www.imdb.com/name/nm7654321/', referenceUrls: ['https://www.themoviedb.org/person/7654321'],
			image: '/people/missing.webp', remoteImageUrl: 'https://images.example/ambiguous.jpg',
		};
	} else if (exceptionWithPortrait) {
		people['Voice Performer'] = {
			name: 'Voice Performer', imdbUrl: 'https://www.imdb.com/name/nm7654321/', referenceUrls: ['https://www.themoviedb.org/person/7654321'],
			image: '/people/voice-performer.webp', remoteImageUrl: 'https://images.example/voice-performer.webp',
		};
	}
	for (const [name, record] of Object.entries(people)) {
		if (!record.image) continue;
		if (name === 'Voice Performer' && brokenExceptionImage) continue;
		const imagePath = path.join(root, 'public', record.image.slice(1));
		mkdirSync(path.dirname(imagePath), { recursive: true });
		await sharp({ create: { width: 220, height: 280, channels: 3, background: '#667788' } }).webp().toFile(imagePath);
	}
	const put = (file, data) => {
		const filePath = path.join(root, file);
		mkdirSync(path.dirname(filePath), { recursive: true });
		writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
	};
	const moviePath = `src/data/movies/${movie.slug}.json`;
	put(moviePath, movie);
	put('src/data/people.json', people);
	const review = {
		...createMovieCreditCoverageDraft(movie, reviewDate), status: 'reviewed', reviewedOn: reviewDate,
		billingSources: [
			{ url: fullCreditsUrl, kind: 'IMDb full credits', fullCredits: true, relevantCreditCount: movie.mainCast.length + 1, checkedOn: reviewDate },
			{ url: 'https://www.themoviedb.org/movie/123/cast', kind: 'TMDb cross-check', fullCredits: false, checkedOn: reviewDate },
		],
		credits: [
			{ name: movie.director, role: 'director', prominence: 'lead', decision: 'include', creditSourceUrl: fullCreditsUrl, identitySources: [
				{ url: 'https://www.imdb.com/name/nm0000001/', fact: 'La filmografía del director confirma su participación en el título.' },
				{ url: 'https://www.themoviedb.org/person/1-director', fact: 'El perfil biográfico independiente confirma la identidad.' },
			], portrait: { sourceUrl: 'https://commons.wikimedia.org/wiki/Director_Person', visuallyVerified: true } },
			...movie.mainCast.map((name, index) => {
				if (name === 'Voice Performer') return {
					name, role: 'performer', prominence: 'supporting', decision: 'include', creditSourceUrl: fullCreditsUrl,
					identitySources: [
						{ url: 'https://www.imdb.com/name/nm7654321/', fact: 'La filmografía de la persona confirma el crédito en la película.' },
						{ url: 'https://www.themoviedb.org/person/7654321-voice', fact: 'El perfil independiente coincide con la identidad acreditada.' },
					],
					portraitException: {
						category: 'secondary-voice-no-individual-portrait',
						reason: 'Voz secundaria confirmada; las fuentes consultadas no identifican un retrato individual confiable.',
						sourcesSearched: [
							{ url: 'https://www.imdb.com/name/nm7654321/photos/', result: 'La ficha de persona no publica una foto individual atribuible.' },
							{ url: 'https://agency.example/talento', result: 'La agencia no publica un retrato verificable de la voz secundaria.' },
						],
					},
				};
				const isNativeSupporting = name === '山田太郎';
				return {
					name, role: 'performer', prominence: isNativeSupporting ? 'supporting' : 'lead', decision: 'include', creditSourceUrl: fullCreditsUrl,
					identitySources: [
						{ url: `https://www.imdb.com/name/nm000000${index + 2}/`, fact: `La filmografía confirma el crédito de ${name} en la película.` },
						{ url: `https://www.themoviedb.org/person/${index + 2}-actor`, fact: `El perfil independiente confirma la identidad de ${name}.` },
					],
					portrait: { sourceUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(name)}`, visuallyVerified: true },
				};
			}),
		],
	};
	if (missingLeadPortrait) review.billingSources[0].relevantCreditCount = 3;
	if (!withReview) review.credits = [];
	if (!missingLeadPortrait && brokenExceptionImage) {
		const voice = review.credits.find(credit => credit.name === 'Voice Performer');
		voice.portrait = undefined;
	}
	if (withReview) put(`reports/movie-intake/${movie.slug}.json`, review);
	if (committed) {
		const git = (args) => spawnSync('git', args, { cwd: root, encoding: 'utf8' });
		assert.equal(git(['init', '--initial-branch=main']).status, 0);
		assert.equal(git(['config', 'user.name', 'Fixture']).status, 0);
		assert.equal(git(['config', 'user.email', 'fixture@example.invalid']).status, 0);
		assert.equal(git(['add', '.']).status, 0);
		assert.equal(git(['commit', '-m', 'fixture baseline']).status, 0);
	}
	return { root, movie, moviePath, review, personImage, people };
}

test('new movie permits one justified secondary no-photo exception while the photographed floor remains intact', async () => {
	const fixture = await createFixture();
	try {
		const result = run(fixture.root, '--file', fixture.moviePath, '--credit-review', `reports/movie-intake/${fixture.movie.slug}.json`);
		assert.equal(result.status, 0, result.stderr || result.stdout);
		assert.match(result.stdout, /Movie people audit passed/u);
	} finally { rmSync(fixture.root, { recursive: true, force: true }); }
});

test('the real people audit accepts an additional native-script credit while preserving the photographed floor', async () => {
	const fixture = await createFixture({ additionalNativeCredit: true });
	try {
		const result = run(fixture.root, '--file', fixture.moviePath, '--credit-review', `reports/movie-intake/${fixture.movie.slug}.json`);
		assert.equal(result.status, 0, result.stderr || result.stdout);
		assert.match(result.stdout, /Movie people audit passed/u);
	} finally { rmSync(fixture.root, { recursive: true, force: true }); }
});

test('portrait exceptions never count toward the director/two-actor photo floor', async () => {
	const fixture = await createFixture({ missingLeadPortrait: true });
	try {
		const result = run(fixture.root, '--file', fixture.moviePath);
		assert.notEqual(result.status, 0, result.stdout || result.stderr);
		assert.match(result.stderr, /al menos dos actores\/intérpretes/u);
	} finally { rmSync(fixture.root, { recursive: true, force: true }); }
});

test('a broken or remote image path cannot be reclassified as a no-photo exception', async () => {
	const fixture = await createFixture({ brokenExceptionImage: true });
	try {
		const result = run(fixture.root, '--file', fixture.moviePath);
		assert.notEqual(result.status, 0, result.stdout || result.stderr);
		assert.match(result.stderr, /declara excepción de retrato aunque conserva una ruta de imagen/u);
	} finally { rmSync(fixture.root, { recursive: true, force: true }); }
});

test('a declared portrait exception cannot coexist with an image URI or satisfy the floor', async () => {
	const fixture = await createFixture({ missingLeadPortrait: true, exceptionWithPortrait: true });
	try {
		const result = run(fixture.root, '--file', fixture.moviePath);
		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /declara excepción de retrato aunque conserva una ruta/u);
		assert.match(result.stderr, /al menos dos actores\/intérpretes/u);
	} finally { rmSync(fixture.root, { recursive: true, force: true }); }
});

test('a new file without the required ledger blocks, while a committed historical file keeps its baseline contract', async () => {
	const missing = await createFixture({ withReview: false });
	try {
		const result = run(missing.root, '--file', missing.moviePath);
		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /falta el ledger de elenco/u);
	} finally { rmSync(missing.root, { recursive: true, force: true }); }

	const historical = await createFixture({ withReview: false, committed: true });
	try {
		const result = run(historical.root, '--file', historical.moviePath);
		assert.equal(result.status, 0, result.stderr || result.stdout);
		const outsideLedger = path.join(historical.root, 'reports/movie-intake/review-for-another-title.json');
		mkdirSync(path.dirname(outsideLedger), { recursive: true });
		writeFileSync(outsideLedger, `${JSON.stringify(historical.review)}\n`);
		const retroactive = run(historical.root, '--file', historical.moviePath, '--credit-review', 'reports/movie-intake/review-for-another-title.json');
		assert.notEqual(retroactive.status, 0);
		assert.match(retroactive.stderr, /no puede aplicar retroactivamente/u);
	} finally { rmSync(historical.root, { recursive: true, force: true }); }
});

test('a published new-title ledger is reused later, and an explicit base ref detects an unmerged addition', async () => {
	const published = await createFixture({ committed: true });
	try {
		const result = run(published.root, '--file', published.moviePath);
		assert.equal(result.status, 0, result.stderr || result.stdout);
	} finally { rmSync(published.root, { recursive: true, force: true }); }

	const branch = await createFixture({ committed: true });
	try {
		const git = (args) => spawnSync('git', args, { cwd: branch.root, encoding: 'utf8' });
		const reviewRelativePath = `reports/movie-intake/${branch.movie.slug}.json`;
		const movieAbsolutePath = path.join(branch.root, branch.moviePath);
		const reviewPath = path.join(branch.root, reviewRelativePath);
		assert.equal(git(['rm', branch.moviePath, reviewRelativePath]).status, 0);
		assert.equal(git(['commit', '-m', 'baseline without candidate']).status, 0);
		mkdirSync(path.dirname(reviewPath), { recursive: true });
		mkdirSync(path.dirname(movieAbsolutePath), { recursive: true });
		writeFileSync(movieAbsolutePath, `${JSON.stringify(branch.movie, null, 2)}\n`);
		writeFileSync(reviewPath, `${JSON.stringify(branch.review, null, 2)}\n`);
		assert.equal(git(['add', branch.moviePath, reviewRelativePath]).status, 0);
		assert.equal(git(['commit', '-m', 'add reviewed candidate']).status, 0);
		const result = run(branch.root, '--file', branch.moviePath, '--base-ref', 'HEAD^');
		assert.equal(result.status, 0, result.stderr || result.stdout);
	} finally { rmSync(branch.root, { recursive: true, force: true }); }
});
