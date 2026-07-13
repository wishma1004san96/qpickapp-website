import type { Metadata } from "next";
import { PageShell } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "Terms",
  description: "Q Pick terms of service for passengers, partners, and drivers.",
};

export default function TermsPage() {
  return (
    <PageShell
      title="Terms of service"
      description="The agreement that governs use of Q Pick services across rides, transfers, and tours."
    >
      <div className="max-w-2xl space-y-4 text-sm leading-relaxed text-ink-muted">
        <p>
          This page is a Phase 1 shell. Full terms will define passenger and driver
          obligations, cancellations, liability limits, acceptable use, and dispute
          resolution.
        </p>
        <p>
          Questions:{" "}
          <a href="mailto:support@qpick.lk" className="text-lagoon hover:text-lagoon-deep">
            support@qpick.lk
          </a>
        </p>
      </div>
    </PageShell>
  );
}
