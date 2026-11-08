import test from 'node:test';
import assert from 'node:assert/strict';
import { hasOnlyCharacterChanges, hasGlobalMovieAuditChanges, mergeGlobalAuditPaths, planMovieAudit, validateCharacterChanges } from './character-change-policy.mjs';

const base = { title: 'Fixture', mainCast: ['Actor'], director: 'Director', review: 'Review' };
const credit = { actor: 'Actor', character: 'Personaje', tmdbMovieId: 1, tmdbPersonId: 2, verifiedAt: '2000-01-01' };
test('only character changes are eligible, independently of JSON property ordering', () => {
	assert.equal(hasOnlyCharacterChanges(base, { ...base, castCharacters: [credit] }), true);
	assert.equal(hasOnlyCharacterChanges(null, { ...base, castCharacters: [credit] }), false);
	assert.equal(hasOnlyCharacterChanges(base, { ...base, title: 'Changed', castCharacters: [credit] }), false);
	assert.equal(hasOnlyCharacterChanges(base, { ...base, mainCast: ['Another'], castCharacters: [credit] }), false);
	assert.equal(hasOnlyCharacterChanges(base, { ...base }), false);
});
test('all global auditor dependencies force the canonical audit', () => {
	for (const file of ['src/data/people.json', 'src/data/personProfiles.ts', 'src/data/personProfilesWave21C.ts', 'src/data/personProfileArgentineBatchBuilder.ts', 'src/data/personProfileCatalogCredits.generated.ts', 'src/data/editorialPersonBiographiesWave10A.ts', 'src/data/editorialFinalCorrections.ts', 'public/people/actor.webp', 'public/assets/posters/2020/test.webp', 'public/images/flags/ar.svg', 'docs/movie-catalog-reference.md', 'docs/person-profile-catalog-reference.md', 'scripts/update-person-profile-catalog-reference.mjs', 'scripts/update-person-profile-catalog-links.mjs', 'package-lock.json', 'skills/la-posta-cine-auditor/scripts/audit_recent_movies.cjs', 'skills/la-posta-cine-add-movie/scripts/review_audit.cjs', 'plugins/la-posta-cine/skills/la-posta-cine-add-movie/scripts/review_audit.cjs']) assert.equal(hasGlobalMovieAuditChanges([file]), true, file);
	assert.equal(hasGlobalMovieAuditChanges(['src/data/movies/test.json', 'src/lib/movie-search.ts']), false);
});
test('mixed changes audit all other films and global changes restore every candidate', () => {
	const characterOnly = ['src/data/movies/characters.json'];
	const canonical = ['src/data/movies/new.json', 'src/data/movies/changed-title.json'];
	assert.deepEqual(planMovieAudit(characterOnly, canonical, [...characterOnly, ...canonical]).candidates, [...canonical, ...characterOnly]);
	assert.deepEqual(planMovieAudit(characterOnly, [], characterOnly).candidates, []);
	assert.deepEqual(planMovieAudit(characterOnly, canonical, ['src/data/people.json']).candidates, [...canonical, ...characterOnly]);
});
test('deleted, renamed and untracked global dependency paths remain visible', () => {
	const files = mergeGlobalAuditPaths(['src/data/movies/characters.json'], 'src/data/personProfilesWave21C.ts\r\nrenamed.txt\n', 'src\\data\\editorialPersonBiographiesWave13.ts\n');
	assert.equal(hasGlobalMovieAuditChanges(files), true);
	assert.ok(files.includes('src/data/personProfilesWave21C.ts'));
	assert.ok(files.includes('src/data/editorialPersonBiographiesWave13.ts'));
	assert.equal(planMovieAudit(['src/data/movies/characters.json'], [], files).candidates.length, 1);
});
test('validates character data without expiring old credits', () => {
	assert.doesNotThrow(() => validateCharacterChanges({ ...base, castCharacters: [credit] }, 'test'));
	assert.throws(() => validateCharacterChanges({ ...base, castCharacters: [credit, credit] }, 'test'));
	assert.throws(() => validateCharacterChanges({ ...base, castCharacters: [{ ...credit, actor: 'Another' }] }, 'test'));
	assert.throws(() => validateCharacterChanges({ ...base, castCharacters: [{ ...credit, verifiedAt: '2023-02-29' }] }, 'test'));
	assert.throws(() => validateCharacterChanges({ ...base, castCharacters: [{ ...credit, tmdbPersonId: 0 }] }, 'test'));
	assert.throws(() => validateCharacterChanges({ ...base, castCharacters: [{ ...credit, variants: [''] }] }, 'test'));
	assert.throws(() => validateCharacterChanges({ ...base, mainCast: ['Actor', 'Other'], castCharacters: [credit, { ...credit, actor: 'Other' }] }, 'test'));
	assert.throws(() => validateCharacterChanges({ ...base, mainCast: ['Actor', 'Other'], castCharacters: [credit, { ...credit, actor: 'Other', tmdbPersonId: 3, tmdbMovieId: 4 }] }, 'test'));
});
