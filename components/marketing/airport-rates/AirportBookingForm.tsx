"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Briefcase,
  CalendarDays,
  Car,
  ChevronDown,
  Clock3,
  MapPin,
  Minus,
  Plane,
  Plus,
  Search,
  UserRound,
  X,
} from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  AIRPORT_ORIGIN,
  formatAirportFare,
  searchAirportRates,
  type AirportRate,
} from "@/lib/airport-rates";
import {
  formatDistance,
  formatDuration,
  type DestinationScene,
} from "@/lib/airport-destination-scenes";
import { VehicleSelection } from "@/components/marketing/vehicle-selection";

const EASE = [0.22, 1, 0.36, 1] as const;

export type LuggageSize = "cabin" | "medium" | "large";
export type VehicleType = "mini" | "sedan" | "van" | "suv";

export type AirportBookingState = {
  query: string;
  selected: AirportRate | null;
  date: string;
  time: string;
  passengers: number;
  luggage: LuggageSize;
  vehicle: VehicleType;
  nationality: string;
  specialRequest: string;
};

type Labels = {
  title: string;
  from: string;
  to: string;
  toPlaceholder: string;
  searching: string;
  noResults: string;
  date: string;
  time: string;
  passengers: string;
  adult: string;
  luggage: string;
  luggageOptions: Record<LuggageSize, string>;
  vehicle: string;
  vehicleOptions: Record<VehicleType, string>;
  nationality: string;
  nationalityPlaceholder: string;
  nationalities: string[];
  special: string;
  specialPlaceholder: string;
  distance: string;
  duration: string;
  officialPrice: string;
  cta: string;
  ctaLoading: string;
};

type AirportBookingFormProps = {
  state: AirportBookingState;
  scene: DestinationScene;
  labels: Labels;
  dropdownOpen: boolean;
  onDropdownOpenChange: (open: boolean) => void;
  onQueryChange: (value: string) => void;
  onSelectDestination: (rate: AirportRate) => void;
  onChange: (patch: Partial<AirportBookingState>) => void;
  onBookRide: () => void;
  booking: boolean;
};

const fieldClass =
  "w-full rounded-[16px] border border-ink/8 bg-white/70 px-3.5 py-3 text-sm text-ink outline-none backdrop-blur-md transition-[border-color,box-shadow] placeholder:text-ink/40 focus:border-brand/35 focus:ring-2 focus:ring-brand/20";

export function AirportBookingForm({
  state,
  scene,
  labels,
  dropdownOpen,
  onDropdownOpenChange,
  onQueryChange,
  onSelectDestination,
  onChange,
  onBookRide,
  booking,
}: AirportBookingFormProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const listId = useId();
  const inputId = useId();
  const searchRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const trimmed = state.query.trim();
  const results = trimmed.length >= 1 ? searchAirportRates(state.query, 8) : [];
  const showList = dropdownOpen && trimmed.length >= 1 && results.length !== 1;

  useEffect(() => {
    setActiveIndex(0);
  }, [trimmed]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!searchRef.current?.contains(e.target as Node)) {
        onDropdownOpenChange(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [onDropdownOpenChange]);

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      onDropdownOpenChange(false);
      return;
    }
    if (!showList) {
      if (e.key === "Enter" && results.length === 1) {
        e.preventDefault();
        onSelectDestination(results[0]);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault();
      onSelectDestination(results[activeIndex]);
    }
  }

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/70 p-5 shadow-[0_24px_64px_rgb(10_22_32_/_0.08),0_0_0_1px_rgb(0_98_250_/_0.04)] backdrop-blur-2xl sm:p-7"
    >
      <div
        className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgb(0_98_250_/_0.14),transparent_68%)] blur-2xl"
        aria-hidden
      />

      <div className="relative">
        <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand uppercase">
          {labels.title}
        </p>

        {/* From */}
        <div className="mt-6">
          <label className="text-xs font-medium text-ink/70">{labels.from}</label>
          <div className="mt-1.5 flex items-center gap-3 rounded-[16px] border border-ink/8 bg-ink/[0.03] px-3.5 py-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-gradient-to-b from-[#2b7dff] to-[#0062fa] text-paper shadow-[0_8px_18px_rgb(0_98_250_/_0.3)]">
              <Plane className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </span>
            <p className="min-w-0 text-sm font-semibold text-pretty text-ink">
              {AIRPORT_ORIGIN}
            </p>
          </div>
        </div>

        {/* To */}
        <div ref={searchRef} className="relative mt-4">
          <label htmlFor={inputId} className="text-xs font-medium text-ink/70">
            {labels.to}
          </label>
          <div className="relative mt-1.5">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-brand"
              strokeWidth={2}
              aria-hidden
            />
            <input
              id={inputId}
              type="search"
              role="combobox"
              aria-expanded={showList}
              aria-controls={listId}
              autoComplete="off"
              spellCheck={false}
              placeholder={labels.toPlaceholder}
              value={state.query}
              onChange={(e) => {
                onQueryChange(e.target.value);
                onDropdownOpenChange(true);
              }}
              onFocus={() => {
                if (trimmed && results.length > 1) onDropdownOpenChange(true);
              }}
              onKeyDown={onKeyDown}
              className={`${fieldClass} pr-10 pl-10`}
            />
            {state.query ? (
              <button
                type="button"
                aria-label="Clear destination"
                onClick={() => onQueryChange("")}
                className="absolute top-1/2 right-2.5 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-ink-muted hover:bg-ink/[0.06]"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            ) : null}
          </div>

          <AnimatePresence>
            {showList ? (
              <motion.div
                id={listId}
                role="listbox"
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: 6 }}
                transition={{ duration: 0.2, ease: EASE }}
                className="absolute z-30 mt-2 max-h-60 w-full overflow-auto rounded-[20px] border border-white/80 bg-white/95 p-1.5 shadow-[0_24px_56px_rgb(10_22_32_/_0.14)] backdrop-blur-xl"
              >
                {results.length === 0 ? (
                  <p className="px-3 py-2.5 text-sm text-ink-muted">
                    {labels.noResults}
                  </p>
                ) : (
                  results.map((rate, index) => (
                    <button
                      key={rate.code}
                      type="button"
                      role="option"
                      aria-selected={index === activeIndex}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => onSelectDestination(rate)}
                      className={`flex w-full items-center justify-between gap-3 rounded-[14px] px-3 py-2.5 text-left text-sm ${
                        index === activeIndex
                          ? "bg-brand/[0.1]"
                          : "hover:bg-ink/[0.04]"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-ink">
                          {rate.destination}
                        </span>
                        <span className="font-mono text-[0.6875rem] text-ink-muted">
                          {rate.code}
                        </span>
                      </span>
                      <span className="shrink-0 font-bold text-brand">
                        {formatAirportFare(rate.rate)}
                      </span>
                    </button>
                  ))
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Date + Time */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-ink/70" htmlFor="airport-date">
              {labels.date}
            </label>
            <div className="relative mt-1.5">
              <CalendarDays
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-brand"
                aria-hidden
              />
              <input
                id="airport-date"
                type="date"
                value={state.date}
                onChange={(e) => onChange({ date: e.target.value })}
                className={`${fieldClass} pl-10`}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-ink/70" htmlFor="airport-time">
              {labels.time}
            </label>
            <div className="relative mt-1.5">
              <Clock3
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-brand"
                aria-hidden
              />
              <input
                id="airport-time"
                type="time"
                value={state.time}
                onChange={(e) => onChange({ time: e.target.value })}
                className={`${fieldClass} pl-10`}
              />
            </div>
          </div>
        </div>

        {/* Passengers */}
        <div className="mt-4">
          <p className="text-xs font-medium text-ink/70">{labels.passengers}</p>
          <div className="mt-1.5 flex items-center justify-between rounded-[16px] border border-ink/8 bg-white/70 px-3.5 py-2.5 backdrop-blur-md">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-ink">
              <UserRound className="h-4 w-4 text-brand" aria-hidden />
              {state.passengers} {labels.adult}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Decrease passengers"
                disabled={state.passengers <= 1}
                onClick={() =>
                  onChange({ passengers: Math.max(1, state.passengers - 1) })
                }
                className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 bg-white text-ink transition hover:border-brand/30 disabled:opacity-40"
              >
                <Minus className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Increase passengers"
                disabled={state.passengers >= 12}
                onClick={() =>
                  onChange({ passengers: Math.min(12, state.passengers + 1) })
                }
                className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 bg-white text-ink transition hover:border-brand/30 disabled:opacity-40"
              >
                <Plus className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        </div>

        {/* Luggage */}
        <div className="mt-4">
          <p className="text-xs font-medium text-ink/70">{labels.luggage}</p>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {(["cabin", "medium", "large"] as const).map((size) => {
              const active = state.luggage === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => onChange({ luggage: size })}
                  className={`rounded-[14px] border px-2 py-2.5 text-center text-xs font-semibold transition ${
                    active
                      ? "border-brand/40 bg-brand/[0.1] text-brand shadow-[0_8px_20px_rgb(0_98_250_/_0.12)]"
                      : "border-ink/8 bg-white/70 text-ink-muted hover:border-brand/20"
                  }`}
                >
                  <Briefcase
                    className={`mx-auto mb-1 h-4 w-4 ${active ? "text-brand" : ""}`}
                    aria-hidden
                  />
                  {labels.luggageOptions[size]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Vehicle */}
        <div className="mt-4">
          <p className="text-xs font-medium text-ink/70">{labels.vehicle}</p>
          <div className="mt-2">
            <VehicleSelection
              vehicleIds={["mini", "sedan", "van", "suv"]}
              selectedId={state.vehicle}
              onSelect={(id) => onChange({ vehicle: id as VehicleType })}
              embedded
              layout="carousel"
              showEta={false}
              showDayNightBadge={false}
            />
          </div>
        </div>

        {/* Nationality */}
        <div className="mt-4">
          <label className="text-xs font-medium text-ink/70" htmlFor="airport-nationality">
            {labels.nationality}
          </label>
          <div className="relative mt-1.5">
            <select
              id="airport-nationality"
              value={state.nationality}
              onChange={(e) => onChange({ nationality: e.target.value })}
              className={`${fieldClass} appearance-none pr-10`}
            >
              <option value="">{labels.nationalityPlaceholder}</option>
              {labels.nationalities.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-ink-muted"
              aria-hidden
            />
          </div>
        </div>

        {/* Special request */}
        <div className="mt-4">
          <label className="text-xs font-medium text-ink/70" htmlFor="airport-special">
            {labels.special}
          </label>
          <textarea
            id="airport-special"
            rows={2}
            value={state.specialRequest}
            onChange={(e) => onChange({ specialRequest: e.target.value })}
            placeholder={labels.specialPlaceholder}
            className={`${fieldClass} mt-1.5 resize-none`}
          />
        </div>

        {/* Price reveal */}
        <AnimatePresence mode="wait">
          {state.selected ? (
            <motion.div
              key={state.selected.code}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="mt-6 space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[16px] border border-ink/8 bg-white/60 px-3.5 py-3">
                  <p className="text-[0.6875rem] font-medium tracking-wide text-ink-muted uppercase">
                    {labels.distance}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink">
                    {formatDistance(scene.distanceKm)}
                  </p>
                </div>
                <div className="rounded-[16px] border border-ink/8 bg-white/60 px-3.5 py-3">
                  <p className="text-[0.6875rem] font-medium tracking-wide text-ink-muted uppercase">
                    {labels.duration}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink">
                    {formatDuration(scene.durationMin)}
                  </p>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[20px] border border-brand/20 bg-gradient-to-br from-[#f7faff] to-[#e8f1fc] p-5 shadow-[0_16px_40px_rgb(0_98_250_/_0.12)]">
                <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-brand to-transparent" aria-hidden />
                <p className="text-xs font-medium text-ink-muted">
                  {labels.officialPrice}
                </p>
                <p className="mt-1 font-display text-[clamp(1.75rem,4vw,2.35rem)] font-semibold tracking-tight text-ink">
                  {formatAirportFare(state.selected.rate)}
                </p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-brand">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  {state.selected.destination}
                </p>
              </div>

              <motion.button
                type="button"
                disabled={booking}
                whileHover={
                  reduceMotion || booking ? undefined : { y: -2 }
                }
                whileTap={
                  reduceMotion || booking ? undefined : { scale: 0.99 }
                }
                onClick={onBookRide}
                className="relative hidden w-full items-center justify-center gap-2 overflow-hidden rounded-[16px] border border-white/20 bg-gradient-to-b from-[#2b7dff] to-[#0062fa] px-6 py-3.5 text-sm font-semibold text-paper shadow-[0_14px_36px_rgb(0_98_250_/_0.35)] backdrop-blur-sm transition-[box-shadow,opacity] hover:shadow-[0_18px_44px_rgb(0_98_250_/_0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-wait disabled:opacity-80 lg:inline-flex"
              >
                <span
                  className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-60"
                  aria-hidden
                />
                {booking ? (
                  <>
                    <span className="relative h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span className="relative">{labels.ctaLoading}</span>
                  </>
                ) : (
                  <span className="relative">{labels.cta}</span>
                )}
              </motion.button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
