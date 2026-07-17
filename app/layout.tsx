import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { inter, notoSinhala, notoTamil } from "@/app/fonts";
import { SiteFooter } from "@/components/brand/site-footer";
import { SiteHeader } from "@/components/brand/site-header";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { SkipLink } from "@/components/ui/skip-link";
import { getMessages } from "@/lib/i18n/get-messages";
import { getLocale } from "@/lib/i18n/get-locale";
import { localeLabels, type Locale } from "@/lib/i18n/config";
import { createTranslator } from "@/lib/i18n/t";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const ogLocales: Record<Locale, string> = {
  en: "en_LK",
  si: "si_LK",
  ta: "ta_LK",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F3F6F7" },
    { media: "(prefers-color-scheme: dark)", color: "#07111b" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const messages = getMessages(locale);
  const t = createTranslator(messages);

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: t("site.meta.titleDefault"),
      template: t("site.meta.titleTemplate"),
    },
    description: t("site.meta.description"),
    applicationName: siteConfig.name,
    openGraph: {
      type: "website",
      locale: ogLocales[locale],
      url: siteConfig.url,
      siteName: siteConfig.name,
      title: siteConfig.name,
      description: t("site.meta.description"),
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.name,
      description: t("site.meta.description"),
      images: ["/opengraph-image"],
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
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = getMessages(locale);
  const t = createTranslator(messages);
  const description = t("site.meta.description");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: siteConfig.legalName,
        alternateName: siteConfig.name,
        legalName: siteConfig.legalName,
        url: siteConfig.url,
        description,
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
        description,
        inLanguage: localeLabels[locale].htmlLang,
        publisher: {
          "@type": "Organization",
          name: siteConfig.legalName,
        },
      },
      {
        "@type": "TaxiService",
        name: `${siteConfig.name} Rides`,
        provider: {
          "@type": "Organization",
          name: siteConfig.legalName,
          alternateName: siteConfig.name,
        },
        areaServed: "Sri Lanka",
        url: `${siteConfig.url}/ride`,
        description: t("pages.ride.meta.description"),
      },
      {
        "@type": "TouristTrip",
        name: `${siteConfig.name} Tours`,
        touristType: "Leisure travellers",
        url: `${siteConfig.url}/tours`,
        description: t("pages.tours.meta.description"),
        provider: {
          "@type": "Organization",
          name: siteConfig.legalName,
        },
      },
    ],
  };

  return (
    <html
      lang={localeLabels[locale].htmlLang}
      className={`${inter.variable} ${notoSinhala.variable} ${notoTamil.variable} ${ibmPlexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-foam text-ink"
        suppressHydrationWarning
      >
        <LocaleProvider locale={locale} messages={messages}>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          <SkipLink />
          <SiteHeader />
          <main id="main" className="flex w-full min-w-0 flex-1 flex-col">
            {children}
          </main>
          <SiteFooter />
        </LocaleProvider>
      </body>
    </html>
  );
}
