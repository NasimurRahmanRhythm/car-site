-- News posts. Run this in the Supabase SQL editor, then create a PUBLIC
-- storage bucket named `news-images` (Storage → New bucket → tick "Public
-- bucket") — the admin panel uploads cover images there.

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  image_url text,
  image_path text,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists news_published_at_idx
  on public.news (published_at desc);

-- Mirrors the trigger the other tables use to keep `updated_at` honest.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists news_touch_updated_at on public.news;
create trigger news_touch_updated_at
  before update on public.news
  for each row execute function public.touch_updated_at();

alter table public.news enable row level security;

drop policy if exists "news are publicly readable" on public.news;
create policy "news are publicly readable"
  on public.news for select
  using (true);

drop policy if exists "admins manage news" on public.news;
create policy "admins manage news"
  on public.news for all
  using (public.is_admin())
  with check (public.is_admin());

-- Storage policies for the `news-images` bucket: public read, admin write.
drop policy if exists "news images are publicly readable" on storage.objects;
create policy "news images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'news-images');

drop policy if exists "admins manage news images" on storage.objects;
create policy "admins manage news images"
  on storage.objects for all
  using (bucket_id = 'news-images' and public.is_admin())
  with check (bucket_id = 'news-images' and public.is_admin());
