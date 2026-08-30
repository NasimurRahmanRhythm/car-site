import type { Metadata } from "next";
import { AppointmentTable } from "@/components/admin/AppointmentTable";
import { getAllAppointments } from "@/lib/services/admin.service";
import styles from "../admin.module.css";

export const metadata: Metadata = {
  title: "Appointments",
};

export default async function AdminAppointmentsPage() {
  const appointments = await getAllAppointments();
  const pending = appointments.filter((item) => item.status === "pending").length;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Appointments</h1>
        <span className={styles.headerNote}>
          {pending} pending of {appointments.length}
        </span>
      </div>

      <AppointmentTable appointments={appointments} />
    </div>
  );
}
