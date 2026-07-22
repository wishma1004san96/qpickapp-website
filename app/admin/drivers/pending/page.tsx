import type { Metadata } from "next";
import { AdminDriversPanel } from "@/components/admin/admin-drivers-panel";

export const metadata: Metadata = {
  title: "Pending Drivers",
  robots: { index: false, follow: false },
};

export default function AdminPendingDriversPage() {
  return (
    <main className="min-h-svh bg-foam">
      <AdminDriversPanel pendingOnly />
    </main>
  );
}
