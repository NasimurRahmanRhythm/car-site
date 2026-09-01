import { createClient } from "@/lib/supabase/server";
import { PAGE_SIZE } from "@/lib/constants";
import type { CarFilters, CarSort, CarWithImages, FilterOptions } from "@/types/car";

const CAR_WITH_IMAGES_SELECT = "*, car_images(*)";

export async function getCars(
  filters: CarFilters = {}
): Promise<{ cars: CarWithImages[]; total: number }> {
  const supabase = await createClient();
  const page = filters.page ?? 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("cars")
    .select(CAR_WITH_IMAGES_SELECT, { count: "exact" });

  if (filters.make) query = query.eq("make", filters.make);
  if (filters.model) query = query.eq("model", filters.model);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.category) query = query.contains("categories", [filters.category]);
  if (filters.yearMin) query = query.gte("year", filters.yearMin);
  if (filters.yearMax) query = query.lte("year", filters.yearMax);
  if (filters.priceMin) query = query.gte("price", filters.priceMin);
  if (filters.priceMax) query = query.lte("price", filters.priceMax);

  const [column, ascending] = sortToColumn(filters.sort);

  const { data, count, error } = await query
    .order(column, { ascending })
    .range(from, to);

  if (error) {
    console.error("getCars failed:", error.message);
    return { cars: [], total: 0 };
  }

  return { cars: (data ?? []) as unknown as CarWithImages[], total: count ?? 0 };
}

function sortToColumn(sort: CarSort | undefined): ["created_at" | "price" | "year", boolean] {
  switch (sort) {
    case "price-asc":
      return ["price", true];
    case "price-desc":
      return ["price", false];
    case "year-desc":
      return ["year", false];
    case "year-asc":
      return ["year", true];
    case "newest":
    default:
      return ["created_at", false];
  }
}

export async function getCarBySlug(slug: string): Promise<CarWithImages | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cars")
    .select(CAR_WITH_IMAGES_SELECT)
    .eq("slug", slug)
    .order("sort_order", { referencedTable: "car_images", ascending: true })
    .maybeSingle();

  if (error) {
    console.error("getCarBySlug failed:", error.message);
    return null;
  }

  return data as unknown as CarWithImages | null;
}

export async function getFeaturedCars(limit = 3): Promise<CarWithImages[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cars")
    .select(CAR_WITH_IMAGES_SELECT)
    .eq("is_featured", true)
    .order("sort_order", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("getFeaturedCars failed:", error.message);
    return [];
  }

  return (data ?? []) as unknown as CarWithImages[];
}

export async function getCarsByIds(ids: string[]): Promise<CarWithImages[]> {
  if (ids.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cars")
    .select(CAR_WITH_IMAGES_SELECT)
    .in("id", ids);

  if (error) {
    console.error("getCarsByIds failed:", error.message);
    return [];
  }

  return (data ?? []) as unknown as CarWithImages[];
}

export async function getSimilarCars(
  car: Pick<CarWithImages, "id" | "make" | "body_type">,
  limit = 3
): Promise<CarWithImages[]> {
  const supabase = await createClient();
  let query = supabase
    .from("cars")
    .select(CAR_WITH_IMAGES_SELECT)
    .neq("id", car.id)
    .limit(limit);

  query = car.body_type
    ? query.or(`make.eq.${car.make},body_type.eq.${car.body_type}`)
    : query.eq("make", car.make);

  const { data, error } = await query;

  if (error) {
    console.error("getSimilarCars failed:", error.message);
    return [];
  }

  return (data ?? []) as unknown as CarWithImages[];
}

export async function getAllCarSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("cars").select("slug, updated_at");

  if (error) {
    console.error("getAllCarSlugs failed:", error.message);
    return [];
  }

  return data ?? [];
}

export async function getFilterOptions(): Promise<FilterOptions> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cars")
    .select("make, year, price");

  if (error || !data) {
    console.error("getFilterOptions failed:", error?.message);
    return {
      makes: [],
      models: [],
      yearRange: { min: 2000, max: new Date().getFullYear() },
      priceRange: { min: 0, max: 0 },
    };
  }

  const makes = Array.from(new Set(data.map((c) => c.make))).sort();
  const years = data.map((c) => c.year);
  const prices = data.map((c) => c.price);

  return {
    makes,
    models: [],
    yearRange: {
      min: years.length ? Math.min(...years) : 2000,
      max: years.length ? Math.max(...years) : new Date().getFullYear(),
    },
    priceRange: {
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 0,
    },
  };
}

export interface GalleryImage {
  id: string;
  url: string;
  alt: string | null;
  car: { slug: string; year: number; make: string; model: string } | null;
}

/** How many rows to pull before shuffling — a cap so the query stays cheap. */
const GALLERY_POOL = 300;

/**
 * A shuffled sample of every photo attached to a vehicle in the collection.
 * PostgREST cannot order randomly, so the pool is drawn newest-first and
 * shuffled here.
 */
export async function getGalleryImages(limit = 60): Promise<GalleryImage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("car_images")
    .select("id, url, alt, cars(slug, year, make, model)")
    .order("created_at", { ascending: false })
    .limit(GALLERY_POOL);

  if (error) {
    console.error("getGalleryImages failed:", error.message);
    return [];
  }

  const rows = (data ?? []) as unknown as {
    id: string;
    url: string;
    alt: string | null;
    cars: GalleryImage["car"];
  }[];

  const pool = rows.map((row) => ({
    id: row.id,
    url: row.url,
    alt: row.alt,
    car: row.cars,
  }));

  // Fisher-Yates on a copy — the order changes on every request.
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, limit);
}
