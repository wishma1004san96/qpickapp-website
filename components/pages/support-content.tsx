"use client";

import {
  SupportContactCards,
  SupportFaq,
  SupportHero,
  SupportOffice,
  SupportQuickActions,
  SupportServices,
  SupportTrust,
} from "@/components/marketing/support-experience";

/**
 * Support page — premium customer support landing.
 * Navbar and footer unchanged (root layout).
 */
export function SupportContent() {
  return (
    <div className="support-page bg-foam">
      <SupportHero />
      <SupportContactCards />
      <SupportQuickActions />
      <SupportServices />
      <SupportFaq />
      <SupportOffice />
      <SupportTrust />
    </div>
  );
}
