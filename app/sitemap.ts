import type { MetadataRoute } from "next";
import { destinations } from "@/lib/destinations";
import { siteConfig } from "@/lib/site";
import { getAllPackages } from "@/lib/tours/repository";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const staticRoutes = [
    "",
    "/ride",
    "/airport",
    "/airport-transfer",
    "/tours",
    "/tour-booking",
    "/destinations",
    "/safety",
    "/drive",
    "/partners",
    "/about",
    "/support",
    "/legal/privacy",
    "/legal/terms",
  ];

  const now = new Date();
  const packages = getAllPackages();

  return [
    ...staticRoutes.map((path) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "" || path === "/tours" ? 1 : path === "/tour-booking" ? 0.8 : 0.7,
    })),
    ...packages.map((pkg) => ({
      url: `${base}/tours/${pkg.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),
    ...destinations.map((d) => ({
      url: `${base}/destinations/${d.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
