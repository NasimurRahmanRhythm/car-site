import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { DEALERSHIPS } from "@/data/dealerships";
import styles from "./DealershipStrip.module.css";

export function DealershipStrip() {
  return (
    <section className={styles.section}>
      <Container>
        <SectionHeading
          eyebrow="New Appointments"
          heading="Two New Dealerships"
          description="Skyworth Auto pure electric city buses, and Mercedes-Benz Sprinter emergency ambulances — both now represented by VIP Motors."
        />

        <div className={styles.grid}>
          {DEALERSHIPS.map((dealership) => (
            <Link
              key={dealership.slug}
              href={`/dealerships#${dealership.slug}`}
              className={styles.card}
            >
              <div className={styles.imageWrap}>
                <Image
                  src={dealership.hero.src}
                  alt={dealership.hero.alt}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className={styles.image}
                />
              </div>

              <div className={styles.body}>
                <div className={styles.meta}>
                  <Badge>{dealership.segment}</Badge>
                  <time className={styles.date} dateTime={dealership.announcedOn}>
                    {dealership.announcedLabel}
                  </time>
                </div>
                <h3 className={styles.title}>{dealership.headline}</h3>
                <p className={styles.excerpt}>{dealership.lede}</p>
                <span className={styles.readMore}>Read More</span>
              </div>
            </Link>
          ))}
        </div>

        <div className={styles.footer}>
          <Button href="/dealerships" variant="secondary">
            View More
          </Button>
        </div>
      </Container>
    </section>
  );
}
