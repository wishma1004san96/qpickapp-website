import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { inter, notoSinhala, notoTamil } from "@/app/fonts";
import { SiteFooter } from "@/components/brand/site-footer";
import { SiteHeader } from "@/components/brand/site-header";
import { AppProviders } from "@/components/i18n/app-providers";
import { SkipLink } from "@/components/ui/skip-link";
import { getMessages } from "@/lib/i18n/get-messages";
import { getLocale } from "@/lib/i18n/get-locale";
import { isRtlLocale, localeLabels, type Locale } from "@/lib/i18n/config";
import { createTranslator } from "@/lib/i18n/t";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const ogLocales: Partial<Record<Locale, string>> = {
  en: "en_LK",
  si: "si_LK",
  ta: "ta_LK",
  de: "de_DE",
  fr: "fr_FR",
  es: "es_ES",
  it: "it_IT",
  ru: "ru_RU",
  zh: "zh_CN",
  ja: "ja_JP",
  ko: "ko_KR",
  nl: "nl_NL",
  pt: "pt_PT",
  pl: "pl_PL",
  sv: "sv_SE",
  da: "da_DK",
  no: "nb_NO",
  fi: "fi_FI",
  ar: "ar_LK",
  hi: "hi_IN",
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
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.png", type: "image/png", sizes: "32x32" },
      ],
      shortcut: "/favicon.ico",
      apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
    },
    openGraph: {
      type: "website",
      locale: ogLocales[locale] ?? "en_LK",
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
        touristType: t("toursHub.jsonLd.touristType"),
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
      dir={isRtlLocale(locale) ? "rtl" : "ltr"}
      className={`${inter.variable} ${notoSinhala.variable} ${notoTamil.variable} ${ibmPlexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-foam text-ink"
        suppressHydrationWarning
      >
        <AppProviders locale={locale} messages={messages}>
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
        </AppProviders>
      </body>
    </html>
  );
}
