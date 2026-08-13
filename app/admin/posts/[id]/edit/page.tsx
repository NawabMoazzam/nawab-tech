import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import BlogPost from "@/models/blog-post";
import { PostForm } from "@/components/admin/post-form";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();
  const post = await BlogPost.findById(id).lean();

  if (!post) notFound();

  // Convert ObjectId and Dates to plain serializable
  const serializablePost = {
    ...post,
    _id: post._id.toString(),
    createdAt: post.createdAt?.toISOString(),
    updatedAt: post.updatedAt?.toISOString(),
    publishedAt: post.publishedAt?.toISOString(),
  } as any;

  return <PostForm initialPost={serializablePost} />;
}
