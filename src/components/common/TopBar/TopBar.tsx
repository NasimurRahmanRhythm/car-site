"use client";

import type { MouseEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SITE } from "@/data/site";
import styles from "./TopBar.module.css";

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLocationClick(event: MouseEvent) {
    event.preventDefault();
    if (pathname === "/") {
      // scroll-margin-top on the target section (see StoreMap.module.css)
      // keeps this clear of the sticky nav — no manual offset needed.
      document.getElementById("store-map")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      router.push("/#store-map");
    }
  }

  return (
    <div className={styles.bar}>
      <button type="button" className={styles.locationButton} onClick={handleLocationClick}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M8 1.5c-2.5 0-4.5 2-4.5 4.5 0 3.2 4.5 8.5 4.5 8.5s4.5-5.3 4.5-8.5c0-2.5-2-4.5-4.5-4.5z"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        <span>{SITE.locationLabel}</span>
      </button>

      <div className={styles.right}>
        <a href={`tel:${SITE.phone.replace(/\s+/g, "")}`} className={styles.phone}>
          {SITE.phoneDisplay}
        </a>
        <div className={styles.social}>
          <a
            href={SITE.social.instagram}
            className={styles.socialLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
            </svg>
          </a>
          <a
            href={SITE.social.facebook}
            className={styles.socialLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M14 8.5h2.5V5H14c-2.2 0-4 1.8-4 4v2H8v3.5h2V22h3.5v-7.5h2.4l.6-3.5h-3V9c0-.6.4-1 1-1z"
                fill="currentColor"
              />
            </svg>
          </a>
          <a
            href={SITE.social.youtube}
            className={styles.socialLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="2" y="5" width="20" height="14" rx="4" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.5 9.5l5 2.5-5 2.5z" fill="currentColor" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
