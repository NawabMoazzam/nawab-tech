import { notFound } from "next/navigation";

import { PostForm } from "@/components/admin/post-form";
import { getAllCategoriesFromDB } from "@/lib/categories";
import { connectDB } from "@/lib/db";
import BlogPost from "@/models/blog-post";
import "@/models/category";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectDB();

  const [post, categories] = await Promise.all([
    BlogPost.findById(id)
      .populate("category", "name slug description")
      .lean(),
    getAllCategoriesFromDB(),
  ]);

  if (!post) notFound();

  const category = post.category as unknown as { _id?: { toString(): string } };
  const serializablePost = {
    ...post,
    _id: post._id.toString(),
    category: category?._id?.toString() || "",
    createdAt: post.createdAt?.toISOString(),
    updatedAt: post.updatedAt?.toISOString(),
    publishedAt: post.publishedAt?.toISOString(),
  };

  return (
    <PostForm initialPost={serializablePost} categories={categories} />
  );
}
