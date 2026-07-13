import type { Metadata } from "next";
import { PageShell } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Q Pick privacy policy — how we collect, use, and protect your information.",
};

export default function PrivacyPage() {
  return (
    <PageShell
      title="Privacy"
      description="We collect only what we need to move you safely — and we treat trip data with care."
    >
      <div className="prose-shell max-w-2xl space-y-4 text-sm leading-relaxed text-ink-muted">
        <p>
          This page is a Phase 1 shell. Full legal copy will cover account data,
          location during active trips, payment processors, retention periods, and
          your rights under applicable Sri Lankan and international privacy law.
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
