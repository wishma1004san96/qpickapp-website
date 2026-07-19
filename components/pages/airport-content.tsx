"use client";

import {
  AirportFeatures,
  AirportHero,
} from "@/components/marketing/airport-hero";
import { AirportRates } from "@/components/marketing/airport-rates";

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
    </div>
  );
}
