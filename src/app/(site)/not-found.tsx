import { Button } from "@/components/common/Button";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.wrapper}>
      <span className={styles.code}>404</span>
      <h1 className={styles.heading}>Page Not Found</h1>
      <p className={styles.description}>
        The page you&apos;re looking for doesn&apos;t exist, or the vehicle may no longer be
        available.
      </p>
      <Button href="/inventory" variant="secondary">
        Browse Inventory
      </Button>
    </div>
  );
}
