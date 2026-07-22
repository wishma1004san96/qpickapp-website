import type { Metadata } from "next";
import { DriverDashboardPanel } from "@/components/driver-dashboard/driver-dashboard-panel";

export const metadata: Metadata = {
  title: "Driver Dashboard",
  robots: { index: false, follow: false },
};

export default function DriverDashboardPage() {
  return (
    <main className="min-h-svh bg-foam">
      <DriverDashboardPanel />
    </main>
  );
}
