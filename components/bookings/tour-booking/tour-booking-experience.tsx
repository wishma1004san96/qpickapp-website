"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, Suspense } from "react";
import {
  addDaysISO,
  buildSpecialRequestPayload,
  prefillFromPackageSlug,
  todayISO,
} from "@/lib/tours/mappers";
import { fleetVehiclePhoto } from "@/components/icons/vehicles/fleet-catalog";
import {
  QPICK_VEHICLE_ICON_IDS,
  type QPickVehicleIconId,
} from "@/components/icons/vehicles/types";
import {
  getAllDestinations,
} from "@/lib/tours/repository";
import { TourTripSummary } from "./tour-trip-summary";
import { StepAccommodation } from "./steps/step-accommodation";
import { StepContactTour } from "./steps/step-contact-tour";
import { StepDates } from "./steps/step-dates";
import { StepDestinations } from "./steps/step-destinations";
import { StepPreferences } from "./steps/step-preferences";
import { StepRequests } from "./steps/step-requests";
import { StepReview } from "./steps/step-review";
import { StepVehicleTour } from "./steps/step-vehicle-tour";
import {
  TOUR_PLANNER_STEPS,
  type TourPlannerDraft,
  type TourPlannerStep,
} from "./types";

const EASE = [0.22, 1, 0.36, 1] as const;
const SHELL =
  "mx-auto w-full min-w-0 max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10";

const STEP_LABELS: Record<TourPlannerStep, string> = {
  destinations: "Places",
  dates: "Dates",
  vehicle: "Vehicle",
  preferences: "Style",
  accommodation: "Stay",
  requests: "Notes",
  review: "Review",
  contact: "Submit",
};

function initialDraft(): TourPlannerDraft {
  return {
    packageSlug: null,
    packageTitle: null,
    destinations: [],
    startDate: todayISO(),
    numberOfDays: 7,
    vehicleId: "sedan",
    preferences: [],
    accommodation: null,
    specialNotes: "",
    passengerName: "",
    passengerPhone: "",
    passengerEmail: "",
    passengers: 2,
  };
}

function TourBookingExperienceInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion() ?? false;
  const destinations = useMemo(() => getAllDestinations(), []);

  const packageSlugParam = searchParams.get("package");
  const vehicleParam = searchParams.get("vehicle");

  const [step, setStep] = useState<TourPlannerStep>("destinations");
  const [draft, setDraft] = useState<TourPlannerDraft>(() => {
    const base = initialDraft();
    const prefill = prefillFromPackageSlug(packageSlugParam);
    const fleetFromUrl =
      vehicleParam &&
      (QPICK_VEHICLE_ICON_IDS as readonly string[]).includes(vehicleParam)
        ? (vehicleParam as QPickVehicleIconId)
        : null;
    if (!prefill) {
      return fleetFromUrl ? { ...base, vehicleId: fleetFromUrl } : base;
    }
    return {
      ...base,
      packageSlug: prefill.packageSlug,
      packageTitle: prefill.packageTitle,
      destinations: prefill.destinations,
      numberOfDays: prefill.numberOfDays,
      vehicleId: fleetFromUrl ?? prefill.vehicleId,
    };
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const stepIndex = TOUR_PLANNER_STEPS.indexOf(step);
  const progress = ((stepIndex + 1) / TOUR_PLANNER_STEPS.length) * 100;

  const canContinue = useMemo(() => {
    switch (step) {
      case "destinations":
        return draft.destinations.length > 0;
      case "dates":
        return Boolean(draft.startDate) && draft.numberOfDays >= 1;
      case "vehicle":
        return Boolean(draft.vehicleId) && draft.passengers >= 1;
      case "preferences":
      case "accommodation":
      case "requests":
      case "review":
        return true;
      case "contact":
        return (
          draft.passengerName.trim().length > 1 &&
          draft.passengerPhone.trim().length > 5
        );
      default:
        return false;
    }
  }, [step, draft]);

  const goNext = useCallback(() => {
    if (stepIndex < TOUR_PLANNER_STEPS.length - 1) {
      setStep(TOUR_PLANNER_STEPS[stepIndex + 1]);
      setError(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [stepIndex]);

  const goBack = useCallback(() => {
    if (stepIndex > 0) {
      setStep(TOUR_PLANNER_STEPS[stepIndex - 1]);
      setError(null);
    }
  }, [stepIndex]);

  const submit = useCallback(async () => {
    setError(null);
    if (!draft.vehicleId) {
      setError("Select a vehicle.");
      return;
    }
    const photo = fleetVehiclePhoto(draft.vehicleId);
    if (!photo) {
      setError("Invalid vehicle selection.");
      return;
    }

    setSubmitting(true);
    try {
      const endDate = addDaysISO(draft.startDate, draft.numberOfDays);
      const specialRequest = buildSpecialRequestPayload({
        packageTitle: draft.packageTitle,
        preferences: draft.preferences,
        accommodation: draft.accommodation,
        notes: draft.specialNotes,
      });

      const res = await fetch("/api/tour-booking-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passengerName: draft.passengerName.trim(),
          passengerPhone: draft.passengerPhone.trim(),
          passengerEmail: draft.passengerEmail.trim() || null,
          destinations: draft.destinations,
          startDate: draft.startDate,
          endDate: endDate || null,
          numberOfDays: draft.numberOfDays,
          vehicleType: draft.vehicleId,
          passengers: draft.passengers,
          specialRequest,
        }),
      });
      const data = (await res.json()) as {
        item?: { id: string };
        error?: string;
      };
      if (!res.ok || !data.item?.id) {
        setError(data.error ?? "Could not submit tour booking request.");
        return;
      }
      router.push(`/tour-booking/confirmation/${data.item.id}`);
    } catch {
      setError("Could not submit tour booking request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [draft, router]);

  const onContinue = useCallback(() => {
    if (step === "contact") {
      void submit();
      return;
    }
    if (canContinue) goNext();
  }, [step, canContinue, goNext, submit]);

  return (
    <div className="min-h-screen bg-foam">
      <header className="sticky top-0 z-40 border-b border-ink/6 bg-foam/90 backdrop-blur-xl">
        <div className={`${SHELL} flex items-center justify-between gap-4 py-3`}>
          <div className="flex items-center gap-3">
            {stepIndex > 0 ? (
              <button
                type="button"
                onClick={goBack}
                className="rounded-full p-2 text-ink/50 hover:bg-ink/5 hover:text-ink"
                aria-label="Back"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : (
              <Link
                href="/tours"
                className="rounded-full p-2 text-ink/50 hover:bg-ink/5 hover:text-ink"
                aria-label="Back to tours"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
            )}
            <div>
              <p className="font-mono text-[0.625rem] tracking-[0.16em] text-brand uppercase">
                Design your island journey
              </p>
              <p className="text-sm font-semibold text-ink">
                {STEP_LABELS[step]}
              </p>
            </div>
          </div>
          <p className="hidden text-xs text-ink/40 sm:block">
            Step {stepIndex + 1} of {TOUR_PLANNER_STEPS.length}
          </p>
        </div>
        <div className="h-1 w-full bg-ink/5">
          <div
            className="h-full bg-brand transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <div
        className={`${SHELL} grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10 lg:py-10 xl:grid-cols-[minmax(0,1fr)_400px]`}
      >
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              {step === "destinations" ? (
                <StepDestinations
                  destinations={destinations}
                  selected={draft.destinations}
                  onChange={(destinations) =>
                    setDraft((d) => ({ ...d, destinations }))
                  }
                />
              ) : null}
              {step === "dates" ? (
                <StepDates
                  startDate={draft.startDate}
                  numberOfDays={draft.numberOfDays}
                  onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
                />
              ) : null}
              {step === "vehicle" ? (
                <StepVehicleTour
                  selected={draft.vehicleId}
                  passengers={draft.passengers}
                  onSelect={(vehicleId) =>
                    setDraft((d) => ({ ...d, vehicleId }))
                  }
                  onPassengersChange={(passengers) =>
                    setDraft((d) => ({ ...d, passengers }))
                  }
                />
              ) : null}
              {step === "preferences" ? (
                <StepPreferences
                  selected={draft.preferences}
                  onChange={(preferences) =>
                    setDraft((d) => ({ ...d, preferences }))
                  }
                />
              ) : null}
              {step === "accommodation" ? (
                <StepAccommodation
                  selected={draft.accommodation}
                  onSelect={(accommodation) =>
                    setDraft((d) => ({ ...d, accommodation }))
                  }
                />
              ) : null}
              {step === "requests" ? (
                <StepRequests
                  value={draft.specialNotes}
                  onChange={(specialNotes) =>
                    setDraft((d) => ({ ...d, specialNotes }))
                  }
                />
              ) : null}
              {step === "review" ? <StepReview draft={draft} /> : null}
              {step === "contact" ? (
                <StepContactTour
                  name={draft.passengerName}
                  phone={draft.passengerPhone}
                  email={draft.passengerEmail}
                  passengers={draft.passengers}
                  onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>

          {error ? (
            <p
              className="mt-6 rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div className="mt-8 flex gap-3 lg:hidden">
            <button
              type="button"
              disabled={!canContinue || submitting}
              onClick={onContinue}
              className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl bg-gradient-to-b from-[#2b7dff] to-[#0062fa] text-sm font-semibold text-paper disabled:opacity-40"
            >
              {step === "contact" ? "Submit tour request" : "Continue"}
            </button>
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-24">
            <TourTripSummary
              draft={draft}
              step={step}
              canContinue={canContinue}
              submitting={submitting}
              onContinue={onContinue}
              destinationsCatalog={destinations}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TourBookingExperience() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center bg-foam text-sm text-ink/50">
          Loading planner…
        </div>
      }
    >
      <TourBookingExperienceInner />
    </Suspense>
  );
}
