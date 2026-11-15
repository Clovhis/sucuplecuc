import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';

// Synthetic fixture, unrelated to the private daily calendar.
test('CineCríptico: ownership, private answers, authoritative score, replay, limits, stats and rollover',async()=>{
 const db=new PGlite();
 const a=randomUUID(),b=randomUUID(),legacy=randomUUID(),other=randomUUID();
 const admin=async(sql,params=[])=>{await db.exec('reset role');return db.query(sql,params);};
 const user=async(id)=>{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id??'']);await db.exec(id?'set role authenticated':'set role anon');};
 const call=async(action='state',rev=null,guess=null,id=randomUUID(),day=today)=>(await db.query('select public.cinecriptico_play($1,$2::uuid,$3::integer,$4,$5::date) as value',[action,id,rev,guess,day])).rows[0].value;
 let today;
 try {
  await db.exec(`create role anon;create role authenticated;create schema auth;
   create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
   grant usage on schema auth to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;
  `);
  await db.exec(readFileSync(new URL('../supabase/sql/trivia_high_scores.sql',import.meta.url),'utf8'));
  await db.exec(readFileSync(new URL('../supabase/sql/trivia_sessions.sql',import.meta.url),'utf8'));
  const baseSQL=readFileSync(new URL('../supabase/sql/cinecriptico.sql',import.meta.url),'utf8');
  // Recreate the pre-upgrade function so the boundary migration must actually patch it.
  await db.exec(baseSQL.replace(/\r?\n d:=cinecriptico_private\.day_at\(clock_timestamp\(\)\);\r?\n if p_day is distinct from d then return cinecriptico_private\.state\(uid\); end if;/,''));
  today=(await db.query("select cinecriptico_private.day_at(clock_timestamp())::text as day")).rows[0].day;
  await db.query(`insert into public.trivia_players(owner_id,nickname,country_code,age) values($1,'ButacaUno','AR',30),($2,'Clovhis','AR',31),($3,'ButacaLegada','AR',32)`,[a,b,legacy]);
  await db.exec(`insert into cinecriptico_private.puzzles(day,clue,answer,letters,hints,explanation,reference,reference_url,difficulty,proof,reviewed_at)
   select cinecriptico_private.day_at(clock_timestamp())+n,'Fixture sintética; no pertenece al calendario real.','FICCION',7,'["Primera","Segunda","Tercera"]','Explicación sintética','Referencia sintética','https://example.org/fixture',8,'{}',now() from generate_series(-4,1)n;`);
  await db.query(`insert into cinecriptico_private.games(owner_id,player_id,day,phase,score,hints_used,mistakes)
   select owner_id,id,cinecriptico_private.day_at(clock_timestamp())-1,'solved',720,1,1 from public.trivia_players where owner_id=$1`,[legacy]);
  const legacyGame=(await db.query('select row_to_json(g) as game from cinecriptico_private.games g where owner_id=$1',[legacy])).rows[0].game;
  await db.exec(readFileSync(new URL('../supabase/sql/cinecriptico_players.sql',import.meta.url),'utf8'));
  await db.exec(readFileSync(new URL('../supabase/sql/cinecriptico_day_boundary.sql',import.meta.url),'utf8'));
  assert.deepEqual((await db.query('select row_to_json(g) as game from cinecriptico_private.games g where owner_id=$1',[legacy])).rows[0].game,legacyGame);
  await user(legacy);
  assert.equal((await db.query('select public.get_cinecriptico_player() as p')).rows[0].p.name,'ButacaLegada');
  // Existing trivia reservation belongs to B. Another identity A can reserve it in Cryptic.
  await user(a);
  assert.equal((await db.query('select public.get_cinecriptico_player() as p')).rows[0].p,null);
  const profile=(await db.query("select public.claim_cinecriptico_player('Clovhis','AR',30) as p")).rows[0].p;
  assert.equal(profile.name,'Clovhis');
  assert.equal((await db.query('select public.get_trivia_player() as p')).rows[0].p.name,'ButacaUno');
  assert.equal((await db.query("select public.claim_cinecriptico_player('Clovhis','AR',30) as p")).rows[0].p.id,profile.id);
  await assert.rejects(db.query("select public.claim_cinecriptico_player('OtroApodo','AR',30)"),/nickname belongs/);
  await user(other);
  await assert.rejects(db.query("select public.claim_trivia_player('Clovhis','AR',20)"),/nickname unavailable/);
  for(const name of ['Clovhis','CLOVHIS','Clovhís'])await assert.rejects(db.query('select public.claim_cinecriptico_player($1,$2,$3)',[name,'AR',20]),/nickname unavailable/);
  await user(b);
  assert.equal((await db.query('select public.get_trivia_player() as p')).rows[0].p.name,'Clovhis');
  await db.query("select public.claim_cinecriptico_player('ButacaDos','AR',31)");
  await user(null);await assert.rejects(call(),/permission denied/);
  await assert.rejects(db.query('select public.get_cinecriptico_player()'),/permission denied/);
  await assert.rejects(db.query("select public.claim_cinecriptico_player('Intruso','AR',25)"),/permission denied/);
  await db.exec('set role authenticated');
  await assert.rejects(call(),/authentication required/);
  await assert.rejects(db.query('select public.get_cinecriptico_player()'),/authentication required/);
  await user(a);
  let s=await call();assert.equal(s.game,null);assert.equal(s.reveal,undefined);assert.equal(s.answer,undefined);assert.equal(s.hints,undefined);
  assert.equal(Object.keys(s).some(k=>/reference|proof|explanation/.test(k)),false);
  assert.equal(Date.parse(s.nextAt)-Date.parse(s.day+'T03:00:00Z'),86400000);
  for(const table of ['players','puzzles','games','events'])await assert.rejects(db.query(`select * from cinecriptico_private.${table}`),/permission denied/);
  await assert.rejects(db.query('select cinecriptico_private.state($1)',[b]),/permission denied/);
  await assert.rejects(call('bogus'),/invalid action/);
  s=await call('start',0);const sid=s.game.id;assert.equal(s.game.phase,'playing');assert.equal((await call('start',0)).game.id,sid);
  const future='2099-01-01';assert.equal((await call('guess',0,'FICCION',randomUUID(),future)).game.revision,0);
  await assert.rejects(call('guess',0,'FIC CION'),/invalid word/);
  await assert.rejects(call('guess',0,null),/invalid word/);
  const req=randomUUID();s=await call('hint',0,null,req);assert.equal(s.game.hintsUsed,1);assert.deepEqual(s.game.hints,['Primera']);assert.equal(s.reveal,undefined);
  assert.equal((await call('hint',0,null,req)).game.hintsUsed,1);
  await assert.rejects(call('guess',0,'FICCION',req),/request conflict/);
  // Rate limit is a committed no-op, independent of client time.
  assert.equal((await call('guess',1,'FICCION')).game.phase,'playing');
  const cooldown=async()=>{await admin("update cinecriptico_private.games set last_action_at=clock_timestamp()-interval '3 seconds' where owner_id=$1",[a]);await user(a);};
  await cooldown();s=await call('guess',1,'ERRATAS');assert.equal(s.game.mistakes,1);assert.equal(s.game.revision,2);
  await cooldown();assert.equal((await call('guess',2,'ERRATAS')).game.mistakes,1);
  // Stale tab cannot use an old revision, even after cooldown.
  assert.equal((await call('guess',1,'FICCION')).game.phase,'playing');
  await cooldown();s=await call('guess',2,'fícción');assert.equal(s.game.phase,'solved');assert.equal(s.game.score,720);assert.equal(s.reveal.answer,'FICCION');
  assert.equal((await call('guess',3,'ERRATAS')).game.score,720);
  let dash=(await db.query('select public.cinecriptico_dashboard() as d')).rows[0].d;
  assert.equal(dash.solvedToday,1);assert.equal(dash.stats.solved,1);assert.equal(dash.stats.totalScore,720);assert.equal(dash.daily[0].name,'Clovhis');
  await user(b);assert.equal((await call()).game,null);assert.equal((await call()).reveal,undefined);
  s=await call('start',0);s=await call('giveup',0);assert.equal(s.game.phase,'given_up');assert.equal(s.game.score,0);assert.equal(s.reveal.answer,'FICCION');
  dash=(await db.query('select public.cinecriptico_dashboard() as d')).rows[0].d;assert.equal(dash.solvedToday,1);assert.equal(dash.stats.solved,0);
  // Exact midnight and leap/cross-year calculations in Argentina.
  for(const [utc,day] of [['2026-11-15T02:59:59Z','2026-11-14'],['2026-11-15T03:00:00Z','2026-11-15'],['2028-01-01T02:59:59Z','2027-12-31'],['2028-01-01T03:00:00Z','2028-01-01']]){
   assert.equal((await admin('select cinecriptico_private.day_at($1)::text as day',[utc])).rows[0].day,day);
  }
  // Six wrong attempts close the game, all hints penalize, never a seventh attempt.
  await admin('delete from cinecriptico_private.events where owner_id=$1',[a]);await admin('delete from cinecriptico_private.games where owner_id=$1',[a]);await user(a);
  s=await call('start',0);for(let n=0;n<3;n++){await cooldown();s=await call('hint',s.game.revision);}
  assert.equal(s.game.hintsUsed,3);await cooldown();assert.equal((await call('hint',3)).game.hintsUsed,3);
  for(const guess of ['AAAAAAA','BBBBBBB','CCCCCCC','DDDDDDD','EEEEEEE','FFFFFFF']) {await cooldown();s=await call('guess',s.game.revision,guess);}
  assert.equal(s.game.phase,'lost');assert.equal(s.game.mistakes,6);assert.equal(s.game.score,0);assert.equal(s.reveal.answer,'FICCION');
  assert.equal((await call('guess',s.game.revision,'FICCION')).game.phase,'lost');
  // Historical streak islands and today-unsolved grace day.
  await admin(`insert into cinecriptico_private.games(owner_id,player_id,day,phase,score) select $1,p.id,cinecriptico_private.day_at(clock_timestamp())+n,'solved',1000 from cinecriptico_private.players p cross join generate_series(-3,-1)n where p.owner_id=$1`,[a]);await user(a);
  dash=(await db.query('select public.cinecriptico_dashboard() as d')).rows[0].d;assert.equal(dash.stats.bestStreak,3);assert.equal(dash.stats.streak,0);assert.equal(dash.stats.totalScore,3000);
  // Empty day never leaks a later puzzle.
  await admin('delete from cinecriptico_private.games');await admin('delete from cinecriptico_private.puzzles where day=$1',[today]);await user(a);s=await call();assert.equal(s.available,false);assert.equal(s.clue,undefined);
  // Time advances across midnight while authorization waits for the owner's lock.
  await admin(`insert into cinecriptico_private.puzzles select $1::date,clue,answer,letters,hints,explanation,reference,reference_url,movie_slug,difficulty,proof,reviewed_at from cinecriptico_private.puzzles where day=$1::date+1`,[today]);
  await admin('create sequence public.cryptic_test_clock');
  await admin(`create or replace function cinecriptico_private.day_at(p_now timestamptz) returns date language sql volatile set search_path='' as $$ select (p_now at time zone 'America/Argentina/Buenos_Aires')::date+case when nextval('public.cryptic_test_clock')>1 then 1 else 0 end $$`);
  await user(a);s=await call('start',0);assert.equal(s.game,null);
  assert.equal((await admin('select count(*)::int as n from cinecriptico_private.games where owner_id=$1',[a])).rows[0].n,0);
 } finally {await db.close();}
});
