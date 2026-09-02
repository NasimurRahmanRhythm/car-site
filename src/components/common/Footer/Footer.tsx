import Link from "next/link";
import { Container } from "@/components/common/Container";
import { Logo } from "@/components/common/Logo";
import { NAV_LINKS } from "@/data/navigation";
import { CATEGORIES } from "@/lib/constants";
import { SITE } from "@/data/site";
import styles from "./Footer.module.css";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <Logo className={styles.logo} />
            <p className={styles.blurb}>{SITE.tagline}</p>
          </div>

          <div>
            <p className={styles.colTitle}>Explore</p>
            <div className={styles.linkList}>
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className={styles.link}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className={styles.colTitle}>Inventory</p>
            <div className={styles.linkList}>
              {CATEGORIES.map((category) => (
                <Link
                  key={category.value}
                  href={`/categories/${category.value}`}
                  className={styles.link}
                >
                  {category.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className={styles.colTitle}>Contact</p>
            <div className={styles.linkList}>
              <span className={styles.link}>{SITE.address}</span>
              <a href={`tel:${SITE.phone.replace(/\s+/g, "")}`} className={styles.link}>
                {SITE.phoneDisplay}
              </a>
              <a href={`mailto:${SITE.email}`} className={styles.link}>
                {SITE.email}
              </a>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>
            © {year} {SITE.name}. All rights reserved.
          </span>
          <span>Prototype build</span>
        </div>
      </Container>
    </footer>
  );
}
