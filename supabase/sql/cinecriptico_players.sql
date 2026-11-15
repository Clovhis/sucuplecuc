-- Apply after cinecriptico.sql. Nicknames belong to a game, auth sessions remain shared.
begin;
create table if not exists cinecriptico_private.players (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null unique,
 nickname text not null check(char_length(nickname) between 2 and 24 and nickname=btrim(nickname)
  and nickname !~ '[[:cntrl:]<>]' and public.is_trivia_nickname_allowed(nickname)),
 nickname_key text generated always as(public.trivia_nickname_key(nickname)) stored unique
  check(char_length(nickname_key)>=2),
 country_code text not null check(country_code ~ '^[A-Z]{2}$'),
 age smallint not null check(age between 1 and 120),
 created_at timestamptz not null default now(),
 unique(id,owner_id)
);
alter table cinecriptico_private.players enable row level security;
revoke all on cinecriptico_private.players from public,anon,authenticated;
-- Copy only participants with existing cryptic games; preserve their IDs and all results.
lock table cinecriptico_private.games in access exclusive mode;
insert into cinecriptico_private.players(id,owner_id,nickname,country_code,age,created_at)
 select p.id,p.owner_id,p.nickname,p.country_code,p.age,p.created_at from public.trivia_players p
 where exists(select 1 from cinecriptico_private.games g where g.player_id=p.id)
 on conflict(id) do nothing;
alter table cinecriptico_private.games drop constraint if exists games_player_id_fkey;
alter table cinecriptico_private.games drop constraint if exists games_player_owner_fkey;
alter table cinecriptico_private.games add constraint games_player_owner_fkey
 foreign key(player_id,owner_id) references cinecriptico_private.players(id,owner_id);

create or replace function public.get_cinecriptico_player() returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'authentication required'; end if;
 return (select jsonb_build_object('id',p.id,'name',p.nickname,'country',p.country_code,'age',p.age)
  from cinecriptico_private.players p where p.owner_id=auth.uid());
end;
$$;
create or replace function public.claim_cinecriptico_player(p_name text,p_country text,p_age integer) returns jsonb
language plpgsql security definer set search_path='' as $$
declare p cinecriptico_private.players; uid uuid:=auth.uid(); cleaned text:=btrim(coalesce(p_name,''));
begin
 if uid is null then raise exception 'authentication required'; end if;
 if char_length(cleaned) not between 2 and 24 or cleaned ~ '[[:cntrl:]<>]'
  or not public.is_trivia_nickname_allowed(cleaned) or char_length(public.trivia_nickname_key(cleaned))<2
  then raise exception 'nickname not allowed'; end if;
 if p_country is null or p_country !~ '^[A-Z]{2}$' or p_age is null or p_age not between 1 and 120
  then raise exception 'invalid player profile'; end if;
 perform pg_advisory_xact_lock(hashtextextended('cinecriptico:profile:'||uid::text,0));
 select * into p from cinecriptico_private.players where owner_id=uid for update;
 if found then
  if p.nickname_key<>public.trivia_nickname_key(cleaned) then raise exception 'nickname belongs to this player'; end if;
  update cinecriptico_private.players set country_code=p_country,age=p_age where id=p.id;
 else
  begin
   insert into cinecriptico_private.players(owner_id,nickname,country_code,age) values(uid,cleaned,p_country,p_age);
  exception when unique_violation then raise exception 'nickname unavailable'; end;
 end if;
 return public.get_cinecriptico_player();
end;
$$;
-- Keep the already-reviewed game and dashboard definitions, changing only their player source.
do $migration$
declare definition text;
begin
 select pg_get_functiondef('public.cinecriptico_play(text,uuid,integer,text,date)'::regprocedure) into definition;
 execute replace(definition,'public.trivia_players','cinecriptico_private.players');
 select pg_get_functiondef('public.cinecriptico_dashboard()'::regprocedure) into definition;
 execute replace(definition,'public.trivia_players','cinecriptico_private.players');
end;
$migration$;
revoke all on function public.get_cinecriptico_player(),public.claim_cinecriptico_player(text,text,integer) from public,anon;
grant execute on function public.get_cinecriptico_player(),public.claim_cinecriptico_player(text,text,integer) to authenticated;
commit;
