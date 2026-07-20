"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { PassengerInfo } from "../types";
import { NATIONALITIES } from "../helpers";

const EASE = [0.22, 1, 0.36, 1] as const;

const fieldClass =
  "w-full rounded-[1.1rem] border border-ink/8 bg-white/75 px-4 py-3.5 text-base text-ink outline-none backdrop-blur-md transition-[border-color,box-shadow] placeholder:text-ink/35 focus:border-brand/35 focus:ring-4 focus:ring-brand/10";

type StepPassengerProps = {
  value: PassengerInfo;
  onChange: (patch: Partial<PassengerInfo>) => void;
};

export function StepPassenger({ value, onChange }: StepPassengerProps) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-brand uppercase">
          Step 4 of 5
        </p>
        <h2 className="font-display text-[clamp(1.65rem,3.5vw,2.35rem)] font-semibold tracking-tight text-ink">
          Passenger details
        </h2>
        <p className="max-w-2xl text-[0.9375rem] leading-relaxed text-ink/60">
          So we can confirm your transfer and keep you updated.
        </p>
      </header>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="space-y-4 rounded-[1.5rem] border border-ink/8 bg-white/70 p-5 shadow-[0_12px_36px_rgb(10_22_32_/_0.06)] backdrop-blur-xl sm:p-6"
      >
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium tracking-wide text-ink/45 uppercase">
            Full name
          </span>
          <input
            className={fieldClass}
            value={value.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="As on your passport"
            autoComplete="name"
            required
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium tracking-wide text-ink/45 uppercase">
              Phone
            </span>
            <input
              className={fieldClass}
              value={value.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="+94 …"
              autoComplete="tel"
              inputMode="tel"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium tracking-wide text-ink/45 uppercase">
              WhatsApp
            </span>
            <input
              className={fieldClass}
              value={value.whatsapp}
              onChange={(e) => onChange({ whatsapp: e.target.value })}
              placeholder="Same as phone, or different"
              inputMode="tel"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium tracking-wide text-ink/45 uppercase">
            Email
          </span>
          <input
            type="email"
            className={fieldClass}
            value={value.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="you@email.com"
            autoComplete="email"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium tracking-wide text-ink/45 uppercase">
            Nationality
          </span>
          <select
            className={fieldClass}
            value={value.nationality}
            onChange={(e) => onChange({ nationality: e.target.value })}
          >
            <option value="">Select nationality</option>
            {NATIONALITIES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium tracking-wide text-ink/45 uppercase">
            Special requests
          </span>
          <textarea
            className={`${fieldClass} min-h-28 resize-y`}
            value={value.specialRequests}
            onChange={(e) => onChange({ specialRequests: e.target.value })}
            placeholder="Child seat, accessibility needs, drop-off notes…"
          />
        </label>
      </motion.div>
    </div>
  );
}
