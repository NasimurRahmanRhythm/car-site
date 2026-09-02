"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { NAV_LINKS } from "@/data/navigation";
import { SITE } from "@/data/site";
import styles from "./MobileMenu.module.css";

// pointerEvents isn't animatable, so Motion applies it the instant each
// variant becomes active rather than over the transition duration — this
// keeps the fading-out overlay from swallowing taps (e.g. re-opening the
// menu) meant for whatever's underneath during its exit fade.
const overlayVariants: Variants = {
  hidden: { opacity: 0, pointerEvents: "none" },
  visible: { opacity: 1, pointerEvents: "auto", transition: { duration: 0.3 } },
  exit: { opacity: 0, pointerEvents: "none", transition: { duration: 0.25 } },
};

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
  exit: {},
};

const itemVariants: Variants = {
  hidden: { y: 24, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { y: 12, opacity: 0, transition: { duration: 0.2 } },
};

export function MobileMenu({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className={styles.overlay}
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className={styles.header}>
        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close menu">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M2 2L18 18M18 2L2 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <motion.nav
        className={styles.nav}
        variants={listVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {NAV_LINKS.map((link) => (
          <motion.div key={link.href} variants={itemVariants}>
            <Link href={link.href} className={styles.link} onClick={onClose}>
              {link.label}
            </Link>
            {"dropdown" in link && link.dropdown && (
              <div className={styles.subLinks}>
                {link.dropdown.map((item) => (
                  <Link
                    key={item.value}
                    href={`/categories/${item.value}`}
                    className={styles.subLink}
                    onClick={onClose}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </motion.nav>

      <div className={styles.footer}>
        <a href={`tel:${SITE.phone.replace(/\s+/g, "")}`} className={styles.phone}>
          {SITE.phoneDisplay}
        </a>
      </div>
    </motion.div>
  );
}
