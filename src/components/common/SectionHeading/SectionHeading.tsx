import { RevealText } from "@/components/common/RevealText";
import { cn } from "@/lib/utils";
import styles from "./SectionHeading.module.css";

interface SectionHeadingProps {
  eyebrow?: string;
  heading: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  heading,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn(styles.wrapper, align === "center" && styles.center, className)}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <RevealText as="h2" lines={[heading]} className={cn("display-2", styles.heading)} />
      {description && <p className={cn("body-lg", styles.description)}>{description}</p>}
    </div>
  );
}
