import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {imageRegistry,moviesWithArt} from './lib/instagram-images.mjs';
import {planEdition,renderEdition,editionCaption,nextDate} from './lib/instagram-editorial.mjs';
import {argentinaDate,loadMovies} from './lib/social-media.mjs';

// Uses the existing public state read-only. No Buffer key, mutation or reservation.
const response=await fetch('https://raw.githubusercontent.com/Clovhis/sucuplecuc/cineposta-instagram-state/history.json',{signal:AbortSignal.timeout(30000)});
if(!response.ok)throw Error('No se puede leer historial real.');
const history=await response.json();
const days=Number(process.argv.find(a=>a.startsWith('--days='))?.slice(7)||3);
if(!Number.isInteger(days)||days<1||days>60)throw Error('Simular de 1 a 60 días.');
const assets=await imageRegistry(),catalog=await loadMovies();
let date=nextDate(history.posts.map(p=>p.date).sort().at(-1)||argentinaDate());
const out=path.resolve(days===3?'.tmp/supabase-three-days':'.tmp/supabase-sixty-days');await mkdir(out,{recursive:true});
const results=[];
for(let i=0;i<days;i++){
 const movies=moviesWithArt(assets,catalog,history,date),excluded=new Set();let edition,text;
 for(let attempt=0;attempt<20;attempt++){edition=planEdition(movies,history,excluded,date);try{text=editionCaption(edition);break;}catch{edition.slugs.forEach(s=>excluded.add(s));}}
 if(!text)throw Error('No hay una edición válida para '+date);
 const cards=i<3?await renderEdition(edition,path.join(out,date)):edition.movies.map(m=>({rights:{assetIds:[m.socialArt[0].id]}}));
 results.push({date,format:edition.format,slugs:edition.slugs,cards:edition.movies.length>1?edition.movies.length+1:1,captionLength:[...text].length,assetIds:[...new Set(cards.flatMap(c=>c.rights.assetIds))],cinematic:edition.movies.filter(m=>['still','backdrop'].includes(m.socialArt[0].kind)).length,rendered:i<3});
 history.posts.push({...edition,slug:edition.slugs[0],media:cards});date=nextDate(date);
}
await writeFile(path.join(out,'results.json'),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify({days:results.length,uniqueFilms:new Set(results.flatMap(r=>r.slugs)).size,uniquePhotos:new Set(results.flatMap(r=>r.assetIds)).size,formats:Object.fromEntries([...new Set(results.map(r=>r.format))].map(f=>[f,results.filter(r=>r.format===f).length])),cinematicEditions:results.filter(r=>r.cinematic>0).length,output:path.join(out,'results.json')},null,2));
