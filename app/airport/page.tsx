import type { Metadata } from "next";
import { PageShell } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "Airport",
  description:
    "Bandaranaike (CMB) airport transfers with meet-and-greet timing for hotels, villas, and guests.",
};

export default function AirportPage() {
  return (
    <PageShell
      title="Airport transfers with certainty"
      description="Land at CMB and move straight to your hotel or villa. Flight-aware timing, meet-and-greet options, and hosts kept in the loop from gate to door."
      primaryCta={{ href: "/support", label: "Request a transfer" }}
      secondaryCta={{ href: "/partners", label: "Hotel partners" }}
    >
      <ul className="max-w-2xl space-y-4 text-ink-muted">
        <li className="flex gap-3">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lagoon" />
          Flight tracking and buffer for immigration delays
        </li>
        <li className="flex gap-3">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lagoon" />
          Fixed or transparent transfer pricing before confirm
        </li>
        <li className="flex gap-3">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lagoon" />
          Child seats and luggage-friendly vehicles on request
        </li>
      </ul>
    </PageShell>
  );
}
