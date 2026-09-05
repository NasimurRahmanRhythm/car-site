import Image from "next/image";
import { Container } from "@/components/common/Container";
import { RevealBlock } from "@/components/common/RevealBlock";
import type { AboutContent } from "@/types/about";
import styles from "./AboutStory.module.css";

export function AboutStory({ about }: { about: AboutContent }) {
  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.content}>
          <RevealBlock>
            <div className={styles.paragraphs}>
              {about.paragraphs.map((paragraph) => (
                <p key={paragraph} className="body-lg">
                  {paragraph}
                </p>
              ))}
            </div>
          </RevealBlock>

          <RevealBlock>
            <figure className={styles.showroom}>
              <Image
                src={about.showroom.src}
                alt={about.showroom.alt}
                width={about.showroom.width}
                height={about.showroom.height}
                sizes="(min-width: 1024px) 40vw, 100vw"
                className={styles.showroomImage}
              />
            </figure>
          </RevealBlock>
        </div>

        <div className={styles.stats}>
          {about.stats.map((stat) => (
            <RevealBlock key={stat.label}>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </RevealBlock>
          ))}
        </div>
      </Container>
    </section>
  );
}
