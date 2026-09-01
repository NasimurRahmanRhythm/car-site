"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/common/Badge";
import { CATEGORIES, CATEGORY_LABELS, CAR_STATUS_LABELS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import type { CarCategory, CarWithImages } from "@/types/car";
import { DeleteCarButton } from "./DeleteCarButton";
import styles from "./CarTable.module.css";

const STATUS_VARIANT = {
  available: "available",
  reserved: "reserved",
  sold: "sold",
} as const;

export function CarTable({ cars }: { cars: CarWithImages[] }) {
  const [category, setCategory] = useState<CarCategory | "all">("all");

  const filteredCars = useMemo(() => {
    if (category === "all") return cars;
    return cars.filter((car) => car.categories?.includes(category));
  }, [cars, category]);

  if (cars.length === 0) {
    return <div className={styles.empty}>No vehicles yet. Add your first one above.</div>;
  }

  return (
    <div>
      <div className={styles.filters}>
        <label htmlFor="category-filter" className={styles.filterLabel}>
          Category
        </label>
        <select
          id="category-filter"
          className={styles.filterSelect}
          value={category}
          onChange={(event) => setCategory(event.target.value as CarCategory | "all")}
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {filteredCars.length === 0 ? (
        <div className={styles.empty}>No vehicles match this category.</div>
      ) : (
        <div className={styles.wrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th></th>
                <th>Vehicle</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Images</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredCars.map((car) => {
                const cover = car.car_images.find((img) => img.is_cover) ?? car.car_images[0];
                return (
                  <tr key={car.id}>
                    <td>
                      <div className={styles.thumb}>
                        {cover && (
                          <Image src={cover.url} alt="" fill sizes="64px" style={{ objectFit: "cover" }} />
                        )}
                      </div>
                    </td>
                    <td>
                      <Link href={`/admin/cars/${car.id}`} className={styles.name}>
                        {car.year} {car.make} {car.model}
                      </Link>
                    </td>
                    <td>
                      <div className={styles.categoryList}>
                        {car.categories?.map((value) => (
                          <Badge key={value} variant="default">
                            {CATEGORY_LABELS[value]}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td>{formatPrice(car.price, car.currency)}</td>
                    <td>
                      <Badge variant={STATUS_VARIANT[car.status]}>{CAR_STATUS_LABELS[car.status]}</Badge>
                    </td>
                    <td>{car.car_images.length}</td>
                    <td>
                      <div className={styles.actions}>
                        <Link href={`/admin/cars/${car.id}`} className="admin-action">
                          Edit
                        </Link>
                        <DeleteCarButton carId={car.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
