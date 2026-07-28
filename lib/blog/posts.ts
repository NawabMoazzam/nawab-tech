import type { BlogPost } from "./types";

export const blogPosts: BlogPost[] = [
  {
    slug: "how-much-does-a-business-website-cost",
    title: "How Much Does a Business Website Cost?",
    excerpt:
      "A practical guide to understanding business website costs, what affects pricing, and what you should actually expect from a professional website.",
    content: `
A business website is not simply a collection of pages.

The cost of a website depends on the business, the goals of the website, the features required, and the level of customisation involved.

## What affects website cost?

Several factors influence the final cost of a website.

### Design

A custom-designed website generally requires more work than adapting an existing template.

### Functionality

A simple business website is very different from a custom web application.

### Content

The number of pages, written content, images, and other assets can all affect the amount of work required.

### Integrations

Payment gateways, CRMs, analytics platforms, booking systems, and other integrations can add complexity.

## What should you focus on?

Instead of choosing a website based only on price, consider what the website needs to achieve for your business.

A good website should make your business easier to understand, build trust, and help potential customers take the next step.
    `.trim(),
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
    seo: {
      title: "How Much Does a Business Website Cost? | Nawab Tech",
      description:
        "Learn what affects business website costs, what you should expect from a professional website, and how to choose the right solution for your business.",
    },
  },
];

export function getAllPosts() {
  return blogPosts.sort(
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
