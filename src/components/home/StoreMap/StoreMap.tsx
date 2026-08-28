"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { Container } from "@/components/common/Container";
import { SITE } from "@/data/site";
import styles from "./StoreMap.module.css";

const MapCanvas = dynamic(() => import("./MapCanvas").then((mod) => mod.MapCanvas), {
  ssr: false,
  loading: () => <div className={styles.fallback}>Loading map…</div>,
});

export function StoreMap() {
  // Arriving from another page via /#store-map: the browser resolves the hash
  // before this section has mounted, so the native jump misses. Re-run it here.
  useEffect(() => {
    if (window.location.hash !== "#store-map") return;

    const frame = requestAnimationFrame(() => {
      document.getElementById("store-map")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section id="store-map" className={styles.section}>
      <Container>
        <div className={styles.header}>
          <span className="eyebrow">Visit Us</span>
          <h2 className="display-2">{SITE.locationLabel}</h2>
        </div>

        <div className={styles.mapShell}>
          <MapCanvas />
        </div>
      </Container>
    </section>
  );
}
