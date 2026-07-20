"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { TourDayChapter } from "@/lib/tours/types";

type DayChapterItineraryProps = {
  chapters: TourDayChapter[];
};

export function DayChapterItinerary({ chapters }: DayChapterItineraryProps) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <div className="space-y-8 sm:space-y-12">
      {chapters.map((chapter, index) => (
        <motion.article
          key={chapter.day}
          id={`itinerary-day-${chapter.day}`}
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.05 }}
          className={`scroll-mt-28 grid items-center gap-6 lg:grid-cols-2 lg:gap-10 ${
            index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
          }`}
        >
          <div className="relative aspect-[16/11] overflow-hidden rounded-[1.5rem] shadow-[0_20px_50px_rgb(10_22_32_/_0.12)]">
            <Image
              src={chapter.imageSrc}
              alt={chapter.imageAlt}
              fill
              loading="lazy"
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-map-void/55 via-transparent to-transparent" />
            <p className="absolute bottom-4 left-4 font-mono text-[0.6875rem] tracking-[0.2em] text-brand-bright uppercase">
              Day {String(chapter.day).padStart(2, "0")}
            </p>
          </div>

          <div>
            <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand uppercase">
              Chapter {chapter.day}
              {chapter.destinationName ? ` · ${chapter.destinationName}` : ""}
            </p>
            <h3 className="mt-2 font-display text-[clamp(1.4rem,3vw,2rem)] font-semibold tracking-tight text-ink">
              {chapter.title}
            </h3>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink/60">
              {chapter.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-foam px-3 py-1.5 text-xs font-medium text-ink/55">
                {chapter.travelTimeResolved}
              </span>
              {chapter.activities?.map((a) => (
                <span
                  key={a}
                  className="rounded-full border border-ink/8 px-3 py-1.5 text-xs text-ink/50"
                >
                  {a}
                </span>
              ))}
            </div>
            <div className="mt-6 h-px w-16 bg-brand/40" aria-hidden />
          </div>
        </motion.article>
      ))}
    </div>
  );
}
