import type { MetadataRoute } from "next";

import { getAllPublishedPosts } from "@/lib/blog/queries";
import { getAllCategoriesFromDB } from "@/lib/categories";
import { siteConfig } from "@/lib/site";

export const revalidate = 3600;

const siteUrl = siteConfig.url;

const serviceRoutes = [
  "web-development",
  "custom-web-applications",
  "dashboard-development",
  "automation-integrations",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
    {
      url: `${siteConfig.url}/tools/website-cost-calculator`,
      priority: 0.8,
    },
  ];

  const services = serviceRoutes.map((service) => ({
    url: `${siteUrl}/services/${service}`,
    priority: 0.9,
  }));

  let blogPosts: {
    url: string;
    priority: number;
    lastModified: Date;
  }[] = [];
  let blogCategories: { url: string; priority: number }[] = [];
  try {
    const [posts, categories] = await Promise.all([
      getAllPublishedPosts(),
      getAllCategoriesFromDB(),
    ]);
    blogPosts = posts.map((post) => ({
      url: `${siteConfig.url}/blog/${post.slug}`,
      priority: post.featured ? 0.8 : 0.7,
      lastModified: new Date(post.updatedAt || post.publishedAt),
    }));
    blogCategories = categories.map((category) => ({
      url: `${siteConfig.url}/blog/category/${category.slug}`,
      priority: 0.6,
    }));
  } catch {
    // Keep static routes available during builds without a database.
  }

  return [
    ...staticRoutes.map((route) => ({
      ...route,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
    })),
    ...services.map((route) => ({
      ...route,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
    })),
    ...blogCategories.map((route) => ({
      ...route,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
    })),
    ...blogPosts.map((route) => ({
      ...route,
      changeFrequency: "monthly" as const,
    })),
  ];
}
