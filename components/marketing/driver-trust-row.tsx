export function DriverTrustRow({
  name,
  trips,
  rating,
}: {
  name: string;
  trips: string;
  rating: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-[var(--radius-md)] border border-mist bg-paper px-4 py-3">
      <div
        aria-hidden="true"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-lagoon/10 font-display text-lg text-lagoon"
      >
        {name.slice(0, 1)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{name}</p>
        <p className="text-xs text-ink-soft">Verified Q Pick driver</p>
      </div>
      <div className="text-right">
        <p className="font-mono text-sm text-ink">{rating}</p>
        <p className="font-mono text-xs text-ink-soft">{trips} trips</p>
      </div>
    </div>
  );
}
