-- Incremental, repeatable upgrade. Preserve players, records, and in-progress games.
begin;
alter table public.trivia_games add column if not exists round_seconds smallint not null default 20 check(round_seconds in(20,25));
alter table public.trivia_games alter column round_seconds set default 25;
alter table public.trivia_games alter column deadline set default clock_timestamp()+interval '25 seconds';

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
  'deadlineMs',floor(extract(epoch from g.deadline)*1000),'serverNowMs',floor(extract(epoch from clock_timestamp())*1000),'roundSeconds',g.round_seconds,
  'question',case when g.phase='finished' then null else q end,
  'answers',g.answers,'hintsUsed',(select count(*) from jsonb_object_keys(g.hints)),
  'discarded',g.hints->>g.round::text,'score',g.score,
  'bonus',case when g.phase='finished' then (3-(select count(*) from jsonb_object_keys(g.hints)))*250 else 0 end);
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
 remaining:=least(g.round_seconds*1000,greatest(0,floor(extract(epoch from(g.deadline-clock_timestamp()))*1000)::integer));
 if remaining=0 then p_choice:=null;
 elsif p_choice is null then raise exception 'question still active'; end if;
 if p_choice is not null then
  select value into chosen from jsonb_array_elements(q->'options') where value->>'slug'=p_choice;
  if chosen is null or p_choice=g.hints->>g.round::text then raise exception 'invalid choice'; end if;
 end if;
 correct:=p_choice is not null and p_choice=q->'answer'->>'slug';
 earned:=case when correct then 1000+remaining/(g.round_seconds*5) else 0 end;
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
 update public.trivia_games set round=round+1,phase='question',deadline=clock_timestamp()+make_interval(secs=>g.round_seconds) where id=g.id;
 insert into public.trivia_seen_questions(player_id,question_id) values(g.player_id,g.questions->(g.round+1)->>'id') on conflict(player_id,question_id) do update set seen_at=now();
 return public.trivia_game_state(g.id);
end;
$$;
commit;
