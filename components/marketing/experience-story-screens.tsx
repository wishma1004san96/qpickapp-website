"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/brand/wordmark";
import { VehicleCarouselCard } from "@/components/marketing/vehicle-carousel-card";
import {
  QPICK_VEHICLE_ICON_LABELS,
  type QPickVehicleIconId,
} from "@/components/icons/vehicles/types";
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

const STORY_FLEET: {
  iconId: QPickVehicleIconId;
  meta: string;
  price: string;
  selected?: boolean;
}[] = [
  { iconId: "tuk", meta: "3 seats", price: "LKR 2,400" },
  {
    iconId: "sedan",
    meta: "4 seats · A/C",
    price: "LKR 18,500",
    selected: true,
  },
  { iconId: "suv", meta: "6 seats · A/C", price: "LKR 24,000" },
  { iconId: "minivan", meta: "8 seats · A/C", price: "LKR 32,000" },
  { iconId: "highRoofVan", meta: "10 seats · A/C", price: "LKR 48,000" },
  { iconId: "miniBus", meta: "12 seats · A/C", price: "LKR 55,000" },
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

      <div className="qstory-fleet-scroll flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {STORY_FLEET.map((v, i) => {
          const name = QPICK_VEHICLE_ICON_LABELS[v.iconId];
          return (
            <div key={v.iconId} className="shrink-0 scale-[0.72] origin-top-left">
              <VehicleCarouselCard
                id={v.iconId}
                index={i}
                selected={Boolean(v.selected)}
                displayOnly
                name={name}
                priceLabel={v.price}
                subtitle={v.meta}
                showEta={false}
                showDayNightBadge={false}
              />
            </div>
          );
        })}
      </div>

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
