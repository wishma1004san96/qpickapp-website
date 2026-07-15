"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  useMessages,
  useTranslations,
} from "@/components/i18n/locale-provider";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Homepage teaser for private tours — drives to `/tours` (full planner lives there).
 */
export function PrivateToursPreview() {
  const t = useTranslations();
  const { privateToursPreview } = useMessages();
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section
      className="relative overflow-hidden bg-map-void py-[var(--section-y-sm)] text-foam sm:py-[var(--section-y-md)] lg:py-[var(--section-y-lg)]"
      aria-labelledby="private-tours-preview-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_90%_15%,rgb(0_98_250_/_0.16),transparent_55%),radial-gradient(50%_40%_at_5%_90%,rgb(1_147_251_/_0.1),transparent_50%)]"
        aria-hidden="true"
      />

      <Container className="relative z-[1]">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <p className="inline-flex rounded-full border border-foam/20 bg-foam/10 px-3.5 py-1.5 font-mono text-[0.6875rem] tracking-[0.18em] text-brand-bright uppercase backdrop-blur-md">
              {t("privateToursPreview.eyebrow")}
            </p>
            <h2
              id="private-tours-preview-heading"
              className="mt-5 max-w-[14ch] font-display text-[clamp(1.85rem,4vw,3rem)] leading-[1.1] font-semibold tracking-tight text-balance"
            >
              {t("privateToursPreview.heading")}
            </h2>
            <p className="mt-5 max-w-[40ch] text-base leading-relaxed text-pretty text-foam/65 sm:text-lg">
              {t("privateToursPreview.sub")}
            </p>
            <ul className="mt-7 space-y-3">
              {privateToursPreview.points.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-foam/80 sm:text-[0.95rem]"
                >
                  <span
                    className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-brand/25 text-brand-bright"
                    aria-hidden="true"
                  >
                    <svg viewBox="0 0 16 16" width="10" height="10" fill="none">
                      <path
                        d="M3.5 8.2 L6.4 11.1 L12.5 4.8"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="text-pretty">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/tours" size="lg" className="max-w-full">
                {t("privateToursPreview.primary")}
              </ButtonLink>
              <ButtonLink
                href="/tours"
                size="lg"
                variant="secondary"
                className="max-w-full border-foam/25 bg-foam/10 text-foam hover:border-foam/40 hover:bg-foam/16 hover:text-foam"
              >
                {t("privateToursPreview.secondary")}
              </ButtonLink>
            </div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.06, ease: EASE }}
            className="rounded-[1.35rem] border border-foam/15 bg-foam/[0.07] p-5 shadow-[0_24px_60px_rgb(0_0_0_/_0.35)] backdrop-blur-xl sm:p-7"
            aria-hidden="true"
          >
            <p className="font-mono text-[0.65rem] tracking-[0.16em] text-foam/45 uppercase">
              {t("privateToursPreview.cardLabel")}
            </p>
            <p className="mt-3 font-display text-xl tracking-tight text-foam">
              {t("privateToursPreview.cardTitle")}
            </p>
            <ol className="mt-5 space-y-3">
              {privateToursPreview.previewStops.map((stop, index) => (
                <li
                  key={stop}
                  className="flex items-center gap-3 rounded-[0.9rem] border border-foam/12 bg-map-void/35 px-3.5 py-3"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand/25 text-xs font-bold text-brand-bright">
                    {index + 1}
                  </span>
                  <span className="text-sm text-foam/85">{stop}</span>
                </li>
              ))}
            </ol>
            <div className="mt-5 flex items-end justify-between gap-3 border-t border-foam/12 pt-4">
              <div>
                <p className="text-[0.68rem] text-foam/45">
                  {t("privateToursPreview.estimateLabel")}
                </p>
                <p className="mt-1 font-display text-2xl tracking-tight text-foam">
                  {t("privateToursPreview.estimateValue")}
                </p>
              </div>
              <Link
                href="/tours"
                className="inline-flex min-h-11 items-center text-sm font-medium text-brand-bright transition-colors hover:text-foam"
              >
                {t("privateToursPreview.cardCta")}
                <span aria-hidden="true" className="ml-2">
                  →
                </span>
              </Link>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
