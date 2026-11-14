import {mkdir,writeFile,readFile} from 'node:fs/promises';
import path from 'node:path';
import {visualMovies} from './lib/instagram-images.mjs';
import {planEdition,renderEdition,editionCaption,nextDate} from './lib/instagram-editorial.mjs';
import {argentinaDate} from './lib/social-media.mjs';

// Uses the existing public state read-only. No Buffer key, mutation or reservation.
const response=await fetch('https://raw.githubusercontent.com/Clovhis/sucuplecuc/cineposta-instagram-state/history.json',{signal:AbortSignal.timeout(30000)});
if(!response.ok)throw Error('No se puede leer historial real.');
const history=await response.json();
let date=nextDate(history.posts.map(p=>p.date).sort().at(-1)||argentinaDate());
const out=path.resolve('.tmp/supabase-three-days');await mkdir(out,{recursive:true});
const results=[];
for(let i=0;i<3;i++){
 const movies=await visualMovies(undefined,{today:date,history});
 const edition=planEdition(movies,history,new Set(),date);
 const cards=await renderEdition(edition,path.join(out,date));
 const text=editionCaption(edition);
 results.push({date,format:edition.format,slugs:edition.slugs,cards:cards.length,captionLength:[...text].length,assetIds:[...new Set(cards.flatMap(c=>c.rights.assetIds))]});
 history.posts.push({...edition,slug:edition.slugs[0],media:cards});date=nextDate(date);
}
await writeFile(path.join(out,'results.json'),JSON.stringify(results,null,2)+'\n');
console.log(await readFile(path.join(out,'results.json'),'utf8'));
