-- Car Showroom — Core Schema
-- Run this in the Supabase SQL Editor (or via `supabase db push`).

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────
-- admin_members: whitelist of who may access /admin
-- ─────────────────────────────────────────────
create table if not exists public.admin_members (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- cars: main inventory table
-- ─────────────────────────────────────────────
create table if not exists public.cars (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  make text not null,
  model text not null,
  year integer not null,
  trim text,
  price numeric(12, 2) not null,
  currency text not null default 'AED',
  status text not null default 'available'
    check (status in ('available', 'reserved', 'sold')),
  categories text[] not null default '{}',
  mileage integer,
  exterior_color text,
  interior_color text,
  transmission text,
  fuel_type text,
  engine text,
  horsepower integer,
  drivetrain text,
  body_type text,
  doors integer,
  seats integer,
  vin text,
  description text,
  features text[] not null default '{}',
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cars
  add constraint cars_categories_check check (
    categories <@ array[
      'upcoming_units',
      'port_units',
      'showroom_stocks',
      'exchange_offers',
      'pre_orders'
    ]::text[]
  );

create index if not exists cars_slug_idx on public.cars (slug);
create index if not exists cars_make_model_idx on public.cars (make, model);
create index if not exists cars_year_idx on public.cars (year);
create index if not exists cars_price_idx on public.cars (price);
create index if not exists cars_status_idx on public.cars (status);
create index if not exists cars_categories_gin_idx on public.cars using gin (categories);

-- ─────────────────────────────────────────────
-- car_images: gallery images per car
-- ─────────────────────────────────────────────
create table if not exists public.car_images (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars (id) on delete cascade,
  url text not null,
  storage_path text not null,
  alt text,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists car_images_car_id_idx on public.car_images (car_id, sort_order);

-- ─────────────────────────────────────────────
-- inquiries: contact form + per-car inquiries
-- ─────────────────────────────────────────────
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  car_id uuid references public.cars (id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  message text,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- updated_at trigger for cars
-- ─────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cars_set_updated_at on public.cars;
create trigger cars_set_updated_at
  before update on public.cars
  for each row
  execute function public.set_updated_at();
