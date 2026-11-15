import {test} from 'node:test';
import assert from 'node:assert/strict';
import {evaluate,auditBank,readPrivateBank} from './lib/cinecriptico-bank.mjs';
test('Cryptic proof algebra rejects faulty constructions',()=>{
 assert.equal(evaluate({op:'concat',parts:[{op:'reverse',input:{op:'literal',text:'ABC'}},{op:'slice',input:{op:'literal',text:'DEFG'},start:0,end:2}]}),'CBADE');
 assert.equal(evaluate({op:'insert',input:{op:'literal',text:'ABC'},value:{op:'literal',text:'X'},at:1}),'AXBC');
 assert.equal(evaluate({op:'anagram',input:{op:'literal',text:'CAB'},result:'ABC'}),'ABC');
 assert.throws(()=>evaluate({op:'anagram',input:{op:'literal',text:'CAB'},result:'ABCD'}));
 assert.throws(()=>evaluate({op:'replace',input:{op:'literal',text:'CAB'},at:1,from:'Z',to:'X'}));
 assert.throws(()=>readPrivateBank('./src/data/private.json'),/OUTSIDE/);
 assert.throws(()=>auditBank([]),/Empty/);
});
test('Calendar requires all 413 dates and distinct original reviewed entries',()=>{
 const report=auditBank([{day:'2026-11-14',answer:'SINTETICO',letters:9,clue:'Una pista sintética para la prueba local.',hints:[],difficulty:8,proof:{op:'literal',text:'SINTETICO'}}],{complete:true});
 assert.equal(report.required,413);assert.equal(report.missing.length,412);assert.equal(report.valid,false);
 assert.ok(report.errors.some(e=>e.includes('editorial review missing')));
});
test('Hints cannot disclose the normalized answer and a literal is not wordplay',()=>{
 const entry={day:'2026-11-14',answer:'SINTÉTICO',letters:9,clue:'Una construcción creada sólo para este control.',hints:['Una primera ayuda suficientemente larga.','La respuesta es SINTETICO, sin la tilde.','Una tercera ayuda suficientemente larga.'],difficulty:8,proof:{op:'literal',text:'SINTETICO'}};
 const report=auditBank([entry]);
 assert.ok(report.errors.some(e=>e.includes('solution appears literally in a hint')));
 assert.ok(report.errors.some(e=>e.includes('actual operation')));
 entry.hints[1]='Revisá una transformación de letras antes de continuar.';
 entry.proof={op:'reverse',input:{op:'literal',text:'OCITETNIS'}};
 const fixed=auditBank([entry]);
 assert.ok(!fixed.errors.some(e=>e.includes('hint')||e.includes('actual operation')||e.includes('proof')));
});
