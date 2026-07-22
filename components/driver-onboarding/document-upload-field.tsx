"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import type { DriverDocumentKey } from "@/domains/driver-applications/documents";
import { compressImageFile } from "@/lib/drivers/compress-image";

type DocumentUploadFieldProps = {
  docType: DriverDocumentKey;
  label: string;
  value?: string;
  onUploaded: (path: string) => void;
  accept?: string;
};

export function DocumentUploadField({
  docType,
  label,
  value,
  onUploaded,
  accept = "image/*,application/pdf",
}: DocumentUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value ?? null);

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    try {
      const uploadFile = file.type.startsWith("image/")
        ? await compressImageFile(file)
        : file;

      const form = new FormData();
      form.append("docType", docType);
      form.append("file", uploadFile);

      const res = await fetch("/api/drivers/documents", {
        method: "POST",
        body: form,
      });
      const data = (await res.json()) as { path?: string; error?: string };
      if (!res.ok || !data.path) {
        setError(data.error ?? "Upload failed");
        return;
      }
      setPreview(data.path);
      onUploaded(data.path);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const isPdf = preview?.endsWith(".pdf");

  return (
    <div className="rounded-[1.1rem] border border-ink/10 bg-white/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">{label}</p>
          <p className="mt-1 text-xs text-ink/45">JPEG, PNG, WebP or PDF · max 5 MB</p>
        </div>
        {preview ? (
          <button
            type="button"
            onClick={() => {
              setPreview(null);
            }}
            className="rounded-full p-1.5 text-ink/40 hover:bg-ink/5 hover:text-ink"
            aria-label={`Remove ${label}`}
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {preview ? (
        <div className="relative mt-3 overflow-hidden rounded-xl border border-ink/8 bg-foam">
          {isPdf ? (
            <a
              href={preview}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-24 items-center justify-center text-sm font-medium text-brand"
            >
              View PDF
            </a>
          ) : (
            <div className="relative h-32 w-full">
              <Image src={preview} alt={label} fill className="object-cover" sizes="320px" />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="mt-3 flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-brand/25 bg-brand/[0.03] text-sm font-medium text-brand transition hover:border-brand/40 hover:bg-brand/[0.06] disabled:opacity-50"
        >
          <Upload className="h-5 w-5" aria-hidden />
          {busy ? "Uploading…" : "Upload file"}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />

      {error ? (
        <p className="mt-2 text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
