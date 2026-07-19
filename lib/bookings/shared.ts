/** Shared booking helpers — used by each domain independently. */

export type StatusHistoryEntry = {
  status: string;
  at: string;
  note?: string;
};

export function parseStatusHistory(raw: string): StatusHistoryEntry[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as StatusHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function appendStatusHistory(
  raw: string,
  status: string,
  note?: string,
): string {
  const history = parseStatusHistory(raw);
  history.push({
    status,
    at: new Date().toISOString(),
    ...(note ? { note } : {}),
  });
  return JSON.stringify(history);
}

export function makeReferenceCode(prefix: string): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${stamp}-${rand}`;
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
