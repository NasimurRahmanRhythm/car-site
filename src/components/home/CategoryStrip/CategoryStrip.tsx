import Link from "next/link";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { CATEGORIES } from "@/lib/constants";
import styles from "./CategoryStrip.module.css";

export function CategoryStrip() {
  return (
    <section className={styles.section}>
      <Container>
        <SectionHeading eyebrow="Browse By" heading="Inventory Categories" />

        <div className={styles.grid}>
          {CATEGORIES.map((category, index) => (
            <Link
              key={category.value}
              href={`/categories/${category.value}`}
              className={styles.tile}
            >
              <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <span className={styles.label}>{category.label}</span>
              </div>
              <svg
                className={styles.arrow}
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M5 15L15 5M15 5H7M15 5V13"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
