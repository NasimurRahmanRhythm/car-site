-- An optional video per news post. Run this in the Supabase SQL editor.
--
-- The file lives in the existing `news-images` bucket under `videos/`, so the
-- storage policies from 0002_news.sql already cover it. It is uploaded straight
-- from the admin's browser (compressed there first, 50 MB at most).

alter table public.news
  add column if not exists video_url text,
  add column if not exists video_path text;
