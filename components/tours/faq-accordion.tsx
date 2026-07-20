"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { TourFaq } from "@/lib/tours/types";

type FaqAccordionProps = {
  faqs: TourFaq[];
  className?: string;
};

export function FaqAccordion({ faqs, className = "" }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  if (faqs.length === 0) return null;

  return (
    <div className={`divide-y divide-ink/8 rounded-[1.35rem] border border-ink/8 bg-white/80 ${className}`}>
      {faqs.map((faq) => {
        const open = openId === faq.id;
        return (
          <div key={faq.id}>
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : faq.id)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="font-display text-base font-semibold text-ink">
                {faq.question}
              </span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-ink/40 transition-transform ${open ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>
            {open ? (
              <div className="px-5 pb-5 text-sm leading-relaxed text-ink/60">
                {faq.answer}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
