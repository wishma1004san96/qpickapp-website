"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Crosshair,
  Loader2,
  MapPin,
  Navigation,
  Search,
  X,
} from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { FixedCenterMapDynamic } from "@/components/maps/FixedCenterMapDynamic";
import {
  COLOMBO_CENTER,
  PICKER_ZOOM,
} from "@/components/maps/map-constants";
import type {
  LocationPickerMode,
  LocationPickerProps,
} from "@/components/maps/map-types";
import { NominatimAutocomplete } from "@/components/marketing/nominatim-autocomplete";
import {
  GeolocationRequestError,
  resolveCurrentLocation,
} from "@/lib/osm/geolocation";
import type { SelectedPlace } from "@/lib/osm/types";

const EASE = [0.22, 1, 0.36, 1] as const;
const REVERSE_DEBOUNCE_MS = 420;

export type { LocationPickerMode, LocationPickerProps };

type ReverseResult = {
  label: string;
  displayName: string;
  primary?: string;
  secondary?: string;
  lat: number;
  lng: number;
  osmId?: string;
  name?: string;
  road?: string;
  suburb?: string;
  city?: string;
  district?: string;
  error?: string;
};

/**
 * Full-screen Uber / PickMe style location picker.
 * Search · current location · fixed center pin · reverse geocode on moveend.
 */
export function LocationPicker({
  open,
  mode,
  initialPlace,
  onClose,
  onConfirm,
  labels,
}: LocationPickerProps) {
  const titleId = useId();
  const reduceMotion = useReducedMotion() ?? false;
  const debounceRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const skipNextReverseRef = useRef(false);
  const mountedRef = useRef(false);

  const startCenter: [number, number] = initialPlace
    ? [initialPlace.lat, initialPlace.lng]
    : COLOMBO_CENTER;

  const [mapCenter, setMapCenter] = useState<[number, number]>(startCenter);
  const [syncKey, setSyncKey] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [address, setAddress] = useState<ReverseResult | null>(
    initialPlace
      ? {
          label: initialPlace.label,
          displayName: initialPlace.displayName,
          lat: initialPlace.lat,
          lng: initialPlace.lng,
          osmId: initialPlace.osmId,
          name: initialPlace.name,
          road: initialPlace.road,
          suburb: initialPlace.suburb,
          city: initialPlace.city,
          district: initialPlace.district,
        }
      : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [searchPlace, setSearchPlace] = useState<SelectedPlace | null>(
    initialPlace ?? null,
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const jumpTo = useCallback((lat: number, lng: number, place?: SelectedPlace) => {
    skipNextReverseRef.current = true;
    setMapCenter([lat, lng]);
    setSyncKey((k) => k + 1);
    setIsMoving(false);
    if (place) {
      setAddress({
        label: place.label,
        displayName: place.displayName,
        lat: place.lat,
        lng: place.lng,
        osmId: place.osmId,
        name: place.name,
        road: place.road,
        suburb: place.suburb,
        city: place.city,
        district: place.district,
      });
      setSearchPlace(place);
      setError(null);
    }
  }, []);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    if (!mountedRef.current) return;
    setResolving(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/ride/reverse?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lng))}`,
        { signal: controller.signal },
      );
      const data = (await res.json()) as ReverseResult;
      if (!mountedRef.current || controller.signal.aborted) return;
      if (!res.ok) {
        setError(data.error || "Unable to resolve address.");
        const fallback: ReverseResult = {
          label: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          displayName: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          lat,
          lng,
        };
        setAddress(fallback);
        setSearchPlace({
          label: fallback.label,
          displayName: fallback.displayName,
          lat,
          lng,
        });
        return;
      }
      const next: ReverseResult = { ...data, lat, lng };
      setAddress(next);
      setSearchPlace({
        label: next.label,
        displayName: next.displayName || next.label,
        lat,
        lng,
        osmId: next.osmId,
        name: next.name,
        road: next.road,
        suburb: next.suburb,
        city: next.city,
        district: next.district,
      });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      if (!mountedRef.current) return;
      setError("Unable to resolve address.");
      const fallback: ReverseResult = {
        label: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        displayName: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        lat,
        lng,
      };
      setAddress(fallback);
      setSearchPlace({
        label: fallback.label,
        displayName: fallback.displayName,
        lat,
        lng,
      });
    } finally {
      if (mountedRef.current && !controller.signal.aborted) {
        setResolving(false);
      }
    }
  }, []);

  const scheduleReverse = useCallback(
    (lat: number, lng: number) => {
      if (debounceRef.current != null) {
        window.clearTimeout(debounceRef.current);
      }
      debounceRef.current = window.setTimeout(() => {
        void reverseGeocode(lat, lng);
      }, REVERSE_DEBOUNCE_MS);
    },
    [reverseGeocode],
  );

  // Reset when opening — defer reverse so map children finish mounting first
  useEffect(() => {
    if (!open) return;

    const next: [number, number] = initialPlace
      ? [initialPlace.lat, initialPlace.lng]
      : COLOMBO_CENTER;

    skipNextReverseRef.current = true;
    setMapCenter(next);
    setSyncKey((k) => k + 1);
    setIsMoving(false);
    setError(null);
    setLocating(false);

    if (initialPlace) {
      setAddress({
        label: initialPlace.label,
        displayName: initialPlace.displayName,
        lat: initialPlace.lat,
        lng: initialPlace.lng,
        osmId: initialPlace.osmId,
        name: initialPlace.name,
        road: initialPlace.road,
        suburb: initialPlace.suburb,
        city: initialPlace.city,
        district: initialPlace.district,
      });
      setSearchPlace(initialPlace);
    } else {
      setAddress(null);
      setSearchPlace(null);
    }

    const reverseTimer = window.setTimeout(() => {
      if (!mountedRef.current || !open) return;
      if (!initialPlace) {
        scheduleReverse(next[0], next[1]);
      }
    }, 0);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(reverseTimer);
      if (debounceRef.current != null) {
        window.clearTimeout(debounceRef.current);
      }
      abortRef.current?.abort();
    };
  }, [open, initialPlace, scheduleReverse, onClose]);

  const onMoveStart = useCallback(() => {
    setIsMoving(true);
  }, []);

  const onMove = useCallback(() => {
    setIsMoving(true);
  }, []);

  const onMoveEnd = useCallback(
    (center: { lat: number; lng: number }) => {
      setIsMoving(false);
      setMapCenter([center.lat, center.lng]);
      if (skipNextReverseRef.current) {
        skipNextReverseRef.current = false;
        return;
      }
      scheduleReverse(center.lat, center.lng);
    },
    [scheduleReverse],
  );

  const onSearchSelect = useCallback(
    (place: SelectedPlace | null) => {
      if (!place) {
        setSearchPlace(null);
        return;
      }
      jumpTo(place.lat, place.lng, place);
    },
    [jumpTo],
  );

  const onUseCurrentLocation = useCallback(async () => {
    setLocating(true);
    setError(null);
    try {
      const place = await resolveCurrentLocation();
      jumpTo(place.lat, place.lng, place);
      // Refresh street-level label from pin
      skipNextReverseRef.current = false;
      scheduleReverse(place.lat, place.lng);
    } catch (err) {
      if (err instanceof GeolocationRequestError) {
        setError(
          err.code === "denied"
            ? labels.locationDenied || err.message
            : labels.locationUnavailable || err.message,
        );
      } else {
        setError(labels.locationUnavailable || "Unable to get current location.");
      }
    } finally {
      setLocating(false);
    }
  }, [jumpTo, scheduleReverse, labels]);

  const handleConfirm = () => {
    if (!address || resolving) return;
    const place: SelectedPlace = {
      label: address.label,
      displayName: address.displayName || address.label,
      lat: address.lat,
      lng: address.lng,
      osmId: address.osmId,
      name: address.name,
      road: address.road,
      suburb: address.suburb,
      city: address.city,
      district: address.district,
    };
    onConfirm(place);
  };

  const canConfirm = Boolean(address) && !resolving && !isMoving && !locating;

  const searchInputClass =
    "min-h-12 w-full rounded-[0.9rem] border border-ink/10 bg-white px-3.5 pl-10 text-sm text-ink shadow-[0_1px_0_rgb(255_255_255_/_0.8)] outline-none transition-[border-color,box-shadow] placeholder:text-ink/35 focus-visible:border-brand/35 focus-visible:ring-2 focus-visible:ring-brand/25";

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] flex flex-col bg-[#050b12]/55 backdrop-blur-[2px]"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.22 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <motion.div
            className="relative mx-auto flex h-full w-full max-w-lg flex-col overflow-hidden bg-[#f4f7fa] shadow-[0_-20px_60px_rgb(10_22_32_/_0.35)] sm:my-4 sm:h-[min(92vh,820px)] sm:rounded-[1.5rem]"
            initial={reduceMotion ? false : { y: 40, opacity: 0.96 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduceMotion ? undefined : { y: 28, opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE }}
          >
            <header className="relative z-30 flex shrink-0 flex-col gap-3 border-b border-ink/6 bg-white/95 px-4 py-3.5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="grid h-11 w-11 place-items-center rounded-full border border-ink/8 bg-white text-ink transition-colors hover:bg-ink/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                  aria-label={labels.close}
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
                <div className="min-w-0 flex-1">
                  <p
                    id={titleId}
                    className="truncate font-display text-base font-semibold tracking-tight text-ink"
                  >
                    {labels.title}
                  </p>
                  <p className="truncate text-xs text-ink-muted">{labels.hint}</p>
                </div>
                {mode === "pickup" ? (
                  <MapPin className="h-5 w-5 shrink-0 text-brand" aria-hidden />
                ) : (
                  <Navigation
                    className="h-5 w-5 shrink-0 text-ink"
                    aria-hidden
                  />
                )}
              </div>

              <NominatimAutocomplete
                compact
                label={labels.searchLabel || labels.addressLabel}
                placeholder={
                  labels.searchPlaceholder || "Search for a place…"
                }
                selected={searchPlace}
                onPlaceChange={onSearchSelect}
                noResultsLabel={labels.noResults || "No results found"}
                searchingLabel={labels.searching || "Searching…"}
                icon={
                  <Search className="h-4 w-4 text-ink-muted" aria-hidden />
                }
                inputClassName={searchInputClass}
              />
            </header>

            <div className="relative min-h-0 flex-1">
              <FixedCenterMapDynamic
                center={mapCenter}
                zoom={PICKER_ZOOM}
                syncKey={syncKey}
                isMoving={isMoving}
                variant={mode}
                onMoveStart={onMoveStart}
                onMove={onMove}
                onMoveEnd={onMoveEnd}
                className="absolute inset-0 h-full w-full"
              />

              <div className="pointer-events-none absolute top-3 right-0 left-0 z-20 flex justify-center px-4">
                <p className="rounded-full border border-ink/8 bg-white/95 px-3.5 py-1.5 text-center text-[0.75rem] font-medium text-ink shadow-[0_8px_24px_rgb(10_22_32_/_0.12)] backdrop-blur-md">
                  {labels.hint}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void onUseCurrentLocation()}
                disabled={locating}
                className="absolute right-3 bottom-3 z-20 inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/8 bg-white/95 px-3.5 py-2.5 text-sm font-semibold text-ink shadow-[0_10px_28px_rgb(10_22_32_/_0.16)] backdrop-blur-md transition-[transform,box-shadow,opacity] hover:shadow-[0_14px_32px_rgb(0_98_250_/_0.18)] disabled:opacity-60 motion-safe:enabled:active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                {locating ? (
                  <Loader2 className="h-4 w-4 animate-spin text-brand" aria-hidden />
                ) : (
                  <Crosshair className="h-4 w-4 text-brand" aria-hidden />
                )}
                {locating
                  ? labels.locating || "Locating…"
                  : labels.useCurrentLocation || "Use current location"}
              </button>
            </div>

            <div className="relative z-10 shrink-0 rounded-t-[1.35rem] border-t border-ink/6 bg-white px-4 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-16px_48px_rgb(10_22_32_/_0.12)] sm:px-5">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-ink/10" />

              <p className="text-[0.6875rem] font-medium tracking-[0.12em] text-ink-muted uppercase">
                {labels.addressLabel}
              </p>

              <div className="mt-2 min-h-[3.25rem]">
                {resolving || isMoving || locating ? (
                  <p className="inline-flex items-center gap-2 text-sm text-ink-muted">
                    <Loader2
                      className="h-4 w-4 animate-spin text-brand"
                      aria-hidden
                    />
                    {locating
                      ? labels.locating || labels.resolving
                      : labels.resolving}
                  </p>
                ) : (
                  <p className="text-[0.9375rem] leading-snug font-medium text-pretty text-ink">
                    {address?.label || "—"}
                  </p>
                )}
                {error ? (
                  <p className="mt-1 text-xs text-red-600" role="alert">
                    {error}
                  </p>
                ) : null}
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-2 rounded-[0.9rem] border border-ink/6 bg-[#f7fafc] px-3 py-2.5 font-mono text-[0.6875rem] text-ink-muted">
                <div>
                  <dt className="text-[0.625rem] tracking-wide uppercase opacity-70">
                    {labels.latitude}
                  </dt>
                  <dd className="mt-0.5 text-ink">
                    {(address?.lat ?? mapCenter[0]).toFixed(6)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.625rem] tracking-wide uppercase opacity-70">
                    {labels.longitude}
                  </dt>
                  <dd className="mt-0.5 text-ink">
                    {(address?.lng ?? mapCenter[1]).toFixed(6)}
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                disabled={!canConfirm}
                onClick={handleConfirm}
                className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-[14px] bg-gradient-to-b from-[#2b7dff] to-[#0062fa] px-6 text-sm font-semibold text-paper shadow-[0_10px_28px_rgb(0_98_250_/_0.35)] transition-[transform,box-shadow,filter,opacity] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] hover:shadow-[0_14px_36px_rgb(0_98_250_/_0.45)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:shadow-[0_10px_28px_rgb(0_98_250_/_0.35)] disabled:hover:brightness-100 motion-safe:enabled:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright/50"
              >
                {labels.confirm}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
