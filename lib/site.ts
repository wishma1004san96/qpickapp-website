export const siteConfig = {
  name: "Q Pick",
  /** Legal entity for copyright, schema, and company branding */
  legalName: "Quick Pick App (Pvt) Ltd",
  shortName: "Q",
  tagline: "Sri Lanka, moved with certainty.",
  description:
    "Premium ride-hailing and tourism across Sri Lanka — airport transfers, city rides, and island journeys under one trusted standard.",
  url: "https://qpick.lk",
  supportEmail: "contact@quickpickapp.com",
  /** Primary / general line */
  emergencyLine: "+94 11 433 4334",
  phones: {
    general: "+94 11 433 4334",
    office: "+94 11 473 4334",
    mobile: "+94 77 361 9000",
    whatsapp: "+94 78 361 9000",
  },
  phoneLines: [
    "+94 11 433 4334",
    "+94 11 473 4334",
    "+94 77 361 9000",
    "+94 78 361 9000",
  ] as const,
  address: "No. 230A, Palagathura, Negombo, Sri Lanka",
  addressLines: ["No. 230A, Palagathura,", "Negombo, Sri Lanka"] as const,
  locale: "en",
  store: {
    driverGooglePlay:
      "https://play.google.com/store/apps/details?id=com.qpick.driver&pcampaignid=web_share",
  },
} as const;

export const primaryNav = [
  { href: "/", label: "Home" },
  { href: "/ride", label: "Ride" },
  { href: "/airport-transfer", label: "Airport" },
  { href: "/tours", label: "Tours" },
  { href: "/safety", label: "Safety" },
  { href: "/drive", label: "Drive" },
] as const;

export const utilityNav = [
  { href: "/partners", label: "Partners" },
  { href: "/support", label: "Support" },
] as const;

export const footerServices = [
  { href: "/airport-transfer", key: "airport" },
  { href: "/tours", key: "tours" },
  { href: "/ride", key: "chauffeur" },
  { href: "/ride", key: "cityRides" },
  { href: "/partners", key: "corporate" },
] as const;

export const footerCompany = [
  { href: "/about", key: "about" },
  { href: "/drive", key: "drive" },
  { href: "/partners", key: "partners" },
  { href: "/support", key: "support" },
  { href: "mailto:contact@quickpickapp.com", key: "contact" },
] as const;

export const footerLegal = [
  { href: "/legal/privacy", key: "privacy" },
  { href: "/privacy-policy", key: "privacyPolicy" },
  { href: "/legal/terms", key: "terms" },
  { href: "/legal/privacy", key: "cookies" },
  { href: "/support", key: "support" },
] as const;

export const socialLinks = [
  {
    key: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/qpick",
  },
  {
    key: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/qpick",
  },
  {
    key: "tiktok",
    label: "TikTok",
    href: "https://www.tiktok.com/@qpick",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/qpick",
  },
  {
    key: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/@qpick",
  },
] as const;

export const whatsappLink = {
  href: "https://wa.me/94783619000",
  label: "WhatsApp",
} as const;
