-- Additive migration. No solutions in this file. Import the bank through a trusted connection.
begin;
create schema if not exists cinecriptico_private;
revoke all on schema cinecriptico_private from public, anon, authenticated;
create table cinecriptico_private.puzzles (
 day date primary key,
 clue text not null check(length(clue) between 15 and 500),
 answer text not null check(answer ~ '^[[:alpha:]]{3,24}$'),
 letters smallint not null check(letters between 3 and 24),
 hints jsonb not null check(jsonb_typeof(hints)='array' and jsonb_array_length(hints)=3),
 explanation text not null,
 reference text not null,
 reference_url text not null check(reference_url ~ '^https://'),
 movie_slug text check(movie_slug ~ '^[a-z0-9-]+$'),
 difficulty smallint not null check(difficulty between 8 and 9),
 proof jsonb not null,
 reviewed_at timestamptz not null,
 check(char_length(answer)=letters)
);
create table cinecriptico_private.games (
 id uuid not null unique default gen_random_uuid(),
 owner_id uuid not null,
 player_id uuid not null references public.trivia_players(id),
 day date not null references cinecriptico_private.puzzles(day),
 phase text not null default 'playing' check(phase in ('playing','solved','lost','given_up')),
 mistakes smallint not null default 0 check(mistakes between 0 and 6),
 hints_used smallint not null default 0 check(hints_used between 0 and 3),
 revision integer not null default 0,
 score integer not null default 0 check(score between 0 and 1000),
 guesses jsonb not null default '[]',
 review_flags text[] not null default '{}',
 created_at timestamptz not null default clock_timestamp(),
 last_action_at timestamptz,
 finished_at timestamptz,
 primary key(owner_id,day)
);
create index cinecriptico_games_day_solved on cinecriptico_private.games(day,score desc) where phase='solved';
create index cinecriptico_games_player on cinecriptico_private.games(player_id,day desc);
create table cinecriptico_private.events (
 owner_id uuid not null, request_id uuid not null, day date not null,
 action text not null, payload text, revision integer not null,
 created_at timestamptz not null default clock_timestamp(),
 primary key(owner_id,request_id)
);
alter table cinecriptico_private.puzzles enable row level security;
alter table cinecriptico_private.games enable row level security;
alter table cinecriptico_private.events enable row level security;
revoke all on all tables in schema cinecriptico_private from public,anon,authenticated;

-- Accent/case equivalence only; never strip punctuation or concatenate separate words.
create function cinecriptico_private.word(p_text text) returns text
language sql immutable set search_path='' as $$
 select upper(regexp_replace(normalize(btrim(p_text),NFKD),U&'[\0300-\036f]','','g'));
$$;
create function cinecriptico_private.day_at(p_now timestamptz) returns date
language sql stable set search_path='' as $$
 select (p_now at time zone 'America/Argentina/Buenos_Aires')::date;
$$;
create function cinecriptico_private.state(p_uid uuid) returns jsonb
language plpgsql set search_path='' as $$
declare d date:=cinecriptico_private.day_at(clock_timestamp()); p cinecriptico_private.puzzles;
 g cinecriptico_private.games; result jsonb;
begin
 select * into p from cinecriptico_private.puzzles where day=d;
 result:=jsonb_build_object('day',d,'serverNow',clock_timestamp(),
  'nextAt',((d+1)::timestamp at time zone 'America/Argentina/Buenos_Aires'),
  'available',found);
 if p.day is null then return result; end if;
 select * into g from cinecriptico_private.games where owner_id=p_uid and day=d;
 -- Reading the lobby must not reveal any puzzle content before the authoritative start.
 if g.id is null then return result||jsonb_build_object('game',null); end if;
 result:=result||jsonb_build_object('clue',p.clue,'letters',p.letters,'difficulty',p.difficulty,
  'game',case when g.id is null then null else jsonb_build_object('id',g.id,'phase',g.phase,
   'revision',g.revision,'mistakes',g.mistakes,'hintsUsed',g.hints_used,'score',g.score,
   'guesses',g.guesses,'hints',coalesce((select jsonb_agg(value order by ordinality)
    from jsonb_array_elements(p.hints) with ordinality where ordinality<=g.hints_used),'[]')) end);
 if g.phase in ('solved','lost','given_up') then
  result:=result||jsonb_build_object('reveal',jsonb_build_object('answer',p.answer,
   'explanation',p.explanation,'reference',p.reference,'referenceUrl',p.reference_url,'movieSlug',p.movie_slug));
 end if;
 return result;
end;
$$;

-- One mutation per revision, serialized by owner. Replays return current state without effects.
create function public.cinecriptico_play(p_action text default 'state', p_request_id uuid default null,
 p_revision integer default null, p_guess text default null, p_day date default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); d date:=cinecriptico_private.day_at(clock_timestamp());
 g cinecriptico_private.games; p cinecriptico_private.puzzles; e cinecriptico_private.events;
 pid uuid; guess text; correct boolean; result jsonb;
begin
 if uid is null then raise exception 'authentication required'; end if;
 if p_action is null or p_action not in ('state','start','guess','hint','giveup') then raise exception 'invalid action'; end if;
 if p_action='state' then return cinecriptico_private.state(uid); end if;
 if p_day is distinct from d then return cinecriptico_private.state(uid); end if;
 if p_request_id is null then raise exception 'request required'; end if;
 perform pg_advisory_xact_lock(hashtextextended('cinecriptico:'||uid::text,0));
 d:=cinecriptico_private.day_at(clock_timestamp());
 if p_day is distinct from d then return cinecriptico_private.state(uid); end if;
 select * into e from cinecriptico_private.events where owner_id=uid and request_id=p_request_id;
 if found then
  if e.action is distinct from p_action or e.payload is distinct from p_guess or e.revision is distinct from coalesce(p_revision,0)
   then raise exception 'request conflict'; end if;
  return cinecriptico_private.state(uid);
 end if;
 select * into p from cinecriptico_private.puzzles where day=d;
 if not found then return cinecriptico_private.state(uid); end if;
 select id into pid from public.trivia_players where owner_id=uid;
 if pid is null then raise exception 'player required'; end if;
 select * into g from cinecriptico_private.games where owner_id=uid and day=d for update;
 if p_action='start' then
  if g.id is not null then return cinecriptico_private.state(uid); end if;
  insert into cinecriptico_private.games(owner_id,player_id,day) values(uid,pid,d) returning * into g;
 else
  if g.id is null then raise exception 'start required'; end if;
  if g.phase<>'playing' then return cinecriptico_private.state(uid); end if;
  if p_revision is distinct from g.revision then return cinecriptico_private.state(uid); end if;
  if g.last_action_at > clock_timestamp()-interval '2 seconds' then
   return cinecriptico_private.state(uid)||jsonb_build_object('notice','Esperá dos segundos entre jugadas.');
  end if;
  if p_action='hint' then
   if g.hints_used=3 then return cinecriptico_private.state(uid); end if;
   g.hints_used:=g.hints_used+1;
  elsif p_action='giveup' then g.phase:='given_up';
  else
   if p_guess is null or char_length(p_guess)>48 then raise exception 'invalid word'; end if;
   guess:=cinecriptico_private.word(p_guess);
   if guess !~ '^[A-Z]{3,24}$' or char_length(guess)<>p.letters then raise exception 'invalid word'; end if;
   if g.guesses @> jsonb_build_array(guess) then
    return cinecriptico_private.state(uid)||jsonb_build_object('notice','Ya probaste esa palabra. No gastaste otro intento.');
   end if;
   correct:=guess=cinecriptico_private.word(p.answer);
   g.guesses:=g.guesses||jsonb_build_array(guess);
   if correct then
    g.phase:='solved'; g.score:=greatest(100,1000-180*g.hints_used-100*g.mistakes);
   else
    g.mistakes:=g.mistakes+1;
    if g.mistakes=6 then g.phase:='lost'; end if;
   end if;
  end if;
  update cinecriptico_private.games set phase=g.phase,score=g.score,mistakes=g.mistakes,
   hints_used=g.hints_used,guesses=g.guesses,revision=revision+1,last_action_at=clock_timestamp(),
   review_flags=case when g.phase='solved' and clock_timestamp()-g.created_at<interval '3 seconds' then array['fast_solve']
     when g.phase='lost' and clock_timestamp()-g.created_at<interval '15 seconds' then array['rapid_exhaustion'] else review_flags end,
   finished_at=case when g.phase<>'playing' then clock_timestamp() else null end
   where owner_id=uid and day=d;
 end if;
 insert into cinecriptico_private.events(owner_id,request_id,day,action,payload,revision)
  values(uid,p_request_id,d,p_action,p_guess,coalesce(p_revision,0));
 return cinecriptico_private.state(uid);
end;
$$;

create function public.cinecriptico_dashboard() returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); d date:=cinecriptico_private.day_at(clock_timestamp());
 stats jsonb; daily jsonb; historical jsonb; current_streak int; best_streak int;
begin
 if uid is null then raise exception 'authentication required'; end if;
 select jsonb_build_object('played',count(*),'solved',count(*) filter(where phase='solved'),
  'totalScore',coalesce(sum(score),0),'bestScore',coalesce(max(score),0),
  'averageHints',coalesce(round(avg(hints_used)::numeric,1),0)) into stats
  from cinecriptico_private.games where owner_id=uid;
 with wins as (select day,day-(row_number() over(order by day))::int as island
   from cinecriptico_private.games where owner_id=uid and phase='solved'),
 runs as (select count(*)::int as n,max(day) as last from wins group by island)
 select coalesce(max(n) filter(where last>=d-1),0),coalesce(max(n),0)
 into current_streak,best_streak from runs;
 -- Equal totals share rank: there is no incentive to race instead of thinking.
 select coalesce(jsonb_agg(to_jsonb(t) order by t.rank,t.name),'[]') into daily from (
  select dense_rank() over(order by g.score desc) as rank,p.nickname as name,g.score
  from cinecriptico_private.games g join public.trivia_players p on p.id=g.player_id
  where g.day=d and g.phase='solved' order by g.score desc,p.nickname limit 50) t;
 select coalesce(jsonb_agg(to_jsonb(t) order by t.rank,t.name),'[]') into historical from (
  select dense_rank() over(order by sum(g.score) desc) as rank,p.nickname as name,sum(g.score) as score
  from cinecriptico_private.games g join public.trivia_players p on p.id=g.player_id
  where g.phase='solved' group by p.id,p.nickname order by sum(g.score) desc,p.nickname limit 50) t;
 if exists(select 1 from cinecriptico_private.games where owner_id=uid and day=d and phase in ('lost','given_up')) then current_streak:=0; end if;
 return jsonb_build_object('day',d,'solvedToday',(select count(*) from cinecriptico_private.games where day=d and phase='solved'),
  'stats',stats||jsonb_build_object('streak',current_streak,'bestStreak',best_streak),
  'daily',daily,'historical',historical);
end;
$$;
revoke all on all functions in schema cinecriptico_private from public,anon,authenticated;
revoke all on function public.cinecriptico_play(text,uuid,integer,text,date),public.cinecriptico_dashboard() from public,anon;
grant execute on function public.cinecriptico_play(text,uuid,integer,text,date),public.cinecriptico_dashboard() to authenticated;
commit;
