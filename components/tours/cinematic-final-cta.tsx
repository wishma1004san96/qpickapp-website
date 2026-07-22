"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

type CinematicFinalCtaProps = {
  headline: string;
  body?: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  imageSrc: string;
  imageAlt: string;
};

export function CinematicFinalCta({
  headline,
  body,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  imageSrc,
  imageAlt,
}: CinematicFinalCtaProps) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section className="tour-detail-card relative isolate min-h-[min(72vh,600px)] overflow-hidden text-foam shadow-[0_32px_90px_rgb(10_22_32_/_0.32)]">
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        className={`object-cover ${reduceMotion ? "" : "motion-safe:scale-[1.04]"}`}
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-map-void via-map-void/82 to-map-void/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-map-void via-map-void/20 to-map-void/45" />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_80%,rgb(0_98_250_/_0.18),transparent_55%)]"
        aria-hidden
      />
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex min-h-[min(72vh,600px)] flex-col justify-end px-6 py-12 sm:px-10 sm:py-16 lg:px-14 lg:py-20"
      >
        <p className="font-mono text-[0.6875rem] tracking-[0.22em] text-brand-bright uppercase">
          Begin the journey
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-[clamp(2rem,5.2vw,3.75rem)] font-semibold leading-[1.04] tracking-[-0.02em]">
          {headline}
        </h2>
        {body ? (
          <p className="mt-4 max-w-lg text-[0.975rem] leading-[1.65] text-foam/70 sm:text-base">
            {body}
          </p>
        ) : null}
        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href={primaryHref}
            className="group tour-detail-btn tour-detail-btn--primary min-h-12 gap-2 px-8"
          >
            {primaryLabel}
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
          {secondaryLabel && secondaryHref ? (
            <a
              href={secondaryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="tour-detail-btn tour-detail-btn--foam min-h-12 px-8"
            >
              {secondaryLabel}
            </a>
          ) : null}
        </div>
      </motion.div>
    </section>
  );
}
