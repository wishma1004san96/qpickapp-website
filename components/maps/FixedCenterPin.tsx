"use client";

type FixedCenterPinProps = {
  /** Bounce while the map is being dragged */
  isMoving: boolean;
  /** Pickup = brand blue, destination = ink */
  variant?: "pickup" | "destination";
  className?: string;
};

/**
 * Fixed overlay pin — stays at CSS center of the map container.
 * The map moves underneath; this pin never moves (Uber / PickMe / InDrive).
 */
export function FixedCenterPin({
  isMoving,
  variant = "pickup",
  className = "",
}: FixedCenterPinProps) {
  const fill = variant === "pickup" ? "#0062fa" : "#0a1620";

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-[500] flex items-center justify-center ${className}`}
      aria-hidden="true"
    >
      <div
        className={`qpick-fixed-pin ${isMoving ? "qpick-fixed-pin--moving" : "qpick-fixed-pin--settled"}`}
      >
        <svg
          width="48"
          height="62"
          viewBox="0 0 48 62"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="qpick-fixed-pin__svg"
        >
          <path
            d="M24 2.5c-9.1 0-16.5 7.4-16.5 16.5 0 12.4 16.5 35 16.5 35S40.5 31.4 40.5 19 33.1 2.5 24 2.5z"
            fill={fill}
            stroke="#ffffff"
            strokeWidth="2.75"
          />
          <circle cx="24" cy="19" r="8.5" fill="#ffffff" />
          <circle cx="24" cy="19" r="4" fill={fill} />
        </svg>
        <span className="qpick-fixed-pin__shadow" />
      </div>
    </div>
  );
}
