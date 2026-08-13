import Link from "next/link";
import { connectDB } from "@/lib/db";
import BlogPost from "@/models/blog-post";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PostsListPage() {
  await connectDB();
  const posts = await BlogPost.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Posts</h1>
          <p className="text-muted-foreground text-sm">{posts.length} total posts</p>
        </div>
        <Link href="/admin/posts/new">
          <Button>
            <Plus size={16} className="mr-2" /> New Post
          </Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No posts yet. Create your first post.</p>
            <Link href="/admin/posts/new">
              <Button>Create Post</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {posts.map((post: any) => (
            <Card key={post._id.toString()}>
              <CardContent className="p-4 flex gap-4 items-start">
                {post.coverImage ? (
                  <img src={post.coverImage} alt={post.title} className="w-24 h-16 object-cover rounded border" />
                ) : (
                  <div className="w-24 h-16 bg-muted rounded border flex items-center justify-center text-xs">No img</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{post.title}</h3>
                    <Badge variant={post.status === "published" ? "default" : "secondary"} className="text-[10px]">
                      {post.status}
                    </Badge>
                    {post.featured && <Badge variant="outline" className="text-[10px]">Featured</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{post.excerpt}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                    <span>/{post.slug}</span>
                    <span>•</span>
                    <span>{post.category?.name}</span>
                    <span>•</span>
                    <span>{post.readingTime} min</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {post.status === "published" && (
                    <Link href={`/blog/${post.slug}`} target="_blank">
                      <Button size="sm" variant="outline">
                        <Eye size={14} />
                      </Button>
                    </Link>
                  )}
                  <Link href={`/admin/posts/${post._id}/edit`}>
                    <Button size="sm" variant="outline">
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
