const partners = [
  "Galle Face Hotel",
  "Cinnamon",
  "Jetwing",
  "Shangri-La",
  "Amangalla",
] as const;

/** Quiet partner wordmark row — no logo assets required in Phase 1. */
export function PartnerLogoRow({
  className = "",
}: {
  className?: string;
}) {
  return (
    <ul
      className={`flex flex-wrap items-center gap-x-8 gap-y-3 ${className}`}
      aria-label="Hospitality partners"
    >
      {partners.map((name) => (
        <li
          key={name}
          className="font-display text-sm tracking-wide text-ink-soft/80"
        >
          {name}
        </li>
      ))}
    </ul>
  );
}
