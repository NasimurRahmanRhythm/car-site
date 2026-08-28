"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./MarqueeStrip.module.css";

export function MarqueeStrip({ items }: { items: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // The track renders the item list twice; translating by exactly -50%
    // lands on the identical second copy, so the loop has no visible seam.
    const ctx = gsap.context(() => {
      gsap.to(track, {
        xPercent: -50,
        duration: 28,
        ease: "none",
        repeat: -1,
      });
    }, track);

    return () => ctx.revert();
  }, []);

  const doubled = [...items, ...items];

  return (
    <div className={styles.strip} aria-hidden="true">
      <div ref={trackRef} className={styles.track}>
        {doubled.map((item, index) => (
          <span key={`${item}-${index}`} className={styles.item}>
            {item}
            <span className={styles.dot} />
          </span>
        ))}
      </div>
    </div>
  );
}
