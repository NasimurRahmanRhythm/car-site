import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/data/site";
import { richTextToPlainText } from "@/lib/rich-text";
import { cn, excerpt, formatDate } from "@/lib/utils";
import type { NewsPost } from "@/types/news";
import styles from "./NewsCard.module.css";

interface NewsCardProps {
  post: NewsPost;
  className?: string;
  /** Cards in the home strip are all the same size; the grid lets them breathe. */
  sizes?: string;
  priority?: boolean;
}

export function NewsCard({
  post,
  className,
  sizes = "(max-width: 768px) 90vw, 360px",
  priority = false,
}: NewsCardProps) {
  return (
    <Link href={`/news/${post.slug}`} className={cn(styles.card, className)}>
      <div className={styles.imageWrap}>
        {post.image_url ? (
          <Image
            src={post.image_url}
            alt={post.title}
            fill
            sizes={sizes}
            className={styles.image}
            priority={priority}
          />
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.placeholderLabel}>{SITE.shortName}</span>
          </div>
        )}
      </div>

      <div className={styles.body}>
        <span className={styles.date}>{formatDate(post.published_at)}</span>
        <h3 className={styles.title}>{post.title}</h3>
        {post.description && (
          <p className={styles.excerpt}>{excerpt(richTextToPlainText(post.description))}</p>
        )}
        <span className={styles.readMore}>Read More</span>
      </div>
    </Link>
  );
}
