import type { Metadata } from "next";
import { CarForm } from "@/components/admin/CarForm";
import { createCarAction } from "@/app/actions/admin";
import styles from "../../admin.module.css";

export const metadata: Metadata = {
  title: "Add Vehicle",
};

export default function NewCarPage() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Add Vehicle</h1>
      </div>

      <CarForm action={createCarAction} submitLabel="Create Vehicle" />
    </div>
  );
}
