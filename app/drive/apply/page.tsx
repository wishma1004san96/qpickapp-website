import { Suspense } from "react";
import type { Metadata } from "next";
import { DriverOnboardingExperience } from "@/components/driver-onboarding/driver-onboarding-experience";
import { isGoogleAuthConfigured } from "@/lib/drivers/google-auth";

export const metadata: Metadata = {
  title: "Apply to Drive",
  robots: { index: false, follow: false },
};

export default function DriveApplyPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center bg-foam text-sm text-ink/50">Loading application…</div>}>
      <DriverOnboardingExperience googleConfigured={isGoogleAuthConfigured()} />
    </Suspense>
  );
}
