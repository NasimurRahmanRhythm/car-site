import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "ghost";
type Size = "base" | "sm";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
}

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({
  variant = "primary",
  size = "base",
  fullWidth = false,
  className,
  ...props
}: ButtonProps) {
  const classes = cn(
    styles.button,
    styles[variant],
    size === "sm" && styles.sm,
    fullWidth && styles.fullWidth,
    className
  );

  if (props.href !== undefined) {
    const { href, children, ...anchorProps } = props;
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {children}
      </Link>
    );
  }

  const { children, ...buttonProps } = props;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
