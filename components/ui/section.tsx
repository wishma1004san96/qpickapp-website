import type { ReactNode } from "react";

type SectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: "foam" | "paper" | "ink" | "map";
};

const tones = {
  foam: "bg-foam text-ink",
  paper: "bg-paper text-ink",
  ink: "bg-ink text-foam",
  map: "bg-map-void text-foam",
} as const;

export function Section({
  children,
  className = "",
  id,
  tone = "foam",
}: SectionProps) {
  return (
    <section id={id} className={`py-16 sm:py-24 lg:py-32 ${tones[tone]} ${className}`}>
      {children}
    </section>
  );
}
