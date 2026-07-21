"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Building2,
  Clock,
  Clock3,
  Landmark,
  MapPin,
  Plane,
  Radar,
  Search,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  formatAirportFare,
  getPopularAirportRates,
  POPULAR_AIRPORT_LABELS,
  searchAirportRates,
  type AirportRate,
} from "@/lib/airport-rates";
import {
  formatDistance,
  formatDuration,
  resolveDestinationScene,
} from "@/lib/airport-destination-scenes";
import {
  loadRecentDestinations,
  type RecentDestination,
} from "../recent-searches";
import type { SelectedDestination } from "../types";

const EASE = [0.22, 1, 0.36, 1] as const;

const ATTRACTION_CODES = new Set([
  "S005",
  "D001",
  "H022",
  "M042",
  "G008",
  "B016",
  "H015",
  "K015",
]);

const TRANSFER_HIGHLIGHTS = [
  {
    icon: UserRound,
    title: "Professional chauffeur",
    body: "Licensed drivers, meet you at arrivals with your name board.",
  },
  {
    icon: Clock3,
    title: "Free waiting time",
    body: "Complimentary wait after landing so baggage claim stays calm.",
  },
  {
    icon: Radar,
    title: "Flight tracking",
    body: "We monitor your flight so early or delayed arrivals are covered.",
  },
  {
    icon: Plane,
    title: "Meet & Greet",
    body: "Optional assistance through the terminal to your waiting vehicle.",
  },
] as const;

type StepDestinationProps = {
  selected: SelectedDestination | null;
  onSelect: (dest: SelectedDestination) => void;
};

function displayLabel(rate: AirportRate): string {
  return POPULAR_AIRPORT_LABELS[rate.code] ?? rate.destination;
}

function categorize(rate: AirportRate): SelectedDestination["category"] {
  if (ATTRACTION_CODES.has(rate.code)) return "attraction";
  return "city";
}

function toSelected(
  rate: AirportRate,
  category: SelectedDestination["category"],
): SelectedDestination {
  const label = displayLabel(rate);
  return {
    rate,
    label,
    category,
    scene: resolveDestinationScene(rate.destination),
    place: null,
  };
}

export function StepDestination({ selected, onSelect }: StepDestinationProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(selected?.label ?? "");
  const [focused, setFocused] = useState(false);
  const [recents, setRecents] = useState<RecentDestination[]>([]);

  useEffect(() => {
    setRecents(loadRecentDestinations());
  }, []);

  const popular = useMemo(() => getPopularAirportRates(), []);

  const attractions = useMemo(
    () =>
      popular.filter((r) => ATTRACTION_CODES.has(r.code)).slice(0, 6),
    [popular],
  );

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return searchAirportRates(q, 10);
  }, [query]);

  const showResults = focused && query.trim().length > 0;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-brand uppercase">
          Step 1 of 5
        </p>
        <h2 className="font-display text-[clamp(1.65rem,3.5vw,2.35rem)] font-semibold tracking-tight text-ink">
          Where are you going?
        </h2>
        <p className="max-w-2xl text-[0.9375rem] leading-relaxed text-ink/60 sm:text-base">
          Private transfer from Bandaranaike International (CMB) — choose your
          drop-off city or landmark to begin.
        </p>
      </header>

      {/* Places-style search */}
      <div className="relative">
        <label htmlFor={inputId} className="sr-only">
          Search destination
        </label>
        <div
          className={`flex items-center gap-3 rounded-[1.35rem] border bg-white/80 px-4 py-3.5 shadow-[0_12px_40px_rgb(10_22_32_/_0.08)] backdrop-blur-xl transition-[border-color,box-shadow] ${
            focused
              ? "border-brand/35 ring-4 ring-brand/10"
              : "border-ink/8"
          }`}
        >
          <Search className="h-5 w-5 shrink-0 text-brand" aria-hidden />
          <input
            ref={inputRef}
            id={inputId}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              window.setTimeout(() => setFocused(false), 180);
            }}
            placeholder="Search cities, beaches, landmarks…"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink/35"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="rounded-full p-1.5 text-ink/40 hover:bg-ink/5 hover:text-ink"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {showResults ? (
          <ul
            role="listbox"
            className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-[1.15rem] border border-ink/8 bg-white/95 py-2 shadow-[0_20px_50px_rgb(10_22_32_/_0.14)] backdrop-blur-xl"
          >
            {results.length === 0 ? (
              <li className="px-4 py-3 text-sm text-ink/50">
                No matches — try a city or landmark name.
              </li>
            ) : (
              results.map((rate) => (
                <li key={rate.code} role="option">
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-brand/[0.06]"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      const dest = toSelected(rate, "search");
                      setQuery(dest.label);
                      onSelect(dest);
                      setFocused(false);
                    }}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/8 text-brand">
                      <MapPin className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">
                        {displayLabel(rate)}
                      </span>
                      <span className="block truncate text-xs text-ink/45">
                        From CMB · Official transfer rate
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-xs font-medium text-brand-deep">
                      {formatAirportFare(rate.rate)}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>

      {selected ? (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="overflow-hidden rounded-[1.35rem] border border-brand/20 bg-map-void text-foam shadow-[0_20px_50px_rgb(10_22_32_/_0.18)] lg:hidden"
        >
          <div className="relative h-40 sm:h-48">
            <Image
              src={selected.scene.image}
              alt={selected.scene.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 640px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-map-void via-map-void/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-[0.6875rem] font-medium tracking-wide text-brand-bright uppercase">
                Selected destination
              </p>
              <p className="mt-1 font-display text-xl font-semibold">
                {selected.label}
              </p>
              <p className="mt-1 text-sm text-foam/65">
                {formatDistance(selected.scene.distanceKm)} ·{" "}
                {formatDuration(selected.scene.durationMin)} ·{" "}
                {formatAirportFare(selected.rate.rate)}
              </p>
            </div>
          </div>
        </motion.div>
      ) : null}

      {recents.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-ink/40" aria-hidden />
            <h3 className="text-sm font-semibold text-ink">Recent searches</h3>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {recents.map((r) => (
              <button
                key={r.code}
                type="button"
                onClick={() => {
                  const match = searchAirportRates(r.code, 1)[0];
                  if (!match) return;
                  const dest = toSelected(match, "search");
                  setQuery(dest.label);
                  onSelect(dest);
                }}
                className="shrink-0 rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-sm font-medium text-ink backdrop-blur-md transition-colors hover:border-brand/30 hover:bg-white"
              >
                {POPULAR_AIRPORT_LABELS[r.code] ?? r.destination}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <DestinationCardGrid
        title="Popular destinations"
        icon={<Sparkles className="h-4 w-4" aria-hidden />}
        rates={popular}
        selectedCode={selected?.rate.code}
        category="popular"
        onPick={(rate, category) => {
          const dest = toSelected(rate, category);
          setQuery(dest.label);
          onSelect(dest);
        }}
      />

      <DestinationCardGrid
        title="Cities"
        icon={<Building2 className="h-4 w-4" aria-hidden />}
        rates={popular.filter((r) => !ATTRACTION_CODES.has(r.code) || r.code === "C002" || r.code === "K015" || r.code === "N015")}
        selectedCode={selected?.rate.code}
        category="city"
        onPick={(rate, category) => {
          const dest = toSelected(rate, category);
          setQuery(dest.label);
          onSelect(dest);
        }}
      />

      {attractions.length > 0 ? (
        <DestinationCardGrid
          title="Landmarks & attractions"
          icon={<Landmark className="h-4 w-4" aria-hidden />}
          rates={attractions}
          selectedCode={selected?.rate.code}
          category="attraction"
          onPick={(rate, category) => {
            const dest = toSelected(rate, category);
            setQuery(dest.label);
            onSelect(dest);
          }}
        />
      ) : null}

      <TransferAssurance />
    </div>
  );
}

function TransferAssurance() {
  return (
    <section
      aria-label="Transfer inclusions"
      className="rounded-[1.35rem] border border-ink/8 bg-gradient-to-br from-white/90 via-[#f4f8fc] to-[#e8f0f8] p-5 shadow-[0_12px_36px_rgb(10_22_32_/_0.06)] sm:p-6"
    >
      <div className="mb-4 max-w-xl">
        <p className="font-mono text-[0.625rem] tracking-[0.18em] text-brand uppercase">
          Included with every transfer
        </p>
        <h3 className="mt-1.5 font-display text-lg font-semibold tracking-tight text-ink sm:text-xl">
          Composed airport arrivals — nothing extra to decide
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-ink/55">
          Map route, distance, travel time, and official fare stay in your
          booking summary as you continue.
        </p>
      </div>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {TRANSFER_HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
          <li
            key={title}
            className="flex gap-3 rounded-[1.1rem] border border-white/80 bg-white/70 px-3.5 py-3.5 backdrop-blur-sm"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/8 text-brand">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">{title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink/50">{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DestinationCardGrid({
  title,
  icon,
  rates,
  selectedCode,
  category,
  onPick,
}: {
  title: string;
  icon: ReactNode;
  rates: AirportRate[];
  selectedCode?: string;
  category: SelectedDestination["category"];
  onPick: (rate: AirportRate, category: SelectedDestination["category"]) => void;
}) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 text-ink/50">
        {icon}
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {rates.map((rate, i) => {
          const scene = resolveDestinationScene(rate.destination);
          const active = selectedCode === rate.code;
          const label = displayLabel(rate);
          return (
            <motion.button
              key={`${category}-${rate.code}`}
              type="button"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.03, ease: EASE }}
              onClick={() => onPick(rate, category)}
              className={`group relative overflow-hidden rounded-[1.25rem] border text-left transition-[transform,box-shadow,border-color] duration-300 ${
                active
                  ? "border-brand shadow-[0_16px_40px_rgb(0_98_250_/_0.22)] ring-2 ring-brand/30"
                  : "border-ink/8 bg-white/60 shadow-[0_8px_24px_rgb(10_22_32_/_0.06)] hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-[0_16px_36px_rgb(10_22_32_/_0.12)]"
              }`}
            >
              <div className="relative h-36 overflow-hidden sm:h-40">
                <Image
                  src={scene.image}
                  alt={scene.imageAlt}
                  fill
                  loading="lazy"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
                <span className="absolute right-3 bottom-3 font-mono text-[0.6875rem] font-semibold text-white drop-shadow">
                  from {formatAirportFare(rate.rate)}
                </span>
              </div>
              <div className="p-3.5">
                <p className="font-display text-base font-semibold text-ink">
                  {label}
                </p>
                <p className="mt-0.5 text-xs text-ink/50">
                  {formatDistance(scene.distanceKm)} ·{" "}
                  {formatDuration(scene.durationMin)}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
