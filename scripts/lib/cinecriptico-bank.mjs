import {existsSync,readFileSync,realpathSync} from 'node:fs';
import {resolve,relative,isAbsolute,sep,dirname,basename} from 'node:path';
export const word=s=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
const sorted=s=>Array.from(s).sort().join('');
export function evaluate(proof,depth=0) {
 if(depth>12||!proof||typeof proof!=='object')throw Error('Invalid proof');
 const child=x=>evaluate(x,depth+1);
 switch(proof.op) {
  case 'literal': if(typeof proof.text!=='string'||!/^[A-Z]+$/.test(word(proof.text)))throw Error('Invalid literal');return word(proof.text);
  case 'concat':return proof.parts.map(child).join('');
  case 'reverse':return Array.from(child(proof.input)).reverse().join('');
  case 'slice':return child(proof.input).slice(proof.start,proof.end);
  case 'insert':{const s=child(proof.input);return s.slice(0,proof.at)+child(proof.value)+s.slice(proof.at);}
  case 'replace':{const s=child(proof.input);if(s.slice(proof.at,proof.at+proof.from.length)!==word(proof.from))throw Error('Replacement does not match');return s.slice(0,proof.at)+word(proof.to)+s.slice(proof.at+proof.from.length);}
  case 'anagram':{const s=child(proof.input),result=word(proof.result);if(sorted(s)!==sorted(result))throw Error('Incorrect anagram');return result;}
  case 'hidden':{const s=word(proof.text).replace(/[^A-Z]/g,'');return s.slice(proof.start,proof.start+proof.length);}
  default:throw Error('Unsupported mechanism');
 }
}
export function auditBank(bank,{start='2026-11-14',end='2027-12-31',complete=false}={}) {
 if(!Array.isArray(bank)||!bank.length)throw Error('Empty bank');
 const days=new Set(),answers=new Set(),clues=new Set();const errors=[];
 for(const [i,p] of bank.entries()) {
  const fail=reason=>errors.push(`entry ${i+1} (${p.day??'no date'}): ${reason}`);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(p.day)||Number.isNaN(Date.parse(p.day))||new Date(p.day).toISOString().slice(0,10)!==p.day)fail('invalid date');
  if(p.day<start||p.day>end)fail('outside requested window');
  if(days.has(p.day))fail('duplicate date');days.add(p.day);
  if(typeof p.answer!=='string'||!/^\p{L}{3,24}$/u.test(p.answer)||word(p.answer).length!==p.letters)fail('not one word or wrong length');
  if(answers.has(word(p.answer)))fail('repeated solution');answers.add(word(p.answer));
  if(typeof p.clue!=='string'||p.clue.length<25||p.clue.length>500)fail('invalid clue');
  const key=word(p.clue??'').replace(/[^A-Z]/g,'');if(clues.has(key))fail('repeated clue');clues.add(key);
  if(new RegExp(`(^|[^A-Z])${word(p.answer)}([^A-Z]|$)`).test(word(p.clue??'')))fail('solution appears literally in clue');
  if(!Array.isArray(p.hints)||p.hints.length!==3||new Set(p.hints).size!==3||p.hints.some(h=>typeof h!=='string'||h.length<15))fail('three distinct progressive hints required');
  if(![8,9].includes(p.difficulty))fail('target difficulty must be 8 or 9');
  if(!p.explanation||p.explanation.length<100)fail('explanation too short');
  if(!p.reference||!/^https:\/\//.test(p.reference_url??''))fail('missing cinematic reference');
  if(!p.reviewed_at||!p.review?.fair||!p.review?.unique||!p.review?.cinematic||!p.review?.rationale)fail('editorial review missing');
  if(p.movie_slug) {const path=resolve('src/data/movies',p.movie_slug+'.json');if(!/^[a-z0-9-]+$/.test(p.movie_slug)||!existsSync(path))fail('catalog link does not exist');}
  try{if(evaluate(p.proof)!==word(p.answer))fail('proof does not construct solution');}catch{fail('broken mechanical proof');}
 }
 const missing=[];for(let n=Date.parse(start);n<=Date.parse(end);n+=86400000){const date=new Date(n).toISOString().slice(0,10);if(!days.has(date))missing.push(date);}
 if(complete&&missing.length)errors.push(`Incomplete calendar: ${missing.length} dates missing`);
 return {valid:errors.length===0,count:bank.length,required:Math.floor((Date.parse(end)-Date.parse(start))/86400000)+1,missing,errors};
}
export function readPrivateBank(path) {
 const absolute=assertExternal(path);
 return JSON.parse(readFileSync(absolute,'utf8'));
}
export function assertExternal(path) {
 const absolute=resolve(path);
 const physical=existsSync(absolute)?realpathSync(absolute):resolve(realpathSync(dirname(absolute)),basename(absolute));
 const rel=relative(realpathSync(process.cwd()),physical);
 if(rel!=='..'&&!rel.startsWith('..'+sep)&&!isAbsolute(rel))throw Error('The solution bank must be OUTSIDE the repository');
 return physical;
}
export function seedSQL(bank) {
 const report=auditBank(bank);if(!report.valid)throw Error(report.errors.join('\n'));
 const quote=value=>"'"+String(value).replaceAll("'","''")+"'";
 // No overwrites: a published date is immutable once any player has started it.
 return 'begin;\n'+bank.map(p=>`insert into cinecriptico_private.puzzles(day,clue,answer,letters,hints,explanation,reference,reference_url,movie_slug,difficulty,proof,reviewed_at) values (${quote(p.day)},${quote(p.clue)},${quote(p.answer)},${p.letters},${quote(JSON.stringify(p.hints))}::jsonb,${quote(p.explanation)},${quote(p.reference)},${quote(p.reference_url)},${p.movie_slug?quote(p.movie_slug):'null'},${p.difficulty},${quote(JSON.stringify(p.proof))}::jsonb,${quote(p.reviewed_at)}) on conflict(day) do update set clue=excluded.clue,answer=excluded.answer,letters=excluded.letters,hints=excluded.hints,explanation=excluded.explanation,reference=excluded.reference,reference_url=excluded.reference_url,movie_slug=excluded.movie_slug,difficulty=excluded.difficulty,proof=excluded.proof,reviewed_at=excluded.reviewed_at where not exists(select 1 from cinecriptico_private.games g where g.day=excluded.day);`).join('\n')+'\ncommit;';
}
