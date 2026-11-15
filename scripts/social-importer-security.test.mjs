import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import ts from 'typescript';
import {digest} from './lib/social-media.mjs';

const key='unit-test-capability',bytes=Buffer.from('reviewed WebP fixture');
const row={id:'reviewed-photo',bytes:bytes.length,sha256:digest(bytes)};
const raw=JSON.stringify(row);
async function fixture({expired=false}={}){
 let handler,calls=0;
 const source=(await readFile(new URL('./templates/social-library-import-edge.ts.txt',import.meta.url),'utf8')).replace('__KEY_HASH__',digest(key)).replace('__EXPIRES__',String(Date.now()+(expired?-1000:60000))).replace('__ALLOWLIST__',JSON.stringify({[row.id]:digest(raw)}));
 const code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
 vm.runInNewContext(code,{crypto:webcrypto,TextEncoder,Uint8Array,File,Response,Date,JSON,console,Deno:{serve:h=>{handler=h;},env:{get:()=> 'test-admin-value'}},fetch:async()=>{calls++;return Response.json([{id:row.id,sha256:row.sha256}]);}});
 return {request:(record=raw,photo=bytes,capability=key)=>{const form=new FormData();form.set('record',record);form.set('photo',new Blob([photo]),'photo.webp');return handler(new Request('https://example.test/import',{method:'POST',headers:{'x-import-key':capability},body:form}));},calls:()=>calls};
}
test('expired or unauthenticated batch never reaches administrative APIs',async()=>{
 const expired=await fixture({expired:true});assert.equal((await expired.request()).status,410);assert.equal(expired.calls(),0);
 const current=await fixture();assert.equal((await current.request(raw,bytes,'wrong')).status,401);assert.equal(current.calls(),0);
});
test('altered metadata and corrupt bytes cannot be imported with a valid batch capability',async()=>{
 const f=await fixture();assert.equal((await f.request(JSON.stringify({...row,status:'restricted'}))).status,403);assert.equal((await f.request(raw,Buffer.from('wrong image'))).status,400);assert.equal(f.calls(),0);
});
test('same reviewed receipt is idempotent rather than uploading a second object',async()=>{
 const f=await fixture();const response=await f.request();assert.equal(response.status,200);assert.deepEqual(await response.json(),{id:row.id,state:'existing'});assert.equal(f.calls(),1);
});
