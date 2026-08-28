"use client";

import { useActionState } from "react";
import { submitInquiryAction, type InquiryActionState } from "@/app/actions/inquiry";
import { Button } from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";
import styles from "./InquiryForm.module.css";

const initialState: InquiryActionState | null = null;

export function InquiryForm({ carId, carName }: { carId?: string; carName?: string }) {
  const [state, formAction, isPending] = useActionState(submitInquiryAction, initialState);

  return (
    <form action={formAction} className={styles.form}>
      <h3 className={styles.heading}>{carName ? `Inquire About This Vehicle` : "Send a Message"}</h3>

      {carId && <input type="hidden" name="carId" value={carId} />}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="inquiry-name">
          Name
        </label>
        <input id="inquiry-name" name="name" type="text" required className={styles.input} />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="inquiry-email">
          Email
        </label>
        <input id="inquiry-email" name="email" type="email" required className={styles.input} />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="inquiry-phone">
          Phone
        </label>
        <input id="inquiry-phone" name="phone" type="tel" className={styles.input} />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="inquiry-message">
          Message
        </label>
        <textarea
          id="inquiry-message"
          name="message"
          className={styles.textarea}
          placeholder={carName ? `I'm interested in the ${carName}...` : undefined}
        />
      </div>

      {state?.success && (
        <p className={`${styles.feedback} ${styles.success}`}>
          Thank you — we&apos;ll be in touch shortly.
        </p>
      )}
      {state?.error && <p className={`${styles.feedback} ${styles.error}`}>{state.error}</p>}

      <Button type="submit" disabled={isPending} fullWidth>
        {isPending ? <Spinner /> : "Submit Inquiry"}
      </Button>
    </form>
  );
}
