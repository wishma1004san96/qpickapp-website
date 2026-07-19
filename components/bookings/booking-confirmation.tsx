"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

type HistoryEntry = { status: string; at: string; note?: string };

type BookingConfirmationProps = {
  title: string;
  subtitle: string;
  referenceCode: string;
  statusLabel: string;
  statusHint: string;
  details: { label: string; value: string }[];
  history: HistoryEntry[];
  statusLabels: Record<string, string>;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  accent?: ReactNode;
};

export function BookingConfirmation({
  title,
  subtitle,
  referenceCode,
  statusLabel,
  statusHint,
  details,
  history,
  statusLabels,
  primaryHref,
  primaryLabel,
  secondaryHref = "/",
  secondaryLabel = "Back to home",
  accent,
}: BookingConfirmationProps) {
  return (
    <main className="min-h-svh bg-foam">
      <section className="border-b border-ink/8 bg-map-void pt-28 pb-16 text-foam sm:pt-32">
        <Container>
          <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand-bright uppercase">
            Booking confirmation
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-[clamp(1.75rem,4vw,2.75rem)] font-semibold tracking-tight">
            {title}
          </h1>
          <p className="mt-3 max-w-xl text-foam/65">{subtitle}</p>
          {accent}
        </Container>
      </section>

      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-2xl space-y-8">
          <div className="rounded-[1.25rem] border border-ink/8 bg-paper p-6 shadow-[var(--shadow-ambient)] sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium tracking-wide text-ink/45 uppercase">
                  Reference
                </p>
                <p className="mt-1 font-mono text-lg font-semibold text-ink">
                  {referenceCode}
                </p>
              </div>
              <div className="rounded-full border border-brand/20 bg-brand/8 px-3.5 py-1.5 text-sm font-semibold text-brand-deep">
                {statusLabel}
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink/65">
              {statusHint}
            </p>

            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              {details.map((row) => (
                <div key={row.label}>
                  <dt className="text-xs font-medium tracking-wide text-ink/45 uppercase">
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
            <div className="rounded-[1.25rem] border border-ink/8 bg-paper p-6 sm:p-8">
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
                        <p className="mt-0.5 text-sm text-ink/60">
                          {entry.note}
                        </p>
                      ) : null}
                      <p className="mt-0.5 font-mono text-[0.6875rem] text-ink/40">
                        {new Date(entry.at).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <ButtonLink href={primaryHref}>{primaryLabel}</ButtonLink>
            <ButtonLink href={secondaryHref} variant="secondary">
              {secondaryLabel}
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
