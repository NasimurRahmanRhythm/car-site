import { Button } from "@/components/common/Button";
import { SITE } from "@/data/site";
import styles from "./CarBookingPanel.module.css";

/**
 * The sidebar call to action on a car page.
 *
 * This replaces the old inquiry form: a visitor interested in a specific car
 * now books a viewing or a test drive rather than sending a message that
 * nobody had a screen to read.
 */
export function CarBookingPanel({ carName }: { carName: string }) {
  return (
    <aside className={styles.panel}>
      <h2 className={styles.heading}>Interested in this car?</h2>
      <p className={styles.copy}>
        Come and see the {carName} in person, or take it out on the road. Tell us when suits you
        and we&apos;ll confirm your slot by email.
      </p>

      <div className={styles.actions}>
        <Button href="/book-appointment" fullWidth>
          Book an Appointment
        </Button>
        <Button href="/book-test-drive" variant="secondary" fullWidth>
          Book a Test Drive
        </Button>
      </div>

      <a href={`tel:${SITE.phone.replace(/\s+/g, "")}`} className={styles.phone}>
        {SITE.phoneDisplay}
      </a>
    </aside>
  );
}
