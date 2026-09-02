import type { Database, CarCategory, CarStatus } from "./database";

export type { CarCategory, CarStatus };

export type Car = Database["public"]["Tables"]["cars"]["Row"];
export type CarImage = Database["public"]["Tables"]["car_images"]["Row"];
export type AdminMember = Database["public"]["Tables"]["admin_members"]["Row"];

export interface CarWithImages extends Car {
  car_images: CarImage[];
}

export interface CarFilters {
  make?: string;
  model?: string;
  category?: CarCategory;
  status?: CarStatus;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  sort?: CarSort;
  page?: number;
}

export type CarSort =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "year-desc"
  | "year-asc";

export interface FilterOptions {
  makes: string[];
  models: string[];
  yearRange: { min: number; max: number };
  priceRange: { min: number; max: number };
}
