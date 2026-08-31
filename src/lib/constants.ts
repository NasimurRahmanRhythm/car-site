import type { CarCategory, CarSort } from "@/types/car";

export const CATEGORIES: { value: CarCategory; label: string }[] = [
  { value: "upcoming_units", label: "Upcoming Units" },
  { value: "port_units", label: "Port Units" },
  { value: "showroom_stocks", label: "Showroom Stocks" },
  { value: "exchange_offers", label: "Exchange Offers" },
  { value: "pre_orders", label: "Pre Orders" },
];

export const CATEGORY_LABELS: Record<CarCategory, string> = {
  upcoming_units: "Upcoming Units",
  port_units: "Port Units",
  showroom_stocks: "Showroom Stocks",
  exchange_offers: "Exchange Offers",
  pre_orders: "Pre Orders",
};

export const CAR_STATUS_LABELS: Record<string, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
};

export const SORT_OPTIONS: { value: CarSort; label: string }[] = [
  { value: "newest", label: "Newest Arrivals" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "year-desc", label: "Year: Newest First" },
  { value: "year-asc", label: "Year: Oldest First" },
];

export const NAV_HEIGHT_PX = 64;
export const MAX_COMPARE = 4;
export const COMPARE_STORAGE_KEY = "car-site:compare";
export const PAGE_SIZE = 9;

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
};

/**
 * How long an admin stays signed in before a fresh sign-in code is required.
 * Enforced in `src/lib/supabase/middleware.ts`; mirror this in the Supabase
 * dashboard under Authentication → Sessions → Time-box user sessions.
 */
export const SESSION_MAX_AGE_DAYS = 14;
export const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
