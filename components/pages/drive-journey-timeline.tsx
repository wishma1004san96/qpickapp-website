"use client";

import {
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { useRef } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

export type DriveJourneyStep = {
  key: string;
  title: string;
  body: string;
  icon: LucideIcon;
};

type DriveJourneyTimelineProps = {
  eyebrow: string;
  heading: string;
  steps: DriveJourneyStep[];
};

const PARTICLES = [
  { top: "12%", left: "8%", size: 4, delay: 0 },
  { top: "28%", left: "92%", size: 3, delay: 0.4 },
  { top: "55%", left: "5%", size: 5, delay: 0.8 },
  { top: "72%", left: "88%", size: 3, delay: 1.1 },
  { top: "38%", left: "48%", size: 2, delay: 0.6 },
  { top: "85%", left: "22%", size: 4, delay: 1.4 },
  { top: "18%", left: "72%", size: 3, delay: 0.2 },
  { top: "64%", left: "58%", size: 2, delay: 1.0 },
] as const;

function JourneyCard({
  step,
  index,
  inView,
  reduceMotion,
}: {
  step: DriveJourneyStep;
  index: number;
  inView: boolean;
  reduceMotion: boolean;
}) {
  const Icon = step.icon;
  const stepNumber = String(index + 1).padStart(2, "0");

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.96 }}
      animate={
        inView
          ? { opacity: 1, y: 0, scale: 1 }
          : reduceMotion
            ? undefined
            : { opacity: 0, y: 28, scale: 0.96 }
      }
      transition={{
        duration: 0.65,
        delay: reduceMotion ? 0 : 0.15 + index * 0.1,
        ease: EASE,
      }}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -8,
              scale: 1.02,
              transition: { duration: 0.28, ease: EASE },
            }
      }
      className="group relative rounded-[22px] border border-white/70 bg-white/55 p-6 shadow-[0_8px_32px_rgb(10_22_32_/_0.06)] backdrop-blur-xl transition-[box-shadow,border-color] duration-300 hover:border-[#0062fa]/35 hover:shadow-[0_24px_56px_rgb(0_98_250_/_0.16)] sm:p-7"
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[22px] bg-gradient-to-br from-white/80 via-white/40 to-[#0062fa]/[0.04] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
      />

      <div className="relative flex items-start gap-5">
        <motion.div
          className="relative flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-[18px] border border-[#0062fa]/12 bg-gradient-to-br from-[#e8f2ff] to-white text-[#0062fa] shadow-[0_10px_28px_rgb(0_98_250_/_0.14)] transition-[box-shadow,border-color] duration-300 group-hover:border-[#0062fa]/30 group-hover:shadow-[0_16px_36px_rgb(0_98_250_/_0.22)]"
          whileHover={reduceMotion ? undefined : { scale: 1.08, rotate: -4 }}
          transition={{ type: "spring", stiffness: 380, damping: 18 }}
        >
          <Icon className="h-8 w-8" strokeWidth={1.6} aria-hidden />
          <span className="absolute -top-2 -right-2 flex h-7 min-w-7 items-center justify-center rounded-full bg-gradient-to-b from-[#2b7dff] to-[#0062fa] px-1.5 font-mono text-[0.625rem] font-semibold tracking-wide text-white shadow-[0_4px_12px_rgb(0_98_250_/_0.35)]">
            {stepNumber}
          </span>
        </motion.div>

        <div className="min-w-0 flex-1 pt-0.5">
          <p className="font-mono text-[0.625rem] tracking-[0.18em] text-[#0062fa]/70 uppercase">
            Step {stepNumber}
          </p>
          <h3 className="mt-2 font-display text-[clamp(1.125rem,2vw,1.375rem)] font-semibold tracking-tight text-ink">
            {step.title}
          </h3>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink/58">
            {step.body}
          </p>
        </div>
      </div>
    </motion.article>
  );
}

function TimelineNode({
  index,
  inView,
  reduceMotion,
  active,
}: {
  index: number;
  inView: boolean;
  reduceMotion: boolean;
  active: boolean;
}) {
  return (
    <motion.div
      initial={reduceMotion ? false : { scale: 0 }}
      animate={inView ? { scale: 1 } : reduceMotion ? undefined : { scale: 0 }}
      transition={{
        duration: 0.4,
        delay: reduceMotion ? 0 : 0.2 + index * 0.1,
        ease: EASE,
      }}
      className="relative z-[2] flex h-5 w-5 items-center justify-center"
    >
      <motion.span
        animate={
          active && !reduceMotion
            ? { scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }
            : { scale: 1, opacity: 0 }
        }
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full bg-[#0062fa]/30"
        aria-hidden
      />
      <span
        className={`relative h-3.5 w-3.5 rounded-full border-2 transition-colors duration-500 ${
          active
            ? "border-[#0062fa] bg-[#0062fa] shadow-[0_0_0_4px_rgb(0_98_250_/_0.15)]"
            : "border-[#0062fa]/30 bg-white"
        }`}
      />
    </motion.div>
  );
}

export function DriveJourneyTimeline({
  eyebrow,
  heading,
  steps,
}: DriveJourneyTimelineProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.15 });
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-16 sm:py-20 lg:py-28"
      aria-labelledby="drive-journey-heading"
    >
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-[#f4f8ff] via-foam to-white" />
        <div
          className="absolute inset-0 opacity-[0.45]"
          style={{
            backgroundImage:
              "linear-gradient(rgb(0 98 250 / 0.04) 1px, transparent 1px), linear-gradient(90deg, rgb(0 98 250 / 0.04) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-[#0062fa]/[0.08] blur-3xl" />
        <div className="absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-[#2b7dff]/[0.1] blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#0062fa]/[0.06] blur-3xl" />

        {PARTICLES.map((p, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-[#0062fa]/25"
            style={{
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
            }}
            animate={
              reduceMotion
                ? undefined
                : {
                    y: [0, -12, 0],
                    opacity: [0.25, 0.55, 0.25],
                  }
            }
            transition={{
              duration: 4 + (i % 3),
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto w-full min-w-0 max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10">
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, ease: EASE }}
          className="max-w-3xl"
        >
          <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand uppercase">
            {eyebrow}
          </p>
          <h2
            id="drive-journey-heading"
            className="mt-4 font-display text-[clamp(2rem,4vw,3rem)] font-semibold tracking-tight text-ink"
          >
            {heading}
          </h2>
        </motion.header>

        {/* Mobile — vertical timeline */}
        <ol className="relative mt-14 lg:hidden">
          <div className="absolute top-2 bottom-2 left-[11px] w-px overflow-hidden rounded-full bg-[#0062fa]/10">
            <motion.div
              className="w-full origin-top bg-gradient-to-b from-[#2b7dff] via-[#0062fa] to-[#0062fa]/40"
              initial={{ height: "0%" }}
              animate={inView ? { height: "100%" } : { height: "0%" }}
              transition={{
                duration: reduceMotion ? 0 : 1.4,
                delay: reduceMotion ? 0 : 0.2,
                ease: EASE,
              }}
            />
          </div>

          {steps.map((step, index) => (
            <li key={step.key} className="relative flex gap-6 pb-10 last:pb-0">
              <div className="relative z-[1] mt-7 shrink-0">
                <TimelineNode
                  index={index}
                  inView={inView}
                  reduceMotion={reduceMotion}
                  active={inView}
                />
              </div>
              <div className="min-w-0 flex-1">
                <JourneyCard
                  step={step}
                  index={index}
                  inView={inView}
                  reduceMotion={reduceMotion}
                />
              </div>
            </li>
          ))}
        </ol>

        {/* Desktop — alternating zig-zag timeline */}
        <ol className="relative mx-auto mt-16 hidden max-w-5xl lg:block">
          <div className="absolute top-4 bottom-4 left-1/2 w-px -translate-x-1/2 overflow-hidden rounded-full bg-[#0062fa]/10">
            <motion.div
              className="w-full origin-top bg-gradient-to-b from-[#2b7dff] via-[#0062fa] to-[#0062fa]/50"
              initial={{ height: "0%" }}
              animate={inView ? { height: "100%" } : { height: "0%" }}
              transition={{
                duration: reduceMotion ? 0 : 1.8,
                delay: reduceMotion ? 0 : 0.25,
                ease: EASE,
              }}
            />
          </div>

          {steps.map((step, index) => {
            const isRight = index % 2 === 0;
            const isLast = index === steps.length - 1;

            return (
              <li
                key={step.key}
                className={`relative grid grid-cols-[1fr_3rem_1fr] items-center ${
                  isLast ? "" : "pb-14"
                }`}
              >
                <div className={isRight ? "col-start-3" : "col-start-1"}>
                  <JourneyCard
                    step={step}
                    index={index}
                    inView={inView}
                    reduceMotion={reduceMotion}
                  />
                </div>

                <div className="col-start-2 flex justify-center">
                  <TimelineNode
                    index={index}
                    inView={inView}
                    reduceMotion={reduceMotion}
                    active={inView}
                  />
                </div>

                {/* Horizontal connector */}
                <motion.div
                  initial={reduceMotion ? false : { scaleX: 0, opacity: 0 }}
                  animate={
                    inView
                      ? { scaleX: 1, opacity: 1 }
                      : reduceMotion
                        ? undefined
                        : { scaleX: 0, opacity: 0 }
                  }
                  transition={{
                    duration: 0.5,
                    delay: reduceMotion ? 0 : 0.35 + index * 0.1,
                    ease: EASE,
                  }}
                  className={`absolute top-1/2 h-px w-[calc(50%-2.5rem)] -translate-y-1/2 bg-gradient-to-r from-[#0062fa]/40 to-[#0062fa]/10 ${
                    isRight
                      ? "right-[calc(50%+1.25rem)] origin-right"
                      : "left-[calc(50%+1.25rem)] origin-left"
                  }`}
                  style={{
                    background: isRight
                      ? "linear-gradient(to left, rgb(0 98 250 / 0.45), rgb(0 98 250 / 0.08))"
                      : "linear-gradient(to right, rgb(0 98 250 / 0.45), rgb(0 98 250 / 0.08))",
                  }}
                  aria-hidden
                />
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
