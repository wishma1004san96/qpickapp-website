"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  ChevronRight,
  Crosshair,
  Loader2,
  Map,
  MapPin,
  Navigation,
  Timer,
} from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useState,
  type ReactNode,
} from "react";
import {
  useMessages,
  useTranslations,
} from "@/components/i18n/locale-provider";
import { LocationPickerDynamic } from "@/components/maps/LocationPickerDynamic";
import { RideMapDynamic } from "@/components/maps/RideMapDynamic";
import { NominatimAutocomplete } from "@/components/marketing/nominatim-autocomplete";
import { RouteSelection } from "@/components/marketing/route-selection";
import { VehicleSelection } from "@/components/marketing/vehicle-selection";
import {
  GeolocationRequestError,
  resolveCurrentLocation,
} from "@/lib/osm/geolocation";
import type {
  DrivingRouteEstimate,
  DrivingRoutesResponse,
  SelectedPlace,
} from "@/lib/osm/types";
import { OpenRouteServiceError } from "@/lib/openrouteservice";
import { fetchRideFare } from "@/lib/ride-fare-client";
import {
  formatLkr,
  FREE_WAITING_MINUTES,
  WAITING_RATE_PER_MIN,
  type SurgeCondition,
  type TaxiFareBreakdown,
  type TaxiVehicleId,
} from "@/lib/taxi-fare";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Preview vehicle for route-card fares before the user picks a ride */
const ROUTE_FARE_PREVIEW_VEHICLE: TaxiVehicleId = "tuk";

const inputClass =
  "min-h-11 w-full rounded-[0.9rem] border border-ink/10 bg-white/70 px-3.5 text-sm text-ink shadow-[0_1px_0_rgb(255_255_255_/_0.8)] outline-none backdrop-blur-md transition-[border-color,box-shadow] duration-[var(--duration-ui)] placeholder:text-ink/35 focus-visible:border-brand/35 focus-visible:ring-2 focus-visible:ring-brand/25 disabled:opacity-60";

function parseNonNeg(raw: string): number {
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

type PickerTarget = "pickup" | "destination" | null;
type StepId = 1 | 2 | 3;

/**
 * Taxi fare estimator — 3-step ride booking flow.
 * 1 · Pickup & Destination → 2 · Vehicle → 3 · Fare Summary + Book Now
 */
export function TaxiFareEstimator() {
  const t = useTranslations();
  const { taxiFare } = useMessages();
  const reduceMotion = useReducedMotion() ?? false;
  const formId = useId();

  const [pickup, setPickup] = useState<SelectedPlace | null>(null);
  const [destination, setDestination] = useState<SelectedPlace | null>(null);
  const [waitingMinutes, setWaitingMinutes] = useState("0");
  /** Currently selected ride vehicle — updates immediately on card click */
  const [selectedVehicle, setSelectedVehicle] =
    useState<TaxiVehicleId | null>(null);
  const [picker, setPicker] = useState<PickerTarget>(null);
  const [step, setStep] = useState<StepId>(1);
  const [locatingPickup, setLocatingPickup] = useState(false);
  const [locationActionError, setLocationActionError] = useState<string | null>(
    null,
  );

  const [routes, setRoutes] = useState<DrivingRouteEstimate[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const [fare, setFare] = useState<TaxiFareBreakdown | null>(null);
  const [fareByRouteId, setFareByRouteId] = useState<
    Record<string, number | null>
  >({});
  const [tollCharges] = useState(0);
  const [parkingCharges] = useState(0);
  const [surgeConditions] = useState<SurgeCondition[]>(["normal"]);

  const waiting = parseNonNeg(waitingMinutes);
  const route =
    routes.find((r) => r.id === selectedRouteId) ??
    routes.find((r) => r.isRecommended) ??
    routes[0] ??
    null;
  const distanceKm = route?.distanceKm ?? 0;

  const vehicleLabel = selectedVehicle
    ? taxiFare.vehicles[selectedVehicle]
    : null;
  const hasPlaces = Boolean(pickup && destination);
  const hasDistance = Boolean(route && !routeError && distanceKm > 0);
  const vehicleChosen = selectedVehicle != null;
  const canShowFare =
    vehicleChosen &&
    hasDistance &&
    fare != null &&
    fare.vehicleId === selectedVehicle &&
    Number.isFinite(fare.totalLkr);
  const step2Unlocked = hasPlaces && hasDistance;
  const step3Unlocked = step2Unlocked && canShowFare;

  useEffect(() => {
    if (!pickup || !destination) {
      setRoutes([]);
      setSelectedRouteId(null);
      setRouteError(null);
      setRouteLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setRouteLoading(true);
      setRouteError(null);
      try {
        const res = await fetch("/api/ride/directions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin: { lat: pickup.lat, lng: pickup.lng },
            destination: { lat: destination.lat, lng: destination.lng },
          }),
          signal: controller.signal,
        });
        const data = (await res.json()) as DrivingRoutesResponse & {
          error?: string;
        };

        if (!res.ok) {
          setRoutes([]);
          setSelectedRouteId(null);
          setRouteError(
            data.error || "Unable to calculate the route. Please try again.",
          );
          return;
        }

        const nextRoutes =
          Array.isArray(data.routes) && data.routes.length > 0
            ? data.routes
            : data.coordinates?.length
              ? [
                  {
                    distanceKm: data.distanceKm,
                    durationSeconds: data.durationSeconds,
                    durationText: data.durationText,
                    distanceText: data.distanceText,
                    coordinates: data.coordinates,
                    id: "route-0",
                    isRecommended: true,
                    tagKey: "fastest",
                    roadType: "normal" as const,
                  },
                ]
              : [];

        const recommended =
          nextRoutes.find((r) => r.isRecommended) ?? nextRoutes[0] ?? null;

        setRoutes(nextRoutes);
        setSelectedRouteId(recommended?.id ?? null);
      } catch (error) {
        if (controller.signal.aborted) return;
        if (error instanceof Error && error.name === "AbortError") return;
        setRoutes([]);
        setSelectedRouteId(null);
        if (error instanceof OpenRouteServiceError) {
          setRouteError(error.message);
        } else {
          setRouteError("Unable to calculate the route. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setRouteLoading(false);
      }
    }, 280);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [pickup, destination]);

  /**
   * Recalculate fare via server API whenever vehicle / distance / waiting /
   * surge / extras change. Uses live catalog + calibration (never client bundle rates).
   */
  useEffect(() => {
    if (!selectedVehicle || !hasDistance) {
      setFare((prev) => (prev == null ? prev : null));
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const next = await fetchRideFare({
          vehicleId: selectedVehicle,
          distanceKm,
          waitingMinutes: waiting,
          tollCharges,
          parkingCharges,
          conditions: surgeConditions,
          signal: controller.signal,
        });

        if (
          next == null ||
          !Number.isFinite(next.totalLkr) ||
          Number.isNaN(next.totalLkr)
        ) {
          console.error("[Ride fare] Invalid fare result", {
            selectedVehicle,
            distanceKm,
            waiting,
            next,
          });
          setFare(null);
          return;
        }

        setFare(next);
      } catch (error) {
        if (controller.signal.aborted) return;
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("[Ride fare] fetchRideFare failed", {
          selectedVehicle,
          distanceKm,
          waiting,
          error,
        });
        setFare(null);
      }
    }, 120);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [
    selectedVehicle,
    distanceKm,
    hasDistance,
    waiting,
    tollCharges,
    parkingCharges,
    surgeConditions,
  ]);

  // Route-card fare previews — same live server pricing
  useEffect(() => {
    if (routes.length === 0) {
      setFareByRouteId({});
      return;
    }

    const previewVehicle = selectedVehicle ?? ROUTE_FARE_PREVIEW_VEHICLE;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const entries = await Promise.all(
        routes.map(async (option) => {
          const id = option.id;
          if (!id) return null;
          try {
            const preview = await fetchRideFare({
              vehicleId: previewVehicle,
              distanceKm: option.distanceKm,
              waitingMinutes: waiting,
              tollCharges,
              parkingCharges,
              conditions: surgeConditions,
              signal: controller.signal,
            });
            return [
              id,
              Number.isFinite(preview.totalLkr) ? preview.totalLkr : null,
            ] as const;
          } catch {
            if (controller.signal.aborted) return null;
            return [id, null] as const;
          }
        }),
      );

      if (controller.signal.aborted) return;
      const next: Record<string, number | null> = {};
      for (const entry of entries) {
        if (!entry) continue;
        next[entry[0]] = entry[1];
      }
      setFareByRouteId(next);
    }, 150);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [
    routes,
    selectedVehicle,
    waiting,
    tollCharges,
    parkingCharges,
    surgeConditions,
  ]);

  // Auto-advance: both places + distance → step 2
  useEffect(() => {
    if (hasPlaces && hasDistance && step === 1) {
      setStep(2);
      return;
    }
    if (!hasPlaces) {
      setSelectedVehicle((prev) => (prev == null ? prev : null));
      setFare((prev) => (prev == null ? prev : null));
      setStep((prev) => (prev === 1 ? prev : 1));
    }
  }, [hasPlaces, hasDistance, step]);

  const closePicker = useCallback(() => setPicker(null), []);

  const confirmPickup = useCallback((place: SelectedPlace) => {
    setPickup(place);
    setPicker(null);
    setLocationActionError(null);
  }, []);

  const confirmDestination = useCallback((place: SelectedPlace) => {
    setDestination(place);
    setPicker(null);
    setLocationActionError(null);
  }, []);

  const onPickupChange = useCallback((place: SelectedPlace | null) => {
    setPickup(place);
    setLocationActionError(null);
  }, []);

  const onDestinationChange = useCallback((place: SelectedPlace | null) => {
    setDestination(place);
    setLocationActionError(null);
  }, []);

  const onUseCurrentLocation = useCallback(async () => {
    setLocatingPickup(true);
    setLocationActionError(null);
    try {
      const place = await resolveCurrentLocation();
      setPickup(place);
    } catch (err) {
      if (err instanceof GeolocationRequestError) {
        setLocationActionError(
          err.code === "denied"
            ? t("taxiFare.locationPicker.locationDenied")
            : t("taxiFare.locationPicker.locationUnavailable"),
        );
      } else {
        setLocationActionError(
          t("taxiFare.locationPicker.locationUnavailable"),
        );
      }
    } finally {
      setLocatingPickup(false);
    }
  }, [t]);

  const onSelectRoute = useCallback((id: string) => {
    setSelectedRouteId(id);
  }, []);

  const onSelectVehicle = useCallback(
    (id: TaxiVehicleId) => {
      setSelectedVehicle(id);
      setFare(null); // clear stale estimate until live API returns
      if (hasDistance) {
        setStep(3);
      }
    },
    [hasDistance],
  );

  const locationActionClass =
    "inline-flex min-h-10 items-center gap-1.5 rounded-full border border-ink/8 bg-white/80 px-3 text-xs font-semibold text-ink transition-[background,box-shadow,opacity] hover:bg-white hover:shadow-[0_8px_20px_rgb(0_98_250_/_0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35 disabled:opacity-55";

  const pickerLabels = {
    pickup: {
      title: t("taxiFare.locationPicker.pickupTitle"),
      hint: t("taxiFare.locationPicker.pickupHint"),
      addressLabel: t("taxiFare.locationPicker.pickupAddress"),
      latitude: t("taxiFare.locationPicker.latitude"),
      longitude: t("taxiFare.locationPicker.longitude"),
      confirm: t("taxiFare.locationPicker.confirmPickup"),
      resolving: t("taxiFare.locationPicker.resolving"),
      close: t("taxiFare.locationPicker.close"),
      searchLabel: t("taxiFare.locationPicker.searchLabel"),
      searchPlaceholder: t("taxiFare.locationPicker.searchPickup"),
      searching: t("taxiFare.locationPicker.searching"),
      noResults: t("taxiFare.locationPicker.noResults"),
      useCurrentLocation: t("taxiFare.locationPicker.useCurrentLocation"),
      locating: t("taxiFare.locationPicker.locating"),
      locationDenied: t("taxiFare.locationPicker.locationDenied"),
      locationUnavailable: t("taxiFare.locationPicker.locationUnavailable"),
    },
    destination: {
      title: t("taxiFare.locationPicker.destinationTitle"),
      hint: t("taxiFare.locationPicker.destinationHint"),
      addressLabel: t("taxiFare.locationPicker.destinationAddress"),
      latitude: t("taxiFare.locationPicker.latitude"),
      longitude: t("taxiFare.locationPicker.longitude"),
      confirm: t("taxiFare.locationPicker.confirmDestination"),
      resolving: t("taxiFare.locationPicker.resolving"),
      close: t("taxiFare.locationPicker.close"),
      searchLabel: t("taxiFare.locationPicker.searchLabel"),
      searchPlaceholder: t("taxiFare.locationPicker.searchDestination"),
      searching: t("taxiFare.locationPicker.searching"),
      noResults: t("taxiFare.locationPicker.noResults"),
      useCurrentLocation: t("taxiFare.locationPicker.useCurrentLocation"),
      locating: t("taxiFare.locationPicker.locating"),
      locationDenied: t("taxiFare.locationPicker.locationDenied"),
      locationUnavailable: t("taxiFare.locationPicker.locationUnavailable"),
    },
  };

  const steps: Array<{ id: StepId; label: string }> = [
    { id: 1, label: t("taxiFare.steps.locations") },
    { id: 2, label: t("taxiFare.steps.vehicle") },
    { id: 3, label: t("taxiFare.steps.summary") },
  ];

  return (
    <section
      id="taxi-fare"
      aria-labelledby={`${formId}-heading`}
      className="relative isolate overflow-hidden rounded-[1.75rem] border border-ink/8 bg-[linear-gradient(165deg,#f7fafc_0%,#eef4fb_48%,#e8f0fa_100%)] shadow-[0_24px_64px_rgb(10_22_32_/_0.08)]"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-[20%] left-1/2 h-[55%] w-[80%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(0_98_250_/_0.12)_0%,transparent_68%)] blur-2xl" />
        <div className="absolute -right-[8%] bottom-[-25%] h-[45%] w-[40%] rounded-full bg-brand-bright/[0.08] blur-3xl" />
      </div>

      <div className="relative z-[1] p-5 sm:p-7 lg:p-8">
        <motion.div
          initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <p className="font-mono text-[0.6875rem] tracking-[0.16em] text-brand uppercase">
            {t("taxiFare.eyebrow")}
          </p>
          <h2
            id={`${formId}-heading`}
            className="mt-2 font-display text-[clamp(1.45rem,2.6vw,1.85rem)] font-semibold tracking-tight text-balance text-ink"
          >
            {t("taxiFare.heading")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-pretty text-ink-muted sm:text-[0.9375rem]">
            {t("taxiFare.sub")}
          </p>

          {/* Step progress */}
          <ol className="mt-6 flex flex-wrap items-center gap-2 sm:gap-3">
            {steps.map((s, index) => {
              const done =
                (s.id === 1 && hasPlaces) ||
                (s.id === 2 && vehicleChosen) ||
                (s.id === 3 && canShowFare);
              const active = step === s.id;
              const unlocked =
                s.id === 1 ||
                (s.id === 2 && step2Unlocked) ||
                (s.id === 3 && step3Unlocked);

              return (
                <li key={s.id} className="flex items-center gap-2 sm:gap-3">
                  {index > 0 ? (
                    <span
                      className={`hidden h-px w-6 sm:block ${
                        done || active ? "bg-brand/40" : "bg-ink/10"
                      }`}
                      aria-hidden
                    />
                  ) : null}
                  <button
                    type="button"
                    disabled={!unlocked}
                    onClick={() => unlocked && setStep(s.id)}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-[background,color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-40 ${
                      active
                        ? "bg-gradient-to-b from-[#2b7dff] to-[#0062fa] text-paper shadow-[0_8px_20px_rgb(0_98_250_/_0.3)]"
                        : done
                          ? "border border-brand/25 bg-brand/[0.08] text-brand"
                          : "border border-ink/8 bg-white/60 text-ink-muted"
                    }`}
                  >
                    <span
                      className={`grid h-5 w-5 place-items-center rounded-full text-[0.625rem] font-bold ${
                        active
                          ? "bg-white/20 text-paper"
                          : done
                            ? "bg-brand text-paper"
                            : "bg-ink/[0.06] text-ink-muted"
                      }`}
                    >
                      {done && !active ? (
                        <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                      ) : (
                        s.id
                      )}
                    </span>
                    {s.label}
                  </button>
                </li>
              );
            })}
          </ol>
        </motion.div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
          <div className="min-w-0 space-y-8">
            {/* STEP 1 */}
            <StepPanel
              step={1}
              title={t("taxiFare.steps.locationsTitle")}
              active={step === 1}
              done={hasPlaces}
              reduceMotion={reduceMotion}
            >
              <div className="grid gap-3">
                <NominatimAutocomplete
                  id={`${formId}-pickup`}
                  label={t("taxiFare.pickup")}
                  placeholder={t("taxiFare.pickupPlaceholder")}
                  selected={pickup}
                  onPlaceChange={onPickupChange}
                  noResultsLabel={t("taxiFare.locationPicker.noResults")}
                  searchingLabel={t("taxiFare.locationPicker.searching")}
                  icon={<MapPin className="h-4 w-4 text-brand" aria-hidden />}
                  inputClassName={inputClass}
                  actions={
                    <>
                      <button
                        type="button"
                        className={locationActionClass}
                        disabled={locatingPickup}
                        onClick={() => void onUseCurrentLocation()}
                      >
                        {locatingPickup ? (
                          <Loader2
                            className="h-3.5 w-3.5 animate-spin text-brand"
                            aria-hidden
                          />
                        ) : (
                          <Crosshair
                            className="h-3.5 w-3.5 text-brand"
                            aria-hidden
                          />
                        )}
                        {locatingPickup
                          ? t("taxiFare.locationPicker.locating")
                          : t("taxiFare.locationPicker.useCurrentLocation")}
                      </button>
                      <button
                        type="button"
                        className={locationActionClass}
                        onClick={() => setPicker("pickup")}
                      >
                        <Map className="h-3.5 w-3.5 text-brand" aria-hidden />
                        {t("taxiFare.locationPicker.selectOnMap")}
                      </button>
                    </>
                  }
                />
                <NominatimAutocomplete
                  id={`${formId}-destination`}
                  label={t("taxiFare.destination")}
                  placeholder={t("taxiFare.destinationPlaceholder")}
                  selected={destination}
                  onPlaceChange={onDestinationChange}
                  noResultsLabel={t("taxiFare.locationPicker.noResults")}
                  searchingLabel={t("taxiFare.locationPicker.searching")}
                  icon={
                    <Navigation className="h-4 w-4 text-ink" aria-hidden />
                  }
                  inputClassName={inputClass}
                  actions={
                    <button
                      type="button"
                      className={locationActionClass}
                      onClick={() => setPicker("destination")}
                    >
                      <Map className="h-3.5 w-3.5 text-brand" aria-hidden />
                      {t("taxiFare.locationPicker.selectOnMap")}
                    </button>
                  }
                />
                {locationActionError ? (
                  <p className="text-xs text-red-600" role="alert">
                    {locationActionError}
                  </p>
                ) : null}
                <div>
                  <label
                    htmlFor={`${formId}-waiting`}
                    className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink"
                  >
                    <Timer className="h-3.5 w-3.5 text-brand/70" aria-hidden />
                    {t("taxiFare.waiting")}
                  </label>
                  <input
                    id={`${formId}-waiting`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={1}
                    value={waitingMinutes}
                    onChange={(e) => setWaitingMinutes(e.target.value)}
                    className={`${inputClass} sm:max-w-xs`}
                  />
                  <p className="mt-2 text-xs text-ink-muted">
                    {t("taxiFare.waitingHint", {
                      free: FREE_WAITING_MINUTES,
                      rate: WAITING_RATE_PER_MIN,
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <RideMapDynamic
                  pickup={pickup}
                  destination={destination}
                  routes={routes}
                  selectedRouteId={selectedRouteId}
                  onSelectRoute={onSelectRoute}
                  routeCoordinates={route?.coordinates}
                  isRouteLoading={routeLoading}
                  routeError={routeError}
                />
              </div>

              {routes.length > 1 && step === 1 ? (
                <div className="mt-5">
                  <RouteSelection
                    routes={routes}
                    selectedRouteId={selectedRouteId}
                    onSelect={onSelectRoute}
                    fareByRouteId={fareByRouteId}
                  />
                </div>
              ) : null}

              {hasPlaces && hasDistance ? (
                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-[14px] bg-gradient-to-b from-[#2b7dff] to-[#0062fa] px-5 text-sm font-semibold text-paper shadow-[0_10px_28px_rgb(0_98_250_/_0.3)] transition-[transform,box-shadow] duration-300 hover:shadow-[0_14px_36px_rgb(0_98_250_/_0.42)] motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright/50"
                  >
                    {t("taxiFare.steps.continueVehicle")}
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              ) : hasPlaces && routeLoading ? (
                <p className="mt-4 text-sm text-ink-muted">
                  {t("taxiFare.calculatingShort")}
                </p>
              ) : null}
            </StepPanel>

            {/* STEP 2 */}
            <AnimatePresence initial={false}>
              {step2Unlocked ? (
                <motion.div
                  key="step-2"
                  initial={
                    reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <StepPanel
                    step={2}
                    title={t("taxiFare.steps.vehicleTitle")}
                    active={step === 2}
                    done={vehicleChosen}
                    reduceMotion={reduceMotion}
                  >
                    {routes.length > 1 ? (
                      <div className="mb-6">
                        <RouteSelection
                          routes={routes}
                          selectedRouteId={selectedRouteId}
                          onSelect={onSelectRoute}
                          fareByRouteId={fareByRouteId}
                          embedded
                        />
                      </div>
                    ) : null}
                    <VehicleSelection
                      selectedId={selectedVehicle}
                      onSelect={onSelectVehicle}
                      embedded
                    />
                  </StepPanel>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* STEP 3 — Fare summary */}
          <motion.aside
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
              duration: 0.5,
              delay: reduceMotion ? 0 : 0.08,
              ease: EASE,
            }}
            className={`flex flex-col rounded-[1.5rem] bg-[#050b12] p-5 text-[#f3f6f7] shadow-[0_24px_64px_rgb(10_22_32_/_0.35)] sm:p-7 lg:sticky lg:top-24 lg:self-start ${
              step3Unlocked ? "ring-1 ring-brand/30" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-b from-[#2b7dff] to-[#0062fa] text-[0.6875rem] font-bold text-paper">
                3
              </span>
              <p className="font-mono text-[0.65rem] tracking-[0.16em] text-[#e4c99a]/80 uppercase">
                {t("taxiFare.steps.summaryTitle")}
              </p>
            </div>

            <dl className="mt-6 space-y-3.5 text-sm">
              <SummaryRow
                label={t("taxiFare.summary.distance")}
                value={
                  routeLoading
                    ? t("taxiFare.calculatingShort")
                    : route
                      ? `${route.distanceKm.toLocaleString("en-LK", {
                          maximumFractionDigits: 2,
                        })} km`
                      : "—"
                }
              />
              <SummaryRow
                label={t("taxiFare.summary.duration")}
                value={
                  routeLoading
                    ? t("taxiFare.calculatingShort")
                    : route?.durationText || "—"
                }
              />
              <SummaryRow
                label={t("taxiFare.summary.vehicle")}
                value={vehicleLabel || "—"}
              />
              <SummaryRow
                label={t("taxiFare.summary.waitingCharge")}
                value={
                  canShowFare && fare ? formatLkr(fare.waitingCharge) : "—"
                }
              />
            </dl>

            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-xs font-medium tracking-wide text-[#f3f6f7]/55 uppercase">
                {t("taxiFare.summary.estimatedFare")}
              </p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={
                    canShowFare && fare
                      ? `${selectedVehicle}-${fare.totalLkr}`
                      : routeLoading
                        ? "loading"
                        : "empty"
                  }
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.28, ease: EASE }}
                  className="mt-1.5 font-display text-[clamp(1.85rem,3.5vw,2.35rem)] font-semibold tracking-tight text-[#f3f6f7]"
                >
                  {routeLoading ? (
                    <span className="inline-flex items-center gap-2 text-[1.25rem] font-medium text-[#f3f6f7]/70">
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                      {t("taxiFare.calculatingShort")}
                    </span>
                  ) : canShowFare && fare ? (
                    formatLkr(fare.totalLkr)
                  ) : (
                    "—"
                  )}
                </motion.p>
              </AnimatePresence>
              <p className="mt-2 text-xs leading-relaxed text-[#f3f6f7]/48">
                {t("taxiFare.estimateNote")}
              </p>
            </div>

            <div className="mt-auto flex flex-col gap-2.5 pt-8">
              <Link
                href="/support"
                aria-disabled={!canShowFare}
                className={`inline-flex min-h-12 items-center justify-center rounded-[14px] bg-gradient-to-b from-[#2b7dff] to-[#0062fa] px-6 text-sm font-semibold text-paper shadow-[0_10px_28px_rgb(0_98_250_/_0.35)] transition-[transform,box-shadow,filter,opacity] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright/50 ${
                  canShowFare
                    ? "hover:shadow-[0_14px_36px_rgb(0_98_250_/_0.45)] hover:brightness-110 motion-safe:hover:-translate-y-0.5"
                    : "pointer-events-none opacity-40"
                }`}
              >
                {t("taxiFare.bookNow")}
              </Link>
              <p className="text-center text-[0.6875rem] text-[#f3f6f7]/40">
                {t("taxiFare.scopeNote")}
              </p>
            </div>
          </motion.aside>
        </div>
      </div>

      {picker ? (
        <LocationPickerDynamic
          open
          mode={picker}
          initialPlace={picker === "pickup" ? pickup : destination}
          onClose={closePicker}
          onConfirm={picker === "pickup" ? confirmPickup : confirmDestination}
          labels={
            picker === "pickup"
              ? pickerLabels.pickup
              : pickerLabels.destination
          }
        />
      ) : null}
    </section>
  );
}

function StepPanel({
  step,
  title,
  active,
  done,
  children,
  reduceMotion,
}: {
  step: number;
  title: string;
  active: boolean;
  done: boolean;
  children: ReactNode;
  reduceMotion: boolean;
}) {
  return (
    <motion.div
      layout={!reduceMotion}
      className={`rounded-[1.35rem] border p-4 sm:p-5 ${
        active
          ? "border-brand/25 bg-white/70 shadow-[0_16px_40px_rgb(0_98_250_/_0.1)]"
          : done
            ? "border-ink/6 bg-white/40"
            : "border-ink/6 bg-white/35"
      }`}
    >
      <div className="mb-4 flex items-center gap-2.5">
        <span
          className={`grid h-7 w-7 place-items-center rounded-full text-[0.6875rem] font-bold ${
            active || done
              ? "bg-gradient-to-b from-[#2b7dff] to-[#0062fa] text-paper"
              : "bg-ink/[0.06] text-ink-muted"
          }`}
        >
          {done && !active ? (
            <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
          ) : (
            step
          )}
        </span>
        <h3 className="font-display text-base font-semibold tracking-tight text-ink sm:text-lg">
          {title}
        </h3>
      </div>
      {children}
    </motion.div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-[#f3f6f7]/55">{label}</dt>
      <dd className="max-w-[65%] text-right font-medium break-words text-[#f3f6f7]">
        {value}
      </dd>
    </div>
  );
}
