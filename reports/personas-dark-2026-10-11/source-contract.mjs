import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const base = '1a0e6f40';
const fromGit = file => execFileSync('git', ['show', `${base}:${file}`], { maxBuffer: 20e6 });
const before = JSON.parse(fromGit('src/data/people.json'));
const after = JSON.parse(await readFile('src/data/people.json', 'utf8'));
let enriched = 0;
for (const person of Object.values(after)) {
	if (!person.sex) continue;
	assert(['masculino', 'femenino'].includes(person.sex));
	assert.match(person.sexSourceUrl, /^https:\/\/www\.wikidata\.org\/wiki\/Q\d+$/);
	assert.equal(person.sexVerifiedAt, '2026-10-11');
	enriched++;
	delete person.sex;
	delete person.sexSourceUrl;
	delete person.sexVerifiedAt;
}
assert.deepEqual(after, before);
const untouched = [
	'src/data/personProfiles.ts', 'src/lib/people.ts', 'src/pages/personas/[slug].astro',
	'src/styles/global.css', 'src/styles/mobile.css', 'src/styles/postometro.css',
	'src/scripts/postometro.ts', '.github/workflows/deploy.yml',
	'public/images/people/cineposta-personajes-archivo-90s.webp',
];
const hashes = {};
for (const file of untouched) {
	const current = await readFile(file);
	const previous = fromGit(file);
	if (file.endsWith('.webp')) assert.equal(current.equals(previous), true, `${file} changed`);
	else assert.equal(current.toString().replace(/\r\n/g, '\n') === previous.toString().replace(/\r\n/g, '\n'), true, `${file} changed`);
	hashes[file] = createHash('sha256').update(current).digest('hex');
}
const result = { base, enriched, priorPersonDataIdentical: true, untouchedFiles: hashes };
await writeFile(new URL('source-contract.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
console.log(`Contract verified: ${enriched} sourced classifications; prior data, shared styles, profiles, illustration and deployment unchanged.`);
