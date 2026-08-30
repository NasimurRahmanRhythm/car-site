-- Showroom appointment requests. Run this in the Supabase SQL editor.
-- Visitors insert (anon); only admins can read, update, or delete.

create table if not exists public.appointments (
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

create index if not exists appointments_created_at_idx
  on public.appointments (created_at desc);

alter table public.appointments enable row level security;

drop policy if exists "anyone can request an appointment" on public.appointments;
create policy "anyone can request an appointment"
  on public.appointments for insert
  with check (true);

drop policy if exists "admins read appointments" on public.appointments;
create policy "admins read appointments"
  on public.appointments for select
  using (public.is_admin());

drop policy if exists "admins update appointments" on public.appointments;
create policy "admins update appointments"
  on public.appointments for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admins delete appointments" on public.appointments;
create policy "admins delete appointments"
  on public.appointments for delete
  using (public.is_admin());
