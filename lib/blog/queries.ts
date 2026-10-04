import { connectDB } from "@/lib/db";
import BlogPostModel from "@/models/blog-post";
import Category from "@/models/category";
import type { BlogPost } from "./types";

// Build-time fallback used only when no database is configured.
const fallbackPosts: BlogPost[] = [
  {
    slug: "how-much-does-a-business-website-cost",
    title: "How Much Does a Business Website Cost?",
    excerpt:
      "A practical guide to understanding business website costs, what affects pricing, and what you should actually expect from a professional website.",
    category: {
      name: "Web Development",
      slug: "web-development",
      description: "Websites, performance, SEO, design, and digital presence.",
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
    coverImage: "/nawab-tech-banner.png",
  },
];

type DbPostRecord = {
  _id?: { toString(): string };
  slug: string;
  title: string;
  excerpt: string;
  category?: {
    _id?: { toString(): string };
    name?: string;
    slug?: string;
    description?: string;
  } | null;
  tags?: string[];
  author?: BlogPost["author"];
  publishedAt: Date | string | number;
  updatedAt?: Date | string | number;
  readingTime?: number;
  featured?: boolean;
  coverImage?: string;
  coverImageFileId?: string;
  seo?: BlogPost["seo"];
  content?: string;
  status?: "draft" | "published";
};

function mapDbPostToType(value: unknown): BlogPost | null {
  const dbPost = value as DbPostRecord;
  const category = dbPost.category;

  // Public post queries always populate category. Ignore orphaned posts rather
  // than rendering broken category links if a record was edited outside the app.
  if (
    !category ||
    typeof category !== "object" ||
    !category.name ||
    !category.slug
  ) {
    return null;
  }

  return {
    slug: dbPost.slug,
    title: dbPost.title,
    excerpt: dbPost.excerpt,
    category: {
      _id: category._id?.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description || "",
    },
    tags: dbPost.tags || [],
    author: dbPost.author || {
      name: "Nawab Tech",
      role: "Web Development",
    },
    publishedAt: new Date(dbPost.publishedAt).toISOString().split("T")[0],
    updatedAt: dbPost.updatedAt
      ? new Date(dbPost.updatedAt).toISOString()
      : undefined,
    readingTime: dbPost.readingTime || 5,
    featured: dbPost.featured || false,
    coverImage: dbPost.coverImage || "",
    coverImageFileId: dbPost.coverImageFileId || "",
    contentPath: dbPost.slug,
    seo: dbPost.seo || {
      title: dbPost.title,
      description: dbPost.excerpt,
    },
    content: dbPost.content,
    status: dbPost.status,
    _id: dbPost._id?.toString(),
  };
}

function mapPosts(posts: unknown[]): BlogPost[] {
  return posts
    .map(mapDbPostToType)
    .filter((post): post is BlogPost => post !== null);
}

export async function getAllPublishedPosts(): Promise<BlogPost[]> {
  try {
    if (!process.env.MONGODB_URI) return fallbackPosts;

    await connectDB();
    const posts = await BlogPostModel.find({ status: "published" })
      .populate("category", "name slug description")
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();

    return mapPosts(posts);
  } catch (error) {
    console.warn("Failed to fetch posts from DB:", error);
    return process.env.MONGODB_URI ? [] : fallbackPosts;
  }
}

export async function getFeaturedPost(): Promise<BlogPost[]> {
  try {
    if (!process.env.MONGODB_URI) return fallbackPosts.slice(0, 3);

    await connectDB();
    let posts = await BlogPostModel.find({
      featured: true,
      status: "published",
    })
      .populate("category", "name slug description")
      .sort({ publishedAt: -1 })
      .lean();

    if (posts.length === 0) {
      posts = await BlogPostModel.find({ status: "published" })
        .populate("category", "name slug description")
        .sort({ publishedAt: -1 })
        .limit(3)
        .lean();
    }

    return mapPosts(posts);
  } catch (error) {
    console.warn("Failed to fetch featured posts from DB:", error);
    return process.env.MONGODB_URI ? [] : fallbackPosts.slice(0, 3);
  }
}

export async function getAllPostsForAdmin(): Promise<BlogPost[]> {
  try {
    await connectDB();
    const posts = await BlogPostModel.find()
      .populate("category", "name slug description")
      .sort({ createdAt: -1 })
      .lean();
    return mapPosts(posts);
  } catch {
    return [];
  }
}

export async function getPostBySlugFromDB(slug: string) {
  try {
    if (!process.env.MONGODB_URI) return null;

    await connectDB();
    const post = await BlogPostModel.findOne({
      slug,
      status: "published",
    })
      .populate("category", "name slug description")
      .lean();

    return post ? mapDbPostToType(post) : null;
  } catch {
    return null;
  }
}

export async function getPostBySlugWithContent(slug: string) {
  return getPostBySlugFromDB(slug);
}

export async function getPostsByCategoryFromDB(
  categorySlug: string,
): Promise<BlogPost[]> {
  try {
    if (!process.env.MONGODB_URI) {
      return fallbackPosts.filter(
        (post) => post.category.slug === categorySlug,
      );
    }

    await connectDB();
    const category = await Category.findOne({ slug: categorySlug })
      .select("_id")
      .lean();

    if (!category) return [];

    const posts = await BlogPostModel.find({
      category: category._id,
      status: "published",
    })
      .populate("category", "name slug description")
      .sort({ publishedAt: -1 })
      .lean();

    return mapPosts(posts);
  } catch {
    return [];
  }
}
