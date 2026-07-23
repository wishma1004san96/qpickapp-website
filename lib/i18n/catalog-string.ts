import type { Messages } from "@/lib/i18n/get-messages";

function getByPath(obj: unknown, key: string): unknown {
  const parts = key.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    if (Array.isArray(current)) {
      const index = Number(part);
      if (!Number.isInteger(index)) return undefined;
      current = current[index];
      continue;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/** Read a toursCatalog string; fall back to English source when missing. */
export function catalogString(
  messages: Messages,
  key: string,
  fallback: string,
): string {
  const value = getByPath(messages, `toursCatalog.${key}`);
  if (typeof value === "string" && value.length > 0 && value !== key) {
    return value;
  }
  return fallback;
}

/** Read a toursHub string with fallback. */
export function hubString(
  messages: Messages,
  key: string,
  fallback: string,
): string {
  const value = getByPath(messages, `toursHub.${key}`);
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  return fallback;
}
