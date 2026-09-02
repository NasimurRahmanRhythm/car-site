import type { Metadata } from "next";
import { AppointmentTable } from "@/components/admin/AppointmentTable";
import { getAllBookings } from "@/lib/services/booking.service";
import styles from "../admin.module.css";

export const metadata: Metadata = {
  title: "Test Drives",
};

export default async function AdminTestDrivesPage() {
  const testDrives = await getAllBookings("test_drive");
  const pending = testDrives.filter((item) => item.status === "pending").length;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Test Drives</h1>
        <span className={styles.headerNote}>
          {pending} pending of {testDrives.length}
        </span>
      </div>

      <AppointmentTable kind="test_drive" appointments={testDrives} />
    </div>
  );
}
