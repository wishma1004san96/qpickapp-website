import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { inter } from "@/app/fonts";
import { SiteFooter } from "@/components/brand/site-footer";
import { SiteHeader } from "@/components/brand/site-header";
import { SkipLink } from "@/components/ui/skip-link";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} · Premium rides & tourism in Sri Lanka`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "en_LK",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  alternates: {
    canonical: siteConfig.url,
    languages: {
      en: siteConfig.url,
      "si-LK": siteConfig.url,
      "ta-LK": siteConfig.url,
      "x-default": siteConfig.url,
    },
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
      email: siteConfig.supportEmail,
      areaServed: {
        "@type": "Country",
        name: "Sri Lanka",
      },
    },
    {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
      inLanguage: "en",
    },
    {
      "@type": "TaxiService",
      name: `${siteConfig.name} Rides`,
      provider: { "@type": "Organization", name: siteConfig.name },
      areaServed: "Sri Lanka",
      url: `${siteConfig.url}/ride`,
      description: "Premium city and intercity rides with verified drivers.",
    },
    {
      "@type": "TouristTrip",
      name: `${siteConfig.name} Tours`,
      touristType: "Leisure travellers",
      url: `${siteConfig.url}/tours`,
      description: "Curated day trips and multi-stop island journeys.",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body
        className={`min-h-full flex flex-col bg-foam text-ink ${inter.className}`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SkipLink />
        <SiteHeader />
        <main id="main" className="flex flex-1 flex-col">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
