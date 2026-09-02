import type { Metadata } from "next";
import { Showroom360Manager } from "@/components/admin/Showroom360Manager";
import { getTour } from "@/lib/services/showroom.service";
import styles from "../admin.module.css";

export const metadata: Metadata = {
  title: "360° View",
};

export default async function Admin360ViewPage() {
  const scenes = await getTour();

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.heading}>360° View</h1>
      </div>

      <Showroom360Manager scenes={scenes} />
    </div>
  );
}
