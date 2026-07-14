"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useMessages,
  useTranslations,
} from "@/components/i18n/locale-provider";
import { PageShell } from "@/components/marketing/page-shell";
import { destinations } from "@/lib/destinations";

export function DestinationsContent() {
  const t = useTranslations();
  const messages = useMessages();

  return (
    <PageShell
      title={t("pages.destinations.title")}
      description={t("pages.destinations.description")}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {destinations.map((d) => {
          const copy = messages.destinations[d.slug];
          return (
            <Link
              key={d.slug}
              href={`/destinations/${d.slug}`}
              className="group overflow-hidden rounded-[var(--radius-lg)] border border-mist bg-paper"
            >
              <div className="relative aspect-[16/10]">
                <Image
                  src={d.image}
                  alt={copy.imageAlt}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 ease-[var(--ease-cinematic)] group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-5">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ink-soft">
                  {copy.region}
                </p>
                <h2 className="mt-1 font-display text-2xl text-ink">{copy.name}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {copy.summary}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </PageShell>
  );
}
