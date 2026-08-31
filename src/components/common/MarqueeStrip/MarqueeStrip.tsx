"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Logo } from "@/components/common/Logo";
import styles from "./MarqueeStrip.module.css";

/** Enough wordmarks that one run is wider than any realistic viewport. */
const MARKS_PER_RUN = 14;

/** Seconds each wordmark takes to cross the strip. */
const SECONDS_PER_MARK = 4;

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
        duration: MARKS_PER_RUN * SECONDS_PER_MARK,
        ease: "none",
        repeat: -1,
      });
    }, track);

    return () => ctx.revert();
  }, []);

  const marks = Array.from({ length: MARKS_PER_RUN * 2 }, (_, index) => index);

  return (
    <div className={styles.strip} aria-hidden="true">
      <div ref={trackRef} className={styles.track}>
        {marks.map((index) => (
          <span key={index} className={styles.item}>
            <Logo className={styles.logoMark} />
            <span className={styles.dot} />
          </span>
        ))}
      </div>
    </div>
  );
}
