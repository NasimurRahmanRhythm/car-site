import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./Container.module.css";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(styles.container, className)}>{children}</div>;
}
