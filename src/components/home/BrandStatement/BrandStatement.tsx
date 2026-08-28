import { Container } from "@/components/common/Container";
import { RevealText } from "@/components/common/RevealText";
import { RevealBlock } from "@/components/common/RevealBlock";
import { CountUp } from "@/components/common/CountUp";
import { ABOUT } from "@/data/about";
import styles from "./BrandStatement.module.css";

export function BrandStatement() {
  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.layout}>
          <div>
            <span className="eyebrow">{ABOUT.eyebrow}</span>
            <RevealText
              as="h2"
              lines={["A House Built", "on Rare Machines"]}
              className={`display-2 ${styles.heading}`}
            />
          </div>

          <RevealBlock>
            <div className={styles.copy}>
              <p className="body-lg">{ABOUT.intro}</p>

              <div className={styles.stats}>
                {ABOUT.stats.map((stat) => (
                  <div key={stat.label}>
                    <div className={styles.statValue}>
                      <CountUp value={stat.value} />
                    </div>
                    <div className={styles.statLabel}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </RevealBlock>
        </div>
      </Container>
    </section>
  );
}
