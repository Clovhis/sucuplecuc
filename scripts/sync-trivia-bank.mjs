import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { buildTriviaBank } from '../src/lib/trivia.ts';

const directory = new URL('../src/data/movies/',import.meta.url);
const today = new Intl.DateTimeFormat('en-CA',{timeZone:'America/Argentina/Buenos_Aires',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const year = Number(today.slice(0,4));
const movies = readdirSync(directory).filter((file)=>file.endsWith('.json')).map((file)=>JSON.parse(readFileSync(new URL(file,directory),'utf8')))
 .filter((movie)=>movie.releaseDate ? movie.releaseDate <= today : movie.year < year)
 .map((movie)=>({...movie,poster:`/${movie.poster.replace(/^\//,'')}`}));
const catalog = JSON.parse(readFileSync(new URL('../src/data/people.json',import.meta.url),'utf8'));
const normalize = (name)=>name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9\s']/g,' ').replace(/\s+/g,' ').trim();
const normalized = new Map(Object.entries(catalog).map(([name,record])=>[normalize(name),record]));
const aliases = new Map();
for(const [name,record] of Object.entries(catalog)) for(const alias of record.aliases??[]) aliases.set(alias,aliases.has(alias)&&aliases.get(alias)!==name?null:name);
const portraits = new Map();
const bank = buildTriviaBank(movies,year,(names,role)=>{
 const key=`${role}:${names}`;
 if(!portraits.has(key)) portraits.set(key,names.split(/\s*,\s*|\s+y\s+/i).filter(Boolean).map((name)=>{
  const person=catalog[name]??normalized.get(normalize(name))??catalog[aliases.get(name)];
  const image=person?.image;
  return {name,role,image:image?.startsWith('/people/')&&existsSync(new URL(`../public${image}`,import.meta.url))?image:undefined};
 }));
 return portraits.get(key);
});
if(bank.questions.filter(q=>q.family==='story').length<1000) throw new Error('El banco requiere al menos 1000 historias distintas.');
if(bank.questions.length<1000) throw new Error('El banco privado requiere al menos 1000 preguntas.');
const payloads=bank.questions.map((q)=>({id:q.id,payload:{id:q.id,kind:q.kind,family:q.family,prompt:q.prompt,fact:q.fact,people:q.people,options:q.options.map((index)=>bank.movies[index]),answer:bank.movies[q.answer]}}));
const version=createHash('sha256').update(JSON.stringify(payloads)).digest('hex');
if(process.argv.includes('--apply')) {
 const token=process.env.SUPABASE_ACCESS_TOKEN;
 if(!token) throw new Error('Falta SUPABASE_ACCESS_TOKEN en el entorno de administración.');
 const ref=process.env.TRIVIA_SUPABASE_PROJECT_REF??'bftcrexcwktyiqsermni';
 async function query(sql,parameters=[]){
  const response=await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({query:sql,parameters})});
  if(!response.ok) throw new Error(`Supabase ${response.status}: ${(await response.text()).slice(0,300)}`);
  return response.json();
 }
 for(let offset=0;offset<payloads.length;offset+=500) await query('insert into public.trivia_questions(id,payload,catalog_version) select x.id,x.payload,$2 from jsonb_to_recordset($1::jsonb) x(id text,payload jsonb) on conflict(id) do update set payload=excluded.payload,catalog_version=excluded.catalog_version',[JSON.stringify(payloads.slice(offset,offset+500)),version]);
 await query('update public.trivia_questions set active=(catalog_version=$1)',[version]);
}
console.log(JSON.stringify({questions:bank.questions.length,movies:bank.movies.length,version,applied:process.argv.includes('--apply')}));
