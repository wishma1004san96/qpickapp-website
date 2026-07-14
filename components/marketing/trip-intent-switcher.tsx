"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  useMessages,
  useTranslations,
} from "@/components/i18n/locale-provider";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { UIHeading, Prose } from "@/components/ui/typography";

type IntentId = "ride" | "airport" | "tour";

const INTENT_MEDIA: Record<
  IntentId,
  { href: string; image: string }
> = {
  ride: {
    href: "/ride",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85",
  },
  airport: {
    href: "/airport",
    image:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=1600&q=85",
  },
  tour: {
    href: "/tours",
    image:
      "https://images.unsplash.com/photo-1711797750174-c3750dd9d7c9?auto=format&fit=crop&w=1600&q=85",
  },
};

const INTENT_IDS = ["ride", "airport", "tour"] as const;

export function TripIntentSwitcher() {
  const t = useTranslations();
  const { tripIntent } = useMessages();
  const [active, setActive] = useState<IntentId>("ride");
  const current = tripIntent[active];
  const media = INTENT_MEDIA[active];

  return (
    <Reveal>
      <Container>
        <div className="mb-10 max-w-xl">
          <UIHeading>{t("tripIntent.heading")}</UIHeading>
          <Prose className="mt-4">{t("tripIntent.intro")}</Prose>
        </div>

        <div
          role="tablist"
          aria-label={t("tripIntent.tablistAria")}
          className="mb-8 flex gap-1 overflow-x-auto border-b border-mist pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {INTENT_IDS.map((id) => {
            const selected = id === active;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={selected}
                id={`intent-tab-${id}`}
                className={`relative min-h-11 shrink-0 px-4 text-sm font-medium transition-colors duration-[var(--duration-ui)] ${
                  selected ? "text-ink" : "text-ink-soft hover:text-ink-muted"
                }`}
                onClick={() => setActive(id)}
              >
                {tripIntent[id].label}
                <span
                  className={`absolute inset-x-3 -bottom-px h-0.5 origin-left bg-brand transition-transform duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] ${
                    selected ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          aria-labelledby={`intent-tab-${active}`}
          className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
        >
          <div className="order-2 lg:order-1">
            <h3 className="text-h3 font-medium text-ink">{current.title}</h3>
            <p className="mt-4 max-w-md text-ink-muted leading-relaxed">
              {current.body}
            </p>
            <Link
              href={media.href}
              className="mt-6 inline-flex min-h-11 items-center text-sm font-medium text-brand transition-colors hover:text-brand-deep"
            >
              {current.cta}
              <span aria-hidden="true" className="ml-2">
                →
              </span>
            </Link>
          </div>
          <div className="order-1 overflow-hidden rounded-[var(--radius-lg)] lg:order-2">
            <div className="relative aspect-[4/3] bg-mist sm:aspect-[16/11]">
              <Image
                key={media.image}
                src={media.image}
                alt={current.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover motion-safe:animate-[fade-in_var(--duration-ui)_var(--ease-cinematic)]"
              />
            </div>
          </div>
        </div>
      </Container>
    </Reveal>
  );
}
