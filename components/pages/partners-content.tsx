"use client";

import {
  PartnersFeatures,
  PartnersHero,
  PartnersTrusted,
} from "@/components/marketing/partners-hero";

/**
 * Partners page — premium hospitality partner landing.
 * Navbar and footer are unchanged (rendered by root layout).
 */
export function PartnersContent() {
  return (
    <div className="bg-foam">
      <PartnersHero />
      <PartnersTrusted />
      <PartnersFeatures />
    </div>
  );
}
