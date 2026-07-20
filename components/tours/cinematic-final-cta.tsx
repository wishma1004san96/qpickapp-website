"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

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
    <section className="relative isolate min-h-[min(70vh,560px)] overflow-hidden rounded-[2rem] text-foam shadow-[0_30px_80px_rgb(10_22_32_/_0.28)]">
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        className={`object-cover ${reduceMotion ? "" : "motion-safe:scale-105"}`}
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-map-void via-map-void/75 to-map-void/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-map-void via-transparent to-map-void/30" />
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6 }}
        className="relative flex min-h-[min(70vh,560px)] flex-col justify-end px-6 py-12 sm:px-10 sm:py-16 lg:px-14"
      >
        <p className="font-mono text-[0.6875rem] tracking-[0.22em] text-brand-bright uppercase">
          Begin the journey
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-tight">
          {headline}
        </h2>
        {body ? (
          <p className="mt-4 max-w-lg text-base leading-relaxed text-foam/65">
            {body}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={primaryHref}
            className="inline-flex min-h-13 items-center justify-center rounded-2xl bg-gradient-to-b from-[#2b7dff] to-[#0062fa] px-8 text-sm font-semibold text-paper shadow-[0_16px_40px_rgb(0_98_250_/_0.45)]"
          >
            {primaryLabel}
          </Link>
          {secondaryLabel && secondaryHref ? (
            <a
              href={secondaryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-13 items-center justify-center rounded-2xl border border-foam/30 bg-foam/10 px-8 text-sm font-semibold text-foam backdrop-blur-md hover:bg-foam/15"
            >
              {secondaryLabel}
            </a>
          ) : null}
        </div>
      </motion.div>
    </section>
  );
}
