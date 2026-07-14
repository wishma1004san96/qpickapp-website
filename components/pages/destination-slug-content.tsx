"use client";

import Image from "next/image";
import {
  useMessages,
  useTranslations,
} from "@/components/i18n/locale-provider";
import { PageShell } from "@/components/marketing/page-shell";
import { getDestination } from "@/lib/destinations";

export function DestinationSlugContent({ slug }: { slug: string }) {
  const t = useTranslations();
  const messages = useMessages();
  const destination = getDestination(slug);
  if (!destination) return null;

  const copy = messages.destinations[destination.slug];

  return (
    <PageShell
      title={copy.name}
      description={copy.summary}
      primaryCta={{
        href: "/ride",
        label: t("pages.destinationsSlug.primaryCta"),
      }}
      secondaryCta={{
        href: "/tours",
        label: t("pages.destinationsSlug.secondaryCta"),
      }}
    >
      <div className="overflow-hidden rounded-[var(--radius-lg)]">
        <div className="relative aspect-[21/9] min-h-56 bg-mist">
          <Image
            src={destination.image}
            alt={copy.imageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </div>
      <p className="mt-6 font-mono text-xs tracking-[0.16em] text-ink-soft">
        {copy.region}
      </p>
    </PageShell>
  );
}
