import styles from "./EmptyState.module.css";

export function EmptyState({
  title = "No Vehicles Found",
  description = "Try adjusting your filters, or check back soon — our inventory is updated regularly.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className={styles.empty}>
      <span className={styles.title}>{title}</span>
      <p className={styles.description}>{description}</p>
    </div>
  );
}
