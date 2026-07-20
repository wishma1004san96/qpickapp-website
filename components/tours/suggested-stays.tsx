"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { TourSuggestedStay } from "@/lib/tours/types";

type SuggestedStaysProps = {
  stays: TourSuggestedStay[];
};

export function SuggestedStays({ stays }: SuggestedStaysProps) {
  const reduceMotion = useReducedMotion() ?? false;
  if (stays.length === 0) return null;

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand uppercase">
            Suggested stay
          </p>
          <h2 className="mt-1 font-display text-[clamp(1.5rem,3vw,2rem)] font-semibold text-ink">
            Overnight atmosphere
          </h2>
          <p className="mt-2 max-w-xl text-sm text-ink/50">
            Style suggestions only — not confirmed hotel partnerships. Real
            options are shared after your tour request.
          </p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stays.map((stay, i) => (
          <motion.article
            key={stay.id}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: reduceMotion ? 0 : i * 0.04 }}
            className="overflow-hidden rounded-[1.25rem] border border-ink/8 bg-white"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={stay.imageSrc}
                alt={stay.imageAlt}
                fill
                loading="lazy"
                className="object-cover"
                sizes="280px"
              />
              <span className="absolute top-3 left-3 rounded-full bg-map-void/75 px-2.5 py-1 text-[0.625rem] font-semibold tracking-wide text-foam uppercase backdrop-blur-md">
                Placeholder
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-ink">{stay.name}</h3>
              <p className="mt-0.5 text-xs text-ink/45">
                {stay.area} · {stay.style}
              </p>
              <p className="mt-2 text-[0.6875rem] leading-relaxed text-ink/40">
                {stay.note}
              </p>
            </div>
          </motion.article>
        ))}
      </div>
      <p className="mt-4 text-xs text-ink/40">
        Prefer to arrange hotels yourself? Choose “Already booked” in the{" "}
        <Link href="/tour-booking" className="font-medium text-brand hover:underline">
          tour planner
        </Link>
        .
      </p>
    </section>
  );
}
