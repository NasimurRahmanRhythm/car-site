import { Container } from "@/components/common/Container";
import { RevealText } from "@/components/common/RevealText";
import { Button } from "@/components/common/Button";
import { SITE } from "@/data/site";
import styles from "./ContactCta.module.css";

export function ContactCta() {
  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.panel}>
          <RevealText
            as="h2"
            lines={["Have Any Question?"]}
            className={`display-2 ${styles.heading}`}
          />

          <div className={styles.actions}>
            <a href={`tel:${SITE.phone.replace(/\s+/g, "")}`} className={styles.phone}>
              {SITE.phoneDisplay}
            </a>
            <Button href="/contact-us" variant="secondary">
              Contact Us
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
