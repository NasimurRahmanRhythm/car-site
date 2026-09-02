-- Showroom 360° virtual tour: several equirectangular panoramas linked by
-- clickable hotspots, the same shape vipmotors.ae ships.
--
-- Run this in the Supabase SQL editor, then create a PUBLIC storage bucket
-- named `showroom-360` (Storage → New bucket → tick "Public bucket").
--
-- NOTE: the drop below removes an earlier single-panorama table. It only
-- matters if you already ran a previous version of this file; the panorama it
-- held would need re-uploading as a scene.
drop table if exists public.showroom_360;

-- ─────────────────────────────────────────────
-- tour_scenes: one panorama per spot in the showroom
-- ─────────────────────────────────────────────
create table if not exists public.tour_scenes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  storage_path text not null,
  width integer not null,
  height integer not null,
  sort_order integer not null default 0,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists tour_scenes_sort_idx on public.tour_scenes (sort_order);

-- Exactly one scene can be the entry point. A partial unique index is what
-- makes a second "default" fail loudly instead of leaving the tour with two
-- possible starting rooms.
create unique index if not exists tour_scenes_single_default_idx
  on public.tour_scenes (is_default)
  where is_default;

-- ─────────────────────────────────────────────
-- tour_hotspots: a marker in one scene that jumps to another
-- pitch/yaw are degrees, matching how the viewer reports a clicked point:
-- yaw 0 is the centre of the panorama, pitch is positive upward.
-- ─────────────────────────────────────────────
create table if not exists public.tour_hotspots (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid not null references public.tour_scenes (id) on delete cascade,
  target_scene_id uuid not null references public.tour_scenes (id) on delete cascade,
  label text,
  pitch double precision not null,
  yaw double precision not null,
  created_at timestamptz not null default now(),
  constraint tour_hotspots_not_self check (scene_id <> target_scene_id)
);

create index if not exists tour_hotspots_scene_idx on public.tour_hotspots (scene_id);

-- ─────────────────────────────────────────────
-- Row level security: public read, admin write
-- ─────────────────────────────────────────────
alter table public.tour_scenes enable row level security;
alter table public.tour_hotspots enable row level security;

drop policy if exists "tour scenes are publicly readable" on public.tour_scenes;
create policy "tour scenes are publicly readable"
  on public.tour_scenes for select
  using (true);

drop policy if exists "admins manage tour scenes" on public.tour_scenes;
create policy "admins manage tour scenes"
  on public.tour_scenes for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "tour hotspots are publicly readable" on public.tour_hotspots;
create policy "tour hotspots are publicly readable"
  on public.tour_hotspots for select
  using (true);

drop policy if exists "admins manage tour hotspots" on public.tour_hotspots;
create policy "admins manage tour hotspots"
  on public.tour_hotspots for all
  using (public.is_admin())
  with check (public.is_admin());

-- Storage policies for the `showroom-360` bucket: public read, admin write.
drop policy if exists "showroom 360 images are publicly readable" on storage.objects;
create policy "showroom 360 images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'showroom-360');

drop policy if exists "admins manage showroom 360 images" on storage.objects;
create policy "admins manage showroom 360 images"
  on storage.objects for all
  using (bucket_id = 'showroom-360' and public.is_admin())
  with check (bucket_id = 'showroom-360' and public.is_admin());
