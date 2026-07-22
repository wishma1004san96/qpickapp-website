import {
  DRIVER_DOCUMENT_KEYS,
  setApplicationDocument,
  type DriverDocumentKey,
} from "@/domains/driver-applications";
import { jsonError } from "@/lib/bookings/shared";
import { getDriverSessionToken } from "@/lib/drivers/session";
import {
  ALLOWED_MIME,
  MAX_UPLOAD_BYTES,
  saveDriverUpload,
} from "@/lib/drivers/uploads";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const token = await getDriverSessionToken();
    if (!token) return jsonError("Not authenticated.", 401);

    const row = await prisma.driverApplication.findUnique({
      where: { sessionToken: token },
    });
    if (!row) return jsonError("Application not found.", 404);

    const form = await request.formData();
    const docType = String(form.get("docType") ?? "") as DriverDocumentKey;
    const file = form.get("file");

    if (!DRIVER_DOCUMENT_KEYS.includes(docType)) {
      return jsonError("Invalid document type.");
    }
    if (!(file instanceof File)) return jsonError("File required.");

    if (!ALLOWED_MIME.has(file.type)) {
      return jsonError("Only JPEG, PNG, WebP, or PDF files are allowed.");
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return jsonError("File must be under 5 MB.");
    }

    const ext =
      file.type === "application/pdf"
        ? "pdf"
        : file.type === "image/png"
          ? "png"
          : file.type === "image/webp"
            ? "webp"
            : "jpg";

    const buffer = Buffer.from(await file.arrayBuffer());
    const path = await saveDriverUpload(row.id, `${docType}.${ext}`, buffer);
    const item = await setApplicationDocument(token, docType, path);
    if (!item) return jsonError("Failed to save document.", 500);

    return Response.json({ item, path });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return jsonError(message, 500);
  }
}
