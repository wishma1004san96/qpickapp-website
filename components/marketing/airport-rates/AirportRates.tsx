"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AirportBookingForm,
  type AirportBookingState,
} from "@/components/marketing/airport-rates/AirportBookingForm";
import { AirportDestinationCanvas } from "@/components/marketing/airport-rates/AirportDestinationCanvas";
import { AirportTripSummary } from "@/components/marketing/airport-rates/AirportTripSummary";
import { useTranslations } from "@/components/i18n/locale-provider";
import { Container } from "@/components/ui/container";
import {
  POPULAR_AIRPORT_LABELS,
  formatAirportFare,
  searchAirportRates,
  type AirportRate,
} from "@/lib/airport-rates";
import { resolveDestinationScene } from "@/lib/airport-destination-scenes";
import { saveAirportTransferPrefill } from "@/lib/airport-transfer-prefill";

const EASE = [0.22, 1, 0.36, 1] as const;

function displayLabel(rate: AirportRate): string {
  return POPULAR_AIRPORT_LABELS[rate.code] ?? rate.destination;
}

function queryMatchesSelected(query: string, rate: AirportRate): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return false;
  const label = displayLabel(rate).toLowerCase();
  const dest = rate.destination.toLowerCase();
  return (
    q === dest ||
    q === label ||
    dest.startsWith(q) ||
    label.startsWith(q) ||
    rate.code.toLowerCase() === q
  );
}

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function AirportRates() {
  const t = useTranslations();
  const router = useRouter();
  const reduceMotion = useReducedMotion() ?? false;
  const summaryRef = useRef<HTMLDivElement>(null);
  const skipAutoRef = useRef(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [booking, setBooking] = useState(false);
  const [state, setState] = useState<AirportBookingState>(() => ({
    query: "",
    selected: null,
    date: todayISO(),
    time: "12:00",
    passengers: 1,
    luggage: "medium",
    vehicle: "sedan",
    nationality: "",
    specialRequest: "",
  }));

  const scene = useMemo(
    () => resolveDestinationScene(state.selected?.destination ?? state.query),
    [state.selected?.destination, state.query],
  );

  const patch = useCallback((partial: Partial<AirportBookingState>) => {
    setState((s) => ({ ...s, ...partial }));
  }, []);

  const selectDestination = useCallback((rate: AirportRate) => {
    skipAutoRef.current = true;
    setState((s) => ({
      ...s,
      selected: rate,
      query: displayLabel(rate),
    }));
    setDropdownOpen(false);
    window.setTimeout(() => {
      skipAutoRef.current = false;
    }, 280);
  }, []);

  const onQueryChange = useCallback((value: string) => {
    if (!value.trim()) {
      setState((s) => ({ ...s, query: "", selected: null }));
      setDropdownOpen(false);
      return;
    }
    setState((s) => ({ ...s, query: value }));
    setDropdownOpen(true);
  }, []);

  /** Unique-match auto-select — same pricing search as before. */
  useEffect(() => {
    const q = state.query.trim();
    if (!q || skipAutoRef.current) return;

    const id = window.setTimeout(() => {
      if (skipAutoRef.current) return;
      const results = searchAirportRates(q, 3);

      if (results.length === 1) {
        const only = results[0];
        if (
          state.selected?.code === only.code &&
          queryMatchesSelected(q, only)
        ) {
          setDropdownOpen(false);
          return;
        }
        selectDestination(only);
        return;
      }

      if (results.length > 1) {
        if (state.selected && !queryMatchesSelected(q, state.selected)) {
          setState((s) => ({ ...s, selected: null }));
        }
        setDropdownOpen(true);
        return;
      }

      if (state.selected && !queryMatchesSelected(q, state.selected)) {
        setState((s) => ({ ...s, selected: null }));
      }
    }, 160);

    return () => window.clearTimeout(id);
  }, [state.query, state.selected, selectDestination]);

  function onBookRide() {
    if (!state.selected || booking) return;
    setBooking(true);
    saveAirportTransferPrefill({
      destination: state.selected.destination,
      destinationCode: state.selected.code,
      date: state.date,
      time: state.time,
      passengers: state.passengers,
      luggage: state.luggage,
      vehicle: state.vehicle,
      officialFareLkr: state.selected.rate,
      nationality: state.nationality,
      specialRequest: state.specialRequest,
    });
    window.setTimeout(() => {
      router.push("/airport-transfer");
    }, 420);
  }

  const formLabels = {
    title: t("pages.airport.booking.title"),
    from: t("pages.airport.booking.from"),
    to: t("pages.airport.booking.to"),
    toPlaceholder: t("pages.airport.booking.toPlaceholder"),
    searching: t("pages.airport.booking.searching"),
    noResults: t("pages.airport.booking.noResults"),
    date: t("pages.airport.booking.date"),
    time: t("pages.airport.booking.time"),
    passengers: t("pages.airport.booking.passengers"),
    adult: t("pages.airport.booking.adult"),
    luggage: t("pages.airport.booking.luggage"),
    luggageOptions: {
      cabin: t("pages.airport.booking.luggageOptions.cabin"),
      medium: t("pages.airport.booking.luggageOptions.medium"),
      large: t("pages.airport.booking.luggageOptions.large"),
    },
    vehicle: t("pages.airport.booking.vehicle"),
    vehicleOptions: {
      mini: t("pages.airport.booking.vehicleOptions.mini"),
      sedan: t("pages.airport.booking.vehicleOptions.sedan"),
      van: t("pages.airport.booking.vehicleOptions.van"),
      suv: t("pages.airport.booking.vehicleOptions.suv"),
    },
    nationality: t("pages.airport.booking.nationality"),
    nationalityPlaceholder: t("pages.airport.booking.nationalityPlaceholder"),
    nationalities: [
      t("pages.airport.booking.nationalities.lk"),
      t("pages.airport.booking.nationalities.in"),
      t("pages.airport.booking.nationalities.uk"),
      t("pages.airport.booking.nationalities.us"),
      t("pages.airport.booking.nationalities.de"),
      t("pages.airport.booking.nationalities.au"),
      t("pages.airport.booking.nationalities.cn"),
      t("pages.airport.booking.nationalities.other"),
    ],
    special: t("pages.airport.booking.special"),
    specialPlaceholder: t("pages.airport.booking.specialPlaceholder"),
    distance: t("pages.airport.booking.distance"),
    duration: t("pages.airport.booking.duration"),
    officialPrice: t("pages.airport.booking.officialPrice"),
    cta: t("pages.airport.booking.cta"),
    ctaLoading: t("pages.airport.booking.ctaLoading"),
  };

  const summaryLabels = {
    title: t("pages.airport.booking.summaryTitle"),
    route: t("pages.airport.booking.route"),
    distance: t("pages.airport.booking.distance"),
    duration: t("pages.airport.booking.duration"),
    vehicle: t("pages.airport.booking.vehicle"),
    passengers: t("pages.airport.booking.passengers"),
    date: t("pages.airport.booking.date"),
    time: t("pages.airport.booking.time"),
    fare: t("pages.airport.booking.officialPrice"),
    vehicleOptions: formLabels.vehicleOptions,
    luggageOptions: formLabels.luggageOptions,
    pending: t("pages.airport.booking.destinationPending"),
  };

  return (
    <section
      className="relative isolate overflow-hidden border-b border-ink/5 bg-[radial-gradient(ellipse_70%_50%_at_20%_0%,rgb(0_98_250_/_0.1),transparent_55%),radial-gradient(ellipse_50%_40%_at_90%_20%,rgb(1_147_251_/_0.08),transparent_50%),linear-gradient(180deg,#ffffff_0%,#f5f9ff_45%,#ffffff_100%)] py-8 pb-28 sm:py-10 lg:py-12 lg:pb-12"
      aria-labelledby="airport-transfer-booking-heading"
    >
      <Container className="relative z-[1] !max-w-[1400px]">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="max-w-2xl"
        >
          <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand uppercase">
            {t("pages.airport.booking.eyebrow")}
          </p>
          <h2
            id="airport-transfer-booking-heading"
            className="mt-2 font-display text-[clamp(1.55rem,3vw,2.15rem)] leading-[1.12] font-semibold tracking-[-0.03em] text-balance text-ink"
          >
            {t("pages.airport.booking.heading")}
          </h2>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-pretty text-ink-muted">
            {t("pages.airport.booking.sub")}
          </p>
        </motion.div>

        <div className="mt-8 grid items-stretch gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-8">
          <AirportBookingForm
            state={state}
            scene={scene}
            labels={formLabels}
            dropdownOpen={dropdownOpen}
            onDropdownOpenChange={setDropdownOpen}
            onQueryChange={onQueryChange}
            onSelectDestination={selectDestination}
            onChange={patch}
            onBookRide={onBookRide}
            booking={booking}
          />

          <div className="min-h-[22rem] lg:min-h-[40rem]">
            <AirportDestinationCanvas scene={scene} className="h-full min-h-[22rem] lg:min-h-full" />
          </div>
        </div>

        <div ref={summaryRef} className="mt-8 lg:mt-10">
          <AirportTripSummary
            state={state}
            scene={scene}
            labels={summaryLabels}
          />
          <p className="mt-4 text-center text-[0.75rem] leading-relaxed text-pretty text-ink-muted sm:text-left">
            {t("pages.airport.rates.disclaimer")}
          </p>
        </div>
      </Container>

      {/* Mobile sticky price + CTA */}
      <AnimatePresence>
        {state.selected ? (
          <motion.div
            initial={reduceMotion ? false : { y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduceMotion ? undefined : { y: 24, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/8 bg-[#050b12]/94 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgb(10_22_32_/_0.28)] backdrop-blur-xl lg:hidden"
          >
            <div className="mx-auto flex max-w-lg items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.6875rem] text-[#f3f6f7]/55">
                  {state.selected.destination}
                </p>
                <p className="font-display text-lg font-semibold tracking-tight text-[#f3f6f7]">
                  {formatAirportFare(state.selected.rate)}
                </p>
              </div>
              <button
                type="button"
                disabled={booking}
                onClick={onBookRide}
                className="relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-[14px] border border-white/15 bg-gradient-to-b from-[#2b7dff] to-[#0062fa] px-4 py-3 text-sm font-semibold text-paper shadow-[0_10px_28px_rgb(0_98_250_/_0.4)] disabled:cursor-wait disabled:opacity-80"
              >
                <span
                  className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/15 to-transparent"
                  aria-hidden
                />
                {booking ? (
                  <>
                    <span className="relative h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span className="relative">{t("pages.airport.booking.ctaLoading")}</span>
                  </>
                ) : (
                  <span className="relative">{t("pages.airport.booking.cta")}</span>
                )}
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
