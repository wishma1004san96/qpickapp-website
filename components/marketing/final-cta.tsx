"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/motion/reveal";
import { useTranslations } from "@/components/i18n/locale-provider";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Prose } from "@/components/ui/typography";

export function FinalCta() {
  const t = useTranslations();
  const brand = t("finalCta.brand");
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <Reveal>
      <div className="relative overflow-hidden border-t border-mist bg-paper py-[var(--section-y-sm)] sm:py-[var(--section-y-md)] lg:py-[var(--section-y-lg)]">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <motion.div
            className="absolute -left-1/4 top-[-20%] h-[70%] w-[70%] rounded-full bg-brand/[0.07] blur-3xl"
            animate={
              reduceMotion
                ? undefined
                : { opacity: [0.45, 0.75, 0.45], scale: [1, 1.08, 1] }
            }
            transition={
              reduceMotion
                ? undefined
                : { duration: 10, repeat: Infinity, ease: "easeInOut" }
            }
          />
          <motion.div
            className="absolute -right-1/5 bottom-[-30%] h-[65%] w-[55%] rounded-full bg-brand-bright/[0.08] blur-3xl"
            animate={
              reduceMotion
                ? undefined
                : { opacity: [0.35, 0.65, 0.35], scale: [1.05, 1, 1.05] }
            }
            transition={
              reduceMotion
                ? undefined
                : {
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.8,
                  }
            }
          />
        </div>

        <Container className="relative z-[1] text-center">
          <p className="font-display text-3xl tracking-tight text-ink">
            {brand === "Q Pick" ? <>Q&nbsp;Pick</> : brand}
          </p>
          <p className="mt-6 font-display text-h2 text-balance text-ink">
            {t("finalCta.heading")}
          </p>
          <Prose className="mx-auto mt-4 max-w-[40rem] text-pretty">
            {t("finalCta.body")}
          </Prose>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/ride" size="lg" className="max-w-full">
              {t("finalCta.primary")}
            </ButtonLink>
            <ButtonLink
              href="/tours"
              variant="secondary"
              size="lg"
              className="max-w-full"
            >
              {t("finalCta.secondary")}
            </ButtonLink>
          </div>
        </Container>
      </div>
    </Reveal>
  );
}
