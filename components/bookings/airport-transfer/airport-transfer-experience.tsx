"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { searchAirportRates } from "@/lib/airport-rates";
import { resolveDestinationScene } from "@/lib/airport-destination-scenes";
import { POPULAR_AIRPORT_LABELS } from "@/lib/airport-rates";
import { consumeAirportTransferPrefill } from "@/lib/airport-transfer-prefill";
import { BookingSidePanel } from "./booking-side-panel";
import { buildSpecialRequestPayload, todayISO } from "./helpers";
import { saveRecentDestination } from "./recent-searches";
import { StepArrival } from "./steps/step-arrival";
import { StepDestination } from "./steps/step-destination";
import { StepPassenger } from "./steps/step-passenger";
import { StepSummary } from "./steps/step-summary";
import { StepVehicle } from "./steps/step-vehicle";
import type {
  AirportTransferDraft,
  ArrivalInfo,
  BookingStep,
  PassengerInfo,
  SelectedDestination,
  VehicleId,
} from "./types";
import { BOOKING_STEPS } from "./types";
import { getTransferVehicle } from "./vehicles";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Tailwind `lg` — matches side panel breakpoint. */
const LG_MIN_WIDTH_PX = 1024;

function useMinLgViewport(): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${LG_MIN_WIDTH_PX}px)`);
    const sync = () => setMatches(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return matches;
}

/** Full-bleed booking shell — ~1600px, not the marketing Container. */
const SHELL =
  "mx-auto w-full min-w-0 max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10";

const STEP_LABELS: Record<BookingStep, string> = {
  destination: "Where",
  vehicle: "Vehicle",
  arrival: "Flight",
  passenger: "Details",
  summary: "Review",
};

function initialArrival(): ArrivalInfo {
  return {
    flightNumber: "",
    arrivalDate: todayISO(),
    arrivalTime: "12:00",
    airline: "",
    meetAndGreet: true,
  };
}

function initialPassenger(): PassengerInfo {
  return {
    name: "",
    phone: "",
    whatsapp: "",
    email: "",
    nationality: "",
    specialRequests: "",
  };
}

export function AirportTransferExperience() {
  const router = useRouter();
  const isLgViewport = useMinLgViewport();
  const reduceMotion = useReducedMotion() ?? false;
  const [step, setStep] = useState<BookingStep>("destination");
  const [draft, setDraft] = useState<AirportTransferDraft>({
    destination: null,
    vehicleId: null,
    arrival: initialArrival(),
    passenger: initialPassenger(),
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const prefill = consumeAirportTransferPrefill();
    if (!prefill) return;
    const match = searchAirportRates(
      prefill.destinationCode || prefill.destination,
      1,
    )[0];
    if (match) {
      const label =
        POPULAR_AIRPORT_LABELS[match.code] ?? match.destination;
      const dest: SelectedDestination = {
        rate: match,
        label,
        category: "popular",
        scene: resolveDestinationScene(match.destination),
        place: null,
      };
      setDraft((d) => ({
        ...d,
        destination: dest,
        vehicleId: (["mini", "sedan", "van", "suv"].includes(prefill.vehicle)
          ? prefill.vehicle
          : "sedan") as VehicleId,
        arrival: {
          ...d.arrival,
          arrivalDate: prefill.date || todayISO(),
          arrivalTime: prefill.time || "12:00",
        },
        passenger: {
          ...d.passenger,
          nationality: prefill.nationality || "",
          specialRequests: prefill.specialRequest || "",
        },
      }));
    }
  }, []);

  const stepIndex = BOOKING_STEPS.indexOf(step);
  const progress = ((stepIndex + 1) / BOOKING_STEPS.length) * 100;

  const canContinue = useMemo(() => {
    switch (step) {
      case "destination":
        return Boolean(draft.destination);
      case "vehicle":
        return Boolean(draft.vehicleId);
      case "arrival":
        return Boolean(
          draft.arrival.arrivalDate && draft.arrival.arrivalTime,
        );
      case "passenger":
        return Boolean(
          draft.passenger.name.trim() && draft.passenger.phone.trim(),
        );
      case "summary":
        return true;
      default:
        return false;
    }
  }, [step, draft]);

  const goNext = useCallback(() => {
    setError(null);
    if (!canContinue) {
      if (step === "destination") {
        setError("Please choose where you are going.");
      } else if (step === "vehicle") {
        setError("Please select a vehicle.");
      } else if (step === "passenger") {
        setError("Name and phone are required.");
      } else if (step === "arrival") {
        setError("Arrival date and time are required.");
      }
      return;
    }
    if (step === "destination" && draft.destination) {
      saveRecentDestination(draft.destination.rate);
    }
    const next = BOOKING_STEPS[stepIndex + 1];
    if (next) {
      setStep(next);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [canContinue, draft.destination, step, stepIndex]);

  const goBack = useCallback(() => {
    setError(null);
    const prev = BOOKING_STEPS[stepIndex - 1];
    if (prev) {
      setStep(prev);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [stepIndex]);

  const submit = useCallback(async () => {
    if (!draft.destination || !draft.vehicleId) return;
    const vehicle = getTransferVehicle(draft.vehicleId);
    if (!vehicle) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/airport-transfer-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passengerName: draft.passenger.name.trim(),
          passengerPhone: draft.passenger.phone.trim(),
          passengerEmail: draft.passenger.email.trim() || null,
          nationality: draft.passenger.nationality || null,
          destinationLabel: draft.destination.rate.destination,
          destinationCode: draft.destination.rate.code,
          officialFareLkr: draft.destination.rate.rate,
          transferDate: draft.arrival.arrivalDate,
          transferTime: draft.arrival.arrivalTime,
          passengers: vehicle.passengers,
          luggage: vehicle.luggageSize,
          vehicleType: draft.vehicleId,
          specialRequest: buildSpecialRequestPayload(
            draft.arrival,
            draft.passenger,
          ),
        }),
      });

      const data = (await res.json()) as {
        item?: { id: string };
        error?: string;
      };

      if (!res.ok || !data.item?.id) {
        setError(data.error ?? "Could not submit your transfer request.");
        return;
      }

      router.push(`/airport-transfer/confirmation/${data.item.id}`);
    } catch {
      setError("Could not submit your transfer request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [draft, router]);

  const onPrimaryAction = useCallback(() => {
    if (step === "summary") {
      void submit();
    } else {
      goNext();
    }
  }, [goNext, step, submit]);

  return (
    <main className="relative min-h-svh bg-foam">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_45%_at_0%_0%,rgb(0_98_250_/_0.08),transparent_50%),radial-gradient(50%_40%_at_100%_0%,rgb(10_22_32_/_0.04),transparent_45%)]"
        aria-hidden
      />

      {/* Compact sticky header */}
      <div className="sticky top-0 z-30 border-b border-ink/6 bg-white/80 pt-[4.5rem] backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 sm:pt-[4.75rem]">
        <div className={`${SHELL} py-3 sm:py-3.5`}>
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <div className="min-w-0">
              <p className="font-mono text-[0.625rem] tracking-[0.2em] text-brand uppercase">
                Q Pick · Airport Chauffeur
              </p>
              <h1 className="font-display text-base font-semibold tracking-tight text-ink sm:text-lg">
                Private transfer from CMB
              </h1>
            </div>

            <nav
              aria-label="Booking progress"
              className="flex max-w-full items-center gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {BOOKING_STEPS.map((s, i) => {
                const active = i === stepIndex;
                const done = i < stepIndex;
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={i > stepIndex}
                    onClick={() => {
                      if (i < stepIndex) {
                        setStep(s);
                        setError(null);
                      }
                    }}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold transition-colors ${
                      active
                        ? "bg-brand text-paper"
                        : done
                          ? "bg-brand/10 text-brand-deep"
                          : "bg-ink/5 text-ink/35"
                    }`}
                  >
                    <span className="font-mono">{i + 1}</span>
                    <span className="hidden sm:inline">{STEP_LABELS[s]}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div
            className="mt-2.5 h-0.5 overflow-hidden rounded-full bg-ink/8"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Booking progress"
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand to-[#2b7dff]"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.45, ease: EASE }}
            />
          </div>
        </div>
      </div>

      {/* Two-column desktop layout */}
      <div className={`${SHELL} relative pb-32 pt-6 lg:pb-12 lg:pt-8`}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.42fr)] lg:items-start xl:grid-cols-[minmax(0,1.65fr)_minmax(360px,0.9fr)] xl:gap-10">
          {/* LEFT — booking flow (~65%) */}
          <div className="min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                {step === "destination" ? (
                  <StepDestination
                    selected={draft.destination}
                    onSelect={(destination) =>
                      setDraft((d) => ({ ...d, destination }))
                    }
                  />
                ) : null}
                {step === "vehicle" && draft.destination ? (
                  <StepVehicle
                    destination={draft.destination}
                    selectedId={draft.vehicleId}
                    onSelect={(vehicleId) =>
                      setDraft((d) => ({ ...d, vehicleId }))
                    }
                  />
                ) : null}
                {step === "arrival" ? (
                  <StepArrival
                    value={draft.arrival}
                    onChange={(patch) =>
                      setDraft((d) => ({
                        ...d,
                        arrival: { ...d.arrival, ...patch },
                      }))
                    }
                  />
                ) : null}
                {step === "passenger" ? (
                  <StepPassenger
                    value={draft.passenger}
                    onChange={(patch) =>
                      setDraft((d) => ({
                        ...d,
                        passenger: { ...d.passenger, ...patch },
                      }))
                    }
                  />
                ) : null}
                {step === "summary" &&
                draft.destination &&
                draft.vehicleId ? (
                  <StepSummary
                    destination={draft.destination}
                    vehicleId={draft.vehicleId}
                    arrival={draft.arrival}
                    passenger={draft.passenger}
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>

            {error ? (
              <p className="mt-6 text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}

            {/* Desktop back — continue lives in side panel */}
            {stepIndex > 0 ? (
              <div className="mt-8 hidden lg:block">
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center gap-2 rounded-2xl border border-ink/10 bg-white/80 px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-white"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Back
                </button>
              </div>
            ) : null}
          </div>

          {/* RIGHT — sticky summary (~35%); mount only at lg+ so Leaflet never runs in a hidden mobile container */}
          {isLgViewport ? (
            <div className="relative min-w-0">
              <div className="sticky top-[7.5rem]">
                <BookingSidePanel
                  step={step}
                  destination={draft.destination}
                  vehicleId={draft.vehicleId}
                  arrival={draft.arrival}
                  passenger={draft.passenger}
                  canContinue={canContinue}
                  submitting={submitting}
                  onContinue={onPrimaryAction}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile / tablet sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/8 bg-white/90 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_40px_rgb(10_22_32_/_0.1)] backdrop-blur-xl lg:hidden">
        <div className={`${SHELL} flex items-center gap-3`}>
          {stepIndex > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-ink/10 bg-white text-ink transition-colors hover:bg-foam"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : null}

          <button
            type="button"
            disabled={
              submitting || (step === "summary" ? false : !canContinue)
            }
            onClick={onPrimaryAction}
            className="inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-[#2b7dff] to-[#0062fa] px-5 text-sm font-semibold text-paper shadow-[0_12px_28px_rgb(0_98_250_/_0.35)] transition-[transform,filter,opacity] hover:brightness-110 disabled:opacity-40 motion-safe:active:scale-[0.98]"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Submitting…
              </>
            ) : step === "summary" ? (
              "Confirm transfer request"
            ) : (
              <>
                Continue
                <ChevronRight className="h-4 w-4" aria-hidden />
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}

export function AirportTransferBookingPage() {
  return <AirportTransferExperience />;
}

export function AirportTransferBookingForm() {
  return <AirportTransferExperience />;
}
