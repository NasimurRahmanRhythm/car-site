"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { COMPARE_STORAGE_KEY, MAX_COMPARE } from "@/lib/constants";

interface CompareContextValue {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  isFull: boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // One-time hydration from localStorage, which isn't available during SSR.
  // Rendering `[]` first and syncing here (rather than a lazy useState
  // initializer) keeps the initial client render matching the server HTML.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(COMPARE_STORAGE_KEY);
      if (stored) setIds(JSON.parse(stored));
    } catch {
      // ignore malformed storage
    } finally {
      setHydrated(true);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // storage unavailable — compare list simply won't persist
    }
  }, [ids, hydrated]);

  const value = useMemo<CompareContextValue>(
    () => ({
      ids,
      has: (id: string) => ids.includes(id),
      toggle: (id: string) =>
        setIds((current) =>
          current.includes(id)
            ? current.filter((existing) => existing !== id)
            : current.length < MAX_COMPARE
              ? [...current, id]
              : current
        ),
      remove: (id: string) =>
        setIds((current) => current.filter((existing) => existing !== id)),
      clear: () => setIds([]),
      isFull: ids.length >= MAX_COMPARE,
    }),
    [ids]
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare(): CompareContextValue {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
