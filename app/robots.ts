import { siteConfig } from "@/lib/site";
import type { MetadataRoute } from "next";

const siteUrl = siteConfig.url;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/private/"],
    },

    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
