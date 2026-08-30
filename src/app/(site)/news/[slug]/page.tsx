import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/common/Container";
import { NewsCard } from "@/components/common/NewsCard";
import { getAllNews, getNewsBySlug } from "@/lib/services/news.service";
import { excerpt, formatDate } from "@/lib/utils";
import styles from "./detail.module.css";

export async function generateMetadata({
  params,
}: PageProps<"/news/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);

  if (!post) return { title: "News Not Found" };

  return {
    title: post.title,
    description: post.description ? excerpt(post.description, 160) : undefined,
    openGraph: post.image_url ? { images: [post.image_url] } : undefined,
  };
}

export default async function NewsDetailPage({ params }: PageProps<"/news/[slug]">) {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);
  if (!post) notFound();

  const paragraphs = post.description
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  const others = (await getAllNews()).filter((item) => item.id !== post.id).slice(0, 3);

  return (
    <Container>
      <article className={styles.wrapper}>
        <div className={styles.breadcrumb}>
          <Link href="/news">← All News</Link>
        </div>

        <header className={styles.header}>
          <span className={styles.date}>{formatDate(post.published_at)}</span>
          <h1 className={styles.title}>{post.title}</h1>
        </header>

        {post.image_url && (
          <div className={styles.imageWrap}>
            <Image
              src={post.image_url}
              alt={post.title}
              fill
              sizes="(max-width: 1200px) 100vw, 1000px"
              className={styles.image}
              priority
            />
          </div>
        )}

        <div className={styles.body}>
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {others.length > 0 && (
          <section className={styles.more}>
            <h2 className={styles.moreHeading}>More News</h2>
            <div className={styles.moreGrid}>
              {others.map((item) => (
                <NewsCard
                  key={item.id}
                  post={item}
                  sizes="(max-width: 768px) 90vw, 30vw"
                />
              ))}
            </div>
          </section>
        )}
      </article>
    </Container>
  );
}
