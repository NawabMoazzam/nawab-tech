import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { connectDB } from "@/lib/db";
import BlogPost from "@/models/blog-post";
import Category from "@/models/category";
import Testimonial from "@/models/testimonial";
import {
  ArrowRight,
  BookOpenText,
  FolderKanban,
  PenSquare,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

type DashboardPost = {
  _id: { toString(): string };
  title: string;
  slug: string;
  status: "draft" | "published";
  featured?: boolean;
  excerpt?: string;
  updatedAt?: Date | string;
  publishedAt?: Date | string;
  category?: { name?: string } | null;
  views?: number;
};

export default async function AdminDashboard() {
  const defaultStats = {
    total: 0,
    published: 0,
    drafts: 0,
    featured: 0,
    testimonials: 0,
    categories: 0,
    totalViews: 0,
    publishedThisMonth: 0,
  };

  let stats = { ...defaultStats };
  let recentPosts: DashboardPost[] = [];

  try {
    await connectDB();

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      total,
      published,
      drafts,
      featured,
      testimonials,
      categories,
      totalViewsResult,
      publishedThisMonth,
      recent,
    ] = await Promise.all([
      BlogPost.countDocuments(),
      BlogPost.countDocuments({ status: "published" }),
      BlogPost.countDocuments({ status: "draft" }),
      BlogPost.countDocuments({ featured: true }),
      Testimonial.countDocuments(),
      Category.countDocuments(),
      BlogPost.aggregate([
        { $group: { _id: null, totalViews: { $sum: "$views" } } },
      ]),
      BlogPost.countDocuments({
        status: "published",
        publishedAt: { $gte: startOfMonth },
      }),
      BlogPost.find({})
        .populate("category", "name")
        .sort({ updatedAt: -1 })
        .limit(4)
        .lean(),
    ]);

    stats = {
      total,
      published,
      drafts,
      featured,
      testimonials,
      categories,
      totalViews: totalViewsResult[0]?.totalViews ?? 0,
      publishedThisMonth,
    };
    recentPosts = recent as DashboardPost[];
  } catch (e) {
    console.warn("DB not connected for dashboard", e);
  }

  const statCards = [
    {
      label: "Total Posts",
      value: stats.total,
      hint: "All published and draft content",
      tone: "text-foreground",
      icon: <BookOpenText className="h-4 w-4" />,
    },
    {
      label: "Published",
      value: stats.published,
      hint: "Live on the blog",
      tone: "text-emerald-600",
      icon: <Star className="h-4 w-4" />,
    },
    {
      label: "Drafts",
      value: stats.drafts,
      hint: "Needs attention",
      tone: "text-amber-600",
      icon: <PenSquare className="h-4 w-4" />,
    },
    {
      label: "Featured",
      value: stats.featured,
      hint: "Spotlight content",
      tone: "text-primary",
      icon: <Star className="h-4 w-4" />,
    },
    {
      label: "Testimonials",
      value: stats.testimonials,
      hint: "Client proof and trust",
      tone: "text-foreground",
      icon: <Users className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-primary">
            Content overview
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Keep your blog, social proof, and content pipeline moving.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/admin/posts/new">
            <Button>New Post</Button>
          </Link>
          <Link href="/admin/posts">
            <Button variant="outline">All Posts</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className={`rounded-md bg-muted p-2 ${stat.tone}`}>
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.tone}`}>
                {stat.value}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{stat.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent content</CardTitle>
            <Link
              href="/admin/posts"
              className="inline-flex items-center gap-1 text-sm text-primary"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentPosts.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                No content activity yet. Create your first blog post to get
                started.
              </div>
            ) : (
              recentPosts.map((post) => (
                <div
                  key={post._id.toString()}
                  className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{post.title}</p>
                      <Badge
                        variant={
                          post.status === "published" ? "default" : "secondary"
                        }
                      >
                        {post.status}
                      </Badge>
                      {post.featured ? (
                        <Badge variant="outline">Featured</Badge>
                      ) : null}
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {post.excerpt || "No excerpt yet."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-col sm:items-end">
                    <span>{post.category?.name || "Uncategorized"}</span>
                    <span>
                      {new Date(
                        post.updatedAt || post.publishedAt || Date.now(),
                      ).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm text-muted-foreground">Blog categories</p>
                <p className="text-2xl font-bold">{stats.categories}</p>
              </div>
              <FolderKanban className="h-8 w-8 text-primary" />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm text-muted-foreground">Total views</p>
                <p className="text-2xl font-bold">{stats.totalViews}</p>
              </div>
              <BookOpenText className="h-8 w-8 text-emerald-500" />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  Published this month
                </p>
                <p className="text-2xl font-bold">{stats.publishedThisMonth}</p>
              </div>
              <PenSquare className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link href="/admin/posts/new">
              <Button>Write new post</Button>
            </Link>
            <Link href="/admin/posts">
              <Button variant="outline">Review posts</Button>
            </Link>
            <Link href="/admin/categories">
              <Button variant="outline">Manage categories</Button>
            </Link>
            <Link href="/admin/testimonials">
              <Button variant="outline">Manage testimonials</Button>
            </Link>
            <Link href="/blog" target="_blank">
              <Button variant="outline">Preview website</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What needs attention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="rounded-lg border p-3">
              <span className="font-medium text-foreground">
                {stats.drafts}
              </span>{" "}
              draft
              {stats.drafts === 1 ? " post" : " posts"} waiting to be reviewed.
            </div>
            <div className="rounded-lg border p-3">
              <span className="font-medium text-foreground">
                {stats.featured}
              </span>{" "}
              featured
              {stats.featured === 1 ? " post" : " posts"} currently highlighted.
            </div>
            <div className="rounded-lg border p-3">
              <span className="font-medium text-foreground">
                {stats.testimonials}
              </span>{" "}
              client testimonials available for trust-building pages.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
