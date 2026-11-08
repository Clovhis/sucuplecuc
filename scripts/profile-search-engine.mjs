import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import path from 'node:path';
import { SEARCH_ACCEPTANCE_CASES } from './search-acceptance-cases.mjs';
const args=process.argv.slice(2), arg=(key,fallback)=>args.includes(key)?args[args.indexOf(key)+1]:fallback;
if(args.includes('--sample')){
	const {createMovieSearch}=await import(pathToFileURL(path.resolve(arg('--engine','src/lib/movie-search.ts'))));
	global.gc();const initial=process.memoryUsage().heapUsed;
	let json=await readFile(arg('--index','dist/search-index-v2.json'),'utf8');
	let payload=JSON.parse(json);
	const source=Array.isArray(payload)?payload:(await import('../src/lib/home-search-codec.ts')).decodeHomeSearchIndex(payload);
	json=null;payload=null; // Compare retained records after decoding, not an extra wire representation.
	const size=Number(arg('--size',source.length));
	const records=Array.from({length:size},(_,i)=>i<source.length?source[i]:{...source[i%source.length],slug:`scale-${i}`});
	global.gc();const dataHeap=process.memoryUsage().heapUsed-initial;
	const start=performance.now();const engine=await createMovieSearch(records);const initializationMs=performance.now()-start;
	global.gc();const engineHeap=process.memoryUsage().heapUsed-initial-dataHeap;
	const samples=SEARCH_ACCEPTANCE_CASES.map(()=>[]);
	for(let round=0;round<8;round++)for(const [i,row] of SEARCH_ACCEPTANCE_CASES.entries()){
		const before=performance.now();engine.search(row.query);if(round>=2)samples[i].push(performance.now()-before);
	}
	const timings=samples.map((values,i)=>{values.sort((a,b)=>a-b);return {query:SEARCH_ACCEPTANCE_CASES[i].query,medianMs:(values[2]+values[3])/2,maxMs:Math.max(...values)};});
	console.log(JSON.stringify({size,initializationMs,dataHeapBytes:dataHeap,engineHeapBytes:engineHeap,totalHeapBytes:dataHeap+engineHeap,timings}));
}else{
	const json=await readFile(arg('--index','dist/search-index-v2.json'));
	const payload=JSON.parse(json);
	const catalogSize=Array.isArray(payload)?payload.length:payload.movies.length;
	const trials=[];
	for(const size of [catalogSize,Math.max(10000,catalogSize)])for(let i=0;i<3;i++){
		const result=spawnSync(process.execPath,['--expose-gc','--experimental-strip-types',import.meta.filename,...args,'--sample','--size',String(size)],{encoding:'utf8',maxBuffer:2e6});
		if(result.status!==0)throw new Error(result.stderr||result.stdout);trials.push(JSON.parse(result.stdout));
	}
	const median=(values)=>values.sort((a,b)=>a-b)[Math.floor(values.length/2)];
	const scenarios=[catalogSize,Math.max(10000,catalogSize)].map((size)=>{
		const rows=trials.filter((r)=>r.size===size), keys=['initializationMs','dataHeapBytes','engineHeapBytes','totalHeapBytes'];
		return {size,...Object.fromEntries(keys.map((key)=>[key,median(rows.map((r)=>r[key]))])),initializationSamplesMs:rows.map((row)=>row.initializationMs),engineHeapSamplesBytes:rows.map((row)=>row.engineHeapBytes),totalHeapSamplesBytes:rows.map((row)=>row.totalHeapBytes),queries:SEARCH_ACCEPTANCE_CASES.map((row,i)=>({query:row.query,medianMs:median(rows.map((r)=>r.timings[i].medianMs)),trialMediansMs:rows.map((r)=>r.timings[i].medianMs),maxMs:Math.max(...rows.map((r)=>r.timings[i].maxMs))}))};
	});
	const report={node:process.version,platform:process.platform,arch:process.arch,trialsPerSize:3,rawBytes:json.length,gzipBytes:gzipSync(json).length,brotliBytes:brotliCompressSync(json).length,scenarios};
	await writeFile(arg('--output','reports/search-optimization-2026-11-07/engine-after.json'),JSON.stringify(report,null,2)+'\n');
	console.log(JSON.stringify({rawBytes:report.rawBytes,gzipBytes:report.gzipBytes,scenarios:scenarios.map(({queries,...row})=>row)},null,2));
}
