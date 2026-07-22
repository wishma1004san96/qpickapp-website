"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { TourSectionHeader } from "@/components/tours/package-detail-ui";
import type { TourSuggestedStay } from "@/lib/tours/types";

type SuggestedStaysProps = {
  stays: TourSuggestedStay[];
};

export function SuggestedStays({ stays }: SuggestedStaysProps) {
  const reduceMotion = useReducedMotion() ?? false;
  if (stays.length === 0) return null;

  return (
    <section aria-label="Suggested stays">
      <TourSectionHeader
        eyebrow="Suggested stay"
        title="Overnight atmosphere"
        lead="Style suggestions only — not confirmed hotel partnerships. Real options are shared after your tour request."
      />
      <div className="tour-detail-grid tour-detail-grid--2 tour-detail-equal-cards tour-detail-stack lg:grid-cols-4">
        {stays.map((stay, i) => (
          <motion.article
            key={stay.id}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ delay: reduceMotion ? 0 : i * 0.04 }}
            className="tour-detail-card tour-detail-card--lift flex h-full flex-col overflow-hidden"
          >
            <div className="tour-detail-img-zoom relative aspect-[4/3]">
              <Image
                src={stay.imageSrc}
                alt={stay.imageAlt}
                fill
                loading="lazy"
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 280px"
              />
              <span className="absolute top-3 left-3 rounded-full bg-map-void/75 px-2.5 py-1 text-[0.625rem] font-semibold tracking-wide text-foam uppercase backdrop-blur-md">
                Placeholder
              </span>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h3 className="font-semibold text-ink">{stay.name}</h3>
              <p className="mt-0.5 text-xs text-ink/50">
                {stay.area} · {stay.style}
              </p>
              <p className="mt-2 flex-1 text-[0.6875rem] leading-[1.6] text-ink/45">
                {stay.note}
              </p>
            </div>
          </motion.article>
        ))}
      </div>
      <p className="tour-detail-lead mt-4">
        Prefer to arrange hotels yourself? Choose “Already booked” in the{" "}
        <Link
          href="/tour-booking"
          className="font-medium text-brand underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          tour planner
        </Link>
        .
      </p>
    </section>
  );
}
