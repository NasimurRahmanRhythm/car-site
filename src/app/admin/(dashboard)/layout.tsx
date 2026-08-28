import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin/AdminNav";

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdminNav />
      <main>{children}</main>
    </>
  );
}
