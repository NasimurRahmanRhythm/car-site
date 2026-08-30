import type { Metadata } from "next";
import { NewsForm } from "@/components/admin/NewsForm";
import { createNewsAction } from "@/app/actions/news";
import styles from "../../admin.module.css";

export const metadata: Metadata = {
  title: "Add News Post",
};

export default function NewNewsPage() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Add News Post</h1>
      </div>

      <NewsForm action={createNewsAction} submitLabel="Publish Post" />
    </div>
  );
}
