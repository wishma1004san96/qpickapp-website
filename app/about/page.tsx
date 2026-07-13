import type { Metadata } from "next";
import { PageShell } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "About",
  description:
    "Q Pick is building the trusted private layer of movement across Sri Lanka — rides, airport transfers, and island journeys.",
};

export default function AboutPage() {
  return (
    <PageShell
      title="Built for how Sri Lanka moves"
      description="Q Pick is the trusted private layer of movement across the island — with the calm of a luxury concierge and the reliability of a modern mobility network."
      primaryCta={{ href: "/ride", label: "Book a ride" }}
      secondaryCta={{ href: "/drive", label: "Drive with us" }}
    >
      <div className="max-w-2xl space-y-4 text-ink-muted leading-relaxed">
        <p>
          We exist because fragmented WhatsApp fleets and generic global apps both
          miss what travellers and residents actually need: certainty, hospitality,
          and respect for place.
        </p>
        <p>
          Our design system, safety standard, and product surfaces — passenger,
          driver, and operations — share one language. Quiet technology. Human
          journeys.
        </p>
      </div>
    </PageShell>
  );
}
