import { isDeepStrictEqual } from 'node:util';

/** Existing character records may be extended, never silently removed or rewritten. */
export function retainsExistingCredits(beforeCredits, afterCredits) {
	const before = beforeCredits ?? [];
	const after = afterCredits ?? [];
	if (!Array.isArray(before) || !Array.isArray(after) || before.length > after.length) return false;
	return before.every((credit) => after.some((candidate) => isDeepStrictEqual(credit, candidate)));
}

/** Append only newly verified TMDb credits while keeping every stored credit byte-for-byte. */
export function appendVerifiedCharacterCredits(movie, additions, file = 'movie') {
	const existing = movie.castCharacters ?? [];
	if (!Array.isArray(existing) || !Array.isArray(additions)) throw new Error(file + ': invalid character-credit merge input');
	const merged = [...existing];
	for (const credit of additions) {
		if (merged.some((prior) => prior.actor === credit?.actor || prior.tmdbPersonId === credit?.tmdbPersonId)) continue;
		merged.push(credit);
	}
	if (!retainsExistingCredits(existing, merged)) throw new Error(file + ': stored character credits may not be removed or rewritten.');
	validateCharacterChanges({ ...movie, castCharacters: merged }, file);
	return merged;
}

export function requireCreditCorrectionEvidence(before, after, file, source) {
	if (retainsExistingCredits(before?.castCharacters, after?.castCharacters)) return false;
	if (typeof source !== 'string' || !source.trim()) {
		throw new Error(`${file}: stored character credits may not be removed or rewritten without an explicit correction and verifiable source.`);
	}
	return true;
}

/** A character-only change is safe to audit without widening it to movie/person changes. */
export function hasOnlyCharacterChanges(before, after) {
	if (!before || !after || typeof before !== 'object' || typeof after !== 'object' || Array.isArray(before) || Array.isArray(after)) return false;
	const { castCharacters: beforeCredits, ...beforeRest } = before;
	const { castCharacters: afterCredits, ...afterRest } = after;
	return !isDeepStrictEqual(beforeCredits, afterCredits) &&
		retainsExistingCredits(beforeCredits, afterCredits) &&
		isDeepStrictEqual(beforeRest, afterRest);
}

export function mergeGlobalAuditPaths(changedFiles, ...gitOutputs) {
	return [...new Set([...changedFiles, ...gitOutputs.flatMap((output) => output.split(/\r?\n/))].map((file) => file.trim().replace(/\\/g, '/')).filter(Boolean))];
}

/** Inputs that can change the canonical auditor's result for unchanged movie fields. */
export function hasGlobalMovieAuditChanges(files) {
	return files.some((file) => file === 'src/data/people.json' || file.startsWith('src/data/personProfile') || file.startsWith('src/data/editorialPersonBiographies') || file === 'src/data/editorialFinalCorrections.ts' || file === 'docs/movie-catalog-reference.md' || file === 'docs/person-profile-catalog-reference.md' || file === 'scripts/update-person-profile-catalog-reference.mjs' || file === 'scripts/update-person-profile-catalog-links.mjs' || file === 'package-lock.json' || file.startsWith('public/people/') || file.startsWith('public/assets/posters/') || file.startsWith('public/images/flags/') || file.startsWith('skills/la-posta-cine-auditor/') || file.startsWith('plugins/la-posta-cine/skills/la-posta-cine-auditor/') || file.startsWith('skills/la-posta-cine-add-movie/scripts/review_audit.') || file.startsWith('plugins/la-posta-cine/skills/la-posta-cine-add-movie/scripts/review_audit.'));
}

export function planMovieAudit(characterOnly, canonical, changedFiles) {
	const global = hasGlobalMovieAuditChanges(changedFiles) || canonical.length > 0;
	return { global, candidates: global ? [...canonical, ...characterOnly] : canonical };
}

function isRealDate(value) {
	if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	const time = Date.parse(value + 'T00:00:00Z');
	return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
}

/** Schema and identity checks for permanent character records. */
export function validateCharacterChanges(movie, file) {
	if (!Array.isArray(movie.mainCast)) throw new Error(file + ': invalid mainCast');
	if (movie.castCharacters === undefined) return;
	if (!Array.isArray(movie.castCharacters)) throw new Error(file + ': invalid castCharacters');
	const actors = new Set();
	const people = new Set();
	const movies = new Set();
	for (const credit of movie.castCharacters) {
		if (!credit || typeof credit !== 'object' ||
			typeof credit.actor !== 'string' || !credit.actor.trim() || !movie.mainCast.includes(credit.actor) || actors.has(credit.actor) ||
			typeof credit.character !== 'string' || !credit.character.trim() ||
			!Number.isSafeInteger(credit.tmdbMovieId) || credit.tmdbMovieId <= 0 ||
			!Number.isSafeInteger(credit.tmdbPersonId) || credit.tmdbPersonId <= 0 ||
			!isRealDate(credit.verifiedAt) ||
			(credit.displayCharacter !== undefined && (typeof credit.displayCharacter !== 'string' || !credit.displayCharacter.trim())) ||
			(credit.variants !== undefined && (!Array.isArray(credit.variants) || credit.variants.some((variant) => typeof variant !== 'string' || !variant.trim())))) {
			throw new Error(file + ': invalid or ambiguous character credit');
		}
		actors.add(credit.actor);
		people.add(credit.tmdbPersonId);
		movies.add(credit.tmdbMovieId);
	}
	if (people.size !== movie.castCharacters.length || movies.size > 1) throw new Error(file + ': invalid or ambiguous character credit');
}
