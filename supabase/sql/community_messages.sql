-- Cine Posta community forum. Run once in the Supabase SQL Editor as project admin.
-- Visitors use Supabase Anonymous Auth; no service-role key is ever sent to browsers.

create extension if not exists pgcrypto;

do $$
begin
	if not exists (select 1 from pg_type where typname = 'community_message_status' and typnamespace = 'public'::regnamespace) then
		create type public.community_message_status as enum ('pending', 'approved', 'hidden');
	end if;
end;
$$;

create table if not exists public.community_threads (
	id uuid primary key default gen_random_uuid(),
	thread_key text not null unique check (thread_key ~ '^cineposta-(la-sala-principal|pelicula-[a-z0-9-]+)$'),
	movie_slug text unique,
	movie_title text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	check (
		(movie_slug is null and movie_title is null and thread_key = 'cineposta-la-sala-principal')
		or (movie_slug is not null and movie_title is not null and thread_key = ('cineposta-pelicula-' || movie_slug))
	)
);

create table if not exists public.community_messages (
	id bigint generated always as identity primary key,
	thread_id uuid not null references public.community_threads(id) on delete cascade,
	parent_id bigint references public.community_messages(id) on delete set null,
	author_id uuid not null references auth.users(id) on delete cascade,
	author_name text not null check (char_length(author_name) between 2 and 32 and author_name = btrim(author_name) and author_name !~ '[[:cntrl:]<>]'),
	body text not null check (char_length(body) between 1 and 600 and body = btrim(body) and body !~ '[[:cntrl:]<>]'),
	status public.community_message_status not null default 'approved',
	created_at timestamptz not null default now(),
	expires_at timestamptz not null default (now() + interval '60 days')
);

create index if not exists idx_community_messages_thread_created on public.community_messages(thread_id, created_at);
create index if not exists idx_community_messages_author_created on public.community_messages(author_id, created_at desc);
create index if not exists idx_community_messages_expiry on public.community_messages(expires_at);

alter table public.community_threads enable row level security;
alter table public.community_messages enable row level security;
revoke all on public.community_threads, public.community_messages from anon, authenticated;

create or replace function public.list_community_messages(p_thread_key text, p_limit integer default 200)
returns table (id bigint, parent_id bigint, author_name text, body text, created_at timestamptz, status text)
language sql
security definer
set search_path = public
as $$
	select m.id, m.parent_id, m.author_name, m.body, m.created_at, m.status::text
	from public.community_messages m
	join public.community_threads t on t.id = m.thread_id
	where t.thread_key = btrim(coalesce(p_thread_key, ''))
		and m.expires_at > now()
		and m.status = 'approved'
	order by m.created_at asc
	limit greatest(1, least(coalesce(p_limit, 200), 200));
$$;

create or replace function public.submit_community_message(
	p_thread_key text,
	p_movie_slug text,
	p_movie_title text,
	p_parent_id bigint,
	p_author_name text,
	p_body text
)
returns table (id bigint, status text)
language plpgsql
security definer
set search_path = public
as $$
declare
	normalized_key text := btrim(coalesce(p_thread_key, ''));
	normalized_slug text := btrim(coalesce(p_movie_slug, ''));
	normalized_title text := btrim(coalesce(p_movie_title, ''));
	normalized_name text := btrim(coalesce(p_author_name, ''));
	normalized_body text := btrim(coalesce(p_body, ''));
	thread_record public.community_threads;
	new_message public.community_messages;
begin
	if auth.uid() is null then raise exception 'anonymous session is required'; end if;
	if normalized_key = 'cineposta-la-sala-principal' then
		normalized_slug := '';
		normalized_title := '';
	elsif normalized_slug !~ '^[a-z0-9-]+$' or normalized_key <> ('cineposta-pelicula-' || normalized_slug) or normalized_title = '' or char_length(normalized_title) > 180 then
		raise exception 'invalid movie discussion';
	end if;
	if char_length(normalized_name) not between 2 and 32 or normalized_name ~ '[[:cntrl:]<>]' then raise exception 'invalid author name'; end if;
	if char_length(normalized_body) not between 1 and 600 or normalized_body ~ '[[:cntrl:]<>]' then raise exception 'invalid message'; end if;
	if (select count(*) from public.community_messages where author_id = auth.uid() and created_at > now() - interval '10 minutes') >= 3 then
		raise exception 'rate limit exceeded';
	end if;

	insert into public.community_threads (thread_key, movie_slug, movie_title)
	values (normalized_key, nullif(normalized_slug, ''), nullif(normalized_title, ''))
	on conflict (thread_key) do update set updated_at = now()
	returning * into thread_record;
	if p_parent_id is not null and not exists (select 1 from public.community_messages as parent_message where parent_message.id = p_parent_id and parent_message.thread_id = thread_record.id and parent_message.expires_at > now()) then
		raise exception 'invalid parent message';
	end if;
	insert into public.community_messages (thread_id, parent_id, author_id, author_name, body)
	values (thread_record.id, p_parent_id, auth.uid(), normalized_name, normalized_body)
	returning * into new_message;

	-- Keep each discussion intentionally short-lived and bounded. A daily cron
	-- below removes expired rows; this cap prevents a long-running thread growing
	-- beyond 200 messages in between cleanups.
	delete from public.community_messages
	where public.community_messages.id in (
		select messages_to_remove.id from public.community_messages as messages_to_remove
		where thread_id = thread_record.id
		order by created_at desc
		offset 200
	);
	return query select new_message.id, new_message.status::text;
end;
$$;

revoke all on function public.list_community_messages(text, integer) from public;
revoke all on function public.submit_community_message(text, text, text, bigint, text, text) from public;
grant execute on function public.list_community_messages(text, integer) to anon, authenticated;
grant execute on function public.submit_community_message(text, text, text, bigint, text, text) to authenticated;

-- Optional but recommended: enable pg_cron in Database > Extensions, then run
-- this block to delete messages after their 60-day retention window. Anonymous
-- Auth identities are cleaned one day later too: Supabase does not clean them
-- automatically, and no community content needs to survive that identity.
do $$
begin
	if exists (select 1 from pg_extension where extname = 'pg_cron') then
		if exists (select 1 from cron.job where jobname = 'cineposta-purge-community-messages') then
			perform cron.unschedule((select jobid from cron.job where jobname = 'cineposta-purge-community-messages'));
		end if;
		perform cron.schedule('cineposta-purge-community-messages', '17 3 * * *', 'delete from public.community_messages where expires_at <= now();');
		if exists (select 1 from cron.job where jobname = 'cineposta-purge-community-anonymous-users') then
			perform cron.unschedule((select jobid from cron.job where jobname = 'cineposta-purge-community-anonymous-users'));
		end if;
		perform cron.schedule('cineposta-purge-community-anonymous-users', '31 3 * * *', 'delete from auth.users where is_anonymous is true and created_at < now() - interval ''61 days'' and not exists (select 1 from public.community_messages where author_id = auth.users.id);');
	end if;
end;
$$;
