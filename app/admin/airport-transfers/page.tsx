import type { Metadata } from "next";
import { AdminAirportTransfersPanel } from "@/components/admin/admin-airport-transfers-panel";

export const metadata: Metadata = {
  title: "Admin · Airport Transfers",
  robots: { index: false, follow: false },
};

export default function AdminAirportTransfersPage() {
  return (
    <main className="min-h-svh bg-foam">
      <AdminAirportTransfersPanel />
    </main>
  );
}
