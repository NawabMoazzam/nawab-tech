import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getAuth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import BlogPost from "@/models/blog-post";

export const dynamic = "force-dynamic";

// GET /api/admin/posts?status=draft|published&search=...
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");

    const filter: any = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (featured === "true") {
      filter.featured = true;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const posts = await BlogPost.find(filter).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error("Get posts error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/posts - create new post
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();

    // Basic validation
    if (!body.title || !body.slug || !body.excerpt || !body.content) {
      return NextResponse.json(
        { error: "Missing required fields: title, slug, excerpt, content" },
        { status: 400 }
      );
    }

    // Check duplicate slug
    const existing = await BlogPost.findOne({ slug: body.slug });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }

    // Auto-generate category slug if needed
    if (body.category && !body.category.slug) {
      body.category.slug = body.category.name.toLowerCase().replace(/\s+/g, "-");
    }

    const post = await BlogPost.create({
      ...body,
      author: body.author || {
        name: (session.user as any).name || session.user.email?.split("@")[0] || "Nawab Tech",
        role: "Editor",
      },
    });

    // Revalidate blog pages ISR
    try {
      revalidateTag("blog-posts", "max");
      revalidateTag(`blog-${post.slug}`, "max");
    } catch (e) {
      console.warn("Revalidate failed:", e);
    }

    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (error: any) {
    console.error("Create post error:", error);
    return NextResponse.json({ error: error.message || "Failed to create post" }, { status: 500 });
  }
}
