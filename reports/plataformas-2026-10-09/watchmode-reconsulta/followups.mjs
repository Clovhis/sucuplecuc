import fs from 'node:fs';import{spawnSync}from'node:child_process';
const dir='reports/plataformas-2026-10-09/watchmode-reconsulta';
const results=JSON.parse(fs.readFileSync(dir+'/results.json'));
for(const m of results.filter(r=>r.exit!==0)){
 const manifest=JSON.parse(fs.readFileSync(dir+'/manifest.json')).find(x=>x.fullPath.endsWith('/'+m.slug));
 const args=['skills/la-posta-cine-add-movie/scripts/watchmode-metadata.mjs','--title',m.title,'--original-title',manifest.originalTitle,'--year','2026','--include-ratings'];const r=spawnSync(process.execPath,args,{encoding:'utf8',timeout:45000});let data=null;try{data=JSON.parse(r.stdout);}catch{}
 const out={title:m.title,lookup:'name fallback after no external-ID match',verifiedPriorIds:manifest.externalIds,status:r.status,data,error:r.stderr.trim()};fs.writeFileSync(dir+'/'+m.slug+'-by-name.json',JSON.stringify(out,null,2)+'\n');console.log(m.title,data?JSON.stringify({match:data.match,credits:data.metadata.credits.length,trailer:data.metadata.trailerYoutubeUrl,rating:data.ratings}):out.error);
}
const env=fs.readFileSync('.env','utf8');const key=process.env.WATCHMODE_API_KEY??env.match(/^\s*WATCHMODE_API_KEY\s*=\s*(.*)$/m)?.[1]?.trim().replace(/^['"]|['"]$/g,'');if(!key)throw Error('Watchmode key unavailable');
const endpoints=[['jeremy-herbert','https://api.watchmode.com/v1/person/79786734'],['jennifer-greenstreet','https://api.watchmode.com/v1/person/79474806'],['jeff-cameron','https://api.watchmode.com/v1/person/79760638'],['venu-gopal-reddy','https://api.watchmode.com/v1/search/?search_field=imdb_id&search_value=nm7817992&types=person']];
for(const[name,url]of endpoints){try{const r=await fetch(url,{headers:{'X-API-Key':key,Accept:'application/json'},signal:AbortSignal.timeout(15000)});const data=await r.json();const out={name,url,date:new Date().toISOString(),status:r.status,data};fs.writeFileSync(dir+'/person-'+name+'.json',JSON.stringify(out,null,2)+'\n');console.log(name,r.status,JSON.stringify(data));if([401,403,429].includes(r.status))break;}catch(e){console.log(name,e.message);}}
