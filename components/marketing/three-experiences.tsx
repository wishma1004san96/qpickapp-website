"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  useMessages,
  useTranslations,
} from "@/components/i18n/locale-provider";
import { Container } from "@/components/ui/container";
import "./three-experiences.css";

const EASE = [0.22, 1, 0.36, 1] as const;

type ExperienceId = "ride" | "tours" | "drive";

const EXPERIENCES: {
  id: ExperienceId;
  href: string;
  theme: "ride" | "tours" | "drive";
  image: string;
  sizes: string;
  icon: typeof RideIcon;
}[] = [
  {
    id: "ride",
    href: "/ride",
    theme: "ride",
    image:
      "https://images.unsplash.com/photo-1698840059740-ba83e510733b?auto=format&fit=crop&w=2000&q=90",
    sizes: "(max-width: 1023px) 100vw, 58vw",
    icon: RideIcon,
  },
  {
    id: "tours",
    href: "/tours",
    theme: "tours",
    image:
      "https://images.unsplash.com/photo-1711797750174-c3750dd9d7c9?auto=format&fit=crop&w=1600&q=90",
    sizes: "(max-width: 1023px) 100vw, 42vw",
    icon: ToursIcon,
  },
  {
    id: "drive",
    href: "/drive",
    theme: "drive",
    image:
      "https://images.unsplash.com/photo-1730800328198-f9efbf9db53f?auto=format&fit=crop&w=2200&q=90",
    sizes: "(max-width: 1023px) 100vw, 100vw",
    icon: DriveIcon,
  },
];

/**
 * Flagship editorial destinations — Ride, Tours, Drive.
 * Asymmetric mosaic with unique accents; not equal SaaS cards.
 */
export function ThreeExperiences() {
  const t = useTranslations();
  const { threeExperiences } = useMessages();
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section
      className="tx-stage"
      aria-labelledby="three-experiences-heading"
    >
      <div className="tx-ambient" aria-hidden="true">
        <div className="tx-ambient-orb tx-ambient-orb--blue" />
        <div className="tx-ambient-orb tx-ambient-orb--gold" />
        <div className="tx-ambient-orb tx-ambient-orb--slate" />
        <div className="tx-ambient-veil" />
      </div>

      <Container className="tx-inner max-w-[76rem]">
        <motion.header
          className="tx-header"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <p className="tx-eyebrow">{t("threeExperiences.eyebrow")}</p>
          <h2 id="three-experiences-heading" className="tx-heading">
            {t("threeExperiences.heading")}
          </h2>
          <p className="tx-sub">{t("threeExperiences.sub")}</p>
        </motion.header>

        <ul className="tx-mosaic">
          {EXPERIENCES.map((item, index) => {
            const copy = threeExperiences.cards[item.id];
            const Icon = item.icon;
            return (
              <motion.li
                key={item.id}
                className={`tx-panel tx-panel--${item.theme}`}
                initial={reduceMotion ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.6,
                  delay: reduceMotion ? 0 : 0.08 + index * 0.1,
                  ease: EASE,
                }}
              >
                <div className="tx-panel-media">
                  <Image
                    src={item.image}
                    alt={copy.imageAlt}
                    fill
                    sizes={item.sizes}
                    quality={90}
                    className="tx-panel-img"
                    priority={false}
                  />
                  <div className="tx-panel-wash" aria-hidden="true" />
                  <div className="tx-panel-glow" aria-hidden="true" />
                </div>

                <div className="tx-panel-body">
                  <span className="tx-glass-chip" aria-hidden="true">
                    <Icon />
                  </span>
                  <p className="tx-kicker">{copy.kicker}</p>
                  <h3 className="tx-title">{copy.title}</h3>
                  <p className="tx-desc">{copy.description}</p>
                  <ul className="tx-points">
                    {copy.points.map((point) => (
                      <li key={point} className="tx-point">
                        <span className="tx-point-dot" aria-hidden="true" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={item.href}
                    className="tx-cta"
                    aria-label={`${copy.cta}: ${copy.title}`}
                  >
                    <span>{copy.cta}</span>
                    <span className="tx-cta-arrow" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

function RideIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <path
        d="M5 16.5h14M7.2 16.5l1.1-7.2A1.5 1.5 0 0 1 9.8 8h4.4a1.5 1.5 0 0 1 1.5 1.3l1.1 7.2M8.2 16.5a1.3 1.3 0 1 1-2.6 0M18.4 16.5a1.3 1.3 0 1 1-2.6 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ToursIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <path
        d="M12 21s6.5-5.1 6.5-10.2A6.5 6.5 0 0 0 12 4.3a6.5 6.5 0 0 0-6.5 6.5C5.5 15.9 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10.8" r="2.1" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function DriveIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="7.25" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2.1" fill="currentColor" />
      <path
        d="M12 4.8v2.2M12 17v2.2M4.8 12h2.2M17 12h2.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
