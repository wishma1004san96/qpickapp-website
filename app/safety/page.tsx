import type { Metadata } from "next";
import { PageShell } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "Safety",
  description:
    "Q Pick safety standard — verified drivers, transparent pricing, trip sharing, support, and insurance.",
};

const faqs = [
  {
    q: "Are Q Pick drivers verified?",
    a: "Yes. Drivers complete identity, vehicle, and background checks before joining the network.",
  },
  {
    q: "Can I share my trip?",
    a: "Yes. Live trip sharing lets family, hosts, or hotel front desks follow your journey.",
  },
  {
    q: "What if I need help during a ride?",
    a: "In-trip support and a published emergency line are available for critical moments.",
  },
  {
    q: "Is there insurance on journeys?",
    a: "Coverage applies on every journey under the Q Pick standard.",
  },
] as const;

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

export default function SafetyPage() {
  return (
    <PageShell
      title="Safety is the baseline"
      description="Every Q Pick journey is built on verification, transparency, and reachable support — not marketing badges."
      primaryCta={{ href: "/support", label: "Contact support" }}
      secondaryCta={{ href: "/ride", label: "Book a ride" }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="max-w-2xl space-y-8">
        {[
          {
            title: "Verified fleet",
            body: "Identity, vehicle, and background checks before a driver joins the network.",
          },
          {
            title: "Trip sharing",
            body: "Share live status with family, hosts, or hotel front desks.",
          },
          {
            title: "Always reachable",
            body: "In-trip support and a published emergency line for critical moments.",
          },
          {
            title: "Insurance",
            body: "Coverage on every journey under the Q Pick standard.",
          },
        ].map((item) => (
          <div key={item.title} className="border-t border-mist pt-6">
            <h2 className="text-lg font-medium text-ink">{item.title}</h2>
            <p className="mt-2 text-ink-muted leading-relaxed">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 max-w-2xl">
        <h2 className="text-h3 font-medium text-ink">Common questions</h2>
        <dl className="mt-6 divide-y divide-mist border-y border-mist">
          {faqs.map((item) => (
            <div key={item.q} className="py-5">
              <dt className="font-medium text-ink">{item.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink-muted">
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </PageShell>
  );
}
