import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import "./tour-card-buttons.css";

type TourCardButtonProps = {
  href: string;
  children: ReactNode;
  loading?: boolean;
  "aria-label"?: string;
  className?: string;
};

function cx(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function TourCardActions({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cx("tour-card-actions", className)}>{children}</div>;
}

export function TourCardBookButton({
  href,
  children,
  loading = false,
  "aria-label": ariaLabel,
  className,
}: TourCardButtonProps) {
  const label =
    ariaLabel ?? (typeof children === "string" ? children : undefined);

  if (loading) {
    return (
      <span
        className={cx(
          "tour-card-btn tour-card-btn--primary is-loading",
          className,
        )}
        role="status"
        aria-busy="true"
        aria-label={label}
      >
        <span className="tour-card-btn__spinner" aria-hidden="true" />
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={cx("tour-card-btn tour-card-btn--primary", className)}
      aria-label={label}
    >
      <span className="tour-card-btn__label">{children}</span>
      <ArrowRight className="tour-card-btn__arrow" aria-hidden="true" />
    </Link>
  );
}

export function TourCardDetailsButton({
  href,
  children,
  loading = false,
  "aria-label": ariaLabel,
  className,
}: TourCardButtonProps) {
  const label =
    ariaLabel ?? (typeof children === "string" ? children : undefined);

  if (loading) {
    return (
      <span
        className={cx(
          "tour-card-btn tour-card-btn--secondary is-loading",
          className,
        )}
        role="status"
        aria-busy="true"
        aria-label={label}
      >
        <span
          className="tour-card-btn__spinner tour-card-btn__spinner--dark"
          aria-hidden="true"
        />
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={cx("tour-card-btn tour-card-btn--secondary", className)}
      aria-label={label}
    >
      <span className="tour-card-btn__label">{children}</span>
    </Link>
  );
}
