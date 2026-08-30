import Image from "next/image";
import { SITE } from "@/data/site";
import { cn } from "@/lib/utils";
import styles from "./Logo.module.css";

// Intrinsic size of the source file. CSS drives the rendered height and lets
// the width follow the aspect ratio, so callers only ever set a height.
const INTRINSIC_WIDTH = 417;
const INTRINSIC_HEIGHT = 105;

export function Logo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/images/vip-motors-logo.png"
      alt={SITE.name}
      width={INTRINSIC_WIDTH}
      height={INTRINSIC_HEIGHT}
      priority={priority}
      // Never rendered wider than the footer's ~145px, so cap what the
      // optimizer hands out instead of shipping a 1080px wordmark.
      sizes="160px"
      className={cn(styles.logo, className)}
    />
  );
}
