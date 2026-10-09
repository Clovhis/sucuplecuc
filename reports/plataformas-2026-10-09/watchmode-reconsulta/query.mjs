import fs from 'node:fs';import{spawnSync}from'node:child_process';
const dir='reports/plataformas-2026-10-09/watchmode-reconsulta';const manifest=JSON.parse(fs.readFileSync(dir+'/manifest.json'));const results=[];
for(const m of manifest){const slug=m.fullPath.split('/').at(-1);const args=['skills/la-posta-cine-add-movie/scripts/watchmode-metadata.mjs','--title',m.title,'--original-title',m.originalTitle,'--year','2026','--include-ratings'];if(m.externalIds.imdbId)args.push('--imdb-id',m.externalIds.imdbId);else if(m.externalIds.tmdbId)args.push('--tmdb-id',m.externalIds.tmdbId);
 const startedAt=new Date().toISOString();const r=spawnSync(process.execPath,args,{encoding:'utf8',timeout:45000,maxBuffer:1024*1024});let data=null;try{data=JSON.parse(r.stdout);}catch{}
 const result={title:m.title,slug,startedAt,exit:r.status,queryArgs:args.slice(1),error:r.stderr?.trim()||null,data};fs.writeFileSync(dir+'/'+slug+'.json',JSON.stringify(result,null,2)+'\n');results.push(result);console.log(m.title,'exit',r.status,data?JSON.stringify({id:data.match.watchmodeId,rating:data.ratings,credits:data.metadata.credits.length,trailer:data.metadata.trailerYoutubeUrl}):result.error);
 if(result.error&&/HTTP (401|403|429)/.test(result.error)){console.log('Access/quota blocker; stopping API calls.');break;}
}
fs.writeFileSync(dir+'/results.json',JSON.stringify(results,null,2)+'\n');
