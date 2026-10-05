import Link from "next/link";
import { signOutAction } from "@/app/actions/auth";
import { getPendingBookingCount } from "@/lib/services/booking.service";
import { SITE } from "@/data/site";
import { AppointmentsLink } from "./AppointmentsLink";
import styles from "./AdminNav.module.css";

export async function AdminNav() {
  const [pendingAppointments, pendingTestDrives] = await Promise.all([
    getPendingBookingCount("appointment"),
    getPendingBookingCount("test_drive"),
  ]);

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
        <Link href="/admin/gallery" className={styles.link}>
          Gallery
        </Link>
        <Link href="/admin/about" className={styles.link}>
          About Us
        </Link>
        <Link href="/admin/360-view" className={styles.link}>
          360&deg; View
        </Link>
        <AppointmentsLink
          kind="appointment"
          label="Appointments"
          initialCount={pendingAppointments}
        />
        <AppointmentsLink
          kind="test_drive"
          label="Test Drives"
          initialCount={pendingTestDrives}
        />
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
