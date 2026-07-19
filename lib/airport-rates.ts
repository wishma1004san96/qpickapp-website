/**
 * Official Q Pick airport transfer rates — re-export from data/ for app imports.
 * Source of truth: data/airport-rates.ts
 */
export {
  AIRPORT_ORIGIN,
  AIRPORT_RATES,
  POPULAR_AIRPORT_DESTINATION_CODES,
  formatAirportFare,
  getAirportRateByCode,
  getPopularAirportRates,
  searchAirportRates,
  type AirportRate,
  type AirportRateCurrency,
  type PopularAirportDestinationCode,
} from "@/data/airport-rates";

/** Short labels for popular destination chips (official codes unchanged). */
export const POPULAR_AIRPORT_LABELS: Record<string, string> = {
  N015: "Negombo",
  C002: "Colombo",
  K015: "Kandy",
  G008: "Galle",
  B016: "Bentota",
  H015: "Hikkaduwa",
  S005: "Sigiriya",
  D001: "Dambulla",
  H022: "Haputale",
  M042: "Mirissa",
};
