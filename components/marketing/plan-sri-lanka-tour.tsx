"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  useMessages,
  useTranslations,
} from "@/components/i18n/locale-provider";
import { Container } from "@/components/ui/container";

const DAY_OPTIONS = [3, 5, 7, 10] as const;
const TRAVELER_OPTIONS = [1, 2, 4, 6] as const;
const DEST_IDS = ["colombo", "galle", "ella", "sigiriya", "kandy"] as const;
const VEHICLE_IDS = ["sedan", "suv", "van"] as const;
const PICKUP_IDS = ["cmb", "colombo", "galle", "hotel"] as const;
const TOUR_TYPE_IDS = ["private", "honeymoon", "family", "cultural"] as const;

type DestId = (typeof DEST_IDS)[number];
type VehicleId = (typeof VEHICLE_IDS)[number];
type PickupId = (typeof PICKUP_IDS)[number];
type TourTypeId = (typeof TOUR_TYPE_IDS)[number];

/** Rough hub-to-hub km from Colombo / CMB for estimate UX only. */
const DEST_KM: Record<DestId, number> = {
  colombo: 35,
  galle: 125,
  ella: 210,
  sigiriya: 170,
  kandy: 120,
};

const VEHICLE_DAILY: Record<VehicleId, number> = {
  sedan: 18500,
  suv: 24500,
  van: 32000,
};

const TOUR_TYPE_FACTOR: Record<TourTypeId, number> = {
  private: 1,
  honeymoon: 1.12,
  family: 1.08,
  cultural: 1.05,
};

const EASE = [0.22, 1, 0.36, 1] as const;

function formatLkr(value: number) {
  return `LKR ${Math.round(value).toLocaleString("en-LK")}`;
}

type PlanSriLankaTourProps = {
  /** Anchor id for deep links (e.g. `/tours#planner`). */
  id?: string;
  /** Destination for the primary CTA — inquiry on Tours, page link on Home. */
  ctaHref?: string;
};

/**
 * Interactive luxury tour planner — estimate only; confirms in product flow.
 */
export function PlanSriLankaTour({
  id,
  ctaHref = "/support",
}: PlanSriLankaTourProps = {}) {
  const t = useTranslations();
  const { planTour } = useMessages();
  const reduceMotion = useReducedMotion() ?? false;

  const [days, setDays] = useState<(typeof DAY_OPTIONS)[number]>(5);
  const [travelers, setTravelers] =
    useState<(typeof TRAVELER_OPTIONS)[number]>(2);
  const [pickup, setPickup] = useState<PickupId>("cmb");
  const [arrivalDate, setArrivalDate] = useState("");
  const [tourType, setTourType] = useState<TourTypeId>("private");
  const [destinations, setDestinations] = useState<DestId[]>([
    "colombo",
    "galle",
  ]);
  const [vehicle, setVehicle] = useState<VehicleId>("sedan");

  const minArrivalDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  }, []);

  const breakdown = useMemo(() => {
    const destCount = Math.max(destinations.length, 1);
    const dailyBase = VEHICLE_DAILY[vehicle] * days;
    const destFee = destCount * 3500;
    const travelerFee = Math.max(0, travelers - 2) * 2500 * days;
    const subtotal = dailyBase + destFee + travelerFee;
    const typed = Math.round(subtotal * TOUR_TYPE_FACTOR[tourType]);
    const pickupFee = pickup === "cmb" || pickup === "hotel" ? 2500 : 0;
    const total = typed + pickupFee;

    const distanceKm = destinations.reduce(
      (sum, id) => sum + DEST_KM[id],
      pickup === "cmb" ? 25 : 0,
    );
    const drivingHours = Math.max(4, Math.round((distanceKm / 45) * 10) / 10);

    return {
      dailyBase,
      destFee,
      travelerFee,
      pickupFee,
      total,
      distanceKm,
      drivingHours,
    };
  }, [days, destinations, pickup, tourType, travelers, vehicle]);

  const toggleDest = (id: DestId) => {
    setDestinations((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter((d) => d !== id);
      }
      return [...prev, id];
    });
  };

  return (
    <section
      id={id}
      className="relative overflow-hidden bg-map-void py-[var(--section-y-sm)] text-foam sm:py-[var(--section-y-md)] lg:py-[var(--section-y-lg)]"
      aria-labelledby="plan-tour-heading"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-1/4 top-0 h-[55%] w-[60%] rounded-full bg-brand/15 blur-3xl" />
        <div className="absolute -right-1/5 bottom-0 h-[50%] w-[50%] rounded-full bg-brand-bright/10 blur-3xl" />
      </div>

      <Container className="relative z-[1]">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="lg:sticky lg:top-28"
          >
            <p className="inline-flex rounded-full border border-foam/20 bg-foam/10 px-3.5 py-1.5 font-mono text-[0.6875rem] tracking-[0.18em] text-brand-bright uppercase backdrop-blur-md">
              {t("planTour.eyebrow")}
            </p>
            <h2
              id="plan-tour-heading"
              className="mt-5 max-w-[16ch] font-display text-[clamp(1.85rem,4vw,3rem)] leading-[1.1] font-semibold tracking-tight text-balance"
            >
              {t("planTour.heading")}
            </h2>
            <p className="mt-5 max-w-[38ch] text-base leading-relaxed text-pretty text-foam/65 sm:text-lg">
              {t("planTour.sub")}
            </p>
            <ul className="mt-8 space-y-3">
              {planTour.highlights.map((item, i) => (
                <motion.li
                  key={item}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: reduceMotion ? 0 : 0.08 + i * 0.05,
                    ease: EASE,
                  }}
                  className="flex items-start gap-3 text-sm text-foam/80 sm:text-[0.95rem]"
                >
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-bright"
                    aria-hidden="true"
                  />
                  <span className="text-pretty">{item}</span>
                </motion.li>
              ))}
            </ul>

            <ul className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-2">
              {planTour.trust.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-[0.8rem] text-foam/70"
                >
                  <span
                    className="grid h-4 w-4 place-items-center rounded-full bg-brand/25 text-brand-bright"
                    aria-hidden="true"
                  >
                    <svg viewBox="0 0 16 16" width="10" height="10" fill="none">
                      <path
                        d="M3.5 8.2 L6.4 11.1 L12.5 4.8"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
              duration: 0.6,
              delay: reduceMotion ? 0 : 0.08,
              ease: EASE,
            }}
            className="rounded-[1.35rem] border border-foam/15 bg-foam/[0.07] p-5 shadow-[0_24px_60px_rgb(0_0_0_/_0.35)] backdrop-blur-xl sm:p-7"
          >
            <p className="font-mono text-[0.65rem] tracking-[0.16em] text-foam/45 uppercase">
              {t("planTour.cardLabel")}
            </p>

            <ChoiceRow
              label={t("planTour.daysLabel")}
              options={DAY_OPTIONS.map((d) => ({
                id: String(d),
                label: t("planTour.daysOption", { count: d }),
                selected: days === d,
                onSelect: () => setDays(d),
              }))}
            />

            <ChoiceRow
              label={t("planTour.travelersLabel")}
              options={TRAVELER_OPTIONS.map((n) => ({
                id: String(n),
                label: t("planTour.travelersOption", { count: n }),
                selected: travelers === n,
                onSelect: () => setTravelers(n),
              }))}
            />

            <fieldset className="mt-6">
              <legend className="text-sm font-semibold text-foam">
                {t("planTour.arrivalLabel")}
              </legend>
              <label className="mt-3 block">
                <span className="sr-only">{t("planTour.arrivalLabel")}</span>
                <input
                  type="date"
                  min={minArrivalDate}
                  value={arrivalDate}
                  onChange={(event) => setArrivalDate(event.target.value)}
                  className="min-h-11 w-full max-w-xs rounded-[0.9rem] border border-foam/20 bg-foam/[0.06] px-3.5 text-sm text-foam outline-none transition-[border-color,box-shadow] duration-[var(--duration-ui)] focus-visible:border-brand-bright/60 focus-visible:ring-2 focus-visible:ring-brand-bright/40 [color-scheme:dark]"
                />
              </label>
            </fieldset>

            <fieldset className="mt-6">
              <legend className="text-sm font-semibold text-foam">
                {t("planTour.pickupLabel")}
              </legend>
              <div
                className="mt-3 flex flex-wrap gap-2"
                role="radiogroup"
                aria-label={t("planTour.pickupLabel")}
              >
                {PICKUP_IDS.map((id) => {
                  const selected = pickup === id;
                  return (
                    <Chip
                      key={id}
                      selected={selected}
                      onClick={() => setPickup(id)}
                      role="radio"
                      aria-checked={selected}
                    >
                      {planTour.pickups[id]}
                    </Chip>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="mt-6">
              <legend className="text-sm font-semibold text-foam">
                {t("planTour.tourTypeLabel")}
              </legend>
              <div
                className="mt-3 grid gap-2 sm:grid-cols-2"
                role="radiogroup"
                aria-label={t("planTour.tourTypeLabel")}
              >
                {TOUR_TYPE_IDS.map((id) => {
                  const selected = tourType === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setTourType(id)}
                      className={[
                        "rounded-[0.9rem] border px-3.5 py-3 text-left transition-[background-color,border-color,box-shadow] duration-[var(--duration-ui)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright/50",
                        selected
                          ? "border-brand bg-brand/20 shadow-[var(--shadow-glow-brand)]"
                          : "border-foam/15 bg-foam/[0.04] hover:border-foam/30",
                      ].join(" ")}
                    >
                      <span className="block text-sm font-semibold text-foam">
                        {planTour.tourTypes[id].label}
                      </span>
                      <span className="mt-0.5 block text-[0.72rem] text-pretty text-foam/55">
                        {planTour.tourTypes[id].meta}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="mt-6">
              <legend className="text-sm font-semibold text-foam">
                {t("planTour.destinationsLabel")}
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {DEST_IDS.map((id) => {
                  const selected = destinations.includes(id);
                  return (
                    <Chip
                      key={id}
                      selected={selected}
                      onClick={() => toggleDest(id)}
                      aria-pressed={selected}
                    >
                      {planTour.destinations[id]}
                    </Chip>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="mt-6">
              <legend className="text-sm font-semibold text-foam">
                {t("planTour.vehicleLabel")}
              </legend>
              <div
                className="mt-3 grid gap-2 sm:grid-cols-3"
                role="radiogroup"
                aria-label={t("planTour.vehicleLabel")}
              >
                {VEHICLE_IDS.map((id) => {
                  const selected = vehicle === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setVehicle(id)}
                      className={[
                        "rounded-[0.9rem] border px-3 py-3 text-left transition-[background-color,border-color,box-shadow] duration-[var(--duration-ui)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright/50",
                        selected
                          ? "border-brand bg-brand/20 shadow-[var(--shadow-glow-brand)]"
                          : "border-foam/15 bg-foam/[0.04] hover:border-foam/30",
                      ].join(" ")}
                    >
                      <VehicleThumb kind={id} />
                      <span className="mt-2 block text-sm font-semibold text-foam">
                        {planTour.vehicles[id].label}
                      </span>
                      <span className="mt-0.5 block text-[0.72rem] text-foam/55">
                        {planTour.vehicles[id].meta}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-6 grid gap-3 border-t border-foam/12 pt-5 sm:grid-cols-2">
              <Stat
                label={t("planTour.distanceLabel")}
                value={t("planTour.distanceValue", {
                  km: breakdown.distanceKm,
                })}
                animateKey={`${breakdown.distanceKm}`}
                reduceMotion={reduceMotion}
              />
              <Stat
                label={t("planTour.hoursLabel")}
                value={t("planTour.hoursValue", {
                  hours: breakdown.drivingHours,
                })}
                animateKey={`${breakdown.drivingHours}`}
                reduceMotion={reduceMotion}
              />
            </div>

            <div className="mt-5 rounded-[1rem] border border-foam/12 bg-map-void/40 p-4">
              <p className="font-mono text-[0.65rem] tracking-[0.14em] text-foam/45 uppercase">
                {t("planTour.breakdownLabel")}
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <BreakdownRow
                  label={t("planTour.breakdownDaily")}
                  value={breakdown.dailyBase}
                  reduceMotion={reduceMotion}
                />
                <BreakdownRow
                  label={t("planTour.breakdownDestinations")}
                  value={breakdown.destFee}
                  reduceMotion={reduceMotion}
                />
                {breakdown.travelerFee > 0 ? (
                  <BreakdownRow
                    label={t("planTour.breakdownTravelers")}
                    value={breakdown.travelerFee}
                    reduceMotion={reduceMotion}
                  />
                ) : null}
                {breakdown.pickupFee > 0 ? (
                  <BreakdownRow
                    label={t("planTour.breakdownPickup")}
                    value={breakdown.pickupFee}
                    reduceMotion={reduceMotion}
                  />
                ) : null}
              </ul>
              <div className="mt-3 flex flex-col gap-3 border-t border-foam/12 pt-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-mono text-[0.65rem] tracking-[0.14em] text-foam/45 uppercase">
                    {t("planTour.estimateLabel")}
                  </p>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={breakdown.total}
                      initial={
                        reduceMotion ? false : { opacity: 0, y: 6, filter: "blur(4px)" }
                      }
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={
                        reduceMotion
                          ? undefined
                          : { opacity: 0, y: -4, filter: "blur(4px)" }
                      }
                      transition={{ duration: 0.32, ease: EASE }}
                      className="mt-1 font-display text-[clamp(1.5rem,3vw,2rem)] tracking-tight text-foam"
                    >
                      {formatLkr(breakdown.total)}
                    </motion.p>
                  </AnimatePresence>
                  <p className="mt-1 text-xs text-foam/45">
                    {t("planTour.estimateNote")}
                  </p>
                </div>
                <Link
                  href={ctaHref}
                  className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-brand px-6 text-sm font-medium text-paper transition-[background-color,transform,box-shadow] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] hover:bg-brand-deep motion-safe:hover:-translate-y-px motion-safe:hover:shadow-[var(--shadow-glow-brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright/50"
                >
                  {t("planTour.cta")}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

function ChoiceRow({
  label,
  options,
}: {
  label: string;
  options: readonly {
    id: string;
    label: string;
    selected: boolean;
    onSelect: () => void;
  }[];
}) {
  return (
    <fieldset className="mt-5">
      <legend className="text-sm font-semibold text-foam">{label}</legend>
      <div
        className="mt-3 flex flex-wrap gap-2"
        role="radiogroup"
        aria-label={label}
      >
        {options.map((opt) => (
          <Chip
            key={opt.id}
            selected={opt.selected}
            onClick={opt.onSelect}
            role="radio"
            aria-checked={opt.selected}
            solid
          >
            {opt.label}
          </Chip>
        ))}
      </div>
    </fieldset>
  );
}

function Chip({
  selected,
  onClick,
  children,
  solid = false,
  role,
  "aria-checked": ariaChecked,
  "aria-pressed": ariaPressed,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  solid?: boolean;
  role?: "radio";
  "aria-checked"?: boolean;
  "aria-pressed"?: boolean;
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={ariaChecked}
      aria-pressed={ariaPressed}
      onClick={onClick}
      className={[
        "min-h-10 rounded-full px-3.5 text-sm transition-[background-color,border-color,color] duration-[var(--duration-ui)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright/50",
        selected
          ? solid
            ? "border border-brand bg-brand text-paper font-medium"
            : "border border-brand-bright/60 bg-brand/25 text-foam"
          : "border border-foam/15 bg-foam/5 text-foam/75 hover:border-foam/30 hover:bg-foam/10",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Stat({
  label,
  value,
  animateKey,
  reduceMotion,
}: {
  label: string;
  value: string;
  animateKey: string;
  reduceMotion: boolean;
}) {
  return (
    <div className="rounded-[0.9rem] border border-foam/12 bg-foam/[0.04] px-3.5 py-3">
      <p className="text-[0.68rem] text-foam/45">{label}</p>
      <AnimatePresence mode="wait">
        <motion.p
          key={animateKey}
          initial={reduceMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="mt-1 text-sm font-semibold text-foam"
        >
          {value}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  reduceMotion,
}: {
  label: string;
  value: number;
  reduceMotion: boolean;
}) {
  return (
    <li className="flex items-baseline justify-between gap-3 text-foam/70">
      <span className="text-pretty">{label}</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={value}
          initial={reduceMotion ? false : { opacity: 0.4 }}
          animate={{ opacity: 1 }}
          className="shrink-0 tabular-nums text-foam/90"
        >
          {formatLkr(value)}
        </motion.span>
      </AnimatePresence>
    </li>
  );
}

function VehicleThumb({ kind }: { kind: VehicleId }) {
  const common = {
    viewBox: "0 0 64 36",
    className: "h-8 w-full text-brand-bright",
    "aria-hidden": true as const,
  };

  if (kind === "sedan") {
    return (
      <svg {...common}>
        <path
          d="M8 24 H56 L52 17 H42 L36 10 H24 L18 17 H12 Z"
          fill="currentColor"
          opacity="0.9"
        />
        <path d="M24 11 H36 L40 17 H20 Z" fill="#B8DAFF" />
        <circle cx="20" cy="25" r="4" fill="#0A1620" />
        <circle cx="46" cy="25" r="4" fill="#0A1620" />
      </svg>
    );
  }
  if (kind === "suv") {
    return (
      <svg {...common}>
        <path
          d="M10 25 H54 V14 H44 L40 9 H22 L16 14 H10 Z"
          fill="currentColor"
          opacity="0.85"
        />
        <path d="M22 10 H40 L42 14 H20 Z" fill="#A8C8E8" />
        <circle cx="20" cy="26" r="4.2" fill="#0A1620" />
        <circle cx="46" cy="26" r="4.2" fill="#0A1620" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M6 25 H58 V13 H14 L10 18 H6 Z" fill="currentColor" opacity="0.8" />
      <path d="M16 13 H40 V9 H18 Z" fill="#C5D8EA" />
      <circle cx="18" cy="26" r="4" fill="#0A1620" />
      <circle cx="30" cy="26" r="4" fill="#0A1620" />
      <circle cx="50" cy="26" r="4" fill="#0A1620" />
    </svg>
  );
}
