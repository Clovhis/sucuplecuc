import {readdirSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import {readPrivateBank} from './lib/cinecriptico-bank.mjs';
const bank=readPrivateBank(process.argv[2]);
const fingerprints=bank.flatMap(p=>[p.clue,p.explanation,...p.hints]).filter(s=>s.length>20);
const violations=[];let scanned=0;
function scan(dir) {for(const item of readdirSync(dir,{withFileTypes:true})) {
 const path=join(dir,item.name);if(item.isDirectory()){scan(path);continue;}
 if(!/\.(?:html|js|mjs|json|map|sql|ts|astro|md|mdx|txt|ya?ml|css|xml|toml)$/i.test(item.name))continue;
 const text=readFileSync(path,'utf8');scanned++;
 if(fingerprints.some(s=>text.includes(s)||text.includes(JSON.stringify(s).slice(1,-1))))violations.push(path);
}}
for(const dir of ['src','public','dist','scripts','supabase','docs','reports'])scan(dir);
if(violations.length){console.error('Private puzzle content found in public source/output:',violations);process.exitCode=1;}
else console.log(`Private puzzle text absent from ${scanned} source/public/build files. Film titles elsewhere in the catalog are expected and are not solution-bank disclosures.`);
