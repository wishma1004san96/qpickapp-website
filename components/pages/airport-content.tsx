"use client";

import {
  AirportFeatures,
  AirportHero,
} from "@/components/marketing/airport-hero";
import { AirportRates } from "@/components/marketing/airport-rates";
import { BankingPartnerSection } from "@/components/marketing/banking-partner-section";

/**
 * Airport page — premium transfer landing + official rates lookup.
 * Navbar and other global chrome untouched.
 */
export function AirportContent() {
  return (
    <div className="bg-foam">
      <AirportHero />
      <AirportRates />
      <AirportFeatures />
      <BankingPartnerSection />
    </div>
  );
}
