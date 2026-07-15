"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  useMessages,
  useTranslations,
} from "@/components/i18n/locale-provider";
import { Container } from "@/components/ui/container";

const BENEFIT_IDS = [
  "schedule",
  "earnings",
  "airport",
  "tours",
  "customers",
  "support",
] as const;

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Driver recruitment showcase — benefits + Driver App dashboard mockup.
 */
export function DriveWithQPick() {
  const t = useTranslations();
  const { driveWithQPick } = useMessages();
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section
      className="relative overflow-hidden bg-[#07111b] py-[var(--section-y-sm)] text-foam sm:py-[var(--section-y-md)] lg:py-[var(--section-y-lg)]"
      aria-labelledby="drive-qpick-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_85%_20%,rgb(0_98_250_/_0.18),transparent_55%),radial-gradient(55%_45%_at_10%_85%,rgb(1_147_251_/_0.1),transparent_50%)]"
        aria-hidden="true"
      />

      <Container className="relative z-[1]">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
          <div>
            <motion.header
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <p className="inline-flex rounded-full border border-foam/20 bg-foam/10 px-3.5 py-1.5 font-mono text-[0.6875rem] tracking-[0.18em] text-brand-bright uppercase backdrop-blur-md">
                {t("driveWithQPick.eyebrow")}
              </p>
              <h2
                id="drive-qpick-heading"
                className="mt-5 max-w-[14ch] font-display text-[clamp(1.85rem,4vw,3rem)] leading-[1.1] font-semibold tracking-tight text-balance"
              >
                {t("driveWithQPick.heading")}
              </h2>
              <p className="mt-5 max-w-[40ch] text-base leading-relaxed text-pretty text-foam/65 sm:text-lg">
                {t("driveWithQPick.sub")}
              </p>
            </motion.header>

            <ul className="mt-9 grid gap-3 sm:grid-cols-2">
              {BENEFIT_IDS.map((id, i) => (
                <motion.li
                  key={id}
                  initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.45,
                    delay: reduceMotion ? 0 : 0.05 + i * 0.04,
                    ease: EASE,
                  }}
                  whileHover={reduceMotion ? undefined : { y: -2 }}
                  className="rounded-[1rem] border border-foam/12 bg-foam/[0.06] px-4 py-3.5 backdrop-blur-md transition-[border-color,box-shadow] duration-[var(--duration-ui)] hover:border-brand/35 hover:shadow-[var(--shadow-glow-brand)]"
                >
                  <p className="text-sm font-semibold text-foam">
                    {driveWithQPick.benefits[id].title}
                  </p>
                  <p className="mt-1 text-[0.8rem] leading-snug text-pretty text-foam/55">
                    {driveWithQPick.benefits[id].body}
                  </p>
                </motion.li>
              ))}
            </ul>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.2, ease: EASE }}
              className="mt-9 flex flex-wrap gap-3"
            >
              <Link
                href="/drive"
                className="inline-flex min-h-12 max-w-full items-center justify-center rounded-[var(--radius-md)] bg-brand px-6 text-sm font-medium text-paper transition-[background-color,transform,box-shadow] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] hover:bg-brand-deep motion-safe:hover:-translate-y-px motion-safe:hover:shadow-[var(--shadow-glow-brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright/50"
              >
                {t("driveWithQPick.cta")}
              </Link>
              <Link
                href="/drive"
                className="inline-flex min-h-12 max-w-full items-center justify-center rounded-[var(--radius-md)] border border-foam/25 bg-foam/10 px-6 text-sm font-medium text-foam transition-[border-color,background-color,transform] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] hover:border-foam/40 hover:bg-foam/16 motion-safe:hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright/50"
              >
                {t("driveWithQPick.secondaryCta")}
              </Link>
            </motion.div>
          </div>

          <motion.div
            className="flex justify-center lg:justify-end"
            initial={reduceMotion ? false : { opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <motion.div
              aria-hidden="true"
              animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 6, repeat: Infinity, ease: "easeInOut" }
              }
              className="relative w-[min(17.5rem,78vw)]"
              style={reduceMotion ? undefined : { transformPerspective: 1200 }}
            >
              <div className="absolute -inset-8 rounded-full bg-brand/20 blur-3xl" />
              <div className="relative rounded-[1.75rem] bg-gradient-to-b from-[#1d2430] to-[#0b121a] p-[0.45rem] shadow-[0_28px_60px_rgb(0_0_0_/_0.45)]">
                <div className="relative overflow-hidden rounded-[1.35rem] bg-[#f4f6f8] text-[#0a1620]">
                  <div className="absolute top-2.5 left-1/2 z-[2] h-1.5 w-[34%] -translate-x-1/2 rounded-full bg-[#05080d]" />
                  <DriverDashboardMock copy={driveWithQPick.dashboard} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

function DriverDashboardMock({
  copy,
}: {
  copy: {
    title: string;
    online: string;
    earnings: string;
    earningsValue: string;
    nextTrip: string;
    route: string;
    eta: string;
    accept: string;
  };
}) {
  return (
    <div className="flex min-h-[28rem] flex-col px-3.5 pt-8 pb-3.5 font-sans">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[0.82rem] font-bold tracking-tight">{copy.title}</p>
        <span className="rounded-full bg-[#1f7a4c]/12 px-2 py-0.5 text-[0.58rem] font-semibold text-[#1f7a4c]">
          {copy.online}
        </span>
      </div>

      <div className="mt-3 rounded-[0.85rem] border border-[rgb(10_22_32_/_0.08)] bg-white p-3 shadow-[0_8px_20px_rgb(10_22_32_/_0.06)]">
        <p className="text-[0.58rem] tracking-wide text-[#5b6b76] uppercase">
          {copy.earnings}
        </p>
        <p className="mt-1 text-lg font-bold tracking-tight text-[#0a1620]">
          {copy.earningsValue}
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e8eef4]">
          <div className="h-full w-[68%] rounded-full bg-[#0062fa]" />
        </div>
      </div>

      <div className="relative mt-3 min-h-0 flex-1 overflow-hidden rounded-[0.85rem] bg-[#dde5ec]">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "linear-gradient(rgb(148 163 184 / 0.2) 1px, transparent 1px), linear-gradient(90deg, rgb(148 163 184 / 0.2) 1px, transparent 1px)",
            backgroundSize: "14px 14px",
          }}
        />
        <div className="absolute top-[28%] left-[18%] h-[42%] w-[58%] rounded-[40%] border-2 border-[#0062fa]/80 border-b-transparent border-l-transparent" />
        <span className="absolute top-[62%] left-[22%] h-2 w-2 rounded-full bg-[#0062fa] shadow-[0_0_0_3px_rgb(0_98_250_/_0.22)]" />
        <span className="absolute top-[26%] right-[24%] h-2 w-2 rounded-full bg-[#0a1620] shadow-[0_0_0_3px_rgb(10_22_32_/_0.16)]" />
      </div>

      <div className="mt-3 rounded-[0.85rem] border border-[rgb(10_22_32_/_0.08)] bg-white p-3">
        <p className="text-[0.58rem] text-[#5b6b76]">{copy.nextTrip}</p>
        <p className="mt-0.5 text-[0.78rem] font-bold">{copy.route}</p>
        <p className="mt-0.5 text-[0.65rem] text-[#5b6b76]">{copy.eta}</p>
        <span className="mt-2.5 flex min-h-8 items-center justify-center rounded-[0.65rem] bg-[#0062fa] text-[0.68rem] font-semibold text-white">
          {copy.accept}
        </span>
      </div>
    </div>
  );
}
