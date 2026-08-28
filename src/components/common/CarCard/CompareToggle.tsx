"use client";

import { useCompare } from "@/providers/CompareProvider";
import { cn } from "@/lib/utils";
import styles from "./CompareToggle.module.css";

export function CompareToggle({ carId }: { carId: string }) {
  const { has, toggle, isFull } = useCompare();
  const active = has(carId);
  const disabled = !active && isFull;

  return (
    <button
      type="button"
      className={cn(styles.button, active && styles.active)}
      aria-pressed={active}
      aria-label={active ? "Remove from compare" : "Add to compare"}
      disabled={disabled}
      title={disabled ? "Compare list is full" : "Add to compare"}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(carId);
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        {active ? (
          <path
            d="M13.5 4.5L6.5 11.5L2.5 7.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M8 2.5V13.5M2.5 8H13.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        )}
      </svg>
    </button>
  );
}
