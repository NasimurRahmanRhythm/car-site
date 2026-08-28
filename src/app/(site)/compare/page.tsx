import type { Metadata } from "next";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { EmptyState } from "@/components/inventory/EmptyState";
import { CompareTable } from "@/components/compare/CompareTable";
import { Button } from "@/components/common/Button";
import { getCarsByIds } from "@/lib/services/car.service";
import styles from "./compare.module.css";

export const metadata: Metadata = {
  title: "Compare Vehicles",
};

export default async function ComparePage({ searchParams }: PageProps<"/compare">) {
  const params = await searchParams;
  const idsParam = typeof params.ids === "string" ? params.ids : "";
  const ids = idsParam.split(",").map((id) => id.trim()).filter(Boolean);

  const cars = ids.length > 0 ? await getCarsByIds(ids) : [];

  return (
    <Container>
      <div className={styles.wrapper}>
        <SectionHeading
          eyebrow="Side by Side"
          heading="Compare Vehicles"
          description="Review specifications side by side to help decide which vehicle is right for you."
        />

        {cars.length > 0 ? (
          <CompareTable cars={cars} />
        ) : (
          <EmptyState
            title="Nothing to Compare Yet"
            description="Browse the inventory and use the compare icon on any vehicle card to add it here."
          />
        )}

        <div className={styles.footer}>
          <Button href="/inventory" variant="secondary">
            Browse Inventory
          </Button>
        </div>
      </div>
    </Container>
  );
}
