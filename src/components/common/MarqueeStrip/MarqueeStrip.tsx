"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Logo } from "@/components/common/Logo";
import styles from "./MarqueeStrip.module.css";

/** Marques carried in the showroom, in the order they cycle through the strip. */
const BRANDS = [
  "ferrari",
  "bmw",
  "audi",
  "mercedes",
  "rollsroyce",
  "bentley",
  "toyota",
  "bugatti",
  "porsche",
] as const;

/** Car logos between one wordmark and the next. */
const BRANDS_PER_WORDMARK = 4;

/**
 * How long the track takes to travel one full run. The run is long, so this is
 * a pace rather than a per-item duration.
 */
const SECONDS_PER_RUN = 90;

type Item = { kind: "brand"; slug: string } | { kind: "wordmark" };

/**
 * One run of the strip.
 *
 * The nine brands are dealt out in groups of four with a wordmark after each
 * group, and the run is exactly long enough for both cycles to close at the
 * same point — nine brands into groups of four takes 36 logos, which is four
 * whole passes of the brand list and nine wordmarks. Ending on a boundary is
 * what lets the second copy of the run start identically, so the -50% loop has
 * no visible jump.
 */
function buildRun(): Item[] {
  const items: Item[] = [];

  for (let index = 0; index < BRANDS.length * BRANDS_PER_WORDMARK; index++) {
    items.push({ kind: "brand", slug: BRANDS[index % BRANDS.length] });
    if ((index + 1) % BRANDS_PER_WORDMARK === 0) items.push({ kind: "wordmark" });
  }

  return items;
}

export function MarqueeStrip() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // The track renders the run twice and every item carries its own trailing
    // margin, so both runs are exactly the same width and -50% lands on the
    // identical copy with no visible seam.
    const ctx = gsap.context(() => {
      gsap.to(track, {
        xPercent: -50,
        duration: SECONDS_PER_RUN,
        ease: "none",
        repeat: -1,
      });
    }, track);

    return () => ctx.revert();
  }, []);

  const run = buildRun();

  return (
    <div className={styles.strip} aria-hidden="true">
      <div ref={trackRef} className={styles.track}>
        {[...run, ...run].map((item, index) =>
          item.kind === "wordmark" ? (
            <span key={index} className={styles.item}>
              <Logo className={styles.logoMark} />
            </span>
          ) : (
            <span
              key={index}
              className={styles.brand}
              // Masked rather than drawn as an <img>: the source files are
              // solid black, and a mask lets each logo take the strip's own
              // colour instead of disappearing into the dark background.
              style={{
                maskImage: `url(/images/brands/${item.slug}.svg)`,
                WebkitMaskImage: `url(/images/brands/${item.slug}.svg)`,
              }}
            />
          )
        )}
      </div>
    </div>
  );
}
