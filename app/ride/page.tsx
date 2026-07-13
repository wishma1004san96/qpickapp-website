import type { Metadata } from "next";
import { DriverTrustRow } from "@/components/marketing/driver-trust-row";
import { FarePreview } from "@/components/marketing/fare-preview";
import { PageShell } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "Ride",
  description:
    "Premium city and intercity rides across Sri Lanka with verified drivers and transparent fares.",
};

export default function RidePage() {
  return (
    <PageShell
      title="City and intercity rides"
      description="Request a verified Q Pick driver for Colombo streets or the long coastal run. See the fare before you confirm — then track every minute to the door."
      primaryCta={{ href: "/support", label: "Get started" }}
      secondaryCta={{ href: "/safety", label: "Safety standard" }}
    >
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            {
              title: "On-demand",
              body: "Pickup when you need it — airports, hotels, offices, and home.",
            },
            {
              title: "Scheduled",
              body: "Pre-book for early flights, meetings, and family airport runs.",
            },
            {
              title: "Intercity",
              body: "Colombo to Galle, Kandy, and beyond with drivers who know the roads.",
            },
          ].map((item) => (
            <div key={item.title} className="border-t border-mist pt-5">
              <h2 className="text-lg font-medium text-ink">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {item.body}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <FarePreview
            from="Colombo Fort"
            to="Galle Face"
            amount="1,450"
          />
          <DriverTrustRow name="Nuwan P." trips="2.1k" rating="4.97" />
        </div>
      </div>
    </PageShell>
  );
}
