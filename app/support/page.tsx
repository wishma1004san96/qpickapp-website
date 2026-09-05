import type { Metadata } from "next";
import { SupportContent } from "@/components/pages/support-content";

export const metadata: Metadata = {
  title: {
    absolute: "Quick Pick Support",
  },
  description:
    "Get help with Quick Pick bookings, accounts, payments, trips, drivers, and other support needs.",
};

export default function SupportPage() {
  return <SupportContent />;
}
