import type { MetadataRoute } from "next";

import { getAllPosts } from "@/lib/blog/posts";
import { siteConfig } from "@/lib/site";

const siteUrl = siteConfig.url;

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
    {
      url: `${siteConfig.url}/blog`,
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/faq`,
      priority: 0.8,
    },
  ];

  const services = serviceRoutes.map((service) => ({
    url: `${siteUrl}/services/${service}`,
    priority: 0.9,
  }));

  const blogPosts = getAllPosts().map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    priority: post.featured ? 0.8 : 0.7,
  }));

  return [...staticRoutes, ...services, ...blogPosts].map((route) => ({
    ...route,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
  }));
}
