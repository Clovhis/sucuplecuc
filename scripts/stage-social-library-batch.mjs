// Generates a narrowly allowlisted, short-lived importer for deployment via MCP.
// No administrative secret leaves the Supabase Edge runtime.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {randomBytes} from 'node:crypto';
import sharp from 'sharp';
import {ROOT,digest,loadMovies} from './lib/social-media.mjs';
import {assertImageGrant} from './lib/instagram-images.mjs';
const manifest=process.argv.find(a=>a.startsWith('--assets='))?.slice(9);
if(!manifest)throw Error('Falta --assets=lista-aprobada.json; inspeccionar las fotos antes de esta etapa.');
const assets=JSON.parse(await readFile(manifest,'utf8'));
const slugs=new Set((await loadMovies()).map(m=>m.slug));
const people=JSON.parse(await readFile(path.join(ROOT,'src/data/people.json'),'utf8'));
const rows=[],allowed={};
for(const asset of assets){
 if(!assertImageGrant(asset)||asset.slugs?.some(s=>!slugs.has(s))||(asset.person&&!people[asset.person]))throw Error('Identidad/permiso inválido: '+asset.id);
 if(asset.person&&/Argentin/i.test(people[asset.person]?.nationalityPrimary||'')&&asset.reviewRegion!=='AR')throw Error('La persona argentina necesita revisión AR explícita.');
 if(asset.kind==='poster')throw Error('Los pósters permanecen en GitHub.');
 const bytes=await readFile(path.join(ROOT,'.tmp/press-upload',asset.id+'.webp'));
 const info=await sharp(bytes,{failOn:'warning'}).metadata();await sharp(bytes,{failOn:'warning'}).raw().toBuffer();
 if(digest(bytes)!==asset.sha256||bytes.length>2097152||info.width!==asset.width||info.height!==asset.height)throw Error('Integridad inválida.');
 const evidence_raw=await readFile(path.join(ROOT,asset.evidencePath),'utf8');if(digest(evidence_raw)!==asset.evidenceSha256)throw Error('Evidencia cambió.');
 const folder=asset.kind==='portrait'?'people':'movies';
 const subject=asset.kind==='portrait'?asset.person.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''):asset.slugs[0];
 const row={id:asset.id,bucket_id:'cineposta-social',object_path:`${folder}/${subject}/${asset.sha256}.webp`,sha256:asset.sha256,status:'approved',kind:asset.kind,width:asset.width,height:asset.height,bytes:bytes.length,grant_id:asset.grantId||null,expires_on:asset.permission.expiresAt||null,embargo_until:asset.embargoUntil||null,metadata:asset,evidence_raw,evidence:JSON.parse(evidence_raw)};
 const raw=JSON.stringify(row);allowed[row.id]=digest(raw);rows.push({id:row.id,raw});
}
const key=randomBytes(32).toString('hex'),expires=Date.now()+30*60*1000;
const template=await readFile(path.join(ROOT,'scripts/templates/social-library-import-edge.ts.txt'),'utf8');
await mkdir(path.join(ROOT,'.tmp/social-batch'),{recursive:true});
await writeFile(path.join(ROOT,'.tmp/social-batch/records.json'),JSON.stringify(rows));
await writeFile(path.join(ROOT,'.tmp/social-batch/capability.json'),JSON.stringify({key,expires}));
await writeFile(path.join(ROOT,'.tmp/social-batch/index.ts'),template.replace('__KEY_HASH__',digest(key)).replace('__EXPIRES__',String(expires)).replace('__ALLOWLIST__',JSON.stringify(allowed)));
console.log(JSON.stringify({validated:rows.length,expiresAt:new Date(expires).toISOString(),functionFile:'.tmp/social-batch/index.ts'}));
