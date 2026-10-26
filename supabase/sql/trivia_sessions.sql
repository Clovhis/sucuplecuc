-- Apply after trivia_high_scores.sql. All game state and answers remain private.
begin;
create or replace function public.trivia_nickname_key(p_name text) returns text
language sql immutable set search_path='' as $$
 select regexp_replace(translate(regexp_replace(lower(normalize(coalesce(p_name,''),NFKD)),U&'[\0300-\036f]','','g'),
 '01345789@!$+€аɑαеεіιоοрρсϲхχуυһнтτкκмμвβ','oieastbgaisteaaaeeiiooppccxxyyhhttkkmmbb'),'[^a-z0-9]','','g');
$$;
create table if not exists public.trivia_players (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null unique,
 nickname text not null check(char_length(nickname) between 2 and 24 and nickname=btrim(nickname) and nickname !~ '[[:cntrl:]<>]' and public.is_trivia_nickname_allowed(nickname)),
 nickname_key text generated always as(public.trivia_nickname_key(nickname)) stored unique check(char_length(nickname_key)>=2),
 country_code text not null check(country_code ~ '^[A-Z]{2}$'),
 age smallint not null check(age between 1 and 120),
 created_at timestamptz not null default now()
);
create table if not exists public.trivia_questions (
 id text primary key, payload jsonb not null, catalog_version text not null, active boolean not null default false
);
create table if not exists public.trivia_games (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null,
 player_id uuid not null references public.trivia_players(id), player jsonb not null,
 questions jsonb not null check(jsonb_array_length(questions)=20),
 round integer not null default 0 check(round between 0 and 19),
 phase text not null default 'question' check(phase in('question','review','finished','abandoned')),
 deadline timestamptz not null default clock_timestamp()+interval '20 seconds',
 answers jsonb not null default '[]', hints jsonb not null default '{}',
 score integer not null default 0, created_at timestamptz not null default now()
);
create index if not exists idx_trivia_games_owner on public.trivia_games(owner_id,created_at desc);
create unique index if not exists idx_trivia_games_active on public.trivia_games(owner_id) where phase in('question','review');
create table if not exists public.trivia_verified_scores (
 player_id uuid primary key references public.trivia_players(id),
 session_id uuid not null unique references public.trivia_games(id),
 score integer not null check(score between 0 and 24750),
 correct_count integer not null check(correct_count between 0 and 20),
 hints_used integer not null check(hints_used between 0 and 3),
 country_code text not null, created_at timestamptz not null default now()
);
create table if not exists public.trivia_seen_questions (
 player_id uuid not null references public.trivia_players(id), question_id text not null,
 seen_at timestamptz not null default now(), primary key(player_id,question_id)
);
alter table public.trivia_players enable row level security;
alter table public.trivia_questions enable row level security;
alter table public.trivia_games enable row level security;
alter table public.trivia_seen_questions enable row level security;
alter table public.trivia_verified_scores enable row level security;
revoke all on public.trivia_players,public.trivia_questions,public.trivia_games,public.trivia_seen_questions,public.trivia_verified_scores from public,anon,authenticated;
-- This old endpoint accepts client-supplied correctness/timing. Only trusted SQL may use it.
revoke all on function public.submit_trivia_high_score(uuid,uuid,text,text,integer,jsonb,integer) from public,anon,authenticated;

create or replace function public.trivia_nickname_available(p_name text) returns boolean
language sql security definer set search_path='' as $$
 select char_length(btrim(p_name)) between 2 and 24 and public.is_trivia_nickname_allowed(p_name)
 and char_length(public.trivia_nickname_key(p_name))>=2
 and not exists(select 1 from public.trivia_players p where p.nickname_key=public.trivia_nickname_key(p_name) and p.owner_id is distinct from auth.uid());
$$;
create or replace function public.get_trivia_player() returns jsonb
language sql security definer set search_path='' as $$
 select jsonb_build_object('id',p.id,'name',p.nickname,'country',p.country_code,'age',p.age)
 from public.trivia_players p where p.owner_id=auth.uid();
$$;
create or replace function public.claim_trivia_player(p_name text,p_country text,p_age integer) returns jsonb
language plpgsql security definer set search_path='' as $$
declare p public.trivia_players; uid uuid:=auth.uid(); cleaned text:=btrim(coalesce(p_name,''));
begin
 if uid is null then raise exception 'authentication required'; end if;
 if char_length(cleaned) not between 2 and 24 or cleaned ~ '[[:cntrl:]<>]' or not public.is_trivia_nickname_allowed(cleaned) or char_length(public.trivia_nickname_key(cleaned))<2 then raise exception 'nickname not allowed'; end if;
 if p_country is null or p_country !~ '^[A-Z]{2}$' or p_age is null or p_age not between 1 and 120 then raise exception 'invalid player profile'; end if;
 perform pg_advisory_xact_lock(hashtext(uid::text));
 select * into p from public.trivia_players where owner_id=uid for update;
 if found then
  if p.nickname_key<>public.trivia_nickname_key(cleaned) then raise exception 'nickname belongs to this player'; end if;
  update public.trivia_players set country_code=p_country,age=p_age where id=p.id;
 else
  begin
   insert into public.trivia_players(owner_id,nickname,country_code,age) values(uid,cleaned,p_country,p_age);
  exception when unique_violation then raise exception 'nickname unavailable'; end;
 end if;
 return public.get_trivia_player();
end;
$$;

-- Private serializer: never reveal future questions or unanswered solutions.
create or replace function public.trivia_game_state(p_session_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare g public.trivia_games; q jsonb;
begin
 select * into g from public.trivia_games where id=p_session_id and owner_id=auth.uid();
 if not found then raise exception 'game not found'; end if;
 q:=g.questions->g.round;
 if g.phase='question' then q:=q-'answer'-'fact'; end if;
 -- Catalog question IDs contain the solution slug; only expose an opaque round ID.
 q:=(q-'id')||jsonb_build_object('id',g.id::text||':'||g.round::text);
 return jsonb_build_object('id',g.id,'player',g.player,'round',g.round,'phase',g.phase,
  'deadlineMs',floor(extract(epoch from g.deadline)*1000),'serverNowMs',floor(extract(epoch from clock_timestamp())*1000),
  'question',case when g.phase='finished' then null else q end,
  'answers',g.answers,'hintsUsed',(select count(*) from jsonb_object_keys(g.hints)),
  'discarded',g.hints->>g.round::text,'score',g.score,
  'bonus',case when g.phase='finished' then (3-(select count(*) from jsonb_object_keys(g.hints)))*250 else 0 end);
end;
$$;
create or replace function public.get_trivia_game(p_session_id uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare sid uuid;
begin
 if auth.uid() is null then raise exception 'authentication required'; end if;
 if p_session_id is null then
  select id into sid from public.trivia_games where owner_id=auth.uid() and phase<>'abandoned' order by created_at desc limit 1;
  if sid is null then return null; end if;
 else sid:=p_session_id; end if;
 return public.trivia_game_state(sid);
end;
$$;
create or replace function public.start_trivia_game() returns jsonb
language plpgsql security definer set search_path='' as $$
declare p public.trivia_players; sid uuid; selected jsonb := '[]'::jsonb; chosen jsonb; slot integer; target text; used text[] := '{}';
begin
 if auth.uid() is null then raise exception 'authentication required'; end if;
 select * into p from public.trivia_players where owner_id=auth.uid() for update;
 if not found then raise exception 'player required'; end if;
 if not public.is_trivia_nickname_allowed(p.nickname) then raise exception 'nickname not allowed'; end if;
 if (select count(*) from public.trivia_games where owner_id=auth.uid() and created_at>clock_timestamp()-interval '1 minute')>=5 then raise exception 'too many games'; end if;
 if (select count(*) from public.trivia_questions where active)<1000 then raise exception 'question bank unavailable'; end if;
 -- Twelve distinct stories, at most six credit clues (three per kind), two extras.
 -- Each slot prefers unseen questions; fallback keeps small future banks playable.
 for slot in 1..20 loop
  target:=case when slot<=12 then 'story' when slot<=18 then 'credits' else 'extra' end;
  select q.payload into chosen
  from public.trivia_questions q
  left join public.trivia_seen_questions h on h.question_id=q.id and h.player_id=p.id
  where q.active and not(q.payload->'answer'->>'slug'=any(used))
  order by
   case when h.seen_at is null and q.payload->>'family'=target and (target='story' or
    (select count(*) from jsonb_array_elements(selected) x where x->>'kind'=q.payload->>'kind')<3) then 0
    when h.seen_at is null and q.payload->>'family'='story' then 1
    when q.payload->>'family'=target and (target='story' or
    (select count(*) from jsonb_array_elements(selected) x where x->>'kind'=q.payload->>'kind')<3) then 2
    when q.payload->>'family'='story' then 3 else 4 end,
   h.seen_at nulls first,
   (select count(*) from jsonb_array_elements(selected) x where x->>'kind'=q.payload->>'kind'),random()
  limit 1;
  if chosen is null then raise exception 'question bank unavailable'; end if;
  used:=array_append(used,chosen->'answer'->>'slug');
  selected:=selected||jsonb_build_array((chosen-'options')||jsonb_build_object('options',
   (select jsonb_agg(value order by random()) from jsonb_array_elements(chosen->'options'))));
 end loop;
 select jsonb_agg(value order by random()) into selected from jsonb_array_elements(selected);
 if jsonb_array_length(selected)<>20 then raise exception 'question bank unavailable'; end if;
 update public.trivia_games set phase='abandoned' where owner_id=auth.uid() and phase in('question','review');
 insert into public.trivia_games(owner_id,player_id,player,questions) values(auth.uid(),p.id,public.get_trivia_player(),selected) returning id into sid;
 insert into public.trivia_seen_questions(player_id,question_id) values(p.id,selected->0->>'id') on conflict(player_id,question_id) do update set seen_at=now();
 return public.trivia_game_state(sid);
end;
$$;

create or replace function public.answer_trivia_question(p_session_id uuid,p_round integer,p_choice text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare g public.trivia_games; q jsonb; chosen jsonb; correct boolean; remaining integer; earned integer; result jsonb; total integer;
begin
 select * into g from public.trivia_games where id=p_session_id and owner_id=auth.uid() for update;
 if not found then raise exception 'game not found'; end if;
 if p_round is null or p_round<>g.round then raise exception 'stale question'; end if;
 if g.phase in('review','finished') then return public.trivia_game_state(g.id); end if;
 if g.phase<>'question' then raise exception 'game not active'; end if;
 q:=g.questions->g.round;
 remaining:=least(20000,greatest(0,floor(extract(epoch from(g.deadline-clock_timestamp()))*1000)::integer));
 if remaining=0 then p_choice:=null;
 elsif p_choice is null then raise exception 'question still active'; end if;
 if p_choice is not null then
  select value into chosen from jsonb_array_elements(q->'options') where value->>'slug'=p_choice;
  if chosen is null or p_choice=g.hints->>g.round::text then raise exception 'invalid choice'; end if;
 end if;
 correct:=p_choice is not null and p_choice=q->'answer'->>'slug';
 earned:=case when correct then 1000+remaining/100 else 0 end;
 result:=jsonb_build_object('questionId',q->>'id','prompt',q->>'prompt','fact',q->>'fact','movie',q->'answer','choice',chosen,'correct',correct,'remainingMs',remaining,'points',earned);
 update public.trivia_games set answers=answers||jsonb_build_array(result),score=score+earned,phase='review' where id=g.id;
 if g.round=19 then
  total:=g.score+earned+(3-(select count(*)::integer from jsonb_object_keys(g.hints)))*250;
  insert into public.trivia_verified_scores(player_id,session_id,score,correct_count,hints_used,country_code)
  values(g.player_id,g.id,total,
   (select count(*)::integer from public.trivia_games saved,jsonb_array_elements(saved.answers) a where saved.id=g.id and (a->>'correct')::boolean),
   (select count(*)::integer from jsonb_object_keys(g.hints)),g.player->>'country')
  on conflict(player_id) do update set session_id=excluded.session_id,score=excluded.score,correct_count=excluded.correct_count,hints_used=excluded.hints_used,country_code=excluded.country_code,created_at=excluded.created_at
  where excluded.score>public.trivia_verified_scores.score;
  update public.trivia_games set score=total,phase='finished' where id=g.id;
 end if;
 return public.trivia_game_state(g.id);
end;
$$;
create or replace function public.use_trivia_hint(p_session_id uuid,p_round integer) returns jsonb
language plpgsql security definer set search_path='' as $$
declare g public.trivia_games; q jsonb; discarded text;
begin
 select * into g from public.trivia_games where id=p_session_id and owner_id=auth.uid() for update;
 if not found then raise exception 'game not found'; end if;
 if p_round is null or p_round<>g.round then raise exception 'stale question'; end if;
 if g.phase<>'question' then return public.trivia_game_state(g.id); end if;
 if clock_timestamp()>=g.deadline then return public.answer_trivia_question(g.id,g.round,null); end if;
 if g.hints ? g.round::text then return public.trivia_game_state(g.id); end if;
 if (select count(*) from jsonb_object_keys(g.hints))>=3 then raise exception 'no hints left'; end if;
 q:=g.questions->g.round;
 select value->>'slug' into discarded from jsonb_array_elements(q->'options') where value->>'slug'<>q->'answer'->>'slug' order by random() limit 1;
 update public.trivia_games set hints=hints||jsonb_build_object(g.round::text,discarded) where id=g.id;
 return public.trivia_game_state(g.id);
end;
$$;
create or replace function public.next_trivia_question(p_session_id uuid,p_round integer) returns jsonb
language plpgsql security definer set search_path='' as $$
declare g public.trivia_games;
begin
 select * into g from public.trivia_games where id=p_session_id and owner_id=auth.uid() for update;
 if not found then raise exception 'game not found'; end if;
 -- A retry after a lost response must not reset the next question's timer.
 if p_round is null then raise exception 'stale question'; end if;
 if p_round=g.round-1 and g.phase='question' then return public.trivia_game_state(g.id); end if;
 if p_round<>g.round then raise exception 'stale question'; end if;
 if g.phase='finished' then return public.trivia_game_state(g.id); end if;
 if g.phase<>'review' or g.round>=19 then raise exception 'answer required'; end if;
 update public.trivia_games set round=round+1,phase='question',deadline=clock_timestamp()+interval '20 seconds' where id=g.id;
 insert into public.trivia_seen_questions(player_id,question_id) values(g.player_id,g.questions->(g.round+1)->>'id') on conflict(player_id,question_id) do update set seen_at=now();
 return public.trivia_game_state(g.id);
end;
$$;

drop function if exists public.list_trivia_high_scores(integer);
create function public.list_trivia_high_scores(p_limit integer default 10)
returns table(rank integer,player_name text,country_code text,score integer,correct_count integer,age integer)
language sql security definer set search_path='' as $$
 with best as (
  select p.nickname as player_name,s.country_code,s.score,s.correct_count,p.age::integer,s.created_at,s.session_id as id
  from public.trivia_verified_scores s join public.trivia_players p on p.id=s.player_id
  where public.is_trivia_nickname_allowed(p.nickname)
 ) select row_number() over(order by best.score desc,best.created_at,best.id)::integer,best.player_name,best.country_code,best.score,best.correct_count,best.age
 from best order by best.score desc,best.created_at,best.id limit least(greatest(coalesce(p_limit,10),1),10);
$$;

revoke all on function public.list_trivia_high_scores(integer) from public,anon,authenticated;
grant execute on function public.list_trivia_high_scores(integer) to anon,authenticated;
revoke all on function public.trivia_game_state(uuid) from public,anon,authenticated;
revoke all on function public.claim_trivia_player(text,text,integer),public.get_trivia_player(),public.start_trivia_game(),public.get_trivia_game(uuid),public.answer_trivia_question(uuid,integer,text),public.use_trivia_hint(uuid,integer),public.next_trivia_question(uuid,integer) from public,anon,authenticated;
grant execute on function public.claim_trivia_player(text,text,integer),public.get_trivia_player(),public.start_trivia_game(),public.get_trivia_game(uuid),public.answer_trivia_question(uuid,integer,text),public.use_trivia_hint(uuid,integer),public.next_trivia_question(uuid,integer) to authenticated;
revoke all on function public.trivia_nickname_available(text) from public;
grant execute on function public.trivia_nickname_available(text) to anon,authenticated;
commit;
