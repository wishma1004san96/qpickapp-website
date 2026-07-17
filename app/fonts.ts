import { Inter, Noto_Sans_Sinhala, Noto_Sans_Tamil } from "next/font/google";

/** Site-wide Latin UI type */
export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

/** Sinhala — loaded sitewide for language switch; not preloaded (LCP). */
export const notoSinhala = Noto_Sans_Sinhala({
  variable: "--font-sinhala",
  subsets: ["sinhala"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

/** Tamil — loaded sitewide for language switch; not preloaded (LCP). */
export const notoTamil = Noto_Sans_Tamil({
  variable: "--font-tamil",
  subsets: ["tamil"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});
