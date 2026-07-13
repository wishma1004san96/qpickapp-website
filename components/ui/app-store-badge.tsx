/**
 * App store badge placeholders — live links in Phase 3.
 */
export function AppStoreBadge({
  store,
  className = "",
}: {
  store: "ios" | "android";
  className?: string;
}) {
  const label = store === "ios" ? "Download on the App Store" : "Get it on Google Play";

  return (
    <span
      role="img"
      aria-label={`${label} — coming soon`}
      className={`inline-flex min-h-11 items-center gap-2.5 rounded-[var(--radius-md)] border border-mist bg-ink px-4 text-foam ${className}`}
    >
      {store === "ios" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
          <path d="M16.4 12.3c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.8-3.1.8-.7 0-1.7-.7-2.8-.7-1.4 0-2.8.9-3.5 2.2-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.7 2.1 1.1 0 1.5-.7 2.8-.7s1.7.7 2.8.7c1.2 0 2-1 2.7-2 .8-1.2 1.2-2.3 1.2-2.4-.1 0-2.2-.9-2.2-3.7zm-2-6.2c.6-.7 1-1.7.9-2.7-0.9.0-1.9.6-2.5 1.3-.6.6-1.1 1.7-.9 2.6 1 .1 1.9-.5 2.5-1.2z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
          <path d="M3.6 2.3c-.3.2-.6.6-.6 1.1v17.2c0 .5.3.9.6 1.1l9.5-9.7L3.6 2.3zm11.2 8.4 2.2-1.3-2.2-1.3-9.1-5.3 9.1 7.9zm.7 1.3-2.5 1.4 2.5 2.2 3.3-1.9c.5-.3.5-.9 0-1.2l-3.3-.5zM4.5 20.8l8.6-7.5-2.2-1.9-6.4 9.4zm12.5-4.1-2.5-2.2-2.2 1.3 4.7 2.7.0-.0-.0-.0z" />
        </svg>
      )}
      <span className="flex flex-col items-start leading-tight">
        <span className="font-mono text-[0.6rem] uppercase tracking-wider text-foam/60">
          Coming soon
        </span>
        <span className="text-sm font-medium">
          {store === "ios" ? "App Store" : "Google Play"}
        </span>
      </span>
    </span>
  );
}
