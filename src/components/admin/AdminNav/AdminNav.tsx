import Link from "next/link";
import { signOutAction } from "@/app/actions/auth";
import { SITE } from "@/data/site";
import styles from "./AdminNav.module.css";

export function AdminNav() {
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
        <Link href="/admin/appointments" className={styles.link}>
          Appointments
        </Link>
        <Link href="/admin/cars/new" className={styles.link}>
          Add Vehicle
        </Link>
        <Link href="/" className={styles.link} target="_blank">
          View Site
        </Link>
        <form action={signOutAction}>
          <button type="submit" className={styles.signOut}>
            Sign Out
          </button>
        </form>
      </div>
    </nav>
  );
}
