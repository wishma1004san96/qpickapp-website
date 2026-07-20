"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Hand, Plane } from "lucide-react";
import type { ArrivalInfo } from "../types";
import { AIRLINES, todayISO } from "../helpers";

const EASE = [0.22, 1, 0.36, 1] as const;

const fieldClass =
  "w-full rounded-[1.1rem] border border-ink/8 bg-white/75 px-4 py-3.5 text-base text-ink outline-none backdrop-blur-md transition-[border-color,box-shadow] placeholder:text-ink/35 focus:border-brand/35 focus:ring-4 focus:ring-brand/10";

type StepArrivalProps = {
  value: ArrivalInfo;
  onChange: (patch: Partial<ArrivalInfo>) => void;
};

export function StepArrival({ value, onChange }: StepArrivalProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const hasFlight = value.flightNumber.trim().length >= 2;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-brand uppercase">
          Step 3 of 5
        </p>
        <h2 className="font-display text-[clamp(1.65rem,3.5vw,2.35rem)] font-semibold tracking-tight text-ink">
          Arrival information
        </h2>
        <p className="max-w-2xl text-[0.9375rem] leading-relaxed text-ink/60">
          Share your flight so your chauffeur can time the welcome perfectly.
        </p>
      </header>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="space-y-4 rounded-[1.5rem] border border-ink/8 bg-white/70 p-5 shadow-[0_12px_36px_rgb(10_22_32_/_0.06)] backdrop-blur-xl sm:p-6"
      >
        <div className="flex items-center gap-3 text-brand">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
            <Plane className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">Flight details</p>
            <p className="text-xs text-ink/45">Landing at CMB</p>
          </div>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium tracking-wide text-ink/45 uppercase">
            Flight number
          </span>
          <input
            className={fieldClass}
            value={value.flightNumber}
            onChange={(e) => onChange({ flightNumber: e.target.value })}
            placeholder="e.g. UL123"
            autoCapitalize="characters"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium tracking-wide text-ink/45 uppercase">
            Airline
          </span>
          <select
            className={fieldClass}
            value={value.airline}
            onChange={(e) => onChange({ airline: e.target.value })}
          >
            <option value="">Select airline</option>
            {AIRLINES.map((a) => (
              <option key={a} value={a === "other" ? "Other" : a}>
                {a === "other" ? "Other" : a}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium tracking-wide text-ink/45 uppercase">
              Arrival date
            </span>
            <input
              type="date"
              className={fieldClass}
              min={todayISO()}
              value={value.arrivalDate}
              onChange={(e) => onChange({ arrivalDate: e.target.value })}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium tracking-wide text-ink/45 uppercase">
              Arrival time
            </span>
            <input
              type="time"
              className={fieldClass}
              value={value.arrivalTime}
              onChange={(e) => onChange({ arrivalTime: e.target.value })}
              required
            />
          </label>
        </div>

        {hasFlight ? (
          <div className="flex items-start gap-3 rounded-[1.1rem] border border-emerald-500/20 bg-emerald-500/8 px-4 py-3">
            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
            <div>
              <p className="text-sm font-semibold text-ink">
                Flight status monitoring
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink/55">
                Live status for{" "}
                <span className="font-mono font-semibold">
                  {value.flightNumber.trim().toUpperCase()}
                </span>{" "}
                will be shared with your chauffeur once assigned — delays are
                handled automatically.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-ink/45">
            Add a flight number to enable status monitoring for your chauffeur.
          </p>
        )}
      </motion.div>

      <button
        type="button"
        onClick={() => onChange({ meetAndGreet: !value.meetAndGreet })}
        aria-pressed={value.meetAndGreet}
        className={`flex w-full items-start gap-4 rounded-[1.5rem] border p-5 text-left transition-[border-color,box-shadow,background] sm:p-6 ${
          value.meetAndGreet
            ? "border-brand bg-brand/[0.06] shadow-[0_12px_32px_rgb(0_98_250_/_0.12)] ring-2 ring-brand/20"
            : "border-ink/8 bg-white/70 shadow-[0_8px_24px_rgb(10_22_32_/_0.05)] hover:border-brand/25"
        }`}
      >
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
            value.meetAndGreet
              ? "bg-brand text-paper"
              : "bg-brand/10 text-brand"
          }`}
        >
          <Hand className="h-5 w-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="font-display text-lg font-semibold text-ink">
              Meet & Greet
            </span>
            <span
              className={`h-6 w-11 rounded-full p-0.5 transition-colors ${
                value.meetAndGreet ? "bg-brand" : "bg-ink/15"
              }`}
              aria-hidden
            >
              <span
                className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  value.meetAndGreet ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </span>
          </span>
          <span className="mt-1 block text-sm leading-relaxed text-ink/55">
            Your chauffeur meets you in arrivals with a name board — ideal after
            a long-haul flight.
          </span>
        </span>
      </button>
    </div>
  );
}
