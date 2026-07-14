import type { Metadata } from "next";
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
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.name,
      description: t("site.meta.description"),
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
        name: siteConfig.name,
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
      },
      {
        "@type": "TaxiService",
        name: `${siteConfig.name} Rides`,
        provider: { "@type": "Organization", name: siteConfig.name },
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
          <main id="main" className="flex flex-1 flex-col">
            {children}
          </main>
          <SiteFooter />
        </LocaleProvider>
      </body>
    </html>
  );
}
