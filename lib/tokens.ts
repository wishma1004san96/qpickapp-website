/**
 * Q Pick brand tokens — aligned to official app logo.
 * Accent blue is reserved for CTAs, active states, focus, and small accents.
 * Mirrored in app/globals.css for Tailwind v4 @theme.
 */

export const colors = {
  ink: "#0A1620",
  /** Official logo primary blue — interactive accent only */
  brand: "#0062FA",
  brandDeep: "#0036F9",
  brandBright: "#0193FB",
  /** @deprecated Alias — use `brand` */
  lagoon: "#0062FA",
  /** @deprecated Alias — use `brandDeep` */
  lagoonDeep: "#0036F9",
  foam: "#F3F6F7",
  paper: "#FFFFFF",
  mist: "#D7E2E6",
  brass: "#A67C52",
  success: "#1F7A4C",
  warning: "#B87A12",
  danger: "#B42318",
  mapVoid: "#071018",
  inkMuted: "#4A5A66",
  inkSoft: "#6B7C88",
} as const;

export const brandAssets = {
  logo: "/logos/qpick-logo.webp",
} as const;

export const radii = {
  sm: "6px",
  md: "12px",
  lg: "20px",
} as const;

export const motion = {
  easeCinematic: "cubic-bezier(0.22, 1, 0.36, 1)",
  durationMicro: "150ms",
  durationUi: "280ms",
  durationReveal: "600ms",
} as const;

export const spacing = {
  sectionSm: "4rem",
  sectionMd: "6rem",
  sectionLg: "8rem",
} as const;
