import "server-only";

import { connectDB } from "@/lib/db";
import BlogPost from "@/models/blog-post";
import Category from "@/models/category";

export type CategoryDTO = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  postCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

type CategoryRecord = {
  _id: { toString(): string };
  name: string;
  slug: string;
  description?: string | null;
  createdAt?: Date | string | number;
  updatedAt?: Date | string | number;
};

export function toCategoryDTO(category: unknown, postCount?: number): CategoryDTO {
  const value = category as CategoryRecord;

  return {
    _id: value._id.toString(),
    name: value.name,
    slug: value.slug,
    description: value.description || "",
    ...(postCount === undefined ? {} : { postCount }),
    ...(value.createdAt
      ? { createdAt: new Date(value.createdAt).toISOString() }
      : {}),
    ...(value.updatedAt
      ? { updatedAt: new Date(value.updatedAt).toISOString() }
      : {}),
  };
}

export async function getAllCategoriesFromDB(): Promise<CategoryDTO[]> {
  if (!process.env.MONGODB_URI) return [];

  try {
    await connectDB();
    const categories = await Category.find().sort({ name: 1 }).lean();
    return categories.map((category) => toCategoryDTO(category));
  } catch (error) {
    console.warn("Failed to fetch categories from DB:", error);
    return [];
  }
}

export async function getCategoryBySlugFromDB(
  slug: string,
): Promise<CategoryDTO | null> {
  if (!process.env.MONGODB_URI) return null;

  try {
    await connectDB();
    const category = await Category.findOne({ slug }).lean();
    return category ? toCategoryDTO(category) : null;
  } catch (error) {
    console.warn("Failed to fetch category from DB:", error);
    return null;
  }
}

export async function getCategoriesWithPostCounts(): Promise<CategoryDTO[]> {
  await connectDB();

  const [categories, counts] = await Promise.all([
    Category.find().sort({ name: 1 }).lean(),
    BlogPost.aggregate<{ _id: unknown; count: number }>([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]),
  ]);

  const countByCategory = new Map(
    counts.map((entry) => [String(entry._id), entry.count]),
  );

  return categories.map((category) =>
    toCategoryDTO(
      category,
      countByCategory.get(category._id.toString()) || 0,
    ),
  );
}
