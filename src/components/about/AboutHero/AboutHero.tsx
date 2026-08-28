import { Container } from "@/components/common/Container";
import { RevealText } from "@/components/common/RevealText";
import { ABOUT } from "@/data/about";
import styles from "./AboutHero.module.css";

export function AboutHero() {
  return (
    <section className={styles.hero}>
      <Container>
        <span className="eyebrow">{ABOUT.eyebrow}</span>
        <RevealText as="h1" lines={[ABOUT.heading]} className={`display-1 ${styles.heading}`} />
        <p className={`body-lg ${styles.intro}`}>{ABOUT.intro}</p>
      </Container>
    </section>
  );
}
