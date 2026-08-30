"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { NewsCard } from "@/components/common/NewsCard";
import type { NewsPost } from "@/types/news";
import styles from "./NewsStrip.module.css";

/** Seconds a single card spends crossing the strip. */
const SECONDS_PER_CARD = 7;

export function NewsMarquee({ posts }: { posts: NewsPost[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  // With only a handful of posts the track can end up narrower than the
  // viewport, which would leave a visible gap mid-loop — repeat the list until
  // it is comfortably wider, then render that run twice for the seamless wrap.
  const run: NewsPost[] = [];
  while (run.length < Math.max(posts.length, 6)) run.push(...posts);
  const slides = [...run, ...run];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // Every slide carries its own trailing margin rather than the track
      // using `gap`, so the two runs are exactly the same width and -50%
      // lands on the duplicate with no seam.
      tweenRef.current = gsap.to(track, {
        xPercent: -50,
        duration: run.length * SECONDS_PER_CARD,
        ease: "none",
        repeat: -1,
      });
    }, track);

    return () => {
      ctx.revert();
      tweenRef.current = null;
    };
  }, [run.length]);

  return (
    <div
      className={styles.viewport}
      onMouseEnter={() => tweenRef.current?.pause()}
      onMouseLeave={() => tweenRef.current?.resume()}
      onFocusCapture={() => tweenRef.current?.pause()}
      onBlurCapture={() => tweenRef.current?.resume()}
    >
      <div ref={trackRef} className={styles.track}>
        {slides.map((post, index) => {
          // The second run only exists to cover the wrap — keep it out of the
          // accessibility tree and out of the tab order.
          const isDuplicate = index >= run.length;
          return (
            <div
              key={`${post.id}-${index}`}
              className={styles.slide}
              aria-hidden={isDuplicate || undefined}
              inert={isDuplicate || undefined}
            >
              <NewsCard post={post} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
