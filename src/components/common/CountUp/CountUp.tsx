"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import styles from "./CountUp.module.css";

interface CountUpProps {
  /** Full label, e.g. "500+" or "15" — digits are animated, the rest is kept. */
  value: string;
  className?: string;
}

export function CountUp({ value, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const match = value.match(/^(\D*)(\d+)(.*)$/);
    if (!match) return;

    const [, prefix, digits, suffix] = match;
    const target = Number(digits);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = value;
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const counter = { n: 0 };
    const ctx = gsap.context(() => {
      gsap.to(counter, {
        n: target,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%" },
        onUpdate: () => {
          el.textContent = `${prefix}${Math.round(counter.n)}${suffix}`;
        },
      });
    }, el);

    return () => ctx.revert();
  }, [value]);

  return (
    <span ref={ref} className={cn(styles.value, className)}>
      {value}
    </span>
  );
}
