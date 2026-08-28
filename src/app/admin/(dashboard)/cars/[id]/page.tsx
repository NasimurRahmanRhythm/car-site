import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CarForm } from "@/components/admin/CarForm";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { getCarForAdmin } from "@/lib/services/admin.service";
import { updateCarAction } from "@/app/actions/admin";
import { carDisplayName } from "@/lib/utils";
import styles from "../../admin.module.css";

export const metadata: Metadata = {
  title: "Edit Vehicle",
};

export default async function EditCarPage({ params }: PageProps<"/admin/cars/[id]">) {
  const { id } = await params;
  const car = await getCarForAdmin(id);
  if (!car) notFound();

  const boundUpdateAction = updateCarAction.bind(null, id);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.heading}>{carDisplayName(car)}</h1>
      </div>

      <ImageUploader carId={car.id} images={car.car_images} />
      <CarForm car={car} action={boundUpdateAction} submitLabel="Save Changes" />
    </div>
  );
}
