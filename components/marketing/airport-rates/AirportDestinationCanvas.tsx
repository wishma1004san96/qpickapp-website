"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import {
  DEFAULT_AIRPORT_SCENE,
  type DestinationScene,
} from "@/lib/airport-destination-scenes";

const EASE = [0.22, 1, 0.36, 1] as const;

type AirportDestinationCanvasProps = {
  scene: DestinationScene;
  className?: string;
};

export function AirportDestinationCanvas({
  scene,
  className = "",
}: AirportDestinationCanvasProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const isDefault = scene.id === DEFAULT_AIRPORT_SCENE.id;

  return (
    <div
      className={`relative isolate min-h-[28rem] overflow-hidden rounded-[28px] lg:min-h-full ${className}`}
    >
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={scene.id + scene.image}
          className="absolute inset-0"
          initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <Image
            src={scene.image}
            alt={scene.imageAlt}
            fill
            priority={isDefault}
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      <div
        className="absolute inset-0 bg-gradient-to-t from-[#050b12]/88 via-[#050b12]/35 to-[#050b12]/15"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_70%_20%,rgb(0_98_250_/_0.18),transparent_60%)]"
        aria-hidden
      />

      <div className="absolute inset-x-0 bottom-0 z-[1] p-6 sm:p-8 lg:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={scene.id + scene.name}
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-[#e4c99a]/90 uppercase">
              {scene.province}
            </p>
            <h3 className="mt-2 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold tracking-tight text-balance text-[#f3f6f7]">
              {scene.name}
            </h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-pretty text-[#f3f6f7]/78 sm:text-[0.9375rem]">
              {scene.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
