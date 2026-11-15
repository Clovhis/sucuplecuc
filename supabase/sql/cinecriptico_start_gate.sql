-- Hide all clue content until the owner has started the daily game.
begin;
create or replace function cinecriptico_private.state(p_uid uuid) returns jsonb
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


commit;
