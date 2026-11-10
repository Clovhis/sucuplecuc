import test from 'node:test';
import assert from 'node:assert/strict';
import { appendVerifiedCharacterCredits, hasOnlyCharacterChanges, hasGlobalMovieAuditChanges, mergeGlobalAuditPaths, planMovieAudit, requireCreditCorrectionEvidence, retainsExistingCredits, validateCharacterChanges } from './character-change-policy.mjs';

const base = { title: 'Fixture', mainCast: ['Actor'], director: 'Director', review: 'Review' };
const credit = { actor: 'Actor', character: 'Personaje', tmdbMovieId: 1, tmdbPersonId: 2, verifiedAt: '2000-01-01' };

test('sólo las adiciones de personajes pueden auditarse sin una corrección explícita', () => {
	assert.equal(hasOnlyCharacterChanges(base, { ...base, castCharacters: [credit] }), true);
	assert.equal(hasOnlyCharacterChanges({ ...base, castCharacters: [credit] }, { ...base, castCharacters: [{ ...credit, character: 'Otro' }] }), false);
	assert.equal(hasOnlyCharacterChanges({ ...base, castCharacters: [credit] }, { ...base }), false);
	assert.equal(hasOnlyCharacterChanges(null, { ...base, castCharacters: [credit] }), false);
	assert.equal(hasOnlyCharacterChanges(base, { ...base, title: 'Changed', castCharacters: [credit] }), false);
	assert.equal(hasOnlyCharacterChanges(base, { ...base, mainCast: ['Another'], castCharacters: [credit] }), false);
	assert.equal(hasOnlyCharacterChanges(base, { ...base }), false);
});

test('las fichas conservan cada crédito previo exacto salvo corrección explícita', () => {
	assert.equal(retainsExistingCredits([credit], [credit]), true);
	assert.equal(retainsExistingCredits([credit], [credit, { ...credit, actor: 'Other', tmdbPersonId: 3 }]), true);
	assert.equal(retainsExistingCredits([credit], []), false);
	assert.equal(retainsExistingCredits([credit], [{ ...credit, character: 'Changed' }]), false);
	assert.equal(retainsExistingCredits([], []), true);
	assert.equal(requireCreditCorrectionEvidence({ ...base, castCharacters: [credit] }, { ...base, castCharacters: [credit] }, 'test', undefined), false);
	assert.throws(() => requireCreditCorrectionEvidence({ ...base, castCharacters: [credit] }, { ...base }, 'test', undefined), /verifiable source/);
	assert.equal(requireCreditCorrectionEvidence({ ...base, castCharacters: [credit] }, { ...base }, 'test', 'https://example.org/evidence'), true);
});

test('al agregar un actor con IDs y papel TMDb se conserva exacto cada personaje previamente verificado', () => {
	const previous = { actor: 'Actor', character: 'Personaje anterior', tmdbMovieId: 42, tmdbPersonId: 2, verifiedAt: '2026-11-10' };
	const added = { actor: 'New Actor', character: 'Personaje de créditos TMDb', tmdbMovieId: 42, tmdbPersonId: 3, verifiedAt: '2026-11-10' };
	const movie = { ...base, mainCast: ['Actor', 'New Actor'], castCharacters: [previous] };
	const merged = appendVerifiedCharacterCredits(movie, [added], 'new-movie.json');
	assert.deepEqual(merged, [previous, added]);
	assert.equal(retainsExistingCredits(movie.castCharacters, merged), true);
	assert.doesNotThrow(() => validateCharacterChanges({ ...movie, castCharacters: merged }, 'new-movie.json'));
	assert.throws(() => appendVerifiedCharacterCredits(movie, [{ ...added, actor: 'Uncredited Performer' }], 'new-movie.json'), /invalid or ambiguous character credit/u);
});

test('todos los cambios globales fuerzan la auditoría canónica', () => {
	for (const file of ['src/data/people.json', 'src/data/personProfiles.ts', 'src/data/personProfilesWave21C.ts', 'src/data/personProfileArgentineBatchBuilder.ts', 'src/data/personProfileCatalogCredits.generated.ts', 'src/data/editorialPersonBiographiesWave10A.ts', 'src/data/editorialFinalCorrections.ts', 'public/people/actor.webp', 'public/assets/posters/2020/test.webp', 'public/images/flags/ar.svg', 'docs/movie-catalog-reference.md', 'docs/person-profile-catalog-reference.md', 'scripts/update-person-profile-catalog-reference.mjs', 'scripts/update-person-profile-catalog-links.mjs', 'package-lock.json', 'skills/la-posta-cine-auditor/scripts/audit_recent_movies.cjs', 'skills/la-posta-cine-add-movie/scripts/review_audit.cjs', 'plugins/la-posta-cine/skills/la-posta-cine-add-movie/scripts/review_audit.cjs']) assert.equal(hasGlobalMovieAuditChanges([file]), true, file);
	assert.equal(hasGlobalMovieAuditChanges(['src/data/movies/test.json', 'src/lib/movie-search.ts']), false);
});

test('mezclas de cambios auditan todas las películas pertinentes', () => {
	const characterOnly = ['src/data/movies/characters.json'];
	const canonical = ['src/data/movies/new.json', 'src/data/movies/changed-title.json'];
	assert.deepEqual(planMovieAudit(characterOnly, canonical, [...characterOnly, ...canonical]).candidates, [...canonical, ...characterOnly]);
	assert.deepEqual(planMovieAudit(characterOnly, [], characterOnly).candidates, []);
	assert.deepEqual(planMovieAudit(characterOnly, canonical, ['src/data/people.json']).candidates, [...canonical, ...characterOnly]);
});

test('rutas borradas, renombradas y no rastreadas permanecen visibles', () => {
	const files = mergeGlobalAuditPaths(['src/data/movies/characters.json'], 'src/data/personProfilesWave21C.ts\r\nrenamed.txt\n', 'src\\data\\editorialPersonBiographiesWave13.ts\n');
	assert.equal(hasGlobalMovieAuditChanges(files), true);
	assert.ok(files.includes('src/data/personProfilesWave21C.ts'));
	assert.ok(files.includes('src/data/editorialPersonBiographiesWave13.ts'));
	assert.equal(planMovieAudit(['src/data/movies/characters.json'], [], files).candidates.length, 1);
});

test('valida actores, IDs, duplicados, personajes y relación con mainCast', () => {
	assert.doesNotThrow(() => validateCharacterChanges({ ...base, castCharacters: [credit] }, 'test'));
	assert.throws(() => validateCharacterChanges({ ...base, castCharacters: [credit, credit] }, 'test'));
	assert.throws(() => validateCharacterChanges({ ...base, castCharacters: [{ ...credit, actor: 'Another' }] }, 'test'));
	assert.throws(() => validateCharacterChanges({ ...base, castCharacters: [{ ...credit, verifiedAt: '2023-02-29' }] }, 'test'));
	assert.throws(() => validateCharacterChanges({ ...base, castCharacters: [{ ...credit, tmdbMovieId: 0 }] }, 'test'));
	assert.throws(() => validateCharacterChanges({ ...base, castCharacters: [{ ...credit, tmdbPersonId: 0 }] }, 'test'));
	assert.throws(() => validateCharacterChanges({ ...base, castCharacters: [{ ...credit, variants: [''] }] }, 'test'));
	assert.throws(() => validateCharacterChanges({ ...base, mainCast: ['Actor', 'Other'], castCharacters: [credit, { ...credit, actor: 'Other' }] }, 'test'));
	assert.throws(() => validateCharacterChanges({ ...base, mainCast: ['Actor', 'Other'], castCharacters: [credit, { ...credit, actor: 'Other', tmdbPersonId: 3, tmdbMovieId: 4 }] }, 'test'));
});

export {};
