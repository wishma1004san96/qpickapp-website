"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search, X } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  formatAirportFare,
  searchAirportRates,
  type AirportRate,
} from "@/lib/airport-rates";

const EASE = [0.22, 1, 0.36, 1] as const;

type AirportSearchProps = {
  value: string;
  onValueChange: (value: string) => void;
  onSelect: (rate: AirportRate) => void;
  selectedCode: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labels: {
    label: string;
    placeholder: string;
    noResults: string;
    searching: string;
  };
};

export function AirportSearch({
  value,
  onValueChange,
  onSelect,
  selectedCode,
  open,
  onOpenChange,
  labels,
}: AirportSearchProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const listId = useId();
  const inputId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pending, setPending] = useState(false);
  const [focused, setFocused] = useState(false);

  const trimmed = value.trim();
  const results = trimmed.length >= 1 ? searchAirportRates(value, 10) : [];
  const showList = open && trimmed.length >= 1 && results.length !== 1;

  useEffect(() => {
    if (trimmed.length < 1) {
      setPending(false);
      return;
    }
    setPending(true);
    const t = window.setTimeout(() => setPending(false), 100);
    return () => window.clearTimeout(t);
  }, [trimmed]);

  useEffect(() => {
    setActiveIndex(0);
  }, [trimmed]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) onOpenChange(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [onOpenChange]);

  function choose(rate: AirportRate) {
    onSelect(rate);
    onOpenChange(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      onOpenChange(false);
      return;
    }

    if (
      !open &&
      (e.key === "ArrowDown" || e.key === "ArrowUp") &&
      results.length > 1
    ) {
      onOpenChange(true);
      return;
    }

    if (!showList) {
      if (e.key === "Enter" && results.length === 1) {
        e.preventDefault();
        choose(results[0]);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault();
      choose(results[activeIndex]);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <label htmlFor={inputId} className="sr-only">
        {labels.label}
      </label>

      <motion.div
        animate={
          focused && !reduceMotion
            ? {
                boxShadow:
                  "0 0 0 4px rgb(0 98 250 / 0.16), 0 24px 56px rgb(0 98 250 / 0.14), 0 8px 24px rgb(10 22 32 / 0.06)",
              }
            : {
                boxShadow:
                  "0 20px 48px rgb(10 22 32 / 0.08), 0 4px 16px rgb(0 98 250 / 0.06)",
              }
        }
        transition={{ duration: 0.28, ease: EASE }}
        className={`relative flex h-16 items-center gap-3 rounded-[24px] border bg-white/75 px-4 backdrop-blur-2xl sm:h-[68px] sm:gap-4 sm:px-5 lg:h-[72px] ${
          focused
            ? "border-brand/35"
            : "border-white/90 hover:border-brand/20"
        }`}
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-b from-[#2b7dff] to-[#0062fa] text-paper shadow-[0_10px_24px_rgb(0_98_250_/_0.35)] sm:h-11 sm:w-11">
          <Search className="h-5 w-5" strokeWidth={2.25} aria-hidden />
        </span>
        <input
          id={inputId}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            showList && results[activeIndex]
              ? `${listId}-opt-${results[activeIndex].code}`
              : undefined
          }
          autoComplete="off"
          spellCheck={false}
          placeholder={labels.placeholder}
          value={value}
          onChange={(e) => {
            onValueChange(e.target.value);
            onOpenChange(true);
          }}
          onFocus={() => {
            setFocused(true);
            if (trimmed.length >= 1 && results.length > 1) onOpenChange(true);
          }}
          onBlur={() => setFocused(false)}
          onKeyDown={onKeyDown}
          className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink/40 sm:text-[1.0625rem]"
        />
        {value ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              onValueChange("");
              onOpenChange(false);
            }}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink/[0.04] text-ink-muted transition-colors hover:bg-ink/[0.08] hover:text-ink"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </motion.div>

      <AnimatePresence>
        {showList ? (
          <motion.div
            id={listId}
            role="listbox"
            initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion
                ? undefined
                : {
                    opacity: 0,
                    y: 6,
                    scale: 0.98,
                    transition: { duration: 0.15 },
                  }
            }
            transition={{ duration: 0.22, ease: EASE }}
            className="absolute z-30 mt-2 max-h-72 w-full overflow-auto overscroll-contain rounded-[24px] border border-white/80 bg-white/85 p-2 shadow-[0_28px_64px_rgb(10_22_32_/_0.14),0_0_0_1px_rgb(0_98_250_/_0.05)] backdrop-blur-2xl"
          >
            {pending ? (
              <p className="px-4 py-3 text-sm text-ink-muted">
                {labels.searching}
              </p>
            ) : results.length === 0 ? (
              <p className="px-4 py-3 text-sm text-ink-muted">
                {labels.noResults}
              </p>
            ) : (
              results.map((rate, index) => {
                const active = index === activeIndex;
                const selected = selectedCode === rate.code;
                return (
                  <button
                    key={rate.code}
                    id={`${listId}-opt-${rate.code}`}
                    type="button"
                    role="option"
                    aria-selected={active || selected}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => choose(rate)}
                    className={`flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition-[background,transform] duration-200 ${
                      active || selected
                        ? "bg-brand/[0.1] text-ink shadow-[inset_0_0_0_1px_rgb(0_98_250_/_0.12)]"
                        : "text-ink hover:bg-ink/[0.04]"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        {rate.destination}
                      </span>
                      <span className="mt-1 block font-mono text-[0.6875rem] text-ink-muted">
                        {rate.code}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-bold text-brand">
                      {formatAirportFare(rate.rate)}
                    </span>
                  </button>
                );
              })
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
