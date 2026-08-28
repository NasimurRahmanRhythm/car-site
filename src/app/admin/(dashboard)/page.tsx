import type { Metadata } from "next";
import { CarTable } from "@/components/admin/CarTable";
import { Button } from "@/components/common/Button";
import { getAllCarsForAdmin } from "@/lib/services/admin.service";
import styles from "./admin.module.css";

export const metadata: Metadata = {
  title: "Manage Inventory",
};

export default async function AdminDashboardPage() {
  const cars = await getAllCarsForAdmin();

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Inventory</h1>
        <Button href="/admin/cars/new" size="sm">
          Add Vehicle
        </Button>
      </div>

      <CarTable cars={cars} />
    </div>
  );
}
