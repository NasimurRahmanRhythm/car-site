import Image from "next/image";
import { Container } from "@/components/common/Container";
import { RevealBlock } from "@/components/common/RevealBlock";
import { Badge } from "@/components/common/Badge";
import type { Dealership } from "@/data/dealerships";
import styles from "./DealershipFeature.module.css";

export function DealershipFeature({
  dealership,
  index,
}: {
  dealership: Dealership;
  index: number;
}) {
  return (
    <section id={dealership.slug} className={styles.section}>
      <Container>
        <div className={styles.masthead}>
          <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
          <div className={styles.identity}>
            <h2 className={`display-2 ${styles.marque}`}>
              {dealership.marque}
              {dealership.marqueNative && (
                <span className={styles.marqueNative}>{dealership.marqueNative}</span>
              )}
            </h2>
            <div className={styles.meta}>
              <Badge>{dealership.segment}</Badge>
              <span className={styles.metaItem}>{dealership.origin}</span>
              <time className={styles.metaItem} dateTime={dealership.announcedOn}>
                {dealership.announcedLabel}
              </time>
            </div>
          </div>
        </div>

        <RevealBlock>
          <figure className={styles.heroFigure}>
            {/* First block on the page is above the fold on most screens, so it
                gets the priority hint rather than lazy-loading. */}
            <Image
              src={dealership.hero.src}
              alt={dealership.hero.alt}
              width={dealership.hero.width}
              height={dealership.hero.height}
              sizes="(min-width: 1024px) 1400px, 100vw"
              priority={index === 0}
              className={styles.heroImage}
            />
          </figure>
        </RevealBlock>

        <div className={styles.prose}>
          <h3 className={`display-3 ${styles.headline}`}>{dealership.headline}</h3>
          <p className={`body-lg ${styles.lede}`}>{dealership.lede}</p>
          {dealership.paragraphs.map((paragraph) => (
            <p key={paragraph} className="body-base">
              {paragraph}
            </p>
          ))}
          <p className={styles.source}>{dealership.source}</p>
        </div>

        <RevealBlock className={styles.specsBlock}>
          <h4 className={styles.asideTitle}>Specification</h4>
          <dl className={styles.specs}>
            {dealership.specs.map((spec) => (
              <div key={spec.label} className={styles.specRow}>
                <dt className={styles.specLabel}>{spec.label}</dt>
                <dd className={styles.specValue}>{spec.value}</dd>
              </div>
            ))}
          </dl>
        </RevealBlock>

        <div className={styles.highlights}>
          {dealership.highlights.map((group) => (
            <RevealBlock key={group.title} className={styles.highlightGroup}>
              <h4 className={styles.asideTitle}>{group.title}</h4>
              <ul className={styles.highlightList}>
                {group.items.map((item) => (
                  <li key={item} className={styles.highlightItem}>
                    <svg
                      className={styles.tick}
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M2.5 8.5l3.5 3.5 7.5-8"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </RevealBlock>
          ))}
        </div>

        {dealership.gallery.length > 0 && (
          <div className={styles.gallery}>
            {dealership.gallery.map((image) => (
              <RevealBlock key={image.src}>
                {/* Fixed 4:3 frames: the source photos are a mix of ratios,
                    so filling keeps the row aligned along the bottom. */}
                <figure className={styles.galleryFigure}>
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className={styles.galleryImage}
                  />
                </figure>
              </RevealBlock>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
