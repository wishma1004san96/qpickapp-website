"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { TourDestination } from "@/lib/tours/types";

type DestinationExperienceCardProps = {
  destination: TourDestination;
  href?: string;
  timeFromPrevious?: string;
};

export function DestinationExperienceCard({
  destination,
  href,
  timeFromPrevious,
}: DestinationExperienceCardProps) {
  const reduceMotion = useReducedMotion() ?? false;

  const body = (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45 }}
      className="group flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-ink/8 bg-white/80 shadow-[0_12px_36px_rgb(10_22_32_/_0.06)] backdrop-blur-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgb(10_22_32_/_0.12)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={destination.imageSrc}
          alt={destination.imageAlt}
          fill
          loading="lazy"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-map-void/75 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-foam">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[0.625rem] font-medium tracking-wide text-brand-bright uppercase">
              {destination.province}
            </p>
            {destination.unesco ? (
              <span className="rounded-full bg-foam/15 px-2 py-0.5 text-[0.6rem] font-semibold tracking-wide uppercase backdrop-blur-sm">
                UNESCO
              </span>
            ) : null}
          </div>
          <h3 className="mt-1 font-display text-xl font-semibold">{destination.name}</h3>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="line-clamp-2 text-sm leading-relaxed text-ink/55">
          {destination.description}
        </p>
        <dl className="grid grid-cols-2 gap-2 text-[0.6875rem]">
          <div className="rounded-[0.85rem] bg-foam px-2.5 py-2">
            <dt className="text-ink/40">Weather</dt>
            <dd className="mt-0.5 font-medium text-ink/70">{destination.weatherLabel}</dd>
          </div>
          <div className="rounded-[0.85rem] bg-foam px-2.5 py-2">
            <dt className="text-ink/40">Drive</dt>
            <dd className="mt-0.5 font-medium text-ink/70">
              {timeFromPrevious ?? destination.driveFromColomboLabel}
            </dd>
          </div>
        </dl>
        <div>
          <p className="text-[0.625rem] font-medium tracking-wide text-ink/40 uppercase">
            Things to do
          </p>
          <ul className="mt-1.5 flex flex-wrap gap-1">
            {destination.thingsToDo.slice(0, 3).map((item) => (
              <li
                key={item}
                className="rounded-full border border-ink/8 px-2 py-0.5 text-[0.6875rem] text-ink/55"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-auto text-[0.6875rem] text-ink/40">
          Best photo · {destination.bestPhotoTime}
        </p>
      </div>
    </motion.article>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {body}
      </Link>
    );
  }
  return body;
}
