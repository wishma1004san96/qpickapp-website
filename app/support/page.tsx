import type { Metadata } from "next";
import { PageShell } from "@/components/marketing/page-shell";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Support",
  description: "Contact Q Pick support for rides, transfers, tours, and partner enquiries.",
};

export default function SupportPage() {
  return (
    <PageShell
      title="Support"
      description="We’re here for trip questions, partner enquiries, and moments that need a human."
    >
      <div className="grid max-w-2xl gap-8 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-medium text-ink">Email</h2>
          <a
            href={`mailto:${siteConfig.supportEmail}`}
            className="mt-2 inline-flex min-h-11 items-center text-lagoon hover:text-lagoon-deep"
          >
            {siteConfig.supportEmail}
          </a>
        </div>
        <div>
          <h2 className="text-sm font-medium text-ink">Emergency line</h2>
          <a
            href={`tel:${siteConfig.emergencyLine.replace(/\s/g, "")}`}
            className="mt-2 inline-flex min-h-11 items-center font-mono text-ink"
          >
            {siteConfig.emergencyLine}
          </a>
        </div>
      </div>
    </PageShell>
  );
}
