import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { CarCard } from "@/components/common/CarCard";
import type { CarWithImages } from "@/types/car";
import styles from "./SimilarCars.module.css";

export function SimilarCars({ cars }: { cars: CarWithImages[] }) {
  if (cars.length === 0) return null;

  return (
    <section className={styles.section}>
      <Container>
        <SectionHeading eyebrow="You May Also Like" heading="Similar Vehicles" />
        <div className={styles.grid}>
          {cars.map((car, index) => (
            <CarCard key={car.id} car={car} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
}
