import type { ReactNode } from "react";

export function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`font-mono text-xs tracking-[0.16em] text-lagoon uppercase ${className}`}
    >
      {children}
    </p>
  );
}

export function Quote({
  children,
  attribution,
}: {
  children: ReactNode;
  attribution?: string;
}) {
  return (
    <blockquote className="border-l-2 border-lagoon pl-5">
      <p className="font-display text-xl leading-snug text-ink text-balance">
        {children}
      </p>
      {attribution ? (
        <footer className="mt-3 text-sm text-ink-soft">— {attribution}</footer>
      ) : null}
    </blockquote>
  );
}
