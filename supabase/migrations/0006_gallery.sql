-- Gallery media: photos and clips that belong to the gallery page itself
-- rather than to a vehicle.
--
-- The public gallery already draws from `car_images`; this table sits in front
-- of that pool so the showroom can put up anything — an event, a delivery, a
-- walkaround video — without inventing a car to hang it off.
--
-- Run this in the Supabase SQL editor, then create a PUBLIC storage bucket
-- named `gallery-media` (Storage → New bucket → tick "Public bucket").

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  media_type text not null default 'image'
    check (media_type in ('image', 'video')),
  url text not null,
  storage_path text not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

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

-- Storage policies for the `gallery-media` bucket: public read, admin write.
drop policy if exists "gallery media are publicly readable" on storage.objects;
create policy "gallery media are publicly readable"
  on storage.objects for select
  using (bucket_id = 'gallery-media');

drop policy if exists "admins manage gallery media" on storage.objects;
create policy "admins manage gallery media"
  on storage.objects for all
  using (bucket_id = 'gallery-media' and public.is_admin())
  with check (bucket_id = 'gallery-media' and public.is_admin());
