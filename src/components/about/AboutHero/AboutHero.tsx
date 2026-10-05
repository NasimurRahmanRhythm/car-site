import { Container } from "@/components/common/Container";
import { RevealText } from "@/components/common/RevealText";
import type { AboutContent } from "@/types/about";
import styles from "./AboutHero.module.css";

export function AboutHero({ about }: { about: AboutContent }) {
  return (
    <section className={styles.hero}>
      <Container>
        <span className="eyebrow">{about.eyebrow}</span>
        <RevealText as="h1" lines={[about.heading]} className={`display-1 ${styles.heading}`} />
        <p className={`body-lg ${styles.intro}`}>{about.intro}</p>
      </Container>
    </section>
  );
}
