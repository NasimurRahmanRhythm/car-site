"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CATEGORIES, CAR_STATUS_LABELS } from "@/lib/constants";
import styles from "./FilterPanel.module.css";

interface FilterPanelProps {
  makes: string[];
  yearRange: { min: number; max: number };
}

const STATUS_OPTIONS = Object.entries(CAR_STATUS_LABELS);

export function FilterPanel({ makes, yearRange }: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const years = Array.from(
    { length: yearRange.max - yearRange.min + 1 },
    (_, index) => yearRange.max - index
  );

  const hasFilters = ["make", "category", "status", "year"].some((key) =>
    searchParams.get(key)
  );

  return (
    <div className={styles.panel}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="filter-make">
          Make
        </label>
        <select
          id="filter-make"
          className={styles.select}
          value={searchParams.get("make") ?? ""}
          onChange={(event) => updateParam("make", event.target.value)}
        >
          <option value="">All Makes</option>
          {makes.map((make) => (
            <option key={make} value={make}>
              {make}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="filter-category">
          Category
        </label>
        <select
          id="filter-category"
          className={styles.select}
          value={searchParams.get("category") ?? ""}
          onChange={(event) => updateParam("category", event.target.value)}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="filter-year">
          Year
        </label>
        <select
          id="filter-year"
          className={styles.select}
          value={searchParams.get("year") ?? ""}
          onChange={(event) => updateParam("year", event.target.value)}
        >
          <option value="">All Years</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="filter-status">
          Status
        </label>
        <select
          id="filter-status"
          className={styles.select}
          value={searchParams.get("status") ?? ""}
          onChange={(event) => updateParam("status", event.target.value)}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <div className={styles.footer}>
          <button type="button" className={styles.clear} onClick={() => router.push(pathname)}>
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
