import Image from "next/image";
import Link from "next/link";
import { RevealBlock } from "@/components/common/RevealBlock";
import { Badge } from "@/components/common/Badge";
import { CompareToggle } from "./CompareToggle";
import { CAR_STATUS_LABELS } from "@/lib/constants";
import { carDisplayName, formatMileage, formatPrice } from "@/lib/utils";
import type { CarWithImages } from "@/types/car";
import styles from "./CarCard.module.css";

const STATUS_VARIANT = {
  available: "available",
  reserved: "reserved",
  sold: "sold",
} as const;

interface CarCardProps {
  car: CarWithImages;
  priority?: boolean;
  showCompare?: boolean;
  /** Position within a grid — staggers the reveal so cards arrive in sequence. */
  index?: number;
}

export function CarCard({
  car,
  priority = false,
  showCompare = true,
  index = 0,
}: CarCardProps) {
  const cover =
    car.car_images.find((image) => image.is_cover) ?? car.car_images[0] ?? null;

  return (
    <RevealBlock delay={(index % 3) * 0.12}>
      <Link href={`/inventory/${car.slug}`} className={styles.card}>
        <div className={styles.imageWrap}>
          {cover ? (
            <Image
              src={cover.url}
              alt={cover.alt ?? carDisplayName(car)}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={styles.image}
              priority={priority}
            />
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderLabel}>Image Coming Soon</span>
            </div>
          )}

          <Badge variant={STATUS_VARIANT[car.status]} className={styles.statusBadge}>
            {CAR_STATUS_LABELS[car.status]}
          </Badge>

          {showCompare && (
            <span className={styles.compareSlot}>
              <CompareToggle carId={car.id} />
            </span>
          )}
        </div>

        <div className={styles.body}>
          <h3 className={styles.title}>
            {car.year} {car.make} {car.model}
          </h3>
          <div className={styles.meta}>
            {car.trim && <span>{car.trim}</span>}
            <span>{formatMileage(car.mileage)}</span>
            {car.transmission && <span>{car.transmission}</span>}
          </div>

          <div className={styles.footer}>
            <span className={styles.price}>{formatPrice(car.price, car.currency)}</span>
            <span className={styles.viewLink}>View Details</span>
          </div>
        </div>
      </Link>
    </RevealBlock>
  );
}
