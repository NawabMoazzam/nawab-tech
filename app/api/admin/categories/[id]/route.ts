import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { isObjectIdOrHexString } from "mongoose";

import { getAuth } from "@/lib/auth";
import { toCategoryDTO } from "@/lib/categories";
import { validateCategoryInput } from "@/lib/category-validation";
import { connectDB } from "@/lib/db";
import { isMongoDuplicateKeyError } from "@/lib/errors";
import BlogPost from "@/models/blog-post";
import Category from "@/models/category";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

async function isAuthenticated(request: NextRequest) {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  return Boolean(session?.user);
}

function invalidIdResponse() {
  return NextResponse.json({ error: "Invalid category ID." }, { status: 400 });
}

function categoryConflictResponse() {
  return NextResponse.json(
    { error: "A category with that name or slug already exists." },
    { status: 409 },
  );
}

// GET /api/admin/categories/:id
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!isObjectIdOrHexString(id)) return invalidIdResponse();

    await connectDB();
    const [category, postCount] = await Promise.all([
      Category.findById(id).lean(),
      BlogPost.countDocuments({ category: id }),
    ]);

    if (!category) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    return NextResponse.json({
      category: toCategoryDTO(category, postCount),
    });
  } catch (error) {
    console.error("Get category error:", error);
    return NextResponse.json(
      { error: "Failed to load category." },
      { status: 500 },
    );
  }
}

// PATCH /api/admin/categories/:id
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!isObjectIdOrHexString(id)) return invalidIdResponse();

    const parsed = validateCategoryInput(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    await connectDB();

    const duplicate = await Category.findOne({
      _id: { $ne: id },
      $or: [{ slug: parsed.data.slug }, { name: parsed.data.name }],
    }).select("_id");

    if (duplicate) return categoryConflictResponse();

    const previous = await Category.findById(id).select("slug").lean();
    if (!previous) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { $set: parsed.data },
      { new: true, runValidators: true },
    );

    if (!category) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    revalidatePath("/blog");
    revalidatePath(`/blog/category/${previous.slug}`);
    revalidatePath(`/blog/category/${category.slug}`);

    return NextResponse.json({
      success: true,
      category: toCategoryDTO(category),
    });
  } catch (error: unknown) {
    if (isMongoDuplicateKeyError(error)) return categoryConflictResponse();

    console.error("Update category error:", error);
    return NextResponse.json(
      { error: "Failed to update category." },
      { status: 500 },
    );
  }
}

// PUT uses the same complete category payload as PATCH.
export const PUT = PATCH;

// DELETE /api/admin/categories/:id
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!isObjectIdOrHexString(id)) return invalidIdResponse();

    await connectDB();

    const category = await Category.findById(id).select("slug").lean();
    if (!category) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    const postCount = await BlogPost.countDocuments({ category: id });
    if (postCount > 0) {
      return NextResponse.json(
        {
          error: `This category is used by ${postCount} ${
            postCount === 1 ? "post" : "posts"
          }. Reassign them before deleting it.`,
        },
        { status: 409 },
      );
    }

    await Category.findByIdAndDelete(id);

    revalidatePath("/blog");
    revalidatePath(`/blog/category/${category.slug}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { error: "Failed to delete category." },
      { status: 500 },
    );
  }
}
