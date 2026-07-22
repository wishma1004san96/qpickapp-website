"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Camera,
  Car,
  Crown,
  Leaf,
  MapPin,
  Sparkles,
  Sun,
} from "lucide-react";
import { TourSectionHeader } from "@/components/tours/package-detail-ui";

const ICONS = [Sparkles, Crown, MapPin, Sun, Camera, Car, Leaf];

type TourHighlightsProps = {
  highlights: string[];
  title?: string;
  className?: string;
};

export function TourHighlights({
  highlights,
  title = "Tour highlights",
  className = "",
}: TourHighlightsProps) {
  const reduceMotion = useReducedMotion() ?? false;

  if (highlights.length === 0) return null;

  return (
    <section className={className} aria-label="Tour highlights">
      <TourSectionHeader eyebrow="Signature moments" title={title} />
      <ul className="tour-detail-grid tour-detail-grid--2 tour-detail-equal-cards tour-detail-stack">
        {highlights.map((highlight, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <motion.li
              key={highlight}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : i * 0.04 }}
              className="tour-detail-card tour-detail-card--lift flex h-full items-start gap-3.5 p-4 sm:p-5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand/12 to-brand/6 text-brand shadow-[inset_0_1px_0_rgb(255_255_255_/_0.6)]">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <p className="pt-1 text-sm leading-[1.65] text-ink/72">{highlight}</p>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
