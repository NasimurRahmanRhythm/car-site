-- Showroom gallery: photos, videos and YouTube links managed from the admin
-- panel and shown on /gallery alongside the vehicle photos. Run this in the
-- Supabase SQL editor — it also creates the public `gallery` storage bucket.

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

create index if not exists gallery_items_created_at_idx
  on public.gallery_items (created_at desc);

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
