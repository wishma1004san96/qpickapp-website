import type { ReactNode } from "react";
import "./package-detail-polish.css";

type TourSectionHeaderProps = {
  eyebrow?: string;
  title: string;
  lead?: string;
  className?: string;
};

export function TourSectionHeader({
  eyebrow,
  title,
  lead,
  className = "",
}: TourSectionHeaderProps) {
  return (
    <header className={className}>
      {eyebrow ? <p className="tour-detail-eyebrow">{eyebrow}</p> : null}
      <h2 className="tour-detail-title">{title}</h2>
      {lead ? <p className="tour-detail-lead">{lead}</p> : null}
    </header>
  );
}

export function TourDetailSection({
  id,
  children,
  className = "",
  "aria-label": ariaLabel,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={`tour-detail-section scroll-mt-28 ${className}`.trim()}
    >
      {children}
    </section>
  );
}

export { TourReveal } from "@/components/tours/tour-detail-reveal";
