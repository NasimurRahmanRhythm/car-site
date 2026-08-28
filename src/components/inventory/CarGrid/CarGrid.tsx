import { CarCard } from "@/components/common/CarCard";
import { EmptyState } from "@/components/inventory/EmptyState";
import type { CarWithImages } from "@/types/car";
import styles from "./CarGrid.module.css";

export function CarGrid({ cars }: { cars: CarWithImages[] }) {
  if (cars.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={styles.grid}>
      {cars.map((car, index) => (
        <CarCard key={car.id} car={car} index={index} />
      ))}
    </div>
  );
}
