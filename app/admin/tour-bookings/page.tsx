import type { Metadata } from "next";
import { AdminTourBookingsPanel } from "@/components/admin/admin-tour-bookings-panel";

export const metadata: Metadata = {
  title: "Admin · Tour Bookings",
  robots: { index: false, follow: false },
};

export default function AdminTourBookingsPage() {
  return (
    <main className="min-h-svh bg-foam">
      <AdminTourBookingsPanel />
    </main>
  );
}
