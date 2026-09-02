"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RevealText } from "@/components/common/RevealText";
import { Button } from "@/components/common/Button";
import { SITE } from "@/data/site";
import styles from "./HeroVideo.module.css";

export function HeroVideo() {
  const heroRef = useRef<HTMLElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const videoWrap = videoWrapRef.current;
    if (!hero || !videoWrap) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      // CSS paints these hidden/offset for the animated path; with motion
      // reduced nothing will animate them, so clear the start state here.
      gsap.set(
        [videoWrap, `.${styles.overlay}`, `.${styles.eyebrow}`, `.${styles.tagline}`, `.${styles.ctas}`, `.${styles.scrollCue}`],
        { clearProps: "all" }
      );
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Intro: the video settles first, then copy arrives on top of it.
      const intro = gsap.timeline({ defaults: { ease: "expo.out" } });

      intro
        .fromTo(videoWrap, { scale: 1.14 }, { scale: 1, duration: 2.2 }, 0)
        .fromTo(`.${styles.overlay}`, { opacity: 0.4 }, { opacity: 1, duration: 1.6 }, 0)
        .fromTo(
          `.${styles.eyebrow}`,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 1 },
          0.3
        )
        .fromTo(
          `.${styles.tagline}`,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 1 },
          1.0
        )
        .fromTo(
          `.${styles.ctas}`,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 1 },
          1.15
        )
        .fromTo(
          `.${styles.scrollCue}`,
          { opacity: 0 },
          { opacity: 1, duration: 1 },
          1.4
        );

      // Scroll: video recedes, copy drifts up faster — a shallow depth effect.
      gsap.to(videoWrap, {
        opacity: 0.2,
        scale: 1.1,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
      });

      gsap.to(`.${styles.content}`, {
        y: -80,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
      });
    }, hero);

    return () => ctx.revert();
  }, []);

  return (
    <section id="hero" ref={heroRef} className={styles.hero}>
      <div ref={videoWrapRef} className={styles.videoWrap}>
        <video
          className={styles.video}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/hero-poster.jpg"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
      </div>
      <div className={styles.overlay} />

      <div className={styles.content}>
        <span className={`eyebrow ${styles.eyebrow}`}>{SITE.tagline}</span>
        <RevealText
          as="h1"
          lines={["Where Rare", "Machines", "Find a Home"]}
          className={`display-1 ${styles.heading}`}
          delay={0.45}
        />
        <p className={`body-lg ${styles.tagline}`}>
          Explore a curated collection of the world&apos;s most desirable automobiles,
          available for immediate viewing at our showroom.
        </p>
        <div className={styles.ctas}>
          <Button href="/inventory">Explore Inventory</Button>
          <Button href="/book-appointment" variant="secondary">
            Book an Appointment
          </Button>
          <Button href="/book-test-drive" variant="secondary">
            Book a Test Drive
          </Button>
        </div>
      </div>

      <div className={styles.scrollCue}>
        <span>Scroll</span>
        <span className={styles.scrollLine} />
      </div>
    </section>
  );
}
