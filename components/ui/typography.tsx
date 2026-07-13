import type { ReactNode } from "react";

export function DisplayHeading({
  children,
  className = "",
  as: Tag = "h1",
}: {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <Tag className={`font-display text-display text-balance ${className}`}>
      {children}
    </Tag>
  );
}

export function UIHeading({
  children,
  className = "",
  as: Tag = "h2",
  size = "h2",
}: {
  children: ReactNode;
  className?: string;
  as?: "h2" | "h3" | "h4";
  size?: "h2" | "h3";
}) {
  const sizeClass = size === "h2" ? "text-h2" : "text-h3";
  return (
    <Tag className={`font-medium tracking-tight text-balance ${sizeClass} ${className}`}>
      {children}
    </Tag>
  );
}

export function Prose({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-ink-muted measure-prose leading-relaxed ${className}`}>
      {children}
    </p>
  );
}
