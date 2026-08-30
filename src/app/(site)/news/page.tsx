import type { Metadata } from "next";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { NewsGrid } from "@/components/news/NewsGrid";
import { getAllNews } from "@/lib/services/news.service";
import styles from "./news.module.css";

export const metadata: Metadata = {
  title: "News",
  description: "New arrivals, showroom events, and announcements from VIP Motors.",
};

export default async function NewsPage() {
  const posts = await getAllNews();

  return (
    <Container>
      <div className={styles.wrapper}>
        <SectionHeading
          eyebrow="Latest"
          heading="News & Updates"
          description="Everything happening at the showroom, in one place."
        />

        <NewsGrid posts={posts} />
      </div>
    </Container>
  );
}
