import { chromium, webkit, devices } from '@playwright/test';
import { writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
const arg=(key,fallback)=>process.argv.includes(key)?process.argv[process.argv.indexOf(key)+1]:fallback;
const url=arg('--url','http://127.0.0.1:43214');
const snapshot=arg('--snapshot','');
const report={method:'Fresh browser contexts; local static HTTP server; external requests and images blocked on both sides. Not a physical device or network-speed simulation. Three trials per engine. Chromium heap is post-GC; WebKit has no equivalent heap API.',scenarios:[]};
for(const [name,engine,device] of [['chromium',chromium,'Pixel 5'],['webkit',webkit,'iPhone 13']]){
	const browser=await engine.launch();
	for(let trial=0;trial<3;trial++){
		const context=await browser.newContext(devices[device]);
		await context.route('**/*',async(route)=>{
			const request=route.request();
			if(new URL(request.url()).origin!==new URL(url).origin||request.resourceType()==='image')return route.abort();
			const pathname=new URL(request.url()).pathname;
			if(snapshot && pathname==='/')return route.fulfill({contentType:'text/html',body:(await readFile(path.join(snapshot,'site/index.html'),'utf8')).replace('; upgrade-insecure-requests','')});
			if(snapshot && pathname.startsWith('/_astro/'))return route.fulfill({contentType:pathname.endsWith('.css')?'text/css':'text/javascript',body:await readFile(path.join(snapshot,'site/_astro',path.basename(pathname)))});
			if(snapshot && /^\/search-index(?:-v2)?\.json$/.test(pathname))return route.fulfill({contentType:'application/json',body:await readFile(path.join(snapshot,'search-index.json'))});
			return route.continue();
		});
		await context.addInitScript(()=>{
			window.__initialTasks=[];
			if(PerformanceObserver.supportedEntryTypes.includes('longtask'))new PerformanceObserver((list)=>window.__initialTasks.push(...list.getEntries().map((entry)=>({at:entry.startTime,ms:entry.duration})))).observe({type:'longtask'});
		});
		const page=await context.newPage();
		const errors=[];page.on('pageerror',(e)=>errors.push(e.message));
		await page.goto(url,{waitUntil:'domcontentloaded'});
		await page.waitForFunction(()=>document.querySelector('[data-movie-search-root]')?.getAttribute('data-home-catalog-ready')==='true');
		const initial=await page.evaluate(()=>({readyMs:performance.now(),inlineIndexChars:document.querySelector('[data-home-movie-index]')?.textContent.length,domNodes:document.querySelectorAll('*').length,longTasksSupported:PerformanceObserver.supportedEntryTypes.includes('longtask'),longTasks:window.__initialTasks,measures:performance.getEntriesByType('measure').filter((entry)=>entry.name.startsWith('cineposta:index')).map((entry)=>({name:entry.name,ms:entry.duration})),resources:performance.getEntriesByType('resource').filter((r)=>/search-index|\.js/.test(r.name)).map((r)=>({name:new URL(r.name).pathname,decodedBytes:r.decodedBodySize,durationMs:r.duration}))}));
		let heapBytes=null;
		if(name==='chromium'){const cdp=await context.newCDPSession(page);await cdp.send('HeapProfiler.collectGarbage');heapBytes=(await cdp.send('Runtime.getHeapUsage')).usedSize;await cdp.detach();}
		const queries=[];
		for(const query of ['terror de los 80','Brad Pitt en Netflix','El resplandor','shinnig','ciencia ficción con más de 8 puntos']){
			await page.locator('[data-movie-search-input]').fill(query);
			await page.waitForFunction((q)=>new URL(location.href).searchParams.get('q')===q,query);
			queries.push(await page.evaluate((q)=>({query:q,pipelineMs:performance.getEntriesByName('cineposta:search').at(-1)?.duration,cards:document.querySelectorAll('[data-movie-search-grid] [data-movie-card]').length}),query));
		}
		report.scenarios.push({engine:name,browserVersion:browser.version(),device,trial,initial,heapBytes,queries,errors});
		await context.close();
	}
	await browser.close();
}
await writeFile(arg('--output','reports/search-optimization-2026-11-07/browser-after.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report.scenarios.map(({engine,trial,initial,heapBytes})=>({engine,trial,readyMs:initial.readyMs,heapBytes,inlineIndexChars:initial.inlineIndexChars})),null,2));
