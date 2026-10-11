import { createServer } from 'vite';
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

// Check the actual catalog consumer, not a copy of its lookup algorithm.
const server = await createServer({ configFile: false, server: { middlewareMode: true }, appType: 'custom' });
try {
	const { getPersonProfiles, getPersonProfileBySlug } = await server.ssrLoadModule('/src/lib/people.ts');
	const profiles = getPersonProfiles();
	const evidence = JSON.parse(await readFile(new URL('sex-evidence.json', import.meta.url), 'utf8'));
	for (const entry of evidence.evidence.filter(entry => entry.sex)) {
		const profile = getPersonProfileBySlug(entry.slug);
		assert.equal(profile.sex, entry.sex, `Classification mismatch: ${entry.name}`);
		assert.equal(profile.sexSourceUrl, entry.sourceUrl, `Source mismatch: ${entry.name}`);
	}
	const summary = {
		profiles: profiles.length,
		masculino: profiles.filter(profile => profile.sex === 'masculino').length,
		femenino: profiles.filter(profile => profile.sex === 'femenino').length,
		unclassified: profiles.filter(profile => !profile.sex).length,
		salmaCanonicalSex: getPersonProfileBySlug('salma-hayek').sex,
	};
	assert.equal(summary.masculino, 495);
	assert.equal(summary.femenino, 250);
	assert.equal(summary.unclassified, 14);
	await writeFile(new URL('profile-classification-contract.json', import.meta.url), JSON.stringify(summary, null, 2) + '\n');
	console.log(summary);
} finally {
	await server.close();
}
