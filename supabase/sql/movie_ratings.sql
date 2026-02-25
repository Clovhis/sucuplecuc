-- La posta cine - movie rating schema (1..5 stars)
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

create policy movie_ratings_select_anon
on public.movie_ratings
for select
to anon, authenticated
using (true);

create policy movie_ratings_insert_anon
on public.movie_ratings
for insert
to anon, authenticated
with check (true);

create policy movie_ratings_update_anon
on public.movie_ratings
for update
to anon, authenticated
using (true)
with check (true);

grant select, insert, update on public.movie_ratings to anon, authenticated;

create or replace view public.movie_rating_stats as
select
	movie_slug,
	round(avg(rating)::numeric, 2) as avg_rating,
	count(*)::integer as vote_count
from public.movie_ratings
group by movie_slug;

grant select on public.movie_rating_stats to anon, authenticated;

