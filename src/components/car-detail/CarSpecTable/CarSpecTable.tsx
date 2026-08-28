import { formatMileage } from "@/lib/utils";
import type { Car } from "@/types/car";
import styles from "./CarSpecTable.module.css";

export function CarSpecTable({ car }: { car: Car }) {
  const specs: { label: string; value: string | null }[] = [
    { label: "Mileage", value: formatMileage(car.mileage) },
    { label: "Transmission", value: car.transmission },
    { label: "Fuel Type", value: car.fuel_type },
    { label: "Engine", value: car.engine },
    { label: "Horsepower", value: car.horsepower ? `${car.horsepower} HP` : null },
    { label: "Drivetrain", value: car.drivetrain },
    { label: "Body Type", value: car.body_type },
    { label: "Doors", value: car.doors ? String(car.doors) : null },
    { label: "Seats", value: car.seats ? String(car.seats) : null },
    { label: "Exterior Color", value: car.exterior_color },
    { label: "Interior Color", value: car.interior_color },
    { label: "VIN", value: car.vin },
  ].filter((spec) => spec.value);

  return (
    <div className={styles.table}>
      {specs.map((spec) => (
        <div key={spec.label} className={styles.row}>
          <span className={styles.label}>{spec.label}</span>
          <span className={styles.value}>{spec.value}</span>
        </div>
      ))}
    </div>
  );
}
