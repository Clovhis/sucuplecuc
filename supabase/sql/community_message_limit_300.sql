-- Enforce the same 300-character limit in the existing production database.

alter table public.community_messages
	drop constraint if exists community_messages_body_check;

alter table public.community_messages
	add constraint community_messages_body_check
	check (char_length(body) between 1 and 300 and body = btrim(body) and body !~ '[[:cntrl:]<>]');
