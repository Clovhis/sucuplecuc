import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

const origin = 'https://www.cineposta.com.ar';
const response = await fetch(`${origin}/personas/?release=${Date.now()}`, { cache: 'no-store' });
assert.equal(response.status, 200);
const html = await response.text();
assert.match(html, /people-edition/);
assert.match(html, /name="sexo"/);
assert.match(html, /value="brasileno">Brasileña<\/option>/);
assert.match(html, /href="https:\/\/www\.cineposta\.com\.ar\/personas\/"/);
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const styles = [...new Set([...html.matchAll(/href="(\/_astro\/[\w.-]+\.css)"/g)].map(match => match[1]))];
assert(styles.length > 0);
const assets = [];
for (const asset of styles) {
	const result = await fetch(`${origin}${asset}`, { cache: 'no-store' });
	assert.equal(result.status, 200);
	const remote = Buffer.from(await result.arrayBuffer());
	const local = await readFile(`dist${asset}`);
	assert.equal(digest(remote), digest(local), `Deployed CSS mismatch: ${asset}`);
	assets.push({ asset, sha256: digest(remote), status: result.status });
}
const artwork = '/images/people/cineposta-personajes-archivo-90s.webp';
const artResponse = await fetch(`${origin}${artwork}`);
assert.equal(artResponse.status, 200);
assert.equal(digest(Buffer.from(await artResponse.arrayBuffer())), digest(await readFile(`public${artwork}`)));
const proof = {
	sha: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
	url: `${origin}/personas/`, status: response.status, css: assets,
	masculino: [...html.matchAll(/data-sex="masculino"/g)].length,
	femenino: [...html.matchAll(/data-sex="femenino"/g)].length,
	artworkIdentical: true, canonicalVerified: true, grammaticalLabelsVerified: true,
};
assert.equal(proof.masculino, 495);
assert.equal(proof.femenino, 250);
const archive = 'C:/Users/yosoy/.codex/artifacts/CinePosta/personas-2026-10-11-release';
await mkdir(archive, { recursive: true });
await writeFile(`${archive}/production-proof.json`, JSON.stringify(proof, null, 2) + '\n');
console.log(JSON.stringify(proof));
