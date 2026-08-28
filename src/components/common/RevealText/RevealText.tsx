"use client";

import { useEffect, useRef, type ElementType } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DURATION, EASE, STAGGER } from "@/lib/animations";
import { cn } from "@/lib/utils";
import styles from "./RevealText.module.css";

interface RevealTextProps {
  lines: string[];
  as?: ElementType;
  className?: string;
  lineClassName?: string;
  delay?: number;
}

export function RevealText({
  lines,
  as: Tag = "div",
  className,
  lineClassName,
  delay = 0,
}: RevealTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);
    const lineEls = container.querySelectorAll<HTMLElement>(`.${styles.line}`);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineEls,
        // `y: 0` is load-bearing: GSAP parses the CSS `translateY(110%)`
        // start state into its px-based `y` slot, then adds `yPercent` on
        // top. Without pinning y to 0, animating yPercent to 0 still leaves
        // that parsed offset behind and the text never becomes visible.
        { yPercent: 110, y: 0 },
        {
          yPercent: 0,
          y: 0,
          duration: DURATION.slow,
          ease: EASE.expo,
          stagger: STAGGER,
          delay,
          scrollTrigger: {
            trigger: container,
            start: "top 85%",
          },
        }
      );
    }, container);

    return () => ctx.revert();
  }, [delay]);

  return (
    <Tag className={className}>
      <span ref={containerRef} className={styles.wrapper}>
        {lines.map((line, index) => (
          <span className={styles.lineMask} key={`${index}-${line}`}>
            <span className={cn(styles.line, lineClassName)}>{line}</span>
          </span>
        ))}
      </span>
    </Tag>
  );
}
