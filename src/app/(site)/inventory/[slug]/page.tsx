import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/common/Container";
import { Badge } from "@/components/common/Badge";
import { CarGallery } from "@/components/car-detail/CarGallery";
import { CarSpecTable } from "@/components/car-detail/CarSpecTable";
import { CarFeatures } from "@/components/car-detail/CarFeatures";
import { CarBookingPanel } from "@/components/car-detail/CarBookingPanel";
import { SimilarCars } from "@/components/car-detail/SimilarCars";
import { getCarBySlug, getSimilarCars } from "@/lib/services/car.service";
import { CAR_STATUS_LABELS } from "@/lib/constants";
import { carDisplayName, formatPrice } from "@/lib/utils";
import styles from "./detail.module.css";

const STATUS_VARIANT = {
  available: "available",
  reserved: "reserved",
  sold: "sold",
} as const;

export async function generateMetadata({
  params,
}: PageProps<"/inventory/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const car = await getCarBySlug(slug);
  if (!car) return {};

  return {
    title: carDisplayName(car),
    description: car.description ?? undefined,
  };
}

export default async function CarDetailPage({ params }: PageProps<"/inventory/[slug]">) {
  const { slug } = await params;
  const car = await getCarBySlug(slug);
  if (!car) notFound();

  const similarCars = await getSimilarCars(car);
  const displayName = carDisplayName(car);

  return (
    <>
      <Container>
        <div className={styles.wrapper}>
          <div className={styles.breadcrumb}>
            <Link href="/inventory">Inventory</Link> / {displayName}
          </div>

          <div className={styles.headline}>
            <div>
              <h1 className={styles.title}>{displayName}</h1>
              <div className={styles.subMeta}>
                <Badge variant={STATUS_VARIANT[car.status]}>
                  {CAR_STATUS_LABELS[car.status]}
                </Badge>
              </div>
            </div>
            <span className={styles.price}>{formatPrice(car.price, car.currency)}</span>
          </div>

          <div className={styles.layout}>
            <div>
              <CarGallery images={car.car_images} carName={displayName} />

              {car.description && (
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Overview</h2>
                  <p className={styles.description}>{car.description}</p>
                </div>
              )}

              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Specifications</h2>
                <CarSpecTable car={car} />
              </div>

              {car.features.length > 0 && (
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Features</h2>
                  <CarFeatures features={car.features} />
                </div>
              )}
            </div>

            <div>
              <CarBookingPanel carName={displayName} />
            </div>
          </div>
        </div>
      </Container>

      <SimilarCars cars={similarCars} />
    </>
  );
}
