import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { createMovieSearch } from '../src/lib/movie-search.ts';
import { decodeHomeSearchIndex } from '../src/lib/home-search-codec.ts';

// Use the exact static browser payload; synthetic growth repeats real records
// with distinct IDs. Measures the engine, not network, layout, or physical phones.
const args = process.argv.slice(2);
const argument = (key, fallback) => args.includes(key) ? args[args.indexOf(key) + 1] : fallback;
const input = argument('--index', 'dist/search-index-v2.json');
const json = input.startsWith('http') ? await (await fetch(input)).text() : await readFile(input, 'utf8');
const original = decodeHomeSearchIndex(JSON.parse(json));
const queries = ['película vieja de Kubrick', 'terror de los 80', 'Brad Pitt en Netflix', 'ciencia ficción con más de 8 puntos', 'Bradd Pitt en Netflx', 'película de Kubrcik', 'shinnig', 'Paprika detective de los sueños', 'ali', 'a', 'terror en Max', 'zzzzdesconocidoxxxx'];
const report = { catalogSize: original.length, indexBytes: Buffer.byteLength(json), indexGzipBytes: gzipSync(json).length, scenarios: [] };
for (const size of [original.length, 10000]) {
	const records = Array.from({ length: size }, (_, i) => i < original.length ? original[i] : { ...original[i % original.length], slug: `scale-${i}` });
	const start = performance.now();
	const engine = await createMovieSearch(records);
	const scenario = { size, initializationMs: +(performance.now() - start).toFixed(2), queries: [] };
	const samples = queries.map(() => []);
	for (let repetition = 0; repetition < 12; repetition++) {
		for (const [i, query] of queries.entries()) {
			const before = performance.now();
			const result = engine.search(query);
			const duration = performance.now() - before;
			if (repetition > 1) samples[i].push(duration);
			if (repetition === 0) scenario.queries.push({ query, total: result.ranks.size, top: [...result.ranks].sort((a, b) => a[1] - b[1]).slice(0, 3).map(([slug]) => slug) });
		}
	}
	for (const [i, sample] of samples.entries()) {
		sample.sort((a, b) => a - b);
		Object.assign(scenario.queries[i], { medianMs: +sample[5].toFixed(2), maxMs: +sample.at(-1).toFixed(2) });
	}
	report.scenarios.push(scenario);
}
const output = argument('--output', null);
if (output) {
	await mkdir(path.dirname(output), { recursive: true });
	await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
}
console.log(JSON.stringify(report, null, 2));
