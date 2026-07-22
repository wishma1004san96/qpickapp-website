import { mkdir, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads", "drivers");

export async function saveDriverUpload(
  applicationId: string,
  fileName: string,
  buffer: Buffer,
): Promise<string> {
  const dir = path.join(UPLOAD_ROOT, applicationId);
  await mkdir(dir, { recursive: true });
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fullPath = path.join(dir, safeName);
  await writeFile(fullPath, buffer);
  return `/uploads/drivers/${applicationId}/${safeName}`;
}

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);
