import Link from "next/link";
import { signOutAction } from "@/app/actions/auth";
import { getPendingAppointmentCount } from "@/lib/services/admin.service";
import { SITE } from "@/data/site";
import { AppointmentsLink } from "./AppointmentsLink";
import styles from "./AdminNav.module.css";

export async function AdminNav() {
  const pendingAppointments = await getPendingAppointmentCount();

  return (
    <nav className={styles.nav}>
      <Link href="/admin" className={styles.logo}>
        {SITE.shortName} Admin
      </Link>

      <div className={styles.links}>
        <Link href="/admin" className={styles.link}>
          Inventory
        </Link>
        <Link href="/admin/news" className={styles.link}>
          News
        </Link>
        <AppointmentsLink initialCount={pendingAppointments} />
        <Link href="/admin/cars/new" className={styles.link}>
          Add Vehicle
        </Link>
        <Link href="/" className={styles.link} target="_blank">
          View Site
        </Link>
        <form action={signOutAction}>
          <button type="submit" className="admin-action admin-action-danger">
            Sign Out
          </button>
        </form>
      </div>
    </nav>
  );
}
