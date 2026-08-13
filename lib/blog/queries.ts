import { connectDB } from "@/lib/db";
import BlogPost from "@/models/blog-post";
import type { BlogPost as BlogPostType } from "./types";

// Fallback static post for build when DB not connected
const fallbackPosts: BlogPostType[] = [
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
    coverImage: "",
  } as any,
];

function mapDbPostToType(dbPost: any): BlogPostType {
  return {
    slug: dbPost.slug,
    title: dbPost.title,
    excerpt: dbPost.excerpt,
    category: dbPost.category,
    tags: dbPost.tags || [],
    author: dbPost.author || { name: "Nawab Tech", role: "Web Development" },
    publishedAt: dbPost.publishedAt ? new Date(dbPost.publishedAt).toISOString().split("T")[0] : new Date(dbPost.createdAt).toISOString().split("T")[0],
    updatedAt: dbPost.updatedAt ? new Date(dbPost.updatedAt).toISOString() : undefined,
    readingTime: dbPost.readingTime || 5,
    featured: dbPost.featured || false,
    coverImage: dbPost.coverImage || "",
    contentPath: dbPost.slug, // for compatibility
    seo: dbPost.seo || { title: dbPost.title, description: dbPost.excerpt },
    // extra fields for internal use
    content: dbPost.content,
    status: dbPost.status,
    _id: dbPost._id?.toString(),
  } as any;
}

export async function getAllPublishedPosts(): Promise<BlogPostType[]> {
  try {
    if (!process.env.MONGODB_URI) return fallbackPosts;
    await connectDB();
    const posts = await BlogPost.find({ status: "published" }).sort({ publishedAt: -1, createdAt: -1 }).lean();
    if (posts.length === 0) return fallbackPosts;
    return posts.map(mapDbPostToType);
  } catch (e) {
    console.warn("Failed to fetch posts from DB, using fallback:", e);
    return fallbackPosts;
  }
}

export async function getAllPostsForAdmin(): Promise<any[]> {
  try {
    await connectDB();
    const posts = await BlogPost.find().sort({ createdAt: -1 }).lean();
    return posts;
  } catch {
    return [];
  }
}

export async function getPostBySlugFromDB(slug: string) {
  try {
    if (!process.env.MONGODB_URI) return null;
    await connectDB();
    const post = await BlogPost.findOne({ slug, status: "published" }).lean();
    if (!post) return null;
    return mapDbPostToType(post);
  } catch {
    return null;
  }
}

export async function getPostBySlugWithContent(slug: string) {
  try {
    if (!process.env.MONGODB_URI) return null;
    await connectDB();
    const post = await BlogPost.findOne({ slug }).lean();
    return post;
  } catch {
    return null;
  }
}

export async function getPostsByCategoryFromDB(categorySlug: string): Promise<BlogPostType[]> {
  try {
    await connectDB();
    const posts = await BlogPost.find({ "category.slug": categorySlug, status: "published" })
      .sort({ publishedAt: -1 })
      .lean();
    return posts.map(mapDbPostToType);
  } catch {
    return [];
  }
}
