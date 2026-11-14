-- Dedicated editorial library. Existing application tables/auth remain untouched.
create table public.social_media_assets (
 id text primary key,
 bucket_id text not null default 'cineposta-social' check(bucket_id='cineposta-social'),
 object_id uuid not null unique references storage.objects(id) on delete restrict,
 object_path text not null unique check(object_path ~ '^(movies|people|events)/[a-z0-9-]+/[a-f0-9]{64}\.webp$'),
 sha256 text not null unique check(sha256 ~ '^[a-f0-9]{64}$'),
 status text not null default 'pending' check(status in ('pending','approved','restricted')),
 kind text not null check(kind in ('portrait','event-photo','still','backdrop')),
 width integer not null check(width>0),height integer not null check(height>0),
 bytes bigint not null check(bytes between 1 and 2097152),
 expires_on date,embargo_until date,
 metadata jsonb not null check(jsonb_typeof(metadata)='object'),
 evidence_raw text,
 evidence jsonb not null check(jsonb_typeof(evidence)='object'),
 created_at timestamptz not null default now(),
 check(status <> 'approved' or (metadata->>'credit' is not null and metadata->>'licenseUrl' is not null and metadata->'permission'->>'organicInstagram'='true' and metadata->'permission'->>'publicHosting'='true'))
);
alter table public.social_media_assets enable row level security;
revoke all on public.social_media_assets from anon,authenticated;
grant select on public.social_media_assets to anon,authenticated;
grant all on public.social_media_assets to service_role;
create policy social_assets_approved_read on public.social_media_assets for select to anon,authenticated using (
 status='approved'
 and (expires_on is null or expires_on >= (now() at time zone 'America/Argentina/Buenos_Aires')::date)
 and (embargo_until is null or embargo_until <= (now() at time zone 'America/Argentina/Buenos_Aires')::date)
 and (metadata->'permission'->'territories' ?| array['AR','worldwide'])
);
create policy cineposta_social_approved_objects on storage.objects for select to anon,authenticated using (
 bucket_id='cineposta-social' and exists(select 1 from public.social_media_assets a where a.object_id=storage.objects.id and a.object_path=storage.objects.name)
);
comment on table public.social_media_assets is 'Canonical licensed editorial photographs; social channels share assets, not publication state. Administrative writes only. Posters remain in GitHub.';

create table public.social_media_asset_usage(asset_id text references public.social_media_assets(id) on delete restrict, channel text not null check(channel in ('instagram','x')), post_id text not null, used_at timestamptz not null, primary key(asset_id,channel,post_id));
alter table public.social_media_asset_usage enable row level security;
revoke all on public.social_media_asset_usage from anon,authenticated;
grant all on public.social_media_asset_usage to service_role;

alter table public.social_media_assets add constraint social_assets_required_metadata check (
 (metadata->>'id'=id and metadata->>'sha256'=sha256 and metadata->>'kind'=kind and metadata->>'width'=width::text and metadata->>'height'=height::text) is true
);
alter table public.social_media_assets add constraint social_assets_approval_scope check (
 status <> 'approved' or (
  evidence_raw is not null and metadata->>'evidenceSha256' ~ '^[a-f0-9]{64}$'
  and length(metadata->>'credit')>0 and metadata->>'licenseUrl' like 'https://%'
  and metadata->'permission'->>'organicInstagram'='true'
  and metadata->'permission'->>'publicHosting'='true'
  and metadata->'permission'->>'basis' in ('open-license','press-permission')
 ) is true
);

alter table public.social_media_assets add constraint social_assets_metadata_consistent check (
 metadata->>'id'=id and metadata->>'sha256'=sha256 and metadata->>'kind'=kind
 and metadata->>'width'=width::text and metadata->>'height'=height::text
 and (metadata->'permission'->>'expiresAt') is not distinct from expires_on::text
 and (metadata->>'embargoUntil') is not distinct from embargo_until::text
);
