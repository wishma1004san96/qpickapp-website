import type { Metadata } from "next";
import { AdminRideRequestsPanel } from "@/components/admin/admin-ride-requests-panel";

export const metadata: Metadata = {
  title: "Admin · Ride Requests",
  robots: { index: false, follow: false },
};

export default function AdminRideRequestsPage() {
  return (
    <main className="min-h-svh bg-foam">
      <AdminRideRequestsPanel />
    </main>
  );
}
