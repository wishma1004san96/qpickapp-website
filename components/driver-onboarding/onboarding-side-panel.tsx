"use client";

import {
  ONBOARDING_STEP_LABELS,
  ONBOARDING_STEPS,
  type DriverOnboardingDraft,
  type OnboardingStep,
} from "./types";

type OnboardingSidePanelProps = {
  step: OnboardingStep;
  draft: DriverOnboardingDraft;
  canContinue: boolean;
  saving: boolean;
  onContinue: () => void;
  continueLabel?: string;
};

export function OnboardingSidePanel({
  step,
  draft,
  canContinue,
  saving,
  onContinue,
  continueLabel,
}: OnboardingSidePanelProps) {
  const stepIndex = ONBOARDING_STEPS.indexOf(step);
  const progress = ((stepIndex + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <aside className="flex flex-col overflow-hidden rounded-[1.5rem] border border-ink/8 bg-white/90 shadow-[0_24px_60px_rgb(10_22_32_/_0.12)] backdrop-blur-xl">
      <div className="border-b border-ink/6 p-5">
        <p className="font-mono text-[0.625rem] tracking-[0.16em] text-brand uppercase">
          Driver onboarding
        </p>
        <p className="mt-2 font-display text-lg font-semibold text-ink">
          {ONBOARDING_STEP_LABELS[step]}
        </p>
        <p className="mt-1 text-xs text-ink/45">
          Step {stepIndex + 1} of {ONBOARDING_STEPS.length}
        </p>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink/8">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand to-brand-bright transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="rounded-[1.1rem] bg-foam/90 p-4">
          <p className="text-[0.625rem] font-medium tracking-wide text-ink/40 uppercase">
            Profile completion
          </p>
          <p className="mt-1 font-display text-2xl font-semibold text-brand">
            {draft.profileCompletionPercent}%
          </p>
          {draft.referenceCode ? (
            <p className="mt-2 font-mono text-xs text-ink/45">{draft.referenceCode}</p>
          ) : null}
        </div>

        <ol className="space-y-2">
          {ONBOARDING_STEPS.map((s, i) => {
            const active = s === step;
            const done = i < stepIndex;
            return (
              <li
                key={s}
                className={`rounded-xl px-3 py-2 text-xs font-medium ${
                  active
                    ? "bg-brand/10 text-brand"
                    : done
                      ? "text-ink/55"
                      : "text-ink/35"
                }`}
              >
                {i + 1}. {ONBOARDING_STEP_LABELS[s]}
              </li>
            );
          })}
        </ol>

        <button
          type="button"
          disabled={!canContinue || saving}
          onClick={onContinue}
          className="mt-auto inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-b from-[#2b7dff] to-[#0062fa] text-sm font-semibold text-paper shadow-[0_12px_28px_rgb(0_98_250_/_0.35)] disabled:opacity-40"
        >
          {saving ? "Saving…" : continueLabel ?? (step === "declaration" ? "Submit application" : "Continue")}
        </button>
      </div>
    </aside>
  );
}
