import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Button } from "@/components/common/Button";
import { NewsCard } from "@/components/common/NewsCard";
import type { NewsPost } from "@/types/news";
import { NewsMarquee } from "./NewsMarquee";
import styles from "./NewsStrip.module.css";

export function NewsStrip({ posts }: { posts: NewsPost[] }) {
  if (posts.length === 0) return null;

  // A single post has nothing to scroll past, so it sits still and centred
  // instead of sliding an identical card through over and over.
  const isSingle = posts.length === 1;

  return (
    <section className={styles.section}>
      <Container>
        <SectionHeading
          eyebrow="Latest"
          heading="News & Updates"
          description="New arrivals, showroom events, and everything else worth knowing."
        />
      </Container>

      {isSingle ? (
        <Container>
          <div className={styles.single}>
            <NewsCard post={posts[0]} sizes="(max-width: 768px) 90vw, 480px" />
          </div>
        </Container>
      ) : (
        <NewsMarquee posts={posts} />
      )}

      <Container>
        <div className={styles.footer}>
          <Button href="/news" variant="secondary">
            View More
          </Button>
        </div>
      </Container>
    </section>
  );
}
