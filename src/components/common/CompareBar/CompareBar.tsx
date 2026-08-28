"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/common/Button";
import { useCompare } from "@/providers/CompareProvider";
import styles from "./CompareBar.module.css";

export function CompareBar() {
  const { ids, clear } = useCompare();

  return (
    <AnimatePresence>
      {ids.length > 0 && (
        <motion.div
          className={styles.bar}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className={styles.count}>
            <span className={styles.countNumber}>{ids.length}</span> car
            {ids.length > 1 ? "s" : ""} selected
          </span>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.clearButton}
              aria-label="Clear compare list"
              onClick={clear}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M1 1L13 13M13 1L1 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <Button
              href={`/compare?ids=${ids.join(",")}`}
              size="sm"
              variant="primary"
            >
              Compare Now
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
