"use client";

import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { TourFaq } from "@/lib/tours/types";

type FaqAccordionProps = {
  faqs: TourFaq[];
  className?: string;
};

const HIGHLIGHT_PHRASES = [
  "Private Chauffeur",
  "private chauffeur",
  "private-chauffeur",
  "Airport Pickup",
  "airport pickup",
  "CMB pickup",
  "Custom Tour",
  "custom tour",
  "customise",
  "custom route",
  "WhatsApp",
  "Secure Booking",
  "secure booking",
] as const;

function highlightAnswer(text: string): ReactNode {
  const pattern = new RegExp(
    `(${HIGHLIGHT_PHRASES.map((phrase) =>
      phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    ).join("|")})`,
    "gi",
  );
  const parts = text.split(pattern);

  return parts.map((part, index) => {
    const isHighlight = HIGHLIGHT_PHRASES.some(
      (phrase) => phrase.toLowerCase() === part.toLowerCase(),
    );
    if (!isHighlight) return part;
    return (
      <mark
        key={`${part}-${index}`}
        className="rounded-md bg-brand/10 px-1 py-0.5 font-semibold text-brand-deep not-italic"
      >
        {part}
      </mark>
    );
  });
}

export function FaqAccordion({ faqs, className = "" }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);
  const reduceMotion = useReducedMotion() ?? false;

  const transition = useMemo(
    () => ({
      duration: reduceMotion ? 0 : 0.36,
      ease: [0.22, 1, 0.36, 1] as const,
    }),
    [reduceMotion],
  );

  if (faqs.length === 0) return null;

  return (
    <div
      className={`flex flex-col gap-3 sm:gap-3.5 ${className}`}
      role="region"
      aria-label="Frequently asked questions"
    >
      {faqs.map((faq) => {
        const open = openId === faq.id;
        return (
          <article
            key={faq.id}
            className={`overflow-hidden rounded-[1.35rem] border bg-white shadow-[0_10px_28px_rgb(10_22_32_/_0.05)] transition-[border-color,box-shadow,transform] duration-300 sm:rounded-[1.5rem] ${
              open
                ? "border-brand/25 shadow-[0_16px_40px_rgb(0_98_250_/_0.1)]"
                : "border-ink/8 hover:-translate-y-0.5 hover:border-brand/15 hover:shadow-[0_14px_36px_rgb(10_22_32_/_0.08)]"
            }`}
          >
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : faq.id)}
              className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-brand/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/35 sm:items-center sm:px-6 sm:py-5"
            >
              <span className="font-display text-[0.975rem] font-semibold leading-snug tracking-tight text-ink sm:text-[1.0625rem]">
                {faq.question}
              </span>
              <motion.span
                animate={{ rotate: open ? 180 : 0 }}
                transition={transition}
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/8 text-brand sm:mt-0"
              >
                <ChevronDown className="h-4 w-4" aria-hidden />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={transition}
                  className="overflow-hidden"
                >
                  <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{
                      ...transition,
                      delay: reduceMotion ? 0 : 0.04,
                    }}
                    className="border-t border-ink/6 px-5 pt-3 pb-5 text-[0.9375rem] leading-[1.75] text-ink/68 sm:px-6 sm:pt-4 sm:pb-6"
                  >
                    {highlightAnswer(faq.answer)}
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </article>
        );
      })}
    </div>
  );
}
