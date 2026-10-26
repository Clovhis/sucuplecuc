import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { PGlite } from '@electric-sql/pglite';

test('trivia online: identidad, apodo único, respuestas privadas, reloj, pistas, reintentos y mejor score',async()=>{
 const db=new PGlite();
 const A='11111111-1111-4111-8111-111111111111';
 const B='22222222-2222-4222-8222-222222222222';
 const C='33333333-3333-4333-8333-333333333333';
 const call=async(name,params=[],cast='')=>{const args=params.map((_,i)=>`$${i+1}${cast&&i===params.length-1?cast:''}`).join(',');return name==='list_trivia_high_scores'?(await db.query(`select * from public.${name}(${args})`,params)).rows:(await db.query(`select public.${name}(${args}) as result`,params)).rows[0].result;};
 const user=async(id)=>{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id??'']);await db.exec(id?'set role authenticated':'set role anon');};
 const admin=async(sql,params=[])=>{await db.exec('reset role');return db.query(sql,params);};
 const privateAnswer=async(id)=>{const result=(await admin("select questions->round->'answer'->>'slug' as answer from public.trivia_games where id=$1",[id])).rows[0].answer;await user(A);return result;};
 try {
  await db.exec("create role anon; create role authenticated; create schema auth; create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$; grant usage on schema auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;");
  await db.exec(readFileSync(new URL('../supabase/sql/trivia_high_scores.sql',import.meta.url),'utf8'));
  await db.exec(readFileSync(new URL('../supabase/sql/trivia_sessions.sql',import.meta.url),'utf8'));
  await db.exec(`insert into public.trivia_questions(id,payload,catalog_version,active) select 'q-'||n,jsonb_build_object('id','q-'||n,'kind',(array['La historia','La historia','Duplas','Dirección','Postcréditos','Premios'])[1+(n%6)],'family',(array['story','story','credits','credits','extra','extra'])[1+(n%6)],'prompt','Pregunta '||n,'fact','Explicación '||n,'people','[]'::jsonb,'answer',jsonb_build_object('slug','movie-'||(n%50),'title','Peli '||(n%50),'year',2000,'poster','/poster.webp'),'options',jsonb_build_array(jsonb_build_object('slug','movie-'||(n%50),'title','Peli '||(n%50),'year',2000,'poster','/poster.webp'),jsonb_build_object('slug','wrong-a','title','Otra A','year',2001,'poster','/a.webp'),jsonb_build_object('slug','wrong-b','title','Otra B','year',2002,'poster','/b.webp'))),'test',true from generate_series(1,1000)n`);
  await user(null);
  await assert.rejects(call('start_trivia_game'),/permission denied/);
  await assert.rejects(call('claim_trivia_player',['Natalia','AR',30]),/permission denied/);
  await user(A);
  const player=await call('claim_trivia_player',['Natalia','AR',30]);
  assert.equal(player.name,'Natalia');
  await user(B);
  for(const name of ['Natalia','NATALIA','Nátalia','N a t a l i a','Nata.lia','N4t4lia']) {
   assert.equal(await call('trivia_nickname_available',[name]),false,name);
   await assert.rejects(call('claim_trivia_player',[name,'AR',25]),/nickname unavailable/);
  }
  await call('claim_trivia_player',['OtraButaca','UY',35]);
  await user(A);
  assert.equal(await call('trivia_nickname_available',['Natalia']),true);
  await assert.rejects(call('claim_trivia_player',['OtraButaca','AR',30]),/nickname belongs/);
  let game=await call('start_trivia_game');
  assert.equal(game.question.answer,undefined);assert.equal(game.question.fact,undefined);assert.equal(game.questions,undefined);assert.equal(game.question.options.length,3);
  assert.equal(game.question.id,`${game.id}:0`);
  const serverQuestions=(await admin("select questions from public.trivia_games where id=$1",[game.id])).rows[0].questions;
  assert.equal(new Set(serverQuestions.map(q=>q.answer.slug)).size,20);
  assert.equal(serverQuestions.filter(q=>q.family==='story').length,12);
  assert.equal(serverQuestions.filter(q=>q.family==='credits').length,6);
  assert.equal(serverQuestions.filter(q=>q.family==='extra').length,2);
  for(const kind of ['Duplas','Dirección']) assert.equal(serverQuestions.filter(q=>q.kind===kind).length,3);
  await user(A);
  for(const table of ['trivia_questions','trivia_players','trivia_games','trivia_seen_questions','trivia_verified_scores']) await assert.rejects(db.query(`select * from public.${table}`),/permission denied/);
  await assert.rejects(call('trivia_game_state',[game.id]),/permission denied/);
  await assert.rejects(db.query('select * from public.submit_trivia_high_score($1,$2,$3,$4,$5,$6::jsonb,$7)',[game.id,player.id,'Natalia','AR',30,JSON.stringify(Array.from({length:20},()=>({correct:true,remaining_ms:20000}))),0]),/permission denied/);
  await assert.rejects(call('next_trivia_question',[game.id,0]),/answer required/);
  await assert.rejects(call('answer_trivia_question',[game.id,0,'not-a-choice']),/invalid choice/);
  await assert.rejects(call('answer_trivia_question',[game.id,0,null]),/question still active/);
  await user(B);
  for(const [fn,args] of [['get_trivia_game',[game.id]],['answer_trivia_question',[game.id,0,'wrong-a']],['use_trivia_hint',[game.id,0]],['next_trivia_question',[game.id,0]]]) await assert.rejects(call(fn,args),/game not found/);
  await user(A);
  let hinted=await call('use_trivia_hint',[game.id,0]);
  assert.equal(hinted.hintsUsed,1);assert.ok(hinted.discarded);
  assert.equal((await call('use_trivia_hint',[game.id,0])).hintsUsed,1);
  await assert.rejects(call('answer_trivia_question',[game.id,0,hinted.discarded]),/invalid choice/);
  const firstAnswer=await privateAnswer(game.id);
  game=await call('answer_trivia_question',[game.id,0,firstAnswer]);
  assert.equal(game.answers[0].correct,true);
  const score=game.score;
  const duplicate=await call('answer_trivia_question',[game.id,0,'wrong-a']);assert.equal(duplicate.score,score);assert.equal(duplicate.answers.length,1);
  game=await call('next_trivia_question',[game.id,0]);const deadline=game.deadlineMs;
  assert.equal((await call('next_trivia_question',[game.id,0])).deadlineMs,deadline);
  await assert.rejects(call('answer_trivia_question',[game.id,0,firstAnswer]),/stale question/);
  // Set the trusted clock deadline as administrator; a client cannot do this.
  await admin("update public.trivia_games set deadline=clock_timestamp()-interval '1 second' where id=$1",[game.id]);await user(A);
  game=await call('answer_trivia_question',[game.id,1,'wrong-a']);assert.equal(game.answers[1].points,0);assert.equal(game.answers[1].choice,null);
  game=await call('next_trivia_question',[game.id,1]);
  for(let round=2;round<20;round++) {
   if(round===2||round===3) game=await call('use_trivia_hint',[game.id,round]);
   if(round===4) await assert.rejects(call('use_trivia_hint',[game.id,round]),/no hints left/);
   const correct=await privateAnswer(game.id);
   game=await call('answer_trivia_question',[game.id,round,correct]);
   if(round<19) game=await call('next_trivia_question',[game.id,round]);
  }
  assert.equal(game.phase,'finished');assert.equal(game.answers.length,20);assert.equal(game.bonus,0);assert.equal(game.hintsUsed,3);
  assert.equal(game.score,game.answers.reduce((n,a)=>n+a.points,0));
  const highScore=game.score;
  const list=await call('list_trivia_high_scores',[10]);assert.equal(list[0].player_name,'Natalia');assert.equal(list[0].score,highScore);assert.equal(list[0].correct_count,19);assert.ok(!('age'in list[0]));
  assert.equal((await call('answer_trivia_question',[game.id,19,'wrong-b'])).score,highScore);
  // A worse second game cannot overwrite this player's record or create another ranking row.
  await admin("insert into public.trivia_seen_questions(player_id,question_id) select $1,id from public.trivia_questions where payload->>'family'='extra' on conflict(player_id,question_id) do update set seen_at=now()",[player.id]);await user(A);
  game=await call('start_trivia_game');
  const secondDeck=(await admin('select questions from public.trivia_games where id=$1',[game.id])).rows[0].questions;
  assert.equal(secondDeck.filter(q=>q.family==='extra').length,0,'Use new stories instead of repeating exhausted extras');
  assert.ok(secondDeck.every(q=>!serverQuestions.some(previous=>previous.id===q.id)));
  await user(A);
  for(let round=0;round<20;round++) {
   await admin("update public.trivia_games set deadline=clock_timestamp()-interval '1 second' where id=$1",[game.id]);await user(A);
   game=await call('answer_trivia_question',[game.id,round,null]);
   if(round<19) game=await call('next_trivia_question',[game.id,round]);
  }
  assert.equal(game.score,750);assert.equal(game.bonus,750);
  assert.equal((await call('list_trivia_high_scores',[10])).length,1);
  assert.equal((await call('list_trivia_high_scores',[10]))[0].score,highScore);
  await user(C);await call('claim_trivia_player',['TercerPlayer','AR',20]);
  const start1=await call('start_trivia_game');const start2=await call('start_trivia_game');
  assert.equal((await call('get_trivia_game',[start1.id])).phase,'abandoned');
  assert.equal((await call('get_trivia_game')).id,start2.id);
  for(let i=0;i<3;i++) await call('start_trivia_game');
  await assert.rejects(call('start_trivia_game'),/too many games/);
  await admin("select 1");
  // Reapplying migrations leaves identities, records and active games intact.
  await db.exec(readFileSync(new URL('../supabase/sql/trivia_sessions.sql',import.meta.url),'utf8'));
  assert.equal((await db.query('select count(*)::int as n from public.trivia_verified_scores')).rows[0].n,1);
 } finally { await db.close(); }
});
