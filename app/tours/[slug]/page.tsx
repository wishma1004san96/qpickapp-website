import type { Metadata } from "next";
import { permanentRedirect, notFound } from "next/navigation";
import { PackageDetail } from "@/components/tours/package-detail";
import {
  getAllPackages,
  getPackageBySlug,
} from "@/lib/tours/repository";
import { siteConfig } from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const PACKAGE_ALIASES: Record<string, string> = {
  "10-days-luxury-island-tour": "10-days-wildlife-adventure",
};

export function generateStaticParams() {
  return getAllPackages().map((pkg) => ({ slug: pkg.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pkg = getPackageBySlug(slug);
  if (!pkg) return { title: "Tour not found" };

  return {
    title: pkg.seo.title,
    description: pkg.seo.description,
    alternates: {
      canonical: pkg.seo.canonicalPath ?? `/tours/${pkg.slug}`,
    },
    openGraph: {
      title: pkg.seo.ogTitle ?? pkg.seo.title,
      description: pkg.seo.description,
      url: `${siteConfig.url}${pkg.seo.canonicalPath ?? `/tours/${pkg.slug}`}`,
      images: pkg.seo.ogImage ? [{ url: pkg.seo.ogImage }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pkg.seo.twitterTitle ?? pkg.seo.title,
      description: pkg.seo.twitterDescription ?? pkg.seo.description,
      images: pkg.seo.ogImage ? [pkg.seo.ogImage] : undefined,
    },
  };
}

export default async function TourPackagePage({ params }: PageProps) {
  const { slug } = await params;
  const aliasTarget = PACKAGE_ALIASES[slug];
  if (aliasTarget) {
    permanentRedirect(`/tours/${aliasTarget}`);
  }
  if (!getPackageBySlug(slug)) notFound();
  return <PackageDetail slug={slug} />;
}
