"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Clock, Shield } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

const EASE = [0.22, 1, 0.36, 1] as const;

type HistoryEntry = { status: string; at: string; note?: string };

type AirportTransferSuccessProps = {
  referenceCode: string;
  statusLabel: string;
  statusHint: string;
  details: { label: string; value: string }[];
  history: HistoryEntry[];
  statusLabels: Record<string, string>;
};

export function AirportTransferSuccess({
  referenceCode,
  statusLabel,
  statusHint,
  details,
  history,
  statusLabels,
}: AirportTransferSuccessProps) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <main className="relative min-h-svh overflow-hidden bg-foam">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,rgb(0_98_250_/_0.14),transparent_55%)]"
        aria-hidden
      />

      <section className="relative border-b border-ink/6 bg-map-void pt-28 pb-16 text-foam sm:pt-32 sm:pb-20">
        <Container>
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mx-auto flex max-w-lg flex-col items-center text-center"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/20 ring-8 ring-brand/10">
              <CheckCircle2 className="h-8 w-8 text-brand-bright" aria-hidden />
            </span>
            <p className="mt-6 font-mono text-[0.6875rem] tracking-[0.2em] text-brand-bright uppercase">
              Request submitted
            </p>
            <h1 className="mt-3 font-display text-[clamp(1.85rem,5vw,2.75rem)] font-semibold tracking-tight">
              Your chauffeur request is on its way
            </h1>
            <p className="mt-3 max-w-md text-base leading-relaxed text-foam/65">
              Our team will review your Airport Transfer Request and assign a
              professional chauffeur. You&apos;ll be updated when the driver is
              confirmed.
            </p>
            <div className="mt-8 rounded-[1.25rem] border border-foam/15 bg-foam/8 px-6 py-4 backdrop-blur-md">
              <p className="text-[0.6875rem] tracking-wide text-foam/45 uppercase">
                Booking reference
              </p>
              <p className="mt-1 font-mono text-xl font-semibold tracking-wide text-foam">
                {referenceCode}
              </p>
            </div>
          </motion.div>
        </Container>
      </section>

      <Container className="relative py-10 sm:py-14">
        <div className="mx-auto max-w-xl space-y-6">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: EASE }}
            className="rounded-[1.5rem] border border-ink/8 bg-white/80 p-6 shadow-[0_16px_40px_rgb(10_22_32_/_0.08)] backdrop-blur-xl sm:p-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Clock className="h-4 w-4 text-brand" aria-hidden />
                Driver assignment status
              </div>
              <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand-deep">
                {statusLabel}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink/60">
              {statusHint}
            </p>

            <ul className="mt-6 space-y-3">
              {[
                {
                  done: true,
                  label: "Request received",
                  sub: "Your transfer details are secured",
                },
                {
                  done: false,
                  label: "Admin review",
                  sub: "Our desk confirms timing & vehicle",
                },
                {
                  done: false,
                  label: "Chauffeur assigned",
                  sub: "You'll get driver details when ready",
                },
              ].map((row) => (
                <li key={row.label} className="flex gap-3">
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                      row.done
                        ? "bg-brand text-paper"
                        : "border-2 border-ink/15 bg-white"
                    }`}
                  >
                    {row.done ? (
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                    ) : null}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{row.label}</p>
                    <p className="text-xs text-ink/45">{row.sub}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          <div className="rounded-[1.5rem] border border-ink/8 bg-white/80 p-6 backdrop-blur-xl sm:p-8">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-brand" aria-hidden />
              <h2 className="font-display text-lg font-semibold text-ink">
                Transfer details
              </h2>
            </div>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              {details.map((row) => (
                <div key={row.label}>
                  <dt className="text-[0.6875rem] font-medium tracking-wide text-ink/40 uppercase">
                    {row.label}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-ink">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {history.length > 0 ? (
            <div className="rounded-[1.5rem] border border-ink/8 bg-white/80 p-6 backdrop-blur-xl sm:p-8">
              <h2 className="font-display text-lg font-semibold text-ink">
                Status timeline
              </h2>
              <ol className="mt-5 space-y-4">
                {history.map((entry, i) => (
                  <li key={`${entry.at}-${i}`} className="flex gap-3">
                    <span
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand"
                      aria-hidden
                    />
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        {statusLabels[entry.status] ?? entry.status}
                      </p>
                      {entry.note ? (
                        <p className="mt-0.5 text-sm text-ink/55">{entry.note}</p>
                      ) : null}
                      <p className="mt-0.5 font-mono text-[0.6875rem] text-ink/35">
                        {new Date(entry.at).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3 pt-2">
            <ButtonLink href="/airport-transfer">Book another transfer</ButtonLink>
            <ButtonLink href="/airport" variant="secondary">
              View rates
            </ButtonLink>
            <Link
              href="/support"
              className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-ink/55 underline-offset-4 hover:text-ink hover:underline"
            >
              Contact support
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
