import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {ROOT,digest} from './social-media.mjs';

const cache=path.join(ROOT,'.tmp/social-library-cache');
export async function remoteLibrary(_today,fetcher=fetch) {
 const config=JSON.parse(await readFile(path.join(ROOT,'assets/social/supabase-library.json'),'utf8'));
 const response=await fetcher(config.url+'/rest/v1/social_media_assets?select=id,sha256,object_path,status,metadata,evidence_raw&order=id&limit=1000',{headers:{apikey:config.publishableKey},signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw Error('Biblioteca Supabase no disponible: HTTP '+response.status+'. No se selecciona material de una copia obsoleta.');
 const rows=await response.json();
 if(!Array.isArray(rows)||rows.length>=1000)throw Error('Respuesta incompleta de biblioteca.');
 return rows.map(row=>{
  const asset=row.metadata;
  if(row.status!=='approved'||row.sha256!==asset.sha256||row.id!==asset.id||digest(row.evidence_raw||'')!==asset.evidenceSha256)throw Error('Integridad de registro Supabase inválida: '+row.id);
  return {...asset,storage:{url:config.url+'/storage/v1/object/authenticated/'+config.bucket+'/'+row.object_path,key:config.publishableKey}};
 });
}
export async function libraryBytes(asset,fetcher=fetch,cacheDir=cache) {
 if(!/^[a-f0-9]{64}$/.test(asset.sha256||''))throw Error('Hash de biblioteca inválido.');
 const filename=path.join(cacheDir,asset.sha256+'.webp');
 try{const bytes=await readFile(filename);if(digest(bytes)===asset.sha256)return bytes;}catch{}
 const r=await fetcher(asset.storage.url,{headers:{apikey:asset.storage.key},signal:AbortSignal.timeout(30000)});
 if(!r.ok)throw Error('Descarga de biblioteca HTTP '+r.status);
 const bytes=Buffer.from(await r.arrayBuffer());if(digest(bytes)!==asset.sha256)throw Error('Hash incorrecto de fotografía Supabase.');
 await mkdir(cacheDir,{recursive:true});await writeFile(filename,bytes);return bytes;
}
