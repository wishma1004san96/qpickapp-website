"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  localeLabels,
  normalizeSelectorLocale,
  selectorLocales,
  type SelectorLocale,
} from "@/lib/i18n/config";
import { useLocale, useTranslations } from "@/components/i18n/locale-provider";

/**
 * Premium header language dropdown — English, Sinhala, Tamil with persistent preference.
 */
export function LanguageSwitcher({
  className = "",
  tone = "default",
  compact = false,
}: {
  className?: string;
  tone?: "default" | "onDark";
  /** Tighter control for mobile header (still ≥44px touch target). */
  compact?: boolean;
}) {
  const { locale, setLocale } = useLocale();
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const onDark = tone === "onDark";
  const activeLocale = normalizeSelectorLocale(locale);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selectLocale = (next: SelectorLocale) => {
    setLocale(next);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative inline-flex shrink-0 ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={t("language.choose")}
        onClick={() => setOpen((value) => !value)}
        className={[
          "inline-flex touch-manipulation items-center rounded-full font-medium tracking-wide",
          "transition-[background-color,color,border-color,box-shadow] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)]",
          compact
            ? "h-10 min-h-11 min-w-[4.25rem] max-w-[4.5rem] justify-center gap-1 px-2.5 text-[0.8125rem]"
            : "min-h-11 gap-1.5 px-3 text-sm",
          onDark
            ? "border border-foam/20 bg-foam/10 text-foam backdrop-blur-md hover:bg-foam/16"
            : "border border-mist/80 bg-paper/80 text-ink backdrop-blur-md hover:border-mist hover:bg-paper",
        ].join(" ")}
      >
        <span aria-hidden="true" className="text-[0.95rem] leading-none">
          🌐
        </span>
        <span>{localeLabels[activeLocale].short}</span>
        <span
          aria-hidden="true"
          className={[
            "text-[0.65rem] opacity-70 transition-transform duration-[var(--duration-ui)]",
            compact ? "" : "ml-0.5",
            open ? "rotate-180" : "",
          ].join(" ")}
        >
          ▾
        </span>
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={t("language.label")}
          className={[
            "absolute right-0 top-[calc(100%+0.4rem)] z-[130] min-w-[11.5rem] overflow-hidden rounded-[var(--radius-md)] py-1.5",
            "border shadow-[0_12px_32px_rgb(10_22_32_/_0.16)] backdrop-blur-xl",
            onDark
              ? "border-foam/15 bg-map-void/95 text-foam"
              : "border-mist/80 bg-paper/95 text-ink",
          ].join(" ")}
        >
          {selectorLocales.map((code) => {
            const active = code === activeLocale;
            return (
              <li key={code} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => selectLocale(code)}
                  className={[
                    "flex min-h-11 w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-sm transition-colors duration-[var(--duration-ui)]",
                    onDark ? "hover:bg-foam/10" : "hover:bg-mist/40",
                    active ? "font-medium" : "",
                  ].join(" ")}
                >
                  <span>{localeLabels[code].native}</span>
                  {active ? (
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 rounded-full ${onDark ? "bg-foam" : "bg-[#0A84FF]"}`}
                    />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
