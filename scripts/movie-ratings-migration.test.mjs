import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { PGlite } from '@electric-sql/pglite';

const db = new PGlite();
const migration = await readFile(new URL('../supabase/sql/movie_ratings_1_to_10.sql', import.meta.url), 'utf8');
const install = await readFile(new URL('../supabase/sql/movie_ratings.sql', import.meta.url), 'utf8');
assert.ok(install.endsWith(migration), 'Fresh installation and incremental migration must expose the same API');
try {
	await db.exec('create role anon; create role authenticated;');
	// PGlite has gen_random_uuid built in; Supabase installs pgcrypto separately.
	const baseline = execFileSync('git', ['show', 'origin/main:supabase/sql/movie_ratings.sql'], { encoding: 'utf8' });
	await db.exec(baseline.replace('create extension if not exists pgcrypto;', ''));
	await db.exec(`insert into public.movie_ratings (movie_slug, visitor_token, rating, updated_at) values
		('akira-1988', 'visitor-legacy-0001', 4, '2026-10-17'),
		('seven-samurai-1954', 'visitor-samurai-01', 5, '2026-10-17'),
		('los-siete-samurais-1954', 'visitor-samurai-01', 3, '2026-10-16'),
		('paprika-detective-de-los-suenos-2006', 'visitor-paprika-01', 4, '2026-10-17');`);
	await db.exec(migration);
	await db.exec(migration); // A retry must not double existing votes.
	const one = async (sql) => (await db.query(sql)).rows[0];
	assert.equal((await one("select * from public.get_movie_rating_v2('akira-1988', 'visitor-legacy-0001')")).rating, 8);
	assert.equal((await one("select * from public.get_movie_rating('akira-1988', 'visitor-legacy-0001')")).rating, 4);
	assert.equal((await one("select count(*)::int as count from public.movie_ratings where movie_slug = 'los-siete-samurais-1954'")).count, 1);
	assert.equal((await one("select * from public.get_movie_rating_v2('seven-samurai-1954', 'visitor-samurai-01')")).rating, 10);
	assert.equal((await one("select * from public.get_movie_rating_v2('paprika-2006', 'visitor-paprika-01')")).rating, 8);
	await db.exec('set role anon;');
	for (const value of [1, 7, 10]) {
		await db.query("select public.submit_movie_rating_v2('akira-1988', 'visitor-new-00001', $1)", [value]);
		assert.equal((await one("select * from public.get_movie_rating_v2('akira-1988', 'visitor-new-00001')")).rating, value);
	}
	for (const value of [0, 11, null]) await assert.rejects(db.query("select public.submit_movie_rating_v2('akira-1988', 'visitor-new-00001', $1)", [value]), /between 1 and 10/);
	await assert.rejects(db.query("select public.submit_movie_rating_v2('akira-1988', 'short', 8)"), /too short/);
	await assert.rejects(db.query('select * from public.movie_ratings'), /permission denied/);
	assert.equal(Number((await one("select avg_rating from public.movie_rating_stats_v2 where movie_slug = 'akira-1988'")).avg_rating), 9);
	assert.equal(Number((await one("select avg_rating from public.movie_rating_stats where movie_slug = 'akira-1988'")).avg_rating), 4.5);
	await db.exec("select public.submit_movie_rating('akira-1988', 'visitor-new-00001', 3);");
	assert.equal((await one("select * from public.get_movie_rating_v2('akira-1988', 'visitor-new-00001')")).rating, 6, 'Cached clients must keep the legacy scale on updates');
	await db.exec('reset role;');
	await db.exec(install.replace('create extension if not exists pgcrypto;', ''));
	assert.equal((await one("select * from public.get_movie_rating_v2('akira-1988', 'visitor-legacy-0001')")).rating, 8);

	// Minimal production-shaped forum tables, including the thread identity check.
	await db.exec(`create table public.community_threads (
		id uuid primary key default gen_random_uuid(), thread_key text not null unique,
		movie_slug text unique, movie_title text,
		check (thread_key = 'cineposta-pelicula-' || movie_slug));
		create table public.community_messages (id int primary key, thread_id uuid references public.community_threads(id) on delete cascade, parent_id int references public.community_messages(id));
		insert into public.community_threads(thread_key, movie_slug) values
		('cineposta-pelicula-seven-samurai-1954', 'seven-samurai-1954'),
		('cineposta-pelicula-los-siete-samurais-1954', 'los-siete-samurais-1954'),
		('cineposta-pelicula-paprika-detective-de-los-suenos-2006', 'paprika-detective-de-los-suenos-2006');
		insert into public.community_messages values (1, (select id from public.community_threads where movie_slug = 'seven-samurai-1954'), null),
		(2, (select id from public.community_threads where movie_slug = 'seven-samurai-1954'), 1),
		(3, (select id from public.community_threads where movie_slug = 'paprika-detective-de-los-suenos-2006'), null);`);
	const merge = await readFile(new URL('../supabase/sql/merge_duplicate_movie_threads.sql', import.meta.url), 'utf8');
	await db.exec(merge);
	await db.exec(merge);
	assert.equal((await one('select count(*)::int as count from public.community_messages')).count, 3);
	assert.equal((await one('select parent_id from public.community_messages where id = 2')).parent_id, 1);
	assert.equal((await one('select count(*)::int as count from public.community_threads')).count, 2);
	assert.equal((await one("select count(*)::int as count from public.community_messages m join public.community_threads t on t.id=m.thread_id where t.movie_slug='los-siete-samurais-1954'")).count, 2);
	console.log('PostgreSQL: legacy/new votes, bounds, anon permissions, retries, alias collisions and forum preservation verified.');
} finally { await db.close(); }
