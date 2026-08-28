import { cn } from "@/lib/utils";
import styles from "./Spinner.module.css";

export function Spinner({ className }: { className?: string }) {
  return <span className={cn(styles.spinner, className)} role="status" aria-label="Loading" />;
}
