import type { ReactNode } from "react";

type ClusterProps = {
  children: ReactNode;
  className?: string;
  gap?: "sm" | "md" | "lg";
};

const gaps = {
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
} as const;

export function Cluster({ children, className = "", gap = "md" }: ClusterProps) {
  return (
    <div className={`flex flex-wrap items-center ${gaps[gap]} ${className}`}>
      {children}
    </div>
  );
}
