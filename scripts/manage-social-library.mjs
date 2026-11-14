// Editorial administration only. No Buffer mutation and no automatic approval.
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {ROOT,digest,loadMovies} from './lib/social-media.mjs';
import {assertImageGrant} from './lib/instagram-images.mjs';
import {remoteLibrary,libraryBytes} from './lib/social-library.mjs';

const config=JSON.parse(await readFile(path.join(ROOT,'assets/social/supabase-library.json'),'utf8'));
const upload=process.argv.includes('--import');
const only=process.argv.find(a=>a.startsWith('--id='))?.slice(5);
if(upload){
 const admin=process.env.SOCIAL_LIBRARY_ADMIN_KEY;
 if(!admin)throw Error('Importación administrativa requiere SOCIAL_LIBRARY_ADMIN_KEY en un entorno seguro. Nunca guardarla en GitHub ni PUBLIC_.');
 const headers={apikey:admin,Authorization:`Bearer ${admin}`};
 const request=async(route,options={})=>{
  const response=await fetch(config.url+route,{...options,headers:{...headers,...options.headers},signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw Error(`Administración ${route.split('?')[0]}: HTTP ${response.status}`);
  return response;
 };
 const registry=JSON.parse(await readFile(path.join(ROOT,'assets/social/instagram-rights.json'),'utf8'));
 const slugs=new Set((await loadMovies()).map(m=>m.slug));
 const people=JSON.parse(await readFile(path.join(ROOT,'src/data/people.json'),'utf8'));
 const candidates=registry.assets.filter(a=>!only||a.id===only);
 if(only&&!candidates.length)throw Error('ID desconocido.');
 for(const asset of candidates){
  if(!assertImageGrant(asset)||asset.kind==='poster')continue;
  if(asset.slugs?.some(slug=>!slugs.has(slug))||(asset.person&&!people[asset.person]))throw Error('Referencia de película/persona inexistente: '+asset.id);
  // Never replace an existing approved object; duplicates are immutable.
  const existing=await (await request('/rest/v1/social_media_assets?select=id,sha256&sha256=eq.'+asset.sha256)).json();
  if(existing.length){console.log(`${asset.id}: hash ya registrado`);continue;}
  const bytes=await readFile(path.join(ROOT,'public',asset.path));
  if(bytes.length>2097152||digest(bytes)!==asset.sha256)throw Error('Tamaño/hash inválido: '+asset.id);
  const info=await sharp(bytes,{failOn:'warning'}).metadata();
  await sharp(bytes,{failOn:'warning'}).raw().toBuffer();
  if(info.format!=='webp'||info.width!==asset.width||info.height!==asset.height)throw Error('Imagen/dimensiones inválidas: '+asset.id);
  const evidence_raw=await readFile(path.join(ROOT,asset.evidencePath),'utf8');
  if(digest(evidence_raw)!==asset.evidenceSha256)throw Error('Evidencia alterada: '+asset.id);
  const object_path=`${asset.kind==='event-photo'?'events':asset.kind==='portrait'?'people':'movies'}/${asset.id}/${asset.sha256}.webp`;
  const objectRoute='/storage/v1/object/'+config.bucket+'/'+object_path;
  const found=await fetch(config.url+objectRoute,{headers,signal:AbortSignal.timeout(30000)});
  if(found.ok){if(digest(Buffer.from(await found.arrayBuffer()))!==asset.sha256)throw Error('Objeto existente diferente.');}
  else if(found.status===400||found.status===404)await request(objectRoute,{method:'POST',headers:{'Content-Type':'image/webp','cache-control':'max-age=86400'},body:bytes});
  else throw Error('Storage no disponible: '+found.status);
  // Storage object IDs come from its API; never insert storage.objects with SQL.
  const folder=object_path.slice(0,object_path.lastIndexOf('/'));
  const name=object_path.slice(object_path.lastIndexOf('/')+1);
  const objects=await(await request('/storage/v1/object/list/'+config.bucket,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prefix:folder,search:name,limit:100})})).json();
  const object=objects.find(o=>o.name===name);
  if(!object?.id)throw Error('Falta referencia Storage. No aprobar metadata.');
  const row={id:asset.id,bucket_id:config.bucket,object_id:object.id,object_path,sha256:asset.sha256,status:'approved',kind:asset.kind,width:asset.width,height:asset.height,bytes:bytes.length,expires_on:asset.permission.expiresAt||null,embargo_until:asset.embargoUntil||null,metadata:asset,evidence_raw,evidence:JSON.parse(evidence_raw)};
  await request('/rest/v1/social_media_assets',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(row)});
  console.log(`${asset.id}: registrado y aprobado con evidencia`);
 }
}else{
 const assets=await remoteLibrary();let bytes=0;
 for(const asset of assets){const data=await libraryBytes(asset);await sharp(data,{failOn:'warning'}).raw().toBuffer();if(!assertImageGrant(asset))throw Error('Permiso inválido');bytes+=data.length;}
 console.log(JSON.stringify({approved:assets.length,verifiedBytes:bytes},null,2));
}
