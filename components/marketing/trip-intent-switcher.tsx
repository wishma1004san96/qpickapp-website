"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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

const INTENT_MEDIA: Record<IntentId, { href: string; image: string }> = {
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
const EASE = [0.22, 1, 0.36, 1] as const;

export function TripIntentSwitcher() {
  const t = useTranslations();
  const { tripIntent } = useMessages();
  const [active, setActive] = useState<IntentId>("ride");
  const reduceMotion = useReducedMotion() ?? false;
  const current = tripIntent[active];
  const media = INTENT_MEDIA[active];

  return (
    <Reveal>
      <Container>
        <div className="mb-10 max-w-xl">
          <UIHeading className="text-balance">{t("tripIntent.heading")}</UIHeading>
          <Prose className="mt-4 text-pretty">{t("tripIntent.intro")}</Prose>
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
                className={`relative min-h-11 shrink-0 px-4 text-sm font-medium transition-colors duration-[var(--duration-ui)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35 ${
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
          <AnimatePresence mode="wait">
            <motion.div
              key={`${active}-copy`}
              className="order-2 lg:order-1"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <h3 className="text-h3 font-medium text-balance text-ink">
                {current.title}
              </h3>
              <p className="mt-4 max-w-md leading-relaxed text-pretty text-ink-muted">
                {current.body}
              </p>
              <Link
                href={media.href}
                className="mt-6 inline-flex min-h-11 items-center text-sm font-medium text-brand transition-colors hover:text-brand-deep focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35"
              >
                {current.cta}
                <span aria-hidden="true" className="ml-2">
                  →
                </span>
              </Link>
            </motion.div>
          </AnimatePresence>

          <div className="order-1 overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-ambient)] transition-shadow duration-[var(--duration-ui)] hover:shadow-[var(--shadow-lift)] lg:order-2">
            <div className="relative aspect-[4/3] bg-mist sm:aspect-[16/11]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={media.image}
                  className="absolute inset-0"
                  initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <Image
                    src={media.image}
                    alt={current.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Container>
    </Reveal>
  );
}
