import { randomBytes } from "crypto";

export const PENDING_MOBILE_PREFIX = "pending-";

/** Unique placeholder until the driver enters their number in step 1. */
export function pendingMobilePlaceholder(): string {
  return `${PENDING_MOBILE_PREFIX}${randomBytes(16).toString("hex")}`;
}

export function isRealMobile(mobile: string | null | undefined): boolean {
  return Boolean(mobile?.trim()) && !mobile!.startsWith(PENDING_MOBILE_PREFIX);
}
