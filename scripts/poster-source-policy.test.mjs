import assert from 'node:assert/strict';
import {
	assertPosterSourceAllowed,
	assertPosterSourceDimensions,
	blockedPosterHost,
} from './poster-source-policy.mjs';

const blockedUrls = [
	'https://www.cinesargentinos.com.ar/poster/10511-el-arbol-magico.jpg',
	'https://new.cinesargentinos.com.ar/static/archivos/73547',
	'https://m.cinesargentinos.com.ar/poster/example.jpg',
];

for (const url of blockedUrls) {
	assert.equal(blockedPosterHost(url), 'cinesargentinos.com.ar');
	assert.throws(() => assertPosterSourceAllowed(url), /blocked-poster-source/);
}

assert.equal(blockedPosterHost('https://www.impawards.com/2026/posters/example.jpg'), null);
assert.doesNotThrow(() => assertPosterSourceAllowed('https://www.impawards.com/2026/posters/example.jpg'));
assert.doesNotThrow(() => assertPosterSourceDimensions({ width: 720, height: 1000 }));
assert.throws(() => assertPosterSourceDimensions({ width: 480, height: 720 }), /low-resolution-poster-source/);

console.log('Poster source policy tests passed.');
