import Link from "next/link";
import { Edit, Eye, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PostCover } from "@/components/blog/post-cover";
import { connectDB } from "@/lib/db";
import BlogPost from "@/models/blog-post";
import "@/models/category";

export const dynamic = "force-dynamic";

type AdminPost = {
  _id: { toString(): string };
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  status: "draft" | "published";
  featured?: boolean;
  readingTime?: number;
  category?: { name?: string } | null;
};

export default async function PostsListPage() {
  await connectDB();
  const posts = (await BlogPost.find()
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .lean()) as unknown as AdminPost[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Posts</h1>
          <p className="text-sm text-muted-foreground">
            {posts.length} total {posts.length === 1 ? "post" : "posts"}
          </p>
        </div>
        <Link href="/admin/posts/new">
          <Button>
            <Plus size={16} className="mr-2" /> New Post
          </Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center sm:p-12">
            <p className="mb-4 text-muted-foreground">
              No posts yet. Create your first post.
            </p>
            <Link href="/admin/posts/new">
              <Button>Create Post</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post._id.toString()}>
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
                <PostCover
                  src={post.coverImage}
                  alt=""
                  sizes="(max-width: 640px) 100vw, 96px"
                  className="h-36 w-full shrink-0 rounded border sm:h-16 sm:w-24"
                />

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h2 className="min-w-0 truncate font-semibold">
                      {post.title}
                    </h2>
                    <Badge
                      variant={
                        post.status === "published" ? "default" : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {post.status}
                    </Badge>
                    {post.featured ? (
                      <Badge variant="outline" className="text-[10px]">
                        Featured
                      </Badge>
                    ) : null}
                  </div>
                  <p className="line-clamp-2 text-xs text-muted-foreground sm:truncate">
                    {post.excerpt}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    <span className="max-w-48 truncate">/{post.slug}</span>
                    <span aria-hidden>•</span>
                    <span>{post.category?.name || "No category"}</span>
                    <span aria-hidden>•</span>
                    <span>{post.readingTime} min</span>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2 self-end sm:self-start">
                  {post.status === "published" ? (
                    <Link href={`/blog/${post.slug}`} target="_blank">
                      <Button size="sm" variant="outline" aria-label="View post">
                        <Eye size={14} />
                      </Button>
                    </Link>
                  ) : null}
                  <Link href={`/admin/posts/${post._id}/edit`}>
                    <Button size="sm" variant="outline" aria-label="Edit post">
                      <Edit size={14} />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
