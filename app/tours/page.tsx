import type { Metadata } from "next";
import { ToursHub } from "@/components/tours/tours-hub";
import { getHubSeo } from "@/lib/tours/repository";
import { siteConfig } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const seo = getHubSeo();
  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: seo.canonicalPath ?? "/tours",
    },
    openGraph: {
      title: seo.ogTitle ?? seo.title,
      description: seo.description,
      url: `${siteConfig.url}${seo.canonicalPath ?? "/tours"}`,
      images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.twitterTitle ?? seo.title,
      description: seo.twitterDescription ?? seo.description,
      images: seo.ogImage ? [seo.ogImage] : undefined,
    },
  };
}

export default function ToursPage() {
  return <ToursHub />;
}
