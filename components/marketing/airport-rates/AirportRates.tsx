"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  AirportFareCard,
  AirportFareCardSkeleton,
} from "@/components/marketing/airport-rates/AirportFareCard";
import { AirportSearch } from "@/components/marketing/airport-rates/AirportSearch";
import { PopularDestinations } from "@/components/marketing/airport-rates/PopularDestinations";
import { useTranslations } from "@/components/i18n/locale-provider";
import { Container } from "@/components/ui/container";
import {
  POPULAR_AIRPORT_LABELS,
  searchAirportRates,
  type AirportRate,
} from "@/lib/airport-rates";
import "./airport-rates.css";

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

export function AirportRates() {
  const t = useTranslations();
  const reduceMotion = useReducedMotion() ?? false;
  const fareCardRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AirportRate | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();
  /** Skip unique-match auto-select while applying a programmatic selection. */
  const skipAutoRef = useRef(false);

  const applySelection = useCallback(
    (
      rate: AirportRate,
      options?: { scroll?: boolean; fillQuery?: boolean },
    ) => {
      skipAutoRef.current = true;
      setLoading(true);
      startTransition(() => {
        setSelected(rate);
        if (options?.fillQuery !== false) {
          setQuery(displayLabel(rate));
        }
        setDropdownOpen(false);
      });

      if (options?.scroll) {
        window.requestAnimationFrame(() => {
          fareCardRef.current?.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "nearest",
          });
        });
      }

      window.setTimeout(() => {
        skipAutoRef.current = false;
      }, 280);
    },
    [reduceMotion],
  );

  useEffect(() => {
    if (!loading) return;
    const id = window.setTimeout(() => setLoading(false), 220);
    return () => window.clearTimeout(id);
  }, [loading, selected?.code]);

  /** Unique-match auto-select (Maps-style). */
  useEffect(() => {
    const q = query.trim();
    if (!q || skipAutoRef.current) return;

    const id = window.setTimeout(() => {
      if (skipAutoRef.current) return;

      const results = searchAirportRates(q, 3);

      if (results.length === 1) {
        const only = results[0];
        if (selected?.code === only.code && queryMatchesSelected(q, only)) {
          setDropdownOpen(false);
          return;
        }
        applySelection(only, { fillQuery: true, scroll: false });
        return;
      }

      if (results.length > 1) {
        // Confirm there are truly multiple matches (limit 3 is enough)
        if (selected && !queryMatchesSelected(q, selected)) {
          setSelected(null);
        }
        setDropdownOpen(true);
        return;
      }

      // Zero matches while typing — clear stale selection
      if (selected && !queryMatchesSelected(q, selected)) {
        setSelected(null);
      }
    }, 160);

    return () => window.clearTimeout(id);
  }, [query, selected, applySelection]);

  function onQueryChange(value: string) {
    setQuery(value);
    if (!value.trim()) {
      setSelected(null);
      setDropdownOpen(false);
      setLoading(false);
      return;
    }
    setDropdownOpen(true);
  }

  return (
    <section
      className="airport-rates-section border-b border-ink/5 bg-paper py-12 sm:py-14 lg:py-16"
      aria-labelledby="airport-rates-heading"
    >
      <Container>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="max-w-2xl"
        >
          <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand uppercase">
            {t("pages.airport.rates.eyebrow")}
          </p>
          <h2
            id="airport-rates-heading"
            className="mt-2 font-display text-[clamp(1.55rem,3vw,2.05rem)] leading-[1.15] font-semibold tracking-[-0.025em] text-balance text-ink"
          >
            {t("pages.airport.rates.heading")}
          </h2>
          <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-pretty text-ink-muted">
            {t("pages.airport.rates.sub")}
          </p>
        </motion.div>

        <div className="mx-auto mt-8 max-w-3xl sm:mt-10">
          <PopularDestinations
            selectedCode={selected?.code ?? null}
            onSelect={(rate) =>
              applySelection(rate, { scroll: true, fillQuery: true })
            }
            heading={t("pages.airport.rates.popular")}
          />

          <div className="mt-6 sm:mt-7">
            <AirportSearch
              value={query}
              onValueChange={onQueryChange}
              onSelect={(rate) =>
                applySelection(rate, { scroll: true, fillQuery: true })
              }
              selectedCode={selected?.code ?? null}
              open={dropdownOpen}
              onOpenChange={setDropdownOpen}
              labels={{
                label: t("pages.airport.rates.searchLabel"),
                placeholder: t("pages.airport.rates.searchPlaceholder"),
                noResults: t("pages.airport.rates.noResults"),
                searching: t("pages.airport.rates.searching"),
              }}
            />
          </div>

          <div ref={fareCardRef} className="mt-6 min-h-[12rem] sm:mt-7">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <AirportFareCardSkeleton />
                </motion.div>
              ) : selected ? (
                <motion.div
                  key={`fare-${selected.code}`}
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <AirportFareCard
                    rate={selected}
                    labels={{
                      destination: t("pages.airport.rates.card.destination"),
                      fare: t("pages.airport.rates.card.fare"),
                      airport: t("pages.airport.rates.card.airport"),
                      status: t("pages.airport.rates.card.status"),
                      statusValue: t("pages.airport.rates.card.statusValue"),
                      code: t("pages.airport.rates.card.code"),
                      bookCta: t("pages.airport.rates.card.bookCta"),
                    }}
                  />
                  <p className="mt-4 text-center text-[0.75rem] leading-relaxed text-pretty text-ink-muted sm:text-left">
                    {t("pages.airport.rates.disclaimer")}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={
                    reduceMotion
                      ? undefined
                      : { opacity: 0, y: -6, transition: { duration: 0.18 } }
                  }
                  transition={{ duration: 0.3, ease: EASE }}
                  className="airport-rates-empty rounded-[24px] border border-dashed border-ink/10 bg-white/50 px-5 py-10 text-center backdrop-blur-sm"
                >
                  <p className="font-display text-base font-semibold text-ink">
                    {t("pages.airport.rates.emptyTitle")}
                  </p>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
                    {t("pages.airport.rates.emptyBody")}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </section>
  );
}
