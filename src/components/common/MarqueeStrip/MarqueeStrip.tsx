"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Logo } from "@/components/common/Logo";
import styles from "./MarqueeStrip.module.css";

/** A wordmark is dropped in after every this-many brand names. */
const LOGO_EVERY = 3;

type Entry = { kind: "text"; value: string } | { kind: "logo" };

function buildSequence(items: string[]): Entry[] {
  const sequence: Entry[] = [];

  items.forEach((item, index) => {
    sequence.push({ kind: "text", value: item });
    if ((index + 1) % LOGO_EVERY === 0) sequence.push({ kind: "logo" });
  });

  // Guarantees the wordmark shows up even for a very short brand list.
  if (sequence.at(-1)?.kind !== "logo") sequence.push({ kind: "logo" });

  return sequence;
}

export function MarqueeStrip({ items }: { items: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const sequence = buildSequence(items);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // The track renders the sequence twice and every entry carries its own
    // trailing margin, so both runs are exactly the same width and -50% lands
    // on the identical copy with no visible seam.
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

  const doubled = [...sequence, ...sequence];

  return (
    <div className={styles.strip} aria-hidden="true">
      <div ref={trackRef} className={styles.track}>
        {doubled.map((entry, index) => (
          <span
            key={`${entry.kind}-${entry.kind === "text" ? entry.value : ""}-${index}`}
            className={styles.item}
          >
            {entry.kind === "text" ? (
              entry.value
            ) : (
              <Logo className={styles.logoMark} />
            )}
            <span className={styles.dot} />
          </span>
        ))}
      </div>
    </div>
  );
}
