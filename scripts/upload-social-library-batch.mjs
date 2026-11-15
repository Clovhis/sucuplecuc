import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {ROOT} from './lib/social-media.mjs';
const directory=path.join(ROOT,'.tmp/social-batch');
const capability=JSON.parse(await readFile(path.join(directory,'capability.json'),'utf8'));
const records=JSON.parse(await readFile(path.join(directory,'records.json'),'utf8'));
const receipts=[];
for(const record of records){
 if(Date.now()>capability.expires)throw Error('Importador vencido; no renovar sin revisar resultados anteriores.');
 const form=new FormData();form.set('record',record.raw);form.set('photo',new Blob([await readFile(path.join(ROOT,'.tmp/press-upload',record.id+'.webp'))],{type:'image/webp'}),record.id+'.webp');
 const response=await fetch('https://bftcrexcwktyiqsermni.supabase.co/functions/v1/cineposta-social-bootstrap',{method:'POST',headers:{'x-import-key':capability.key},body:form,signal:AbortSignal.timeout(45000)});
 if(!response.ok)throw Error('Importación detenida HTTP '+response.status+': '+await response.text());
 const receipt=await response.json();receipts.push(receipt);await writeFile(path.join(directory,'receipts.json'),JSON.stringify(receipts,null,2));console.log(receipt.id,receipt.state);
}
