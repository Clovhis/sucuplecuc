-- Source/package permissions are reviewed once, and can be revoked centrally.
create table public.social_media_grants (
 id text primary key check(id ~ '^[a-z0-9-]+$'),
 status text not null check(status in ('approved','pending','restricted')),
 issuer text not null,
 expires_on date,
 metadata jsonb not null,
 evidence_raw text not null,
 evidence_sha256 text not null check(evidence_sha256 ~ '^[a-f0-9]{64}$'),
 created_at timestamptz not null default now(),
 check ((metadata->>'id'=id and metadata->>'status'=status and metadata->>'issuer'=issuer and metadata->>'evidenceSha256'=evidence_sha256) is true),
 check ((metadata->'permission'->>'expiresAt') is not distinct from expires_on::text)
);
alter table public.social_media_grants enable row level security;
revoke all on public.social_media_grants from anon,authenticated;
grant select on public.social_media_grants to anon,authenticated;
grant all on public.social_media_grants to service_role;
create policy social_grants_approved_read on public.social_media_grants for select to anon,authenticated using (
 status='approved' and metadata->'permission'->>'publicHosting'='true'
 and (metadata->'permission'->'territories' ?| array['AR','worldwide'])
 and (expires_on is null or expires_on >= (now() at time zone 'America/Argentina/Buenos_Aires')::date)
);
alter table public.social_media_assets add column grant_id text references public.social_media_grants(id) on delete restrict;
create index social_media_assets_grant_idx on public.social_media_assets(grant_id) where grant_id is not null;
alter table public.social_media_assets add constraint social_asset_grant_matches_metadata check ((metadata->>'grantId') is not distinct from grant_id);
drop policy social_assets_approved_read on public.social_media_assets;
create policy social_assets_approved_read on public.social_media_assets for select to anon,authenticated using (
 status='approved' and metadata->>'status'='approved'
 and (expires_on is null or expires_on >= (now() at time zone 'America/Argentina/Buenos_Aires')::date)
 and (embargo_until is null or embargo_until <= (now() at time zone 'America/Argentina/Buenos_Aires')::date)
 and (metadata->'permission'->'territories' ?| array['AR','worldwide'])
 and (grant_id is null or exists(select 1 from public.social_media_grants g where g.id=grant_id))
);
