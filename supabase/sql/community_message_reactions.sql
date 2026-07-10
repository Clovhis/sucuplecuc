-- Incremental migration for an already-provisioned Cine Posta community.
-- Adds spoiler metadata and per-identity reactions without changing ownership actions.

alter table public.community_messages
	add column if not exists is_spoiler boolean not null default false;

create table if not exists public.community_message_votes (
	message_id bigint not null references public.community_messages(id) on delete cascade,
	author_id uuid not null references auth.users(id) on delete cascade,
	vote smallint not null check (vote in (-1, 1)),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	primary key (message_id, author_id)
);

create index if not exists idx_community_message_votes_message
	on public.community_message_votes(message_id);

alter table public.community_message_votes enable row level security;
revoke all on public.community_message_votes from anon, authenticated;

drop function if exists public.list_community_discussions(integer);
create function public.list_community_discussions(p_limit integer default 24)
returns table (movie_slug text, movie_title text, last_activity timestamptz, message_count bigint, last_author_name text)
language sql
security definer
set search_path = public
as $$
	select t.movie_slug, t.movie_title, max(m.created_at), count(m.id), (array_agg(m.author_name order by m.created_at desc))[1]
	from public.community_threads as t
	join public.community_messages as m on m.thread_id = t.id
	where t.movie_slug is not null
		and m.status = 'approved'
		and m.expires_at > now()
	group by t.id, t.movie_slug, t.movie_title
	order by max(m.created_at) desc
	limit greatest(1, least(coalesce(p_limit, 24), 100));
$$;

drop function if exists public.list_community_messages(text, integer);
create function public.list_community_messages(p_thread_key text, p_limit integer default 200)
returns table (id bigint, parent_id bigint, author_name text, body text, created_at timestamptz, edited_at timestamptz, status text, is_mine boolean, is_spoiler boolean, upvotes integer, downvotes integer, my_vote smallint)
language sql
security definer
set search_path = public
as $$
	select m.id, m.parent_id, m.author_name, m.body, m.created_at, m.edited_at, m.status::text, coalesce(m.author_id = auth.uid(), false), m.is_spoiler,
		count(v.author_id) filter (where v.vote = 1)::integer, count(v.author_id) filter (where v.vote = -1)::integer,
		coalesce(max(v.vote) filter (where v.author_id = auth.uid()), 0)::smallint
	from public.community_messages m
	join public.community_threads t on t.id = m.thread_id
	left join public.community_message_votes v on v.message_id = m.id
	where t.thread_key = btrim(coalesce(p_thread_key, ''))
		and m.expires_at > now()
		and m.status = 'approved'
	group by m.id
	order by m.created_at asc
	limit greatest(1, least(coalesce(p_limit, 200), 200));
$$;

drop function if exists public.submit_community_message(text, text, text, bigint, text, text);
create function public.submit_community_message(
	p_thread_key text,
	p_movie_slug text,
	p_movie_title text,
	p_parent_id bigint,
	p_author_name text,
	p_body text,
	p_is_spoiler boolean default false
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
	perform pg_advisory_xact_lock(hashtext(auth.uid()::text));
	if normalized_key = 'cineposta-la-sala-principal' then
		normalized_slug := '';
		normalized_title := '';
	elsif normalized_slug !~ '^[a-z0-9-]+$' or normalized_key <> ('cineposta-pelicula-' || normalized_slug) or normalized_title = '' or char_length(normalized_title) > 180 then
		raise exception 'invalid movie discussion';
	end if;
	if char_length(normalized_name) not between 2 and 32 or normalized_name ~ '[[:cntrl:]<>]' then raise exception 'invalid author name'; end if;
	if char_length(normalized_body) not between 1 and 300 or normalized_body ~ '[[:cntrl:]<>]' then raise exception 'invalid message'; end if;
	begin
		insert into public.community_identities (author_id, author_name)
		values (auth.uid(), normalized_name)
		on conflict (author_id) do nothing;
	exception when unique_violation then
		raise exception 'nickname unavailable';
	end;
	select identity_record.author_name into normalized_name from public.community_identities as identity_record where identity_record.author_id = auth.uid();
	if (select count(*) from public.community_messages where author_id = auth.uid() and created_at > now() - interval '10 minutes') >= 3 then raise exception 'rate limit exceeded'; end if;
	insert into public.community_threads (thread_key, movie_slug, movie_title)
	values (normalized_key, nullif(normalized_slug, ''), nullif(normalized_title, ''))
	on conflict (thread_key) do update set updated_at = now()
	returning * into thread_record;
	if p_parent_id is not null and not exists (select 1 from public.community_messages as parent_message where parent_message.id = p_parent_id and parent_message.thread_id = thread_record.id and parent_message.expires_at > now()) then raise exception 'invalid parent message'; end if;
	insert into public.community_messages (thread_id, parent_id, author_id, author_name, body, is_spoiler)
	values (thread_record.id, p_parent_id, auth.uid(), normalized_name, normalized_body, coalesce(p_is_spoiler, false))
	returning * into new_message;
	delete from public.community_messages where public.community_messages.id in (select messages_to_remove.id from public.community_messages as messages_to_remove where thread_id = thread_record.id order by created_at desc offset 200);
	return query select new_message.id, new_message.status::text;
end;
$$;

create or replace function public.vote_community_message(p_message_id bigint, p_vote smallint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
	if auth.uid() is null then raise exception 'anonymous session is required'; end if;
	if p_vote not in (-1, 0, 1) then raise exception 'invalid vote'; end if;
	if not exists (select 1 from public.community_messages where id = p_message_id and status = 'approved' and expires_at > now()) then raise exception 'message not found'; end if;
	if p_vote = 0 then
		delete from public.community_message_votes where message_id = p_message_id and author_id = auth.uid();
		return;
	end if;
	insert into public.community_message_votes (message_id, author_id, vote)
	values (p_message_id, auth.uid(), p_vote)
	on conflict (message_id, author_id) do update set vote = excluded.vote, updated_at = now();
end;
$$;

revoke all on function public.list_community_discussions(integer) from public;
revoke all on function public.list_community_messages(text, integer) from public;
revoke all on function public.submit_community_message(text, text, text, bigint, text, text, boolean) from public;
revoke all on function public.vote_community_message(bigint, smallint) from public;
grant execute on function public.list_community_discussions(integer) to anon, authenticated;
grant execute on function public.list_community_messages(text, integer) to anon, authenticated;
grant execute on function public.submit_community_message(text, text, text, bigint, text, text, boolean) to authenticated;
grant execute on function public.vote_community_message(bigint, smallint) to authenticated;
