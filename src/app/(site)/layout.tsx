import type { ReactNode } from "react";
import { CompareProvider } from "@/providers/CompareProvider";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { CompareBar } from "@/components/common/CompareBar";
import styles from "./layout.module.css";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <CompareProvider>
      <Navbar />
      <main className={styles.main}>{children}</main>
      <Footer />
      <CompareBar />
    </CompareProvider>
  );
}
