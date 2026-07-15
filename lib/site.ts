export const siteConfig = {
  name: "Q Pick",
  shortName: "Q",
  tagline: "Sri Lanka, moved with certainty.",
  description:
    "Premium ride-hailing and tourism across Sri Lanka — airport transfers, city rides, and island journeys under one trusted standard.",
  url: "https://qpick.lk",
  supportEmail: "support@qpick.lk",
  /** Official line from qpickapp.com contact */
  emergencyLine: "+94 11 433 4334",
  phoneLines: [
    "+94 11 433 4334",
    "+94 11 473 4334",
    "+94 77 361 9000",
    "+94 78 361 9000",
  ] as const,
  address: "No. 230A, Palagathura, Negombo.",
  locale: "en",
  store: {
    driverGooglePlay:
      "https://play.google.com/store/apps/details?id=com.qpick.driver&pcampaignid=web_share",
  },
} as const;

export const primaryNav = [
  { href: "/", label: "Home" },
  { href: "/ride", label: "Ride" },
  { href: "/airport", label: "Airport" },
  { href: "/tours", label: "Tours" },
  { href: "/safety", label: "Safety" },
  { href: "/drive", label: "Drive" },
] as const;

export const utilityNav = [
  { href: "/partners", label: "Partners" },
  { href: "/support", label: "Support" },
] as const;

export const footerCompany = [
  { href: "/about", label: "About" },
  { href: "/partners", label: "Partners" },
  { href: "/drive", label: "Drive with Q Pick" },
  { href: "/support", label: "Support" },
] as const;

export const footerLegal = [
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/terms", label: "Terms" },
] as const;

export const footerProducts = [
  { href: "/ride", label: "City & intercity rides" },
  { href: "/airport", label: "Airport transfers" },
  { href: "/tours", label: "Tours & day trips" },
  { href: "/destinations", label: "Destinations" },
  { href: "/safety", label: "Safety standard" },
] as const;
