import { TOUR_PRICING } from "./pricing/config";

export function formatTourPriceLkr(amount: number | null | undefined): string {
  if (amount == null || !Number.isFinite(amount)) {
    return TOUR_PRICING.quoteLabel;
  }
  return `LKR ${amount.toLocaleString("en-LK")}`;
}

export function formatTourPriceUsd(amount: number | null | undefined): string {
  if (amount == null || !Number.isFinite(amount)) {
    return "From USD —";
  }
  return `From USD ${amount.toLocaleString("en-US")}`;
}

export function getTourPricingConfig() {
  return TOUR_PRICING;
}
