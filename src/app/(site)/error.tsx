"use client";

import { useEffect } from "react";
import { Button } from "@/components/common/Button";
import styles from "./error.module.css";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.heading}>Something Went Wrong</h1>
      <p className={styles.description}>
        We couldn&apos;t load this page. Please try again, or return to the homepage.
      </p>
      <Button type="button" variant="secondary" onClick={reset}>
        Try Again
      </Button>
    </div>
  );
}
