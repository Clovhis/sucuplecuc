// Administrative preparation, outside the daily cron. Never calls Buffer.
// Input: reviewed source-package manifest with local originals and supplied captions.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {ROOT,digest,loadMovies,argentinaDate} from './lib/social-media.mjs';
import {resolveSourceGrant} from './lib/social-grants.mjs';

const arg=name=>process.argv.find(x=>x.startsWith('--'+name+'='))?.split('=').slice(1).join('=');
const manifestPath=arg('manifest'),grantId=arg('grant');
if(!manifestPath||!grantId)throw Error('Usar --manifest=archivo.json --grant=ID; revisión editorial previa obligatoria.');
const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
const grant=JSON.parse(await readFile(path.join(ROOT,'assets/social/source-grants.json'),'utf8')).grants.find(g=>g.id===grantId);
if(!grant||grant.status!=='approved')throw Error('La fuente/paquete aún no tiene permiso aprobado.');
const grantEvidence=await readFile(path.join(ROOT,grant.evidencePath),'utf8');
const movies=await loadMovies(),people=JSON.parse(await readFile(path.join(ROOT,'src/data/people.json'),'utf8'));
const norm=s=>s.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const out=path.join(ROOT,'.tmp/press-upload');await mkdir(out,{recursive:true});
await mkdir(path.join(ROOT,'assets/social/press-packages'),{recursive:true});
const packages=new Map(),prepared=[],hashes=new Set();
for(const candidate of manifest){
 const movie=movies.find(m=>m.slug===candidate.movie.slug);
 if(!movie||movie.year!==candidate.movie.year||movie.originalTitle!==candidate.movie.originalTitle)throw Error('Identidad de película cambió.');
 const portrait=/director/i.test(candidate.file);
 const filenamePerson=candidate.file.split(/director[_-]?/i).at(-1).replace(/\.(jpe?g|png)$/i,'');
 const person=portrait?Object.keys(people).find(name=>norm(name)===norm(filenamePerson)):undefined;
 if(portrait&&!person){console.warn('Sin identidad exacta:',candidate.file);continue;}
 const argentina=candidate.reviewRegion==='AR'||(portrait&&/Argentin/i.test(people[person]?.nationalityPrimary||''));
 if(argentina&&(candidate.argentinaReview?.status!=='approved'||!candidate.argentinaReview.evidenceUrl||!candidate.argentinaReview.summary)){console.warn('Requiere revisión argentina:',person||movie.slug);continue;}
 const captionText=candidate.captionText.replace(/BonhÃ´te/g,'Bonhôte').replace(/\s+/g,' ').trim();
 const sections=captionText.split(/(?=DIRECTOR\s*HEADSHOT|FILM\s*STILL\s*\d+|COPYRIGHT)/i);
 const number=candidate.file.match(/still[_-]?(\d+)/i)?.[1];
 const section=candidate.suppliedCaption||(portrait?sections.find(s=>/^DIRECTOR\s*HEADSHOT/i.test(s)&&s.includes(person.split(' ')[0])):sections.find(s=>new RegExp('^FILM\\s*STILL\\s*'+number+'(?:\\D|$)','i').test(s)));
 if(!section)throw Error('Falta caption individual verificable: '+candidate.file);
 const author=section.match(/\|\s*photo\s+(?:by|courtesy of)\s+(.+?)[.]?$/i)?.[1]?.replace(/\.$/,'');
 const credit=candidate.credit||(grant.context?.festival==='Sundance'?(author?`${author} · Courtesy of Sundance Institute`:'Courtesy of Sundance Institute'):null);
 if(!credit)throw Error('Falta crédito verificado del paquete.');
 try{
  const original=await readFile(candidate.path),decoded=sharp(original,{failOn:'warning'}),info=await decoded.metadata();
  if(Math.min(info.width,info.height)<(portrait?700:600)){console.warn('Resolución insuficiente:',candidate.file,info.width,info.height);continue;}
  const bytes=await decoded.rotate().resize({width:1920,height:1920,fit:'inside',withoutEnlargement:true}).toColourspace('srgb').webp({quality:85}).toBuffer();
  await sharp(bytes,{failOn:'warning'}).raw().toBuffer();
  const sha256=digest(bytes);if(hashes.has(sha256))continue;hashes.add(sha256);
  const dimensions=await sharp(bytes).metadata();if(bytes.length>2097152)throw Error('Supera presupuesto de Storage.');
  const prefix=grant.context?.festival?`sundance-${candidate.year}`:grant.id;
  const id=`${prefix}-${movie.slug}-${digest(candidate.file).slice(0,10)}`;
  const packageId=`${prefix}-${movie.slug}`;
  const asset={id,status:'approved',kind:portrait?'portrait':'still',subject:portrait?person:movie.title,...(portrait?{person}:{}),slugs:[movie.slug],title:`${portrait?person:movie.title} · ${portrait?'retrato de dirección':'still '+number}`,sourceUrl:grant.sourceUrl,originalUrl:candidate.packageUrl,packageUrl:candidate.packageUrl,archiveEntry:candidate.archiveEntry,grantId:grant.id,grantEvidenceSha256:grant.evidenceSha256,...(grant.context?.festival?{editorialContext:{festival:grant.context.festival,year:candidate.year}}:{}),evidenceUrl:candidate.packageUrl,evidencePath:`assets/social/press-packages/${packageId}.json`,license:grant.license,licenseUrl:grant.sourceUrl,credit,suppliedCaption:section,verifiedAt:argentinaDate(),reviewRegion:'international',permission:{...grant.permission},path:`assets/social/photos/${id}.webp`,originalSha256:digest(original),sha256,width:dimensions.width,height:dimensions.height,changes:'Reducción y conversión técnica a WebP sRGB. Imagen completa, sin recorte, filtros ni textos superpuestos.'};
  if(argentina){asset.reviewRegion='AR';asset.argentinaReview=candidate.argentinaReview;}
  if(!resolveSourceGrant(asset,{id:grant.id,status:grant.status,metadata:grant,evidence_raw:grantEvidence,evidence_sha256:grant.evidenceSha256},argentinaDate()))throw Error('Permiso no vigente.');
  await writeFile(path.join(out,id+'.webp'),bytes);
  if(!packages.has(packageId))packages.set(packageId,{sourceGrant:grant.id,packageUrl:candidate.packageUrl,captionDocument:candidate.captionDocument,captionText,film:{slug:movie.slug,title:movie.originalTitle,year:movie.year,director:movie.director},files:[]});
  packages.get(packageId).files.push({filename:candidate.file,originalSha256:asset.originalSha256,sha256});prepared.push(asset);
 }catch(e){console.warn('Se excluye',candidate.file,e.message);}
}
for(const [id,evidence]of packages){const raw=JSON.stringify(evidence,null,2)+'\n';await writeFile(path.join(ROOT,'assets/social/press-packages',id+'.json'),raw);for(const asset of prepared.filter(a=>a.evidencePath.endsWith('/'+id+'.json')))asset.evidenceSha256=digest(raw);}
await writeFile(path.join(ROOT,'.tmp/press-prepared-assets.json'),JSON.stringify(prepared,null,2)+'\n');
console.log(JSON.stringify({prepared:prepared.length,stills:prepared.filter(a=>a.kind==='still').length,portraits:prepared.filter(a=>a.kind==='portrait').length,packages:packages.size}));
