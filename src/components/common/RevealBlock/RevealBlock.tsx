"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DURATION, EASE } from "@/lib/animations";
import { cn } from "@/lib/utils";
import styles from "./RevealBlock.module.css";

interface RevealBlockProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}

export function RevealBlock({
  children,
  className,
  delay = 0,
  y = 40,
}: RevealBlockProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Hidden from first paint (SSR + pre-hydration) via inline style so the
  // GSAP reveal has something to visibly animate from. `y` varies per call
  // site, so this can't live in the CSS module — it's applied here instead.
  const hiddenStyle: CSSProperties = {
    transform: `translateY(${y}px)`,
    clipPath: "inset(0 0 100% 0)",
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      el.style.transform = "none";
      el.style.clipPath = "none";
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        {
          y,
          clipPath: "inset(0 0 100% 0)",
        },
        {
          y: 0,
          clipPath: "inset(0 0 0% 0)",
          duration: DURATION.base,
          ease: EASE.out,
          delay,
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [delay, y]);

  return (
    <div ref={ref} className={cn(styles.block, className)} style={hiddenStyle}>
      {children}
    </div>
  );
}
