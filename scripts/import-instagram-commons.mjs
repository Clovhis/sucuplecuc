// Explicit editorial import, never part of the daily workflow. Commons is a source,
// not a blanket license: inspect the file and its recorded grant before --approve.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {ROOT,digest,argentinaDate} from './lib/social-media.mjs';

const value=name=>process.argv[process.argv.indexOf(name)+1];
const title=value('--file'),person=process.argv.includes('--person')?value('--person'):null;
const slugs=process.argv.includes('--slugs')?value('--slugs').split(','):[];
const approve=process.argv.includes('--approve');
if(!process.argv.includes('--file') || (!person&&!slugs.length))throw Error('Indicá --file "File:..." y --person "Nombre exacto" o --slugs slug[,slug]. --approve sólo después de revisar el material.');
const url=new URL('https://commons.wikimedia.org/w/api.php');
url.search=new URLSearchParams({action:'query',format:'json',prop:'imageinfo|revisions',iiprop:'url|size|extmetadata',rvprop:'ids',titles:title.startsWith('File:')?title:`File:${title}`});
const response=await fetch(url,{headers:{'User-Agent':'CinePosta/1.0 (editorial image rights; cineposta.com.ar)'},signal:AbortSignal.timeout(30000)});
if(!response.ok)throw Error(`Commons HTTP ${response.status}`);
const data=await response.json(),page=Object.values(data.query.pages)[0],info=page.imageinfo?.[0];
if(!info)throw Error('No se encontró el archivo exacto.');
const meta=info.extmetadata,license=meta.LicenseShortName?.value;
if(!/^CC BY(?:-SA)? (2\.0|3\.0|4\.0)$/u.test(license||''))throw Error(`Licencia requiere revisión independiente: ${license}`);
if(Math.min(info.width,info.height)<700)throw Error('Resolución insuficiente: usar un original de mayor tamaño.');
const clean=s=>(s||'').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const original=new URL(info.url);original.search='';
const imageResponse=await fetch(original,{headers:{'User-Agent':'CinePosta/1.0 (editorial image rights; https://cineposta.com.ar)'},signal:AbortSignal.timeout(30000)});
if(!imageResponse.ok)throw Error(`Imagen HTTP ${imageResponse.status}`);
const originalBytes=Buffer.from(await imageResponse.arrayBuffer());
const id=`commons-${page.pageid}`;
const entry={id,status:approve?'approved':'pending',kind:person?'portrait':'event-photo',subject:person||'KATSEYE',person,slugs,title:page.title.slice(5),sourceUrl:`https://commons.wikimedia.org/?curid=${page.pageid}`,originalUrl:original.href,evidenceUrl:`https://commons.wikimedia.org/w/index.php?oldid=${page.revisions[0].revid}`,evidencePath:`assets/social/rights-evidence/${id}.json`,license,licenseUrl:meta.LicenseUrl.value,credit:clean(meta.Attribution?.value||meta.Artist?.value),photoDate:clean(meta.DateTimeOriginal?.value),description:clean(meta.ImageDescription?.value),restrictions:clean(meta.Restrictions?.value),verifiedAt:argentinaDate(),permission:{basis:'open-license',territories:['worldwide'],organicInstagram:true,publicHosting:true,crop:true,overlay:true,expiresAt:null},path:`assets/social/photos/${id}.webp`,originalSha256:digest(originalBytes)};
if(person){const people=JSON.parse(await readFile(path.join(ROOT,'src/data/people.json'),'utf8'));if(!people[person])throw Error('La persona no coincide exactamente con people.json.');entry.catalogPortrait=people[person].image;}
if(!approve){console.log(JSON.stringify(entry,null,2));process.exit(0);}
await mkdir(path.join(ROOT,'public/assets/social/photos'),{recursive:true});
await mkdir(path.join(ROOT,'assets/social/rights-evidence'),{recursive:true});
const bytes=await sharp(originalBytes).rotate().resize({width:2400,height:2400,fit:'inside',withoutEnlargement:true}).webp({quality:94}).toBuffer();
const dimensions=await sharp(bytes).metadata();
Object.assign(entry,{sha256:digest(bytes),width:dimensions.width,height:dimensions.height,changes:'Conversión a WebP y reducción de tamaño. Las placas pueden incluir recorte y composición editorial.'});
await writeFile(path.join(ROOT,'public',entry.path),bytes);
const evidence={retrievedAt:new Date().toISOString(),queryUrl:url.href,page,originalSha256:entry.originalSha256};
await writeFile(path.join(ROOT,entry.evidencePath),JSON.stringify(evidence,null,2)+'\n');
entry.evidenceSha256=digest(await readFile(path.join(ROOT,entry.evidencePath)));
const ledgerPath=path.join(ROOT,'assets/social/instagram-rights.json');
const ledger=JSON.parse(await readFile(ledgerPath,'utf8'));
ledger.version=2;ledger.assets=ledger.assets.filter(a=>a.id!==id);ledger.assets.push(entry);
ledger.note='Approved grants apply only to the exact hashed photograph. Movie posters and press assets require their own documented permission. No abstract fallback. Portraits are labeled as archive photography, never as film stills.';
await writeFile(ledgerPath,JSON.stringify(ledger,null,2)+'\n');
console.log(JSON.stringify({id,subject:entry.subject,license,dimensions:[entry.width,entry.height],path:entry.path}));
