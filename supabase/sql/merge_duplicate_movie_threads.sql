-- Apply once before deploying the consolidated catalog; safe to rerun.
-- Message IDs, authors, parent links and reactions remain intact.
begin;
lock table public.community_threads, public.community_messages in access exclusive mode;
do $$
declare
	pair record;
	old_id uuid;
	canonical_id uuid;
begin
	for pair in select * from (values
		('seven-samurai-1954', 'los-siete-samurais-1954', 'Los siete samuráis'),
		('paprika-detective-de-los-suenos-2006', 'paprika-2006', 'Paprika, detective de los sueños')
	) as aliases(old_slug, canonical_slug, title)
	loop
		select id into old_id from public.community_threads where movie_slug = pair.old_slug;
		select id into canonical_id from public.community_threads where movie_slug = pair.canonical_slug;
		if old_id is not null then
			if canonical_id is null then
				update public.community_threads set movie_slug = pair.canonical_slug,
					thread_key = 'cineposta-pelicula-' || pair.canonical_slug, movie_title = pair.title
				where id = old_id;
			else
				update public.community_messages set thread_id = canonical_id where thread_id = old_id;
				delete from public.community_threads where id = old_id;
			end if;
		end if;
		update public.community_threads set movie_title = pair.title where movie_slug = pair.canonical_slug;
	end loop;
end;
$$;
commit;
