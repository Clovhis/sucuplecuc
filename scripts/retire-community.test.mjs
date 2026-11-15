import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { PGlite } from '@electric-sql/pglite';

const retirement = await readFile(new URL('../supabase/migrations/20261115132413_retire_community.sql', import.meta.url), 'utf8');
const ratings = await readFile(new URL('../supabase/sql/movie_ratings.sql', import.meta.url), 'utf8');

async function fixture(withCron = true) {
  const db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth;
    create table auth.users(id uuid primary key);
    insert into auth.users values ('00000000-0000-0000-0000-000000000001');
    create type public.community_message_status as enum ('pending', 'approved', 'hidden');
    create table public.community_threads(id uuid primary key, thread_key text unique);
    create table public.community_messages(
      id bigint generated always as identity primary key,
      thread_id uuid references public.community_threads,
      parent_id bigint references public.community_messages,
      author_id uuid references auth.users,
      status public.community_message_status default 'approved', body text);
    create table public.community_message_votes(message_id bigint references public.community_messages, author_id uuid references auth.users);
    create table public.community_identities(author_id uuid references auth.users, author_name text);
    insert into public.community_threads values ('00000000-0000-0000-0000-000000000002', 'sala');
    insert into public.community_messages(thread_id, author_id, body) values
      ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Mensaje de prueba');
    insert into public.community_message_votes values (1, '00000000-0000-0000-0000-000000000001');
    insert into public.community_identities values ('00000000-0000-0000-0000-000000000001', 'Prueba');
    create function public.get_community_nickname() returns text language sql as 'select author_name from public.community_identities limit 1';
    create function public.list_community_messages(text, integer) returns setof public.community_messages language sql as 'select * from public.community_messages';
    create function public.list_community_discussions(integer) returns setof public.community_threads language sql as 'select * from public.community_threads';
    create function public.change_community_nickname(text) returns void language sql as 'select';
    create function public.submit_community_message(text,text,text,bigint,text,text) returns void language sql as 'select';
    create function public.submit_community_message(text,text,text,bigint,text,text,boolean) returns void language sql as 'select';
    create function public.update_community_message(bigint,text) returns void language sql as 'select';
    create function public.update_community_message(bigint,text,boolean) returns void language sql as 'select';
    create function public.delete_community_message(bigint) returns void language sql as 'select';
    create function public.vote_community_message(bigint,smallint) returns void language sql as 'select';
    create table public.trivia_players(id uuid references auth.users, nickname text);
    insert into public.trivia_players values ('00000000-0000-0000-0000-000000000001', 'Jugador');
    create schema cinecriptico_private;
    create table cinecriptico_private.games(id integer, answer text);
    insert into cinecriptico_private.games values (1, 'Privada');
    create table public.actor_high_scores(id integer, score integer);
    insert into public.actor_high_scores values (1, 1000);
    create table public.social_media_assets(id integer, url text);
    insert into public.social_media_assets values (1, 'https://example.test/photo.webp');
    create table public.social_media_asset_usage(id integer, post_id text);
    insert into public.social_media_asset_usage values (1, 'published-post');
  `);
  await db.exec(ratings.replace('create extension if not exists pgcrypto;', ''));
  await db.exec("select public.submit_movie_rating_v2('akira-1988', 'preserved-visitor-001', 8);");
  if (withCron) await db.exec(`
    create schema cron;
    create table cron.job(jobid bigint primary key, jobname text);
    insert into cron.job values (1, 'cineposta-purge-community-messages'),
      (2, 'cineposta-purge-community-anonymous-users'), (3, 'unrelated-job');
    create function cron.unschedule(bigint) returns boolean language plpgsql as $$
      begin delete from cron.job where jobid = $1; return found; end; $$;
  `);
  return db;
}

async function sharedSnapshot(db) {
  const tables = ['auth.users', 'public.movie_ratings', 'public.trivia_players',
    'cinecriptico_private.games', 'public.actor_high_scores', 'public.social_media_assets', 'public.social_media_asset_usage'];
  const rows = [];
  for (const table of tables) rows.push((await db.query(`select * from ${table}`)).rows);
  return rows;
}

for (const withCron of [true, false]) {
  test(`retirement removes the forum, preserves shared data and is repeatable (cron=${withCron})`, async () => {
    const db = await fixture(withCron);
    try {
      const before = await sharedSnapshot(db);
      for (let attempt = 0; attempt < 2; attempt++) {
        await db.exec(retirement);
        assert.deepEqual(await sharedSnapshot(db), before);
        assert.equal((await db.query("select count(*)::int as count from pg_class where relnamespace = 'public'::regnamespace and relname like '%community%'")).rows[0].count, 0);
        assert.equal((await db.query("select count(*)::int as count from pg_proc where pronamespace = 'public'::regnamespace and proname like '%community%'")).rows[0].count, 0);
        assert.equal((await db.query("select to_regtype('public.community_message_status') as type")).rows[0].type, null);
        if (withCron) assert.deepEqual((await db.query('select * from cron.job')).rows, [{ jobid: 3, jobname: 'unrelated-job' }]);
      }
      await db.exec('set role anon;');
      assert.equal((await db.query("select * from public.get_movie_rating_v2('akira-1988', 'preserved-visitor-001')")).rows[0].rating, 8);
      await db.exec("select public.submit_movie_rating_v2('akira-1988', 'preserved-visitor-001', 10);");
      assert.equal(Number((await db.query("select avg_rating from public.movie_rating_stats_v2 where movie_slug = 'akira-1988'")).rows[0].avg_rating), 10);
      await assert.rejects(db.query('select * from public.movie_ratings'), /permission denied/);
    } finally { await db.close(); }
  });
}

test('unknown external dependencies abort the whole retirement, including cron removals', async () => {
  const db = await fixture();
  try {
    await db.exec('create view public.external_forum_dependency as select * from public.community_threads;');
    const before = await sharedSnapshot(db);
    await assert.rejects(db.exec(retirement), /depend/);
    await db.exec('rollback;');
    assert.deepEqual(await sharedSnapshot(db), before);
    assert.equal((await db.query('select count(*)::int as count from cron.job')).rows[0].count, 3);
    assert.equal((await db.query('select count(*)::int as count from public.community_messages')).rows[0].count, 1);
    assert.equal((await db.query('select public.get_community_nickname() as nickname')).rows[0].nickname, 'Prueba');
  } finally { await db.close(); }
});
