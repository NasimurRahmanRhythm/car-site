-- About Us content, editable from the admin panel.
--
-- Until now the copy and the showroom photograph lived in `src/data/about.ts`,
-- which meant a code change to correct a sentence. This table takes over; the
-- file stays as the fallback the site falls back to before the first save, so
-- the page is never blank.
--
-- Exactly one row is ever wanted, which the primary key enforces outright — a
-- second row cannot be inserted, so no query has to guess which one is live.
--
-- Run this in the Supabase SQL editor, then create a PUBLIC storage bucket
-- named `about-images` (Storage → New bucket → tick "Public bucket").

create table if not exists public.about_content (
  id integer primary key default 1 check (id = 1),
  eyebrow text not null default '',
  heading text not null default '',
  intro text not null default '',
  -- One paragraph per element, in the order they are shown.
  paragraphs text[] not null default '{}',
  -- [{ "value": "500+", "label": "Vehicles Delivered" }, …]
  stats jsonb not null default '[]'::jsonb,
  image_url text,
  image_path text,
  image_alt text,
  -- next/image needs the intrinsic size to reserve space before the file loads.
  image_width integer,
  image_height integer,
  updated_at timestamptz not null default now()
);

drop trigger if exists about_content_touch_updated_at on public.about_content;
create trigger about_content_touch_updated_at
  before update on public.about_content
  for each row execute function public.touch_updated_at();

alter table public.about_content enable row level security;

drop policy if exists "about content is publicly readable" on public.about_content;
create policy "about content is publicly readable"
  on public.about_content for select
  using (true);

drop policy if exists "admins manage about content" on public.about_content;
create policy "admins manage about content"
  on public.about_content for all
  using (public.is_admin())
  with check (public.is_admin());

-- Storage policies for the `about-images` bucket: public read, admin write.
drop policy if exists "about images are publicly readable" on storage.objects;
create policy "about images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'about-images');

drop policy if exists "admins manage about images" on storage.objects;
create policy "admins manage about images"
  on storage.objects for all
  using (bucket_id = 'about-images' and public.is_admin())
  with check (bucket_id = 'about-images' and public.is_admin());
