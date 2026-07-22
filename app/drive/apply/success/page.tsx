import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Application Submitted",
  robots: { index: false, follow: false },
};

export default function DriveApplySuccessPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-foam px-4">
      <div className="max-w-lg rounded-[1.5rem] border border-ink/8 bg-white p-8 text-center shadow-[0_24px_60px_rgb(10_22_32_/_0.1)]">
        <p className="font-mono text-[0.625rem] tracking-[0.16em] text-brand uppercase">
          Pending approval
        </p>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
          Application submitted successfully
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/60">
          Your documents are now under review. Our team will verify your details and notify you once
          your Q Pick driver account is approved.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/driver/dashboard"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-b from-[#2b7dff] to-[#0062fa] px-5 text-sm font-semibold text-paper"
          >
            View dashboard
          </Link>
          <Link
            href="/drive"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-ink/10 px-5 text-sm font-semibold text-ink"
          >
            Back to drive
          </Link>
        </div>
      </div>
    </main>
  );
}
