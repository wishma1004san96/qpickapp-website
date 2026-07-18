"use client";

import { Loader2 } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { PlaceSuggestion, SelectedPlace } from "@/lib/osm/types";

const SEARCH_DEBOUNCE_MS = 300;

type NominatimAutocompleteProps = {
  id?: string;
  label: string;
  placeholder?: string;
  selected: SelectedPlace | null;
  onPlaceChange: (place: SelectedPlace | null) => void;
  icon?: ReactNode;
  className?: string;
  inputClassName?: string;
  /** Compact styling for embedding inside the map picker */
  compact?: boolean;
  noResultsLabel?: string;
  searchingLabel?: string;
  /** Extra controls under the field (map / current location) */
  actions?: ReactNode;
};

/**
 * Nominatim-backed location autocomplete (Sri Lanka).
 * Selecting a result stores that hit's exact lat/lon/display_name — no city re-geocode.
 */
export function NominatimAutocomplete({
  id,
  label,
  placeholder,
  selected,
  onPlaceChange,
  icon,
  className = "",
  inputClassName = "",
  compact = false,
  noResultsLabel = "No results found",
  searchingLabel = "Searching…",
  actions,
}: NominatimAutocompleteProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const mountedRef = useRef(false);
  const blurTimerRef = useRef<number | null>(null);

  const [query, setQuery] = useState(selected?.label ?? "");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searched, setSearched] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (blurTimerRef.current != null) {
        window.clearTimeout(blurTimerRef.current);
      }
    };
  }, []);

  // Keep input synced when place is set from map / GPS / parent —
  // never overwrite while the user is actively typing.
  useEffect(() => {
    if (!mountedRef.current || focused) return;

    if (selected) {
      setQuery(selected.label);
      setSuggestions((prev) => (prev.length === 0 ? prev : []));
      setOpen(false);
      setActiveIndex(-1);
      setSearched(false);
      setError(null);
      return;
    }

    setQuery((q) => (q === "" ? q : ""));
    setSuggestions((prev) => (prev.length === 0 ? prev : []));
    setOpen(false);
    setActiveIndex(-1);
    setSearched(false);
  }, [selected, focused]);

  useEffect(() => {
    const onDocPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", onDocPointer);
    return () => document.removeEventListener("mousedown", onDocPointer);
  }, []);

  useEffect(() => {
    if (!mountedRef.current) return;

    const trimmed = query.trim();
    const matched = Boolean(selected && trimmed === selected.label);
    const tooShort = trimmed.length < 2;

    if (matched || tooShort) {
      setSuggestions((prev) => (prev.length === 0 ? prev : []));
      setLoading((prev) => (prev ? false : prev));
      setError((prev) => (prev == null ? prev : null));
      setSearched((prev) => (prev ? false : prev));
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      if (!mountedRef.current) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/ride/geocode?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );
        const data = (await res.json()) as {
          results?: PlaceSuggestion[];
          error?: string;
        };
        if (!mountedRef.current || controller.signal.aborted) return;
        if (!res.ok) {
          setSuggestions([]);
          setError(data.error || "Search failed.");
          setSearched(true);
          return;
        }
        setSuggestions(data.results ?? []);
        setOpen(true);
        setActiveIndex(-1);
        setSearched(true);
      } catch {
        if (!mountedRef.current || controller.signal.aborted) return;
        setSuggestions([]);
        setError("Search failed.");
        setSearched(true);
      } finally {
        if (mountedRef.current && !controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, selected]);

  // Keep active option visible while arrow-key navigating
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-suggestion-index="${activeIndex}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const choose = (place: PlaceSuggestion) => {
    const exact: SelectedPlace = {
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
    };
    setQuery(exact.label);
    setSuggestions([]);
    setOpen(false);
    setActiveIndex(-1);
    setSearched(false);
    onPlaceChange(exact);
  };

  const showList = open && (loading || searched);
  const showNoResults =
    open && searched && !loading && !error && suggestions.length === 0;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {label ? (
        <label
          htmlFor={fieldId}
          className={`mb-1.5 block text-sm font-medium text-ink ${
            compact ? "sr-only" : ""
          }`}
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute top-1/2 left-3.5 z-[1] -translate-y-1/2">
            {icon}
          </span>
        ) : null}
        <input
          id={fieldId}
          type="text"
          value={query}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={showList && suggestions.length > 0}
          aria-controls={`${fieldId}-listbox`}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${fieldId}-opt-${activeIndex}` : undefined
          }
          className={`${inputClassName} ${icon ? "pl-10" : ""}`}
          onChange={(event) => {
            const next = event.target.value;
            setQuery(next);
            setOpen(true);
            // Keep previous place until a new suggestion is chosen,
            // unless the field is cleared entirely.
            if (next.trim() === "") {
              onPlaceChange(null);
            }
          }}
          onFocus={() => {
            setFocused(true);
            if (suggestions.length > 0 || searched) setOpen(true);
          }}
          onBlur={() => {
            // Delay so suggestion click registers before close/sync
            if (blurTimerRef.current != null) {
              window.clearTimeout(blurTimerRef.current);
            }
            blurTimerRef.current = window.setTimeout(() => {
              if (!mountedRef.current) return;
              setFocused(false);
            }, 180);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              setActiveIndex(-1);
              return;
            }
            if (!open) return;

            if (event.key === "ArrowDown") {
              event.preventDefault();
              if (suggestions.length === 0) return;
              setActiveIndex((i) =>
                i < suggestions.length - 1 ? i + 1 : 0,
              );
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              if (suggestions.length === 0) return;
              setActiveIndex((i) =>
                i > 0 ? i - 1 : suggestions.length - 1,
              );
            } else if (event.key === "Enter") {
              if (activeIndex >= 0 && suggestions[activeIndex]) {
                event.preventDefault();
                choose(suggestions[activeIndex]!);
              }
            }
          }}
        />
        {loading ? (
          <span
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
            aria-live="polite"
            aria-label={searchingLabel}
          >
            <Loader2 className="h-4 w-4 animate-spin text-brand" aria-hidden />
          </span>
        ) : null}
      </div>

      {actions ? <div className="mt-2 flex flex-wrap gap-2">{actions}</div> : null}

      {error ? (
        <p className="mt-1.5 text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {showList ? (
        <ul
          ref={listRef}
          id={`${fieldId}-listbox`}
          role="listbox"
          className="absolute z-40 mt-1.5 max-h-[min(16rem,45vh)] w-full overflow-y-auto overscroll-contain rounded-[0.9rem] border border-ink/10 bg-white/98 py-1.5 shadow-[0_16px_40px_rgb(10_22_32_/_0.16)] backdrop-blur-md"
        >
          {loading && suggestions.length === 0 ? (
            <li className="flex items-center gap-2 px-3.5 py-3 text-sm text-ink-muted">
              <Loader2 className="h-4 w-4 animate-spin text-brand" aria-hidden />
              {searchingLabel}
            </li>
          ) : null}

          {showNoResults ? (
            <li className="px-3.5 py-3 text-sm text-ink-muted" role="status">
              {noResultsLabel}
            </li>
          ) : null}

          {suggestions.map((item, index) => (
            <li
              key={item.id}
              id={`${fieldId}-opt-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              data-suggestion-index={index}
            >
              <button
                type="button"
                className={`min-h-12 w-full px-3.5 py-2.5 text-left transition-colors ${
                  index === activeIndex
                    ? "bg-brand/8 text-ink"
                    : "text-ink hover:bg-brand/[0.05]"
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(item)}
              >
                <span className="block text-sm font-medium leading-snug">
                  <HighlightMatch text={item.primary} query={query} />
                </span>
                {item.secondary ? (
                  <span className="mt-0.5 block text-xs leading-snug text-ink-muted">
                    <HighlightMatch text={item.secondary} query={query} />
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q || !text) return <>{text}</>;

  const lowerText = text.toLowerCase();
  const lowerQ = q.toLowerCase();
  const parts: ReactNode[] = [];
  let cursor = 0;
  let matchAt = lowerText.indexOf(lowerQ, cursor);
  let key = 0;

  while (matchAt !== -1) {
    if (matchAt > cursor) {
      parts.push(<span key={`t-${key++}`}>{text.slice(cursor, matchAt)}</span>);
    }
    parts.push(
      <mark
        key={`m-${key++}`}
        className="rounded-[2px] bg-brand/15 font-semibold text-ink"
      >
        {text.slice(matchAt, matchAt + q.length)}
      </mark>,
    );
    cursor = matchAt + q.length;
    matchAt = lowerText.indexOf(lowerQ, cursor);
  }

  if (cursor < text.length) {
    parts.push(<span key={`t-${key++}`}>{text.slice(cursor)}</span>);
  }

  return <>{parts}</>;
}
