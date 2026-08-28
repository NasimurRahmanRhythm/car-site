import { CONTACT } from "@/data/contact";
import { SITE } from "@/data/site";
import styles from "./ContactInfo.module.css";

export function ContactInfo() {
  return (
    <div className={styles.list}>
      <div className={styles.item}>
        <span className={styles.label}>Address</span>
        <span className={styles.value}>{SITE.address}</span>
      </div>

      <div className={styles.item}>
        <span className={styles.label}>Phone</span>
        <a href={`tel:${SITE.phone.replace(/\s+/g, "")}`} className={styles.value}>
          {SITE.phoneDisplay}
        </a>
      </div>

      <div className={styles.item}>
        <span className={styles.label}>Email</span>
        <a href={`mailto:${SITE.email}`} className={styles.value}>
          {SITE.email}
        </a>
      </div>

      <div className={styles.item}>
        <span className={styles.label}>Showroom Hours</span>
        {CONTACT.hours.map((entry) => (
          <div key={entry.day} className={styles.hoursRow}>
            <span>{entry.day}</span>
            <span>{entry.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
