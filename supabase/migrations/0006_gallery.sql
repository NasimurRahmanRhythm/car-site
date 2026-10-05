-- Showroom gallery: photos, videos and YouTube links that belong to the gallery
-- page itself rather than to a vehicle.
--
-- The public gallery already draws from `car_images`; this table sits in front
-- of that pool so the showroom can put up anything — an event, a delivery, a
-- walkaround video — without inventing a car to hang it off.
--
-- Run this in the Supabase SQL editor — it also creates the public `gallery`
-- storage bucket. It is safe to re-run, and it upgrades a `gallery_items` table
-- made by the first version of this file (`media_type` / `caption` columns).

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('image', 'video', 'youtube')),
  -- The public file URL for an image or video, the watch URL for YouTube.
  url text not null,
  storage_path text,
  -- A poster frame for videos, the YouTube thumbnail for links.
  thumbnail_url text,
  thumbnail_path text,
  youtube_id text,
  title text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Bring a table from the first version of this file up to the layout above.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'gallery_items' and column_name = 'media_type'
  ) then
    alter table public.gallery_items rename column media_type to kind;
    alter table public.gallery_items alter column kind drop default;
    alter table public.gallery_items drop constraint if exists gallery_items_media_type_check;
    alter table public.gallery_items
      add constraint gallery_items_kind_check check (kind in ('image', 'video', 'youtube'));
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'gallery_items' and column_name = 'caption'
  ) then
    alter table public.gallery_items rename column caption to title;
  end if;
end $$;

-- A YouTube link has no file behind it.
alter table public.gallery_items alter column storage_path drop not null;
alter table public.gallery_items
  add column if not exists thumbnail_url text,
  add column if not exists thumbnail_path text,
  add column if not exists youtube_id text;

create index if not exists gallery_items_created_at_idx
  on public.gallery_items (created_at desc);

create index if not exists gallery_items_sort_idx
  on public.gallery_items (sort_order, created_at desc);

alter table public.gallery_items enable row level security;

drop policy if exists "gallery items are publicly readable" on public.gallery_items;
create policy "gallery items are publicly readable"
  on public.gallery_items for select
  using (true);

drop policy if exists "admins manage gallery items" on public.gallery_items;
create policy "admins manage gallery items"
  on public.gallery_items for all
  using (public.is_admin())
  with check (public.is_admin());

-- Files go straight from the admin's browser to this bucket (after being
-- compressed there), so the 50 MB cap is enforced here as well as in the UI.
-- 50 MB is the Free plan's per-file maximum; on a paid plan it can be raised
-- here, in MAX_VIDEO_BYTES (src/lib/media-compress.ts) and in Storage → Settings.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gallery', 'gallery', true, 52428800, array['image/*', 'video/*'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "gallery files are publicly readable" on storage.objects;
create policy "gallery files are publicly readable"
  on storage.objects for select
  using (bucket_id = 'gallery');

drop policy if exists "admins manage gallery files" on storage.objects;
create policy "admins manage gallery files"
  on storage.objects for all
  using (bucket_id = 'gallery' and public.is_admin())
  with check (bucket_id = 'gallery' and public.is_admin());

-- Storage policies for the older `gallery-media` bucket: public read, admin
-- write. New uploads go to `gallery`; these keep files already there reachable
-- and deletable.
drop policy if exists "gallery media are publicly readable" on storage.objects;
create policy "gallery media are publicly readable"
  on storage.objects for select
  using (bucket_id = 'gallery-media');

drop policy if exists "admins manage gallery media" on storage.objects;
create policy "admins manage gallery media"
  on storage.objects for all
  using (bucket_id = 'gallery-media' and public.is_admin())
  with check (bucket_id = 'gallery-media' and public.is_admin());
