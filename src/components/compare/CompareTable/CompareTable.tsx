"use client";

import Image from "next/image";
import Link from "next/link";
import { useCompare } from "@/providers/CompareProvider";
import { formatMileage, formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { CarWithImages } from "@/types/car";
import styles from "./CompareTable.module.css";

interface SpecRow {
  label: string;
  value: (car: CarWithImages) => string;
}

const ROWS: SpecRow[] = [
  { label: "Price", value: (car) => formatPrice(car.price, car.currency) },
  { label: "Status", value: (car) => car.status },
  { label: "Mileage", value: (car) => formatMileage(car.mileage) },
  { label: "Transmission", value: (car) => car.transmission ?? "—" },
  { label: "Fuel Type", value: (car) => car.fuel_type ?? "—" },
  { label: "Engine", value: (car) => car.engine ?? "—" },
  { label: "Horsepower", value: (car) => (car.horsepower ? `${car.horsepower} HP` : "—") },
  { label: "Drivetrain", value: (car) => car.drivetrain ?? "—" },
  { label: "Body Type", value: (car) => car.body_type ?? "—" },
  { label: "Doors", value: (car) => (car.doors ? String(car.doors) : "—") },
  { label: "Seats", value: (car) => (car.seats ? String(car.seats) : "—") },
  { label: "Exterior Color", value: (car) => car.exterior_color ?? "—" },
  { label: "Interior Color", value: (car) => car.interior_color ?? "—" },
];

export function CompareTable({ cars }: { cars: CarWithImages[] }) {
  const { remove } = useCompare();

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.headerRow}>
            <th className={styles.labelCell}>Vehicle</th>
            {cars.map((car) => {
              const cover = car.car_images.find((img) => img.is_cover) ?? car.car_images[0];
              return (
                <th key={car.id} className={styles.valueCell}>
                  <div className={styles.carImage}>
                    {cover && (
                      <Image
                        src={cover.url}
                        alt={cover.alt ?? car.model}
                        fill
                        sizes="220px"
                        style={{ objectFit: "cover" }}
                      />
                    )}
                  </div>
                  <Link href={`/inventory/${car.slug}`} className={styles.carName}>
                    {car.year} {car.make} {car.model}
                  </Link>
                  <div className={styles.carPrice}>{formatPrice(car.price, car.currency)}</div>
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => remove(car.id)}
                  >
                    Remove
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => {
            const values = cars.map((car) => row.value(car));
            const isDifferent = new Set(values).size > 1;

            return (
              <tr key={row.label} className={cn(isDifferent && styles.diffRow)}>
                <td className={styles.labelCell}>{row.label}</td>
                {values.map((value, index) => (
                  <td key={cars[index].id} className={styles.valueCell}>
                    {value}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
