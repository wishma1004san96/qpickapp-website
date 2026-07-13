import type { Metadata } from "next";
import { PageShell } from "@/components/marketing/page-shell";
import { PartnerLogoRow } from "@/components/marketing/partner-logo-row";

export const metadata: Metadata = {
  title: "Partners",
  description:
    "Partner with Q Pick for hotel, villa, and corporate guest transfers under one trusted standard.",
};

export default function PartnersPage() {
  return (
    <PageShell
      title="Partners who move guests well"
      description="Hotels, villas, and corporates — white-glove transfers your front desk can trust, under a shared Q Pick standard."
      primaryCta={{ href: "/support", label: "Talk to partnerships" }}
      secondaryCta={{ href: "/airport", label: "Airport product" }}
    >
      <p className="max-w-2xl text-ink-muted leading-relaxed">
        Guest arrival links, scheduled transfers, and operational visibility —
        designed so hospitality teams spend less time coordinating WhatsApp fleets
        and more time hosting.
      </p>
      <div className="mt-10">
        <p className="mb-4 text-xs font-mono tracking-[0.16em] text-ink-soft uppercase">
          Built for hospitality
        </p>
        <PartnerLogoRow />
      </div>
    </PageShell>
  );
}
