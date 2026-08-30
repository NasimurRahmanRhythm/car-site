import { NewsCard } from "@/components/common/NewsCard";
import { RevealBlock } from "@/components/common/RevealBlock";
import type { NewsPost } from "@/types/news";
import styles from "./NewsGrid.module.css";

export function NewsGrid({ posts }: { posts: NewsPost[] }) {
  if (posts.length === 0) {
    return <p className={styles.empty}>No news posted yet. Check back soon.</p>;
  }

  return (
    <div className={styles.grid}>
      {posts.map((post, index) => (
        <RevealBlock key={post.id} delay={(index % 3) * 0.12}>
          <NewsCard
            post={post}
            priority={index === 0}
            sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 30vw"
          />
        </RevealBlock>
      ))}
    </div>
  );
}
