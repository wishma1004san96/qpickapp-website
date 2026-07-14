"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  locales,
  localeLabels,
  type Locale,
} from "@/lib/i18n/config";
import { useLocale, useTranslations } from "@/components/i18n/locale-provider";

/**
 * Premium header language dropdown — en / si / ta with persistent preference.
 */
export function LanguageSwitcher({
  className = "",
  tone = "default",
}: {
  className?: string;
  tone?: "default" | "onDark";
}) {
  const { locale, setLocale } = useLocale();
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const onDark = tone === "onDark";

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

  const selectLocale = (next: Locale) => {
    setLocale(next);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={t("language.choose")}
        onClick={() => setOpen((value) => !value)}
        className={[
          "inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium tracking-wide",
          "transition-[background-color,color,border-color,box-shadow] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)]",
          onDark
            ? "border border-foam/20 bg-foam/10 text-foam hover:bg-foam/16"
            : "border border-mist/80 bg-paper/80 text-ink hover:border-mist hover:bg-paper",
        ].join(" ")}
      >
        <span aria-hidden="true" className="text-[0.95rem] leading-none">
          🌐
        </span>
        <span>{localeLabels[locale].short}</span>
        <span
          aria-hidden="true"
          className={[
            "ml-0.5 text-[0.65rem] opacity-70 transition-transform duration-[var(--duration-ui)]",
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
            "absolute right-0 top-[calc(100%+0.4rem)] z-50 min-w-[11.5rem] overflow-hidden rounded-[var(--radius-md)] py-1.5",
            "border shadow-[0_12px_32px_rgb(10_22_32_/_0.16)] backdrop-blur-xl",
            onDark
              ? "border-foam/15 bg-map-void/95 text-foam"
              : "border-mist/80 bg-paper/95 text-ink",
          ].join(" ")}
        >
          {locales.map((code) => {
            const active = code === locale;
            return (
              <li key={code} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => selectLocale(code)}
                  className={[
                    "flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-sm transition-colors duration-[var(--duration-ui)]",
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
