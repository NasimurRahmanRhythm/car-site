import { Container } from "@/components/common/Container";
import { RevealBlock } from "@/components/common/RevealBlock";
import { ABOUT } from "@/data/about";
import styles from "./AboutStory.module.css";

export function AboutStory() {
  return (
    <section className={styles.section}>
      <Container>
        <RevealBlock>
          <div className={styles.paragraphs}>
            {ABOUT.paragraphs.map((paragraph) => (
              <p key={paragraph} className="body-lg">
                {paragraph}
              </p>
            ))}
          </div>
        </RevealBlock>

        <div className={styles.stats}>
          {ABOUT.stats.map((stat) => (
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
