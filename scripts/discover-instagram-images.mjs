// Discovery only. TMDB access is not a publication license. Never adds approved grants.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {ROOT,validSlug} from './lib/social-media.mjs';

const slug=process.argv[2];if(!validSlug(slug))throw Error('Uso: npm run social:images:discover -- slug');
for(const file of ['.env.local','.env'])try {process.loadEnvFile(path.join(ROOT,file));}catch{}
const movie=JSON.parse(await readFile(path.join(ROOT,'src/data/movies',slug+'.json'),'utf8'));
const key=process.env.TMDB_API_KEY?.trim();if(!key)throw Error('Falta TMDB_API_KEY local. No se imprime ni modifica la credencial.');
const api=async endpoint=>{
 const url=new URL('https://api.themoviedb.org/3'+endpoint);url.searchParams.set('api_key',key);
 const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`TMDB HTTP ${r.status}`);return r.json();
};
const normalize=s=>s.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const recorded=[...new Set((movie.castCharacters||[]).map(c=>c.tmdbMovieId).filter(Boolean))];
let id;
if(recorded.length===1)id=recorded[0];
else {
 const found=await api('/search/movie?query='+encodeURIComponent(movie.originalTitle||movie.title)+'&year='+movie.year);
 const matches=found.results.filter(m=>Number(m.release_date?.slice(0,4))===movie.year && [movie.originalTitle,movie.title].filter(Boolean).some(t=>[m.original_title,m.title].some(n=>normalize(n)===normalize(t))));
 if(matches.length!==1)throw Error('Identidad TMDB ambigua: se requiere resolución editorial.');id=matches[0].id;
}
const detail=await api(`/movie/${id}?append_to_response=images,credits`);
if(Number(detail.release_date?.slice(0,4))!==movie.year)throw Error('Año TMDB distinto del catálogo.');
if(![movie.originalTitle,movie.title].filter(Boolean).some(t=>[detail.original_title,detail.title].some(n=>n&&normalize(n)===normalize(t))))throw Error('Título TMDB distinto del catálogo.');
const candidates=['posters','backdrops'].flatMap(kind=>(detail.images[kind]||[]).slice(0,12).map(a=>({kind:kind==='posters'?'poster':'backdrop',url:'https://image.tmdb.org/t/p/original'+a.file_path,width:a.width,height:a.height,language:a.iso_639_1,status:'pending',permission:'TMDB no es titular de las imágenes. Se requiere licencia del titular o permiso del paquete de prensa.'})));
const cast=detail.credits.cast.slice(0,10).filter(p=>p.profile_path).map(p=>({id:p.id,name:p.name,url:'https://image.tmdb.org/t/p/original'+p.profile_path,status:'pending'}));
const result={slug,title:detail.title,year:movie.year,tmdbId:id,candidates,cast,rightsReference:'https://developer.themoviedb.org/docs/faq',note:'Sólo localización. No descarga imágenes, no cambia catálogo ni registro de permisos y no publica.'};
await mkdir(path.join(ROOT,'.tmp/instagram-discovery'),{recursive:true});await writeFile(path.join(ROOT,'.tmp/instagram-discovery',slug+'.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({slug,tmdbId:id,candidates:candidates.length,portraits:cast.length,status:'pending-rights'}));
