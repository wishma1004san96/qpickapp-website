"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import {
  useMessages,
  useTranslations,
} from "@/components/i18n/locale-provider";
import { Container } from "@/components/ui/container";
import { UIHeading, Prose } from "@/components/ui/typography";

const EASE = [0.22, 1, 0.36, 1] as const;

export function SafetyChecklist() {
  const t = useTranslations();
  const { safety } = useMessages();
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <Reveal>
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <div>
            <UIHeading className="text-balance">{t("safety.heading")}</UIHeading>
            <Prose className="mt-4 text-pretty">{t("safety.intro")}</Prose>
            <Link
              href="/safety"
              className="mt-6 inline-flex min-h-11 items-center text-sm font-medium text-brand transition-colors hover:text-brand-deep focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35"
            >
              {t("safety.cta")}
              <span aria-hidden="true" className="ml-2">
                →
              </span>
            </Link>
          </div>

          <ul className="space-y-3">
            {safety.proofs.map((item, index) => (
              <motion.li
                key={item}
                initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{
                  duration: 0.45,
                  delay: reduceMotion ? 0 : index * 0.05,
                  ease: EASE,
                }}
                className="group flex items-start gap-3.5 rounded-[var(--radius-md)] border border-mist/80 bg-paper/70 px-4 py-3.5 shadow-[var(--shadow-ambient)] backdrop-blur-md transition-[border-color,box-shadow,transform] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-brand/25 motion-safe:hover:shadow-[var(--shadow-glow-brand)] sm:text-base"
              >
                <span
                  className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-paper"
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 16 16"
                    width="11"
                    height="11"
                    fill="none"
                    className="motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-110"
                  >
                    <path
                      d="M3.5 8.2 L6.4 11.1 L12.5 4.8"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="text-sm leading-relaxed text-ink sm:text-[0.975rem]">
                  {item}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </Container>
    </Reveal>
  );
}
