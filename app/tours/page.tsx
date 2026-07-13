import type { Metadata } from "next";
import { PageShell } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "Tours",
  description:
    "Curated day trips and multi-stop island journeys with drivers who know Sri Lanka’s roads and rhythms.",
};

export default function ToursPage() {
  return (
    <PageShell
      title="Tours shaped for the island"
      description="Day trips and multi-stop journeys — tea country, fort towns, cultural triangle — with drivers who know timing, terrain, and guest comfort."
      primaryCta={{ href: "/destinations", label: "Browse destinations" }}
      secondaryCta={{ href: "/support", label: "Plan a journey" }}
    >
      <div className="grid gap-8 sm:grid-cols-2">
        {[
          {
            title: "Day charters",
            body: "Sunrise to sunset routes with flexible stops and a clear all-in fare.",
          },
          {
            title: "Multi-day",
            body: "Coast to highlands with the same trusted driver across your itinerary.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-[var(--radius-lg)] border border-mist bg-paper p-6"
          >
            <h2 className="text-lg font-medium text-ink">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.body}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
