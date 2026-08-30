"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { NavDropdown } from "@/components/common/NavDropdown";
import { MobileMenu } from "@/components/common/MobileMenu";
import { Logo } from "@/components/common/Logo";
import { NAV_LINKS } from "@/data/navigation";
import { SITE } from "@/data/site";
import { NAV_HEIGHT_PX } from "@/lib/constants";
import { useCompare } from "@/providers/CompareProvider";
import { cn } from "@/lib/utils";
import styles from "./Navbar.module.css";

export function Navbar() {
  const [scrolled, setScrolled] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { ids } = useCompare();
  const pathname = usePathname();

  // Re-runs on every route change: the (site) layout persists across
  // navigation, so without `pathname` as a dependency this would only ever
  // check for #hero once, on the very first page the visitor lands on.
  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) {
      // No IntersectionObserver applies on this page — reset explicitly so a
      // page without a hero doesn't inherit "not scrolled" from the last one.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScrolled(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { rootMargin: `-${NAV_HEIGHT_PX}px 0px 0px 0px`, threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className={cn(styles.navbar, scrolled && styles.scrolled)}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} aria-label={SITE.name}>
          <Logo priority />
        </Link>

        <nav className={styles.links}>
          {NAV_LINKS.map((link) => (
            <div key={link.href} className={styles.navItem}>
              <Link href={link.href} className={styles.navLink}>
                {link.label}
              </Link>
              {"dropdown" in link && link.dropdown && <NavDropdown items={link.dropdown} />}
            </div>
          ))}
        </nav>

        <div className={styles.right}>
          <Link href="/compare" className={styles.compareLink}>
            Compare
            {ids.length > 0 && <span className={styles.compareCount}>{ids.length}</span>}
          </Link>

          <button
            type="button"
            className={styles.hamburger}
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}
      </AnimatePresence>
    </header>
  );
}
