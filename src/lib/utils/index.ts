export function formatPrice(price: number, currency = "AED"): string {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatMileage(mileage: number | null): string {
  if (mileage === null) return "—";
  return `${new Intl.NumberFormat("en-US").format(mileage)} km`;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function carDisplayName(car: {
  year: number;
  make: string;
  model: string;
  trim?: string | null;
}): string {
  return [car.year, car.make, car.model, car.trim].filter(Boolean).join(" ");
}
