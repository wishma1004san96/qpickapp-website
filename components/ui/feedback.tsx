import type { ReactNode } from "react";

export function InlineAlert({
  tone = "info",
  children,
  title,
}: {
  tone?: "info" | "success" | "warning" | "danger";
  title?: string;
  children: ReactNode;
}) {
  const tones = {
    info: "border-mist bg-foam text-ink",
    success: "border-success/30 bg-success/5 text-ink",
    warning: "border-warning/30 bg-warning/5 text-ink",
    danger: "border-danger/30 bg-danger/5 text-ink",
  } as const;

  return (
    <div
      role="status"
      className={`rounded-[var(--radius-md)] border px-4 py-3 text-sm ${tones[tone]}`}
    >
      {title ? <p className="font-medium">{title}</p> : null}
      <div className={title ? "mt-1 text-ink-muted" : ""}>{children}</div>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-[var(--radius-md)] bg-mist ${className}`}
    />
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="inline-flex items-center gap-3" role="status">
      <span
        aria-hidden="true"
        className="h-5 w-5 animate-spin rounded-full border-2 border-mist border-t-lagoon"
      />
      <span className="text-sm text-ink-muted">{label}</span>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-3 py-10">
      <h2 className="text-lg font-medium text-ink">{title}</h2>
      <p className="max-w-md text-sm text-ink-muted">{body}</p>
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  body = "Please try again, or contact support if it continues.",
  action,
}: {
  title?: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-3 py-10" role="alert">
      <h2 className="text-lg font-medium text-danger">{title}</h2>
      <p className="max-w-md text-sm text-ink-muted">{body}</p>
      {action}
    </div>
  );
}

export function Toast({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "info" | "success" | "danger";
}) {
  const tones = {
    info: "bg-ink text-foam",
    success: "bg-success text-paper",
    danger: "bg-danger text-paper",
  } as const;

  return (
    <div
      role="status"
      className={`fixed bottom-6 left-1/2 z-50 max-w-sm -translate-x-1/2 rounded-[var(--radius-md)] px-4 py-3 text-sm shadow-ambient ${tones[tone]}`}
    >
      {children}
    </div>
  );
}
