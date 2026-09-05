import Image from "next/image";
import Link from "next/link";
import { richTextToPlainText } from "@/lib/rich-text";
import { excerpt, formatDate } from "@/lib/utils";
import type { NewsPost } from "@/types/news";
import { DeleteNewsButton } from "./DeleteNewsButton";
import styles from "./NewsTable.module.css";

export function NewsTable({ posts }: { posts: NewsPost[] }) {
  if (posts.length === 0) {
    return <div className={styles.empty}>No news posts yet. Add your first one above.</div>;
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th></th>
            <th>Title</th>
            <th>Published</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id}>
              <td>
                <div className={styles.thumb}>
                  {post.image_url && (
                    <Image src={post.image_url} alt="" fill sizes="96px" style={{ objectFit: "cover" }} />
                  )}
                </div>
              </td>
              <td>
                <Link href={`/admin/news/${post.id}`} className={styles.title}>
                  {post.title}
                </Link>
                {post.description && (
                  <p className={styles.excerpt}>{excerpt(richTextToPlainText(post.description), 90)}</p>
                )}
              </td>
              <td>{formatDate(post.published_at)}</td>
              <td>
                <div className={styles.actions}>
                  <Link href={`/news/${post.slug}`} className="admin-action" target="_blank">
                    View
                  </Link>
                  <Link href={`/admin/news/${post.id}`} className="admin-action">
                    Edit
                  </Link>
                  <DeleteNewsButton postId={post.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
