"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "@/components/i18n/locale-provider";
import { TrustChipMarquee } from "@/components/marketing/trust-chip-marquee";
import "./hero-trust-section.css";

const EASE = [0.22, 1, 0.36, 1] as const;
const HOVER_EASE = [0.22, 1, 0.36, 1] as const;

/** Transition begins only after this fraction of the badge group overlaps Fleet. */
const OVERLAP_START = 0.5;

const TRUST_KEYS = [
  "verifiedDrivers",
  "pricing",
  "islandwide",
  "support",
] as const;

/**
 * Floating trust badges on the Hero→Fleet seam.
 * Mobile (<768): continuous chip marquee below planner.
 * Desktop: unchanged floating seam bridge.
 */
export function HeroTrustSection() {
  const t = useTranslations();
  const reduceMotion = useReducedMotion() ?? false;
  const [scrolledPast, setScrolledPast] = useState(false);
  const bridgeRef = useRef<HTMLDivElement>(null);

  const rawProgress = useMotionValue(0);
  const springProgress = useSpring(rawProgress, {
    stiffness: 110,
    damping: 28,
    mass: 0.55,
    restDelta: 0.001,
  });
  const progress = reduceMotion ? rawProgress : springProgress;

  const mobileLabels = TRUST_KEYS.map((key) => t(`hero.trust.${key}`));

  useEffect(() => {
    const desktopMq = window.matchMedia("(min-width: 768px) and (pointer: fine)");

    const measureOverlapProgress = () => {
      // Mobile uses the marquee only — skip getBoundingClientRect work + springs
      if (!desktopMq.matches) {
        rawProgress.set(0);
        return;
      }

      const badges = bridgeRef.current?.getBoundingClientRect();
      const fleet = document
        .querySelector<HTMLElement>(".fleet-stage")
        ?.getBoundingClientRect();

      if (!badges || !fleet || badges.height <= 0) {
        rawProgress.set(0);
        return;
      }

      const overlapPx = Math.min(
        badges.height,
        Math.max(0, badges.bottom - fleet.top),
      );
      const overlapRatio = overlapPx / badges.height;

      const mapped =
        overlapRatio <= OVERLAP_START
          ? 0
          : Math.min(1, (overlapRatio - OVERLAP_START) / (1 - OVERLAP_START));

      rawProgress.set(mapped);
    };

    const onScrollMeta = () => setScrolledPast(window.scrollY > 48);

    const onFrame = () => {
      measureOverlapProgress();
      onScrollMeta();
    };

    onFrame();
    window.addEventListener("scroll", onFrame, { passive: true });
    window.addEventListener("resize", onFrame);
    desktopMq.addEventListener("change", onFrame);
    return () => {
      window.removeEventListener("scroll", onFrame);
      window.removeEventListener("resize", onFrame);
      desktopMq.removeEventListener("change", onFrame);
    };
  }, [rawProgress]);

  return (
    <div
      id="hero-trust"
      className="hero-trust-float"
      role="region"
      aria-label={t("hero.trust.ariaLabel")}
    >
      <div className="hero-trust-stack">
        <div ref={bridgeRef} className="hero-trust-bridge">
          <div className="hero-trust-mobile">
            <TrustChipMarquee
              labels={mobileLabels}
              ariaLabel={t("hero.trust.ariaLabel")}
            />
          </div>
          <ul className="hero-trust-row hero-trust-desktop">
            {TRUST_KEYS.map((key, index) => (
              <TrustBadge
                key={key}
                label={t(`hero.trust.${key}`)}
                index={index}
                reduceMotion={reduceMotion}
                progress={progress}
              />
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={() => {
            const reduce = window.matchMedia(
              "(prefers-reduced-motion: reduce)",
            ).matches;
            window.scrollTo({
              top: Math.round(window.innerHeight * 0.92),
              behavior: reduce ? "auto" : "smooth",
            });
          }}
          className={[
            "hero-trust-scroll relative z-20 flex flex-col items-center gap-2 text-foam/55 transition-opacity duration-[var(--duration-ui)] ease-[var(--ease-cinematic)]",
            scrolledPast ? "pointer-events-none opacity-0" : "opacity-100",
          ].join(" ")}
          aria-label={t("hero.scrollAria")}
        >
          <span className="font-mono text-[0.65rem] tracking-[0.2em] uppercase">
            {t("hero.scroll")}
          </span>
          <span
            aria-hidden="true"
            className="flex h-8 w-5 items-start justify-center rounded-full border border-foam/35 pt-1.5"
          >
            <span className="scroll-dot h-1.5 w-1 rounded-full bg-foam/80" />
          </span>
        </button>
      </div>
    </div>
  );
}

function TrustBadge({
  label,
  index,
  reduceMotion,
  progress,
}: {
  label: string;
  index: number;
  reduceMotion: boolean;
  progress: MotionValue<number>;
}) {
  const bg = useTransform(progress, [0, 1], [
    "rgba(8, 16, 28, 0.58)",
    "rgba(255, 255, 255, 0.94)",
  ]);
  const border = useTransform(progress, [0, 1], [
    "rgba(255, 255, 255, 0.16)",
    "rgba(226, 236, 248, 0.95)",
  ]);
  const labelColor = useTransform(progress, [0, 1], [
    "rgba(247, 250, 252, 0.96)",
    "rgba(10, 22, 40, 0.92)",
  ]);
  const blurPx = useTransform(progress, [0, 1], [20, 8]);
  const backdropFilter = useMotionTemplate`blur(${blurPx}px) saturate(1.15)`;
  const shadow = useTransform(progress, [0, 1], [
    "0 1px 0 rgba(255,255,255,0.16) inset, 0 8px 20px rgba(0,0,0,0.28), 0 0 16px rgba(0,98,250,0.14)",
    "0 1px 0 rgba(255,255,255,0.9) inset, 0 10px 24px rgba(0,40,100,0.14), 0 2px 8px rgba(0,40,100,0.08)",
  ]);
  const sheen = useTransform(progress, [0, 1], [
    "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 100%)",
    "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.18) 100%)",
  ]);

  return (
    <motion.li
      initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{
        duration: 0.7,
        delay: reduceMotion ? 0 : index * 0.08,
        ease: EASE,
      }}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -6,
              scale: 1.02,
              transition: { duration: 0.4, ease: HOVER_EASE },
            }
      }
      className="hero-trust-item"
    >
      <motion.div
        className="hero-trust-badge"
        style={{
          backgroundColor: bg,
          backgroundImage: sheen,
          borderColor: border,
          backdropFilter,
          WebkitBackdropFilter: backdropFilter,
          boxShadow: shadow,
        }}
      >
        <span className="hero-trust-mark" aria-hidden="true">
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="size-3.5"
            aria-hidden="true"
          >
            <path
              d="M3.4 8.2 6.5 11.2 12.6 4.7"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <motion.span className="hero-trust-label" style={{ color: labelColor }}>
          {label}
        </motion.span>
      </motion.div>
    </motion.li>
  );
}
