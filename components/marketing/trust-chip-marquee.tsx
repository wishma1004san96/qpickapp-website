"use client";

import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import "./trust-chip-marquee.css";

type TrustChipMarqueeProps = {
  labels: readonly string[];
  ariaLabel: string;
  className?: string;
};

/**
 * Premium glass chip marquee — continuous RTL auto-scroll + manual swipe.
 * Mobile trust rows (Hero / Drive). Desktop callers keep their own static layout.
 */
export function TrustChipMarquee({
  labels,
  ariaLabel,
  className = "",
}: TrustChipMarqueeProps) {
  const reduceMotion = useReducedMotion() ?? false;
  // Duplicate once so short lists still loop seamlessly
  const slides = labels.length > 0 ? [...labels, ...labels] : [];

  const autoScroll = useRef(
    AutoScroll({
      speed: 0.7,
      startDelay: 0,
      direction: "forward",
      stopOnInteraction: false,
      stopOnMouseEnter: true,
      stopOnFocusIn: true,
      playOnInit: !reduceMotion,
    }),
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      dragFree: true,
      skipSnaps: true,
      containScroll: false,
      watchDrag: true,
    },
    reduceMotion ? [] : [autoScroll.current],
  );

  useEffect(() => {
    if (!emblaApi || reduceMotion) return;
    const plugin = autoScroll.current;
    let resumeTimer = 0;

    const pause = () => {
      window.clearTimeout(resumeTimer);
      plugin.stop();
    };
    const resume = () => {
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => {
        plugin.play();
      }, 900);
    };

    emblaApi.on("pointerDown", pause);
    emblaApi.on("pointerUp", resume);
    return () => {
      window.clearTimeout(resumeTimer);
      emblaApi.off("pointerDown", pause);
      emblaApi.off("pointerUp", resume);
    };
  }, [emblaApi, reduceMotion]);

  if (slides.length === 0) return null;

  return (
    <div
      className={`trust-chip-marquee ${className}`.trim()}
      role="region"
      aria-label={ariaLabel}
      ref={emblaRef}
    >
      <ul className="trust-chip-marquee-track">
        {slides.map((label, index) => (
          <li
            key={index}
            className="trust-chip-marquee-item"
            aria-hidden={index >= labels.length ? true : undefined}
          >
            <div className="trust-chip-marquee-badge">
              <span className="trust-chip-marquee-mark" aria-hidden="true">
                <svg viewBox="0 0 16 16" fill="none" className="size-3.5">
                  <path
                    d="M3.4 8.2 6.5 11.2 12.6 4.7"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="trust-chip-marquee-label">{label}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
