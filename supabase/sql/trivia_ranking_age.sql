-- Incremental update for an existing Trivia installation. Keeps players and scores intact.
begin;
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
commit;
