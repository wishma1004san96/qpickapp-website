import type { Metadata } from "next";
import { PageShell } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "Drive",
  description:
    "Drive with Q Pick — clear earnings, fair dispatch, and tools built for Sri Lanka’s roads.",
};

export default function DrivePage() {
  return (
    <PageShell
      title="Drive with dignity"
      description="Clear earnings, fair dispatch, and a product designed for the roads you know — from Colombo arteries to highland hairpins."
      primaryCta={{ href: "/support", label: "Apply to drive" }}
      secondaryCta={{ href: "/safety", label: "Our standards" }}
    >
      <ul className="max-w-xl space-y-3 text-ink-muted">
        <li>Transparent trip earnings and weekly summaries</li>
        <li>Dispatch that respects distance, ratings, and fairness</li>
        <li>Support when something goes wrong on the road</li>
      </ul>
    </PageShell>
  );
}
