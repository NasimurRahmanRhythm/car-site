import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { SortSelect } from "@/components/inventory/SortSelect";
import { CarGrid } from "@/components/inventory/CarGrid";
import { Pagination } from "@/components/inventory/Pagination";
import { getCarsByCategory } from "@/lib/services/category.service";
import { CATEGORY_LABELS, PAGE_SIZE } from "@/lib/constants";
import type { CarCategory, CarSort } from "@/types/car";
import styles from "../../inventory/inventory.module.css";

const VALID_CATEGORIES = Object.keys(CATEGORY_LABELS) as CarCategory[];

function isValidCategory(value: string): value is CarCategory {
  return VALID_CATEGORIES.includes(value as CarCategory);
}

export async function generateMetadata({
  params,
}: PageProps<"/categories/[category]">): Promise<Metadata> {
  const { category } = await params;
  if (!isValidCategory(category)) return {};
  return { title: CATEGORY_LABELS[category] };
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/categories/[category]">) {
  const { category } = await params;
  if (!isValidCategory(category)) notFound();

  const resolvedSearchParams = await searchParams;
  const sort =
    typeof resolvedSearchParams.sort === "string"
      ? (resolvedSearchParams.sort as CarSort)
      : undefined;
  const page =
    typeof resolvedSearchParams.page === "string" ? Number(resolvedSearchParams.page) : 1;

  const { cars, total } = await getCarsByCategory(category, { sort, page });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Container>
      <div className={styles.wrapper}>
        <SectionHeading
          eyebrow="Inventory Category"
          heading={CATEGORY_LABELS[category]}
          description={`${total} vehicle${total === 1 ? "" : "s"} in this category.`}
        />

        <div className={styles.toolbar}>
          <SortSelect />
        </div>

        <CarGrid cars={cars} />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath={`/categories/${category}`}
          searchParams={{ sort }}
        />
      </div>
    </Container>
  );
}
