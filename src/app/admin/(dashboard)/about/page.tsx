import type { Metadata } from "next";
import { AboutForm } from "@/components/admin/AboutForm";
import { getAboutRow, toAboutContent } from "@/lib/services/about.service";
import styles from "../admin.module.css";

export const metadata: Metadata = {
  title: "Manage About Us",
};

export default async function AdminAboutPage() {
  const row = await getAboutRow();

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.heading}>About Us</h1>
        <span className={styles.headerNote}>Shown on /about-us and on the home page</span>
      </div>

      <AboutForm about={toAboutContent(row)} isStored={row !== null} />
    </div>
  );
}
