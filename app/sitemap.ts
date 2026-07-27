import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

const serviceRoutes = [
  "web-development",
  "custom-web-applications",
  "dashboard-development",
  "api-integrations",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    {
      url: siteUrl,
      priority: 1,
    },
    {
      url: `${siteUrl}/services`,
      priority: 0.9,
    },
    {
      url: `${siteUrl}/about`,
      priority: 0.6,
    },
    {
      url: `${siteUrl}/contact`,
      priority: 0.8,
    },
  ];

  const services = serviceRoutes.map((service) => ({
    url: `${siteUrl}/services/${service}`,
    priority: 0.9,
  }));

  return [...staticRoutes, ...services].map((route) => ({
    ...route,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
  }));
}
