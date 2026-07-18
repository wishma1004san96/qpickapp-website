/**
 * Shared ride schedule helpers — client-safe (no Node fs).
 */

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Local YYYY-MM-DD for native date inputs. */
export function formatDateInput(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Local HH:mm for native time inputs. */
export function formatTimeInput(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function nowPlusMinutes(minutes: number, now = new Date()): Date {
  return new Date(now.getTime() + minutes * 60 * 1000);
}

/** Default schedule: today + current time + 30 minutes. */
export function defaultSchedule(now = new Date()): {
  date: string;
  time: string;
} {
  const pickup = nowPlusMinutes(30, now);
  return {
    date: formatDateInput(now),
    time: formatTimeInput(pickup),
  };
}

export function minPickupTimeForDate(
  travelDate: string,
  now = new Date(),
): string {
  if (travelDate === formatDateInput(now)) {
    return formatTimeInput(now);
  }
  return "00:00";
}

export function isScheduleValid(
  travelDate: string,
  pickupTime: string,
  now = new Date(),
): boolean {
  if (!travelDate || !pickupTime) return false;
  const today = formatDateInput(now);
  if (travelDate < today) return false;
  if (travelDate === today && pickupTime < formatTimeInput(now)) return false;
  return true;
}

/** Instant used for day/night fare when scheduling. */
export function scheduleToInstant(
  date: string,
  time: string,
): Date | undefined {
  if (!date || !time) return undefined;
  const d = new Date(`${date}T${time}:00`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}
