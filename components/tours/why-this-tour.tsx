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
    <section>
      <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-semibold text-ink">
        {title}
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <motion.div
              key={feature.id}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : i * 0.05 }}
              className="rounded-[1.35rem] border border-ink/8 bg-gradient-to-b from-white to-foam/80 p-6 shadow-[0_12px_32px_rgb(10_22_32_/_0.05)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/55">
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
