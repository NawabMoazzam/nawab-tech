import { connectDB } from "@/lib/db";
import BlogPost from "@/models/blog-post";
import Testimonial from "@/models/testimonial";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  let stats = {
    total: 0,
    published: 0,
    drafts: 0,
    featured: 0,
    testimonials: 0,
  };

  try {
    await connectDB();
    const [total, published, drafts, featured, testimonials] =
      await Promise.all([
        BlogPost.countDocuments(),
        BlogPost.countDocuments({ status: "published" }),
        BlogPost.countDocuments({ status: "draft" }),
        BlogPost.countDocuments({ featured: true }),
        Testimonial.countDocuments(),
      ]);
    stats = { total, published, drafts, featured, testimonials };
  } catch (e) {
    console.warn("DB not connected for dashboard", e);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Manage blog posts, categories, client testimonials, and account
          settings.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.published}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {stats.drafts}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.featured}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Testimonials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.testimonials}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link href="/admin/posts/new">
              <Button>New Post</Button>
            </Link>
            <Link href="/admin/posts">
              <Button variant="outline">View All Posts</Button>
            </Link>
            <Link href="/admin/categories">
              <Button variant="outline">Manage Categories</Button>
            </Link>
            <Link href="/admin/testimonials">
              <Button variant="outline">Manage Testimonials</Button>
            </Link>
            <Link href="/blog" target="_blank">
              <Button variant="outline">View Blog</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
