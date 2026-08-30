import { Badge } from "@/components/common/Badge";
import { formatDate } from "@/lib/utils";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/constants";
import type { Appointment } from "@/types/appointment";
import { AppointmentActions } from "./AppointmentActions";
import styles from "./AppointmentTable.module.css";

const STATUS_VARIANT = {
  pending: "reserved",
  confirmed: "available",
  cancelled: "sold",
} as const;

export function AppointmentTable({ appointments }: { appointments: Appointment[] }) {
  if (appointments.length === 0) {
    return <div className={styles.empty}>No appointment requests yet.</div>;
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Requested By</th>
            <th>Preferred Slot</th>
            <th>Message</th>
            <th>Received</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment.id}>
              <td>
                <span className={styles.name}>{appointment.name}</span>
                <a href={`mailto:${appointment.email}`} className={styles.contact}>
                  {appointment.email}
                </a>
                {appointment.phone && (
                  <a href={`tel:${appointment.phone}`} className={styles.contact}>
                    {appointment.phone}
                  </a>
                )}
              </td>
              <td>
                {appointment.preferred_date
                  ? formatDate(appointment.preferred_date)
                  : "No date given"}
                {appointment.preferred_time && (
                  <span className={styles.time}>{appointment.preferred_time}</span>
                )}
              </td>
              <td className={styles.message}>{appointment.message ?? "—"}</td>
              <td>{formatDate(appointment.created_at)}</td>
              <td>
                <Badge variant={STATUS_VARIANT[appointment.status]}>
                  {APPOINTMENT_STATUS_LABELS[appointment.status]}
                </Badge>
              </td>
              <td>
                <AppointmentActions id={appointment.id} status={appointment.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
