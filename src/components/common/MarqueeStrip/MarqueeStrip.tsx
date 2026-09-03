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

/**
 * Units in one run. A unit is the whole brand list followed by the house
 * wordmark, so every marque is seen once between one VIP Motors mark and the
 * next. The track holds two identical runs and slides by exactly one of them,
 * so a run has to stay wider than the viewport or a gap opens at the trailing
 * edge — four units clears an ultrawide desktop.
 */
const UNITS_PER_RUN = 4;

/**
 * How long the track takes to travel one full run. The run is long, so this is
 * a pace rather than a per-item duration.
 */
const SECONDS_PER_RUN = 120;

type Item = { kind: "brand"; slug: string } | { kind: "wordmark" };

/**
 * One run of the strip: the unit above, repeated. Every run is built from whole
 * units, so the second copy starts on exactly the same item as the first and
 * the -50% loop has no visible jump.
 */
function buildRun(): Item[] {
  const items: Item[] = [];

  for (let unit = 0; unit < UNITS_PER_RUN; unit++) {
    for (const slug of BRANDS) items.push({ kind: "brand", slug });
    items.push({ kind: "wordmark" });
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
