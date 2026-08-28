"use client";

import { useActionState } from "react";
import { loginAction, type LoginActionState } from "@/app/actions/auth";
import { Button } from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";
import { SITE } from "@/data/site";
import styles from "./LoginForm.module.css";

const initialState: LoginActionState | null = null;

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <span className={styles.logo}>{SITE.shortName} Admin</span>
        <p className={styles.subtitle}>
          Enter your admin email to receive a secure sign-in link.
        </p>

        <form action={formAction} className={styles.field}>
          <label className={styles.label} htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            required
            className={styles.input}
            placeholder="you@example.com"
          />

          {state?.success && (
            <p className={`${styles.feedback} ${styles.success}`}>
              Check your inbox for a sign-in link.
            </p>
          )}
          {state?.error && <p className={`${styles.feedback} ${styles.error}`}>{state.error}</p>}

          <Button type="submit" disabled={isPending} fullWidth>
            {isPending ? <Spinner /> : "Send Login Link"}
          </Button>
        </form>
      </div>
    </div>
  );
}
