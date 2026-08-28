import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./Badge.module.css";

type BadgeVariant = "default" | "available" | "reserved" | "sold" | "accent";

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        styles.badge,
        variant !== "default" && styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
