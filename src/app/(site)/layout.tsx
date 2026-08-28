import type { ReactNode } from "react";
import { CompareProvider } from "@/providers/CompareProvider";
import { TopBar } from "@/components/common/TopBar";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { CompareBar } from "@/components/common/CompareBar";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <CompareProvider>
      <TopBar />
      <Navbar />
      <main>{children}</main>
      <Footer />
      <CompareBar />
    </CompareProvider>
  );
}
