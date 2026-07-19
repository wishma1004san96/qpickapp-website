"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Crosshair,
  Map,
  MapPin,
  Navigation,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  QBrandDivider,
  QGlowBadge,
  QHeadingMark,
  QPatternBackground,
  QSpinner,
  QWatermark,
} from "@/components/brand/q-mark";
import {
  defaultSchedule,
  formatDateInput,
  isScheduleValid,
  minPickupTimeForDate,
  scheduleToInstant,
} from "@/lib/booking/schedule";
import { WaitingMinutesStepper } from "@/components/marketing/waiting-minutes-stepper";
import {
  useMessages,
  useTranslations,
} from "@/components/i18n/locale-provider";
import { fleetVehicleNameKey } from "@/components/icons/vehicles";
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
  TAXI_VEHICLE_IDS,
  TAXI_VEHICLE_META,
  WAITING_RATE_PER_MIN,
  type SurgeCondition,
  type TaxiFareBreakdown,
  type TaxiVehicleId,
} from "@/lib/taxi-fare-ui";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Preview vehicle for route-card fares before the user picks a ride */
const ROUTE_FARE_PREVIEW_VEHICLE: TaxiVehicleId = "tuk";

function isCompletelyOutsideViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  return rect.bottom <= 0 || rect.top >= window.innerHeight;
}

function scrollIntoViewIfCompletelyHidden(
  el: HTMLElement | null,
  smooth: boolean,
) {
  if (!el || !isCompletelyOutsideViewport(el)) return;
  el.scrollIntoView({
    behavior: smooth ? "smooth" : "auto",
    block: "nearest",
    inline: "nearest",
  });
}

const inputClass =
  "min-h-11 w-full rounded-[0.9rem] border border-ink/10 bg-white/70 px-3.5 text-sm text-ink shadow-[0_1px_0_rgb(255_255_255_/_0.8)] outline-none backdrop-blur-md transition-[border-color,box-shadow] duration-[var(--duration-ui)] placeholder:text-ink/35 focus-visible:border-brand/35 focus-visible:ring-2 focus-visible:ring-brand/25 disabled:opacity-60";

type PickerTarget = "pickup" | "destination" | null;
type StepId = 1 | 2 | 3 | 4;
type RideType = "rideNow" | "schedule";
type PaymentMethod = "cash" | "card" | "wallet";

const radioOptionClass = (selected: boolean) =>
  `rounded-[0.9rem] border px-3.5 py-2.5 text-sm font-medium transition-[border-color,background,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25 ${
    selected
      ? "border-brand/35 bg-brand/[0.08] text-ink shadow-[0_1px_0_rgb(255_255_255_/_0.8)]"
      : "border-ink/10 bg-white/70 text-ink-muted hover:border-ink/15"
  }`;

/**
 * Taxi fare estimator — ride booking flow.
 * 1 · Locations → 2 · Vehicle → 3 · Booking Details → 4 · Fare Summary + Book
 *
 * When `variant="page"` is used on /ride, this becomes the sole intro + booking surface
 * (single H1, trust chips, no duplicate marketing hero).
 */
export function TaxiFareEstimator({
  variant = "embedded",
}: {
  variant?: "embedded" | "page";
} = {}) {
  const t = useTranslations();
  const { taxiFare } = useMessages();
  const router = useRouter();
  const reduceMotion = useReducedMotion() ?? false;
  const formId = useId();
  const initialSchedule = defaultSchedule();
  const isPageHero = variant === "page";
  const HeadingTag = isPageHero ? "h1" : "h2";
  const trustPoints = isPageHero
    ? ([
        t("pages.ride.booking.trust.pricing"),
        t("pages.ride.booking.trust.drivers"),
        t("pages.ride.booking.trust.tracking"),
      ] as const)
    : null;

  const [pickup, setPickup] = useState<SelectedPlace | null>(null);
  const [destination, setDestination] = useState<SelectedPlace | null>(null);
  const [rideType, setRideType] = useState<RideType>("rideNow");
  const [waitingMinutes, setWaitingMinutes] = useState(0);
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
  const [fareByVehicleId, setFareByVehicleId] = useState<
    Partial<Record<TaxiVehicleId, number | null>>
  >({});
  const [tollCharges] = useState(0);
  const [parkingCharges] = useState(0);
  const [surgeConditions] = useState<SurgeCondition[]>(["normal"]);

  const [pickupDate, setPickupDate] = useState(initialSchedule.date);
  const [pickupTime, setPickupTime] = useState(initialSchedule.time);
  const [passengerName, setPassengerName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [promoCode, setPromoCode] = useState("");
  const [airportPickup, setAirportPickup] = useState(false);
  const [flightNumber, setFlightNumber] = useState("");
  const [passengerCount, setPassengerCount] = useState("1");
  const [luggageCount, setLuggageCount] = useState("1");
  const [specialNotes, setSpecialNotes] = useState("");
  const [confirmErrors, setConfirmErrors] = useState<string[]>([]);
  const [totalPulse, setTotalPulse] = useState(false);
  const [fareBreakdownOpen, setFareBreakdownOpen] = useState(false);

  const summaryRef = useRef<HTMLElement | null>(null);
  const bookingDetailsRef = useRef<HTMLDivElement | null>(null);
  const totalPulseTimerRef = useRef<number | null>(null);
  const prevTotalRef = useRef<number | null>(null);

  const waiting = waitingMinutes;
  const todayInput = formatDateInput(new Date());
  const route =
    routes.find((r) => r.id === selectedRouteId) ??
    routes.find((r) => r.isRecommended) ??
    routes[0] ??
    null;
  const distanceKm = route?.distanceKm ?? 0;

  const vehicleLabel = selectedVehicle
    ? (() => {
        const key = fleetVehicleNameKey(selectedVehicle);
        return key ? t(key) : taxiFare.vehicles[selectedVehicle];
      })()
    : null;
  const hasPlaces = Boolean(pickup && destination);
  const hasDistance = Boolean(route && !routeError && distanceKm > 0);
  const vehicleChosen = selectedVehicle != null;
  const schedulingComplete =
    rideType === "rideNow" ||
    isScheduleValid(pickupDate.trim(), pickupTime.trim());
  const passengersValid =
    Number.parseInt(passengerCount, 10) >= 1 &&
    Number.isFinite(Number.parseInt(passengerCount, 10));
  const detailsComplete = Boolean(
    passengerName.trim() &&
      phone.trim() &&
      paymentMethod &&
      passengersValid,
  );
  const pickupInstant = useMemo(
    () =>
      scheduleToInstant(pickupDate, pickupTime) ??
      (rideType === "rideNow" ? new Date() : undefined),
    [pickupDate, pickupTime, rideType],
  );
  const fareAtIso = useMemo(
    () => (pickupInstant ?? new Date()).toISOString(),
    [pickupInstant],
  );
  const canShowFare =
    vehicleChosen &&
    hasDistance &&
    fare != null &&
    fare.vehicleId === selectedVehicle &&
    Number.isFinite(fare.totalLkr);
  const canBook = canShowFare && schedulingComplete && detailsComplete;
  const step2Unlocked = hasPlaces && hasDistance && schedulingComplete;
  const step3Unlocked = step2Unlocked && vehicleChosen;
  const step4Unlocked = step3Unlocked && detailsComplete;
  const distanceLabel =
    route && !routeLoading
      ? `${route.distanceKm.toLocaleString("en-LK", {
          maximumFractionDigits: 2,
        })} km`
      : null;
  const durationLabel = route?.durationText ?? null;

  const displayTotalLkr = useMemo(() => {
    if (canShowFare && fare != null && Number.isFinite(fare.totalLkr)) {
      return fare.totalLkr;
    }
    if (
      selectedVehicle &&
      fareByVehicleId[selectedVehicle] != null &&
      Number.isFinite(fareByVehicleId[selectedVehicle] as number)
    ) {
      return fareByVehicleId[selectedVehicle] as number;
    }
    return null;
  }, [canShowFare, fare, selectedVehicle, fareByVehicleId]);

  useEffect(() => {
    if (rideType !== "rideNow") return;
    const sync = () => {
      const next = defaultSchedule();
      setPickupDate(next.date);
      setPickupTime(next.time);
    };
    sync();
    const timer = window.setInterval(sync, 60_000);
    return () => window.clearInterval(timer);
  }, [rideType]);

  useEffect(() => {
    if (rideType !== "schedule") return;
    if (pickupDate && pickupDate < todayInput) {
      setPickupDate(todayInput);
    }
  }, [rideType, pickupDate, todayInput]);

  useEffect(() => {
    if (!pickup || !destination) {
      setRoutes([]);
      setSelectedRouteId(null);
      setRouteError(null);
      setRouteLoading(false);
      setFareByVehicleId({});
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setRouteLoading(true);
      setRouteError(null);
      setFareByVehicleId({});
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
          airportPickup,
          at: fareAtIso,
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
    }, 60);

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
    airportPickup,
    fareAtIso,
    surgeConditions,
  ]);

  // Live estimated fare for every vehicle card (same trip params)
  useEffect(() => {
    if (!hasDistance) {
      setFareByVehicleId({});
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const entries = await Promise.all(
        TAXI_VEHICLE_IDS.map(async (vehicleId) => {
          try {
            const preview = await fetchRideFare({
              vehicleId,
              distanceKm,
              waitingMinutes: waiting,
              tollCharges,
              parkingCharges,
              airportPickup,
              at: fareAtIso,
              conditions: surgeConditions,
              signal: controller.signal,
            });
            return [
              vehicleId,
              Number.isFinite(preview.totalLkr) ? preview.totalLkr : null,
            ] as const;
          } catch {
            if (controller.signal.aborted) return null;
            return [vehicleId, null] as const;
          }
        }),
      );

      if (controller.signal.aborted) return;
      const next: Partial<Record<TaxiVehicleId, number | null>> = {};
      for (const entry of entries) {
        if (!entry) continue;
        next[entry[0]] = entry[1];
      }
      setFareByVehicleId(next);
    }, 50);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [
    hasDistance,
    distanceKm,
    waiting,
    tollCharges,
    parkingCharges,
    airportPickup,
    fareAtIso,
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
              airportPickup,
              at: fareAtIso,
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
    airportPickup,
    fareAtIso,
    surgeConditions,
  ]);

  // Auto-advance: places + distance + schedule → step 2
  useEffect(() => {
    if (hasPlaces && hasDistance && schedulingComplete && step === 1) {
      setStep(2);
      return;
    }
    if (!hasPlaces) {
      setSelectedVehicle((prev) => (prev == null ? prev : null));
      setFare((prev) => (prev == null ? prev : null));
      setStep((prev) => (prev === 1 ? prev : 1));
    }
  }, [hasPlaces, hasDistance, schedulingComplete, step]);

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

  const pulseGrandTotal = useCallback(() => {
    if (totalPulseTimerRef.current != null) {
      window.clearTimeout(totalPulseTimerRef.current);
    }
    setTotalPulse(true);
    totalPulseTimerRef.current = window.setTimeout(() => {
      setTotalPulse(false);
      totalPulseTimerRef.current = null;
    }, 900);
  }, []);

  useEffect(() => {
    const total =
      canShowFare && fare != null && Number.isFinite(fare.totalLkr)
        ? fare.totalLkr
        : null;
    if (total == null) {
      prevTotalRef.current = null;
      return;
    }
    if (prevTotalRef.current !== total) {
      if (prevTotalRef.current != null || selectedVehicle != null) {
        pulseGrandTotal();
      }
      prevTotalRef.current = total;
    }
  }, [canShowFare, fare, selectedVehicle, pulseGrandTotal]);

  useEffect(() => {
    return () => {
      if (totalPulseTimerRef.current != null) {
        window.clearTimeout(totalPulseTimerRef.current);
      }
    };
  }, []);

  const onSelectRoute = useCallback((id: string) => {
    setSelectedRouteId(id);
  }, []);

  const onSelectVehicle = useCallback(
    (id: TaxiVehicleId) => {
      setSelectedVehicle(id);
      setFare(null);
      const meta = TAXI_VEHICLE_META[id];
      setPassengerCount(String(meta.passengers));
      setLuggageCount(String(meta.luggage));
      if (hasDistance) {
        setStep(3);
        window.requestAnimationFrame(() => {
          bookingDetailsRef.current?.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "nearest",
          });
        });
      }
      pulseGrandTotal();
      window.requestAnimationFrame(() => {
        scrollIntoViewIfCompletelyHidden(
          summaryRef.current,
          !(reduceMotion ?? false),
        );
      });
    },
    [hasDistance, pulseGrandTotal, reduceMotion],
  );

  const onMobileContinue = useCallback(() => {
    if (!step2Unlocked) {
      setStep(1);
      return;
    }
    if (!vehicleChosen) {
      setStep(2);
      return;
    }
    if (!detailsComplete) {
      setStep(3);
      return;
    }
    setStep(4);
    scrollIntoViewIfCompletelyHidden(
      summaryRef.current,
      !(reduceMotion ?? false),
    );
  }, [
    step2Unlocked,
    vehicleChosen,
    detailsComplete,
    reduceMotion,
  ]);

  const handleBook = useCallback(() => {
    const errs: string[] = [];
    if (!pickup) errs.push(t("taxiFare.confirmErrors.pickup"));
    if (!destination) errs.push(t("taxiFare.confirmErrors.destination"));
    if (!selectedVehicle) errs.push(t("taxiFare.confirmErrors.vehicle"));
    if (!schedulingComplete) errs.push(t("taxiFare.confirmErrors.schedule"));
    if (!passengerName.trim()) {
      errs.push(t("taxiFare.confirmErrors.passengerName"));
    }
    if (!phone.trim()) errs.push(t("taxiFare.confirmErrors.phone"));
    if (!paymentMethod) errs.push(t("taxiFare.confirmErrors.payment"));
    if (!canShowFare) errs.push(t("taxiFare.confirmErrors.fare"));

    if (errs.length > 0) {
      setConfirmErrors(errs);
      return;
    }

    setConfirmErrors([]);
    router.push("/support");
  }, [
    pickup,
    destination,
    selectedVehicle,
    schedulingComplete,
    passengerName,
    phone,
    paymentMethod,
    canShowFare,
    t,
    router,
  ]);

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
    { id: 3, label: t("taxiFare.steps.details") },
    { id: 4, label: t("taxiFare.steps.summary") },
  ];

  return (
    <section
      id="taxi-fare"
      aria-labelledby={`${formId}-heading`}
      className="relative isolate rounded-[1.75rem] border border-ink/8 bg-[linear-gradient(165deg,#f7fafc_0%,#eef4fb_48%,#e8f0fa_100%)] shadow-[0_24px_64px_rgb(10_22_32_/_0.08)]"
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
        aria-hidden="true"
      >
        <div className="absolute -top-[20%] left-1/2 h-[55%] w-[80%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(0_98_250_/_0.12)_0%,transparent_68%)] blur-2xl" />
        <div className="absolute -right-[8%] bottom-[-25%] h-[45%] w-[40%] rounded-full bg-brand-bright/[0.08] blur-3xl" />
        <QPatternBackground opacity={0.028} cellSize={64} />
        <QWatermark tone="brand" opacity={0.05} size={360} blur={2} />
      </div>

      <div
        className={`relative z-[1] ${
          isPageHero
            ? "p-6 pb-28 sm:p-8 sm:pb-28 lg:p-9 lg:pb-10"
            : "p-5 pb-24 sm:p-7 lg:p-8 lg:pb-8"
        }`}
      >
        <motion.div
          initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          {isPageHero ? (
            <>
              <p className="font-mono text-[0.6875rem] tracking-[0.16em] text-brand uppercase">
                {t("pages.ride.intro.badge")}
              </p>
              <HeadingTag
                id={`${formId}-heading`}
                className="mt-2.5 font-display text-[clamp(1.85rem,4vw,2.55rem)] font-semibold tracking-tight text-balance text-ink"
              >
                <QHeadingMark markSize={24} className="text-inherit">
                  {t("pages.ride.booking.title")}
                </QHeadingMark>
              </HeadingTag>
              <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
                {trustPoints?.map((point) => (
                  <li
                    key={point}
                    className="text-sm font-medium text-ink-muted sm:text-[0.9375rem]"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <p className="font-mono text-[0.6875rem] tracking-[0.16em] text-brand uppercase">
                {t("taxiFare.eyebrow")}
              </p>
              <HeadingTag
                id={`${formId}-heading`}
                className="mt-2 font-display text-[clamp(1.45rem,2.6vw,1.85rem)] font-semibold tracking-tight text-balance text-ink"
              >
                <QHeadingMark markSize={22} className="text-inherit">
                  {t("taxiFare.heading")}
                </QHeadingMark>
              </HeadingTag>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-pretty text-ink-muted sm:text-[0.9375rem]">
                {t("taxiFare.sub")}
              </p>
            </>
          )}

          {/* Step progress */}
          <ol
            className={`flex flex-wrap items-center gap-2 sm:gap-3 ${
              isPageHero ? "mt-16" : "mt-6"
            }`}
          >
            {steps.map((s, index) => {
              const done =
                (s.id === 1 && hasPlaces && schedulingComplete) ||
                (s.id === 2 && vehicleChosen) ||
                (s.id === 3 && detailsComplete) ||
                (s.id === 4 && canBook);
              const active = step === s.id;
              const unlocked =
                s.id === 1 ||
                (s.id === 2 && step2Unlocked) ||
                (s.id === 3 && step3Unlocked) ||
                (s.id === 4 && step4Unlocked);

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
                    onClick={() => {
                      if (!unlocked) return;
                      setStep(s.id);
                      if (s.id === 3) {
                        window.requestAnimationFrame(() => {
                          bookingDetailsRef.current?.scrollIntoView({
                            behavior: reduceMotion ? "auto" : "smooth",
                            block: "nearest",
                          });
                        });
                      }
                      if (s.id === 4) {
                        window.requestAnimationFrame(() => {
                          scrollIntoViewIfCompletelyHidden(
                            summaryRef.current,
                            !reduceMotion,
                          );
                        });
                      }
                    }}
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

        <div
          className={`grid items-start gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-8 ${
            isPageHero ? "mt-14" : "mt-8"
          }`}
        >
          <div className="min-w-0 space-y-5 self-start">
            {/* STEP 1 */}
            <StepPanel
              step={1}
              title={t("taxiFare.steps.locationsTitle")}
              active={step === 1}
              done={hasPlaces && schedulingComplete}
              reduceMotion={reduceMotion}
              brand
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
                          <QSpinner size={14} />
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

                <fieldset>
                  <legend className="mb-2 text-sm font-medium text-ink">
                    {t("taxiFare.rideType.title")}
                  </legend>
                  <div
                    className="flex flex-wrap gap-2"
                    role="radiogroup"
                    aria-label={t("taxiFare.rideType.title")}
                  >
                    {(["rideNow", "schedule"] as const).map((id) => {
                      const selected = rideType === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => setRideType(id)}
                          className={radioOptionClass(selected)}
                        >
                          {id === "rideNow"
                            ? t("taxiFare.rideType.now")
                            : t("taxiFare.rideType.schedule")}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                {rideType === "schedule" ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <label
                        htmlFor={`${formId}-pickup-date`}
                        className="text-xs font-medium text-ink/70"
                      >
                        {t("taxiFare.bookingDetails.pickupDate")}
                        <span className="text-brand"> *</span>
                      </label>
                      <input
                        id={`${formId}-pickup-date`}
                        type="date"
                        required
                        min={todayInput}
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <label
                        htmlFor={`${formId}-pickup-time`}
                        className="text-xs font-medium text-ink/70"
                      >
                        {t("taxiFare.bookingDetails.pickupTime")}
                        <span className="text-brand"> *</span>
                      </label>
                      <input
                        id={`${formId}-pickup-time`}
                        type="time"
                        required
                        min={minPickupTimeForDate(pickupDate)}
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    {!schedulingComplete ? (
                      <p className="text-xs text-ink-muted sm:col-span-2">
                        {t("taxiFare.bookingDetails.scheduleHint")}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <WaitingMinutesStepper
                  id={`${formId}-waiting`}
                  label={t("taxiFare.waiting")}
                  hint={t("taxiFare.waitingHint", {
                    free: FREE_WAITING_MINUTES,
                    rate: WAITING_RATE_PER_MIN,
                  })}
                  value={waitingMinutes}
                  onChange={setWaitingMinutes}
                  min={0}
                  max={180}
                />
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
                  distanceLabel={distanceLabel}
                  durationLabel={durationLabel}
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

              {step2Unlocked ? (
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
                <p className="mt-4 inline-flex items-center gap-2 text-sm text-ink-muted">
                  <QSpinner size={16} />
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
                  <QBrandDivider className="mb-5" />
                  <StepPanel
                    step={2}
                    title={t("taxiFare.steps.vehicleTitle")}
                    active={step === 2}
                    done={vehicleChosen}
                    reduceMotion={reduceMotion}
                    brand
                  >
                    {routes.length > 1 ? (
                      <div className="mb-4">
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
                      tripDurationSeconds={route?.durationSeconds}
                      at={pickupInstant ?? new Date()}
                      fareByVehicleId={fareByVehicleId}
                    />
                    {vehicleChosen ? (
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setStep(3);
                            window.requestAnimationFrame(() => {
                              bookingDetailsRef.current?.scrollIntoView({
                                behavior: reduceMotion ? "auto" : "smooth",
                                block: "nearest",
                              });
                            });
                          }}
                          className="inline-flex min-h-10 items-center gap-1.5 rounded-[14px] bg-gradient-to-b from-[#2b7dff] to-[#0062fa] px-4 text-sm font-semibold text-paper shadow-[0_10px_28px_rgb(0_98_250_/_0.3)] transition-[transform,box-shadow] duration-300 hover:shadow-[0_14px_36px_rgb(0_98_250_/_0.42)] motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright/50"
                        >
                          {t("taxiFare.steps.continueDetails")}
                          <ChevronRight className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                    ) : null}
                  </StepPanel>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Right column — sticky Fare Summary + compact Booking Details */}
          <div className="flex min-w-0 flex-col gap-4 self-start lg:sticky lg:top-24">
          <motion.aside
            ref={summaryRef}
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
              duration: 0.5,
              delay: reduceMotion ? 0 : 0.08,
              ease: EASE,
            }}
            className={`relative flex flex-col overflow-hidden rounded-[1.5rem] bg-[#050b12] p-5 text-[#f3f6f7] shadow-[0_24px_64px_rgb(10_22_32_/_0.35)] sm:p-6 ${
              step4Unlocked || step === 4 || vehicleChosen
                ? "ring-1 ring-brand/30"
                : ""
            }`}
          >
            <QWatermark tone="foam" opacity={0.055} size={200} blur={2} />
            <QGlowBadge size={22} className="top-4 right-4" />
            <div className="relative z-[1] flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-b from-[#2b7dff] to-[#0062fa] text-[0.6875rem] font-bold text-paper">
                4
              </span>
              <QHeadingMark
                as="p"
                tone="foam"
                markSize={18}
                className="font-mono text-[0.65rem] tracking-[0.16em] text-[#e4c99a]/80 uppercase"
              >
                {t("taxiFare.steps.summaryTitle")}
              </QHeadingMark>
            </div>

            <dl className="relative z-[1] mt-5 space-y-2.5 text-sm">
              <SummaryRow
                label={t("taxiFare.summary.distance")}
                value={
                  routeLoading
                    ? t("taxiFare.calculatingShort")
                    : distanceLabel || "—"
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
                label={t("taxiFare.summary.estimatedFare")}
                value={
                  displayTotalLkr != null
                    ? formatLkr(displayTotalLkr)
                    : routeLoading
                      ? t("taxiFare.calculatingShort")
                      : "—"
                }
              />
            </dl>

            <div className="relative z-[1] mt-4">
              <button
                type="button"
                aria-expanded={fareBreakdownOpen}
                onClick={() => setFareBreakdownOpen((o) => !o)}
                className="inline-flex w-full items-center justify-between gap-2 rounded-[0.75rem] border border-white/10 bg-white/[0.04] px-3 py-2 text-left text-xs font-medium text-[#f3f6f7]/70 transition-colors hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                {t("taxiFare.summary.viewFareBreakdown")}
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
                    fareBreakdownOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden
                />
              </button>
              <AnimatePresence initial={false}>
                {fareBreakdownOpen ? (
                  <motion.dl
                    initial={
                      reduceMotion
                        ? { opacity: 1, height: "auto" }
                        : { opacity: 0, height: 0 }
                    }
                    animate={{ opacity: 1, height: "auto" }}
                    exit={
                      reduceMotion
                        ? undefined
                        : { opacity: 0, height: 0 }
                    }
                    transition={{ duration: 0.28, ease: EASE }}
                    className="mt-3 space-y-2.5 overflow-hidden text-sm"
                  >
                    <SummaryRow
                      label={t("taxiFare.summary.baseFare")}
                      value={
                        canShowFare && fare
                          ? formatLkr(fare.baseFare ?? fare.firstKmFare)
                          : "—"
                      }
                    />
                    <SummaryRow
                      label={t("taxiFare.summary.distanceCharge")}
                      value={
                        canShowFare && fare
                          ? formatLkr(
                              fare.distanceCharge ?? fare.additionalKmFare,
                            )
                          : "—"
                      }
                    />
                    <SummaryRow
                      label={t("taxiFare.summary.waitingCharge")}
                      value={
                        canShowFare && fare
                          ? formatLkr(fare.waitingCharge)
                          : "—"
                      }
                    />
                    <SummaryRow
                      label={t("taxiFare.summary.bookingFee")}
                      value={
                        canShowFare && fare
                          ? formatLkr(fare.bookingFee ?? 0)
                          : "—"
                      }
                    />
                    <SummaryRow
                      label={t("taxiFare.summary.airportFee")}
                      value={
                        canShowFare && fare
                          ? formatLkr(fare.airportPickupFee ?? 0)
                          : "—"
                      }
                    />
                    <SummaryRow
                      label={t("taxiFare.summary.toll")}
                      value={
                        canShowFare && fare
                          ? formatLkr(fare.tollCharges)
                          : "—"
                      }
                    />
                    <SummaryRow
                      label={t("taxiFare.summary.parking")}
                      value={
                        canShowFare && fare
                          ? formatLkr(fare.parkingCharges)
                          : "—"
                      }
                    />
                    <SummaryRow
                      label={t("taxiFare.summary.surge")}
                      value={
                        canShowFare && fare && fare.surgeAmount > 0
                          ? formatLkr(fare.surgeAmount)
                          : "—"
                      }
                    />
                    <SummaryRow
                      label={t("taxiFare.summary.discount")}
                      value={
                        canShowFare &&
                        fare &&
                        (fare.longDistanceDiscount ?? 0) > 0
                          ? `−${formatLkr(fare.longDistanceDiscount ?? 0)}`
                          : canShowFare && fare
                            ? formatLkr(0)
                            : "—"
                      }
                    />
                  </motion.dl>
                ) : null}
              </AnimatePresence>
            </div>

            <div
              className={`relative z-[1] mt-5 rounded-[1rem] border border-transparent pt-4 transition-[box-shadow,background-color,border-color] duration-500 ${
                totalPulse
                  ? "fare-total-pulse border-brand/40 bg-brand/15 px-3 pb-3 shadow-[0_0_0_1px_rgb(1_147_251_/_0.35),0_0_28px_rgb(0_98_250_/_0.35)]"
                  : "border-t border-t-white/10"
              }`}
            >
              <p className="text-xs font-medium tracking-wide text-[#f3f6f7]/55 uppercase">
                {t("taxiFare.summary.grandTotal")}
              </p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={
                    displayTotalLkr != null
                      ? `${selectedVehicle}-${displayTotalLkr}`
                      : routeLoading
                        ? "loading"
                        : "empty"
                  }
                  initial={
                    reduceMotion
                      ? { opacity: 1 }
                      : { opacity: 0, y: 10, scale: 0.98 }
                  }
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={
                    reduceMotion
                      ? undefined
                      : { opacity: 0, y: -8, scale: 0.98 }
                  }
                  transition={{ duration: 0.32, ease: EASE }}
                  className={`mt-1 font-display text-[clamp(1.75rem,3.2vw,2.15rem)] font-semibold tracking-tight ${
                    totalPulse ? "text-[#7eb6ff]" : "text-[#f3f6f7]"
                  }`}
                >
                  {routeLoading && displayTotalLkr == null ? (
                    <span className="inline-flex items-center gap-2 text-[1.15rem] font-medium text-[#f3f6f7]/70">
                      <QSpinner size={18} className="text-[#7eb6ff]" />
                      {t("taxiFare.calculatingShort")}
                    </span>
                  ) : displayTotalLkr != null ? (
                    formatLkr(displayTotalLkr)
                  ) : (
                    "—"
                  )}
                </motion.p>
              </AnimatePresence>
              <p className="mt-1.5 text-[0.6875rem] leading-relaxed text-[#f3f6f7]/45">
                {t("taxiFare.estimateNote")}
              </p>
            </div>

            <div className="relative z-[1] mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleBook}
                className={`inline-flex min-h-11 items-center justify-center rounded-[14px] bg-gradient-to-b from-[#2b7dff] to-[#0062fa] px-6 text-sm font-semibold text-paper shadow-[0_10px_28px_rgb(0_98_250_/_0.35)] transition-[transform,box-shadow,filter,opacity] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright/50 ${
                  canBook
                    ? "hover:shadow-[0_14px_36px_rgb(0_98_250_/_0.45)] hover:brightness-110 motion-safe:hover:-translate-y-0.5"
                    : "opacity-40"
                }`}
              >
                {t("taxiFare.bookNow")}
              </button>
              {confirmErrors.length > 0 ? (
                <ul
                  className="space-y-1 text-center text-[0.6875rem] text-red-300"
                  role="alert"
                >
                  {confirmErrors.map((msg) => (
                    <li key={msg}>{msg}</li>
                  ))}
                </ul>
              ) : null}
              {!detailsComplete && vehicleChosen ? (
                <p className="text-center text-[0.6875rem] text-[#f3f6f7]/45">
                  {t("taxiFare.bookingDetails.requiredDetailsHint")}
                </p>
              ) : null}
              <p className="text-center text-[0.625rem] text-[#f3f6f7]/40">
                {t("taxiFare.scopeNote")}
              </p>
            </div>
          </motion.aside>

          <AnimatePresence initial={false}>
            {step3Unlocked ? (
              <motion.div
                ref={bookingDetailsRef}
                key="booking-details-right"
                initial={
                  reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }
                }
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <StepPanel
                  step={3}
                  title={t("taxiFare.steps.detailsTitle")}
                  active={step === 3}
                  done={detailsComplete}
                  reduceMotion={reduceMotion}
                  brand
                  watermark
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex min-w-0 flex-col gap-1">
                      <label
                        htmlFor={`${formId}-passenger-name`}
                        className="text-xs font-medium text-ink/70"
                      >
                        {t("taxiFare.bookingDetails.passengerName")}
                        <span className="text-brand"> *</span>
                      </label>
                      <input
                        id={`${formId}-passenger-name`}
                        type="text"
                        required
                        value={passengerName}
                        onChange={(e) => setPassengerName(e.target.value)}
                        autoComplete="name"
                        className={inputClass}
                      />
                    </div>
                    <div className="flex min-w-0 flex-col gap-1">
                      <label
                        htmlFor={`${formId}-phone`}
                        className="text-xs font-medium text-ink/70"
                      >
                        {t("taxiFare.bookingDetails.phone")}
                        <span className="text-brand"> *</span>
                      </label>
                      <input
                        id={`${formId}-phone`}
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        autoComplete="tel"
                        className={inputClass}
                      />
                    </div>
                    <div className="flex min-w-0 flex-col gap-1">
                      <label
                        htmlFor={`${formId}-passengers`}
                        className="text-xs font-medium text-ink/70"
                      >
                        {t("taxiFare.bookingDetails.passengerCount")}
                        <span className="text-brand"> *</span>
                      </label>
                      <input
                        id={`${formId}-passengers`}
                        type="number"
                        min={1}
                        max={60}
                        value={passengerCount}
                        onChange={(e) => setPassengerCount(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div className="flex min-w-0 flex-col gap-1">
                      <label
                        htmlFor={`${formId}-luggage`}
                        className="text-xs font-medium text-ink/70"
                      >
                        {t("taxiFare.bookingDetails.luggageCount")}
                      </label>
                      <input
                        id={`${formId}-luggage`}
                        type="number"
                        min={0}
                        max={40}
                        value={luggageCount}
                        onChange={(e) => setLuggageCount(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <fieldset className="sm:col-span-2">
                      <legend className="text-xs font-medium text-ink/70">
                        {t("taxiFare.bookingDetails.paymentMethod")}
                        <span className="text-brand"> *</span>
                      </legend>
                      <div
                        className="mt-1.5 flex flex-wrap gap-1.5"
                        role="radiogroup"
                        aria-label={t(
                          "taxiFare.bookingDetails.paymentMethod",
                        )}
                      >
                        {(["cash", "card", "wallet"] as const).map((id) => {
                          const selected = paymentMethod === id;
                          return (
                            <button
                              key={id}
                              type="button"
                              role="radio"
                              aria-checked={selected}
                              onClick={() => setPaymentMethod(id)}
                              className={radioOptionClass(selected)}
                            >
                              {t(`taxiFare.bookingDetails.${id}`)}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>
                    <div className="flex min-w-0 flex-col gap-1 sm:col-span-2">
                      <label
                        htmlFor={`${formId}-promo`}
                        className="text-xs font-medium text-ink/70"
                      >
                        {t("taxiFare.bookingDetails.promoCode")}
                      </label>
                      <input
                        id={`${formId}-promo`}
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder={t(
                          "taxiFare.bookingDetails.promoPlaceholder",
                        )}
                        autoComplete="off"
                        className={`${inputClass} max-w-xs`}
                      />
                    </div>
                    <fieldset className="sm:col-span-2">
                      <legend className="text-xs font-medium text-ink/70">
                        {t("taxiFare.bookingDetails.airportPickup")}
                      </legend>
                      <div
                        className="mt-1.5 flex flex-wrap gap-1.5"
                        role="radiogroup"
                        aria-label={t(
                          "taxiFare.bookingDetails.airportPickup",
                        )}
                      >
                        {([false, true] as const).map((value) => {
                          const selected = airportPickup === value;
                          return (
                            <button
                              key={String(value)}
                              type="button"
                              role="radio"
                              aria-checked={selected}
                              onClick={() => {
                                setAirportPickup(value);
                                if (!value) setFlightNumber("");
                              }}
                              className={radioOptionClass(selected)}
                            >
                              {value
                                ? t("taxiFare.bookingDetails.yes")
                                : t("taxiFare.bookingDetails.no")}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>
                    {airportPickup ? (
                      <div className="flex min-w-0 flex-col gap-1 sm:col-span-2">
                        <label
                          htmlFor={`${formId}-flight`}
                          className="text-xs font-medium text-ink/70"
                        >
                          {t("taxiFare.bookingDetails.flightNumber")}
                          <span className="ml-1 font-normal text-ink/40">
                            (
                            {t(
                              "taxiFare.bookingDetails.flightNumberOptional",
                            )}
                            )
                          </span>
                        </label>
                        <input
                          id={`${formId}-flight`}
                          type="text"
                          value={flightNumber}
                          onChange={(e) => setFlightNumber(e.target.value)}
                          placeholder={t(
                            "taxiFare.bookingDetails.flightPlaceholder",
                          )}
                          autoComplete="off"
                          className={inputClass}
                        />
                      </div>
                    ) : null}
                    <div className="flex min-w-0 flex-col gap-1 sm:col-span-2">
                      <label
                        htmlFor={`${formId}-notes`}
                        className="text-xs font-medium text-ink/70"
                      >
                        {t("taxiFare.bookingDetails.driverNotes")}
                      </label>
                      <textarea
                        id={`${formId}-notes`}
                        rows={2}
                        value={specialNotes}
                        onChange={(e) => setSpecialNotes(e.target.value)}
                        placeholder={t(
                          "taxiFare.bookingDetails.notesPlaceholder",
                        )}
                        className={`${inputClass} min-h-[3.25rem] resize-y py-2`}
                      />
                    </div>
                  </div>
                </StepPanel>
              </motion.div>
            ) : null}
          </AnimatePresence>
          </div>
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

      {/* Mobile sticky fare bar — desktop uses the sticky Fare Summary aside */}
      <div
        className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden ${
          hasDistance ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!hasDistance}
      >
        <div
          className={`pointer-events-auto mx-auto flex max-w-lg items-center gap-3 rounded-[1.15rem] border border-ink/10 bg-[#050b12]/94 px-3.5 py-3 text-[#f3f6f7] shadow-[0_-8px_32px_rgb(10_22_32_/_0.28)] backdrop-blur-xl transition-[transform,opacity] duration-300 ${
            hasDistance
              ? "translate-y-0"
              : "translate-y-6"
          } ${totalPulse ? "ring-2 ring-brand/50" : ""}`}
        >
          <div className="min-w-0 flex-1">
            <p className="text-[0.625rem] font-medium tracking-wide text-[#f3f6f7]/55 uppercase">
              {t("taxiFare.summary.estimatedFare")}
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={
                  displayTotalLkr != null
                    ? `m-${displayTotalLkr}`
                    : routeLoading
                      ? "m-loading"
                      : "m-empty"
                }
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                transition={{ duration: 0.25, ease: EASE }}
                className={`truncate font-display text-lg font-semibold tracking-tight ${
                  totalPulse ? "text-[#7eb6ff]" : "text-[#f3f6f7]"
                }`}
              >
                {routeLoading && displayTotalLkr == null
                  ? t("taxiFare.calculatingShort")
                  : displayTotalLkr != null
                    ? formatLkr(displayTotalLkr)
                    : "—"}
              </motion.p>
            </AnimatePresence>
          </div>
          <button
            type="button"
            onClick={() => {
              if (canBook) {
                handleBook();
                return;
              }
              onMobileContinue();
            }}
            disabled={!hasDistance}
            className="inline-flex shrink-0 items-center gap-1 rounded-[0.85rem] bg-gradient-to-b from-[#2b7dff] to-[#0062fa] px-4 py-2.5 text-sm font-semibold text-paper shadow-[0_8px_20px_rgb(0_98_250_/_0.35)] disabled:opacity-40"
          >
            {canBook
              ? t("taxiFare.bookNow")
              : t("taxiFare.mobileFareBar.continue")}
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
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
  brand = false,
  watermark = false,
}: {
  step: number;
  title: string;
  active: boolean;
  done: boolean;
  children: ReactNode;
  reduceMotion: boolean;
  brand?: boolean;
  watermark?: boolean;
}) {
  return (
    <motion.div
      layout={!reduceMotion}
      className={`relative overflow-hidden rounded-[1.35rem] border p-4 sm:p-5 ${
        active
          ? "border-brand/25 bg-white/70 shadow-[0_16px_40px_rgb(0_98_250_/_0.1)]"
          : done
            ? "border-ink/6 bg-white/40"
            : "border-ink/6 bg-white/35"
      }`}
    >
      {watermark || brand ? (
        <QWatermark
          tone="brand"
          opacity={active ? 0.05 : 0.035}
          size={200}
          blur={1.75}
        />
      ) : null}
      {brand ? <QGlowBadge size={20} className="top-3.5 right-3.5" /> : null}
      <div className="relative z-[1] mb-4 flex items-center gap-2.5">
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
      <div className="relative z-[1]">{children}</div>
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
