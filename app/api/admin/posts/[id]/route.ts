import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { isObjectIdOrHexString } from "mongoose";

import { getAuth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { isMongoDuplicateKeyError } from "@/lib/errors";
import { validatePostInput } from "@/lib/post-validation";
import BlogPost from "@/models/blog-post";
import Category from "@/models/category";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

async function getSession(request: NextRequest) {
  const auth = await getAuth();
  return auth.api.getSession({ headers: request.headers });
}

function invalidIdResponse() {
  return NextResponse.json({ error: "Invalid post ID." }, { status: 400 });
}

function slugConflictResponse() {
  return NextResponse.json(
    { error: "A post with that slug already exists." },
    { status: 409 },
  );
}

// GET /api/admin/posts/:id
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!isObjectIdOrHexString(id)) return invalidIdResponse();

    await connectDB();
    const post = await BlogPost.findById(id)
      .populate("category", "name slug description")
      .lean();

    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Get post error:", error);
    return NextResponse.json(
      { error: "Failed to load post." },
      { status: 500 },
    );
  }
}

// PATCH /api/admin/posts/:id
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!isObjectIdOrHexString(id)) return invalidIdResponse();

    const parsed = validatePostInput(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    await connectDB();

    const [post, duplicate, category] = await Promise.all([
      BlogPost.findById(id),
      BlogPost.findOne({
        _id: { $ne: id },
        slug: parsed.data.slug,
      }).select("_id"),
      Category.findById(parsed.data.category).select("_id"),
    ]);

    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }
    if (duplicate) return slugConflictResponse();
    if (!category) {
      return NextResponse.json(
        { error: "The selected category no longer exists." },
        { status: 400 },
      );
    }

    const oldSlug = post.slug;
    const oldCategory = await Category.findById(post.category)
      .select("slug")
      .lean();
    post.set(parsed.data);
    await post.save();
    await post.populate("category", "name slug description");

    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath(`/blog/${oldSlug}`);
    revalidatePath(`/blog/${post.slug}`);
    const populatedCategory = post.category as unknown as { slug?: string };
    if (oldCategory?.slug) {
      revalidatePath(`/blog/category/${oldCategory.slug}`);
    }
    if (populatedCategory?.slug) {
      revalidatePath(`/blog/category/${populatedCategory.slug}`);
    }

    return NextResponse.json({ success: true, post });
  } catch (error: unknown) {
    if (isMongoDuplicateKeyError(error)) return slugConflictResponse();

    console.error("Update post error:", error);
    return NextResponse.json(
      { error: "Failed to update post." },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/posts/:id
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!isObjectIdOrHexString(id)) return invalidIdResponse();

    await connectDB();
    const post = await BlogPost.findByIdAndDelete(id);

    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    const category = await Category.findById(post.category)
      .select("slug")
      .lean();

    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    if (category?.slug) {
      revalidatePath(`/blog/category/${category.slug}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete post error:", error);
    return NextResponse.json(
      { error: "Failed to delete post." },
      { status: 500 },
    );
  }
}
