import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { CarCard } from "@/components/common/CarCard";
import { Button } from "@/components/common/Button";
import type { CarWithImages } from "@/types/car";
import styles from "./FeaturedCars.module.css";

export function FeaturedCars({ cars }: { cars: CarWithImages[] }) {
  if (cars.length === 0) return null;

  return (
    <section className={styles.section}>
      <Container>
        <SectionHeading
          eyebrow="Currently Available"
          heading="Featured Arrivals"
          description="A short selection from our current showroom floor — each vehicle inspected and ready for viewing."
        />

        <div className={styles.grid}>
          {cars.map((car, index) => (
            <CarCard key={car.id} car={car} priority={index === 0} index={index} />
          ))}
        </div>

        <div className={styles.footer}>
          <Button href="/inventory" variant="secondary">
            View Full Inventory
          </Button>
        </div>
      </Container>
    </section>
  );
}
