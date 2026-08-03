-- Cine Posta - arcade high-score for the actor career simulator.
-- Public reads and writes go through validated RPCs; the base table stays private.

create table if not exists public.actor_high_scores (
	id bigint generated always as identity primary key,
	player_name text not null check (char_length(player_name) between 2 and 24 and player_name = btrim(player_name) and player_name !~ '[[:cntrl:]<>]'),
	score integer not null check (score between 0 and 100000),
	profession text not null check (profession in ('actor', 'director', 'assistant', 'producer')),
	difficulty text not null check (difficulty in ('intensa', 'normal', 'expres')),
	country_code text not null check (country_code ~ '^[A-Z]{2}$'),
	created_at timestamptz not null default now()
);

create index if not exists idx_actor_high_scores_ranking
	on public.actor_high_scores (score desc, created_at asc, id asc);

alter table public.actor_high_scores enable row level security;
revoke all on public.actor_high_scores from anon, authenticated;

create or replace function public.list_actor_high_scores(p_limit integer default 10)
returns table (
	rank integer,
	player_name text,
	score integer,
	profession text,
	difficulty text,
	country_code text
)
language sql
security definer
set search_path = public
as $$
	select
		row_number() over (order by high_score.score desc, high_score.created_at asc, high_score.id asc)::integer as rank,
		high_score.player_name,
		high_score.score,
		high_score.profession,
		high_score.difficulty,
		high_score.country_code
	from public.actor_high_scores as high_score
	order by high_score.score desc, high_score.created_at asc, high_score.id asc
	limit least(greatest(coalesce(p_limit, 10), 1), 10);
$$;

create or replace function public.submit_actor_high_score(
	p_player_name text,
	p_profession text,
	p_difficulty text,
	p_country_code text,
	p_level integer,
	p_films integer,
	p_leads integer,
	p_nominations integer,
	p_awards integer,
	p_luck integer
)
returns table (score integer)
language plpgsql
security definer
set search_path = public
as $$
declare
	normalized_name text := btrim(coalesce(p_player_name, ''));
	normalized_profession text := lower(btrim(coalesce(p_profession, '')));
	normalized_difficulty text := lower(btrim(coalesce(p_difficulty, '')));
	normalized_country text := upper(btrim(coalesce(p_country_code, '')));
	calculated_score integer;
begin
	if char_length(normalized_name) not between 2 and 24 or normalized_name ~ '[[:cntrl:]<>]' then
		raise exception 'invalid player name';
	end if;

	if normalized_profession not in ('actor', 'director', 'assistant', 'producer') then
		raise exception 'invalid profession';
	end if;

	if normalized_difficulty not in ('intensa', 'normal', 'expres') then
		raise exception 'invalid difficulty';
	end if;

	if normalized_country !~ '^[A-Z]{2}$' then
		raise exception 'invalid country code';
	end if;

	if p_level is null or p_level not between 1 and 99 then
		raise exception 'invalid level';
	end if;

	if p_films is null or p_films not between 0 and 50 then
		raise exception 'invalid films count';
	end if;

	if p_leads is null or p_leads not between 0 and 50 then
		raise exception 'invalid leads count';
	end if;

	if p_nominations is null or p_nominations not between 0 and 50 then
		raise exception 'invalid nominations count';
	end if;

	if p_awards is null or p_awards not between 0 and 5 then
		raise exception 'invalid awards count';
	end if;

	if p_luck is null or p_luck not between 15 and 90 then
		raise exception 'invalid luck';
	end if;

	calculated_score := round(
		(
			p_level * 100
			+ p_films * 60
			+ p_leads * 100
			+ p_nominations * 80
			+ p_awards * 300
			+ p_luck * 2
		)::numeric
		* case normalized_difficulty
			when 'intensa' then 1.15
			when 'normal' then 1.00
			else 0.85
		end
	)::integer;

	insert into public.actor_high_scores (
		player_name,
		score,
		profession,
		difficulty,
		country_code
	)
	values (
		normalized_name,
		calculated_score,
		normalized_profession,
		normalized_difficulty,
		normalized_country
	);

	-- Keep a small buffer for ties while preventing unbounded public growth.
	delete from public.actor_high_scores as stale_score
	where stale_score.id not in (
		select retained_score.id
		from public.actor_high_scores as retained_score
		order by retained_score.score desc, retained_score.created_at asc, retained_score.id asc
		limit 100
	);

	return query select calculated_score;
end;
$$;

revoke all on function public.list_actor_high_scores(integer) from public;
revoke all on function public.submit_actor_high_score(text, text, text, text, integer, integer, integer, integer, integer, integer) from public;
grant execute on function public.list_actor_high_scores(integer) to anon, authenticated;
grant execute on function public.submit_actor_high_score(text, text, text, text, integer, integer, integer, integer, integer, integer) to anon, authenticated;
