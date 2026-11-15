-- Upgrade an existing installation; fresh installs already include this guard.
begin;
do $migration$
declare definition text; lock_line text:='perform pg_advisory_xact_lock(hashtextextended(''cinecriptico:''||uid::text,0));';
begin
 select pg_get_functiondef('public.cinecriptico_play(text,uuid,integer,text,date)'::regprocedure) into definition;
 if position(' d:=cinecriptico_private.day_at(clock_timestamp());' in definition)=0 then
  if position(lock_line in definition)=0 then raise exception 'unexpected CineCriptico function definition'; end if;
  execute replace(definition,lock_line,lock_line||E'\n d:=cinecriptico_private.day_at(clock_timestamp());\n if p_day is distinct from d then return cinecriptico_private.state(uid); end if;');
 end if;
end;
$migration$;
commit;
