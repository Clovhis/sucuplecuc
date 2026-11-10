import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const newMovieScript = path.resolve('scripts/new-movie.mjs');
const templatePath = path.resolve('templates/movie.template.json');

function run(root, ...args) {
	return spawnSync(process.execPath, [newMovieScript, ...args], { cwd: root, encoding: 'utf8', maxBuffer: 1_000_000 });
}

test('new-movie dry run reports the title-bound incomplete ledger without creating files', () => {
	const root = mkdtempSync(path.join(tmpdir(), 'cineposta-new-movie-dry-run-'));
	try {
		mkdirSync(path.join(root, 'src/data/movies'), { recursive: true });
		mkdirSync(path.join(root, 'templates'), { recursive: true });
		cpSync(templatePath, path.join(root, 'templates/movie.template.json'));
		const result = run(root, '--title', 'Fixture Film', '--year', '2026', '--slug', 'fixture-film-2026', '--dry-run', '--json');
		assert.equal(result.status, 0, result.stderr || result.stdout);
		const output = JSON.parse(result.stdout);
		assert.equal(output.creditReviewPath, 'reports/movie-intake/fixture-film-2026.json');
		assert.equal(output.creditReviewStatus, 'incomplete');
		assert.equal(existsSync(path.join(root, 'src/data/movies/fixture-film-2026.json')), false);
		assert.equal(existsSync(path.join(root, 'reports/movie-intake')), false);
	} finally { rmSync(root, { recursive: true, force: true }); }
});

test('new-movie creates an incomplete cast review beside a new starter before later enrichment', () => {
	const root = mkdtempSync(path.join(tmpdir(), 'cineposta-new-movie-write-'));
	try {
		mkdirSync(path.join(root, 'src/data/movies'), { recursive: true });
		mkdirSync(path.join(root, 'templates'), { recursive: true });
		cpSync(templatePath, path.join(root, 'templates/movie.template.json'));
		const result = run(root, '--title', 'Fixture Film', '--year', '2026', '--slug', 'fixture-film-2026', '--country', 'AR', '--json');
		assert.equal(result.status, 0, result.stderr || result.stdout);
		const movie = JSON.parse(readFileSync(path.join(root, 'src/data/movies/fixture-film-2026.json'), 'utf8'));
		const review = JSON.parse(readFileSync(path.join(root, 'reports/movie-intake/fixture-film-2026.json'), 'utf8'));
		assert.equal(movie.slug, 'fixture-film-2026');
		assert.equal(review.movieSlug, movie.slug);
		assert.equal(review.title, movie.title);
		assert.equal(review.year, movie.year);
		assert.equal(review.status, 'incomplete');
		assert.deepEqual(review.billingSources, []);
		assert.deepEqual(review.credits, []);
		assert.notEqual(review.createdOn, '');
	} finally { rmSync(root, { recursive: true, force: true }); }
});
