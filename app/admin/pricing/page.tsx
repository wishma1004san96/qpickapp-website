import type { Metadata } from "next";
import { AdminPricingPanel } from "@/components/admin/admin-pricing-panel";

export const metadata: Metadata = {
  title: "Admin · Pricing",
  robots: { index: false, follow: false },
};

export default function AdminPricingPage() {
  return (
    <main className="min-h-svh bg-foam">
      <AdminPricingPanel />
    </main>
  );
}
