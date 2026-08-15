import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { getAuth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { isMongoDuplicateKeyError } from "@/lib/errors";
import { validatePostInput } from "@/lib/post-validation";
import BlogPost from "@/models/blog-post";
import Category from "@/models/category";

export const dynamic = "force-dynamic";

async function getSession(request: NextRequest) {
  const auth = await getAuth();
  return auth.api.getSession({ headers: request.headers });
}

function slugConflictResponse() {
  return NextResponse.json(
    { error: "A post with that slug already exists." },
    { status: 409 },
  );
}

// GET /api/admin/posts?status=draft|published&search=...&featured=true
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.trim();
    const featured = searchParams.get("featured");
    const filter: Record<string, unknown> = {};

    if (status === "draft" || status === "published") {
      filter.status = status;
    }
    if (featured === "true") filter.featured = true;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const posts = await BlogPost.find(filter)
      .populate("category", "name slug description")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Get posts error:", error);
    return NextResponse.json(
      { error: "Failed to load posts." },
      { status: 500 },
    );
  }
}

// POST /api/admin/posts
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = validatePostInput(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    await connectDB();

    const [existingPost, category] = await Promise.all([
      BlogPost.findOne({ slug: parsed.data.slug }).select("_id"),
      Category.findById(parsed.data.category).select("_id"),
    ]);

    if (existingPost) return slugConflictResponse();
    if (!category) {
      return NextResponse.json(
        { error: "The selected category no longer exists." },
        { status: 400 },
      );
    }

    const post = await BlogPost.create({
      ...parsed.data,
      author: {
        name:
          session.user.name ||
          session.user.email?.split("@")[0] ||
          "Nawab Tech",
        role: "Editor",
      },
    });
    await post.populate("category", "name slug description");

    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    const populatedCategory = post.category as unknown as { slug?: string };
    if (populatedCategory?.slug) {
      revalidatePath(`/blog/category/${populatedCategory.slug}`);
    }

    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (error: unknown) {
    if (isMongoDuplicateKeyError(error)) return slugConflictResponse();

    console.error("Create post error:", error);
    return NextResponse.json(
      { error: "Failed to create post." },
      { status: 500 },
    );
  }
}
