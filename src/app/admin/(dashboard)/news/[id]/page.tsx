import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsForm } from "@/components/admin/NewsForm";
import { getNewsForAdmin } from "@/lib/services/admin.service";
import { updateNewsAction } from "@/app/actions/news";
import styles from "../../admin.module.css";

export const metadata: Metadata = {
  title: "Edit News Post",
};

export default async function EditNewsPage({ params }: PageProps<"/admin/news/[id]">) {
  const { id } = await params;
  const post = await getNewsForAdmin(id);
  if (!post) notFound();

  const boundUpdateAction = updateNewsAction.bind(null, id);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.heading}>{post.title}</h1>
      </div>

      <NewsForm post={post} action={boundUpdateAction} submitLabel="Save Changes" />
    </div>
  );
}
