import type { Metadata } from "next";
import { NewsTable } from "@/components/admin/NewsTable";
import { Button } from "@/components/common/Button";
import { getAllNewsForAdmin } from "@/lib/services/admin.service";
import styles from "../admin.module.css";

export const metadata: Metadata = {
  title: "Manage News",
};

export default async function AdminNewsPage() {
  const posts = await getAllNewsForAdmin();

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.heading}>News</h1>
        <Button href="/admin/news/new" size="sm">
          Add Post
        </Button>
      </div>

      <NewsTable posts={posts} />
    </div>
  );
}
