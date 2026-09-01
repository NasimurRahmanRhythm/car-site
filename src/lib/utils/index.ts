const DEFAULT_CURRENCY = "AED";

/**
 * `cars.currency` is a free-text column, so it holds whatever an admin typed —
 * "Tk", "taka", a code with a stray space. `Intl.NumberFormat` throws a
 * RangeError on anything that is not a valid ISO 4217 code, and an uncaught
 * throw inside a Server Component takes the whole page down rather than just
 * the price cell, so an unrecognised code falls back to a plain number with the
 * typed label in front of it. Keeping the label rather than substituting the
 * default matters: showing an AED price for a car listed in taka would be worse
 * than showing an unstyled one.
 */
export function formatPrice(price: number, currency?: string | null): string {
  const code = (currency ?? "").trim() || DEFAULT_CURRENCY;
  const amount = Number(price);

  if (!Number.isFinite(amount)) return "—";

  try {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${code} ${new Intl.NumberFormat("en-AE", {
      maximumFractionDigits: 0,
    }).format(amount)}`;
  }
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

/**
 * Same reasoning as formatPrice: `Intl.DateTimeFormat` throws "Invalid time
 * value" on an unparseable date, which would take down any page that renders
 * one alongside good rows.
 */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** Trims a news body down to a card-sized teaser without cutting mid-word. */
export function excerpt(value: string, maxLength = 140): string {
  const collapsed = value.replace(/\s+/g, " ").trim();
  if (collapsed.length <= maxLength) return collapsed;
  const clipped = collapsed.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`;
}
