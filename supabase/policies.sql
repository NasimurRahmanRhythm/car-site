-- Car Showroom — Row Level Security
-- Run after schema.sql.

alter table public.admin_members enable row level security;
alter table public.cars enable row level security;
alter table public.car_images enable row level security;
alter table public.inquiries enable row level security;

-- ─────────────────────────────────────────────
-- is_admin(): true if the caller's JWT email is in admin_members
-- security definer so it can read admin_members regardless of the
-- caller's own row-level access.
-- ─────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_members
    where email = (auth.jwt() ->> 'email')
  );
$$;

-- ─────────────────────────────────────────────
-- admin_members
-- ─────────────────────────────────────────────
drop policy if exists "admin_members: admins can read" on public.admin_members;
create policy "admin_members: admins can read"
  on public.admin_members for select
  using (public.is_admin());

-- ─────────────────────────────────────────────
-- cars
-- ─────────────────────────────────────────────
drop policy if exists "cars: public can read" on public.cars;
create policy "cars: public can read"
  on public.cars for select
  using (true);

drop policy if exists "cars: admins can insert" on public.cars;
create policy "cars: admins can insert"
  on public.cars for insert
  with check (public.is_admin());

drop policy if exists "cars: admins can update" on public.cars;
create policy "cars: admins can update"
  on public.cars for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "cars: admins can delete" on public.cars;
create policy "cars: admins can delete"
  on public.cars for delete
  using (public.is_admin());

-- ─────────────────────────────────────────────
-- car_images
-- ─────────────────────────────────────────────
drop policy if exists "car_images: public can read" on public.car_images;
create policy "car_images: public can read"
  on public.car_images for select
  using (true);

drop policy if exists "car_images: admins can insert" on public.car_images;
create policy "car_images: admins can insert"
  on public.car_images for insert
  with check (public.is_admin());

drop policy if exists "car_images: admins can update" on public.car_images;
create policy "car_images: admins can update"
  on public.car_images for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "car_images: admins can delete" on public.car_images;
create policy "car_images: admins can delete"
  on public.car_images for delete
  using (public.is_admin());

-- ─────────────────────────────────────────────
-- inquiries
-- ─────────────────────────────────────────────
drop policy if exists "inquiries: anyone can insert" on public.inquiries;
create policy "inquiries: anyone can insert"
  on public.inquiries for insert
  with check (true);

drop policy if exists "inquiries: admins can read" on public.inquiries;
create policy "inquiries: admins can read"
  on public.inquiries for select
  using (public.is_admin());

-- ─────────────────────────────────────────────
-- storage: car-images bucket
-- Public read, admin-only write. Run this after creating the
-- "car-images" bucket (Storage → New bucket → public).
-- ─────────────────────────────────────────────
drop policy if exists "car-images: public can read" on storage.objects;
create policy "car-images: public can read"
  on storage.objects for select
  using (bucket_id = 'car-images');

drop policy if exists "car-images: admins can insert" on storage.objects;
create policy "car-images: admins can insert"
  on storage.objects for insert
  with check (bucket_id = 'car-images' and public.is_admin());

drop policy if exists "car-images: admins can update" on storage.objects;
create policy "car-images: admins can update"
  on storage.objects for update
  using (bucket_id = 'car-images' and public.is_admin());

drop policy if exists "car-images: admins can delete" on storage.objects;
create policy "car-images: admins can delete"
  on storage.objects for delete
  using (bucket_id = 'car-images' and public.is_admin());
