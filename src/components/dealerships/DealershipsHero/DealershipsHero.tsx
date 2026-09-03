import { Container } from "@/components/common/Container";
import { RevealText } from "@/components/common/RevealText";
import { DEALERSHIPS, DEALERSHIPS_PAGE } from "@/data/dealerships";
import styles from "./DealershipsHero.module.css";

export function DealershipsHero() {
  return (
    <section className={styles.hero}>
      <Container>
        <span className="eyebrow">{DEALERSHIPS_PAGE.eyebrow}</span>
        <RevealText
          as="h1"
          lines={[DEALERSHIPS_PAGE.heading]}
          className={`display-1 ${styles.heading}`}
        />
        <p className={`body-lg ${styles.intro}`}>{DEALERSHIPS_PAGE.intro}</p>

        {/* Jump links: the two dealership blocks below are long, so this saves
            a visitor arriving for one of them from scrolling past the other. */}
        <nav className={styles.jumpLinks} aria-label="Dealerships on this page">
          {DEALERSHIPS.map((dealership) => (
            <a key={dealership.slug} href={`#${dealership.slug}`} className={styles.jumpLink}>
              {dealership.marque}
              <span className={styles.jumpSegment}>{dealership.segment}</span>
            </a>
          ))}
        </nav>
      </Container>
    </section>
  );
}
