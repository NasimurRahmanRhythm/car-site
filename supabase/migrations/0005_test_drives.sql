-- Test drive requests, plus the removal of the inquiry system.
-- Run this in the Supabase SQL editor.
--
-- `test_drives` deliberately mirrors `appointments` column for column: the two
-- flows are the same request with a different intent, so the shared service,
-- email and admin-table code can treat either table the same way.

create table if not exists public.test_drives (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  preferred_date date,
  preferred_time text,
  message text,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists test_drives_created_at_idx
  on public.test_drives (created_at desc);

alter table public.test_drives enable row level security;

-- Same posture as appointments: the public may ask, only admins may look.
drop policy if exists "anyone can request a test drive" on public.test_drives;
create policy "anyone can request a test drive"
  on public.test_drives for insert
  with check (true);

drop policy if exists "admins read test drives" on public.test_drives;
create policy "admins read test drives"
  on public.test_drives for select
  using (public.is_admin());

drop policy if exists "admins update test drives" on public.test_drives;
create policy "admins update test drives"
  on public.test_drives for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admins delete test drives" on public.test_drives;
create policy "admins delete test drives"
  on public.test_drives for delete
  using (public.is_admin());

-- ─────────────────────────────────────────────
-- Inquiries are retired: the contact page and its form are gone, and visitors
-- now reach the showroom through an appointment or a test drive instead.
-- ─────────────────────────────────────────────
drop table if exists public.inquiries;
