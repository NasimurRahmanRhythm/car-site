import type { Metadata } from "next";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { FilterPanel } from "@/components/inventory/FilterPanel";
import { SortSelect } from "@/components/inventory/SortSelect";
import { CarGrid } from "@/components/inventory/CarGrid";
import { Pagination } from "@/components/inventory/Pagination";
import { getCars, getFilterOptions } from "@/lib/services/car.service";
import type { CarCategory, CarSort, CarStatus } from "@/types/car";
import styles from "./inventory.module.css";

export const metadata: Metadata = {
  title: "Inventory",
  description: "Browse the full current collection of available vehicles.",
};

export default async function InventoryPage({ searchParams }: PageProps<"/inventory">) {
  const params = await searchParams;

  const make = typeof params.make === "string" ? params.make : undefined;
  const model = typeof params.model === "string" ? params.model : undefined;
  const category = typeof params.category === "string" ? (params.category as CarCategory) : undefined;
  const status = typeof params.status === "string" ? (params.status as CarStatus) : undefined;
  const year = typeof params.year === "string" ? Number(params.year) : undefined;
  const sort = typeof params.sort === "string" ? (params.sort as CarSort) : undefined;
  const page = typeof params.page === "string" ? Number(params.page) : 1;

  const [{ cars, total }, filterOptions] = await Promise.all([
    getCars({
      make,
      model,
      category,
      status,
      yearMin: year,
      yearMax: year,
      sort,
      page,
    }),
    getFilterOptions(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / 9));

  return (
    <Container>
      <div className={styles.wrapper}>
        <SectionHeading
          eyebrow="Full Collection"
          heading="Inventory"
          description={`${total} vehicle${total === 1 ? "" : "s"} currently in our collection.`}
        />

        <FilterPanel makes={filterOptions.makes} yearRange={filterOptions.yearRange} />

        <div className={styles.toolbar}>
          <SortSelect />
        </div>

        <CarGrid cars={cars} />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath="/inventory"
          searchParams={{ make, model, category, status, year: year ? String(year) : undefined, sort }}
        />
      </div>
    </Container>
  );
}
