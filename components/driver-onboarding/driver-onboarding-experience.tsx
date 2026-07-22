"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isValidSriLankanMobile } from "./types";
import { OnboardingSidePanel } from "./onboarding-side-panel";
import {
  StepBankDetails,
  StepCreateAccount,
  StepDeclaration,
  StepDocumentUpload,
  StepDrivingInfo,
  StepPersonalDetails,
  StepVehicleDetails,
} from "./onboarding-steps";
import {
  ONBOARDING_STEPS,
  draftFromApi,
  draftToPatch,
  emptyDraft,
  mobileForForm,
  type DriverOnboardingDraft,
  type OnboardingStep,
} from "./types";

const EASE = [0.22, 1, 0.36, 1] as const;
const SHELL =
  "mx-auto w-full min-w-0 max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10";

type DriverOnboardingExperienceProps = {
  googleConfigured?: boolean;
};

export function DriverOnboardingExperience({
  googleConfigured = false,
}: DriverOnboardingExperienceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion() ?? false;
  const [step, setStep] = useState<OnboardingStep>("account");
  const [draft, setDraft] = useState<DriverOnboardingDraft>(emptyDraft);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stepIndex = ONBOARDING_STEPS.indexOf(step);

  const load = useCallback(async () => {
    const res = await fetch("/api/drivers/application");
    const data = (await res.json()) as { item?: Record<string, unknown> | null };
    if (data.item) {
      const next = draftFromApi(data.item);
      setDraft(next);
      if (next.status === "PENDING_REVIEW" || next.status === "APPROVED") {
        router.replace("/drive/apply/success");
        return;
      }
      if (next.status === "SUBMITTED") {
        router.replace("/drive/apply/success");
      }
    }
    setLoaded(true);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (searchParams.get("auth_error") === "google") {
      setError("Google sign-in failed. Please try again or continue with email.");
    }
  }, [searchParams]);

  const persistDraft = useCallback(
    async (next: DriverOnboardingDraft, nextStep?: number) => {
      if (step === "account") return;
      setSaving(true);
      try {
        const res = await fetch("/api/drivers/application", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...draftToPatch(next),
            currentStep: nextStep ?? stepIndex + 1,
          }),
        });
        const data = (await res.json()) as {
          item?: Record<string, unknown>;
          error?: string;
        };
        if (!res.ok) {
          setError(data.error ?? "Could not save progress.");
          return;
        }
        if (data.item) {
          setDraft(draftFromApi(data.item));
        }
        setError(null);
      } finally {
        setSaving(false);
      }
    },
    [step, stepIndex],
  );

  const updateDraft = useCallback(
    (patch: Partial<DriverOnboardingDraft>) => {
      setDraft((prev) => {
        const sanitized =
          patch.mobile != null
            ? { ...patch, mobile: mobileForForm(patch.mobile) }
            : patch;
        const next = { ...prev, ...sanitized };
        if (step === "account") return next;
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
          void persistDraft(next);
        }, 600);
        return next;
      });
    },
    [persistDraft, step],
  );

  const canContinue = useMemo(() => {
    switch (step) {
      case "account":
        if (!draft.accountVerified) {
          return draft.email.includes("@") && draft.password.length >= 8;
        }
        return (
          draft.fullName.trim().length > 1 && isValidSriLankanMobile(draft.mobile)
        );
      case "personal":
        return Boolean(
          draft.dateOfBirth &&
            draft.gender &&
            draft.address &&
            draft.city &&
            draft.district &&
            draft.nicNumber &&
            draft.emergencyContactName &&
            draft.emergencyContactPhone,
        );
      case "driving":
        return Boolean(
          draft.licenseNumber &&
            draft.licenseExpiry &&
            draft.yearsExperience &&
            draft.languagesSpoken.length > 0,
        );
      case "vehicle":
        return Boolean(
          draft.vehicleCategory &&
            draft.vehicleMake &&
            draft.vehicleModel &&
            draft.vehicleYear &&
            draft.registrationNumber &&
            draft.vehicleColour &&
            draft.passengerCapacity,
        );
      case "bank":
        return Boolean(
          draft.bankName &&
            draft.bankBranch &&
            draft.accountHolderName &&
            draft.accountNumber,
        );
      case "documents":
        return true;
      case "declaration":
        return (
          draft.declarationAccepted &&
          draft.termsAccepted &&
          draft.privacyAccepted
        );
      default:
        return false;
    }
  }, [step, draft]);

  async function continueWithEmail() {
    setAuthBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/drivers/auth/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: draft.email, password: draft.password }),
      });
      const data = (await res.json()) as {
        item?: Record<string, unknown>;
        error?: string;
      };
      if (!res.ok || !data.item) {
        setError(data.error ?? "Could not sign in with email.");
        return;
      }
      setDraft(draftFromApi(data.item));
    } finally {
      setAuthBusy(false);
    }
  }

  async function saveAccountStep(): Promise<boolean> {
    setSaving(true);
    setError(null);
    try {
      if (!draft.accountVerified) {
        await continueWithEmail();
        return false;
      }

      const res = await fetch("/api/drivers/application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "account",
          fullName: draft.fullName,
          mobile: draft.mobile,
        }),
      });
      const data = (await res.json()) as {
        item?: Record<string, unknown>;
        error?: string;
      };
      if (!res.ok || !data.item) {
        setError(data.error ?? "Could not save account details.");
        return false;
      }
      setDraft(draftFromApi(data.item));
      return true;
    } finally {
      setSaving(false);
    }
  }

  const goNext = useCallback(async () => {
    setError(null);
    if (step === "account") {
      if (!draft.accountVerified) {
        await continueWithEmail();
        return;
      }
      const ok = await saveAccountStep();
      if (!ok) return;
    } else if (step === "declaration") {
      setSaving(true);
      try {
        await persistDraft(draft);
        const res = await fetch("/api/drivers/application/submit", { method: "POST" });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          setError(data.error ?? "Submit failed.");
          return;
        }
        router.push("/drive/apply/success");
        return;
      } finally {
        setSaving(false);
      }
    } else {
      await persistDraft(draft, stepIndex + 2);
    }

    if (stepIndex < ONBOARDING_STEPS.length - 1) {
      setStep(ONBOARDING_STEPS[stepIndex + 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [step, stepIndex, draft, persistDraft, router, draft.accountVerified]);

  const goBack = useCallback(() => {
    if (stepIndex > 0) {
      setStep(ONBOARDING_STEPS[stepIndex - 1]);
      setError(null);
    }
  }, [stepIndex]);

  const continueLabel = useMemo(() => {
    if (step === "declaration") return "Submit application";
    if (step === "account" && !draft.accountVerified) return "Continue with Email";
    return "Continue";
  }, [step, draft.accountVerified]);

  if (!loaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-foam text-sm text-ink/50">
        Loading application…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-foam">
      <header className="sticky top-0 z-40 border-b border-ink/6 bg-foam/90 backdrop-blur-xl">
        <div className={`${SHELL} flex items-center justify-between gap-4 py-3`}>
          <div className="flex items-center gap-3">
            {stepIndex > 0 ? (
              <button
                type="button"
                onClick={goBack}
                className="rounded-full p-2 text-ink/50 hover:bg-ink/5 hover:text-ink"
                aria-label="Back"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : (
              <Link
                href="/drive"
                className="rounded-full p-2 text-ink/50 hover:bg-ink/5 hover:text-ink"
                aria-label="Back to drive"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
            )}
            <div>
              <p className="font-mono text-[0.625rem] tracking-[0.16em] text-brand uppercase">
                Q Pick Driver
              </p>
              <p className="text-sm font-semibold text-ink">Apply to drive</p>
            </div>
          </div>
          {saving ? <p className="text-xs text-ink/40">Saving…</p> : null}
        </div>
      </header>

      <div
        className={`${SHELL} grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10 lg:py-10`}
      >
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              {step === "account" ? (
                <StepCreateAccount
                  draft={draft}
                  onChange={updateDraft}
                  onEmailContinue={() => void continueWithEmail()}
                  authBusy={authBusy}
                  googleConfigured={googleConfigured}
                />
              ) : null}
              {step === "personal" ? (
                <StepPersonalDetails draft={draft} onChange={updateDraft} />
              ) : null}
              {step === "driving" ? (
                <StepDrivingInfo draft={draft} onChange={updateDraft} />
              ) : null}
              {step === "vehicle" ? (
                <StepVehicleDetails draft={draft} onChange={updateDraft} />
              ) : null}
              {step === "bank" ? (
                <StepBankDetails draft={draft} onChange={updateDraft} />
              ) : null}
              {step === "documents" ? (
                <StepDocumentUpload draft={draft} onChange={updateDraft} />
              ) : null}
              {step === "declaration" ? (
                <StepDeclaration draft={draft} onChange={updateDraft} />
              ) : null}
            </motion.div>
          </AnimatePresence>

          {error ? (
            <p className="mt-6 rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}

          <div className="mt-8 lg:hidden">
            <button
              type="button"
              disabled={!canContinue || saving || authBusy}
              onClick={() => void goNext()}
              className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-b from-[#2b7dff] to-[#0062fa] text-sm font-semibold text-paper disabled:opacity-40"
            >
              {continueLabel}
            </button>
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-24">
            <OnboardingSidePanel
              step={step}
              draft={draft}
              canContinue={canContinue}
              saving={saving || authBusy}
              onContinue={() => void goNext()}
              continueLabel={continueLabel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
