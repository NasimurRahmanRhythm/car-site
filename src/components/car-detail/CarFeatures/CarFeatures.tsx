import styles from "./CarFeatures.module.css";

export function CarFeatures({ features }: { features: string[] }) {
  if (features.length === 0) return null;

  return (
    <div className={styles.grid}>
      {features.map((feature) => (
        <div key={feature} className={styles.item}>
          <svg
            className={styles.icon}
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2.5 8.5l3.5 3.5 7.5-8"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{feature}</span>
        </div>
      ))}
    </div>
  );
}
