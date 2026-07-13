import type { ReactNode } from "react";

export function Bleed({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 ${className}`}>
      {children}
    </div>
  );
}
