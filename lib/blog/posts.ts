import type { BlogPost } from "./types";

export const blogPosts: BlogPost[] = [
  {
    slug: "how-much-does-a-business-website-cost",
    title: "How Much Does a Business Website Cost?",
    excerpt:
      "A practical guide to understanding business website costs, what affects pricing, and what you should actually expect from a professional website.",
    category: {
      name: "Web Development",
      slug: "web-development",
    },
    tags: ["web development", "business websites", "website cost"],
    author: {
      name: "Nawab Tech",
      role: "Web Development & Digital Products",
    },
    publishedAt: "2026-07-28",
    readingTime: 5,
    featured: true,
    contentPath: "how-much-does-a-business-website-cost",
    seo: {
      title: "How Much Does a Business Website Cost? | Nawab Tech",
      description:
        "Learn what affects business website costs, what you should expect from a professional website, and how to choose the right solution for your business.",
    },
  },
];

export function getAllPosts() {
  return [...blogPosts].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getFeaturedPosts() {
  return getAllPosts().filter((post) => post.featured);
}

export function getPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getPostsByCategory(categorySlug: string) {
  return getAllPosts().filter((post) => post.category.slug === categorySlug);
}
