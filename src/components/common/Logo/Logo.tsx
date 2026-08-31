import Image from "next/image";
import { SITE } from "@/data/site";
import { cn } from "@/lib/utils";
import styles from "./Logo.module.css";

// The wordmark's own viewBox. CSS drives the rendered height and lets the
// width follow this ratio, so callers only ever set a height.
const INTRINSIC_WIDTH = 2516;
const INTRINSIC_HEIGHT = 637;

export function Logo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/images/vip-motors-logo.svg"
      alt={SITE.name}
      width={INTRINSIC_WIDTH}
      height={INTRINSIC_HEIGHT}
      priority={priority}
      // Vector art: the optimiser has nothing to gain here, and Next refuses
      // SVG through it by default.
      unoptimized
      className={cn(styles.logo, className)}
    />
  );
}
