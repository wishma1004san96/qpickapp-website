"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/brand/wordmark";
import {
  ExperienceJourneyFrame,
  type JourneyStepId,
} from "@/components/marketing/experience-phone-journey";
import { useTranslations } from "@/components/i18n/locale-provider";
import "./experience-story-screens.css";

const EASE = [0.22, 1, 0.36, 1] as const;

const DESTINATIONS = [
  "Sigiriya",
  "Kandy",
  "Ella",
  "Galle",
  "Mirissa",
] as const;

const DAY_OPTIONS = [1, 2, 3, 5, 7] as const;

const FLEET: {
  id: string;
  name: string;
  meta: string;
  price: string;
  selected?: boolean;
}[] = [
  { id: "tuk", name: "Tuk Tuk", meta: "3 seats", price: "LKR 2,400" },
  { id: "sedan", name: "Sedan", meta: "4 seats · A/C", price: "LKR 18,500", selected: true },
  { id: "suv", name: "SUV", meta: "6 seats · A/C", price: "LKR 24,000" },
  { id: "premiumVan", name: "Premium Van", meta: "8 seats · A/C", price: "LKR 32,000" },
  { id: "luxuryVan", name: "Luxury Van", meta: "6 seats · A/C", price: "LKR 48,000" },
  { id: "miniBus", name: "Mini Bus", meta: "12 seats · A/C", price: "LKR 55,000" },
];

const LIVE_STEPS: JourneyStepId[] = [
  "accepted",
  "arriving",
  "completed",
  "rate",
];

/**
 * Phone 1 — Ride / Tour planning. Production Q Pick UI.
 */
export function StoryPlanScreen({ reduceMotion }: { reduceMotion: boolean }) {
  const t = useTranslations();
  const [selectedDays, setSelectedDays] = useState(3);
  const [selectedDests, setSelectedDests] = useState<string[]>([
    "Sigiriya",
    "Ella",
    "Galle",
  ]);

  const toggleDest = (name: string) => {
    setSelectedDests((prev) =>
      prev.includes(name)
        ? prev.filter((d) => d !== name)
        : [...prev, name].slice(0, 4),
    );
  };

  return (
    <div className="qstory qstory--plan">
      <header className="qstory-top">
        <BrandLogo size={24} className="qstory-logo" />
        <p className="qstory-kicker">{t("experience.story.plan.kicker")}</p>
        <h3 className="qstory-title">{t("experience.story.plan.title")}</h3>
      </header>

      <section className="qstory-block">
        <p className="qstory-label">{t("experience.story.plan.destinations")}</p>
        <div className="qstory-chips">
          {DESTINATIONS.map((name, i) => {
            const on = selectedDests.includes(name);
            return (
              <motion.button
                key={name}
                type="button"
                className={`qstory-chip${on ? " is-on" : ""}`}
                initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : 0.04 * i, ease: EASE }}
                onClick={() => toggleDest(name)}
                tabIndex={-1}
              >
                {name}
              </motion.button>
            );
          })}
        </div>
      </section>

      <section className="qstory-block">
        <p className="qstory-label">{t("experience.story.plan.days")}</p>
        <div className="qstory-days">
          {DAY_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              className={`qstory-day${selectedDays === d ? " is-on" : ""}`}
              onClick={() => setSelectedDays(d)}
              tabIndex={-1}
            >
              {d}
            </button>
          ))}
        </div>
      </section>

      <section className="qstory-fields">
        <div className="qstory-field">
          <span className="qstory-field-label">
            {t("experience.story.plan.pickup")}
          </span>
          <strong>{t("experience.story.plan.pickupValue")}</strong>
        </div>
        <div className="qstory-field">
          <span className="qstory-field-label">
            {t("experience.story.plan.hotel")}
          </span>
          <strong>{t("experience.story.plan.hotelValue")}</strong>
        </div>
      </section>

      <section className="qstory-route" aria-hidden="true">
        <p className="qstory-label">{t("experience.story.plan.route")}</p>
        <div className="qstory-route-preview">
          <svg
            viewBox="0 0 200 56"
            preserveAspectRatio="xMidYMid meet"
            className="qstory-route-svg"
          >
            <defs>
              <linearGradient id="qstoryRoute" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0193FB" />
                <stop offset="100%" stopColor="#0062FA" />
              </linearGradient>
            </defs>
            <rect width="200" height="56" rx="10" fill="#E8F3FC" />
            <path
              d="M16 38 C46 36 58 16 90 18 C122 20 136 36 184 16"
              fill="none"
              stroke="url(#qstoryRoute)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="16" cy="38" r="4.5" fill="#0062FA" stroke="#fff" strokeWidth="1.5" />
            <circle cx="184" cy="16" r="4.5" fill="#0193FB" stroke="#fff" strokeWidth="1.5" />
          </svg>
          <p className="qstory-route-meta">
            {selectedDests.length} {t("experience.story.plan.stops")} · {selectedDays}{" "}
            {t("experience.story.plan.daysUnit")}
          </p>
        </div>
      </section>

      <div className="qstory-cta">{t("experience.story.plan.cta")}</div>
    </div>
  );
}

/**
 * Phone 2 — Vehicle selection + live estimated budget.
 */
export function StoryVehiclesScreen({ reduceMotion }: { reduceMotion: boolean }) {
  const t = useTranslations();

  return (
    <div className="qstory qstory--vehicles">
      <header className="qstory-top qstory-top--compact">
        <p className="qstory-route-line">{t("experience.story.vehicles.route")}</p>
        <h3 className="qstory-title">{t("experience.story.vehicles.title")}</h3>
      </header>

      <ul className="qstory-fleet">
        {FLEET.map((v, i) => (
          <motion.li
            key={v.id}
            className={`qstory-vcard${v.selected ? " is-selected" : ""}`}
            initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.05 * i, ease: EASE }}
          >
            <div className={`qstory-vicon qstory-vicon--${v.id}`} aria-hidden="true">
              <FleetGlyph kind={v.id} />
            </div>
            <div className="qstory-vbody">
              <div className="qstory-vrow">
                <div>
                  <p className="qstory-vname">{v.name}</p>
                  <p className="qstory-vmeta">{v.meta}</p>
                </div>
                <p className="qstory-vprice">{v.price}</p>
              </div>
            </div>
          </motion.li>
        ))}
      </ul>

      <div className="qstory-budget">
        <div>
          <p className="qstory-budget-label">
            {t("experience.story.vehicles.budgetLabel")}
          </p>
          <p className="qstory-budget-hint">
            {t("experience.story.vehicles.budgetHint")}
          </p>
        </div>
        <p className="qstory-budget-value">
          {t("experience.story.vehicles.budgetValue")}
        </p>
      </div>
    </div>
  );
}

/**
 * Phone 3 — Live journey cycle: chauffeur → GPS → complete → rating.
 */
export function StoryLiveCycle({ reduceMotion }: { reduceMotion: boolean }) {
  const [index, setIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const step = LIVE_STEPS[index] ?? LIVE_STEPS[0];

  useEffect(() => {
    if (reduceMotion) return;
    console.log("Phone slideshow started");
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % LIVE_STEPS.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  return (
    <div ref={rootRef} className="qstory-live">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="qstory-live-frame"
          initial={{ opacity: reduceMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: reduceMotion ? 1 : 0 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <ExperienceJourneyFrame step={step} reduceMotion={reduceMotion} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function FleetGlyph({ kind }: { kind: string }) {
  if (kind === "tuk") {
    return (
      <svg viewBox="0 0 40 28" fill="none" aria-hidden="true">
        <path
          d="M6 20h22l2-8H12L6 20Z"
          fill="currentColor"
          opacity="0.9"
        />
        <circle cx="12" cy="21" r="3.2" fill="#0a1620" />
        <circle cx="26" cy="21" r="3.2" fill="#0a1620" />
        <path d="M12 8h10l4 4H14L12 8Z" fill="currentColor" opacity="0.55" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 40 28" fill="none" aria-hidden="true">
      <path
        d="M5 18h30l-1.5-6.5a3 3 0 0 0-2.9-2.3H9.4a3 3 0 0 0-2.9 2.3L5 18Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M10 9.2 12 6.2a2 2 0 0 1 1.6-.8h12.8a2 2 0 0 1 1.6.8l2 3"
        stroke="currentColor"
        strokeWidth="1.4"
        opacity="0.7"
      />
      <circle cx="11" cy="18" r="2.8" fill="#0a1620" />
      <circle cx="29" cy="18" r="2.8" fill="#0a1620" />
    </svg>
  );
}
