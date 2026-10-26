// Explicit live smoke. Creates two marked anonymous test users and removes only those users/data.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const token=process.env.SUPABASE_ACCESS_TOKEN;
if(!token) throw new Error('Se necesita SUPABASE_ACCESS_TOKEN para limpiar las identidades de prueba.');
const source=readFileSync(new URL('../src/lib/supabaseClient.ts',import.meta.url),'utf8');
const endpoint=source.match(/DEFAULT_SUPABASE_URL = '([^']+)'/)[1];
const key=source.match(/DEFAULT_SUPABASE_ANON_KEY = '([^']+)'/)[1];
const ref=new URL(endpoint).hostname.split('.')[0];
const marker=randomUUID();
const ids=[];
const clients=[];
async function query(sql,parameters=[]){const response=await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({query:sql,parameters})});if(!response.ok)throw new Error(`Management ${response.status}: ${(await response.text()).slice(0,200)}`);return response.json();}
async function rpc(client,name,params={}){const response=await client.rpc(name,params);if(response.error)throw new Error(response.error.message);return response.data;}
try {
 for(let i=0;i<2;i++){
  const client=createClient(endpoint,key,{auth:{autoRefreshToken:false,persistSession:false,detectSessionInUrl:false}});
  clients.push(client);
  const {data,error}=await client.auth.signInAnonymously({options:{data:{cineposta_trivia_smoke:marker}}});
  if(error)throw new Error(error.message);
  assert.ok(data.user.is_anonymous);ids.push(data.user.id);
 }
 const [a,b]=clients;
 const name=`QA${marker.replaceAll('-','').slice(0,12)}`;
 await rpc(a,'claim_trivia_player',{p_name:name,p_country:'AR',p_age:30});
 assert.equal(await rpc(b,'trivia_nickname_available',{p_name:name.toLowerCase()}),false);
 await assert.rejects(rpc(b,'claim_trivia_player',{p_name:name,p_country:'UY',p_age:20}),/nickname unavailable/);
 let game=await rpc(a,'start_trivia_game');
 assert.equal(game.question.id,`${game.id}:0`);assert.equal(game.question.answer,undefined);assert.equal(game.question.fact,undefined);
 await assert.rejects(rpc(b,'get_trivia_game',{p_session_id:game.id}),/game not found/);
 const hidden=await a.from('trivia_questions').select('id').limit(1);assert.ok(hidden.error);
 const hint=await rpc(a,'use_trivia_hint',{p_session_id:game.id,p_round:0});assert.equal(hint.hintsUsed,1);
 assert.equal((await rpc(a,'use_trivia_hint',{p_session_id:game.id,p_round:0})).hintsUsed,1);
 const chosen=game.question.options.find(option=>option.slug!==hint.discarded).slug;
 game=await rpc(a,'answer_trivia_question',{p_session_id:game.id,p_round:0,p_choice:chosen});assert.equal(game.phase,'review');
 const duplicate=await rpc(a,'answer_trivia_question',{p_session_id:game.id,p_round:0,p_choice:chosen});assert.equal(duplicate.score,game.score);assert.equal(duplicate.answers.length,1);
 const fake=await a.rpc('submit_trivia_high_score',{p_session_id:game.id,p_player_id:game.player.id,p_player_name:name,p_country_code:'AR',p_age:30,p_answers:Array.from({length:20},()=>({correct:true,remaining_ms:20000})),p_hints_used:0});assert.ok(fake.error);
 console.log('Live JWT smoke passed: unique nickname, owner isolation, hidden answers, server hint, idempotent answer, fake-score endpoint denied.');
} finally {
 if(ids.length){
  const params=[JSON.stringify(ids),marker];
  const owners="select id from auth.users where id in(select value::uuid from jsonb_array_elements_text($1::jsonb)) and raw_user_meta_data->>'cineposta_trivia_smoke'=$2";
  for(const sql of [
   `delete from public.trivia_verified_scores where player_id in(select id from public.trivia_players where owner_id in(${owners}))`,
   `delete from public.trivia_seen_questions where player_id in(select id from public.trivia_players where owner_id in(${owners}))`,
   `delete from public.trivia_games where owner_id in(${owners})`,
   `delete from public.trivia_players where owner_id in(${owners})`,
   `delete from auth.users where id in(${owners})`,
  ])await query(sql,params);
  const remaining=await query('select count(*)::int as n from auth.users where id in(select value::uuid from jsonb_array_elements_text($1::jsonb))',[JSON.stringify(ids)]);
  assert.equal(remaining[0].n,0);
  console.log('Temporary test users and game data removed. No test scores published.');
 }
 for(const client of clients)await client.auth.stopAutoRefresh();
}
