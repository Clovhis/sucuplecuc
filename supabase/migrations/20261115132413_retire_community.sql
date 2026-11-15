-- Apply only after the site without the forum has been deployed.
-- This retirement deletes forum data. It deliberately preserves auth.users,
-- anonymous sign-in, movie ratings, games, social media and pg_cron itself.
begin;

do $retire_jobs$
declare
  forum_job record;
begin
  if to_regclass('cron.job') is not null then
    for forum_job in
      select jobid from cron.job where jobname in (
        'cineposta-purge-community-messages',
        'cineposta-purge-community-anonymous-users'
      )
    loop
      perform cron.unschedule(forum_job.jobid);
    end loop;
  end if;
end;
$retire_jobs$;

-- Include both deployed and historical overloads. RESTRICT is intentional:
-- an unexpected external dependency must abort the entire transaction.
drop function if exists public.get_community_nickname() restrict;
drop function if exists public.change_community_nickname(text) restrict;
drop function if exists public.list_community_discussions(integer) restrict;
drop function if exists public.list_community_messages(text, integer) restrict;
drop function if exists public.submit_community_message(text, text, text, bigint, text, text) restrict;
drop function if exists public.submit_community_message(text, text, text, bigint, text, text, boolean) restrict;
drop function if exists public.update_community_message(bigint, text) restrict;
drop function if exists public.update_community_message(bigint, text, boolean) restrict;
drop function if exists public.delete_community_message(bigint) restrict;
drop function if exists public.vote_community_message(bigint, smallint) restrict;

drop table if exists public.community_message_votes, public.community_messages,
  public.community_threads, public.community_identities restrict;
drop type if exists public.community_message_status restrict;

commit;
