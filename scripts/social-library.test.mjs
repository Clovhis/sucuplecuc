import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,writeFile,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {remoteLibrary,libraryBytes} from './lib/social-library.mjs';
import {digest} from './lib/social-media.mjs';

test('Supabase failure blocks selection instead of reading a stale local registry',async()=>{
 await assert.rejects(remoteLibrary('2026-11-14',async()=>new Response('',{status:503})),/no disponible/);
 await assert.rejects(remoteLibrary('2026-11-14',async()=>{throw Error('offline');}),/offline/);
});
test('remote evidence and row identity must match the approved metadata',async()=>{
 const raw='{"permission":"verified"}';
 const metadata={id:'approved-photo',sha256:'a'.repeat(64),evidenceSha256:digest(raw)};
 const row={id:metadata.id,sha256:metadata.sha256,status:'approved',object_path:'people/approved-photo/'+metadata.sha256+'.webp',metadata,evidence_raw:raw};
 const get=record=>async()=>Response.json([record]);
 assert.equal((await remoteLibrary('2026-11-14',get(row)))[0].id,metadata.id);
 await assert.rejects(remoteLibrary('2026-11-14',get({...row,evidence_raw:raw+' '})),/Integridad/);
 await assert.rejects(remoteLibrary('2026-11-14',get({...row,status:'restricted'})),/Integridad/);
 await assert.rejects(remoteLibrary('2026-11-14',get({...row,sha256:'b'.repeat(64)})),/Integridad/);
});
test('cache is verified; corrupt downloads are rejected and never cached',async t=>{
 const directory=await mkdtemp(path.join(tmpdir(),'cineposta-library-'));t.after(()=>rm(directory,{recursive:true,force:true}));
 const photo=Buffer.from('verified fixture'),sha256=digest(photo),asset={sha256,storage:{url:'https://example.test/photo',key:'public'}};
 const filename=path.join(directory,sha256+'.webp');
 await writeFile(filename,'damaged cache');
 await assert.rejects(libraryBytes(asset,async()=>new Response('wrong photo'),directory),/Hash incorrecto/);
 assert.equal(await readFile(filename,'utf8'),'damaged cache');
 assert.deepEqual(await libraryBytes(asset,async()=>new Response(photo),directory),photo);
 assert.deepEqual(await libraryBytes(asset,async()=>{throw Error('must use verified cache');},directory),photo);
 await assert.rejects(libraryBytes({...asset,sha256:'../unsafe'},fetch,directory),/inválido/);
});
