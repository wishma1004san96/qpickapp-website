"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { useTranslations } from "@/components/i18n/locale-provider";
import { Container } from "@/components/ui/container";
import { UIHeading, Prose } from "@/components/ui/typography";
import { destinations } from "@/lib/destinations";

const EASE = [0.22, 1, 0.36, 1] as const;

export function DestinationStrip() {
  const t = useTranslations();
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <Reveal>
      <div className="bg-map-void py-[var(--section-y-sm)] text-foam sm:py-[var(--section-y-md)] lg:py-[var(--section-y-lg)]">
        <Container>
          <div className="mb-10 max-w-xl">
            <UIHeading className="text-foam text-balance">
              {t("destinationStrip.heading")}
            </UIHeading>
            <Prose className="mt-4 text-foam/70 text-pretty">
              {t("destinationStrip.intro")}
            </Prose>
          </div>
        </Container>

        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-5 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-6 lg:mx-auto lg:max-w-6xl lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:px-8 [&::-webkit-scrollbar]:hidden">
          {destinations.map((d, index) => (
            <motion.div
              key={d.slug}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.55,
                delay: reduceMotion ? 0 : index * 0.07,
                ease: EASE,
              }}
              className="min-w-[78vw] shrink-0 snap-center sm:min-w-[42vw] lg:min-w-0"
            >
              <Link
                href={`/destinations/${d.slug}`}
                className="group relative block overflow-hidden rounded-[var(--radius-lg)] outline-none focus-visible:ring-2 focus-visible:ring-brand-bright/50 focus-visible:ring-offset-2 focus-visible:ring-offset-map-void"
              >
                <div className="relative aspect-[3/4] bg-map-void shadow-[var(--shadow-ambient)] transition-[box-shadow,transform] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:shadow-[var(--shadow-lift)]">
                  <Image
                    src={d.image}
                    alt={t(`destinations.${d.slug}.imageAlt`)}
                    fill
                    sizes="(max-width: 1024px) 80vw, 25vw"
                    className="object-cover transition-transform duration-[900ms] ease-[var(--ease-cinematic)] motion-safe:group-hover:scale-[1.06]"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-map-void via-map-void/45 to-transparent opacity-90 transition-opacity duration-[var(--duration-ui)] group-hover:opacity-95"
                    aria-hidden="true"
                  />
                  <div className="absolute inset-x-0 bottom-0 space-y-2.5 p-5">
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-foam/60">
                      {t(`destinations.${d.slug}.region`)}
                    </p>
                    <p className="font-display text-2xl leading-tight text-balance text-foam">
                      {t(`destinations.${d.slug}.name`)}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[0.72rem] leading-snug text-foam/75">
                      <p>
                        <span className="text-foam/45">
                          {t("destinationStrip.travelTime")}
                        </span>{" "}
                        <span className="text-foam/85">
                          {t(`destinations.${d.slug}.travelTime`)}
                        </span>
                      </p>
                      <p>
                        <span className="text-foam/45">
                          {t("destinationStrip.startingPrice")}
                        </span>{" "}
                        <span className="font-medium text-foam">
                          {t(`destinations.${d.slug}.startingPrice`)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <Container className="mt-8">
          <Link
            href="/destinations"
            className="inline-flex min-h-11 items-center text-sm font-medium text-foam/80 transition-colors hover:text-foam focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright/40"
          >
            {t("destinationStrip.allDestinations")}
            <span aria-hidden="true" className="ml-2">
              →
            </span>
          </Link>
        </Container>
      </div>
    </Reveal>
  );
}
