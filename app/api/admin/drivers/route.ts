import { listDriverApplications, listPendingDriverApplications } from "@/domains/driver-applications";
import { isSuperAdmin } from "@/lib/drivers/session";

export async function GET(request: Request) {
  if (!isSuperAdmin(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const pending = url.searchParams.get("pending") === "1";

  const items = pending
    ? await listPendingDriverApplications()
    : await listDriverApplications();

  return Response.json({ items });
}
