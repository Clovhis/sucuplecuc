-- CinePosta ratings: compatible v1 (1..5) and current v2 (1..10) APIs
-- Run in Supabase SQL Editor with an admin role.

create extension if not exists pgcrypto;

create table if not exists public.movie_ratings (
	id uuid primary key default gen_random_uuid(),
	movie_slug text not null,
	visitor_token text not null,
	rating integer not null check (rating between 1 and 5),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

do $$
begin
	if not exists (
		select 1
		from pg_constraint
		where conname = 'movie_ratings_movie_slug_visitor_token_key'
	) then
		alter table public.movie_ratings
			add constraint movie_ratings_movie_slug_visitor_token_key
			unique (movie_slug, visitor_token);
	end if;
end $$;

create index if not exists idx_movie_ratings_movie_slug
	on public.movie_ratings (movie_slug);

create index if not exists idx_movie_ratings_movie_slug_rating
	on public.movie_ratings (movie_slug, rating);

create or replace function public.set_movie_ratings_updated_at()
returns trigger
language plpgsql
as $$
begin
	new.updated_at = now();
	return new;
end;
$$;

drop trigger if exists trg_movie_ratings_updated_at on public.movie_ratings;

create trigger trg_movie_ratings_updated_at
before update on public.movie_ratings
for each row
execute function public.set_movie_ratings_updated_at();

alter table public.movie_ratings enable row level security;

drop policy if exists movie_ratings_select_anon on public.movie_ratings;
drop policy if exists movie_ratings_insert_anon on public.movie_ratings;
drop policy if exists movie_ratings_update_anon on public.movie_ratings;
revoke all on public.movie_ratings from anon, authenticated;

create or replace view public.movie_rating_stats as
select
	movie_slug,
	round(avg(rating)::numeric, 2) as avg_rating,
	count(*)::integer as vote_count
from public.movie_ratings
group by movie_slug;

revoke all on public.movie_rating_stats from anon, authenticated;
grant select on public.movie_rating_stats to anon, authenticated;

create or replace function public.get_movie_rating(
	p_movie_slug text,
	p_visitor_token text
)
returns table (rating integer)
language plpgsql
security definer
set search_path = public
as $$
declare
	normalized_movie_slug text := btrim(coalesce(p_movie_slug, ''));
	normalized_visitor_token text := btrim(coalesce(p_visitor_token, ''));
begin
	if normalized_movie_slug = '' or normalized_visitor_token = '' then
		return;
	end if;

	return query
	select movie_ratings.rating
	from public.movie_ratings
	where movie_ratings.movie_slug = normalized_movie_slug
		and movie_ratings.visitor_token = normalized_visitor_token
	limit 1;
end;
$$;

create or replace function public.submit_movie_rating(
	p_movie_slug text,
	p_visitor_token text,
	p_rating integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
	normalized_movie_slug text := btrim(coalesce(p_movie_slug, ''));
	normalized_visitor_token text := btrim(coalesce(p_visitor_token, ''));
begin
	if normalized_movie_slug = '' then
		raise exception 'movie_slug is required';
	end if;

	if normalized_visitor_token = '' then
		raise exception 'visitor_token is required';
	end if;

	if char_length(normalized_visitor_token) < 16 then
		raise exception 'visitor_token is too short';
	end if;

	if p_rating is null or p_rating < 1 or p_rating > 5 then
		raise exception 'rating must be between 1 and 5';
	end if;

	insert into public.movie_ratings (
		movie_slug,
		visitor_token,
		rating
	)
	values (
		normalized_movie_slug,
		normalized_visitor_token,
		p_rating
	)
	on conflict (movie_slug, visitor_token)
	do update set
		rating = excluded.rating,
		updated_at = now();
end;
$$;

revoke all on function public.get_movie_rating(text, text) from public;
revoke all on function public.submit_movie_rating(text, text, integer) from public;
grant execute on function public.get_movie_rating(text, text) to anon, authenticated;
grant execute on function public.submit_movie_rating(text, text, integer) to anon, authenticated;


-- Fresh installs include the additive 1..10 API below.
-- Incremental, idempotent upgrade. Apply BEFORE deploying the 1..10 UI.
-- Existing rows keep scale=5; their public v2 value is doubled on read.
begin;
lock table public.movie_ratings in access exclusive mode;
alter table public.movie_ratings add column if not exists rating_scale integer not null default 5;
alter table public.movie_ratings drop constraint if exists movie_ratings_rating_check;
alter table public.movie_ratings drop constraint if exists movie_ratings_rating_scale_check;
alter table public.movie_ratings add constraint movie_ratings_rating_scale_check
 check (rating_scale in (5, 10) and rating between 1 and rating_scale);

create or replace function public.canonical_rating_movie_slug(value text)
returns text language sql immutable set search_path = public as $$
 select case btrim(coalesce(value, ''))
 when 'seven-samurai-1954' then 'los-siete-samurais-1954'
 when 'paprika-detective-de-los-suenos-2006' then 'paprika-2006'
 else btrim(coalesce(value, '')) end;
$$;

-- Preserve the latest vote per visitor, including visitors who voted on both URLs.
delete from public.movie_ratings old_vote using public.movie_ratings newer_vote
where public.canonical_rating_movie_slug(old_vote.movie_slug) = public.canonical_rating_movie_slug(newer_vote.movie_slug)
 and old_vote.visitor_token = newer_vote.visitor_token
 and (old_vote.updated_at, old_vote.id) < (newer_vote.updated_at, newer_vote.id);
update public.movie_ratings set movie_slug = public.canonical_rating_movie_slug(movie_slug)
where movie_slug <> public.canonical_rating_movie_slug(movie_slug);

-- Legacy clients continue to read a 1..5 average.
create or replace view public.movie_rating_stats as
select movie_slug, round(avg(rating * 5.0 / rating_scale)::numeric, 2) as avg_rating,
 count(*)::integer as vote_count from public.movie_ratings group by movie_slug;
create or replace view public.movie_rating_stats_v2 as
select movie_slug, round(avg(rating * 10.0 / rating_scale)::numeric, 2) as avg_rating,
 count(*)::integer as vote_count from public.movie_ratings group by movie_slug;
revoke all on public.movie_rating_stats_v2 from public, anon, authenticated;
grant select on public.movie_rating_stats_v2 to anon, authenticated;
create or replace function public.get_movie_rating(
	p_movie_slug text,
	p_visitor_token text
)
returns table (rating integer)
language plpgsql
security definer
set search_path = public
as $$
declare
	normalized_movie_slug text := public.canonical_rating_movie_slug(p_movie_slug);
	normalized_visitor_token text := btrim(coalesce(p_visitor_token, ''));
begin
	if normalized_movie_slug = '' or normalized_visitor_token = '' then
		return;
	end if;

	return query
	select round(movie_ratings.rating * 5.0 / movie_ratings.rating_scale)::integer
	from public.movie_ratings
	where movie_ratings.movie_slug = normalized_movie_slug
		and movie_ratings.visitor_token = normalized_visitor_token
	limit 1;
end;
$$;

create or replace function public.submit_movie_rating(
	p_movie_slug text,
	p_visitor_token text,
	p_rating integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
	normalized_movie_slug text := public.canonical_rating_movie_slug(p_movie_slug);
	normalized_visitor_token text := btrim(coalesce(p_visitor_token, ''));
begin
	if normalized_movie_slug = '' then
		raise exception 'movie_slug is required';
	end if;

	if normalized_visitor_token = '' then
		raise exception 'visitor_token is required';
	end if;

	if char_length(normalized_visitor_token) < 16 then
		raise exception 'visitor_token is too short';
	end if;

	if p_rating is null or p_rating < 1 or p_rating > 5 then
		raise exception 'rating must be between 1 and 5';
	end if;

	insert into public.movie_ratings (
		movie_slug,
		visitor_token,
		rating,
		rating_scale
	)
	values (
		normalized_movie_slug,
		normalized_visitor_token,
		p_rating,
		5
	)
	on conflict (movie_slug, visitor_token)
	do update set
		rating = excluded.rating,
		rating_scale = excluded.rating_scale,
		updated_at = now();
end;
$$;

create or replace function public.get_movie_rating_v2(
	p_movie_slug text,
	p_visitor_token text
)
returns table (rating integer)
language plpgsql
security definer
set search_path = public
as $$
declare
	normalized_movie_slug text := public.canonical_rating_movie_slug(p_movie_slug);
	normalized_visitor_token text := btrim(coalesce(p_visitor_token, ''));
begin
	if normalized_movie_slug = '' or normalized_visitor_token = '' then
		return;
	end if;

	return query
	select round(movie_ratings.rating * 10.0 / movie_ratings.rating_scale)::integer
	from public.movie_ratings
	where movie_ratings.movie_slug = normalized_movie_slug
		and movie_ratings.visitor_token = normalized_visitor_token
	limit 1;
end;
$$;

create or replace function public.submit_movie_rating_v2(
	p_movie_slug text,
	p_visitor_token text,
	p_rating integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
	normalized_movie_slug text := public.canonical_rating_movie_slug(p_movie_slug);
	normalized_visitor_token text := btrim(coalesce(p_visitor_token, ''));
begin
	if normalized_movie_slug = '' then
		raise exception 'movie_slug is required';
	end if;

	if normalized_visitor_token = '' then
		raise exception 'visitor_token is required';
	end if;

	if char_length(normalized_visitor_token) < 16 then
		raise exception 'visitor_token is too short';
	end if;

	if p_rating is null or p_rating < 1 or p_rating > 10 then
		raise exception 'rating must be between 1 and 10';
	end if;

	insert into public.movie_ratings (
		movie_slug,
		visitor_token,
		rating,
		rating_scale
	)
	values (
		normalized_movie_slug,
		normalized_visitor_token,
		p_rating,
		10
	)
	on conflict (movie_slug, visitor_token)
	do update set
		rating = excluded.rating,
		rating_scale = excluded.rating_scale,
		updated_at = now();
end;
$$;

revoke all on function public.get_movie_rating_v2(text, text) from public;
revoke all on function public.submit_movie_rating_v2(text, text, integer) from public;
grant execute on function public.get_movie_rating_v2(text, text) to anon, authenticated;
grant execute on function public.submit_movie_rating_v2(text, text, integer) to anon, authenticated;
commit;
