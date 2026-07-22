"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Camera,
  Car,
  Mountain,
  Sparkles,
  Sun,
  TreePine,
} from "lucide-react";
import { TourSectionHeader } from "@/components/tours/package-detail-ui";
import type { TourExperienceFeature } from "@/lib/tours/types";

const ICONS = [Sun, Mountain, TreePine, Camera, Car, Sparkles];

type WhyThisTourProps = {
  features: TourExperienceFeature[];
  title?: string;
};

export function WhyThisTour({
  features,
  title = "Why this journey",
}: WhyThisTourProps) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section aria-label={title}>
      <TourSectionHeader title={title} />
      <div className="tour-detail-grid tour-detail-grid--3 tour-detail-equal-cards tour-detail-stack">
        {features.map((feature, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <motion.div
              key={feature.id}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : i * 0.05 }}
              className="tour-detail-card tour-detail-card--lift flex h-full flex-col p-5 sm:p-6"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold leading-snug text-ink">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-[1.65] text-ink/58">
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
