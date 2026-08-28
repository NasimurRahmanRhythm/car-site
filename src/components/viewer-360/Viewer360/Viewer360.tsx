import styles from "./Viewer360.module.css";

export function Viewer360() {
  return (
    <div className={styles.placeholder}>
      <svg
        className={styles.icon}
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
      >
        <ellipse cx="24" cy="24" rx="20" ry="9" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M24 4v6M24 38v6M4 24h6M38 24h6"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
      <h2 className={styles.title}>360° Viewer Coming Soon</h2>
      <p className={styles.description}>
        Interactive 360° walkarounds for select vehicles are being prepared and will appear
        here shortly.
      </p>
    </div>
  );
}
