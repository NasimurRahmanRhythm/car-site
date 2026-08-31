"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPendingAppointmentCountAction } from "@/app/actions/appointment";
import styles from "./AdminNav.module.css";

/** How often to re-check while the tab is open. */
const POLL_MS = 60_000;

/**
 * The Appointments nav link with a live count of unactioned requests.
 *
 * Server-rendered first (via `initialCount`) so there is no flash of a missing
 * badge, then kept current on the client — new requests come from visitors, so
 * nothing on the admin's side would otherwise trigger a re-render.
 */
export function AppointmentsLink({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  const [lastServerCount, setLastServerCount] = useState(initialCount);

  // Adopt the server's number whenever the layout re-renders with a new one —
  // that is how a confirm or cancel updates the badge immediately instead of at
  // the next poll. Adjusted during render rather than in an effect, so it does
  // not cost a second render pass.
  if (initialCount !== lastServerCount) {
    setLastServerCount(initialCount);
    setCount(initialCount);
  }

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      try {
        const next = await getPendingAppointmentCountAction();
        if (!cancelled) setCount(next);
      } catch {
        // Offline or a dropped request — keep the last known count and let the
        // next tick sort it out.
      }
    };

    const interval = setInterval(refresh, POLL_MS);

    // The highest-value trigger: someone comes back to a tab they left open and
    // sees the badge already up to date.
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <Link href="/admin/appointments" className={styles.link}>
      Appointments
      {count > 0 && (
        <span
          className={styles.badge}
          // The number alone reads as "12" to a screen reader; spell it out.
          aria-label={`${count} new appointment ${count === 1 ? "request" : "requests"}`}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
