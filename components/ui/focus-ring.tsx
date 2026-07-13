import type { ReactNode } from "react";

/** Accessible focus ring utility wrapper for custom controls. */
export function FocusRing({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`rounded-[var(--radius-md)] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-lagoon ${className}`}
    >
      {children}
    </span>
  );
}
