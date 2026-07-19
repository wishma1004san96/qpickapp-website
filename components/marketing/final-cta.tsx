"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useTranslations, useMessages } from "@/components/i18n/locale-provider";

const EASE = [0.22, 1, 0.36, 1] as const;

const TRUST_KEYS = [
  "verified",
  "pricing",
  "support",
  "coverage",
] as const;

/**
 * Final conversion CTA — compact premium band into the footer.
 */
export function FinalCta() {
  const t = useTranslations();
  const { finalCta } = useMessages();
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section
      aria-labelledby="final-cta-heading"
      className="relative overflow-hidden border-t border-mist/60 bg-[linear-gradient(180deg,#f7fafc_0%,#eef4fb_55%,#e8f0fa_100%)] py-12 sm:py-14 lg:py-16"
    >
      {/* Soft luxury atmosphere */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <motion.div
          className="absolute left-1/2 top-[-30%] h-[70%] w-[90%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(0_98_250_/_0.14)_0%,rgb(1_147_251_/_0.06)_42%,transparent_70%)] blur-2xl"
          initial={{ opacity: 0.55, scale: 1 }}
          animate={
            reduceMotion
              ? { opacity: 0.65, scale: 1 }
              : { opacity: [0.5, 0.8, 0.5], scale: [1, 1.06, 1] }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 14, repeat: Infinity, ease: "easeInOut" }
          }
        />
        <motion.div
          className="absolute -right-[10%] bottom-[-40%] h-[55%] w-[50%] rounded-full bg-brand-bright/[0.08] blur-3xl"
          animate={
            reduceMotion
              ? undefined
              : { opacity: [0.35, 0.6, 0.35], x: [0, -18, 0] }
          }
          transition={
            reduceMotion
              ? undefined
              : { duration: 16, repeat: Infinity, ease: "easeInOut" }
          }
        />
        {/* Thin animated light lines */}
        <motion.div
          className="absolute inset-x-[8%] top-[28%] h-px bg-gradient-to-r from-transparent via-brand/25 to-transparent"
          animate={reduceMotion ? undefined : { opacity: [0.25, 0.7, 0.25] }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 5.5, repeat: Infinity, ease: "easeInOut" }
          }
        />
        <motion.div
          className="absolute inset-x-[18%] bottom-[32%] h-px bg-gradient-to-r from-transparent via-brand-bright/20 to-transparent"
          animate={reduceMotion ? undefined : { opacity: [0.2, 0.55, 0.2] }}
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 6.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.9,
                }
          }
        />
        {/* Glass accent orbs */}
        <div className="absolute left-[8%] top-[35%] h-24 w-24 rounded-full border border-white/50 bg-white/30 blur-xl backdrop-blur-sm" />
        <div className="absolute right-[10%] top-[22%] h-16 w-16 rounded-full border border-white/40 bg-white/25 blur-lg" />
      </div>

      <div className="relative z-[1] mx-auto w-full min-w-0 max-w-[1100px] px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex flex-col items-center text-center"
        >
          <p className="inline-flex rounded-full border border-brand/15 bg-white/60 px-3.5 py-1 font-mono text-[0.6875rem] tracking-[0.16em] text-brand uppercase shadow-[0_1px_0_rgb(255_255_255_/_0.8)] backdrop-blur-md">
            {t("finalCta.badge")}
          </p>

          <h2
            id="final-cta-heading"
            className="mt-4 max-w-[22ch] font-display text-[clamp(1.65rem,3.2vw,2.35rem)] leading-[1.15] font-semibold tracking-tight text-balance text-ink"
          >
            {t("finalCta.heading")}
          </h2>

          <p className="mt-3 max-w-[42ch] text-[0.9375rem] leading-relaxed text-pretty text-ink-muted sm:text-base">
            {t("finalCta.body")}
          </p>

          <div className="mt-6 flex w-full max-w-xl flex-col items-stretch justify-center gap-2.5 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <Link
              href="/ride"
              className="inline-flex min-h-12 items-center justify-center rounded-[14px] bg-gradient-to-b from-[#2b7dff] to-[#0062fa] px-6 text-sm font-medium text-paper shadow-[0_10px_28px_rgb(0_98_250_/_0.28)] transition-[transform,box-shadow,filter] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] hover:shadow-[0_14px_36px_rgb(0_98_250_/_0.42)] hover:brightness-110 motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45"
            >
              {t("finalCta.primary")}
            </Link>
            <Link
              href="/airport-transfer"
              className="inline-flex min-h-12 items-center justify-center rounded-[14px] border border-ink/10 bg-white/70 px-6 text-sm font-medium text-ink shadow-[0_4px_16px_rgb(10_22_32_/_0.04)] backdrop-blur-md transition-[transform,box-shadow,border-color,background-color] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] hover:border-brand/25 hover:bg-white hover:shadow-[0_10px_28px_rgb(0_98_250_/_0.12)] motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35"
            >
              {t("finalCta.secondary")}
            </Link>
            <Link
              href="/tour-booking"
              className="inline-flex min-h-12 items-center justify-center rounded-[14px] border border-ink/15 bg-transparent px-6 text-sm font-medium text-ink transition-[transform,box-shadow,border-color,background-color] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] hover:border-brand/30 hover:bg-brand/[0.04] hover:shadow-[0_8px_24px_rgb(0_98_250_/_0.1)] motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35"
            >
              {t("finalCta.download")}
            </Link>
          </div>

          {/* Trust bar — desktop row */}
          <ul className="mt-7 hidden flex-wrap items-center justify-center gap-2.5 md:flex">
            {TRUST_KEYS.map((key, i) => (
              <motion.li
                key={key}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.35,
                  delay: reduceMotion ? 0 : 0.08 + i * 0.05,
                  ease: EASE,
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/8 bg-white/65 px-3.5 py-1.5 text-[0.75rem] font-medium text-ink/80 shadow-[0_1px_0_rgb(255_255_255_/_0.9)] backdrop-blur-md"
              >
                <span className="text-brand" aria-hidden="true">
                  ✓
                </span>
                {finalCta.trust[key]}
              </motion.li>
            ))}
          </ul>

          {/* Trust bar — mobile horizontal chip slider */}
          <div
            className="relative mt-6 w-full min-w-0 max-w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
            role="region"
            aria-label={t("finalCta.trustAria")}
          >
            <ul className="flex w-max min-w-full items-center justify-start gap-2 px-0.5 py-0.5">
              {TRUST_KEYS.map((key) => (
                <li
                  key={key}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-ink/8 bg-white/75 px-3.5 py-2 text-[0.75rem] font-medium whitespace-nowrap text-ink/80 shadow-[0_1px_0_rgb(255_255_255_/_0.9)] backdrop-blur-md"
                >
                  <span className="text-brand" aria-hidden="true">
                    ✓
                  </span>
                  {finalCta.trust[key]}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
