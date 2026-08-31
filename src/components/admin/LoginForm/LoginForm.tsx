"use client";

import { useActionState } from "react";
import { loginAction, type LoginActionState } from "@/app/actions/auth";
import { Button } from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";
import { SITE } from "@/data/site";
import styles from "./LoginForm.module.css";

// Lives here rather than beside the action: a "use server" module may only
// export async functions.
const initialLoginState: LoginActionState = { step: "email" };

export function LoginForm({ notice }: { notice?: string }) {
  const [state, formAction, isPending] = useActionState<LoginActionState, FormData>(
    loginAction,
    initialLoginState
  );

  const onCodeStep = state.step === "code";

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <span className={styles.logo}>{SITE.shortName} Admin</span>
        <p className={styles.subtitle}>
          {onCodeStep
            ? `We sent a 6-digit code to ${state.email}. It expires in 10 minutes.`
            : "Enter your admin email and we will send you a 6-digit sign-in code."}
        </p>

        <form action={formAction} className={styles.field}>
          {onCodeStep ? (
            <>
              {/* The action needs the address back; the field itself is gone. */}
              <input type="hidden" name="email" value={state.email ?? ""} />

              <label className={styles.label} htmlFor="login-code">
                Sign-in Code
              </label>
              <input
                id="login-code"
                name="code"
                type="text"
                required
                autoFocus
                // Together these give a numeric keypad on mobile and let iOS and
                // Android offer the code straight from the notification.
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                className={`${styles.input} ${styles.codeInput}`}
                placeholder="000000"
              />
            </>
          ) : (
            <>
              <label className={styles.label} htmlFor="login-email">
                Email
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                defaultValue={state.email ?? ""}
                className={styles.input}
                placeholder="you@example.com"
              />
            </>
          )}

          {/* Why the proxy redirected here — dropped as soon as the form is
              used, so it never sits next to a fresher message. */}
          {notice && !state.error && !state.notice && (
            <p className={`${styles.feedback} ${styles.info}`}>{notice}</p>
          )}
          {state.notice && (
            <p className={`${styles.feedback} ${styles.success}`}>{state.notice}</p>
          )}
          {state.error && (
            <p className={`${styles.feedback} ${styles.error}`}>{state.error}</p>
          )}

          <Button
            type="submit"
            name="intent"
            value={onCodeStep ? "verify" : "send"}
            disabled={isPending}
            fullWidth
          >
            {isPending ? <Spinner /> : onCodeStep ? "Sign In" : "Send Code"}
          </Button>

          {onCodeStep && (
            <div className={styles.secondaryActions}>
              {/* formNoValidate: neither button needs the code field filled in. */}
              <button
                type="submit"
                name="intent"
                value="resend"
                formNoValidate
                disabled={isPending}
                className={styles.linkButton}
              >
                Resend code
              </button>
              <button
                type="submit"
                name="intent"
                value="change-email"
                formNoValidate
                disabled={isPending}
                className={styles.linkButton}
              >
                Change email
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
